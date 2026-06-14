from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ImportSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    import_type: str
    filename: str
    status: str
    total_rows: int
    imported_count: int
    skipped_count: int
    duplicate_count: int
    failed_count: int
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None
