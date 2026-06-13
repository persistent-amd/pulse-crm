from typing import Any

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin
from app.models.mixins import UUIDPrimaryKeyMixin


class AIGeneration(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ai_generations"

    feature: Mapped[str] = mapped_column(String(80), nullable=False)
    model: Mapped[str] = mapped_column(String(120), nullable=False)
    input_json: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    output_json: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
