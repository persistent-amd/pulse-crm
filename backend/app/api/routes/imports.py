from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.import_job import ImportJob
from app.schemas.imports import ImportSummary
from app.services.imports import import_customers, import_errors_csv, import_orders


router = APIRouter(prefix="/imports", tags=["imports"])


async def read_csv_upload(file: UploadFile) -> bytes:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .csv uploads are supported",
        )
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded CSV is empty",
        )
    return content


@router.post("/customers", response_model=ImportSummary)
async def upload_customers(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> ImportJob:
    content = await read_csv_upload(file)
    return import_customers(db, filename=file.filename or "customers.csv", content=content)


@router.post("/orders", response_model=ImportSummary)
async def upload_orders(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> ImportJob:
    content = await read_csv_upload(file)
    return import_orders(db, filename=file.filename or "orders.csv", content=content)


@router.get("/{import_id}", response_model=ImportSummary)
def get_import(import_id: UUID, db: Session = Depends(get_db)) -> ImportJob:
    job = db.get(ImportJob, import_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Import not found")
    return job


@router.get("/{import_id}/errors.csv")
def download_import_errors(import_id: UUID, db: Session = Depends(get_db)) -> Response:
    job = db.get(ImportJob, import_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Import not found")
    csv_text = import_errors_csv(db, job=job)
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="import-{import_id}-errors.csv"'
        },
    )
