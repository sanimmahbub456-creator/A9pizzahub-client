"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)", fontSize: 13 };

export function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-sm ${className ?? ""}`}>
      <h3 className="mb-4 font-semibold">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

/** Fills missing days so the line doesn't skip */
export function lastNDays(data: { _id: string; count: number }[], n = 14) {
  const map = new Map(data.map((d) => [d._id, d.count]));
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date(Date.now() - (n - 1 - i) * 864e5).toISOString().slice(0, 10);
    return { day: d.slice(5), count: map.get(d) ?? 0 };
  });
}

export function TrendChart({ data, label = "Count" }: { data: { day: string; count: number }[]; label?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: -20, right: 8 }}>
        <defs>
          <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="count" name={label} stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#trend)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StatusPie({ data }: { data: { status: string; count: number }[] }) {
  const filtered = data.filter((d) => d.count > 0);
  if (!filtered.length) return <div className="grid h-full place-items-center text-sm text-muted-foreground">No data yet</div>;
  // With a single slice, padding and slice borders draw a visible seam, so turn them off
  const multiple = filtered.length > 1;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={filtered}
          dataKey="count"
          nameKey="status"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={multiple ? 3 : 0}
          stroke={multiple ? "var(--card)" : "none"}
        >
          {filtered.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend formatter={(v) => <span className="text-xs capitalize text-foreground">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SimpleBar({ data, xKey, yKey, label }: { data: Record<string, unknown>[]; xKey: string; yKey: string; label: string }) {
  if (!data.length) return <div className="grid h-full place-items-center text-sm text-muted-foreground">No data yet</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: -20, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey={yKey} name={label} fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
