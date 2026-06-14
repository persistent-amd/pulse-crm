from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl


class SendRequest(BaseModel):
    communication_id: UUID
    campaign_id: UUID
    recipient: str = Field(min_length=1, max_length=255)
    channel: str = Field(min_length=1, max_length=40)
    message: str = Field(min_length=1)
    callback_url: HttpUrl | None = None
    idempotency_key: str = Field(min_length=1, max_length=255)


class SendResponse(BaseModel):
    dispatch_id: UUID
    communication_id: UUID
    campaign_id: UUID
    status: str
    idempotent_replay: bool
