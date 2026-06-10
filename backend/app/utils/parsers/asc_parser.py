"""
ASC (ASCII log) file parser — Vector CANalyzer / CANdb++ format.

Format example:
  date Mon Jan 01 12:00:00 2024
     0.000000 1  001             Rx   d 8 11 22 33 44 55 66 77 88
     0.001234 1  002             Rx   d 4 AA BB CC DD

Each CAN frame is decoded into a signal: message ID becomes the signal name.
The first data byte is interpreted as the numeric value for demonstration.
"""

import re

from app.schemas.trace_record import TraceRecordCreate

_FRAME_RE = re.compile(
    r"^\s*(?P<ts>\d+\.\d+)\s+"          # timestamp (seconds)
    r"(?P<ch>\d+)\s+"                    # channel
    r"(?P<mid>[0-9A-Fa-fXx]+)\s+"       # message ID (hex)
    r"(?:Rx|Tx)\s+"                      # direction
    r"d\s+(?P<dlc>\d+)\s+"              # DLC
    r"(?P<data>[0-9A-Fa-f ]+)$"         # data bytes
)


def parse_asc(content: bytes, run_id: int) -> list[TraceRecordCreate]:
    text = content.decode("utf-8", errors="replace")
    records: list[TraceRecordCreate] = []

    for line in text.splitlines():
        match = _FRAME_RE.match(line)
        if not match:
            continue

        ts_s = float(match.group("ts"))
        channel = match.group("ch")
        msg_id = match.group("mid").upper()
        data_bytes = match.group("data").split()

        # Use first byte as a simple scalar value for analysis
        value: float | None = None
        if data_bytes:
            try:
                value = int(data_bytes[0], 16)
            except ValueError:
                pass

        records.append(
            TraceRecordCreate(
                test_run_id=run_id,
                timestamp_ms=ts_s * 1000.0,
                signal_name=f"CAN_{msg_id}",
                value=value,
                raw_value=" ".join(data_bytes),
                bus_channel=f"CH{channel}",
                message_id=msg_id,
                raw_data=line.strip(),
            )
        )

    if not records:
        raise ValueError("No valid CAN frames found in ASC file.")

    return records
