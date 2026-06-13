from typing import Any

from sqlalchemy import Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Audience(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "audiences"
    __table_args__ = (
        Index("ix_audiences_source", "source"),
    )

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    filter_json: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    source: Mapped[str] = mapped_column(String(40), nullable=False, default="manual")
    estimated_size: Mapped[int] = mapped_column(nullable=False, default=0, server_default="0")

    campaigns = relationship("Campaign", back_populates="audience")
