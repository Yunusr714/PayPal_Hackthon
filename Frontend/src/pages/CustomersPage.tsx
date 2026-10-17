import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Plus, BookOpen, ChevronRight, Phone, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useBusiness } from '@/context/BusinessContext';
import { formatINR } from '@/data/mock-data';

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function CustomersPage() {
  const navigate = useNavigate();
  const { customers } = useBusiness();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

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

  return (
    <div className="space-y-5 animate-fade-in">
      
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
            <SelectTrigger className="w-full sm:w-40 h-9 text-xs rounded-xl">
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
          onClick={() => toast.success('Customer form opened', { description: 'Add a new customer to directory.' })}
          className="bg-primary text-primary-foreground hover:bg-primary-hover shrink-0 text-xs font-semibold rounded-xl"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Add Customer
        </Button>
      </div>

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
                    <p className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                      {customer.name}
                    </p>
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
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm font-semibold">No customers found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
