import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class ImportJob(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "imports"

    import_type: Mapped[str] = mapped_column(String(40), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="pending")
    total_rows: Mapped[int] = mapped_column(nullable=False, default=0, server_default="0")
    imported_count: Mapped[int] = mapped_column(nullable=False, default=0, server_default="0")
    skipped_count: Mapped[int] = mapped_column(nullable=False, default=0, server_default="0")
    duplicate_count: Mapped[int] = mapped_column(nullable=False, default=0, server_default="0")
    failed_count: Mapped[int] = mapped_column(nullable=False, default=0, server_default="0")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    errors: Mapped[list["ImportError"]] = relationship(
        back_populates="import_job",
        cascade="all, delete-orphan",
    )


class ImportError(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "import_errors"

    import_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("imports.id", ondelete="CASCADE"),
        nullable=False,
    )
    row_number: Mapped[int] = mapped_column(nullable=False)
    error_code: Mapped[str] = mapped_column(String(80), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    original_row: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default="{}",
    )

    import_job: Mapped[ImportJob] = relationship(back_populates="errors")
