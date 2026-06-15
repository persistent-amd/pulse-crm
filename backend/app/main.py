from fastapi import Depends, FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session


from app.api.routes import audiences, debug, imports, receipts, sample
from app.core.config import Settings, get_settings
from app.db.session import get_db


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        version="0.1.0",
    )

    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.api_route("/health", methods=["GET", "HEAD"], tags=["health"])
    def health_check(db: Session = Depends(get_db)):
        db.execute(text("SELECT 1"))
        return {"status": "ok", "service": "backend"}

    app.include_router(imports.router)
    app.include_router(audiences.router)
    app.include_router(receipts.router)
    app.include_router(debug.router)
    app.include_router(sample.router)

    return app


app = create_app()
