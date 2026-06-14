from datetime import datetime
from decimal import Decimal
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


ReceiptEventType = Literal[
    "sent",
    "delivered",
    "failed",
    "opened",
    "read",
    "clicked",
    "converted",
]


class ReceiptRequest(BaseModel):
    provider_event_id: str = Field(min_length=1, max_length=160)
    communication_id: UUID
    campaign_id: UUID
    channel: str
    event_type: ReceiptEventType
    occurred_at: datetime
    metadata: dict[str, Any] = Field(default_factory=dict)


class ReceiptResponse(BaseModel):
    duplicate: bool
    communication_id: UUID
    current_status: str
    event_stored: bool
    status_advanced: bool
    attributed_revenue: Decimal
