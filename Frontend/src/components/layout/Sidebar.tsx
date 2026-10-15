import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Sparkles, ShoppingCart, BookOpen, Users,
  Package, Truck, CreditCard, BarChart3, Settings,
  ShoppingBasket, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Sparkles, ShoppingCart, BookOpen, Users,
  Package, Truck, CreditCard, BarChart3, Settings,
};

const navItems = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { label: 'AI Assistant', path: '/ai-assistant', icon: 'Sparkles' },
  { label: 'Sales', path: '/sales', icon: 'ShoppingCart' },
  { label: 'Khata / Credit Book', path: '/khata', icon: 'BookOpen' },
  { label: 'Customers', path: '/customers', icon: 'Users' },
  { label: 'Inventory', path: '/inventory', icon: 'Package' },
  { label: 'Suppliers', path: '/suppliers', icon: 'Truck' },
  { label: 'Payments', path: '/payments', icon: 'CreditCard' },
  { label: 'Reports', path: '/reports', icon: 'BarChart3' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
];

interface SidebarContentProps {
  onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="px-5 pt-6 pb-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <ShoppingBasket className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">KiranaPay</span>
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold text-foreground">Sharma Kirana Store</p>
          <p className="text-xs text-muted-foreground">Ramesh Sharma</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Menu</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative',
                    isActive
                      ? 'bg-accent text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
                  )}
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-border">
        <div className="rounded-xl bg-gradient-to-br from-accent to-blue-50 p-4 border border-blue-100">
          <p className="text-sm font-semibold text-foreground">Upgrade Plan</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Unlock advanced AI insights and unlimited reminders.
          </p>
          <Button
            size="sm"
            className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary-hover"
          >
            Upgrade <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 border-r border-border z-30">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-foreground hover:bg-muted transition-colors">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 border-r border-border">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
