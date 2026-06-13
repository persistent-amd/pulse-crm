from collections import Counter
from datetime import date
from decimal import Decimal

from app.models.order import Order


PERSONA_CHURN_RISK = "Churn Risk"
PERSONA_HIGH_VALUE_LOYALIST = "High Value Loyalist"
PERSONA_WEEKEND_SHOPPER = "Weekend Shopper"
PERSONA_DISCOUNT_HUNTER = "Discount Hunter"
PERSONA_NEW_CUSTOMER = "New Customer"


def favorite_category(orders: list[Order]) -> str | None:
    if not orders:
        return None
    counts = Counter(order.category for order in orders)
    return counts.most_common(1)[0][0]


def assign_persona(
    *,
    orders: list[Order],
    lifetime_value: Decimal,
    total_orders: int,
    average_order_value: Decimal,
    today: date,
) -> str:
    if not orders:
        return PERSONA_NEW_CUSTOMER

    last_purchase_date = max(order.order_date for order in orders)
    first_purchase_date = min(order.order_date for order in orders)
    days_since_last_purchase = (today - last_purchase_date).days
    days_since_first_purchase = (today - first_purchase_date).days
    weekend_orders = sum(1 for order in orders if order.order_date.weekday() >= 5)
    weekend_share = weekend_orders / total_orders if total_orders else 0

    if days_since_last_purchase > 60 and total_orders >= 2:
        return PERSONA_CHURN_RISK
    if lifetime_value >= Decimal("10000") and total_orders >= 5:
        return PERSONA_HIGH_VALUE_LOYALIST
    if weekend_share >= 0.55 and total_orders >= 3:
        return PERSONA_WEEKEND_SHOPPER
    if average_order_value < Decimal("1200") and total_orders >= 4:
        return PERSONA_DISCOUNT_HUNTER
    if days_since_first_purchase <= 30:
        return PERSONA_NEW_CUSTOMER

    return PERSONA_NEW_CUSTOMER
