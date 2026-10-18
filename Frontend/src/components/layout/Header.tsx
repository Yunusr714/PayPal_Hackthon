import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  RefreshCw,
  Store,
  Scissors,
  Wrench,
  UserPlus,
  LogIn,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { MobileSidebar } from './Sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/context/BusinessContext';
import { useReceivables } from '@/context/ReceivablesContext';
import { AIChatbotDrawer } from '@/components/shared/AIChatbotDrawer';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Business performance & operations overview' },
  '/services': { title: 'Services & Rate Card', subtitle: 'Manage service pricing, job types & rate cards' },
  '/create': { title: 'Smart Intake with AI', subtitle: 'Extract structured items from raw briefs via Groq AI' },
  '/invoices': { title: 'PayPal Invoices Ledger', subtitle: 'Live PayPal Sandbox Invoicing API v2 execution & tracking' },
  '/triage': { title: 'Customer Reply Copilot', subtitle: '7-intent classification, promised date detection & grounded replies' },
  '/sales': { title: 'Sales & Invoices', subtitle: 'Track and generate customer bills' },
  '/khata': { title: 'Khata / Credit Book', subtitle: 'Customer credit, dues & automated reminders' },
  '/customers': { title: 'Customers', subtitle: 'Customer profiles, credit health & history' },
  '/inventory': { title: 'Inventory Management', subtitle: 'Stock levels, reorder thresholds & products' },
  '/payments': { title: 'Payments', subtitle: 'UPI, Cash & PayPal transaction records' },
  '/activity': { title: 'Activity & Audit Trail', subtitle: 'Immutable record of AI proposals, user approvals & PayPal events' },
  '/settings': { title: 'Settings', subtitle: 'Business configuration & profile preferences' },
  '/register': { title: 'Register Business', subtitle: 'Set up shop or service workspace' },
  '/login': { title: 'Sign In', subtitle: 'Access your merchant dashboard' },
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, category, toggleCategory } = useBusiness();
  const { connectionStatus, checkConnection } = useReceivables();
  const [isAIOpen, setIsAIOpen] = useState(false);

  let meta = pageMeta[location.pathname];
  if (location.pathname === '/sales') {
    meta =
      category === 'service'
        ? { title: 'Service Billings & Invoices', subtitle: 'Track work order charges, client billings & receipts' }
        : { title: 'Sales & Invoices', subtitle: 'Track counter sales, retail bills & payment receipts' };
  }
  if (!meta && location.pathname.startsWith('/customers/')) {
    const custName = decodeURIComponent(location.pathname.replace('/customers/', ''));
    meta = {
      title: custName ? `${custName} — Ledger` : 'Customer Profile',
      subtitle:
        category === 'service'
          ? 'Outstanding dues, service work orders & payment records'
          : 'Outstanding dues, grocery credit ledger & payment records',
    };
  }
  if (!meta) {
    meta = {
      title: category === 'service' ? 'Service Operations' : 'Store Operations',
      subtitle: user.businessName,
    };
  }

  const isPayPalReady = connectionStatus?.paypal_configured;

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-white px-4 lg:px-6 shadow-2xs box-border">
        {/* Left: Mobile trigger & Page title */}
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground lg:text-lg">{meta.title}</h1>
              <span
                onClick={toggleCategory}
                title="Click to toggle between Shop and Service mode"
                className={`cursor-pointer hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition-transform active:scale-95 border ${
                  category === 'service'
                    ? 'bg-[#E6F5F5] text-[#007F7C] hover:bg-[#D4EFEF] border-[#007F7C]/30'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200'
                }`}
              >
                <RefreshCw className="h-2.5 w-2.5" />
                {category === 'service' ? 'Service Mode' : 'Shop Mode'}
              </span>
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block">{meta.subtitle}</p>
          </div>
        </div>

        {/* Right: Search, Sandbox Badge, Mode Toggle, AI Copilot, User profile */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Search bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={
                category === 'service'
                  ? 'Search services, client work orders, khata...'
                  : 'Search customers, products, invoices...'
              }
              className="h-9 w-52 rounded-xl border border-input bg-muted/40 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all lg:w-64"
            />
          </div>

          {/* PayPal Sandbox Status Badge */}
          <div
            onClick={() => checkConnection()}
            title="PayPal Invoicing API v2 Sandbox Connected"
            className="cursor-pointer hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-slate-50/80 px-2.5 py-1 text-xs transition-colors hover:bg-slate-100/80"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isPayPalReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-slate-700 text-[11px]">
              {isPayPalReady ? 'PayPal Sandbox' : 'Sandbox Demo'}
            </span>
          </div>

          {/* Switch Mode Button */}
          <button
            onClick={() => toggleCategory()}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 rounded-xl border border-border bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Toggle between Service and Shop modes"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Switch to {category === 'service' ? 'Shop' : 'Service'}</span>
          </button>

          {/* AI Copilot Button */}
          <Button
            size="sm"
            onClick={() => setIsAIOpen(true)}
            className="gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-xs shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI Copilot</span>
          </Button>

          {/* User Profile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border">
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    className={`text-white text-xs font-bold ${
                      category === 'service' ? 'bg-[#007F7C]' : 'bg-blue-600'
                    }`}
                  >
                    {user.avatar || 'CS'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-foreground leading-tight">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{user.businessName}</p>
                </div>
                <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 rounded-xl border-border bg-white p-1.5 shadow-lg">
              <DropdownMenuLabel className="px-2 py-1.5 text-xs">
                <p className="font-bold text-slate-900">{user.name}</p>
                <p className="text-[11px] text-muted-foreground font-normal">{user.phone}</p>
                <div className="mt-1 flex items-center gap-1">
                  <span
                    className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.2 border ${
                      category === 'service'
                        ? 'bg-[#E6F5F5] text-[#007F7C] border-[#007F7C]/30'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {category === 'service' ? 'Service Provider' : 'Shop / Retail'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{user.subCategory}</span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={toggleCategory}
                className="text-xs cursor-pointer font-medium py-2 text-slate-800"
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5 text-primary" />
                Switch to {category === 'service' ? 'Shop Mode' : 'Service Mode'}
              </DropdownMenuItem>

              {category === 'service' ? (
                <DropdownMenuItem
                  onClick={() => navigate('/services')}
                  className="text-xs cursor-pointer font-medium py-2 text-slate-800"
                >
                  <Scissors className="mr-2 h-3.5 w-3.5 text-[#007F7C]" />
                  Manage Services & Rates
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => navigate('/inventory')}
                  className="text-xs cursor-pointer font-medium py-2 text-slate-800"
                >
                  <Store className="mr-2 h-3.5 w-3.5 text-blue-600" />
                  Manage Inventory & Stock
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => navigate('/settings')}
                className="text-xs cursor-pointer font-medium py-2 text-slate-800"
              >
                Settings & API Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Floating Right AI Chatbot Drawer */}
      <AIChatbotDrawer open={isAIOpen} onOpenChange={setIsAIOpen} />
    </>
  );
}
