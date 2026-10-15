import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: string; positive: boolean };
  subtext?: string;
  variant?: 'default' | 'warning' | 'danger';
  children?: React.ReactNode;
}

export function KPICard({
  title, value, icon: Icon, trend, subtext, variant = 'default', children,
}: KPICardProps) {
  const iconBg = {
    default: 'bg-primary/10 text-primary',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-destructive/10 text-destructive',
  }[variant];

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(trend || subtext) && (
        <div className="mt-3 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold rounded-md px-1.5 py-0.5',
                trend.positive
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              )}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {subtext && (
            <span className="text-xs text-muted-foreground">{subtext}</span>
          )}
        </div>
      )}

      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
