from datetime import date, timedelta
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import Select, and_, func, select
from sqlalchemy.orm import Session

from app.models.audience import Audience
from app.models.customer import Customer, CustomerMetric
from app.schemas.audiences import (
    AudienceCondition,
    AudienceCreateRequest,
    AudienceCustomerSample,
    AudienceFilter,
)


def condition_to_clause(condition: AudienceCondition) -> Any:
    field_map = {
        "lifetime_value": CustomerMetric.lifetime_value,
        "total_orders": CustomerMetric.total_orders,
        "city": Customer.city,
        "persona": CustomerMetric.persona,
    }

    if condition.field == "last_purchase_days_ago":
        column = CustomerMetric.last_purchase_date
        def convert_days(days: int | float) -> date:
            return date.today() - timedelta(days=int(days))
    else:
        column = field_map[condition.field]
        convert_days = None

    op = condition.op
    value = condition.value

    if condition.field == "last_purchase_days_ago":
        if op == "gt":
            return column < convert_days(value)
        if op == "gte":
            return column <= convert_days(value)
        if op == "lt":
            return column > convert_days(value)
        if op == "lte":
            return column >= convert_days(value)
        if op == "eq":
            return column == convert_days(value)
        if op == "between":
            lower, upper = value
            return and_(column <= convert_days(lower), column >= convert_days(upper))
        if op == "in":
            return column.in_([convert_days(item) for item in value])

    if op == "gt":
        return column > value
    if op == "gte":
        return column >= value
    if op == "lt":
        return column < value
    if op == "lte":
        return column <= value
    if op == "eq":
        return column == value
    if op == "in":
        return column.in_(value)
    if op == "between":
        return column.between(value[0], value[1])

    raise ValueError(f"Unsupported operator: {op}")


def audience_base_query(filter_json: AudienceFilter) -> Select[tuple[Customer, CustomerMetric]]:
    clauses = [condition_to_clause(condition) for condition in filter_json.conditions]
    return (
        select(Customer, CustomerMetric)
        .join(CustomerMetric, CustomerMetric.customer_id == Customer.id)
        .where(and_(*clauses))
        .order_by(Customer.created_at.desc())
    )


def audience_size(db: Session, filter_json: AudienceFilter) -> int:
    clauses = [condition_to_clause(condition) for condition in filter_json.conditions]
    stmt = (
        select(func.count())
        .select_from(Customer)
        .join(CustomerMetric, CustomerMetric.customer_id == Customer.id)
        .where(and_(*clauses))
    )
    return int(db.scalar(stmt) or 0)


def audience_samples(
    db: Session,
    filter_json: AudienceFilter,
    *,
    limit: int,
) -> list[AudienceCustomerSample]:
    rows = db.execute(audience_base_query(filter_json).limit(limit)).all()
    return [
        AudienceCustomerSample(
            id=customer.id,
            external_id=customer.external_id,
            name=customer.name,
            email=customer.email,
            phone=customer.phone,
            city=customer.city,
            lifetime_value=metric.lifetime_value,
            total_orders=metric.total_orders,
            last_purchase_date=metric.last_purchase_date,
            persona=metric.persona,
        )
        for customer, metric in rows
    ]


def create_audience(db: Session, request: AudienceCreateRequest) -> Audience:
    size = audience_size(db, request.filter_json)
    audience = Audience(
        name=request.name,
        description=request.description,
        filter_json=request.filter_json.model_dump(mode="json"),
        source=request.source,
        estimated_size=size,
    )
    db.add(audience)
    db.commit()
    db.refresh(audience)
    return audience


def get_audience_or_404(db: Session, audience_id: Any) -> Audience:
    audience = db.get(Audience, audience_id)
    if audience is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audience not found")
    return audience
