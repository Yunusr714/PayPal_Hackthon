import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, Send, Eye, CreditCard, Bell, ChevronRight, MessageSquareQuote } from 'lucide-react';
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
import { sendWhatsAppReminder } from '@/utils/paypal';

export function KhataPage() {
  const navigate = useNavigate();
  const { customers, customerDues, category } = useBusiness();
  const [search, setSearch] = useState('');

  const isService = category === 'service';

  const summaryCards = useMemo(() => {
    const totalVolume = customers.reduce((acc, c) => acc + (c.totalPurchases || 0), 0);
    const totalOutstanding = customers.reduce((acc, c) => acc + (c.outstanding || 0), 0);
    const totalCollected = Math.max(0, totalVolume - totalOutstanding);
    const overdueTotal = customerDues
      .filter((d) => d.status === 'Overdue')
      .reduce((acc, d) => acc + (d.totalAmount || 0), 0);

    if (isService) {
      return [
        { title: 'Total Service Volume', value: formatINR(totalVolume), icon: Wallet, variant: 'default' as const },
        { title: 'Settled Billings', value: formatINR(totalCollected), icon: TrendingUp, variant: 'default' as const },
        { title: 'Outstanding Service Khata', value: formatINR(totalOutstanding), icon: TrendingDown, variant: 'warning' as const },
        { title: 'Overdue Dues', value: formatINR(overdueTotal), icon: AlertTriangle, variant: 'danger' as const },
      ];
    }
    return [
      { title: 'Total Credit Given', value: formatINR(totalVolume), icon: Wallet, variant: 'default' as const },
      { title: 'Total Collected', value: formatINR(totalCollected), icon: TrendingUp, variant: 'default' as const },
      { title: 'Outstanding Balance', value: formatINR(totalOutstanding), icon: TrendingDown, variant: 'warning' as const },
      { title: 'Overdue Amount', value: formatINR(overdueTotal), icon: AlertTriangle, variant: 'danger' as const },
    ];
  }, [isService, customers, customerDues]);

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
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
          Khata / Credit Book
        </h1>
        <p className="text-xs text-zinc-500 font-normal mt-1">
          Customer credit ledger, dues & payment tracking
        </p>
      </div>

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
                onClick={async () => {
                  const overdueCustomers = customerKhataList.filter((k) => k.outstanding > 0);
                  if (overdueCustomers.length === 0) {
                    toast.info('All dues are cleared! No outstanding balances.');
                    return;
                  }
                  const top = overdueCustomers[0];
                  const toastId = toast.loading('Generating live PayPal payment link...');
                  try {
                    await sendWhatsAppReminder({
                      customerName: top.customer,
                      phone: top.phone,
                      amount: top.outstanding,
                      businessName: 'Cashiko',
                    });
                    toast.success('Dispatched WhatsApp Reminder with Live PayPal Link', {
                      id: toastId,
                      description: `Opened chat for ${top.customer} with verified PayPal payment link.`,
                    });
                  } catch (e: any) {
                    toast.error('Failed to dispatch reminder', { id: toastId });
                  }
                }}
                className={isService
                  ? 'bg-[#007F7C] hover:bg-[#006663] text-white font-semibold text-xs'
                  : 'bg-primary text-primary-foreground hover:bg-primary-hover font-semibold text-xs'}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" /> Send Reminder to Dues
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
                            <DropdownMenuItem onClick={async () => {
                              const toastId = toast.loading('Generating live PayPal payment link...');
                              try {
                                await sendWhatsAppReminder({
                                  customerName: entry.customer,
                                  phone: entry.phone,
                                  amount: entry.outstanding,
                                  businessName: 'Cashiko',
                                });
                                toast.success('WhatsApp Reminder Dispatched', {
                                  id: toastId,
                                  description: `Opened chat for ${entry.customer} with verified PayPal payment link.`,
                                });
                              } catch (e: any) {
                                toast.error('Failed to open WhatsApp reminder', { id: toastId });
                              }
                            }}>
                              <Bell className="h-3.5 w-3.5 mr-2 text-emerald-600" /> WhatsApp Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              navigate(`/customers/${encodeURIComponent(entry.customer)}`);
                            }}>
                              <CreditCard className="h-3.5 w-3.5 mr-2" /> Collect Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              navigate(`/create?brief=${encodeURIComponent(`Client: ${entry.customer} (${entry.phone}). Outstanding balance: $${(entry.outstanding / 80).toFixed(2)}. Deliverables: Retail & Service billing dues.`)}`);
                            }}>
                              <Send className="h-3.5 w-3.5 mr-2 text-blue-600" /> Draft PayPal Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/triage')}>
                              <MessageSquareQuote className="h-3.5 w-3.5 mr-2 text-indigo-600" /> Reply Copilot
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
