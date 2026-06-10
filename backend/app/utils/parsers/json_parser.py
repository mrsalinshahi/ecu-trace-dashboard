"""
JSON trace file parser.
Expects either a flat list of records or { "records": [...] }.
Each record: { "timestamp": float, "signal_name": str, "value": float, ... }
"""

import json

from app.schemas.trace_record import TraceRecordCreate


def parse_json(content: bytes, run_id: int) -> list[TraceRecordCreate]:
    data = json.loads(content.decode("utf-8"))

    if isinstance(data, dict) and "records" in data:
        raw_records = data["records"]
    elif isinstance(data, list):
        raw_records = data
    else:
        raise ValueError("JSON must be a list of records or {\"records\": [...]}")

    records: list[TraceRecordCreate] = []
    for i, item in enumerate(raw_records):
        if "timestamp" not in item or "signal_name" not in item:
            raise ValueError(f"Record #{i} missing 'timestamp' or 'signal_name'")

        ts = float(item["timestamp"])
        if ts < 1e6:
            ts *= 1000.0

        records.append(
            TraceRecordCreate(
                test_run_id=run_id,
                timestamp_ms=ts,
                signal_name=str(item["signal_name"]),
                value=_safe_float(item.get("value")),
                raw_value=str(item.get("value", "")) or None,
                unit=item.get("unit"),
                bus_channel=item.get("bus_channel"),
                message_id=item.get("message_id"),
                raw_data=json.dumps(item),
            )
        )
    return records


def _safe_float(val) -> float | None:
    try:
        return float(val)
    except (TypeError, ValueError):
        return None
