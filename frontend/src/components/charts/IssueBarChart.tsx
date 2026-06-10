import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CheckType } from "../../types";

const TYPE_COLORS: Record<CheckType, string> = {
  range_violation: "#ef4444",
  timing_violation: "#f97316",
  missing_signal: "#eab308",
  anomaly: "#8b5cf6",
  statistics: "#3b82f6",
};

const TYPE_LABELS: Record<CheckType, string> = {
  range_violation: "Range",
  timing_violation: "Timing",
  missing_signal: "Missing",
  anomaly: "Anomaly",
  statistics: "Stats",
};

interface IssueBarChartProps {
  counts: Partial<Record<CheckType, number>>;
}

export function IssueBarChart({ counts }: IssueBarChartProps) {
  const data = (Object.entries(counts) as [CheckType, number][]).map(
    ([type, count]) => ({
      name: TYPE_LABELS[type] ?? type,
      value: count,
      type,
    })
  );

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="name"
          stroke="#475569"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
        />
        <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "8px",
            color: "#f1f5f9",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={TYPE_COLORS[entry.type as CheckType] ?? "#64748b"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
