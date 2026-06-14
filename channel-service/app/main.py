from fastapi import BackgroundTasks, Depends, FastAPI
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.models.dispatch import ChannelDispatch
from app.schemas import SendRequest, SendResponse
from app.services.simulation import simulate_dispatch


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    app = FastAPI(title=settings.app_name, debug=settings.debug, version="0.1.0")

    @app.get("/health", tags=["health"])
    def health_check(db: Session = Depends(get_db)) -> dict[str, str]:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "service": "channel-service"}

    @app.post("/send", response_model=SendResponse, status_code=202, tags=["send"])
    def send_message(
        request: SendRequest,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db),
    ) -> SendResponse:
        existing = db.scalar(
            select(ChannelDispatch).where(
                ChannelDispatch.idempotency_key == request.idempotency_key
            )
        )
        if existing is not None:
            return SendResponse(
                dispatch_id=existing.id,
                communication_id=existing.communication_id,
                campaign_id=existing.campaign_id,
                status=existing.current_simulated_status,
                idempotent_replay=True,
            )

        dispatch = ChannelDispatch(
            communication_id=request.communication_id,
            campaign_id=request.campaign_id,
            recipient=request.recipient,
            channel=request.channel,
            message=request.message,
            callback_url=str(request.callback_url or settings.crm_receipt_url),
            current_simulated_status="queued",
            idempotency_key=request.idempotency_key,
        )
        db.add(dispatch)
        db.commit()
        db.refresh(dispatch)

        background_tasks.add_task(simulate_dispatch, str(dispatch.id))
        return SendResponse(
            dispatch_id=dispatch.id,
            communication_id=dispatch.communication_id,
            campaign_id=dispatch.campaign_id,
            status=dispatch.current_simulated_status,
            idempotent_replay=False,
        )

    return app


app = create_app()
