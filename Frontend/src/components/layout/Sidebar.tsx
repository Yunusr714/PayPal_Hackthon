import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  BookOpen,
  Users,
  Package,
  CreditCard,
  Settings,
  Store,
  Scissors,
  Wrench,
  RefreshCw,
  Sparkles,
  FileText,
  MessageSquareQuote,
  History,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useBusiness } from '@/context/BusinessContext';
import { useReceivables } from '@/context/ReceivablesContext';

interface SidebarContentProps {
  onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, category, toggleCategory } = useBusiness();
  const { connectionStatus, metrics } = useReceivables();

  // Navigation items dynamically adapt to Shop vs Service
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    {
      label: category === 'service' ? 'Service Billings' : 'Sales & POS',
      path: '/sales',
      icon: category === 'service' ? Wrench : ShoppingCart,
    },
    { label: 'Khata / Credit Book', path: '/khata', icon: BookOpen },
    { label: 'Customers', path: '/customers', icon: Users },
    // Show Services for Service professionals, Inventory for Shops
    ...(category === 'service'
      ? [{ label: 'Services & Rates', path: '/services', icon: Scissors }]
      : [{ label: 'Inventory', path: '/inventory', icon: Package }]),
    {
      label: 'Intake with AI',
      path: '/create',
      icon: Sparkles,
      badge: 'AI',
    },
    {
      label: 'PayPal Invoices',
      path: '/invoices',
      icon: FileText,
      badge: 'v2',
    },
    {
      label: 'Reply Copilot',
      path: '/triage',
      icon: MessageSquareQuote,
    },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Activity Log', path: '/activity', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const isService = category === 'service';
  const themeColor = isService ? '#007F7C' : '#2563EB';

  return (
    <div className="flex h-full w-full flex-col bg-white border-r border-border box-border">
      {/* Brand Header */}
      <div className="flex h-16 w-full shrink-0 items-center px-5 border-b border-border bg-white box-border justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl shadow-xs text-white font-bold',
              isService ? 'bg-[#007F7C]' : 'bg-blue-600'
            )}
          >
            {isService ? <Wrench className="h-5 w-5" /> : <Store className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center">
              <span className="text-lg font-black tracking-tight text-foreground">Cashiko</span>
              <span className="ml-1.5 rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                Pro
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              {isService ? 'Service & Billing Suite' : 'Shop & Retail Suite'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 w-full overflow-y-auto px-3 py-3 scrollbar-thin space-y-1">
        <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
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
                    'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 relative group',
                    isActive
                      ? isService
                        ? 'bg-[#E6F5F5] text-[#007F7C] shadow-2xs'
                        : 'bg-blue-50 text-blue-600 shadow-2xs'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {isActive && (
                      <span
                        className={cn(
                          'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full',
                          isService ? 'bg-[#007F7C]' : 'bg-blue-600'
                        )}
                      />
                    )}
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105',
                        isActive
                          ? isService
                            ? 'text-[#007F7C]'
                            : 'text-blue-600'
                          : 'text-muted-foreground'
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase',
                        item.badge === 'AI'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-blue-100 text-blue-800'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Switcher Card: Restores the Mode Switcher */}
      <div className="w-full p-3 border-t border-border bg-slate-50/50 space-y-2">
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">Workspace Mode</span>
            <span
              className={cn(
                'text-[9px] font-bold px-2 py-0.5 rounded-full border',
                isService
                  ? 'bg-[#E6F5F5] text-[#007F7C] border-[#007F7C]/30'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              )}
            >
              {isService ? 'Service Mode (Teal)' : 'Shop Mode (Blue)'}
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
            Switch to {isService ? 'Shop Mode' : 'Service Mode'}
          </button>
        </div>

        {/* Integration Live Status */}
        <div className="flex items-center justify-between px-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">PayPal Sandbox v2</span>
          </div>
          <div className="flex items-center gap-1 text-indigo-600 font-bold">
            <Cpu className="h-3 w-3" />
            <span>Groq AI</span>
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
      <SheetContent side="left" className="w-64 p-0 border-r border-border">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
