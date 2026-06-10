from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import analysis, dashboard, test_runs, upload


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (Alembic handles migrations in production)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="ECU Trace Dashboard API",
    description=(
        "REST API for uploading and analyzing ECU test trace files. "
        "Supports CSV, JSON, and ASC (Vector CANalyzer) formats."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(test_runs.router)
app.include_router(analysis.router)
app.include_router(dashboard.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "version": "1.0.0"}
