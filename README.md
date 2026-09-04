# Data Visualization SaaS

Full-stack CSV/JSON-to-dashboard SaaS built with FastAPI, SQLAlchemy/Alembic, MySQL, Celery/Redis, Ollama, React, Tailwind and Tremor.

## Architecture
- Backend: FastAPI + SQLAlchemy + Alembic + MySQL
- Background jobs: Celery + Redis
- AI suggestions: local Ollama with rule-based fallback
- Frontend: React + TypeScript + Tailwind + Tremor
- Auth: JWT + bcrypt
- Logging: terminal + rotating `backend/logs/app.log`

## Screenshots
Screenshots live in [`images/`](images) — add them there and reference them here as the UI settles.

## Native setup (no Docker)

### 1. MySQL
Install MySQL Server and make sure it is running. The backend creates `DB_NAME` automatically if it does not exist.

### 2. Redis
Install Redis natively and start it on the configured port.

### 3. Ollama
Install Ollama natively, start the Ollama service, and make sure the model named by `OLLAMA_MODEL` is available. If Ollama is unavailable, the application continues with rule-based chart suggestions.

### 4. Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/macOS
# Edit .env
uvicorn app.main:app --reload
```

The first startup creates the configured database and runs `alembic upgrade head`.

### 5. Celery worker
In another terminal:
```bash
cd backend
# activate the same virtualenv
celery -A app.workers.celery_app.celery_app worker --loglevel=info
```

### 6. Frontend
```bash
cd frontend
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/macOS
npm run dev
```

Open the Vite URL shown in the terminal.

## Sample data
A ready-to-use dataset is included at [`sample-data/sales-sample.csv`](sample-data/sales-sample.csv) —
30 rows of sales across regions, categories, and dates, so anyone cloning the repo can try the app
immediately without hunting for their own data. After signing up, upload it from the "New dataset"
screen; it has a categorical column (`Region`, `Category`), a numeric column (`Sales`, `Units`), and
a datetime column (`Date`), so all three chart suggestions (bar, pie, line) show up right away.

## Tests
```bash
cd backend
pytest -q
```

## API
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/upload`
- `GET /api/chart-data/{dataset_id}?x=<column>&y=<column>`
- `POST /api/dashboards`
- `GET /api/dashboards`
- `GET /api/dashboards/{id}`
- `DELETE /api/dashboards/{id}`
- `GET /health`

## Important implementation notes
1. Small uploads are parsed in the request so the API can immediately return column metadata and suggestions; Celery is wired from the start and receives a processing task. For production-scale asynchronous ingestion, the task can be expanded to move the complete parsing/storage operation off-request.
2. Dataset rows are stored as JSON for this build to keep the chart-data service generic. For very large production datasets, a columnar/object-storage architecture would be a separate architectural scope decision.
3. The frontend's immediate dashboard view is designed around the upload response. Saved-dashboard retrieval is implemented through the API; richer persisted dashboard hydration can be added as a separately scoped UI enhancement.

## Fixes applied (defect pass)
1. **Upload request hung ~19s when Redis was down** — Celery's result backend was retrying against Redis synchronously inside the request. Removed the result backend (`task_ignore_result=True`), capped broker retries, and moved `.delay()` off the event loop.
2. **Blocking HTTP call inside an async route** — `get_ai_suggestions()` used the blocking `requests` library directly inside `async def upload_dataset`, which could stall the entire server (all concurrent requests) for up to 8s whenever Ollama was slow/unreachable. Now offloaded via `run_in_threadpool`.
3. **Rate limiter used the proxy IP behind a reverse proxy** — `request.client.host` collapses to one shared bucket for all users behind a load balancer. Now prefers `X-Forwarded-For` when present.
4. **bcrypt/passlib version mismatch warning** — pinned `bcrypt<4.1` to match the `passlib` version in use.

5. **`Saved` page double-fetched dashboards in dev** — it used `useState(() => { ...fetch... })` as a fake `useEffect`. Under `<React.StrictMode>` (already used in `main.tsx`), React 18 intentionally double-invokes state initializer functions, so the API call silently fired twice on every visit. Replaced with a real `useEffect`.
6. **No 401 handling on the frontend** — an expired/invalid token surfaced as a raw error on whatever screen the user was on, with no path back to login. Added an axios response interceptor that clears the token and redirects to `/login` on 401.
7. **Dead/broken code in `DashboardPage`** — an unused `load()` function issued a GET to `/api/upload` (wrong verb, wrong purpose) and did nothing with the result. Removed.
8. **Route param parsed via `location.pathname.split("/")` instead of `useParams()`** — worked but was fragile and would fail silently if the route path ever changed shape. Switched to `useParams()`.

9. **Time-series charts were sorted wrong** — `aggregate()` always sorted results by value (descending), which is correct for bar/pie ranking but scrambles a "sales over time" line chart into value-order instead of chronological order. Datetime x-columns now sort chronologically.
10. **AI/rule-based chart suggestions were computed but never shown** — the backend returned a `suggestions` list on every upload, but the frontend never rendered it and never passed it to the dashboard screen, so the feature was dead weight. Suggestions now appear as clickable chips on the upload screen and as one-click "Quick start" buttons on the dashboard screen that auto-fill the X/Y columns and generate the chart.

11. **No navigation link to the "Saved dashboards" page** — the `/saved` route existed and worked, but nothing in the header linked to it; it was only reachable by typing the URL directly. Added a "Saved" link next to "New dataset".
12. **Saved dashboard cards were dead ends** — they displayed a name and date but had no click handler or link, so a saved dashboard could never be reopened. Cards are now clickable and route to the correct dataset's dashboard view (via `dashboard.dataset_id`, not `dashboard.id` — the dashboard view is keyed by dataset, not by the saved-dashboard record).
13. **Delete dashboard was wired in the API client but never used** — `dashboards.remove()` existed in `api.ts` and the backend `DELETE /api/dashboards/{id}` worked, but no UI ever called it. Added a delete button (with confirmation) on each saved dashboard card.

## License
[MIT](LICENSE)