from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.analysis_result import get_dashboard_stats
from app.database import get_db
from app.models.test_run import RunStatus, TestRun
from app.models.analysis_result import AnalysisResult, CheckType

router = APIRouter(prefix="/dashboard-stats", tags=["dashboard"])


@router.get("")
def dashboard_stats(db: Session = Depends(get_db)):
    stats = get_dashboard_stats(db)

    # Recent test runs (last 7)
    recent = (
        db.query(TestRun)
        .order_by(TestRun.created_at.desc())
        .limit(7)
        .all()
    )

    # Issue breakdown by check type
    from sqlalchemy import func

    type_counts = (
        db.query(AnalysisResult.check_type, func.count(AnalysisResult.id))
        .group_by(AnalysisResult.check_type)
        .all()
    )

    # Status distribution
    status_counts = (
        db.query(TestRun.status, func.count(TestRun.id))
        .group_by(TestRun.status)
        .all()
    )

    return {
        **stats,
        "recent_runs": [
            {
                "id": r.id,
                "filename": r.filename,
                "status": r.status,
                "record_count": r.record_count,
                "created_at": r.created_at.isoformat(),
            }
            for r in recent
        ],
        "issue_by_type": {ct: c for ct, c in type_counts},
        "status_distribution": {st: c for st, c in status_counts},
    }
