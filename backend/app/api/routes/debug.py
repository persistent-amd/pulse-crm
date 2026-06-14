from sqlalchemy import func, select
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.db.session import get_db
from app.models.audience import Audience
from app.models.customer import Customer, CustomerMetric
from app.models.order import Order


router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/customers")
def debug_customers(db: Session = Depends(get_db)) -> list[dict]:
    rows = db.execute(
        select(Customer, CustomerMetric)
        .outerjoin(CustomerMetric, CustomerMetric.customer_id == Customer.id)
        .order_by(Customer.created_at.desc())
    ).all()
    return [
        {
            "id": str(customer.id),
            "external_id": customer.external_id,
            "name": customer.name,
            "city": customer.city,
            "lifetime_value": str(metric.lifetime_value if metric else 0),
            "total_orders": metric.total_orders if metric else 0,
            "persona": metric.persona if metric else "New Customer",
        }
        for customer, metric in rows
    ]


@router.get("/summary")
def debug_summary(db: Session = Depends(get_db)) -> dict:
    persona_rows = db.execute(
        select(CustomerMetric.persona, func.count())
        .group_by(CustomerMetric.persona)
        .order_by(CustomerMetric.persona)
    ).all()
    return {
        "customers": db.scalar(select(func.count()).select_from(Customer)) or 0,
        "orders": db.scalar(select(func.count()).select_from(Order)) or 0,
        "audiences": db.scalar(select(func.count()).select_from(Audience)) or 0,
        "persona_breakdown": {persona: count for persona, count in persona_rows},
    }
