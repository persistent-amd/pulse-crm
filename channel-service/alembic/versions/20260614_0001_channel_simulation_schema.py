"""channel simulation schema

Revision ID: 0001_channel_simulation_schema
Revises:
Create Date: 2026-06-14 00:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0001_channel_simulation_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "channel_dispatches",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("communication_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("recipient", sa.String(length=255), nullable=False),
        sa.Column("channel", sa.String(length=40), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("callback_url", sa.String(length=500), nullable=False),
        sa.Column("current_simulated_status", sa.String(length=40), nullable=False),
        sa.Column("idempotency_key", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_channel_dispatches")),
        sa.UniqueConstraint("idempotency_key", name=op.f("uq_channel_dispatches_idempotency_key")),
    )
    op.create_index("ix_channel_dispatches_campaign_id", "channel_dispatches", ["campaign_id"])
    op.create_index("ix_channel_dispatches_communication_id", "channel_dispatches", ["communication_id"])

    op.create_table(
        "channel_event_attempts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("dispatch_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("provider_event_id", sa.String(length=160), nullable=False),
        sa.Column("event_type", sa.String(length=40), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("attempt_number", sa.Integer(), nullable=False),
        sa.Column("callback_response_status", sa.Integer(), nullable=True),
        sa.Column("error_details", sa.Text(), nullable=True),
        sa.Column("attempted_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["dispatch_id"], ["channel_dispatches.id"], name=op.f("fk_channel_event_attempts_dispatch_id_channel_dispatches"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_channel_event_attempts")),
    )
    op.create_index("ix_channel_event_attempts_dispatch_id", "channel_event_attempts", ["dispatch_id"])
    op.create_index("ix_channel_event_attempts_provider_event_id", "channel_event_attempts", ["provider_event_id"])


def downgrade() -> None:
    op.drop_index("ix_channel_event_attempts_provider_event_id", table_name="channel_event_attempts")
    op.drop_index("ix_channel_event_attempts_dispatch_id", table_name="channel_event_attempts")
    op.drop_table("channel_event_attempts")
    op.drop_index("ix_channel_dispatches_communication_id", table_name="channel_dispatches")
    op.drop_index("ix_channel_dispatches_campaign_id", table_name="channel_dispatches")
    op.drop_table("channel_dispatches")
