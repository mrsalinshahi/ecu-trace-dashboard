"""
Analysis engine: runs rule-based checks and statistical anomaly detection
over a set of parsed TraceRecordCreate objects, returning AnalysisResultCreate items.
"""

from collections import defaultdict

import numpy as np

from app.models.analysis_result import CheckType, Severity
from app.schemas.analysis_result import AnalysisResultCreate
from app.schemas.trace_record import TraceRecordCreate
from app.utils.analysis.rules import SIGNAL_RULES


def run_analysis(
    run_id: int, records: list[TraceRecordCreate]
) -> list[AnalysisResultCreate]:
    results: list[AnalysisResultCreate] = []

    # Group records by signal name
    by_signal: dict[str, list[TraceRecordCreate]] = defaultdict(list)
    for rec in records:
        by_signal[rec.signal_name].append(rec)

    for signal_name, signal_records in by_signal.items():
        signal_records.sort(key=lambda r: r.timestamp_ms)
        numeric = [r for r in signal_records if r.value is not None]
        values = np.array([r.value for r in numeric], dtype=float)

        results.extend(_check_ranges(run_id, signal_name, numeric, values))
        results.extend(_check_timing(run_id, signal_name, signal_records))
        if len(values) >= 5:
            results.extend(_check_statistics(run_id, signal_name, values))
            results.extend(_detect_anomalies(run_id, signal_name, numeric, values))

    return results


def _check_ranges(
    run_id: int,
    signal_name: str,
    records: list[TraceRecordCreate],
    values: np.ndarray,
) -> list[AnalysisResultCreate]:
    results = []
    rule = SIGNAL_RULES.get(signal_name)
    if rule is None or len(values) == 0:
        return results

    for rec in records:
        if rec.value is None:
            continue
        if rule.min_value is not None and rec.value < rule.min_value:
            results.append(
                AnalysisResultCreate(
                    test_run_id=run_id,
                    check_type=CheckType.RANGE_VIOLATION,
                    severity=Severity.ERROR,
                    signal_name=signal_name,
                    message=(
                        f"{signal_name} value {rec.value:.3f} {rule.unit} "
                        f"is below minimum {rule.min_value} {rule.unit}"
                    ),
                    timestamp_ms=rec.timestamp_ms,
                    value=rec.value,
                    threshold_min=rule.min_value,
                    threshold_max=rule.max_value,
                )
            )
        if rule.max_value is not None and rec.value > rule.max_value:
            results.append(
                AnalysisResultCreate(
                    test_run_id=run_id,
                    check_type=CheckType.RANGE_VIOLATION,
                    severity=Severity.CRITICAL,
                    signal_name=signal_name,
                    message=(
                        f"{signal_name} value {rec.value:.3f} {rule.unit} "
                        f"exceeds maximum {rule.max_value} {rule.unit}"
                    ),
                    timestamp_ms=rec.timestamp_ms,
                    value=rec.value,
                    threshold_min=rule.min_value,
                    threshold_max=rule.max_value,
                )
            )
    return results


def _check_timing(
    run_id: int,
    signal_name: str,
    records: list[TraceRecordCreate],
) -> list[AnalysisResultCreate]:
    results = []
    rule = SIGNAL_RULES.get(signal_name)
    if rule is None or rule.max_gap_ms is None or len(records) < 2:
        return results

    for i in range(1, len(records)):
        gap = records[i].timestamp_ms - records[i - 1].timestamp_ms
        if gap > rule.max_gap_ms:
            results.append(
                AnalysisResultCreate(
                    test_run_id=run_id,
                    check_type=CheckType.TIMING_VIOLATION,
                    severity=Severity.WARNING,
                    signal_name=signal_name,
                    message=(
                        f"{signal_name}: gap of {gap:.1f} ms between samples "
                        f"exceeds limit of {rule.max_gap_ms} ms"
                    ),
                    timestamp_ms=records[i].timestamp_ms,
                    value=gap,
                    threshold_max=rule.max_gap_ms,
                )
            )
    return results


def _check_statistics(
    run_id: int,
    signal_name: str,
    values: np.ndarray,
) -> list[AnalysisResultCreate]:
    mean = float(np.mean(values))
    std = float(np.std(values))
    vmin = float(np.min(values))
    vmax = float(np.max(values))

    return [
        AnalysisResultCreate(
            test_run_id=run_id,
            check_type=CheckType.STATISTICS,
            severity=Severity.INFO,
            signal_name=signal_name,
            message=(
                f"{signal_name} statistics: mean={mean:.3f}, "
                f"std={std:.3f}, min={vmin:.3f}, max={vmax:.3f}"
            ),
            stat_mean=mean,
            stat_std=std,
            stat_min=vmin,
            stat_max=vmax,
        )
    ]


def _detect_anomalies(
    run_id: int,
    signal_name: str,
    records: list[TraceRecordCreate],
    values: np.ndarray,
) -> list[AnalysisResultCreate]:
    """Z-score anomaly detection: flag samples more than 3σ from the mean."""
    results = []
    mean = np.mean(values)
    std = np.std(values)
    if std == 0:
        return results

    z_scores = np.abs((values - mean) / std)
    for i, (rec, z) in enumerate(zip(records, z_scores)):
        if z > 3.0:
            results.append(
                AnalysisResultCreate(
                    test_run_id=run_id,
                    check_type=CheckType.ANOMALY,
                    severity=Severity.WARNING,
                    signal_name=signal_name,
                    message=(
                        f"{signal_name}: anomalous value {rec.value:.3f} "
                        f"(z-score={z:.2f}) at {rec.timestamp_ms:.1f} ms"
                    ),
                    timestamp_ms=rec.timestamp_ms,
                    value=rec.value,
                    stat_mean=float(mean),
                    stat_std=float(std),
                )
            )
    return results
