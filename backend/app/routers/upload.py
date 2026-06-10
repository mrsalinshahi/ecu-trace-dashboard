import time
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app import crud
from app.config import settings
from app.database import get_db
from app.models.test_run import FileType, RunStatus
from app.schemas.test_run import TestRunCreate, TestRunRead
from app.utils.analysis import run_analysis
from app.utils.parsers import parse_asc, parse_csv, parse_json

router = APIRouter(prefix="/upload-trace", tags=["upload"])

_PARSERS = {
    "csv": parse_csv,
    "json": parse_json,
    "asc": parse_asc,
}

_MAX_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


@router.post("", response_model=TestRunRead, status_code=201)
async def upload_trace(
    file: UploadFile = File(...),
    description: str | None = Form(None),
    db: Session = Depends(get_db),
):
    filename = file.filename or "unknown"
    suffix = Path(filename).suffix.lstrip(".").lower()

    if suffix not in _PARSERS:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '.{suffix}'. Allowed: csv, json, asc",
        )

    content = await file.read()
    if len(content) > _MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum size of {settings.MAX_FILE_SIZE_MB} MB",
        )

    run = crud.create_test_run(
        db,
        TestRunCreate(
            filename=filename,
            file_type=FileType(suffix),
            description=description,
        ),
    )

    start = time.perf_counter()
    try:
        records = _PARSERS[suffix](content, run.id)
        crud.bulk_create_trace_records(db, records)

        analysis_results = run_analysis(run.id, records)
        if analysis_results:
            crud.bulk_create_analysis_results(db, analysis_results)

        elapsed_ms = (time.perf_counter() - start) * 1000
        crud.update_test_run_status(
            db,
            run,
            RunStatus.COMPLETED,
            record_count=len(records),
            duration_ms=elapsed_ms,
        )
    except Exception as exc:
        crud.update_test_run_status(
            db, run, RunStatus.FAILED, error_message=str(exc)
        )
        raise HTTPException(status_code=422, detail=str(exc))

    db.refresh(run)
    return run
