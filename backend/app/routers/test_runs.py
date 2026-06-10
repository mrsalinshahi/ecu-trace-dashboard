from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas.test_run import TestRunRead, TestRunSummary
from app.schemas.trace_record import TraceRecordRead

router = APIRouter(prefix="/test-runs", tags=["test-runs"])


@router.get("", response_model=list[TestRunSummary])
def list_test_runs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return crud.get_test_runs(db, skip=skip, limit=limit)


@router.get("/{run_id}", response_model=TestRunRead)
def get_test_run(run_id: int, db: Session = Depends(get_db)):
    run = crud.get_test_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")
    return run


@router.get("/{run_id}/records", response_model=list[TraceRecordRead])
def get_records(
    run_id: int,
    signal_name: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    run = crud.get_test_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")
    return crud.get_trace_records(db, run_id, signal_name=signal_name, skip=skip, limit=limit)
