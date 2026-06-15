# Pulse CRM — A Shopper Command Center

> An AI-native marketing CRM platform for shopper engagement, audience segmentation, campaign orchestration, and communication tracking.

---

## Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────┐
│  Next.js Frontend   │───▶│  FastAPI Backend      │───▶│ PostgreSQL  │
│  (React, Tailwind)  │    │  (Python, SQLAlchemy) │    │             │
│  Port 3000          │    │  Port 8000            │    │  Port 5432  │
└─────────────────────┘    └──────────────────────┘    └─────────────┘
         │                          │
         ▼                          ▼
   ┌──────────┐            ┌─────────────────┐
   │ Gemini AI│            │ Channel Service │
   │ (opt.)   │            │ (opt. Port 9000)│
   └──────────┘            └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### 1. Clone and Setup

```bash
git clone <repo-url>
cd pulse-crm
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # Edit DATABASE_URL
pip install -r requirements.txt
alembic upgrade head         # Run migrations
uvicorn app.main:app --reload --port 8000
```

Verify: `http://localhost:8000/health` → `{"status": "ok"}`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local   # Optionally add GOOGLE_API_KEY
npm install
npm run dev                   # Starts on http://localhost:3000
```

### 4. Demo Mode (No Backend Required)

The frontend works fully without a backend. All pages use graceful fallbacks:

| Feature | With Backend | Without Backend |
|---------|-------------|-----------------|
| Customer Import | Real PostgreSQL insert | Simulated with counters |
| Customer List | Live from DB | Mock data (60 customers) |
| Audience Builder | Real preview/save | Client-side filtering |
| Dashboard KPIs | Live counts | Static mock values |
| Campaign Launch | Persisted to localStorage | Persisted to localStorage |
| Activity Feed | Persisted to localStorage | Persisted to localStorage |
| AI Copilot | Gemini API (if key set) | Intelligent mock responses |
| AI Insights | Gemini API (if key set) | Curated mock insights |
| Campaign AI | Gemini API (if key set) | Template-based suggestions |

---

## Gemini AI Setup (Optional)

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Add to `frontend/.env.local`:
   ```
   GOOGLE_API_KEY=your_key_here
   ```
3. Restart the Next.js dev server

When the key is not set, all AI features use the `MockAiProvider` which returns high-quality pre-written responses.

---

## End-to-End Demo Walkthrough

1. **Landing Page** → Click "Get Started" or "View Demo"
2. **Login** → Use demo credentials or sign up
3. **Dashboard** → View KPIs, persona breakdown, revenue trend
4. **Imports** → Download sample CSV → Upload it → View import results
5. **Customers** → Browse imported customer profiles
6. **Audiences** → Create audience with filter rules → Preview → Save
7. **Campaign Studio** → Select audience → Use AI to generate copy → Launch
8. **Campaign Hub** → View launched campaign status
9. **Activity** → See campaign dispatch event → Simulate receipt callback
10. **AI Insights** → View AI-generated marketing recommendations

---

## Project Structure

```
pulse-crm/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # FastAPI endpoints
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── main.py            # App factory
│   └── alembic/               # Database migrations
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   │   ├── api/ai/        # Server-side AI API routes
│   │   │   └── app/           # Dashboard pages
│   │   ├── components/        # Shared UI components
│   │   ├── lib/               # Business logic
│   │   │   ├── ai/            # AI provider abstraction
│   │   │   ├── api.ts         # Backend API client
│   │   │   ├── demo-state.ts  # localStorage persistence
│   │   │   └── sample-data.ts # CSV schemas & validation
│   │   └── utils/             # Mock data generators
│   └── .env.example
├── channel-service/           # Delivery simulation service
└── docs/                      # PRD, sample CSVs
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | No | Gemini API key for AI features |
| `NEXT_PUBLIC_API_URL` | No | Backend URL (default: `http://127.0.0.1:8000`) |

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `APP_NAME` | No | Application name |
| `DEBUG` | No | Debug mode (default: `true`) |
| `CORS_ORIGINS` | No | Allowed origins (default: `["http://localhost:3000"]`) |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/imports/customers` | Upload customer CSV |
| `POST` | `/imports/orders` | Upload order CSV |
| `GET` | `/audiences` | List saved audiences |
| `POST` | `/audiences` | Save audience |
| `POST` | `/audiences/preview` | Preview audience size |
| `POST` | `/receipt` | Ingest delivery receipt |
| `GET` | `/debug/summary` | KPI summary |
| `GET` | `/debug/customers` | Customer list |
| `GET` | `/sample/customers.csv` | Download sample CSV |
| `GET` | `/sample/orders.csv` | Download sample CSV |

---

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Alembic
- **AI**: Google Gemini 2.5 Flash (optional)
- **Design**: Dark mode first, premium SaaS aesthetics

---

## License

MIT
