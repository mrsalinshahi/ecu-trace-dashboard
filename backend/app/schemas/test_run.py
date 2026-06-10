from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.test_run import FileType, RunStatus


class TestRunCreate(BaseModel):
    filename: str
    file_type: FileType
    description: str | None = None


class TestRunRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    file_type: FileType
    status: RunStatus
    description: str | None
    record_count: int
    duration_ms: float | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime


class TestRunSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    file_type: FileType
    status: RunStatus
    record_count: int
    duration_ms: float | None
    created_at: datetime
