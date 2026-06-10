from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.analysis_result import AnalysisResult, Severity
from app.schemas.analysis_result import AnalysisResultCreate


def bulk_create_analysis_results(
    db: Session, results: list[AnalysisResultCreate]
) -> list[AnalysisResult]:
    db_results = [AnalysisResult(**r.model_dump()) for r in results]
    db.add_all(db_results)
    db.commit()
    return db_results


def get_analysis_results(
    db: Session,
    run_id: int,
    severity: Severity | None = None,
    skip: int = 0,
    limit: int = 500,
) -> list[AnalysisResult]:
    query = db.query(AnalysisResult).filter(AnalysisResult.test_run_id == run_id)
    if severity:
        query = query.filter(AnalysisResult.severity == severity)
    return (
        query.order_by(AnalysisResult.severity.desc(), AnalysisResult.created_at)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_analysis_summary(db: Session, run_id: int) -> dict:
    rows = (
        db.query(AnalysisResult.severity, func.count(AnalysisResult.id))
        .filter(AnalysisResult.test_run_id == run_id)
        .group_by(AnalysisResult.severity)
        .all()
    )
    return {severity: count for severity, count in rows}


def get_dashboard_stats(db: Session) -> dict:
    from app.models.test_run import RunStatus, TestRun

    total_runs = db.query(func.count(TestRun.id)).scalar()
    completed_runs = (
        db.query(func.count(TestRun.id))
        .filter(TestRun.status == RunStatus.COMPLETED)
        .scalar()
    )
    total_records = db.query(func.sum(TestRun.record_count)).scalar() or 0
    total_issues = db.query(func.count(AnalysisResult.id)).scalar()
    critical_issues = (
        db.query(func.count(AnalysisResult.id))
        .filter(AnalysisResult.severity == Severity.CRITICAL)
        .scalar()
    )

    return {
        "total_runs": total_runs,
        "completed_runs": completed_runs,
        "total_records": total_records,
        "total_issues": total_issues,
        "critical_issues": critical_issues,
    }
