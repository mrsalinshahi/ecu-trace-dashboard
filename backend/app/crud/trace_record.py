from sqlalchemy.orm import Session

from app.models.trace_record import TraceRecord
from app.schemas.trace_record import TraceRecordCreate


def bulk_create_trace_records(
    db: Session, records: list[TraceRecordCreate]
) -> list[TraceRecord]:
    db_records = [TraceRecord(**r.model_dump()) for r in records]
    db.add_all(db_records)
    db.commit()
    return db_records


def get_trace_records(
    db: Session,
    run_id: int,
    signal_name: str | None = None,
    skip: int = 0,
    limit: int = 1000,
) -> list[TraceRecord]:
    query = db.query(TraceRecord).filter(TraceRecord.test_run_id == run_id)
    if signal_name:
        query = query.filter(TraceRecord.signal_name == signal_name)
    return query.order_by(TraceRecord.timestamp_ms).offset(skip).limit(limit).all()


def get_unique_signals(db: Session, run_id: int) -> list[str]:
    rows = (
        db.query(TraceRecord.signal_name)
        .filter(TraceRecord.test_run_id == run_id)
        .distinct()
        .all()
    )
    return [r[0] for r in rows]
