import json
import random
import time
import urllib.error
import urllib.request
import uuid
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.dispatch import ChannelDispatch, ChannelEventAttempt


CHANNEL_PROBABILITIES = {
    "WhatsApp": {"delivered": 0.94, "engaged": 0.70, "clicked": 0.18, "converted": 0.05},
    "SMS": {"delivered": 0.90, "engaged": 0.35, "clicked": 0.08, "converted": 0.02},
    "Email": {"delivered": 0.88, "engaged": 0.28, "clicked": 0.06, "converted": 0.015},
    "RCS": {"delivered": 0.86, "engaged": 0.45, "clicked": 0.10, "converted": 0.03},
}
RETRY_DELAYS_SECONDS = [0, 5, 20]


def provider_event_id(dispatch: ChannelDispatch, event_type: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"{dispatch.id}:{event_type}"))


def payload_for(dispatch: ChannelDispatch, event_type: str) -> dict:
    metadata = {"simulated": True}
    if event_type == "converted":
        metadata["attributed_revenue"] = str(Decimal(random.choice([799, 1299, 2499, 3499])))
    return {
        "provider_event_id": provider_event_id(dispatch, event_type),
        "communication_id": str(dispatch.communication_id),
        "campaign_id": str(dispatch.campaign_id),
        "channel": dispatch.channel,
        "event_type": event_type,
        "occurred_at": datetime.now(UTC).isoformat(),
        "metadata": metadata,
    }


def callback_once(url: str, payload: dict) -> tuple[int | None, str | None]:
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            return response.status, None
    except urllib.error.HTTPError as exc:
        return exc.code, exc.reason
    except urllib.error.URLError as exc:
        return None, str(exc.reason)
    except TimeoutError as exc:
        return None, str(exc)


def record_attempt(
    db: Session,
    *,
    dispatch: ChannelDispatch,
    payload: dict,
    attempt_number: int,
    response_status: int | None,
    error_details: str | None,
) -> None:
    db.add(
        ChannelEventAttempt(
            dispatch_id=dispatch.id,
            provider_event_id=payload["provider_event_id"],
            event_type=payload["event_type"],
            payload=payload,
            attempt_number=attempt_number,
            callback_response_status=response_status,
            error_details=error_details,
        )
    )
    dispatch.current_simulated_status = payload["event_type"]
    db.commit()


def deliver_callback(db: Session, *, dispatch: ChannelDispatch, payload: dict) -> None:
    for attempt_index, delay in enumerate(RETRY_DELAYS_SECONDS, start=1):
        if delay:
            time.sleep(delay)
        response_status, error_details = callback_once(dispatch.callback_url, payload)
        record_attempt(
            db,
            dispatch=dispatch,
            payload=payload,
            attempt_number=attempt_index,
            response_status=response_status,
            error_details=error_details,
        )
        if response_status is not None and 200 <= response_status < 300:
            return


def event_path(dispatch: ChannelDispatch, rng: random.Random) -> list[str]:
    probabilities = CHANNEL_PROBABILITIES.get(dispatch.channel, CHANNEL_PROBABILITIES["SMS"])
    events = ["sent"]
    if rng.random() > probabilities["delivered"]:
        return events + ["failed"]

    events.append("delivered")
    if rng.random() <= probabilities["engaged"]:
        events.append("opened" if dispatch.channel in {"SMS", "Email"} else "read")
    if rng.random() <= probabilities["clicked"]:
        events.append("clicked")
    if rng.random() <= probabilities["converted"]:
        events.append("converted")
    return events


def simulate_dispatch(dispatch_id: str) -> None:
    settings = get_settings()
    with SessionLocal() as db:
        dispatch = db.get(ChannelDispatch, uuid.UUID(dispatch_id))
        if dispatch is None:
            return

        rng = random.Random(f"{settings.simulation_seed}:{dispatch.id}")
        for event_type in event_path(dispatch, rng):
            time.sleep(0.25)
            deliver_callback(db, dispatch=dispatch, payload=payload_for(dispatch, event_type))
