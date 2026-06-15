from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import Response


router = APIRouter(prefix="/sample", tags=["sample"])

PROJECT_ROOT = Path(__file__).resolve().parents[4]
DOCS_DIR = PROJECT_ROOT / "docs"


def csv_response(filename: str) -> Response:
    path = DOCS_DIR / filename
    content = path.read_text(encoding="utf-8")
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/customers.csv")
def sample_customers() -> Response:
    return csv_response("sample-customers.csv")


@router.get("/orders.csv")
def sample_orders() -> Response:
    return csv_response("sample-orders.csv")
