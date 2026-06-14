from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.audience import Audience
from app.schemas.audiences import (
    AudienceCreateRequest,
    AudienceDetailResponse,
    AudiencePreviewRequest,
    AudiencePreviewResponse,
    AudienceResponse,
)
from app.services.audiences import (
    audience_samples,
    audience_size,
    create_audience,
    get_audience_or_404,
)


router = APIRouter(prefix="/audiences", tags=["audiences"])


def parse_payload(model, payload: dict):
    try:
        return model.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=jsonable_encoder(exc.errors()),
        ) from exc


@router.post("/preview", response_model=AudiencePreviewResponse)
def preview_audience(
    payload: dict,
    db: Session = Depends(get_db),
) -> AudiencePreviewResponse:
    request = parse_payload(AudiencePreviewRequest, payload)
    return AudiencePreviewResponse(
        size=audience_size(db, request.filter_json),
        sample_customers=audience_samples(
            db,
            request.filter_json,
            limit=request.sample_limit,
        ),
    )


@router.post("", response_model=AudienceResponse, status_code=201)
def save_audience(
    payload: dict,
    db: Session = Depends(get_db),
) -> Audience:
    request = parse_payload(AudienceCreateRequest, payload)
    return create_audience(db, request)


@router.get("", response_model=list[AudienceResponse])
def list_audiences(db: Session = Depends(get_db)) -> list[Audience]:
    return list(db.scalars(select(Audience).order_by(Audience.created_at.desc())).all())


@router.get("/{audience_id}", response_model=AudienceDetailResponse)
def get_audience(audience_id: UUID, db: Session = Depends(get_db)) -> AudienceDetailResponse:
    audience = get_audience_or_404(db, audience_id)
    filter_json = AudiencePreviewRequest(filter_json=audience.filter_json).filter_json
    return AudienceDetailResponse(
        id=audience.id,
        name=audience.name,
        description=audience.description,
        filter_json=audience.filter_json,
        source=audience.source,
        estimated_size=audience.estimated_size,
        created_at=audience.created_at,
        updated_at=audience.updated_at,
        sample_customers=audience_samples(db, filter_json, limit=10),
    )
