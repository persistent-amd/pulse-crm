import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class ChannelDispatch(TimestampMixin, Base):
    __tablename__ = "channel_dispatches"
    __table_args__ = (
        Index("ix_channel_dispatches_communication_id", "communication_id"),
        Index("ix_channel_dispatches_campaign_id", "campaign_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    communication_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    campaign_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    recipient: Mapped[str] = mapped_column(String(255), nullable=False)
    channel: Mapped[str] = mapped_column(String(40), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    callback_url: Mapped[str] = mapped_column(String(500), nullable=False)
    current_simulated_status: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
        default="queued",
    )
    idempotency_key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    attempts: Mapped[list["ChannelEventAttempt"]] = relationship(
        back_populates="dispatch",
        cascade="all, delete-orphan",
    )


class ChannelEventAttempt(Base):
    __tablename__ = "channel_event_attempts"
    __table_args__ = (
        Index("ix_channel_event_attempts_dispatch_id", "dispatch_id"),
        Index("ix_channel_event_attempts_provider_event_id", "provider_event_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    dispatch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("channel_dispatches.id", ondelete="CASCADE"),
        nullable=False,
    )
    provider_event_id: Mapped[str] = mapped_column(String(160), nullable=False)
    event_type: Mapped[str] = mapped_column(String(40), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    attempt_number: Mapped[int] = mapped_column(nullable=False)
    callback_response_status: Mapped[int | None] = mapped_column(nullable=True)
    error_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    attempted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    dispatch: Mapped[ChannelDispatch] = relationship(back_populates="attempts")
