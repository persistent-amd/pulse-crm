import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.audience import Audience
    from app.models.communication import Communication


class Campaign(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "campaigns"
    __table_args__ = (
        Index("ix_campaigns_status", "status"),
        Index("ix_campaigns_channel", "channel"),
        Index("ix_campaigns_goal", "goal"),
    )

    audience_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("audiences.id", ondelete="RESTRICT"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    channel: Mapped[str] = mapped_column(String(40), nullable=False)
    goal: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="draft")
    message_template: Mapped[str] = mapped_column(Text, nullable=False)
    ai_channel_recommendation: Mapped[str | None] = mapped_column(String(40), nullable=True)
    ai_reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    launched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    audience: Mapped["Audience"] = relationship(back_populates="campaigns")
    communications: Mapped[list["Communication"]] = relationship(
        back_populates="campaign",
        cascade="all, delete-orphan",
    )
