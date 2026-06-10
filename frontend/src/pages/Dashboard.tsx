import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Database,
  AlertOctagon,
  ArrowRight,
} from "lucide-react";
import { api } from "../api/client";
import type { DashboardStats } from "../types";
import { StatCard } from "../components/ui/Card";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";
import { SeverityPieChart } from "../components/charts/SeverityPieChart";
import { IssueBarChart } from "../components/charts/IssueBarChart";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getDashboardStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          ECU test trace analysis overview
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Runs"
          value={stats.total_runs}
          icon={<FileText className="w-4 h-4" />}
          color="blue"
        />
        <StatCard
          label="Completed"
          value={stats.completed_runs}
          sub={`${stats.total_runs > 0 ? Math.round((stats.completed_runs / stats.total_runs) * 100) : 0}% success rate`}
          icon={<CheckCircle className="w-4 h-4" />}
          color="green"
        />
        <StatCard
          label="Records Parsed"
          value={stats.total_records.toLocaleString()}
          icon={<Database className="w-4 h-4" />}
          color="purple"
        />
        <StatCard
          label="Total Issues"
          value={stats.total_issues}
          icon={<AlertTriangle className="w-4 h-4" />}
          color="yellow"
        />
        <StatCard
          label="Critical Issues"
          value={stats.critical_issues}
          icon={<AlertOctagon className="w-4 h-4" />}
          color="red"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Issues by Severity"
          subtitle="Distribution of findings across all test runs"
        >
          <SeverityPieChart
            counts={{
              critical: stats.critical_issues,
              ...(stats.total_issues - stats.critical_issues > 0
                ? { warning: stats.total_issues - stats.critical_issues }
                : {}),
            }}
          />
        </Card>

        <Card
          title="Issues by Type"
          subtitle="Breakdown of check categories"
        >
          {Object.keys(stats.issue_by_type).length > 0 ? (
            <IssueBarChart counts={stats.issue_by_type} />
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
              No data yet — upload a trace file
            </div>
          )}
        </Card>
      </div>

      {/* Recent runs */}
      <Card
        title="Recent Test Runs"
        action={
          <Link to="/test-runs" className="btn-ghost text-xs">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        }
      >
        {stats.recent_runs.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No test runs yet.</p>
            <Link to="/upload" className="btn-primary mt-3 text-sm inline-flex">
              Upload your first trace
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="th">Filename</th>
                  <th className="th">Status</th>
                  <th className="th">Records</th>
                  <th className="th">Created</th>
                  <th className="th"></th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_runs.map((run) => (
                  <tr key={run.id} className="table-row">
                    <td className="td font-mono text-xs text-slate-300">
                      {run.filename}
                    </td>
                    <td className="td">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="td text-slate-400">
                      {run.record_count.toLocaleString()}
                    </td>
                    <td className="td text-slate-500 text-xs">
                      {new Date(run.created_at).toLocaleString()}
                    </td>
                    <td className="td text-right">
                      <Link
                        to={`/analysis/${run.id}`}
                        className="text-brand-400 hover:text-brand-300 text-xs"
                      >
                        View →
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

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-slate-800 rounded" />
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 bg-slate-800 rounded-xl" />
        <div className="h-64 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertOctagon className="w-10 h-10 text-red-400 mb-3" />
      <h2 className="text-lg font-semibold text-slate-200 mb-1">
        Failed to load dashboard
      </h2>
      <p className="text-slate-500 text-sm max-w-md">{message}</p>
    </div>
  );
}
