from sqlalchemy.orm import Session

from app.models.test_run import RunStatus, TestRun
from app.schemas.test_run import TestRunCreate


def create_test_run(db: Session, data: TestRunCreate) -> TestRun:
    run = TestRun(**data.model_dump())
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def get_test_run(db: Session, run_id: int) -> TestRun | None:
    return db.get(TestRun, run_id)


def get_test_runs(db: Session, skip: int = 0, limit: int = 100) -> list[TestRun]:
    return (
        db.query(TestRun)
        .order_by(TestRun.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_test_run_status(
    db: Session,
    run: TestRun,
    status: RunStatus,
    record_count: int = 0,
    duration_ms: float | None = None,
    error_message: str | None = None,
) -> TestRun:
    run.status = status
    run.record_count = record_count
    if duration_ms is not None:
        run.duration_ms = duration_ms
    if error_message is not None:
        run.error_message = error_message
    db.commit()
    db.refresh(run)
    return run
