import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from sqlalchemy import Date, DateTime, ForeignKey, Index, Numeric, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.communication import Communication
    from app.models.order import Order


class Customer(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "customers"
    __table_args__ = (
        Index("ix_customers_email", "email"),
        Index("ix_customers_phone", "phone"),
        Index("ix_customers_city", "city"),
    )

    external_id: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    city: Mapped[str | None] = mapped_column(String(80), nullable=True)
    acquisition_source: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default="{}",
    )

    orders: Mapped[list["Order"]] = relationship(
        back_populates="customer",
        cascade="all, delete-orphan",
    )
    metric: Mapped["CustomerMetric | None"] = relationship(
        back_populates="customer",
        cascade="all, delete-orphan",
        uselist=False,
    )
    communications: Mapped[list["Communication"]] = relationship(back_populates="customer")


class CustomerMetric(Base):
    __tablename__ = "customer_metrics"
    __table_args__ = (
        Index("ix_customer_metrics_persona", "persona"),
        Index("ix_customer_metrics_lifetime_value", "lifetime_value"),
        Index("ix_customer_metrics_last_purchase_date", "last_purchase_date"),
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        primary_key=True,
    )
    lifetime_value: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        server_default="0",
    )
    total_orders: Mapped[int] = mapped_column(nullable=False, default=0, server_default="0")
    average_order_value: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        server_default="0",
    )
    last_purchase_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    favorite_category: Mapped[str | None] = mapped_column(String(80), nullable=True)
    persona: Mapped[str] = mapped_column(String(80), nullable=False, default="New Customer")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    customer: Mapped[Customer] = relationship(back_populates="metric")
