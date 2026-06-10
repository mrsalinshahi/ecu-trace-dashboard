import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Upload, RefreshCw } from "lucide-react";
import { api } from "../api/client";
import type { TestRunSummary } from "../types";
import { StatusBadge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export function TestRuns() {
  const [runs, setRuns] = useState<TestRunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .getTestRuns(0, 100)
      .then(setRuns)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const filtered = runs.filter((r) =>
    r.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Test Runs</h1>
          <p className="text-slate-400 text-sm mt-1">
            {runs.length} runs total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="btn-ghost"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link to="/upload" className="btn-primary">
            <Upload className="w-4 h-4" />
            Upload Trace
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filename..."
          className="input pl-9"
        />
      </div>

      <Card>
        {loading ? (
          <div className="space-y-2 animate-pulse py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-800 rounded" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-sm">
              {search ? `No runs matching "${search}"` : "No test runs yet"}
            </p>
            {!search && (
              <Link to="/upload" className="btn-primary mt-4 inline-flex text-sm">
                <Upload className="w-4 h-4" />
                Upload your first trace
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="th">ID</th>
                  <th className="th">Filename</th>
                  <th className="th">Type</th>
                  <th className="th">Status</th>
                  <th className="th">Records</th>
                  <th className="th">Parse Time</th>
                  <th className="th">Created</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((run) => (
                  <tr key={run.id} className="table-row">
                    <td className="td text-slate-500 font-mono text-xs">
                      #{run.id}
                    </td>
                    <td className="td font-mono text-xs text-slate-300 max-w-xs truncate">
                      {run.filename}
                    </td>
                    <td className="td">
                      <span className="font-mono text-xs text-brand-400 uppercase">
                        {run.file_type}
                      </span>
                    </td>
                    <td className="td">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="td text-slate-400 tabular-nums">
                      {run.record_count.toLocaleString()}
                    </td>
                    <td className="td text-slate-500 tabular-nums text-xs">
                      {run.duration_ms != null
                        ? `${run.duration_ms.toFixed(0)} ms`
                        : "—"}
                    </td>
                    <td className="td text-slate-500 text-xs whitespace-nowrap">
                      {new Date(run.created_at).toLocaleString()}
                    </td>
                    <td className="td text-right">
                      <Link
                        to={`/analysis/${run.id}`}
                        className="text-brand-400 hover:text-brand-300 text-xs font-medium"
                      >
                        Analysis →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
