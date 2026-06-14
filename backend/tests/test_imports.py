from datetime import date, timedelta
from decimal import Decimal
from uuid import uuid4

from app.models.customer import Customer, CustomerMetric
from app.models.import_job import ImportError, ImportJob
from app.models.order import Order
from app.services import imports


class ScalarResult:
    def __init__(self, values):
        self.values = values

    def all(self):
        return self.values


class FakeSession:
    def __init__(self, *, customers, orders=None, metrics=None):
        self.customers = customers
        self.orders = orders or []
        self.metrics = metrics or {}
        self.added = []
        self.committed = False
        self.refreshed = []

    def add(self, instance):
        if isinstance(instance, ImportJob):
            instance.id = uuid4()
            instance.total_rows = 0
            instance.imported_count = 0
            instance.skipped_count = 0
            instance.duplicate_count = 0
            instance.failed_count = 0
        if isinstance(instance, Customer) and instance.id is None:
            instance.id = uuid4()
        if isinstance(instance, Order):
            self.orders.append(instance)
        if isinstance(instance, CustomerMetric):
            self.metrics[instance.customer_id] = instance
        self.added.append(instance)

    def flush(self):
        return None

    def scalars(self, statement):
        tables = {column["entity"].__name__ for column in statement.column_descriptions}
        if "Order" in tables:
            return ScalarResult(self.orders)
        return ScalarResult(self.customers)

    def get(self, model, primary_key):
        if model is CustomerMetric:
            return self.metrics.get(primary_key)
        return None

    def commit(self):
        self.committed = True

    def refresh(self, instance):
        self.refreshed.append(instance)


def test_import_customers_counts_existing_customer_duplicate_and_updates_metrics():
    existing_customer_id = uuid4()
    existing_customer = Customer(
        external_id="CUST-001",
        name="Ada Lovelace",
        email="ada@example.com",
        phone="555-0100",
        city="London",
        acquisition_source={"source": "seed"},
    )
    existing_customer.id = existing_customer_id
    existing_metric = CustomerMetric(customer_id=existing_customer_id, persona="Seeded Customer")
    db = FakeSession(customers=[existing_customer], metrics={existing_customer_id: existing_metric})

    csv_content = (
        "external_id,name,email,phone,city\n"
        "CUST-001,Ada Lovelace,ada@example.com,555-0100,London\n"
    ).encode()

    job = imports.import_customers(db, filename="customers.csv", content=csv_content)

    assert job.status == "completed"
    assert job.total_rows == 1
    assert job.imported_count == 0
    assert job.duplicate_count == 1
    assert job.skipped_count == 1
    assert job.failed_count == 0
    assert db.committed is True
    assert existing_metric.persona == "New Customer"
    assert existing_metric.total_orders == 0
    assert not any(isinstance(instance, CustomerMetric) for instance in db.added)
    assert sum(isinstance(instance, ImportError) for instance in db.added) == 1


def test_import_orders_imports_valid_orders_and_recomputes_metrics():
    customer_id = uuid4()
    customer = Customer(
        external_id="CUST-100",
        name="Meera Shah",
        email="meera@example.com",
        phone="555-1000",
        city="Mumbai",
        acquisition_source={"source": "seed"},
    )
    customer.id = customer_id
    metric = CustomerMetric(customer_id=customer_id, persona="New Customer")
    db = FakeSession(customers=[customer], metrics={customer_id: metric})
    order_date = (date.today() - timedelta(days=10)).isoformat()

    csv_content = (
        "external_order_id,customer_external_id,order_date,amount,category,product,status\n"
        f"ORD-100,CUST-100,{order_date},2500.00,Fashion,Denim Jacket,paid\n"
    ).encode()

    job = imports.import_orders(db, filename="orders.csv", content=csv_content)

    assert job.status == "completed"
    assert job.total_rows == 1
    assert job.imported_count == 1
    assert job.duplicate_count == 0
    assert job.failed_count == 0
    assert db.committed is True
    assert len(db.orders) == 1
    assert metric.lifetime_value == Decimal("2500.00")
    assert metric.total_orders == 1
    assert metric.average_order_value == Decimal("2500.00")
    assert metric.last_purchase_date == date.fromisoformat(order_date)
    assert metric.favorite_category == "Fashion"
    assert metric.persona == "New Customer"


def test_import_orders_counts_duplicate_without_raising():
    customer_id = uuid4()
    customer = Customer(
        external_id="CUST-200",
        name="Rohan Mehta",
        email="rohan@example.com",
        phone="555-2000",
        city="Delhi",
        acquisition_source={"source": "seed"},
    )
    customer.id = customer_id
    existing_order = Order(
        external_order_id="ORD-200",
        customer_id=customer_id,
        order_date=date.today(),
        amount=Decimal("999.00"),
        category="Coffee",
        product="Cold Brew Pack",
        status="paid",
    )
    metric = CustomerMetric(customer_id=customer_id, persona="New Customer")
    db = FakeSession(customers=[customer], orders=[existing_order], metrics={customer_id: metric})

    csv_content = (
        "external_order_id,customer_external_id,order_date,amount,category,product,status\n"
        f"ORD-200,CUST-200,{date.today().isoformat()},999.00,Coffee,Cold Brew Pack,paid\n"
    ).encode()

    job = imports.import_orders(db, filename="orders.csv", content=csv_content)

    assert job.status == "completed"
    assert job.total_rows == 1
    assert job.imported_count == 0
    assert job.duplicate_count == 1
    assert job.skipped_count == 1
    assert job.failed_count == 0
    assert db.committed is True
    assert sum(isinstance(instance, ImportError) for instance in db.added) == 1
