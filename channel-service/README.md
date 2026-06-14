# Pulse CRM Channel Service

Separate FastAPI service that simulates channel delivery and callbacks to the CRM receipt API.

## Local setup

```powershell
cd channel-service
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8001
```
