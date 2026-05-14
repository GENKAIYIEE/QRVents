"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
} from "recharts"

// ── Dept Bar Chart ────────────────────────────────────────────────────────────
interface DeptChartData {
  code: string
  students: number
  events: number
  color: string
}
export function DeptBarChart({ data }: { data: DeptChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={4} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="code"
          tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          cursor={{ fill: "rgba(59,130,246,0.05)", radius: 6 }}
          contentStyle={{
            background: "#0D1F3C",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: "10px",
            color: "#E2E8F0",
            fontSize: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        />
        <Bar dataKey="students" name="Students" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} opacity={0.9} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Event Status Pie Chart ────────────────────────────────────────────────────
interface PieData {
  name: string
  value: number
  color: string
}
export function EventPieChart({ data }: { data: PieData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#0D1F3C",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: "10px",
            color: "#E2E8F0",
            fontSize: "12px",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => (
            <span style={{ color: "#94A3B8", fontSize: "11px" }}>{v}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Monthly Trend Area Chart ──────────────────────────────────────────────────
interface TrendData {
  month: string
  events: number
}
export function TrendAreaChart({ data }: { data: TrendData[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="eventsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "#94A3B8", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            background: "#0D1F3C",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: "10px",
            color: "#E2E8F0",
            fontSize: "12px",
          }}
        />
        <Area
          type="monotone"
          dataKey="events"
          name="Events"
          stroke="#3B82F6"
          strokeWidth={2}
          fill="url(#eventsGrad)"
          dot={{ fill: "#3B82F6", r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
