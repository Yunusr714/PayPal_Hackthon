import React, { useState } from 'react';
import { toast } from 'sonner';
import { Briefcase, Calendar, User, Phone, IndianRupee, Plus, FileText } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBusiness, ServiceJob } from '@/context/BusinessContext';

interface AddJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (job: ServiceJob) => void;
}

export function AddJobDialog({ open, onOpenChange, onSuccess }: AddJobDialogProps) {
  const { services, addServiceJob } = useBusiness();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceName, setServiceName] = useState(services[0]?.name || 'Custom Service');
  const [amount, setAmount] = useState(services[0]?.price?.toString() || '500');
  const [dueDate, setDueDate] = useState('18 Oct 2026');
  const [notes, setNotes] = useState('');

  const handleServiceSelect = (val: string) => {
    setServiceName(val);
    const matched = services.find((s) => s.name === val);
    if (matched) {
      setAmount(matched.price.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const todayStr = '14 Oct 2026';
    const created = addServiceJob({
      customerName: customerName.trim(),
      phone: phone.trim() || '+91 98100 00000',
      serviceName,
      amount: numAmount,
      status: 'Scheduled',
      date: todayStr,
      dueDate: dueDate.trim() || 'Flexible',
      notes: notes.trim(),
    });

    toast.success('Service Job Created!', {
      description: `${created.id} booked for ${created.customerName} (₹${created.amount}).`,
    });

    setCustomerName('');
    setPhone('');
    setNotes('');
    onOpenChange(false);
    onSuccess?.(created);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-border bg-white p-6 shadow-2xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">New Service Work Order</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Book a new service job, tailor order, or plumbing service request.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="job-cust" className="text-xs font-semibold text-foreground">
                Customer Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="job-cust"
                  placeholder="e.g. Ramesh Uncle"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-10 pl-9 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="job-phone" className="text-xs font-semibold text-foreground">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="job-phone"
                  placeholder="+91 98100 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 pl-9 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Service Required</Label>
            <Select value={serviceName} onValueChange={handleServiceSelect}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name} (₹{s.price})
                  </SelectItem>
                ))}
                <SelectItem value="Custom Work Order">Custom / Other Work Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="job-amt" className="text-xs font-semibold text-foreground">
                Total Charge / Estimate (₹) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</span>
                <Input
                  id="job-amt"
                  type="number"
                  min="0"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10 pl-7 text-sm font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="job-due" className="text-xs font-semibold text-foreground">
                Delivery / Due Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="job-due"
                  placeholder="e.g. 18 Oct 2026"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-10 pl-9 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="job-notes" className="text-xs font-semibold text-foreground">
              Work Notes / Measurements / Details
            </Label>
            <Textarea
              id="job-notes"
              rows={2}
              placeholder="e.g. Measurements: Chest 38, Waist 32 / Pipe fitting in 2nd floor bathroom..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-sm resize-none"
            />
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
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Book Work Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
