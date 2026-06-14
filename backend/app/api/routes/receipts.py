from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.receipts import ReceiptRequest, ReceiptResponse
from app.services.receipts import process_receipt


router = APIRouter(tags=["receipts"])


@router.post("/receipt", response_model=ReceiptResponse)
def receive_receipt(
    request: ReceiptRequest,
    db: Session = Depends(get_db),
) -> ReceiptResponse:
    return process_receipt(db, request)
