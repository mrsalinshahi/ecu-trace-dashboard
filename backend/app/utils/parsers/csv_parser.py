"""
CSV trace file parser.
Expected columns: timestamp, signal_name, value, unit, bus_channel, message_id
Timestamp column may be in seconds (float) or milliseconds (int).
"""

import io

import pandas as pd

from app.schemas.trace_record import TraceRecordCreate


def parse_csv(content: bytes, run_id: int) -> list[TraceRecordCreate]:
    df = pd.read_csv(io.BytesIO(content))
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    _require_columns(df, ["timestamp", "signal_name"])

    # Normalise timestamp to milliseconds
    if df["timestamp"].max() < 1e6:
        df["timestamp"] = df["timestamp"] * 1000.0

    records: list[TraceRecordCreate] = []
    for _, row in df.iterrows():
        records.append(
            TraceRecordCreate(
                test_run_id=run_id,
                timestamp_ms=float(row["timestamp"]),
                signal_name=str(row["signal_name"]),
                value=_safe_float(row.get("value")),
                raw_value=str(row.get("value", "")) or None,
                unit=str(row["unit"]) if "unit" in df.columns and pd.notna(row.get("unit")) else None,
                bus_channel=str(row["bus_channel"]) if "bus_channel" in df.columns and pd.notna(row.get("bus_channel")) else None,
                message_id=str(row["message_id"]) if "message_id" in df.columns and pd.notna(row.get("message_id")) else None,
            )
        )
    return records


def _require_columns(df: pd.DataFrame, cols: list[str]) -> None:
    missing = [c for c in cols if c not in df.columns]
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")


def _safe_float(val) -> float | None:
    try:
        return float(val)
    except (TypeError, ValueError):
        return None
