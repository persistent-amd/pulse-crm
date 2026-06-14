from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class CustomerSample(ORMModel):
    id: UUID
    external_id: str
    name: str
    email: str | None
    phone: str | None
    city: str | None
    lifetime_value: Decimal
    total_orders: int
    last_purchase_date: date | None = None
    persona: str
