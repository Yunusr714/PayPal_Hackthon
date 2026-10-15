import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, trend, action, children, className }: ChartCardProps) {
  return (
    <Card className={cn('rounded-xl border-border shadow-sm', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
            {subtitle && (
              <CardDescription className="mt-0.5 text-xs">{subtitle}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-semibold rounded-md px-2 py-1',
                  trend.positive
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                )}
              >
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {action}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
