import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, Send, Eye, CreditCard, Bell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useBusiness } from '@/context/BusinessContext';
import { formatINR } from '@/data/mock-data';

export function KhataPage() {
  const navigate = useNavigate();
  const { customers, customerDues, category } = useBusiness();
  const [search, setSearch] = useState('');

  const isService = category === 'service';

  const summaryCards = useMemo(() => {
    if (isService) {
      return [
        { title: 'Total Service Credit', value: formatINR(34200), icon: Wallet, variant: 'default' as const },
        { title: 'Settled Billings', value: formatINR(20000), icon: TrendingUp, variant: 'default' as const },
        { title: 'Outstanding Service Khata', value: formatINR(14200), icon: TrendingDown, variant: 'warning' as const },
        { title: 'Overdue Dues', value: formatINR(2250), icon: AlertTriangle, variant: 'danger' as const },
      ];
    }
    return [
      { title: 'Total Credit Given', value: formatINR(124500), icon: Wallet, variant: 'default' as const },
      { title: 'Total Collected', value: formatINR(85800), icon: TrendingUp, variant: 'default' as const },
      { title: 'Outstanding', value: formatINR(38700), icon: TrendingDown, variant: 'warning' as const },
      { title: 'Overdue Amount', value: formatINR(9400), icon: AlertTriangle, variant: 'danger' as const },
    ];
  }, [isService]);

  const customerKhataList = useMemo(() => {
    return customers.map((c) => {
      const dues = customerDues.filter((d) => d.customerName.toLowerCase() === c.name.toLowerCase());
      const pendingDue = dues.find((d) => d.status === 'Pending' || d.status === 'Overdue');
      const hasOverdue = dues.some((d) => d.status === 'Overdue');
      const risk: 'Low' | 'Medium' | 'High' = hasOverdue ? 'High' : c.riskScore < 30 ? 'Low' : c.riskScore < 60 ? 'Medium' : 'High';
      const dueDate = pendingDue ? pendingDue.dueDate : c.lastVisit || '18 Oct 2026';

      return {
        customer: c.name,
        phone: c.phone,
        totalCredit: c.totalPurchases,
        outstanding: c.outstanding,
        dueDate,
        risk,
      };
    });
  }, [customers, customerDues]);

  const filtered = useMemo(() => {
    return customerKhataList.filter(
      (k) => k.customer.toLowerCase().includes(search.toLowerCase()) || k.phone.includes(search)
    );
  }, [customerKhataList, search]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <KPICard key={card.title} title={card.title} value={card.value} icon={card.icon} variant={card.variant} />
        ))}
      </div>

      <div>
        <Card className="rounded-2xl border-border shadow-sm w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  {isService ? 'Customer Service Khata & Dues' : 'Customer-wise Khata'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isService ? 'Outstanding client service charges & labor billings' : 'Outstanding retail credit by customer'}
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => toast.success('Bulk reminders sent', { description: 'Reminders sent to all customers with dues.' })}
                className={isService
                  ? 'bg-[#007F7C] hover:bg-[#006663] text-white font-semibold text-xs'
                  : 'bg-primary text-primary-foreground hover:bg-primary-hover font-semibold text-xs'}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" /> Send Bulk Reminders
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="px-6 pb-3">
              <input
                type="text"
                placeholder="Search customer or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full max-w-xs rounded-lg border border-input bg-white px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6 text-xs uppercase tracking-wide">Customer</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Phone</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-right">
                    {isService ? 'Total Service Volume' : 'Total Credit'}
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-right">Outstanding</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Due Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Risk</TableHead>
                  <TableHead className="pr-6 text-xs uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow
                    key={entry.customer}
                    className="border-border hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => navigate(`/customers/${encodeURIComponent(entry.customer)}`)}
                  >
                    <TableCell className="pl-6 font-semibold text-foreground text-sm hover:underline">
                      {entry.customer}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.phone}</TableCell>
                    <TableCell className="text-sm text-foreground text-right">{formatINR(entry.totalCredit)}</TableCell>
                    <TableCell className={`text-sm text-right ${entry.outstanding > 0 ? 'font-bold text-destructive' : 'text-emerald-700 font-semibold'}`}>
                      {formatINR(entry.outstanding)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.dueDate}</TableCell>
                    <TableCell><StatusBadge status={entry.risk} /></TableCell>
                    <TableCell className="pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/customers/${encodeURIComponent(entry.customer)}`)}
                          className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10"
                        >
                          Ledger <ChevronRight className="h-3 w-3 ml-0.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/customers/${encodeURIComponent(entry.customer)}`)}>
                              <Eye className="h-3.5 w-3.5 mr-2" /> View Ledger
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success('Reminder sent', { description: `Reminder sent to ${entry.customer}.` })}>
                              <Bell className="h-3.5 w-3.5 mr-2" /> Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              toast.success('Payment link generated', { description: `Link sent to ${entry.customer}.` });
                              navigate(`/customers/${encodeURIComponent(entry.customer)}`);
                            }}>
                              <CreditCard className="h-3.5 w-3.5 mr-2" /> Collect Payment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
