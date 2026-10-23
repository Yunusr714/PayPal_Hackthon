import { useState } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Category,
  BagShopping,
  Designtools,
  ChartBar,
  Profile2user,
  BoxArchive,
  Scissors,
  BoltLightning,
  BillList,
  ChatRoundDots,
  CardPos,
  Clock,
  Sun,
  Moon,
  Setting2,
  ShieldCheck,
  Logout,
} from 'reicon-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBusiness } from '@/context/BusinessContext';
import { useReceivables } from '@/context/ReceivablesContext';

/**
 * Radial Sunburst / Asterisk Logo Component
 * Handcrafted 12-spoke rounded floral/sunburst emblem matching the reference design.
 */
export function AsteriskLogo({ className = 'h-8 w-8 text-[#263D31] dark:text-emerald-400' }: { className?: string }) {
  const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('transition-transform duration-300 group-hover:rotate-45', className)}
    >
      {angles.map((angle) => (
        <rect
          key={angle}
          x="22"
          y="3"
          width="4"
          height="13.5"
          rx="2"
          fill="currentColor"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="3.5" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

interface NavItemConfig {
  label: string;
  path: string;
  icon: React.ComponentType<{
    size?: number | string;
    weight?: 'Outline' | 'Filled';
    className?: string;
    color?: string;
  }>;
  badge?: string;
  description: string;
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, category } = useBusiness();
  const { connectionStatus, checkConnection } = useReceivables();

  const isService = category === 'service';
  const isPayPalReady = connectionStatus?.paypal_configured ?? true;

  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cashiko-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cashiko-theme', 'light');
    }
  };

  // Primary Platform Navigation Items powered by Reicon (https://reicon.dev/icons)
  // Dynamically adapts based on Shop Mode vs Service Mode
  const navItems: NavItemConfig[] = [
    {
      label: 'Dashboard',
      path: '/',
      icon: Category, // 4 rounded squares (Bento grid) from Reicon
      description: 'Business metrics & operational overview',
    },
    {
      label: isService ? 'Service Billings' : 'Sales & POS',
      path: '/sales',
      icon: isService ? Designtools : BagShopping, // Handcrafted tool or bag from Reicon
      description: isService ? 'Client work orders & bills' : 'Counter sales, receipts & register',
    },
    {
      label: 'Khata / Credit Book',
      path: '/khata',
      icon: ChartBar, // Vertical bar chart from Reicon
      description: 'Customer credit ledger & dues tracking',
    },
    {
      label: 'Customers',
      path: '/customers',
      icon: Profile2user, // Two user silhouettes from Reicon
      description: 'Customer directory & payment trust score',
    },
    // Dynamically show Services & Rates for Service mode, and Inventory for Shop mode
    ...(isService
      ? [
          {
            label: 'Services & Rates',
            path: '/services',
            icon: Scissors, // Precision scissors from Reicon
            description: 'Service catalog pricing & labor charges',
          },
        ]
      : [
          {
            label: 'Inventory',
            path: '/inventory',
            icon: BoxArchive, // Archive storage box from Reicon
            description: 'Stock levels & SKU tracking',
          },
        ]),
    {
      label: 'Intake with AI',
      path: '/create',
      icon: BoltLightning, // Lightning bolt from Reicon
      badge: 'AI',
      description: 'Smart invoice extraction with Groq AI',
    },
    {
      label: 'PayPal Invoices',
      path: '/invoices',
      icon: BillList, // Document bill list from Reicon
      badge: 'v2',
      description: 'Live PayPal Invoicing API v2 execution',
    },
    {
      label: 'Reply Copilot',
      path: '/triage',
      icon: ChatRoundDots, // Message bubble with dots from Reicon
      description: 'WhatsApp & SMS reply generator',
    },
    {
      label: 'Payments',
      path: '/payments',
      icon: CardPos, // Card POS terminal from Reicon
      description: 'UPI, Cash & PayPal records',
    },
    {
      label: 'Activity Log',
      path: '/activity',
      icon: Clock, // Precision clock from Reicon
      description: 'Audit log & action history',
    },
  ];

  return (
    <TooltipProvider delayDuration={100} skipDelayDuration={0}>
      <aside className="hidden lg:flex fixed left-4 top-3 bottom-3 z-40 flex-col items-center select-none">
        {/* Top Logo: Distinctive Radial Sunburst / Asterisk mark */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/"
              className="group mb-2.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 dark:bg-[#141518] border border-zinc-200/80 dark:border-zinc-800 shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Cashiko Pro Dashboard"
            >
              <AsteriskLogo className="h-6 w-6 text-[#263D31] dark:text-emerald-400 transition-colors duration-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
            </Link>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={12}
            className="rounded-xl border border-zinc-200/80 bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-white shadow-xl"
          >
            <div className="flex items-center gap-1.5">
              <span>Cashiko Pro</span>
              <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-400">
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-normal">Omnichannel Merchant Cloud</p>
          </TooltipContent>
        </Tooltip>

        {/* Floating Capsule Dock: White pill with smooth rounded shape & soft elevation */}
        <div className="flex flex-1 flex-col items-center justify-between w-[64px] rounded-full bg-white dark:bg-[#121316] border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12),0_4px_16px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] py-3 px-1.5 overflow-y-auto scrollbar-none transition-all">
          {/* Main Navigation Items (Reicon SVG Icons) */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.path}
                      className={cn(
                        'group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200',
                        isActive
                          ? 'bg-[#18181B] dark:bg-white text-white dark:text-zinc-950 shadow-md shadow-zinc-900/30 scale-100'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 active:scale-95'
                      )}
                      aria-label={item.label}
                    >
                      <Icon
                        size={20}
                        weight={isActive ? 'Filled' : 'Outline'}
                        className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                      />

                      {/* Small badge dot for AI or v2 */}
                      {item.badge && !isActive && (
                        <span className="absolute top-1 right-1 flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-60" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
                        </span>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={14}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white shadow-2xl min-w-[150px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-zinc-100">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
                            item.badge === 'AI'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] text-zinc-400 leading-tight">
                      {item.description}
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Bottom Utility Controls: Reicon Sun, Settings, ShieldCheck, User Avatar */}
          <div className="flex flex-col items-center gap-1.5 w-full pt-2 border-t border-zinc-100/90 dark:border-zinc-800/60 mt-2">
            {/* Theme Appearance Toggle - Clean, Standard Dark/Light Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 active:scale-95 cursor-pointer"
                  aria-label="Toggle Theme"
                >
                  {isDark ? (
                    <Sun size={20} weight="Filled" className="shrink-0 transition-transform duration-300 group-hover:rotate-45 text-amber-400" />
                  ) : (
                    <Moon size={20} weight="Outline" className="shrink-0 transition-transform duration-300 group-hover:-rotate-12 text-zinc-600" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={14}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white shadow-2xl"
              >
                <span className="font-semibold">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                <p className="text-[10px] text-zinc-400">{isDark ? 'Switch to clean light mode' : 'Switch to obsidian dark mode'}</p>
              </TooltipContent>
            </Tooltip>

            {/* Settings using Reicon Setting2 - Clean Minimal Icon with NO background */}
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    cn(
                      'group flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 bg-transparent hover:bg-transparent',
                      isActive
                        ? 'text-zinc-950 dark:text-white'
                        : 'text-zinc-400 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200 active:scale-95'
                    )
                  }
                  aria-label="Settings"
                >
                  <Setting2
                    size={20}
                    weight={location.pathname === '/settings' ? 'Filled' : 'Outline'}
                    className="shrink-0 transition-transform duration-300 group-hover:rotate-45"
                  />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={14}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white shadow-2xl"
              >
                <span className="font-semibold">Settings</span>
                <p className="text-[10px] text-zinc-400">API keys, PayPal & profile</p>
              </TooltipContent>
            </Tooltip>

            {/* PayPal Sandbox Status using Reicon ShieldCheck */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => checkConnection()}
                  className="group flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all duration-200 relative"
                  aria-label="PayPal Sandbox Status"
                >
                  <ShieldCheck size={20} className="shrink-0" />
                  <span
                    className={cn(
                      'absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-white',
                      isPayPalReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                sideOffset={14}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white shadow-2xl"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      isPayPalReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    )}
                  />
                  <span className="font-semibold text-zinc-100">PayPal Sandbox v2</span>
                </div>
                <p className="text-[10px] text-zinc-400">Live API Connection</p>
              </TooltipContent>
            </Tooltip>

            {/* User Profile Avatar at Bottom of Capsule */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="group relative mt-1 flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-zinc-200/90 hover:ring-zinc-900 transition-all duration-200 overflow-hidden shadow-xs active:scale-95 focus:outline-none"
                      aria-label="User Profile"
                    >
                      <div className="flex h-full w-full items-center justify-center font-bold text-xs text-white bg-gradient-to-br from-zinc-800 to-zinc-950 transition-transform group-hover:scale-105">
                        {user.avatar || 'CS'}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={14}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white shadow-2xl"
                >
                  <span className="font-semibold">{user.name}</span>
                  <p className="text-[10px] text-zinc-400">{user.businessName}</p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={16}
                className="w-56 rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-2xl"
              >
                <DropdownMenuLabel className="px-2.5 py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs text-white bg-zinc-900">
                      {user.avatar || 'CS'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-zinc-900">{user.name}</p>
                      <p className="truncate text-[11px] text-zinc-500">{user.businessName}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => navigate('/settings')}
                  className="rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 cursor-pointer flex items-center gap-2.5"
                >
                  <Setting2 size={16} className="text-zinc-500" />
                  Settings & Configurations
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate('/customers')}
                  className="rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 cursor-pointer flex items-center gap-2.5"
                >
                  <Profile2user size={16} className="text-zinc-500" />
                  Customer Directory
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate('/login')}
                  className="rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2.5"
                >
                  <Logout size={16} className="text-red-500" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

/**
 * Mobile Drawer Sidebar powered by Reicon icons
 * Clean sheet overlay on mobile screens with responsive layout and labels.
 */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, category } = useBusiness();
  const isService = category === 'service';

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Category },
    {
      label: isService ? 'Service Billings' : 'Sales & POS',
      path: '/sales',
      icon: isService ? Designtools : BagShopping,
    },
    { label: 'Khata / Credit Book', path: '/khata', icon: ChartBar },
    { label: 'Customers', path: '/customers', icon: Profile2user },
    ...(isService
      ? [{ label: 'Services & Rates', path: '/services', icon: Scissors }]
      : [{ label: 'Inventory', path: '/inventory', icon: BoxArchive }]),
    { label: 'Intake with AI', path: '/create', icon: BoltLightning, badge: 'AI' },
    { label: 'PayPal Invoices', path: '/invoices', icon: BillList, badge: 'v2' },
    { label: 'Reply Copilot', path: '/triage', icon: ChatRoundDots },
    { label: 'Payments', path: '/payments', icon: CardPos },
    { label: 'Activity Log', path: '/activity', icon: Clock },
    { label: 'Settings', path: '/settings', icon: Setting2 },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="lg:hidden inline-flex items-center justify-center rounded-xl p-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all border border-zinc-200 dark:border-zinc-800"
          aria-label="Open Navigation Menu"
        >
          <AsteriskLogo className="h-5 w-5 text-zinc-800 dark:text-emerald-400" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 p-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121316] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800">
            <AsteriskLogo className="h-7 w-7 text-[#263D31] dark:text-emerald-400" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Cashiko Pro</span>
                <span className="rounded bg-zinc-900 dark:bg-white px-1.5 py-0.2 text-[9px] font-bold text-white dark:text-zinc-950 uppercase">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Omnichannel Merchant Suite</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-[#18181B] dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} weight={isActive ? 'Filled' : 'Outline'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase',
                        isActive
                          ? 'bg-zinc-700 dark:bg-zinc-200 text-zinc-200 dark:text-zinc-900'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer info */}
          <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#18191D]/50">
            <div className="flex items-center justify-between px-1 text-[10px] text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold">{user.businessName}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">PayPal Sandbox v2</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
