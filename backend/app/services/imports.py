import csv
import io
from datetime import UTC, date, datetime
from decimal import Decimal, InvalidOperation
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.import_job import ImportError, ImportJob
from app.models.order import Order
from app.services.metrics import recompute_customer_metrics


CUSTOMER_REQUIRED_COLUMNS = {"external_id", "name", "email", "phone", "city"}
ORDER_REQUIRED_COLUMNS = {
    "external_order_id",
    "customer_external_id",
    "order_date",
    "amount",
    "category",
    "product",
    "status",
}


def parse_csv(content: bytes) -> tuple[list[dict[str, str]], list[str]]:
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None:
        return [], []
    rows = [
        {key: (value or "").strip() for key, value in row.items() if key is not None}
        for row in reader
    ]
    return rows, [field.strip() for field in reader.fieldnames]


def missing_columns(fieldnames: list[str], required: set[str]) -> list[str]:
    return sorted(required - set(fieldnames))


def create_import_job(db: Session, *, import_type: str, filename: str) -> ImportJob:
    job = ImportJob(import_type=import_type, filename=filename, status="processing")
    db.add(job)
    db.flush()
    return job


def add_import_error(
    db: Session,
    *,
    job: ImportJob,
    row_number: int,
    error_code: str,
    message: str,
    original_row: dict[str, str],
) -> None:
    db.add(
        ImportError(
            import_id=job.id,
            row_number=row_number,
            error_code=error_code,
            message=message,
            original_row=original_row,
        )
    )
    job.failed_count += 1


def complete_job(job: ImportJob) -> None:
    job.status = "completed"
    job.completed_at = datetime.now(UTC)


def fail_job(job: ImportJob) -> None:
    job.status = "failed"
    job.completed_at = datetime.now(UTC)


def import_customers(db: Session, *, filename: str, content: bytes) -> ImportJob:
    rows, fieldnames = parse_csv(content)
    job = create_import_job(db, import_type="customers", filename=filename)
    job.total_rows = len(rows)

    missing = missing_columns(fieldnames, CUSTOMER_REQUIRED_COLUMNS)
    if missing:
        add_import_error(
            db,
            job=job,
            row_number=0,
            error_code="missing_columns",
            message=f"Missing required columns: {', '.join(missing)}",
            original_row={},
        )
        fail_job(job)
        db.commit()
        db.refresh(job)
        return job

    existing_customers = list(db.scalars(select(Customer)).all())
    existing_customers_by_external_id = {
        customer.external_id: customer for customer in existing_customers
    }
    existing_customers_by_email = {
        customer.email.lower(): customer for customer in existing_customers if customer.email
    }
    existing_customers_by_phone = {
        customer.phone: customer for customer in existing_customers if customer.phone
    }
    seen_external_ids: set[str] = set()
    seen_emails: set[str] = set()
    seen_phones: set[str] = set()
    imported_customer_ids: set[UUID] = set()

    for index, row in enumerate(rows, start=2):
        external_id = row.get("external_id", "")
        name = row.get("name", "")
        email = row.get("email", "")
        phone = row.get("phone", "")
        city = row.get("city", "")

        if not external_id or not name:
            add_import_error(
                db,
                job=job,
                row_number=index,
                error_code="validation_error",
                message="external_id and name are required",
                original_row=row,
            )
            continue

        email_key = email.lower() if email else ""
        existing_customer = (
            existing_customers_by_external_id.get(external_id)
            or (existing_customers_by_email.get(email_key) if email_key else None)
            or (existing_customers_by_phone.get(phone) if phone else None)
        )
        duplicate_in_file = (
            external_id in seen_external_ids
            or (email_key and email_key in seen_emails)
            or (phone and phone in seen_phones)
        )
        if existing_customer is not None or duplicate_in_file:
            job.duplicate_count += 1
            job.skipped_count += 1
            if existing_customer is not None:
                imported_customer_ids.add(existing_customer.id)
            add_import_error(
                db,
                job=job,
                row_number=index,
                error_code="duplicate_customer",
                message="Customer matches an existing or earlier row by external_id, email, or phone",
                original_row=row,
            )
            job.failed_count -= 1
            continue

        customer = Customer(
            external_id=external_id,
            name=name,
            email=email or None,
            phone=phone or None,
            city=city or None,
            acquisition_source={"source": "csv_import"},
        )
        db.add(customer)
        db.flush()
        imported_customer_ids.add(customer.id)
        seen_external_ids.add(external_id)
        if email_key:
            seen_emails.add(email_key)
        if phone:
            seen_phones.add(phone)
        job.imported_count += 1

    recompute_customer_metrics(db, customer_ids=imported_customer_ids)
    complete_job(job)
    db.commit()
    db.refresh(job)
    return job


def parse_order_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError("order_date must use YYYY-MM-DD") from exc


def parse_amount(value: str) -> Decimal:
    try:
        amount = Decimal(value).quantize(Decimal("0.01"))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError("amount must be a valid decimal") from exc
    if amount <= 0:
        raise ValueError("amount must be greater than 0")
    return amount


def import_orders(db: Session, *, filename: str, content: bytes) -> ImportJob:
    rows, fieldnames = parse_csv(content)
    job = create_import_job(db, import_type="orders", filename=filename)
    job.total_rows = len(rows)

    missing = missing_columns(fieldnames, ORDER_REQUIRED_COLUMNS)
    if missing:
        add_import_error(
            db,
            job=job,
            row_number=0,
            error_code="missing_columns",
            message=f"Missing required columns: {', '.join(missing)}",
            original_row={},
        )
        fail_job(job)
        db.commit()
        db.refresh(job)
        return job

    customers_by_external_id = {
        customer.external_id: customer.id for customer in db.scalars(select(Customer)).all()
    }
    existing_order_ids = set(db.scalars(select(Order.external_order_id)).all())
    seen_order_ids: set[str] = set()
    affected_customer_ids: set[UUID] = set()

    for index, row in enumerate(rows, start=2):
        external_order_id = row.get("external_order_id", "")
        customer_external_id = row.get("customer_external_id", "")

        if not external_order_id or not customer_external_id:
            add_import_error(
                db,
                job=job,
                row_number=index,
                error_code="validation_error",
                message="external_order_id and customer_external_id are required",
                original_row=row,
            )
            continue

        if external_order_id in existing_order_ids or external_order_id in seen_order_ids:
            job.duplicate_count += 1
            job.skipped_count += 1
            add_import_error(
                db,
                job=job,
                row_number=index,
                error_code="duplicate_order",
                message="Order matches an existing or earlier row by external_order_id",
                original_row=row,
            )
            job.failed_count -= 1
            continue

        customer_id = customers_by_external_id.get(customer_external_id)
        if customer_id is None:
            add_import_error(
                db,
                job=job,
                row_number=index,
                error_code="unknown_customer",
                message=f"No customer found for customer_external_id {customer_external_id}",
                original_row=row,
            )
            continue

        try:
            order_date = parse_order_date(row.get("order_date", ""))
            amount = parse_amount(row.get("amount", ""))
        except ValueError as exc:
            add_import_error(
                db,
                job=job,
                row_number=index,
                error_code="validation_error",
                message=str(exc),
                original_row=row,
            )
            continue

        category = row.get("category", "")
        product = row.get("product", "")
        status = row.get("status", "paid") or "paid"
        if not category or not product:
            add_import_error(
                db,
                job=job,
                row_number=index,
                error_code="validation_error",
                message="category and product are required",
                original_row=row,
            )
            continue

        db.add(
            Order(
                external_order_id=external_order_id,
                customer_id=customer_id,
                order_date=order_date,
                amount=amount,
                category=category,
                product=product,
                status=status,
            )
        )
        seen_order_ids.add(external_order_id)
        affected_customer_ids.add(customer_id)
        job.imported_count += 1

    recompute_customer_metrics(db, customer_ids=affected_customer_ids)
    complete_job(job)
    db.commit()
    db.refresh(job)
    return job


def import_errors_csv(db: Session, *, job: ImportJob) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["row_number", "error_code", "message", "original_row"])
    errors = db.scalars(
        select(ImportError).where(ImportError.import_id == job.id).order_by(ImportError.row_number)
    ).all()
    for error in errors:
        writer.writerow([error.row_number, error.error_code, error.message, error.original_row])
    return output.getvalue()
