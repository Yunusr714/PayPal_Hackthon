import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  ComposedChart, Legend,
} from 'recharts';
import { formatINR } from '@/data/mock-data';

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid hsl(var(--border))',
  background: 'white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontSize: '12px',
  padding: '8px 12px',
};

const formatINRShort = (val: number): string => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

interface AreaChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
}

export function AreaChartCard({ data, xKey, yKey, color = 'hsl(var(--primary))', height = 260 }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`areaGrad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatINRShort}
          width={60}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: any) => [formatINR(value), 'Sales']}
          labelStyle={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}
        />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#areaGrad-${yKey})`}
          animationDuration={800}
          dot={{ r: 0 }}
          activeDot={{ r: 5, fill: color, stroke: 'white', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LineChartCard({ data, xKey, lines, height = 260 }: {
  data: Array<Record<string, any>>;
  xKey: string;
  lines: Array<{ key: string; label: string; color: string }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={formatINRShort} width={60} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: any, name: any) => [formatINR(value), name]} labelStyle={{ fontWeight: 600 }} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.label}
            stroke={line.color}
            strokeWidth={2.5}
            dot={{ r: 0 }}
            activeDot={{ r: 5, fill: line.color, stroke: 'white', strokeWidth: 2 }}
            animationDuration={800}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BarChartCard({ data, xKey, yKey, color = 'hsl(var(--primary))', height = 260, horizontal = false, showLabels = false }: {
  data: Array<Record<string, any>>;
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  horizontal?: boolean;
  showLabels?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 10, right: 10, left: horizontal ? 60 : 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={!horizontal} vertical={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={xKey} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={70} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={formatINRShort} width={60} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [formatINR(Number(value)), 'Sales']} cursor={{ fill: 'hsl(var(--muted))' }} labelStyle={{ fontWeight: 600 }} />
        <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} animationDuration={800}>
          {showLabels && <LabelList dataKey={yKey} position="top" formatter={formatINRShort} style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Import LabelList for bar value labels
import { LabelList } from 'recharts';

export function PieChartCard({ data, height = 260, centerLabel, centerValue }: {
  data: Array<{ name: string; value: number; fill: string }>;
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(value: any, name: any) => [`${value}%`, name]} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        </PieChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-15%' }}>
          <p className="text-lg font-bold text-foreground">{centerValue}</p>
          {centerLabel && <p className="text-xs text-muted-foreground">{centerLabel}</p>}
        </div>
      )}
    </div>
  );
}

export function RingChartCard({ data, height = 260, centerLabel, centerValue }: {
  data: Array<{ name: string; value: number; fill: string }>;
  height?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const radialData = data.map(d => ({ name: d.name, value: d.value, fill: d.fill }));
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="90%" barSize={12} data={radialData} startAngle={90} endAngle={-270}>
          <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="value" cornerRadius={8} animationDuration={800} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: any, name: any) => [`${value}%`, name]} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
        </RadialBarChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-10%' }}>
          <p className="text-xl font-bold text-foreground">{centerValue}</p>
          {centerLabel && <p className="text-xs text-muted-foreground mt-0.5">{centerLabel}</p>}
        </div>
      )}
    </div>
  );
}

export function GaugeChart({ value, height = 220, label }: { value: number; height?: number; label?: string }) {
  const gaugeData = [{ name: 'health', value, fill: value > 70 ? 'hsl(var(--success))' : value > 40 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))' }];
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="65%" innerRadius="70%" outerRadius="100%" barSize={16} data={gaugeData} startAngle={180} endAngle={0}>
          <RadialBar background={{ fill: 'hsl(var(--muted))' }} dataKey="value" cornerRadius={8} animationDuration={800} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '20%' }}>
        <p className="text-3xl font-bold text-foreground">{value}%</p>
        {label && <p className="text-xs text-muted-foreground mt-1">{label}</p>}
      </div>
    </div>
  );
}

export function ComposedChartCard({ data, xKey, bars, lines, height = 260 }: {
  data: Array<Record<string, any>>;
  xKey: string;
  bars?: Array<{ key: string; label: string; color: string }>;
  lines?: Array<{ key: string; label: string; color: string }>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={formatINRShort} width={60} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: any, name: any) => [formatINR(Number(value)), name]} labelStyle={{ fontWeight: 600 }} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {bars?.map((bar) => (
          <Bar key={bar.key} dataKey={bar.key} name={bar.label} fill={bar.color} radius={[6, 6, 0, 0]} animationDuration={800} barSize={24} />
        ))}
        {lines?.map((line) => (
          <Line key={line.key} type="monotone" dataKey={line.key} name={line.label} stroke={line.color} strokeWidth={2.5} dot={{ r: 0 }} activeDot={{ r: 5 }} animationDuration={800} />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
