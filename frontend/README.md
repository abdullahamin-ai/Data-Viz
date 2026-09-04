# Frontend — Data Visualization SaaS

React + TypeScript app: upload flow, chart config, dashboards, auth.

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- Recharts (chart rendering)
- Framer Motion (animation)
- React Router

## Setup
```bash
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/macOS
npm run dev
```
Open the URL Vite prints in the terminal. Requires the backend running (see `../backend/README.md`) at the URL set in `VITE_API_BASE_URL`.

## Project layout
```
src/
├── App.tsx         # routes, pages (landing, auth, upload, dashboard, saved)
├── components.tsx  # shared UI primitives (Field, Button, Card, Modal, UserMenu, ...)
├── charts.tsx       # Recharts wrappers (bar/line/area/donut)
├── api.ts           # backend API client
├── context.tsx       # auth context/provider
├── toast.tsx         # toast notifications
├── export.ts          # chart CSV/PNG export
└── types.ts            # shared TS types
```

## Build
```bash
npm run build
```
Output goes to `dist/`.

See the [root README](../README.md) for full project setup (backend, sample data, license).