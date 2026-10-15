import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Search, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { customersData, formatINR } from '@/data/mock-data';

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function CustomersPage() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  const filtered = useMemo(() => {
    return customersData.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
      const risk = c.riskScore < 30 ? 'Low' : c.riskScore < 60 ? 'Medium' : 'High';
      const matchRisk = riskFilter === 'all' || risk === riskFilter;
      return matchSearch && matchRisk;
    });
  }, [search, riskFilter]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-white pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-40 h-9">
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
        <Button onClick={() => toast.success('Customer form opened', { description: 'Add a new customer.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover shrink-0">
          <Plus className="h-4 w-4 mr-1.5" /> Add Customer
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((customer) => {
          const risk = customer.riskScore < 30 ? 'Low' : customer.riskScore < 60 ? 'Medium' : 'High';
          return (
            <Card key={customer.name} className="rounded-xl border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm truncate">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Purchases</p>
                    <p className="text-sm font-semibold text-foreground">{formatINR(customer.totalPurchases)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className={`text-sm font-semibold ${customer.outstanding > 0 ? 'text-warning' : 'text-foreground'}`}>
                      {formatINR(customer.outstanding)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Payment Behaviour</span>
                    <StatusBadge status={customer.behaviour} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Risk Level</span>
                    <StatusBadge status={risk} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Risk Score</span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${customer.riskScore < 30 ? 'bg-success' : customer.riskScore < 60 ? 'bg-warning' : 'bg-destructive'}`}
                          style={{ width: `${customer.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground">{customer.riskScore}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">Last visit: {customer.lastVisit}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast.info('Viewing khata', { description: customer.name })}
                    className="text-primary hover:bg-accent px-2 h-7"
                  >
                    <BookOpen className="h-3.5 w-3.5 mr-1" /> View Khata
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No customers found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
