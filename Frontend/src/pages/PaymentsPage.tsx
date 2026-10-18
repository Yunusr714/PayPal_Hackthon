import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IndianRupee, Clock, CreditCard, Plus, Eye,
  ExternalLink, Printer, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { KPICard } from '@/components/shared/KPICard';
import { ChartCard } from '@/components/shared/ChartCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PieChartCard } from '@/components/shared/Charts';
import { formatINR } from '@/data/mock-data';
import { api } from '@/lib/api';
import { Invoice } from '@/types';
import { PrintableReceiptModal, ReceiptData } from '@/components/shared/PrintableReceiptModal';
import { useBusiness } from '@/context/BusinessContext';

interface UnifiedTransaction {
  id: string;
  customer: string;
  amount: number;
  method: 'Cash' | 'UPI' | 'Credit' | 'PayPal';
  status: 'Completed' | 'Pending' | 'Overdue';
  date: string;
  source: 'pos' | 'paypal';
  payerViewUrl?: string;
  details?: string;
}

const tabs = ['all', 'Cash', 'UPI', 'Credit', 'PayPal'];

export function PaymentsPage() {
  const navigate = useNavigate();
  const { user } = useBusiness();
  const [activeTab, setActiveTab] = useState('all');
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<UnifiedTransaction | null>(null);
  const [printableData, setPrintableData] = useState<ReceiptData | null>(null);

  const buildReceiptDataFromTxn = (txn: UnifiedTransaction): ReceiptData => ({
    id: txn.id,
    type: txn.source === 'paypal' ? 'invoice' : 'retail_sale',
    title: txn.source === 'paypal' ? 'PayPal Invoicing v2 Receipt' : 'POS Payment Receipt',
    date: txn.date,
    customerName: txn.customer,
    items: [
      {
        description: txn.details || (txn.source === 'paypal' ? 'PayPal Cross-Border Invoicing' : 'Counter Transaction'),
        quantity: 1,
        unitPrice: txn.amount,
        total: txn.amount,
      },
    ],
    subtotal: txn.amount,
    tax: 0,
    total: txn.amount,
    paymentMode: txn.method,
    status: txn.status,
    paypalInvoiceId: txn.source === 'paypal' ? txn.id : undefined,
    notes: txn.source === 'paypal'
      ? 'Direct PayPal Sandbox transaction with verified webhook reconciliation.'
      : 'Official payment settlement acknowledgment.',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [salesData, invoicesData] = await Promise.all([
        api.sales.list(),
        api.invoices.list(),
      ]);

      const txns: UnifiedTransaction[] = [];

      // Add POS / Business Sales
      if (Array.isArray(salesData)) {
        salesData.forEach((s: any) => {
          const mode = s.payment_mode === 'PAYPAL' ? 'PayPal'
            : s.payment_mode === 'CREDIT' ? 'Credit'
            : s.payment_mode === 'UPI' ? 'UPI' : 'Cash';

          const status = s.status === 'PAID' || s.status === 'COMPLETED' || s.status === 'DELIVERED'
            ? 'Completed'
            : s.status === 'OVERDUE' ? 'Overdue' : 'Pending';

          txns.push({
            id: s.id.startsWith('INV-') ? s.id : `TXN-${s.id.slice(0, 6).toUpperCase()}`,
            customer: s.customer_name || 'Walk-in Customer',
            amount: Number(s.total_amount) || 0,
            method: mode,
            status,
            date: s.date || 'Today',
            source: 'pos',
            details: s.item_name,
          });
        });
      }

      // Add PayPal Invoicing v2 records
      if (Array.isArray(invoicesData)) {
        invoicesData.forEach((inv: Invoice) => {
          const payerUrl = inv.paypal_invoice_id
            ? `https://www.sandbox.paypal.com/invoice/p/#${inv.paypal_invoice_id}`
            : undefined;

          txns.push({
            id: inv.paypal_invoice_number || `CSK-${inv.id.substring(0, 8).toUpperCase()}`,
            customer: inv.recipient_name,
            amount: Number(inv.total) * 83, // converted to INR for unified merchant view
            method: 'PayPal',
            status: inv.status === 'PAID' ? 'Completed' : 'Pending',
            date: new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            source: 'paypal',
            payerViewUrl: payerUrl,
            details: `PayPal v2 Invoice (${inv.status}) - $${Number(inv.total).toFixed(2)} USD`,
          });
        });
      }

      setTransactions(txns);
    } catch (err: any) {
      toast.error('Failed to load live payments', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute live KPIs
  const totalCollected = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'Completed')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalPending = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'Pending' || t.status === 'Overdue')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const paypalTotal = useMemo(() => {
    return transactions
      .filter((t) => t.method === 'PayPal')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const paypalCount = useMemo(() => {
    return transactions.filter((t) => t.method === 'PayPal').length;
  }, [transactions]);

  const kpiCards = [
    { title: 'Total Collected', value: formatINR(totalCollected), icon: IndianRupee, variant: 'default' as const },
    { title: 'Pending Receivables', value: formatINR(totalPending), icon: Clock, variant: 'warning' as const },
    { title: 'PayPal Invoiced Volume', value: formatINR(paypalTotal), icon: CreditCard, variant: 'default' as const },
    { title: 'Live PayPal Invoices', value: `${paypalCount} Invoices`, icon: CheckCircle2, variant: 'default' as const },
  ];

  // Dynamic Payment Method Breakdown Chart Data
  const paymentMethodChartData = useMemo(() => {
    const counts: Record<string, number> = { Cash: 0, UPI: 0, Credit: 0, PayPal: 0 };
    transactions.forEach((t) => {
      if (counts[t.method] !== undefined) {
        counts[t.method] += t.amount;
      }
    });

    return [
      { name: 'Cash', value: counts.Cash || 1, fill: 'hsl(var(--primary))' },
      { name: 'UPI', value: counts.UPI || 1, fill: 'hsl(var(--success))' },
      { name: 'Credit', value: counts.Credit || 1, fill: 'hsl(var(--warning))' },
      { name: 'PayPal', value: counts.PayPal || 1, fill: '#0070BA' },
    ];
  }, [transactions]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return transactions;
    return transactions.filter((t) => t.method === activeTab);
  }, [transactions, activeTab]);

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* Header and KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <KPICard key={card.title} title={card.title} value={card.value} icon={card.icon} variant={card.variant} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Dynamic Payment Method Distribution */}
        <ChartCard
          title="Payment Mode Distribution"
          subtitle="Real volume breakdown across all payment rails"
          className="lg:col-span-1 rounded-2xl"
        >
          <PieChartCard data={paymentMethodChartData} height={240} />
        </ChartCard>

        {/* Transactions Table Card */}
        <Card className="rounded-2xl border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Live Transaction Ledger</CardTitle>
                <CardDescription className="text-xs">
                  Synchronized real-time payments across Cash, UPI, Khata Credit & PayPal Sandbox v2
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadData}
                  disabled={isLoading}
                  className="h-8 text-xs rounded-xl"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/create')}
                  className="h-8 text-xs bg-primary hover:bg-primary-hover text-white rounded-xl shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> New Payment Link
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8 flex-wrap rounded-xl">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="text-xs px-2.5 py-0.5 capitalize rounded-lg">
                    {tab === 'all' ? 'All Rail Payments' : tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="mt-4 -mx-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="pl-6 text-xs uppercase tracking-wide">Transaction ID</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Customer</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-right">Amount</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Rail</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Date</TableHead>
                    <TableHead className="pr-6 text-xs uppercase tracking-wide text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                        No transactions found in this rail category.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((txn) => (
                      <TableRow key={txn.id} className="border-border hover:bg-slate-50/60 transition-colors">
                        <TableCell className="pl-6 font-bold text-foreground text-xs">{txn.id}</TableCell>
                        <TableCell className="text-xs font-medium text-foreground">{txn.customer}</TableCell>
                        <TableCell className="text-xs font-bold text-foreground text-right">{formatINR(txn.amount)}</TableCell>
                        <TableCell><StatusBadge status={txn.method} /></TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              txn.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : txn.status === 'Overdue'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {txn.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{txn.date}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {txn.payerViewUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(txn.payerViewUrl, '_blank')}
                                className="h-7 text-xs text-blue-600 hover:bg-blue-50 px-2"
                                title="Open PayPal Payer View"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" /> Pay Link
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPrintableData(buildReceiptDataFromTxn(txn))}
                              className="h-7 text-xs text-primary font-semibold hover:bg-accent px-2"
                            >
                              <Printer className="h-3 w-3 mr-1" /> Slip
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Bill Slip Modal */}
      <Dialog open={!!selectedTxn} onOpenChange={(open) => !open && setSelectedTxn(null)}>
        <DialogContent className="max-w-sm rounded-2xl p-6 bg-white shadow-xl">
          {selectedTxn && (
            <div className="space-y-4">
              <DialogHeader className="border-b pb-3">
                <div className="text-center">
                  <span className="text-xs uppercase font-bold text-primary tracking-wider">
                    {user?.businessName || 'Cashiko Business'}
                  </span>
                  <DialogTitle className="text-lg font-black mt-1">Payment Receipt</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Official payment settlement acknowledgment
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="space-y-2 text-xs py-2 border-b border-dashed">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-bold text-slate-900">{selectedTxn.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedTxn.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-semibold text-slate-800">{selectedTxn.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-700">{selectedTxn.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-700">{selectedTxn.date}</span>
                </div>
                {selectedTxn.details && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Particulars:</span>
                    <span className="text-slate-800 max-w-[180px] text-right truncate">{selectedTxn.details}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-sm font-extrabold pt-1">
                <span>Total Amount:</span>
                <span className="text-lg text-primary">{formatINR(selectedTxn.amount)}</span>
              </div>

              <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTxn(null)}
                  className="w-full text-xs"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setPrintableData(buildReceiptDataFromTxn(selectedTxn));
                    setSelectedTxn(null);
                  }}
                  className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
                >
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Receipt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modern Printable Thermal & A4 Receipt Modal */}
      <PrintableReceiptModal
        open={!!printableData}
        onOpenChange={(open) => !open && setPrintableData(null)}
        data={printableData}
      />

    </div>
  );
}
