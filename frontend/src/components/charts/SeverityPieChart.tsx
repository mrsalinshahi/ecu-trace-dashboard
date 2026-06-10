import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Severity } from "../../types";

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "#ef4444",
  error: "#f97316",
  warning: "#eab308",
  info: "#3b82f6",
};

interface SeverityPieChartProps {
  counts: Partial<Record<Severity, number>>;
}

export function SeverityPieChart({ counts }: SeverityPieChartProps) {
  const data = (Object.entries(counts) as [Severity, number][])
    .filter(([, v]) => v > 0)
    .map(([severity, count]) => ({ name: severity, value: count }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No findings
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={SEVERITY_COLORS[entry.name as Severity] ?? "#64748b"}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "8px",
            color: "#f1f5f9",
            fontSize: "12px",
          }}
        />
        <Legend
          wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }}
          formatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
