import { useState } from 'react';
import { toast } from 'sonner';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, Send, Eye, CreditCard, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard';
import { ChartCard } from '@/components/shared/ChartCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RingChartCard } from '@/components/shared/Charts';
import { khataData, formatINR, collectionRingData } from '@/data/mock-data';

const summaryCards = [
  { title: 'Total Credit Given', value: formatINR(124500), icon: Wallet, variant: 'default' as const },
  { title: 'Total Collected', value: formatINR(85800), icon: TrendingUp, variant: 'default' as const },
  { title: 'Outstanding', value: formatINR(38700), icon: TrendingDown, variant: 'warning' as const },
  { title: 'Overdue Amount', value: formatINR(9400), icon: AlertTriangle, variant: 'danger' as const },
];

export function KhataPage() {
  const [search, setSearch] = useState('');

  const filtered = khataData.filter(
    (k) => k.customer.toLowerCase().includes(search.toLowerCase()) || k.phone.includes(search)
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <KPICard key={card.title} title={card.title} value={card.value} icon={card.icon} variant={card.variant} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard
          title="Collection Status"
          subtitle="Payment collection breakdown"
          className="lg:col-span-2"
        >
          <RingChartCard
            data={collectionRingData}
            height={280}
            centerValue={formatINR(38700)}
            centerLabel="Outstanding"
          />
        </ChartCard>

        <Card className="rounded-xl border-border shadow-sm lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Customer-wise Khata</CardTitle>
                <CardDescription className="text-xs">Outstanding credit by customer</CardDescription>
              </div>
              <Button size="sm" onClick={() => toast.success('Bulk reminders sent', { description: 'Reminders sent to all customers with dues.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover">
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
                className="h-9 w-full max-w-xs rounded-lg border border-input bg-white px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6 text-xs uppercase tracking-wide">Customer</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Phone</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-right">Total Credit</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-right">Outstanding</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Due Date</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Risk</TableHead>
                  <TableHead className="pr-6 text-xs uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow key={entry.customer} className="border-border">
                    <TableCell className="pl-6 font-medium text-foreground text-sm">{entry.customer}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.phone}</TableCell>
                    <TableCell className="text-sm text-foreground text-right">{formatINR(entry.totalCredit)}</TableCell>
                    <TableCell className="text-sm font-semibold text-foreground text-right">{formatINR(entry.outstanding)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.dueDate}</TableCell>
                    <TableCell><StatusBadge status={entry.risk} /></TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.info('Viewing khata', { description: entry.customer })}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success('Reminder sent', { description: `Reminder sent to ${entry.customer}.` })}>
                            <Bell className="h-3.5 w-3.5 mr-2" /> Remind
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success('Payment link created', { description: `Payment link sent to ${entry.customer}.` })}>
                            <CreditCard className="h-3.5 w-3.5 mr-2" /> Collect Payment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
