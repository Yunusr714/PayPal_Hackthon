import { useState } from 'react';
import { toast } from 'sonner';
import { Truck, IndianRupee, AlertTriangle, Calendar, Eye, CreditCard, Bell, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { suppliersData, formatINR } from '@/data/mock-data';

const kpiCards = [
  { title: 'Total Suppliers', value: '12', icon: Truck, variant: 'default' as const },
  { title: 'Pending Payments', value: formatINR(42000), icon: IndianRupee, variant: 'warning' as const },
  { title: 'Overdue Payments', value: formatINR(8500), icon: AlertTriangle, variant: 'danger' as const },
  { title: 'Next Payment Due', value: 'Friday', icon: Calendar, variant: 'default' as const },
];

export function SuppliersPage() {
  const [search, setSearch] = useState('');

  const filtered = suppliersData.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <KPICard key={card.title} title={card.title} value={card.value} icon={card.icon} variant={card.variant} />
        ))}
      </div>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Supplier Directory</CardTitle>
              <CardDescription className="text-xs">Manage suppliers and track payments</CardDescription>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full sm:w-64 rounded-lg border border-input bg-white px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase tracking-wide">Supplier</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Category</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Contact</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-right">Total Purchases</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-right">Pending Amount</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Due Date</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="pr-6 text-xs uppercase tracking-wide text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((supplier) => (
                <TableRow key={supplier.name} className="border-border">
                  <TableCell className="pl-6 font-medium text-foreground text-sm">{supplier.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{supplier.category}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{supplier.contact}</TableCell>
                  <TableCell className="text-sm text-foreground text-right">{formatINR(supplier.totalPurchases)}</TableCell>
                  <TableCell className="text-sm font-semibold text-foreground text-right">
                    {supplier.pendingAmount > 0 ? formatINR(supplier.pendingAmount) : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{supplier.dueDate}</TableCell>
                  <TableCell><StatusBadge status={supplier.status} /></TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info('Viewing supplier', { description: supplier.name })}>
                          <Eye className="h-3.5 w-3.5 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success('Payment initiated', { description: `Payment to ${supplier.name} started.` })}>
                          <CreditCard className="h-3.5 w-3.5 mr-2" /> Pay
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success('Reminder sent', { description: `Reminder sent to ${supplier.name}.` })}>
                          <Bell className="h-3.5 w-3.5 mr-2" /> Remind
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
  );
}
