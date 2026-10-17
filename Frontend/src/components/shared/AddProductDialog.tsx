import React, { useState } from 'react';
import { toast } from 'sonner';
import { Package, Plus, IndianRupee, Tag, Layers, BarChart2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBusiness } from '@/context/BusinessContext';
import { Product } from '@/data/mock-data';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (product: Product) => void;
}

export function AddProductDialog({ open, onOpenChange, onSuccess }: AddProductDialogProps) {
  const { addProduct } = useBusiness();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Grains');
  const [stock, setStock] = useState('20');
  const [unit, setUnit] = useState('kg');
  const [reorderLevel, setReorderLevel] = useState('5');
  const [costPrice, setCostPrice] = useState('40');
  const [sellingPrice, setSellingPrice] = useState('50');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter product name');
      return;
    }
    const numStock = parseFloat(stock);
    const numCost = parseFloat(costPrice);
    const numSelling = parseFloat(sellingPrice);
    const numReorder = parseFloat(reorderLevel);

    if (isNaN(numStock) || isNaN(numCost) || isNaN(numSelling)) {
      toast.error('Please enter valid numeric values');
      return;
    }

    const newProd: Product = {
      name: name.trim(),
      category,
      stock: numStock,
      unit,
      reorderLevel: numReorder || 5,
      costPrice: numCost,
      sellingPrice: numSelling,
      status: numStock <= 0 ? 'Critical' : numStock <= numReorder ? 'Low Stock' : 'In Stock',
    };

    addProduct(newProd);

    toast.success('Product Added to Inventory!', {
      description: `"${newProd.name}" added with ${newProd.stock} ${newProd.unit} in stock.`,
    });

    setName('');
    setStock('20');
    setCostPrice('40');
    setSellingPrice('50');
    onOpenChange(false);
    onSuccess?.(newProd);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-border bg-white p-6 shadow-2xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">Add New Inventory Item</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add a physical product, set stock levels, cost price, and reorder alerts.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="prod-name" className="text-xs font-semibold text-foreground">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="prod-name"
              placeholder="e.g. Fortune Mustard Oil (1L) or Basmati Rice 5kg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grains">Grains & Pulses</SelectItem>
                  <SelectItem value="Oil">Edible Oil & Ghee</SelectItem>
                  <SelectItem value="Dairy">Dairy & Eggs</SelectItem>
                  <SelectItem value="Bakery">Bakery & Breads</SelectItem>
                  <SelectItem value="Snacks">Snacks & Biscuits</SelectItem>
                  <SelectItem value="Household">Household & Cleaning</SelectItem>
                  <SelectItem value="Beverages">Beverages & Cold Drinks</SelectItem>
                  <SelectItem value="Spices">Spices & Masalas</SelectItem>
                  <SelectItem value="Hardware">Hardware & Tools</SelectItem>
                  <SelectItem value="General">General Merchandise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Unit of Measurement</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="units">Units / Pieces (pcs)</SelectItem>
                  <SelectItem value="litres">Litres (L)</SelectItem>
                  <SelectItem value="packets">Packets</SelectItem>
                  <SelectItem value="bottles">Bottles</SelectItem>
                  <SelectItem value="boxes">Boxes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="prod-stock" className="text-xs font-semibold text-foreground">
                Current Stock Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prod-stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="h-10 text-sm font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-reorder" className="text-xs font-semibold text-foreground">
                Low Stock Alert Threshold
              </Label>
              <Input
                id="prod-reorder"
                type="number"
                min="1"
                step="1"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="prod-cost" className="text-xs font-semibold text-foreground">
                Cost Price (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</span>
                <Input
                  id="prod-cost"
                  type="number"
                  min="0"
                  step="0.5"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="h-10 pl-7 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-sell" className="text-xs font-semibold text-foreground">
                Selling Price (₹) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</span>
                <Input
                  id="prod-sell"
                  type="number"
                  min="0"
                  step="0.5"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="h-10 pl-7 text-sm font-semibold text-primary"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Save Product to Inventory
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
