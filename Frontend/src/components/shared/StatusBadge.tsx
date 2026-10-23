import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, string> = {
  Paid: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-800/50',
  Completed: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-800/50',
  'In Stock': 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-800/50',
  Pending: 'bg-amber-500/10 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-500/20 dark:border-amber-800/50',
  'Low Stock': 'bg-amber-500/10 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-500/20 dark:border-amber-800/50',
  Overdue: 'bg-rose-500/10 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-500/20 dark:border-rose-800/50',
  Critical: 'bg-rose-500/10 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-500/20 dark:border-rose-800/50',
  Failed: 'bg-rose-500/10 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-500/20 dark:border-rose-800/50',
  PayPal: 'bg-blue-500/10 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-500/20 dark:border-blue-800/50',
  Cash: 'bg-slate-100 text-slate-700 dark:bg-zinc-800/70 dark:text-zinc-300 border-slate-200 dark:border-zinc-700/60',
  UPI: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-800/50',
  Credit: 'bg-amber-500/10 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-500/20 dark:border-amber-800/50',
  Low: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-800/50',
  Medium: 'bg-amber-500/10 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-500/20 dark:border-amber-800/50',
  High: 'bg-rose-500/10 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-500/20 dark:border-rose-800/50',
  Excellent: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-800/50',
  Good: 'bg-blue-500/10 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-500/20 dark:border-blue-800/50',
  Fair: 'bg-amber-500/10 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-500/20 dark:border-amber-800/50',
  Poor: 'bg-rose-500/10 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-500/20 dark:border-rose-800/50',
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-zinc-800/70 dark:text-zinc-300 border-slate-200 dark:border-zinc-700/60',
  SENT: 'bg-blue-500/10 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-500/20 dark:border-blue-800/50',
  PAID: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-800/50',
  PAYMENT_PENDING: 'bg-amber-500/10 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-500/20 dark:border-amber-800/50',
  CANCELLED: 'bg-rose-500/10 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-500/20 dark:border-rose-800/50',
  REFUNDED: 'bg-purple-500/10 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-500/20 dark:border-purple-800/50',
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
