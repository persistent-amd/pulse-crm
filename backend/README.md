# Pulse CRM Backend

FastAPI CRM service for Pulse CRM.

## Local setup

```powershell
cd backend
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
python -m scripts.seed_data --reset
uvicorn app.main:app --reload
```

The backend expects PostgreSQL through `DATABASE_URL`.
