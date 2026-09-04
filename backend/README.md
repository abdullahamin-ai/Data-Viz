# Backend — Data Visualization SaaS

FastAPI service: auth, CSV/JSON upload + parsing, chart-data aggregation, saved dashboards.

## Stack
- FastAPI + SQLAlchemy + Alembic + MySQL
- Celery + Redis for background jobs
- Ollama for AI chart suggestions (rule-based fallback if unavailable)
- JWT + bcrypt auth

## Setup
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/macOS
# edit .env — set a real DB_PASSWORD and JWT_SECRET, don't leave the placeholders
uvicorn app.main:app --reload
```
First startup creates the database (if missing) and runs `alembic upgrade head`.

## Celery worker
In a separate terminal, same virtualenv:
```bash
celery -A app.workers.celery_app.celery_app worker --loglevel=info
```
Requires Redis running at `REDIS_URL` (see `.env`).

## Project layout
```
app/
├── core/        # config, db session, security (JWT/bcrypt), logging
├── models/      # SQLAlchemy models (User, Dataset, Dashboard)
├── schemas/     # Pydantic request/response schemas
├── routers/     # API route handlers (auth, upload, chart-data, dashboards, health)
├── services/    # file parsing, column detection, aggregation, chart suggestions, Ollama client
├── workers/     # Celery app + tasks
└── main.py      # app entrypoint, middleware, router registration
```

## API
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/upload`
- `GET /api/upload/{dataset_id}`
- `GET /api/chart-data/{dataset_id}?x=<column>&y=<column>&aggregation=sum|avg|count`
- `POST /api/dashboards`
- `GET /api/dashboards`
- `GET /api/dashboards/{id}`
- `DELETE /api/dashboards/{id}`
- `GET /health`

## Tests
```bash
pytest -q
```

See the [root README](../README.md) for full project setup (frontend, sample data, license).