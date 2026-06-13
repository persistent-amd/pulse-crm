from enum import StrEnum


class AudienceSource(StrEnum):
    MANUAL = "manual"
    AI = "ai"
    OPPORTUNITY = "opportunity"


class CampaignChannel(StrEnum):
    WHATSAPP = "WhatsApp"
    SMS = "SMS"
    EMAIL = "Email"
    RCS = "RCS"


class CampaignGoal(StrEnum):
    RETENTION = "Retention"
    WIN_BACK = "Win Back"
    UPSELL = "Upsell"
    PRODUCT_LAUNCH = "Product Launch"


class CampaignStatus(StrEnum):
    DRAFT = "draft"
    LAUNCHED = "launched"
    COMPLETED = "completed"
    FAILED = "failed"


class CommunicationStatus(StrEnum):
    QUEUED = "queued"
    SENT = "sent"
    FAILED = "failed"
    DELIVERED = "delivered"
    OPENED = "opened"
    READ = "read"
    CLICKED = "clicked"
    CONVERTED = "converted"


class ImportStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ImportType(StrEnum):
    CUSTOMERS = "customers"
    ORDERS = "orders"


class OpportunityStatus(StrEnum):
    ACTIVE = "active"
    DISMISSED = "dismissed"
    CONVERTED = "converted"
