# ECU Trace Dashboard

A production-ready full-stack web application for uploading, parsing, and analysing ECU (Engine Control Unit) test trace files — built to demonstrate skills relevant to automotive testing tools such as **ecu.test**, **trace.check**, and **test.guide**.

---

## Overview

ECU test engineers generate large volumes of signal data during validation runs. This dashboard provides:

- **File Upload** — drag-and-drop CSV, JSON, or ASC (Vector CANalyzer) trace files
- **Automated Analysis** — rule-based range checks, timing violation detection, and z-score anomaly detection
- **Interactive Visualisations** — signal time-series charts, severity distributions, issue breakdowns
- **Searchable Reports** — filterable findings table with per-signal drill-down

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI 0.111, Python 3.11+, SQLAlchemy 2.0, Alembic, Pydantic v2 |
| **Database** | PostgreSQL 16 |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS 3 |
| **Charts** | Recharts |
| **Container** | Docker + Docker Compose |

---

## Project Structure

```
ecu-trace-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, lifespan
│   │   ├── config.py            # Pydantic-settings configuration
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── models/              # ORM models (TestRun, TraceRecord, AnalysisResult)
│   │   ├── schemas/             # Pydantic v2 request/response schemas
│   │   ├── routers/             # API endpoints (upload, test-runs, analysis, dashboard)
│   │   ├── crud/                # Database access layer
│   │   └── utils/
│   │       ├── parsers/         # CSV, JSON, ASC file parsers
│   │       └── analysis/        # Rule engine + statistical anomaly detection
│   ├── alembic/                 # Database migrations
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/client.ts        # Axios API client
│       ├── types/index.ts       # TypeScript interfaces
│       ├── components/          # Layout, Sidebar, charts, UI primitives
│       └── pages/               # Dashboard, UploadTrace, TestRuns, AnalysisDetail
├── data/                        # Sample trace files (CSV, JSON, ASC)
└── docker-compose.yml
```

---

## Quick Start

### Option A — Docker Compose (recommended)

```bash
git clone <repo-url>
cd ecu-trace-dashboard
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs

### Option B — Local development

**Prerequisites:** Python 3.11+, Node 20+, PostgreSQL 16

```bash
# 1. Start PostgreSQL
createdb ecu_trace

# 2. Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit DATABASE_URL if needed
alembic upgrade head
uvicorn app.main:app --reload

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload-trace` | Upload and parse a trace file |
| `GET` | `/test-runs` | List all test runs (paginated) |
| `GET` | `/test-runs/{id}` | Get a single test run |
| `GET` | `/test-runs/{id}/records` | Get raw trace records (filterable by signal) |
| `GET` | `/analysis/{id}` | Get analysis findings (filterable by severity) |
| `GET` | `/analysis/{id}/summary` | Get run summary + signal list |
| `GET` | `/dashboard-stats` | Aggregate stats for the dashboard |
| `GET` | `/health` | Health check |

Full interactive docs available at `/docs` (Swagger UI) or `/redoc`.

---

## Analysis Engine

### Rule-Based Checks

Signal rules are defined in `backend/app/utils/analysis/rules.py` and cover:

| Signal | Valid Range | Max Gap |
|---|---|---|
| EngineRPM | 0 – 8000 rpm | 50 ms |
| VehicleSpeed | 0 – 300 km/h | 100 ms |
| BatteryVoltage | 9.0 – 16.0 V | 200 ms |
| CoolantTemp | -40 – 130 °C | 500 ms |
| ThrottlePos | 0 – 100 % | 20 ms |
| BrakePressure | 0 – 200 bar | 20 ms |
| … and 9 more | | |

**Range violations** → `ERROR` (below min) or `CRITICAL` (above max)
**Timing violations** → `WARNING` when sample gap exceeds the limit

### Statistical Analysis

For every signal with ≥5 samples:
- Computes mean, standard deviation, min, max → stored as `INFO` finding
- **Z-score anomaly detection** (threshold: |z| > 3.0) → `WARNING` finding per anomalous sample

---

## Supported File Formats

### CSV
```
timestamp,signal_name,value,unit,bus_channel,message_id
0.000,EngineRPM,800.0,rpm,CAN1,0x0C0
```
Timestamp in seconds (auto-detected) or milliseconds.

### JSON
```json
{
  "records": [
    {"timestamp": 0.0, "signal_name": "EngineRPM", "value": 800, "unit": "rpm"}
  ]
}
```

### ASC (Vector CANalyzer)
Standard CAN bus ASCII log format. Each frame is decoded as `CAN_<MSG_ID>` signal.

---

## Sample Data

Three sample trace files are included in `/data/`:

| File | Description | Signals |
|---|---|---|
| `sample_trace.csv` | Full acceleration and braking event | EngineRPM, VehicleSpeed, ThrottlePos, BrakePressure, BatteryVoltage, CoolantTemp |
| `sample_trace.json` | ECU cold-start + idle stability test | EngineRPM, CoolantTemp, BatteryVoltage, ThrottlePos, OilPressure |
| `sample_trace.asc` | CAN bus log — highway cruise + braking | CAN frame signals |

Each file contains intentional anomalies (over-rev, low voltage) to demonstrate the analysis engine.

---

## Database Schema

```
test_runs
  id, filename, file_type, status, description,
  record_count, duration_ms, error_message, created_at, updated_at

trace_records
  id, test_run_id → test_runs, timestamp_ms, signal_name,
  value, raw_value, unit, bus_channel, message_id, raw_data

analysis_results
  id, test_run_id → test_runs, check_type, severity,
  signal_name, message, timestamp_ms, value,
  threshold_min, threshold_max,
  stat_mean, stat_std, stat_min, stat_max, created_at
```

---

## Relevance to Automotive Testing

This project directly mirrors the domain of tools like **ecu.test**, **trace.check**, and **test.guide**:

- **Trace file ingestion** — the same challenge faced when importing MDF, BLF, or ASC logs
- **Signal validation** — parametric rule checks analogous to test.guide verdict evaluation
- **Anomaly reporting** — structured findings with severity levels, mirroring trace.check's report model
- **REST API design** — clean separation of concerns that would integrate with CI/CD pipelines and test management systems

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/ecu_trace` | PostgreSQL connection string |
| `UPLOAD_DIR` | `uploads` | Directory for uploaded files |
| `MAX_FILE_SIZE_MB` | `50` | Maximum upload size |

---

## License

MIT
