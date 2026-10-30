import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Plus, ChevronRight, UserCheck, Scissors, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useBusiness } from '@/context/BusinessContext';
import { formatINR } from '@/data/mock-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function CustomersPage() {
  const navigate = useNavigate();
  const { customers, addCustomer, isSyncing, user } = useBusiness();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  // Add Customer modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustCategory, setNewCustCategory] = useState<string>(user.category === 'service' ? 'service' : 'shop');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (!newCustPhone.trim()) {
      toast.error('Please enter customer contact phone');
      return;
    }

    try {
      setIsSubmitting(true);
      await addCustomer({
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        email: newCustEmail.trim() || undefined,
        category: newCustCategory,
      });
      toast.success('Customer Registered Successfully!', {
        description: `${newCustName} added to the SQLite database.`,
      });
      setNewCustName('');
      setNewCustPhone('');
      setNewCustEmail('');
      setIsAddOpen(false);
    } catch (err: any) {
      toast.error('Failed to create customer', { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
      const risk = c.riskScore < 30 ? 'Low' : c.riskScore < 60 ? 'Medium' : 'High';
      const matchRisk = riskFilter === 'all' || risk === riskFilter;
      return matchSearch && matchRisk;
    });
  }, [customers, search, riskFilter]);

  const handleCardClick = (customerName: string) => {
    navigate(`/customers/${encodeURIComponent(customerName)}`);
  };

  const getCategoryBadge = (category?: string) => {
    const cat = (category || 'both').toLowerCase();
    if (cat === 'service') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F5F5] text-[#007F7C] border border-[#007F7C]/30">
          <Scissors className="h-2.5 w-2.5" /> Service
        </span>
      );
    }
    if (cat === 'shop') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <ShoppingBag className="h-2.5 w-2.5" /> Retail
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
        <Sparkles className="h-2.5 w-2.5" /> Both
      </span>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
          Customers
        </h1>
        <p className="text-xs text-zinc-500 font-normal mt-1">
          Customer directory, trust health & order history
        </p>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-input bg-white pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-36 h-9 text-xs rounded-xl">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="Low">Low Risk</SelectItem>
              <SelectItem value="Medium">Medium Risk</SelectItem>
              <SelectItem value="High">High Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setNewCustCategory(user.category === 'service' ? 'service' : 'shop');
            setIsAddOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary-hover shrink-0 text-xs font-semibold rounded-xl shadow-xs"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add Customer
        </Button>
      </div>

      {/* Add Customer Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Add New Customer</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Register a customer to the live SQLite ledger with real-time balance tracking.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCustomer} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Customer Full Name *</Label>
              <Input
                placeholder="e.g. Ramesh Patel"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                required
                className="text-xs h-9 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Phone Number (with WhatsApp) *</Label>
              <Input
                placeholder="e.g. +91 98123 45678"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                required
                className="text-xs h-9 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Email Address (Optional)</Label>
              <Input
                type="email"
                placeholder="e.g. ramesh@gmail.com"
                value={newCustEmail}
                onChange={(e) => setNewCustEmail(e.target.value)}
                className="text-xs h-9 rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl"
              >
                {isSubmitting ? 'Saving to DB...' : 'Register Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((customer) => (
          <Card
            key={customer.name}
            onClick={() => handleCardClick(customer.name)}
            className="cursor-pointer rounded-2xl border-border bg-white shadow-sm hover:shadow-md hover:border-primary/40 transition-all group"
          >
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-slate-100">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                        {customer.name}
                      </p>
                      {getCategoryBadge(customer.category)}
                    </div>
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Total Khata</p>
                    <p className="text-xs font-bold text-foreground">{formatINR(customer.totalPurchases)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Outstanding</p>
                    <p className={`text-xs font-bold ${customer.outstanding > 0 ? 'text-destructive font-extrabold' : 'text-emerald-700'}`}>
                      {formatINR(customer.outstanding)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-[11px] text-muted-foreground">Visit: {customer.lastVisit}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:underline">
                    View Ledger <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141518] p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <UserCheck className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">No customers registered yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Your customer ledger is empty and ready for real data. Add your first customer to track khata dues and generate PayPal payment reminders.
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="mt-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add First Customer
          </Button>
        </div>
      )}
    </div>
  );
}
