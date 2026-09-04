<div align="center">

<a href="https://github.com/abdullahamin-ai/Data-Viz">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:378ADD,50:7F77DD,100:1D9E75&height=200&section=header&text=DataViz&fontSize=60&fontColor=ffffff&fontAlignY=35&desc=Upload%20a%20CSV%20or%20JSON.%20Get%20a%20dashboard%20in%20seconds.&descAlignY=58&descSize=16&animation=fadeIn" width="100%"/>
</a>

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![Redis](https://img.shields.io/badge/Redis-5-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Celery](https://img.shields.io/badge/Celery-5.4-37814A?style=for-the-badge&logo=celery&logoColor=white)](https://docs.celeryq.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

</div>

---

## ✨ Features

- 📂 **CSV & JSON Upload** — drag-and-drop any structured file up to 25 MB
- 🔍 **Auto Column Detection** — numeric, categorical, datetime, and text columns detected automatically — no manual tagging
- 🤖 **AI Chart Suggestions** — Ollama (LLaMA 3.2) recommends the best chart type; falls back to rule-based logic if unavailable
- 🎛️ **Interactive Dashboard Builder** — pick X/Y axes, aggregation (sum / avg / count), and chart type; add as many charts as needed
- 📊 **4 Chart Types** — Bar, Line, Area, and Donut — each with a curated color palette
- 💾 **Saved Dashboards** — persist any dashboard and reopen it fully rebuilt from live data
- 📤 **Export Anywhere** — download any chart as PNG or export its data as CSV
- 🔐 **JWT Authentication** — signup, login, strict per-user data isolation
- ⚡ **Background Processing** — Celery + Redis handle heavy file processing off-request
- 📖 **Swagger UI** — interactive API docs at `/docs` out of the box

---

## 🛠️ Tech Stack

### Backend

| | Technology | Version | Role |
|---|---|---|---|
| ⚡ | **FastAPI** | 0.115 | REST API framework |
| 🦄 | **Uvicorn** | 0.30 | ASGI server |
| 🗄️ | **SQLAlchemy** | 2.0 | ORM |
| 🔄 | **Alembic** | 1.13 | Database migrations |
| 🐬 | **MySQL** | 8 | Primary database |
| 🌿 | **Celery** | 5.4 | Background job queue |
| 🔴 | **Redis** | 5 | Celery message broker |
| 🤖 | **Ollama (LLaMA 3.2)** | — | Local AI chart suggestions |
| 🔑 | **PyJWT + bcrypt** | 2.9 / 4.0 | Auth & password hashing |
| ✅ | **Pydantic v2** | 2.8 | Request / response validation |
| 🧪 | **Pytest** | 8 | Test suite |

### Frontend

| | Technology | Version | Role |
|---|---|---|---|
| ⚛️ | **React** | 18.3 | UI framework |
| 🔷 | **TypeScript** | 5.7 | Type safety |
| ⚡ | **Vite** | 6 | Build tool & dev server |
| 🎨 | **Tailwind CSS** | 3.4 | Utility-first styling |
| 📊 | **Recharts** | 2.15 | Bar, Line, Area, Donut charts |
| 🎬 | **Framer Motion** | 11 | Page transitions & animations |
| 🌐 | **Axios** | 1.7 | HTTP client with 401 interceptor |
| 🔀 | **React Router** | v7 | Client-side routing |
| 🖼️ | **Lucide React** | 0.468 | Icon set |

---

## 🏗️ Architecture

```
                        ┌─────────────────────────────────┐
                        │         React 18 + Vite          │
                        │   TypeScript · Tailwind · Axios  │
                        │          localhost:5173           │
                        └────────────┬────────────────────┘
                                     │ HTTP REST
                        ┌────────────▼────────────────────┐
                        │       FastAPI + Uvicorn          │
                        │  SQLAlchemy · Alembic · PyJWT   │
                        │  Pydantic v2 · bcrypt · Pytest  │
                        │          localhost:8000           │
                        └───┬──────────┬──────────┬───────┘
                            │          │          │
               ┌────────────▼──┐  ┌────▼────┐  ┌─▼──────────────┐
               │   MySQL 8     │  │ Redis 5 │  │ Ollama LLaMA3.2│
               │ SQLAlchemy ORM│  │ :6379   │  │ :11434         │
               │    :3306      │  └────┬────┘  │ rule-based     │
               └───────────────┘       │       │ fallback ✓     │
                                  ┌────▼────┐  └────────────────┘
                                  │ Celery  │
                                  │  5.4    │
                                  │ worker  │
                                  └─────────┘
```

**Request flow:**
1. User uploads CSV/JSON → FastAPI parses columns instantly → AI suggestions returned
2. Celery picks up processing task from Redis in the background
3. User selects X/Y axes + chart type → Recharts renders in the browser
4. User saves dashboard → stored in MySQL → rebuildable anytime

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Required |
|------|---------|----------|
| Python | 3.11+ | ✅ Yes |
| Node.js | 18+ | ✅ Yes |
| MySQL | 8+ | ✅ Yes |
| Redis | 5+ | ✅ Yes |
| Ollama | latest | ⚠️ Optional |

> If Ollama is not installed the app falls back to rule-based chart suggestions automatically.

### 1️⃣ MySQL

Install and start MySQL. The backend **creates the database automatically** on first run.

### 2️⃣ Redis

Install Redis and start it on default port `6379`.

### 3️⃣ Ollama *(optional)*

```bash
ollama pull llama3.2
```

### 4️⃣ Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt

# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

Edit `.env` with your database credentials, then:

```bash
uvicorn app.main:app --reload
```

> ✅ First startup auto-creates the database and runs `alembic upgrade head`
>
> 📖 Swagger docs → **http://localhost:8000/docs**

### 5️⃣ Celery Worker

Open a **separate terminal** (venv activated):

```bash
cd backend
celery -A app.workers.celery_app.celery_app worker --loglevel=info
```

### 6️⃣ Frontend

```bash
cd frontend
npm install

# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env

npm run dev
```

Open **http://localhost:5173**

---

## 📂 Sample Dataset

A ready-to-use dataset is included at [`sample-data/sales-sample.csv`](sample-data/sales-sample.csv) — no need to find your own data.

25 rows of product sales across regions, categories, and dates:

| Column | Type | Triggers |
|--------|------|---------|
| `date` | DateTime | 📈 Line & Area chart |
| `region`, `category`, `product` | Categorical | 📊 Bar & 🍩 Donut chart |
| `sales`, `units`, `rating` | Numeric | Y-axis values |

After signing up → **New dataset** → upload the file → all 4 chart types suggested instantly.

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT token |
| `POST` | `/api/upload` | ✅ | Upload CSV / JSON dataset |
| `GET` | `/api/upload/{dataset_id}` | ✅ | Get dataset info & suggestions |
| `GET` | `/api/chart-data/{dataset_id}` | ✅ | Fetch chart data (`?x=col&y=col&agg=sum`) |
| `POST` | `/api/dashboards` | ✅ | Save a dashboard |
| `GET` | `/api/dashboards` | ✅ | List all saved dashboards |
| `GET` | `/api/dashboards/{id}` | ✅ | Get a specific dashboard |
| `PUT` | `/api/dashboards/{id}` | ✅ | Update a dashboard |
| `DELETE` | `/api/dashboards/{id}` | ✅ | Delete a dashboard |
| `GET` | `/health` | ❌ | Health check |

Full interactive docs → **http://localhost:8000/docs**

---

## 🧪 Tests

```bash
cd backend
pytest -q
```

---

## 📋 Key Design Decisions

**1. In-request parsing for instant feedback**
Uploads are parsed synchronously so column metadata and AI suggestions return immediately. Celery handles deeper processing in the background.

**2. Multi-chart dashboard grid**
Charts are stored as config (x / y / type) and rebuilt from live data on load — not as snapshots — so they always reflect the latest aggregation.

**3. Local AI, zero external cost**
Ollama (LLaMA 3.2) runs entirely on your machine. No API keys, no data sent to third parties. Rule-based fallback kicks in silently if Ollama is offline.

**4. Per-user data isolation**
Every dataset and dashboard is scoped to the authenticated user's JWT.

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <img src="Images/Landing_Page.png" alt="Landing Page" width="100%"/>
      <br/><b>Landing Page</b>
    </td>
    <td align="center" width="50%">
      <img src="Images/Login_page .png" alt="Login" width="100%"/>
      <br/><b>Login</b>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="Images/Upload_Dashboard.png" alt="Upload & AI Suggestions" width="100%"/>
      <br/><b>Upload & AI Suggestions</b>
    </td>
    <td align="center" width="50%">
      <img src="Images/Dashboard.png" alt="Interactive Dashboard" width="100%"/>
      <br/><b>Interactive Dashboard</b>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="Images/Charts.png" alt="Charts View" width="100%"/>
      <br/><b>Charts View</b>
    </td>
    <td align="center" width="50%">
      <img src="Images/Saved_dashboard.png" alt="Saved Dashboards" width="100%"/>
      <br/><b>Saved Dashboards</b>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="Images/Swagger_UI.png" alt="Swagger API Docs" width="100%"/>
      <br/><b>Swagger API Docs</b>
    </td>
    <td align="center" width="50%">
      <img src="Images/Console_Preview.png" alt="Console Preview" width="100%"/>
      <br/><b>Console Preview</b>
    </td>
  </tr>
</table>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1D9E75,50:7F77DD,100:378ADD&height=100&section=footer" width="100%"/>

</div>
