<div align="center">

# 📊 DataViz

**Upload a CSV or JSON file. Get an interactive dashboard in seconds.**

AI-powered chart suggestions · Multi-chart dashboards · JWT Auth · Export to PNG & CSV

<br/>

<!-- Backend -->
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-%23009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-%233776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![MySQL](https://img.shields.io/badge/MySQL-8-%234479A1?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com)
[![Redis](https://img.shields.io/badge/Redis-5-%23DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Celery](https://img.shields.io/badge/Celery-5.4-%2337814A?style=flat-square&logo=celery&logoColor=white)](https://docs.celeryq.dev)

<!-- Frontend -->
[![React](https://img.shields.io/badge/React-18-%2361DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-%233178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-%23646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-%2306B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Recharts](https://img.shields.io/badge/Recharts-2.15-%238884d8?style=flat-square)](https://recharts.org)

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-%23F59E0B?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-%2337814A?style=flat-square)](https://github.com/abdullahamin-ai/Data-Viz/pulls)

</div>

---

## ✨ Features

- 📂 **CSV & JSON Upload** — drag-and-drop any structured file up to 25 MB
- 🔍 **Auto Column Detection** — numeric, categorical, datetime, and text columns detected automatically on upload — no manual tagging
- 🤖 **AI Chart Suggestions** — Ollama (LLaMA 3.2) recommends the best chart type for your data; falls back to rule-based logic if Ollama is unavailable
- 🎛️ **Interactive Dashboard Builder** — choose X/Y axes, aggregation (sum / avg / count), and chart type; add as many charts as needed to one dashboard
- 📊 **4 Chart Types** — Bar, Line, Area, and Donut — each with its own color from a curated palette
- 💾 **Saved Dashboards** — persist any dashboard and reopen it fully rebuilt from live data
- 📤 **Export Anywhere** — download any chart as a PNG or export its data as a CSV
- 🔐 **JWT Authentication** — signup, login, and strict per-user data isolation
- ⚡ **Background Processing** — Celery + Redis handle heavy file processing off-request
- 📖 **Auto API Docs** — Swagger UI at `/docs` out of the box

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
┌─────────────┐     HTTP      ┌──────────────────────────┐
│  React 18   │◄────────────►│   FastAPI + Uvicorn       │
│  :5173      │              │   :8000                   │
└─────────────┘              └────────┬──────────────────┘
                                      │
               ┌──────────────────────┼──────────────────┐
               │                      │                  │
         ┌─────▼──────┐        ┌──────▼─────┐    ┌──────▼──────┐
         │  MySQL 8   │        │  Redis 5   │    │   Ollama    │
         │  :3306     │        │  :6379     │    │  LLaMA 3.2  │
         │  ORM:      │        │  Broker    │    │  :11434     │
         │  SQLAlchemy│        └──────┬─────┘    └─────────────┘
         └────────────┘               │          ↑ rule-based
                                ┌─────▼──────┐    fallback if
                                │  Celery    │    unavailable
                                │  5.4       │
                                │  Worker    │
                                └────────────┘
```

**Request flow:**
1. User uploads CSV/JSON → FastAPI parses columns instantly → returns metadata + AI suggestions
2. Celery picks up the processing task from Redis in the background
3. User picks X/Y axes + chart type → Recharts renders it in the browser
4. User saves dashboard → stored in MySQL → fully rebuildable anytime

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

> If Ollama is not installed the app falls back to rule-based suggestions automatically — everything still works.

---

### 1️⃣ MySQL

Install and start MySQL. The backend **creates the database automatically** on first run — no manual SQL needed.

### 2️⃣ Redis

Install Redis and start it on the default port `6379`.

### 3️⃣ Ollama *(optional)*

```bash
ollama pull llama3.2
```

### 4️⃣ Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux / macOS
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Windows
copy .env.example .env
# Linux / macOS
cp .env.example .env
```

Edit `.env` with your database credentials, then start the server:

```bash
uvicorn app.main:app --reload
```

> ✅ First startup auto-creates the database and runs `alembic upgrade head`
>
> 📖 Swagger API docs → **http://localhost:8000/docs**

### 5️⃣ Celery Worker

Open a **separate terminal** (with venv activated):

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

Open **http://localhost:5173** in your browser.

---

## 📂 Sample Dataset

A ready-to-use dataset is included at [`sample-data/sales-sample.csv`](sample-data/sales-sample.csv) — no need to find your own data to try the app.

It contains **25 rows** of product sales across regions, categories, and dates:

| Column | Type | What it triggers |
|--------|------|-----------------|
| `date` | DateTime | 📈 Line & Area chart |
| `region`, `category`, `product` | Categorical | 📊 Bar & 🍩 Donut chart |
| `sales`, `units`, `rating` | Numeric | Y-axis values |

After signing up, go to **New dataset**, upload the file, and all four chart types will be suggested automatically.

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
| `PUT` | `/api/dashboards/{id}` | ✅ | Update a saved dashboard |
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
Uploads are parsed synchronously so column metadata and AI suggestions return immediately. Celery handles deeper processing in the background for scalability.

**2. Multi-chart dashboard grid**
Each dashboard holds multiple independent charts side by side. Charts are stored as config (x / y / type) and rebuilt from live data on load — not as snapshots — so they always reflect the latest aggregation.

**3. Local AI, zero external cost**
Ollama (LLaMA 3.2) runs entirely on your machine. No API keys, no data sent to third parties. If Ollama is offline, rule-based fallback kicks in silently.

**4. Per-user data isolation**
Every dataset and dashboard is scoped to the authenticated user's JWT. No cross-user data is ever accessible.

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

## 📄 License

[MIT](LICENSE) — free to use, modify, and distribute.
