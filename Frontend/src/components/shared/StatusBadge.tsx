import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, string> = {
  Paid: 'bg-success/10 text-success border-success/20',
  Completed: 'bg-success/10 text-success border-success/20',
  'In Stock': 'bg-success/10 text-success border-success/20',
  Pending: 'bg-warning/10 text-warning border-warning/20',
  'Low Stock': 'bg-warning/10 text-warning border-warning/20',
  Overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  Critical: 'bg-destructive/10 text-destructive border-destructive/20',
  Failed: 'bg-destructive/10 text-destructive border-destructive/20',
  PayPal: 'bg-primary/10 text-primary border-primary/20',
  Cash: 'bg-slate-100 text-slate-600 border-slate-200',
  UPI: 'bg-success/10 text-success border-success/20',
  Credit: 'bg-warning/10 text-warning border-warning/20',
  Low: 'bg-success/10 text-success border-success/20',
  Medium: 'bg-warning/10 text-warning border-warning/20',
  High: 'bg-destructive/10 text-destructive border-destructive/20',
  Excellent: 'bg-success/10 text-success border-success/20',
  Good: 'bg-primary/10 text-primary border-primary/20',
  Fair: 'bg-warning/10 text-warning border-warning/20',
  Poor: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusConfig[status] || 'bg-muted text-muted-foreground border-border';
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', colorClass, className)}
    >
      {status}
    </Badge>
  );
}
