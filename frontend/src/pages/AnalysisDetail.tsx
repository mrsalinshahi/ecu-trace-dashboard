import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../api/client";
import type { AnalysisResult, AnalysisSummary, TraceRecord, Severity } from "../types";
import { Card } from "../components/ui/Card";
import { SeverityBadge, CheckTypeBadge, StatusBadge } from "../components/ui/Badge";
import { SignalChart } from "../components/charts/SignalChart";
import { SeverityPieChart } from "../components/charts/SeverityPieChart";

export function AnalysisDetail() {
  const { runId } = useParams<{ runId: string }>();
  const id = Number(runId);

  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [findings, setFindings] = useState<AnalysisResult[]>([]);
  const [records, setRecords] = useState<TraceRecord[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "">("");
  const [searchMsg, setSearchMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getAnalysisSummary(id),
      api.getAnalysis(id, undefined, 500),
    ])
      .then(([s, f]) => {
        setSummary(s);
        setFindings(f);
        if (s.signals.length > 0) setSelectedSignal(s.signals[0]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (selectedSignal) {
      api.getTraceRecords(id, selectedSignal, 2000).then(setRecords);
    }
  }, [id, selectedSignal]);

  const filteredFindings = findings.filter((f) => {
    const matchSev = !severityFilter || f.severity === severityFilter;
    const matchMsg =
      !searchMsg ||
      f.message.toLowerCase().includes(searchMsg.toLowerCase()) ||
      (f.signal_name ?? "").toLowerCase().includes(searchMsg.toLowerCase());
    return matchSev && matchMsg;
  });

  if (loading) return <Skeleton />;
  if (!summary) return <p className="text-slate-400">Run not found.</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/test-runs"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 text-sm mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Test Runs
        </Link>
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-100 font-mono truncate">
              {summary.filename}
            </h1>
            <div className="flex items-center gap-3 mt-1.5">
              <StatusBadge status={summary.status} />
              <span className="text-xs text-slate-500">
                {summary.record_count.toLocaleString()} records
              </span>
              {summary.duration_ms != null && (
                <span className="text-xs text-slate-500">
                  parsed in {summary.duration_ms.toFixed(0)} ms
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(
          [
            ["critical", "Critical"],
            ["error", "Errors"],
            ["warning", "Warnings"],
            ["info", "Info"],
          ] as [Severity, string][]
        ).map(([sev, label]) => (
          <button
            key={sev}
            onClick={() =>
              setSeverityFilter(severityFilter === sev ? "" : sev)
            }
            className={`stat-card text-left transition-all ${
              severityFilter === sev ? "ring-2 ring-brand-500" : ""
            }`}
          >
            <span className="text-xs text-slate-400">{label}</span>
            <span className="text-2xl font-bold text-slate-100">
              {summary.severity_counts[sev] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Signal chart + pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Signal Trace"
            subtitle="Time-series view of the selected signal"
            action={
              <select
                value={selectedSignal}
                onChange={(e) => setSelectedSignal(e.target.value)}
                className="input py-1 text-xs w-44"
              >
                {summary.signals.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            }
          >
            {records.length > 0 ? (
              <SignalChart records={records} signalName={selectedSignal} />
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
                No numeric data for this signal
              </div>
            )}
          </Card>
        </div>

        <Card
          title="Severity Distribution"
          subtitle="All findings in this run"
        >
          <SeverityPieChart counts={summary.severity_counts} />
        </Card>
      </div>

      {/* Findings table */}
      <Card
        title="Analysis Findings"
        subtitle={`${filteredFindings.length} of ${findings.length} findings`}
        action={
          <div className="flex items-center gap-2">
            <input
              value={searchMsg}
              onChange={(e) => setSearchMsg(e.target.value)}
              placeholder="Search..."
              className="input py-1 text-xs w-36"
            />
            <select
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(e.target.value as Severity | "")
              }
              className="input py-1 text-xs w-32"
            >
              <option value="">All severities</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-900 z-10">
              <tr className="border-b border-slate-800">
                <th className="th">Severity</th>
                <th className="th">Type</th>
                <th className="th">Signal</th>
                <th className="th">Message</th>
                <th className="th">Time (ms)</th>
                <th className="th">Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredFindings.map((f) => (
                <tr key={f.id} className="table-row">
                  <td className="td">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td className="td">
                    <CheckTypeBadge type={f.check_type} />
                  </td>
                  <td className="td font-mono text-xs text-slate-400">
                    {f.signal_name ?? "—"}
                  </td>
                  <td className="td text-slate-300 text-xs max-w-sm">
                    {f.message}
                  </td>
                  <td className="td text-slate-500 tabular-nums text-xs">
                    {f.timestamp_ms != null
                      ? f.timestamp_ms.toFixed(1)
                      : "—"}
                  </td>
                  <td className="td text-slate-400 tabular-nums text-xs">
                    {f.value != null ? f.value.toFixed(3) : "—"}
                  </td>
                </tr>
              ))}
              {filteredFindings.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="td text-center text-slate-500 py-8"
                  >
                    No findings match the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-800 rounded" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="h-72 bg-slate-800 rounded-xl" />
      <div className="h-64 bg-slate-800 rounded-xl" />
    </div>
  );
}
