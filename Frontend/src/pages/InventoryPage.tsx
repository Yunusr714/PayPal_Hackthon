import { useState } from 'react';
import { toast } from 'sonner';
import { Package, AlertTriangle, PackageX, IndianRupee, Plus, Pencil, ShoppingCart, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { KPICard } from '@/components/shared/KPICard';
import { ChartCard } from '@/components/shared/ChartCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GaugeChart } from '@/components/shared/Charts';
import { productsData, formatINR } from '@/data/mock-data';

const kpiCards = [
  { title: 'Total Products', value: '148', icon: Package, variant: 'default' as const },
  { title: 'Low Stock', value: '9', icon: AlertTriangle, variant: 'warning' as const },
  { title: 'Out of Stock', value: '2', icon: PackageX, variant: 'danger' as const },
  { title: 'Inventory Value', value: formatINR(245000), icon: IndianRupee, variant: 'default' as const },
];

export function InventoryPage() {
  const [search, setSearch] = useState('');

  const filtered = productsData.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <KPICard key={card.title} title={card.title} value={card.value} icon={card.icon} variant={card.variant} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard
          title="Inventory Health"
          subtitle="Overall stock status"
          className="lg:col-span-2"
        >
          <GaugeChart value={78} label="Healthy" height={220} />
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-success/10 px-3 py-2">
              <span className="text-sm text-foreground">Healthy Products</span>
              <span className="text-sm font-semibold text-success">137</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-warning/10 px-3 py-2">
              <span className="text-sm text-foreground">Low Stock</span>
              <span className="text-sm font-semibold text-warning">9</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-destructive/10 px-3 py-2">
              <span className="text-sm text-foreground">Critical</span>
              <span className="text-sm font-semibold text-destructive">2</span>
            </div>
          </div>
        </ChartCard>

        <Card className="rounded-xl border-border shadow-sm lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Product Inventory</CardTitle>
                <CardDescription className="text-xs">Manage your stock levels</CardDescription>
              </div>
              <Button size="sm" onClick={() => toast.success('Product form opened', { description: 'Add a new product.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="px-6 pb-3">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full max-w-xs rounded-lg border border-input bg-white px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
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
                  <TableRow key={product.name} className="border-border">
                    <TableCell className="pl-6 font-medium text-foreground text-sm">{product.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.category}</TableCell>
                    <TableCell className="text-sm text-foreground text-right">
                      {product.stock} {product.unit}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground text-right">{product.reorderLevel} {product.unit}</TableCell>
                    <TableCell className="text-sm text-muted-foreground text-right">{formatINR(product.costPrice)}</TableCell>
                    <TableCell className="text-sm font-medium text-foreground text-right">{formatINR(product.sellingPrice)}</TableCell>
                    <TableCell><StatusBadge status={product.status} /></TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.info('Editing product', { description: product.name })}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success('Reorder request created', { description: `${product.name} added to reorder list.` })}>
                            <ShoppingCart className="h-3.5 w-3.5 mr-2" /> Reorder
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
