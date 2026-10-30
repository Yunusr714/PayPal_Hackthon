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
  const [category, setCategory] = useState('Shirts & Tops');
  const [stock, setStock] = useState('15');
  const [unit, setUnit] = useState('units');
  const [reorderLevel, setReorderLevel] = useState('3');
  const [costPrice, setCostPrice] = useState('450');
  const [sellingPrice, setSellingPrice] = useState('799');

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
      reorderLevel: numReorder || 3,
      costPrice: numCost,
      sellingPrice: numSelling,
      status: numStock <= 0 ? 'Critical' : numStock <= (numReorder || 3) ? 'Low Stock' : 'In Stock',
    };

    addProduct(newProd);

    toast.success('Product Added to Inventory!', {
      description: `"${newProd.name}" (${category}) added with ${newProd.stock} ${newProd.unit} in stock.`,
    });

    setName('');
    setStock('15');
    setCostPrice('450');
    setSellingPrice('799');
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
                Add apparel or retail merchandise, set stock levels, cost price, and reorder alerts.
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
              placeholder="e.g. Cotton Oxford Shirt, Silk Saree, Denim Jacket, Embroidered Kurti"
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
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Fashion & Apparel
                  </div>
                  <SelectItem value="Sarees & Ethnic Wear">Sarees & Ethnic Wear</SelectItem>
                  <SelectItem value="Kurtas & Kurtis">Kurtas & Kurtis</SelectItem>
                  <SelectItem value="Shirts & Tops">Shirts & Tops</SelectItem>
                  <SelectItem value="Jeans & Trousers">Jeans & Trousers</SelectItem>
                  <SelectItem value="Dresses & Gowns">Dresses & Gowns</SelectItem>
                  <SelectItem value="Suits & Blazers">Suits & Blazers</SelectItem>
                  <SelectItem value="Fabrics & Cloth">Fabrics & Cloth Materials</SelectItem>
                  <SelectItem value="Dupattas & Stoles">Dupattas & Stoles</SelectItem>
                  <SelectItem value="Bridal & Designer">Bridal & Designer Wear</SelectItem>
                  <SelectItem value="Kids & Baby Wear">Kids & Baby Wear</SelectItem>
                  <SelectItem value="Fashion Accessories">Fashion Accessories & Bags</SelectItem>
                  <SelectItem value="Footwear">Footwear & Shoes</SelectItem>
                  <SelectItem value="General Fashion">General Fashion & Apparel</SelectItem>

                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-t border-border mt-1">
                    Retail & General Merchandise
                  </div>
                  <SelectItem value="General Merchandise">General Merchandise</SelectItem>
                  <SelectItem value="Grains & Pulses">Grains & Pulses</SelectItem>
                  <SelectItem value="Edible Oil & Ghee">Edible Oil & Ghee</SelectItem>
                  <SelectItem value="Dairy & Bakery">Dairy & Bakery</SelectItem>
                  <SelectItem value="Snacks & Biscuits">Snacks & Biscuits</SelectItem>
                  <SelectItem value="Household & Cleaning">Household & Cleaning</SelectItem>
                  <SelectItem value="Beverages & Drinks">Beverages & Drinks</SelectItem>
                  <SelectItem value="Hardware & Tools">Hardware & Tools</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Unit of Measurement</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="units">Pieces / Units (pcs)</SelectItem>
                  <SelectItem value="meters">Meters (m)</SelectItem>
                  <SelectItem value="sets">Sets / Pairs (set)</SelectItem>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="packets">Packets (pkt)</SelectItem>
                  <SelectItem value="boxes">Boxes (box)</SelectItem>
                  <SelectItem value="litres">Litres (L)</SelectItem>
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
