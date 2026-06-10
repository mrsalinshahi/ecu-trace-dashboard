from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.analysis_result import CheckType, Severity


class AnalysisResultCreate(BaseModel):
    test_run_id: int
    check_type: CheckType
    severity: Severity
    signal_name: str | None = None
    message: str
    timestamp_ms: float | None = None
    value: float | None = None
    threshold_min: float | None = None
    threshold_max: float | None = None
    stat_mean: float | None = None
    stat_std: float | None = None
    stat_min: float | None = None
    stat_max: float | None = None


class AnalysisResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    test_run_id: int
    check_type: CheckType
    severity: Severity
    signal_name: str | None
    message: str
    timestamp_ms: float | None
    value: float | None
    threshold_min: float | None
    threshold_max: float | None
    stat_mean: float | None
    stat_std: float | None
    stat_min: float | None
    stat_max: float | None
    created_at: datetime
