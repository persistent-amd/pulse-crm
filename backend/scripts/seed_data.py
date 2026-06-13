import argparse
import random
from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models import (
    Audience,
    Campaign,
    Communication,
    CommunicationEvent,
    Customer,
    CustomerMetric,
    ImportError,
    ImportJob,
    Opportunity,
    Order,
)
from app.services.personas import assign_persona, favorite_category


FIRST_NAMES = [
    "Aarav",
    "Aditi",
    "Advait",
    "Anaya",
    "Arjun",
    "Diya",
    "Ishaan",
    "Kavya",
    "Meera",
    "Naina",
    "Rohan",
    "Saanvi",
    "Shaurya",
    "Tara",
    "Vihaan",
    "Zoya",
]
LAST_NAMES = [
    "Agarwal",
    "Bansal",
    "Chopra",
    "Gupta",
    "Iyer",
    "Kapoor",
    "Khanna",
    "Mehta",
    "Nair",
    "Patel",
    "Rao",
    "Shah",
    "Singh",
    "Verma",
]
CITIES = [
    "Mumbai",
    "Delhi",
    "Bengaluru",
    "Hyderabad",
    "Pune",
    "Chennai",
    "Kolkata",
    "Ahmedabad",
]
ACQUISITION_CHANNELS = ["website", "store", "app", "instagram", "referral", "marketplace"]
PRODUCTS_BY_CATEGORY = {
    "Fashion": [
        ("Denim Jacket", Decimal("2999")),
        ("Cotton Shirt", Decimal("1299")),
        ("Sneakers", Decimal("3499")),
        ("Weekend Dress", Decimal("2499")),
    ],
    "Beauty": [
        ("Glow Serum", Decimal("1199")),
        ("Matte Lipstick", Decimal("799")),
        ("Hydrating Cream", Decimal("1499")),
        ("Sunscreen Gel", Decimal("899")),
    ],
    "Coffee": [
        ("Cold Brew Pack", Decimal("599")),
        ("Arabica Beans", Decimal("899")),
        ("French Press", Decimal("1799")),
        ("Mocha Gift Box", Decimal("1299")),
    ],
    "Electronics": [
        ("Wireless Earbuds", Decimal("4999")),
        ("Smart Speaker", Decimal("6999")),
        ("Power Bank", Decimal("1799")),
        ("Fitness Band", Decimal("2999")),
    ],
    "Home": [
        ("Scented Candle", Decimal("699")),
        ("Desk Lamp", Decimal("2299")),
        ("Storage Basket", Decimal("999")),
        ("Throw Blanket", Decimal("1899")),
    ],
    "Fitness": [
        ("Yoga Mat", Decimal("1299")),
        ("Protein Shaker", Decimal("499")),
        ("Training Tee", Decimal("999")),
        ("Resistance Bands", Decimal("799")),
    ],
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed Pulse CRM with realistic retail data.")
    parser.add_argument("--customers", type=int, default=1000, help="Number of customers to seed.")
    parser.add_argument("--orders", type=int, default=5000, help="Number of orders to seed.")
    parser.add_argument("--reset", action="store_true", help="Delete CRM seed tables before inserting.")
    parser.add_argument("--seed", type=int, default=None, help="Random seed override.")
    return parser.parse_args()


def reset_database(db: Session) -> None:
    for model in [
        CommunicationEvent,
        Communication,
        Campaign,
        Opportunity,
        Audience,
        CustomerMetric,
        Order,
        ImportError,
        ImportJob,
        Customer,
    ]:
        db.execute(delete(model))
    db.commit()


def random_phone(index: int) -> str:
    return f"+91{9000000000 + index:010d}"[-13:]


def build_customers(count: int, rng: random.Random) -> list[Customer]:
    customers: list[Customer] = []
    for index in range(1, count + 1):
        first_name = rng.choice(FIRST_NAMES)
        last_name = rng.choice(LAST_NAMES)
        city = rng.choice(CITIES)
        external_id = f"CUST-{index:05d}"
        customers.append(
            Customer(
                external_id=external_id,
                name=f"{first_name} {last_name}",
                email=f"{first_name.lower()}.{last_name.lower()}{index}@example.com",
                phone=random_phone(index),
                city=city,
                acquisition_source={
                    "channel": rng.choice(ACQUISITION_CHANNELS),
                    "campaign": rng.choice(["summer-drop", "festive-sale", "new-store", "organic"]),
                },
            )
        )
    return customers


def weighted_customer(customers: list[Customer], rng: random.Random) -> Customer:
    # Bias orders toward earlier customers so the seed naturally creates high-value shoppers.
    max_index = len(customers) - 1
    index = int((rng.random() ** 1.8) * max_index)
    return customers[index]


def random_order_date(customer_index: int, order_index: int, rng: random.Random, today: date) -> date:
    if customer_index % 11 == 0:
        days_ago = rng.randint(61, 330)
    elif customer_index % 17 == 0:
        days_ago = rng.randint(0, 30)
    elif order_index % 7 == 0:
        base = rng.randint(0, 240)
        candidate = today - timedelta(days=base)
        while candidate.weekday() < 5:
            candidate -= timedelta(days=1)
        return candidate
    else:
        days_ago = rng.randint(0, 365)
    return today - timedelta(days=days_ago)


def build_orders(
    *,
    customers: list[Customer],
    count: int,
    rng: random.Random,
    today: date,
) -> list[Order]:
    orders: list[Order] = []
    categories = list(PRODUCTS_BY_CATEGORY)
    for index in range(1, count + 1):
        customer = weighted_customer(customers, rng)
        customer_number = int(customer.external_id.split("-")[1])
        category = rng.choice(categories)
        product, base_price = rng.choice(PRODUCTS_BY_CATEGORY[category])
        multiplier = Decimal(str(rng.uniform(0.85, 1.25))).quantize(Decimal("0.01"))
        amount = (base_price * multiplier).quantize(Decimal("0.01"))
        if customer_number % 13 == 0:
            amount = (amount * Decimal("0.75")).quantize(Decimal("0.01"))

        orders.append(
            Order(
                external_order_id=f"ORD-{index:06d}",
                customer_id=customer.id,
                order_date=random_order_date(customer_number, index, rng, today),
                amount=amount,
                category=category,
                product=product,
                status="paid",
            )
        )
    return orders


def compute_metrics(db: Session, today: date) -> None:
    customers = list(db.scalars(select(Customer)).all())
    orders_by_customer: dict[object, list[Order]] = defaultdict(list)

    for order in db.scalars(select(Order)).all():
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
        persona = assign_persona(
            orders=orders,
            lifetime_value=lifetime_value,
            total_orders=total_orders,
            average_order_value=average_order_value,
            today=today,
        )

        db.merge(
            CustomerMetric(
                customer_id=customer.id,
                lifetime_value=lifetime_value,
                total_orders=total_orders,
                average_order_value=average_order_value,
                last_purchase_date=last_purchase_date,
                favorite_category=favorite_category(orders),
                persona=persona,
            )
        )
    db.commit()


def seed_audiences_and_opportunities(db: Session) -> None:
    audiences = [
        Audience(
            name="High-Value Churn Risk",
            description="Customers with strong historical value who have not purchased recently.",
            filter_json={
                "operator": "and",
                "conditions": [
                    {"field": "lifetime_value", "op": "gte", "value": 10000},
                    {"field": "last_purchase_days_ago", "op": "gt", "value": 45},
                ],
            },
            source="manual",
            estimated_size=0,
        ),
        Audience(
            name="Weekend Shoppers",
            description="Customers whose buying behavior clusters around weekends.",
            filter_json={
                "operator": "and",
                "conditions": [{"field": "persona", "op": "eq", "value": "Weekend Shopper"}],
            },
            source="manual",
            estimated_size=0,
        ),
    ]
    db.add_all(audiences)

    opportunities = [
        Opportunity(
            title="Customers have not purchased in 60 days",
            insight="A win-back audience is ready for a focused retention campaign.",
            recommended_action="Create a WhatsApp campaign with a category-specific offer.",
            backing_filter_json={
                "operator": "and",
                "conditions": [{"field": "last_purchase_days_ago", "op": "gt", "value": 60}],
            },
            status="active",
        ),
        Opportunity(
            title="High-value customers show churn signals",
            insight="Several high-LTV shoppers have slowed down recently.",
            recommended_action="Create a premium early-access campaign for this segment.",
            backing_filter_json={
                "operator": "and",
                "conditions": [
                    {"field": "lifetime_value", "op": "gte", "value": 10000},
                    {"field": "last_purchase_days_ago", "op": "gt", "value": 45},
                ],
            },
            status="active",
        ),
    ]
    db.add_all(opportunities)
    db.commit()


def main() -> None:
    args = parse_args()
    settings = get_settings()
    rng = random.Random(args.seed if args.seed is not None else settings.seed_random_seed)
    today = date.today()

    with SessionLocal() as db:
        if args.reset:
            reset_database(db)

        existing_customers = db.scalar(select(func.count()).select_from(Customer)) or 0
        if existing_customers and not args.reset:
            raise SystemExit(
                "Seed data already exists. Re-run with --reset to replace demo data."
            )

        customers = build_customers(args.customers, rng)
        db.add_all(customers)
        db.flush()

        orders = build_orders(customers=customers, count=args.orders, rng=rng, today=today)
        db.add_all(orders)
        db.commit()

        compute_metrics(db, today)
        seed_audiences_and_opportunities(db)

    print(
        f"Seeded {args.customers} customers, {args.orders} orders, "
        "customer metrics, starter audiences, and opportunity cards."
    )


if __name__ == "__main__":
    main()
