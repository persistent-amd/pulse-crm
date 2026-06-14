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

## CSV schemas

Customer import requires this header:

```csv
external_id,name,email,phone,city
```

Example:

```csv
external_id,name,email,phone,city
CUST-001,Asha Mehta,asha@example.com,+919000000001,Mumbai
CUST-002,Rohan Shah,rohan@example.com,+919000000002,Delhi
```

Order import requires this header:

```csv
external_order_id,customer_external_id,order_date,amount,category,product,status
```

Example:

```csv
external_order_id,customer_external_id,order_date,amount,category,product,status
ORD-001,CUST-001,2026-06-01,2499.00,Fashion,Denim Jacket,paid
ORD-002,CUST-001,2026-06-08,1299.00,Coffee,Cold Brew Pack,paid
ORD-003,CUST-002,2026-06-10,3499.00,Electronics,Wireless Earbuds,paid
```

Duplicate customer rows are skipped and counted by matching `external_id`, email, or phone. Duplicate order rows are skipped and counted by matching `external_order_id`.

## Audience preview examples

Revenue and recency:

```json
{
  "filter_json": {
    "operator": "and",
    "conditions": [
      { "field": "lifetime_value", "op": "gte", "value": 5000 },
      { "field": "last_purchase_days_ago", "op": "gt", "value": 45 }
    ]
  },
  "sample_limit": 10
}
```

City and persona:

```json
{
  "filter_json": {
    "operator": "and",
    "conditions": [
      { "field": "city", "op": "in", "value": ["Mumbai", "Delhi"] },
      { "field": "persona", "op": "eq", "value": "Churn Risk" }
    ]
  },
  "sample_limit": 10
}
```

Supported fields: `lifetime_value`, `total_orders`, `last_purchase_days_ago`, `city`, `persona`.

Supported operators: `gt`, `gte`, `lt`, `lte`, `eq`, `in`, `between`.

Unsupported fields or operators return `400`.

## Manual testing

Start the API:

```powershell
cd backend
.\\.venv\\Scripts\\Activate.ps1
alembic upgrade head
uvicorn app.main:app --reload
```

Open Swagger:

```text
http://127.0.0.1:8000/docs
```

Recommended demo flow:

1. `GET /health`
2. `POST /imports/customers` with a customer CSV.
3. `GET /imports/{id}` to inspect the import summary.
4. `GET /imports/{id}/errors.csv` to download row-level errors.
5. `POST /imports/orders` with an order CSV using existing `customer_external_id` values.
6. `GET /debug/customers` to verify `lifetime_value`, `total_orders`, and `persona`.
7. `GET /debug/summary` to verify total customers, orders, audiences, and persona breakdown.
8. `POST /audiences/preview` with a supported filter payload.
9. `POST /audiences` to save the audience.
10. `GET /audiences` and `GET /audiences/{id}` to inspect saved audiences.

Run tests:

```powershell
cd backend
.\\.venv\\Scripts\\Activate.ps1
python -m pytest -q
```
