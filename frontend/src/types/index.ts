export type FileType = "csv" | "json" | "asc";
export type RunStatus = "pending" | "processing" | "completed" | "failed";
export type Severity = "info" | "warning" | "error" | "critical";
export type CheckType =
  | "range_violation"
  | "timing_violation"
  | "missing_signal"
  | "anomaly"
  | "statistics";

export interface TestRunSummary {
  id: number;
  filename: string;
  file_type: FileType;
  status: RunStatus;
  record_count: number;
  duration_ms: number | null;
  created_at: string;
}

export interface TestRunDetail extends TestRunSummary {
  description: string | null;
  error_message: string | null;
  updated_at: string;
}

export interface TraceRecord {
  id: number;
  test_run_id: number;
  timestamp_ms: number;
  signal_name: string;
  value: number | null;
  raw_value: string | null;
  unit: string | null;
  bus_channel: string | null;
  message_id: string | null;
}

export interface AnalysisResult {
  id: number;
  test_run_id: number;
  check_type: CheckType;
  severity: Severity;
  signal_name: string | null;
  message: string;
  timestamp_ms: number | null;
  value: number | null;
  threshold_min: number | null;
  threshold_max: number | null;
  stat_mean: number | null;
  stat_std: number | null;
  stat_min: number | null;
  stat_max: number | null;
  created_at: string;
}

export interface AnalysisSummary {
  run_id: number;
  filename: string;
  status: RunStatus;
  record_count: number;
  duration_ms: number | null;
  signals: string[];
  severity_counts: Partial<Record<Severity, number>>;
}

export interface DashboardStats {
  total_runs: number;
  completed_runs: number;
  total_records: number;
  total_issues: number;
  critical_issues: number;
  recent_runs: Array<{
    id: number;
    filename: string;
    status: RunStatus;
    record_count: number;
    created_at: string;
  }>;
  issue_by_type: Partial<Record<CheckType, number>>;
  status_distribution: Partial<Record<RunStatus, number>>;
}
