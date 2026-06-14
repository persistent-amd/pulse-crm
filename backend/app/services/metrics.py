from collections import defaultdict
from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.customer import Customer, CustomerMetric
from app.models.order import Order
from app.services.personas import assign_persona, favorite_category


def recompute_customer_metrics(
    db: Session,
    *,
    customer_ids: set[UUID] | None = None,
    today: date | None = None,
) -> None:
    today = today or date.today()

    customer_stmt = select(Customer)
    order_stmt = select(Order)
    if customer_ids is not None:
        if not customer_ids:
            return
        customer_stmt = customer_stmt.where(Customer.id.in_(customer_ids))
        order_stmt = order_stmt.where(Order.customer_id.in_(customer_ids))

    customers = list(db.scalars(customer_stmt).all())
    orders_by_customer: dict[UUID, list[Order]] = defaultdict(list)
    for order in db.scalars(order_stmt).all():
        orders_by_customer[order.customer_id].append(order)

    for customer in customers:
        orders = orders_by_customer.get(customer.id, [])
        total_orders = len(orders)
        lifetime_value = sum((order.amount for order in orders), Decimal("0.00"))
        average_order_value = (
            (lifetime_value / total_orders).quantize(Decimal("0.01"))
            if total_orders
            else Decimal("0.00")
        )
        last_purchase_date = max((order.order_date for order in orders), default=None)
        values = {
            "lifetime_value": lifetime_value,
            "total_orders": total_orders,
            "average_order_value": average_order_value,
            "last_purchase_date": last_purchase_date,
            "favorite_category": favorite_category(orders),
            "persona": assign_persona(
                orders=orders,
                lifetime_value=lifetime_value,
                total_orders=total_orders,
                average_order_value=average_order_value,
                today=today,
            ),
        }
        metric = db.get(CustomerMetric, customer.id)
        if metric is None:
            db.add(CustomerMetric(customer_id=customer.id, **values))
            continue

        for field, value in values.items():
            setattr(metric, field, value)
