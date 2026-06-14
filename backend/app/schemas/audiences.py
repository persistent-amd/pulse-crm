from datetime import date, datetime
from decimal import Decimal
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


SUPPORTED_FIELDS = {
    "lifetime_value",
    "total_orders",
    "last_purchase_days_ago",
    "city",
    "persona",
}
SUPPORTED_OPERATORS = {"gt", "gte", "lt", "lte", "eq", "in", "between"}
NUMERIC_FIELDS = {"lifetime_value", "total_orders", "last_purchase_days_ago"}
TEXT_FIELDS = {"city", "persona"}


class AudienceCondition(BaseModel):
    field: str
    op: str
    value: Any

    @model_validator(mode="after")
    def validate_condition(self) -> "AudienceCondition":
        if self.field not in SUPPORTED_FIELDS:
            raise ValueError(f"Unsupported filter field: {self.field}")
        if self.op not in SUPPORTED_OPERATORS:
            raise ValueError(f"Unsupported filter operator: {self.op}")
        if self.field in TEXT_FIELDS and self.op not in {"eq", "in"}:
            raise ValueError(f"Operator {self.op} is not supported for {self.field}")
        if self.op == "in":
            if not isinstance(self.value, list) or not self.value:
                raise ValueError("Operator in requires a non-empty list value")
        if self.op == "between":
            if (
                not isinstance(self.value, list)
                or len(self.value) != 2
                or self.value[0] > self.value[1]
            ):
                raise ValueError("Operator between requires [min, max]")
        return self


class AudienceFilter(BaseModel):
    operator: Literal["and"] = "and"
    conditions: list[AudienceCondition] = Field(min_length=1)

    @field_validator("conditions")
    @classmethod
    def validate_conditions(cls, value: list[AudienceCondition]) -> list[AudienceCondition]:
        if len(value) > 10:
            raise ValueError("Audience filters support at most 10 conditions")
        return value


class AudiencePreviewRequest(BaseModel):
    filter_json: AudienceFilter
    sample_limit: int = Field(default=10, ge=1, le=50)


class AudienceCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    filter_json: AudienceFilter
    source: Literal["manual", "ai", "opportunity"] = "manual"


class AudienceCustomerSample(BaseModel):
    id: UUID
    external_id: str
    name: str
    email: str | None
    phone: str | None
    city: str | None
    lifetime_value: Decimal
    total_orders: int
    last_purchase_date: date | None
    persona: str


class AudiencePreviewResponse(BaseModel):
    size: int
    sample_customers: list[AudienceCustomerSample]


class AudienceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None
    filter_json: dict[str, Any]
    source: str
    estimated_size: int
    created_at: datetime
    updated_at: datetime


class AudienceDetailResponse(AudienceResponse):
    sample_customers: list[AudienceCustomerSample]
