import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {useId} from "react";

/** Curated, muted palette — deliberately not the default rainbow chart colors. */
export const CHART_COLORS = ["#C9A24B", "#4FA9A0", "#C97B63", "#6E8FD1", "#8AA876", "#A784B0"];

const AXIS_STYLE = {fontSize: 12, fill: "#8D93A0", fontFamily: "Inter, sans-serif"};

function truncate(s: string, n = 13) {
  const str = String(s);
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

function ChartTooltip({active, payload, label}: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-hair bg-surface2/95 px-3 py-2 text-sm shadow-xl backdrop-blur">
      <div className="mb-1 text-xs text-muted">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 font-medium text-white">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{background: p.color || p.fill}} />
          <span className="font-mono">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Explicit dot renderer so points are always the series color, ringed for contrast — never the invisible/black default. */
function seriesDot(color: string) {
  return (props: any) => {
    const {cx, cy} = props;
    if (cx == null || cy == null) return <g />;
    return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#0B0D11" strokeWidth={2} />;
  };
}
function seriesActiveDot(color: string) {
  return (props: any) => {
    const {cx, cy} = props;
    if (cx == null || cy == null) return <g />;
    return <circle cx={cx} cy={cy} r={6} fill={color} stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />;
  };
}

type Point = {label: string; value: number};
const fmt = (v: number) => v.toLocaleString();

function xAxisProps(data: Point[]) {
  // Pehle >6 points par labels ko -25° tilt kar dete the -- lambi date
  // ranges mein ye "staircase"/zigzag jaisa overlapping dikhta tha aur
  // parhna mushkil ho jata tha. Ab labels hamesha seedhe (horizontal)
  // rakhte hain aur sirf itne hi ticks dikhate hain jitne bina overlap ke
  // fit ho sakein -- baaki evenly-spaced skip ho jate hain.
  const maxLabels = 7;
  const interval = data.length > maxLabels ? Math.ceil(data.length / maxLabels) - 1 : 0;
  return {
    dataKey: "label",
    tick: AXIS_STYLE,
    tickLine: false,
    axisLine: {stroke: "rgba(255,255,255,.1)"},
    tickFormatter: (v: string) => truncate(v, 10),
    interval,
    angle: 0,
    textAnchor: "middle" as const,
    height: 32,
  };
}

export function BarChartPremium({data, color = CHART_COLORS[0]}: {data: Point[]; color?: string}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{top: 8, right: 16, left: 0, bottom: 4}}>
        <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
        <XAxis {...xAxisProps(data)} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={54} tickFormatter={fmt} />
        <Tooltip content={<ChartTooltip />} cursor={{fill: "rgba(255,255,255,.045)"}} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={56} animationDuration={700} animationEasing="ease-out" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartPremium({data, color = CHART_COLORS[0]}: {data: Point[]; color?: string}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{top: 8, right: 16, left: 0, bottom: 4}}>
        <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
        <XAxis {...xAxisProps(data)} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={54} tickFormatter={fmt} />
        <Tooltip content={<ChartTooltip />} cursor={{stroke: "rgba(255,255,255,.15)"}} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={seriesDot(color)} activeDot={seriesActiveDot(color)} animationDuration={700} animationEasing="ease-out" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaChartPremium({data, color = CHART_COLORS[0]}: {data: Point[]; color?: string}) {
  const gradientId = useId().replace(/[:]/g, "");
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{top: 8, right: 16, left: 0, bottom: 4}}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
        <XAxis {...xAxisProps(data)} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={54} tickFormatter={fmt} />
        <Tooltip content={<ChartTooltip />} cursor={{stroke: "rgba(255,255,255,.15)"}} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#${gradientId})`} dot={seriesDot(color)} activeDot={seriesActiveDot(color)} animationDuration={700} animationEasing="ease-out" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DonutChartPremium({data}: {data: Point[]}) {
  const top = data.slice(0, 8);
  const total = top.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart margin={{top: 8, right: 8, left: 8, bottom: 8}}>
          <Pie data={top} dataKey="value" nameKey="label" innerRadius={68} outerRadius={104} paddingAngle={2} stroke="#0B0D11" strokeWidth={2}>
            {top.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={40}
            iconType="circle"
            iconSize={8}
            formatter={(v: string) => <span className="text-xs text-muted">{truncate(v, 16)}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" style={{marginBottom: 24}}>
        <div className="font-mono text-xl font-semibold text-white">{total.toLocaleString()}</div>
        <div className="text-[10px] uppercase tracking-widest text-faint">Total</div>
      </div>
    </div>
  );
}