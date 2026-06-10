from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Severity(str, PyEnum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class CheckType(str, PyEnum):
    RANGE_VIOLATION = "range_violation"
    TIMING_VIOLATION = "timing_violation"
    MISSING_SIGNAL = "missing_signal"
    ANOMALY = "anomaly"
    STATISTICS = "statistics"


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    test_run_id: Mapped[int] = mapped_column(
        ForeignKey("test_runs.id"), nullable=False, index=True
    )
    check_type: Mapped[CheckType] = mapped_column(Enum(CheckType), nullable=False)
    severity: Mapped[Severity] = mapped_column(Enum(Severity), nullable=False)
    signal_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    value: Mapped[float | None] = mapped_column(Float, nullable=True)
    threshold_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    threshold_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    stat_mean: Mapped[float | None] = mapped_column(Float, nullable=True)
    stat_std: Mapped[float | None] = mapped_column(Float, nullable=True)
    stat_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    stat_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    test_run: Mapped["TestRun"] = relationship(back_populates="analysis_results")
