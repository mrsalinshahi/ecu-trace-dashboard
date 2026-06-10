from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud
from app.crud.analysis_result import get_analysis_summary
from app.crud.trace_record import get_unique_signals
from app.database import get_db
from app.models.analysis_result import Severity
from app.schemas.analysis_result import AnalysisResultRead

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get("/{run_id}", response_model=list[AnalysisResultRead])
def get_analysis(
    run_id: int,
    severity: Severity | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=2000),
    db: Session = Depends(get_db),
):
    run = crud.get_test_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")
    return crud.get_analysis_results(db, run_id, severity=severity, skip=skip, limit=limit)


@router.get("/{run_id}/summary")
def get_summary(run_id: int, db: Session = Depends(get_db)):
    run = crud.get_test_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")

    summary = get_analysis_summary(db, run_id)
    signals = get_unique_signals(db, run_id)
    return {
        "run_id": run_id,
        "filename": run.filename,
        "status": run.status,
        "record_count": run.record_count,
        "duration_ms": run.duration_ms,
        "signals": signals,
        "severity_counts": summary,
    }
