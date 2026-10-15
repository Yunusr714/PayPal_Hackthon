import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Search, Plus, Eye, Pencil, Bell, Trash2, MoreHorizontal, IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink,
} from '@/components/ui/pagination';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { allSales, formatINR, type Sale } from '@/data/mock-data';

export function SalesPage() {
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const filtered = useMemo(() => {
    return allSales.filter((s) => {
      const matchSearch = s.customer.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.items.toLowerCase().includes(search.toLowerCase());
      const matchMode = modeFilter === 'all' || s.mode === modeFilter;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchMode && matchStatus;
    });
  }, [search, modeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const current = Math.min(page, totalPages);
  const pageData = filtered.slice((current - 1) * itemsPerPage, current * itemsPerPage);

  const handleRemind = (sale: Sale) => toast.success('Reminder sent successfully', { description: `Reminder sent to ${sale.customer}.` });
  const handleDelete = (sale: Sale) => toast.success('Sale deleted', { description: `${sale.id} has been removed.` });
  const handleNewSale = () => toast.success('Sale saved successfully', { description: 'New invoice has been created.' });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sales..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-9 w-full rounded-lg border border-input bg-white pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Select value={modeFilter} onValueChange={(v) => { setModeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36 h-9">
              <SelectValue placeholder="Payment Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="Credit">Credit</SelectItem>
              <SelectItem value="PayPal">PayPal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-32 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleNewSale} className="bg-primary text-primary-foreground hover:bg-primary-hover shrink-0">
          <Plus className="h-4 w-4 mr-1.5" /> New Sale
        </Button>
      </div>

      <Card className="rounded-xl border-border shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase tracking-wide">Invoice ID</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Customer</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Items</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-right">Amount</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Mode</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wide">Due Date</TableHead>
                <TableHead className="pr-6 text-xs uppercase tracking-wide text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No sales found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((sale) => (
                  <TableRow key={sale.id} className="border-border">
                    <TableCell className="pl-6 font-medium text-foreground text-sm">{sale.id}</TableCell>
                    <TableCell className="text-sm text-foreground">{sale.customer}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">{sale.items}</TableCell>
                    <TableCell className="text-sm font-semibold text-foreground text-right">{formatINR(sale.amount)}</TableCell>
                    <TableCell><StatusBadge status={sale.mode} /></TableCell>
                    <TableCell><StatusBadge status={sale.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{sale.dueDate || '—'}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.info('Viewing sale details', { description: sale.id })}>
                            <Eye className="h-3.5 w-3.5 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info('Editing sale', { description: sale.id })}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemind(sale)}>
                            <Bell className="h-3.5 w-3.5 mr-2" /> Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(sale)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {pageData.length > 0 ? (current - 1) * itemsPerPage + 1 : 0}–{(current - 1) * itemsPerPage + pageData.length} of {filtered.length}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage(Math.max(1, current - 1))} className={current === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink isActive={current === i + 1} onClick={() => setPage(i + 1)} className="cursor-pointer">
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPage(Math.min(totalPages, current + 1))} className={current === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
