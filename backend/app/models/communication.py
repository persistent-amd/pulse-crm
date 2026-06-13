import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin
from app.models.mixins import UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.campaign import Campaign
    from app.models.customer import Customer


class Communication(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "communications"
    __table_args__ = (
        Index("ix_communications_campaign_id", "campaign_id"),
        Index("ix_communications_customer_id", "customer_id"),
        Index("ix_communications_current_status", "current_status"),
    )

    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
    )
    recipient: Mapped[str] = mapped_column(String(255), nullable=False)
    channel: Mapped[str] = mapped_column(String(40), nullable=False)
    rendered_message: Mapped[str] = mapped_column(Text, nullable=False)
    current_status: Mapped[str] = mapped_column(String(40), nullable=False, default="queued")
    last_event_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    attributed_revenue: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        server_default="0",
    )

    campaign: Mapped["Campaign"] = relationship(back_populates="communications")
    customer: Mapped["Customer"] = relationship(back_populates="communications")
    events: Mapped[list["CommunicationEvent"]] = relationship(
        back_populates="communication",
        cascade="all, delete-orphan",
    )


class CommunicationEvent(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "communication_events"
    __table_args__ = (
        Index("ix_communication_events_communication_id", "communication_id"),
        Index("ix_communication_events_event_type", "event_type"),
        Index("ix_communication_events_occurred_at", "occurred_at"),
    )

    communication_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("communications.id", ondelete="CASCADE"),
        nullable=False,
    )
    provider_event_id: Mapped[str] = mapped_column(String(160), unique=True, nullable=False)
    event_type: Mapped[str] = mapped_column(String(40), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    raw_payload: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default="{}",
    )

    communication: Mapped["Communication"] = relationship(back_populates="events")
