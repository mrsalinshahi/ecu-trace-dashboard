import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TraceRecord } from "../../types";

interface SignalChartProps {
  records: TraceRecord[];
  signalName: string;
}

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

export function SignalChart({ records, signalName }: SignalChartProps) {
  const data = records.map((r) => ({
    t: +(r.timestamp_ms / 1000).toFixed(3),
    value: r.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="t"
          stroke="#475569"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          label={{ value: "Time (s)", position: "insideBottomRight", offset: -10, fill: "#64748b" }}
        />
        <YAxis
          stroke="#475569"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "8px",
            color: "#f1f5f9",
            fontSize: "12px",
          }}
          formatter={(v: number) => [v?.toFixed(4), signalName]}
          labelFormatter={(l) => `t = ${l} s`}
        />
        <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }} />
        <Line
          type="monotone"
          dataKey="value"
          name={signalName}
          stroke={COLORS[0]}
          dot={false}
          strokeWidth={1.5}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
