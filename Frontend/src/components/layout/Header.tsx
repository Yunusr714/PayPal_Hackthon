import { useLocation } from 'react-router-dom';
import { Search, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { MobileSidebar } from './Sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Store performance overview' },
  '/ai-assistant': { title: 'AI Assistant', subtitle: 'Your AI khata & cash-flow copilot' },
  '/sales': { title: 'Sales', subtitle: 'Track and manage all your sales' },
  '/khata': { title: 'Khata / Credit Book', subtitle: 'Customer credit and outstanding dues' },
  '/customers': { title: 'Customers', subtitle: 'Manage your customer relationships' },
  '/inventory': { title: 'Inventory', subtitle: 'Stock levels and product management' },
  '/suppliers': { title: 'Suppliers', subtitle: 'Supplier payments and purchase orders' },
  '/payments': { title: 'Payments', subtitle: 'Payment transactions and collection' },
  '/reports': { title: 'Reports', subtitle: 'Business analytics and insights' },
  '/settings': { title: 'Settings', subtitle: 'Store configuration and preferences' },
};

export function Header() {
  const location = useLocation();
  const meta = pageMeta[location.pathname] || { title: 'KiranaPay', subtitle: '' };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div>
          <h1 className="text-base font-semibold text-foreground lg:text-lg">{meta.title}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">{meta.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customers, products, invoices..."
            className="h-9 w-64 rounded-lg border border-input bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-white transition-all lg:w-80"
          />
        </div>

        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-white" />
        </button>

        <button className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

        <div className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-muted transition-colors cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-white text-xs font-semibold">
              RS
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-foreground">Ramesh Sharma</p>
            <p className="text-[11px] text-muted-foreground">Store Owner</p>
          </div>
          <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
