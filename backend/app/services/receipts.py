from datetime import UTC, datetime
from decimal import Decimal, InvalidOperation

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.communication import Communication, CommunicationEvent
from app.schemas.receipts import ReceiptRequest, ReceiptResponse


LIFECYCLE_RANK = {
    "queued": 0,
    "sent": 10,
    "failed": 15,
    "delivered": 20,
    "opened": 30,
    "read": 40,
    "clicked": 50,
    "converted": 60,
}


def event_rank(event_type: str) -> int:
    return LIFECYCLE_RANK[event_type]


def parse_revenue(metadata: dict) -> Decimal:
    raw_value = metadata.get("attributed_revenue") or metadata.get("conversion_value") or 0
    try:
        return Decimal(str(raw_value)).quantize(Decimal("0.01"))
    except (InvalidOperation, ValueError):
        return Decimal("0.00")


def process_receipt(db: Session, request: ReceiptRequest) -> ReceiptResponse:
    existing_event = db.scalar(
        select(CommunicationEvent).where(
            CommunicationEvent.provider_event_id == request.provider_event_id
        )
    )
    communication = db.get(Communication, request.communication_id)
    if communication is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Communication not found")

    if existing_event is not None:
        return ReceiptResponse(
            duplicate=True,
            communication_id=communication.id,
            current_status=communication.current_status,
            event_stored=False,
            status_advanced=False,
            attributed_revenue=communication.attributed_revenue,
        )

    raw_payload = request.model_dump(mode="json")
    db.add(
        CommunicationEvent(
            communication_id=communication.id,
            provider_event_id=request.provider_event_id,
            event_type=request.event_type,
            occurred_at=request.occurred_at,
            received_at=datetime.now(UTC),
            raw_payload=raw_payload,
        )
    )

    current_rank = event_rank(communication.current_status)
    incoming_rank = event_rank(request.event_type)
    status_advanced = False

    if request.event_type == "failed":
        if current_rank < event_rank("delivered"):
            communication.current_status = request.event_type
            communication.last_event_at = request.occurred_at
            status_advanced = True
    elif incoming_rank >= current_rank:
        communication.current_status = request.event_type
        communication.last_event_at = request.occurred_at
        status_advanced = True

    if request.event_type == "converted":
        communication.attributed_revenue = max(
            communication.attributed_revenue,
            parse_revenue(request.metadata),
        )

    db.commit()
    db.refresh(communication)
    return ReceiptResponse(
        duplicate=False,
        communication_id=communication.id,
        current_status=communication.current_status,
        event_stored=True,
        status_advanced=status_advanced,
        attributed_revenue=communication.attributed_revenue,
    )
