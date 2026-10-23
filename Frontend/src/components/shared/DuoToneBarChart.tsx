import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useBusiness } from '@/context/BusinessContext';

export interface DuoToneBarItem {
  label: string;
  profit: number;
  revenue: number;
}

interface DuoToneBarChartProps {
  data?: DuoToneBarItem[];
  height?: number;
  className?: string;
}

const defaultData: DuoToneBarItem[] = [
  { label: 'Jan', profit: 3400, revenue: 5600 },
  { label: 'Feb', profit: 4200, revenue: 7800 },
  { label: 'Mar', profit: 2900, revenue: 6100 },
  { label: 'Apr', profit: 5800, revenue: 9900 },
  { label: 'May', profit: 4900, revenue: 8400 },
  { label: 'Jun', profit: 3700, revenue: 6900 },
  { label: 'Jul', profit: 5200, revenue: 9100 },
];

export function DuoToneBarChart({
  data = defaultData,
  height = 190,
  className,
}: DuoToneBarChartProps) {
  const { category } = useBusiness();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxTotal = Math.max(
    ...data.map((d) => d.profit + d.revenue),
    10000
  );

  // Vibrant theme color (Blue for shop, Teal for service)
  const isService = category === 'service';
  const themeCapColor = isService ? 'bg-[#007F7C]' : 'bg-[#2563EB]';
  const themeGlow = isService
    ? 'group-hover:shadow-[0_0_12px_rgba(0,127,124,0.45)]'
    : 'group-hover:shadow-[0_0_12px_rgba(37,99,235,0.45)]';

  return (
    <div className={cn('relative w-full flex flex-col justify-end select-none', className)}>
      {/* Chart Bars Container */}
      <div
        className="flex items-end justify-between gap-2.5 sm:gap-3.5 px-1 pt-6 pb-2"
        style={{ height }}
      >
        {data.map((item, idx) => {
          const total = item.profit + item.revenue;
          const totalHeightPercent = (total / maxTotal) * 100;
          const profitPercent = (item.profit / total) * 100;
          const revenuePercent = (item.revenue / total) * 100;

          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="group relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
            >
              {/* Tooltip on Hover */}
              {isHovered && (
                <div className="absolute -top-12 z-20 flex flex-col items-center rounded-xl bg-zinc-950 px-2.5 py-1.5 text-[10px] text-white shadow-xl pointer-events-none whitespace-nowrap animate-fade-in border border-zinc-800">
                  <span className="font-bold text-zinc-200">{item.label} Performance</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-zinc-400">Profit: ₹{item.profit.toLocaleString()}</span>
                    <span className={cn('font-semibold', isService ? 'text-[#38D5D2]' : 'text-blue-400')}>
                      Rev: ₹{item.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Stacked Vertical Rounded Column */}
              <div
                className="w-full max-w-[28px] sm:max-w-[34px] flex flex-col justify-end gap-1 transition-all duration-300"
                style={{ height: `${Math.max(15, totalHeightPercent)}%` }}
              >
                {/* Top Cap Bar: Vibrant Theme Color (NOT orange) */}
                <div
                  className={cn(
                    'w-full rounded-t-lg rounded-b-sm transition-all duration-300',
                    themeCapColor,
                    themeGlow,
                    isHovered ? 'scale-105' : 'opacity-90 group-hover:opacity-100'
                  )}
                  style={{ height: `${Math.max(20, revenuePercent)}%` }}
                />

                {/* Bottom Base Bar: Dark Solid Pill */}
                <div
                  className={cn(
                    'w-full rounded-b-lg rounded-t-sm bg-[#18181B] dark:bg-[#27272A] transition-all duration-300',
                    isHovered ? 'scale-105 bg-black dark:bg-[#3F3F46]' : 'opacity-95'
                  )}
                  style={{ height: `${Math.max(25, profitPercent)}%` }}
                />
              </div>

              {/* X-Axis Label */}
              <span
                className={cn(
                  'mt-2 text-[11px] font-medium transition-colors',
                  isHovered
                    ? 'text-zinc-900 dark:text-zinc-100 font-bold'
                    : 'text-zinc-400 dark:text-zinc-500'
                )}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
