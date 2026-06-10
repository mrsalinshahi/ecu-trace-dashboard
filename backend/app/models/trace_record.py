from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TraceRecord(Base):
    __tablename__ = "trace_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    test_run_id: Mapped[int] = mapped_column(
        ForeignKey("test_runs.id"), nullable=False, index=True
    )
    timestamp_ms: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    signal_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    value: Mapped[float | None] = mapped_column(Float, nullable=True)
    raw_value: Mapped[str | None] = mapped_column(String(255), nullable=True)
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    bus_channel: Mapped[str | None] = mapped_column(String(50), nullable=True)
    message_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    raw_data: Mapped[str | None] = mapped_column(Text, nullable=True)

    test_run: Mapped["TestRun"] = relationship(back_populates="trace_records")
