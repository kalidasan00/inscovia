"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function ProgressChart({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={24} />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #eee" }}
            formatter={(value, key) => [key === "wpm" ? `${value} WPM` : `${value}%`, key === "wpm" ? "Speed" : "Accuracy"]}
          />
          <Line type="monotone" dataKey="wpm" stroke="#111827" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}