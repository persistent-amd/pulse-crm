"""initial CRM schema

Revision ID: 0001_initial_crm_schema
Revises:
Create Date: 2026-06-14 00:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0001_initial_crm_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "customers",
        sa.Column("external_id", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("city", sa.String(length=80), nullable=True),
        sa.Column(
            "acquisition_source",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_customers")),
        sa.UniqueConstraint("external_id", name=op.f("uq_customers_external_id")),
    )
    op.create_index("ix_customers_city", "customers", ["city"])
    op.create_index("ix_customers_email", "customers", ["email"])
    op.create_index("ix_customers_phone", "customers", ["phone"])

    op.create_table(
        "imports",
        sa.Column("import_type", sa.String(length=40), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("total_rows", sa.Integer(), server_default="0", nullable=False),
        sa.Column("imported_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("skipped_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("duplicate_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("failed_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_imports")),
    )

    op.create_table(
        "audiences",
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("filter_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("source", sa.String(length=40), nullable=False),
        sa.Column("estimated_size", sa.Integer(), server_default="0", nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_audiences")),
    )
    op.create_index("ix_audiences_source", "audiences", ["source"])

    op.create_table(
        "ai_generations",
        sa.Column("feature", sa.String(length=80), nullable=False),
        sa.Column("model", sa.String(length=120), nullable=False),
        sa.Column("input_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("output_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_ai_generations")),
    )

    op.create_table(
        "opportunities",
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("insight", sa.Text(), nullable=False),
        sa.Column("recommended_action", sa.Text(), nullable=False),
        sa.Column("backing_filter_json", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_opportunities")),
    )

    op.create_table(
        "customer_metrics",
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lifetime_value", sa.Numeric(12, 2), server_default="0", nullable=False),
        sa.Column("total_orders", sa.Integer(), server_default="0", nullable=False),
        sa.Column("average_order_value", sa.Numeric(12, 2), server_default="0", nullable=False),
        sa.Column("last_purchase_date", sa.Date(), nullable=True),
        sa.Column("favorite_category", sa.String(length=80), nullable=True),
        sa.Column("persona", sa.String(length=80), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], name=op.f("fk_customer_metrics_customer_id_customers"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("customer_id", name=op.f("pk_customer_metrics")),
    )
    op.create_index("ix_customer_metrics_lifetime_value", "customer_metrics", ["lifetime_value"])
    op.create_index("ix_customer_metrics_last_purchase_date", "customer_metrics", ["last_purchase_date"])
    op.create_index("ix_customer_metrics_persona", "customer_metrics", ["persona"])

    op.create_table(
        "orders",
        sa.Column("external_order_id", sa.String(length=80), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("order_date", sa.Date(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("product", sa.String(length=160), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], name=op.f("fk_orders_customer_id_customers"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_orders")),
        sa.UniqueConstraint("external_order_id", name=op.f("uq_orders_external_order_id")),
    )
    op.create_index("ix_orders_category", "orders", ["category"])
    op.create_index("ix_orders_customer_id", "orders", ["customer_id"])
    op.create_index("ix_orders_order_date", "orders", ["order_date"])

    op.create_table(
        "import_errors",
        sa.Column("import_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("row_number", sa.Integer(), nullable=False),
        sa.Column("error_code", sa.String(length=80), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "original_row",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["import_id"], ["imports.id"], name=op.f("fk_import_errors_import_id_imports"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_import_errors")),
    )

    op.create_table(
        "campaigns",
        sa.Column("audience_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("channel", sa.String(length=40), nullable=False),
        sa.Column("goal", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("message_template", sa.Text(), nullable=False),
        sa.Column("ai_channel_recommendation", sa.String(length=40), nullable=True),
        sa.Column("ai_reasoning", sa.Text(), nullable=True),
        sa.Column("launched_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["audience_id"], ["audiences.id"], name=op.f("fk_campaigns_audience_id_audiences"), ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_campaigns")),
    )
    op.create_index("ix_campaigns_channel", "campaigns", ["channel"])
    op.create_index("ix_campaigns_goal", "campaigns", ["goal"])
    op.create_index("ix_campaigns_status", "campaigns", ["status"])

    op.create_table(
        "communications",
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("recipient", sa.String(length=255), nullable=False),
        sa.Column("channel", sa.String(length=40), nullable=False),
        sa.Column("rendered_message", sa.Text(), nullable=False),
        sa.Column("current_status", sa.String(length=40), nullable=False),
        sa.Column("last_event_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attributed_revenue", sa.Numeric(12, 2), server_default="0", nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["campaign_id"], ["campaigns.id"], name=op.f("fk_communications_campaign_id_campaigns"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], name=op.f("fk_communications_customer_id_customers"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_communications")),
    )
    op.create_index("ix_communications_campaign_id", "communications", ["campaign_id"])
    op.create_index("ix_communications_current_status", "communications", ["current_status"])
    op.create_index("ix_communications_customer_id", "communications", ["customer_id"])

    op.create_table(
        "communication_events",
        sa.Column("communication_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("provider_event_id", sa.String(length=160), nullable=False),
        sa.Column("event_type", sa.String(length=40), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("received_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "raw_payload",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["communication_id"], ["communications.id"], name=op.f("fk_communication_events_communication_id_communications"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_communication_events")),
        sa.UniqueConstraint("provider_event_id", name=op.f("uq_communication_events_provider_event_id")),
    )
    op.create_index("ix_communication_events_communication_id", "communication_events", ["communication_id"])
    op.create_index("ix_communication_events_event_type", "communication_events", ["event_type"])
    op.create_index("ix_communication_events_occurred_at", "communication_events", ["occurred_at"])


def downgrade() -> None:
    op.drop_index("ix_communication_events_occurred_at", table_name="communication_events")
    op.drop_index("ix_communication_events_event_type", table_name="communication_events")
    op.drop_index("ix_communication_events_communication_id", table_name="communication_events")
    op.drop_table("communication_events")
    op.drop_index("ix_communications_customer_id", table_name="communications")
    op.drop_index("ix_communications_current_status", table_name="communications")
    op.drop_index("ix_communications_campaign_id", table_name="communications")
    op.drop_table("communications")
    op.drop_index("ix_campaigns_status", table_name="campaigns")
    op.drop_index("ix_campaigns_goal", table_name="campaigns")
    op.drop_index("ix_campaigns_channel", table_name="campaigns")
    op.drop_table("campaigns")
    op.drop_table("import_errors")
    op.drop_index("ix_orders_order_date", table_name="orders")
    op.drop_index("ix_orders_customer_id", table_name="orders")
    op.drop_index("ix_orders_category", table_name="orders")
    op.drop_table("orders")
    op.drop_index("ix_customer_metrics_persona", table_name="customer_metrics")
    op.drop_index("ix_customer_metrics_last_purchase_date", table_name="customer_metrics")
    op.drop_index("ix_customer_metrics_lifetime_value", table_name="customer_metrics")
    op.drop_table("customer_metrics")
    op.drop_table("opportunities")
    op.drop_table("ai_generations")
    op.drop_index("ix_audiences_source", table_name="audiences")
    op.drop_table("audiences")
    op.drop_table("imports")
    op.drop_index("ix_customers_phone", table_name="customers")
    op.drop_index("ix_customers_email", table_name="customers")
    op.drop_index("ix_customers_city", table_name="customers")
    op.drop_table("customers")
