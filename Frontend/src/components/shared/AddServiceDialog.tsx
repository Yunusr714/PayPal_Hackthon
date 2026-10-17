import React, { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Clock, IndianRupee, Sparkles } from 'lucide-react';
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
import { useBusiness, ServiceItem } from '@/context/BusinessContext';

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (service: ServiceItem) => void;
}

export function AddServiceDialog({ open, onOpenChange, onSuccess }: AddServiceDialogProps) {
  const { addService } = useBusiness();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tailoring');
  const [pricingType, setPricingType] = useState<'Fixed' | 'Hourly' | 'Per Unit' | 'Inspection Fee'>('Fixed');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('1-2 days');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a service name');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error('Please enter a valid price/rate');
      return;
    }

    const created = addService({
      name: name.trim(),
      category: category || 'General',
      pricingType,
      price: numPrice,
      duration: duration.trim() || 'Standard turnaround',
      description: 'Professional service with satisfaction guarantee.',
      isAvailable: true,
    });

    toast.success('Service Added Successfully!', {
      description: `"${created.name}" is now live in your service catalog at ₹${created.price}.`,
    });

    // Reset form
    setName('');
    setPrice('');
    setDuration('1-2 days');
    onOpenChange(false);
    onSuccess?.(created);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-border bg-white p-6 shadow-2xl">
        <DialogHeader className="pb-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">Add New Service</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set up a new service offering and labor rate card.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="srv-name" className="text-xs font-semibold text-foreground">
              Service Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="srv-name"
              placeholder="e.g. Suit Stitching, Pipe Leak Repair"
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
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tailoring">Tailoring & Boutique</SelectItem>
                  <SelectItem value="Plumbing">Plumbing & Sanitary</SelectItem>
                  <SelectItem value="Electrical">Electrical Works</SelectItem>
                  <SelectItem value="Appliance Repair">Appliance & AC Repair</SelectItem>
                  <SelectItem value="Salon & Beauty">Salon, Barber & Grooming</SelectItem>
                  <SelectItem value="Carpentry">Carpentry & Furniture</SelectItem>
                  <SelectItem value="Cleaning">Cleaning & Housekeeping</SelectItem>
                  <SelectItem value="General">Custom / Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Pricing Structure</Label>
              <Select
                value={pricingType}
                onValueChange={(v) => setPricingType(v as any)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed">Fixed Rate</SelectItem>
                  <SelectItem value="Hourly">Hourly Rate</SelectItem>
                  <SelectItem value="Per Unit">Per Item / Unit</SelectItem>
                  <SelectItem value="Inspection Fee">Inspection Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="srv-price" className="text-xs font-semibold text-foreground">
                Rate / Charge (₹) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</span>
                <Input
                  id="srv-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 450"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-10 pl-7 text-sm font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="srv-dur" className="text-xs font-semibold text-foreground">
                Turnaround / Duration
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="srv-dur"
                  placeholder="e.g. 1-2 hours or 2 days"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-10 pl-9 text-sm"
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Save Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
