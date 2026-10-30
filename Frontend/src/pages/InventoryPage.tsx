import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Package, AlertTriangle, PackageX, IndianRupee, Plus,
  Scissors, Sparkles, MoreHorizontal, Search, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AddProductDialog } from '@/components/shared/AddProductDialog';
import { useBusiness } from '@/context/BusinessContext';
import { formatINR } from '@/data/mock-data';

export function InventoryPage() {
  const navigate = useNavigate();
  const { products, category } = useBusiness();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter((p) => p.status === 'Low Stock').length;
  const criticalCount = products.filter((p) => p.status === 'Critical').length;
  const totalValue = products.reduce((acc, p) => acc + p.stock * p.sellingPrice, 0);

  const kpiCards = [
    { title: 'Total Products', value: products.length.toString(), icon: Package, variant: 'default' as const },
    { title: 'Low Stock', value: lowStockCount.toString(), icon: AlertTriangle, variant: 'warning' as const },
    { title: 'Out of Stock', value: criticalCount.toString(), icon: PackageX, variant: 'danger' as const },
    { title: 'Inventory Value', value: formatINR(totalValue), icon: IndianRupee, variant: 'default' as const },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
          Inventory Management
        </h1>
        <p className="text-xs text-zinc-500 font-normal mt-1">
          Stock quantities, reorder thresholds & SKUs
        </p>
      </div>

      {/* Notice for Service Providers */}
      {category === 'service' && (
        <div className="rounded-2xl border border-[#007F7C]/30 bg-[#E6F5F5]/70 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#007F7C] text-white">
                <Scissors className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  You are in Service Business Mode
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Service professionals (tailors, plumbers, electricians) have <strong className="text-[#007F7C]">no inventory</strong>. You manage your Services & Rate Card instead.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => navigate('/services')}
                className="bg-[#007F7C] hover:bg-[#006663] text-white text-xs font-semibold"
              >
                Go to Services & Rates
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <KPICard key={card.title} title={card.title} value={card.value} icon={card.icon} variant={card.variant} />
        ))}
      </div>

      <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Product Inventory</CardTitle>
                <CardDescription className="text-xs">Manage your store stock and price points</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="px-6 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products or categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-full max-w-xs rounded-xl border border-input bg-white pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="pl-6 text-xs uppercase tracking-wide">Product</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Category</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-right">Stock</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-right">Reorder At</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-right">Cost</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-right">Selling</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                  <TableHead className="pr-6 text-xs uppercase tracking-wide text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((product) => (
                  <TableRow key={product.name} className="border-border hover:bg-muted/40">
                    <TableCell className="pl-6 font-semibold text-foreground text-xs">{product.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{product.category}</TableCell>
                    <TableCell className="text-xs text-foreground font-bold text-right">
                      {product.stock} {product.unit}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground text-right">
                      {product.reorderLevel} {product.unit}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground text-right">{formatINR(product.costPrice)}</TableCell>
                    <TableCell className="text-xs font-bold text-foreground text-right">{formatINR(product.sellingPrice)}</TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.success('Reorder placed', { description: `Supplier notified for ${product.name}.` })}
                        className="h-7 text-xs text-primary font-semibold hover:bg-accent"
                      >
                        Reorder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AddProductDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
      />
    </div>
  );
}
