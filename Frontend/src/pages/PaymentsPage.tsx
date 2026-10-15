import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { IndianRupee, Clock, CreditCard, RotateCcw, Plus, Eye, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { KPICard } from '@/components/shared/KPICard';
import { ChartCard } from '@/components/shared/ChartCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PieChartCard } from '@/components/shared/Charts';
import { transactionsData, paymentMethodData, formatINR, type Transaction } from '@/data/mock-data';

const kpiCards = [
  { title: 'Payments Received Today', value: formatINR(9650), icon: IndianRupee, variant: 'default' as const },
  { title: 'Pending Payments', value: formatINR(38700), icon: Clock, variant: 'warning' as const },
  { title: 'PayPal Payments', value: formatINR(4200), icon: CreditCard, variant: 'default' as const },
  { title: 'Refunds', value: formatINR(350), icon: RotateCcw, variant: 'danger' as const },
];

const tabs = ['all', 'Cash', 'UPI', 'Credit', 'PayPal', 'Refunds'];

export function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = useMemo(() => {
    if (activeTab === 'all') return transactionsData;
    if (activeTab === 'Refunds') return transactionsData.filter((t) => t.status === 'Failed');
    return transactionsData.filter((t) => t.method === activeTab);
  }, [activeTab]);

  const handleReceipt = (txn: Transaction) => toast.info('Viewing receipt', { description: txn.id });
  const handleDownload = (txn: Transaction) => toast.success('Receipt downloaded', { description: `${txn.id}.pdf downloaded.` });
  const handleCreateLink = () => toast.success('Payment link created', { description: 'Payment link ready to share.' });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <KPICard key={card.title} title={card.title} value={card.value} icon={card.icon} variant={card.variant} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Payment Method Split"
          subtitle="Distribution by payment type"
          className="lg:col-span-1"
        >
          <PieChartCard data={paymentMethodData} height={240} />
        </ChartCard>

        <Card className="rounded-xl border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Transactions</CardTitle>
                <CardDescription className="text-xs">All payment transactions</CardDescription>
              </div>
              <Button size="sm" onClick={handleCreateLink} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Payment Link
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8 flex-wrap">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="text-xs px-2.5 py-0.5 capitalize">
                    {tab === 'all' ? 'All Payments' : tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="mt-4 -mx-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="pl-6 text-xs uppercase tracking-wide">Transaction</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Customer</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-right">Amount</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Method</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Date</TableHead>
                    <TableHead className="pr-6 text-xs uppercase tracking-wide text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                        No transactions in this category.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((txn) => (
                      <TableRow key={txn.id} className="border-border">
                        <TableCell className="pl-6 font-medium text-foreground text-sm">{txn.id}</TableCell>
                        <TableCell className="text-sm text-foreground">{txn.customer}</TableCell>
                        <TableCell className="text-sm font-semibold text-foreground text-right">{formatINR(txn.amount)}</TableCell>
                        <TableCell><StatusBadge status={txn.method} /></TableCell>
                        <TableCell><StatusBadge status={txn.status} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{txn.date}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleReceipt(txn)}>
                                <Eye className="h-3.5 w-3.5 mr-2" /> View Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(txn)}>
                                <Download className="h-3.5 w-3.5 mr-2" /> Download
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
    </div>
  );
}
