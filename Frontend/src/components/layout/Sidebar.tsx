import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Sparkles, ShoppingCart, BookOpen, Users,
  Package, Truck, CreditCard, BarChart3, Settings,
  Store, Scissors, Wrench, RefreshCw, UserPlus, LogIn, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useBusiness } from '@/context/BusinessContext';

interface SidebarContentProps {
  onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, category, toggleCategory } = useBusiness();

  // Navigation items dynamically adapt to Shop vs Service
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    {
      label: category === 'service' ? 'Service Billings' : 'Sales & Invoices',
      path: '/sales',
      icon: category === 'service' ? Wrench : ShoppingCart,
    },
    { label: 'Khata / Credit Book', path: '/khata', icon: BookOpen },
    { label: 'Customers', path: '/customers', icon: Users },
    // Show Services for Service professionals, Inventory for Shops
    ...(category === 'service'
      ? [{ label: 'Services & Rates', path: '/services', icon: Scissors }]
      : [{ label: 'Inventory', path: '/inventory', icon: Package }]),
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Brand Header: Aligns seamlessly with the h-16 top header with zero gap */}
      <div className="flex h-16 w-full shrink-0 items-center px-5 border-b border-border bg-white box-border">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl shadow-sm text-white',
            category === 'service' ? 'bg-[#007F7C] shadow-[#007F7C]/20' : 'bg-blue-600 shadow-blue-600/20'
          )}>
            {category === 'service' ? <Wrench className="h-5 w-5" /> : <Store className="h-5 w-5" />}
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-foreground">KiranaPay</span>
            <span className="ml-1.5 rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
              Pro
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 w-full overflow-y-auto px-3 py-3 scrollbar-thin">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Navigation
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 relative group',
                    isActive
                      ? category === 'service'
                        ? 'bg-[#E6F5F5] text-[#007F7C] font-bold shadow-2xs'
                        : 'bg-blue-50 text-blue-600 font-bold shadow-2xs'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <span
                      className={cn(
                        'absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full',
                        category === 'service' ? 'bg-[#007F7C]' : 'bg-blue-600'
                      )}
                    />
                  )}
                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:scale-105',
                      isActive
                        ? category === 'service'
                          ? 'text-[#007F7C]'
                          : 'text-blue-600'
                        : 'text-muted-foreground'
                    )}
                  />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Switcher Card: Completely replaces the old "Upgrade Plan" box */}
      <div className="w-full p-3 border-t border-border bg-slate-50/50">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">Workspace Mode</span>
            <span
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                category === 'service'
                  ? 'bg-[#E6F5F5] text-[#007F7C] border-[#007F7C]/30'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              )}
            >
              {category === 'service' ? 'Service (Teal)' : 'Shop (Blue)'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              toggleCategory();
              onNavigate?.();
            }}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 py-1.5 px-2 text-xs font-semibold text-slate-800 transition-colors"
          >
            <RefreshCw className="h-3 w-3 text-slate-500" />
            Switch to {category === 'service' ? 'Shop Mode' : 'Service Mode'}
          </button>

          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
            <NavLink
              to="/register"
              onClick={onNavigate}
              className="inline-flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 hover:text-primary py-1"
            >
              <UserPlus className="h-3 w-3" /> Register
            </NavLink>
            <NavLink
              to="/login"
              onClick={onNavigate}
              className="inline-flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 hover:text-primary py-1"
            >
              <LogIn className="h-3 w-3" /> Sign In
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 border-r border-border z-30 bg-white box-border">
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
