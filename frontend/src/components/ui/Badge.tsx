import type { CheckType, RunStatus, Severity } from "../../types";

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`badge-${severity}`}>{severity}</span>;
}

export function StatusBadge({ status }: { status: RunStatus }) {
  return <span className={`badge-${status}`}>{status}</span>;
}

export function CheckTypeBadge({ type }: { type: CheckType }) {
  const labels: Record<CheckType, string> = {
    range_violation: "Range",
    timing_violation: "Timing",
    missing_signal: "Missing",
    anomaly: "Anomaly",
    statistics: "Stats",
  };
  return (
    <span className="badge bg-slate-700/50 text-slate-300 border border-slate-600/30">
      {labels[type]}
    </span>
  );
}
