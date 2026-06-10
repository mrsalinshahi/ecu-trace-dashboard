from pydantic import BaseModel, ConfigDict


class TraceRecordCreate(BaseModel):
    test_run_id: int
    timestamp_ms: float
    signal_name: str
    value: float | None = None
    raw_value: str | None = None
    unit: str | None = None
    bus_channel: str | None = None
    message_id: str | None = None
    raw_data: str | None = None


class TraceRecordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    test_run_id: int
    timestamp_ms: float
    signal_name: str
    value: float | None
    raw_value: str | None
    unit: str | None
    bus_channel: str | None
    message_id: str | None
