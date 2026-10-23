import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChatRoundDots,
  Bell,
  CheckCircle,
  Clock,
  MagicStar,
} from 'reicon-react';
import { MobileSidebar } from './Sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AIChatbotDrawer } from '@/components/shared/AIChatbotDrawer';

export function Header() {
  const navigate = useNavigate();
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut (⌘K or Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('topbar-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Default search action routes to Khata or Customers based on query
    navigate(`/customers?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center px-6 lg:px-8 bg-[#F8F9FA]/80 backdrop-blur-md transition-all box-border">
        <div className="mx-auto max-w-7xl w-full flex items-center justify-between">
          {/* Left: Mobile Sidebar Trigger only on small screens */}
          <div className="flex items-center gap-3 lg:hidden">
            <MobileSidebar />
          </div>

          {/* Right: Search Pill + AI Copilot Button + Notifications Button */}
          <div className="flex items-center gap-3 ml-auto">
          {/* Search Pill Capsule */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden sm:flex items-center h-11 w-64 md:w-80 lg:w-96 rounded-full bg-white dark:bg-[#141518] border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] pl-4 pr-1.5 transition-all focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-zinc-900/5 focus-within:shadow-md"
          >
            <input
              id="topbar-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or ask AI..."
              className="h-full w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none pr-2 font-normal"
            />

            {/* Keyboard shortcut badge */}
            <kbd className="hidden md:inline-flex items-center gap-0.5 rounded-md border border-zinc-200/80 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 font-mono shrink-0 mr-1.5 select-none">
              ⌘K
            </kbd>

            {/* Black circle search button */}
            <button
              type="submit"
              className="h-8 w-8 rounded-full bg-[#18181B] dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center hover:bg-black dark:hover:bg-zinc-200 transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
              aria-label="Submit search"
            >
              <Search size={15} weight="Outline" />
            </button>
          </form>

          {/* AI Copilot Button: Circular White Pill with Chat/Sparkle icon & pink dot */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setIsAIOpen(true)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#141518] border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:scale-95 transition-all cursor-pointer group"
                aria-label="Open AI Copilot"
              >
                <ChatRoundDots
                  size={19}
                  className="transition-transform duration-200 group-hover:scale-105"
                />
                {/* Accent notification / AI active dot */}
                <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={10}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white shadow-xl"
            >
              <span className="font-semibold">AI Copilot</span>
              <p className="text-[10px] text-zinc-400">Ask questions, draft invoices & triage</p>
            </TooltipContent>
          </Tooltip>

          {/* Notifications Button: Circular White Pill with Bell icon & counter badge */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#141518] border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:scale-95 transition-all cursor-pointer group"
                    aria-label="View notifications"
                  >
                    <Bell
                      size={19}
                      className="transition-transform duration-200 group-hover:scale-105"
                    />
                    {/* Badge count matching reference pill badge */}
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#263D31] text-[10px] font-bold text-white border-2 border-white shadow-xs">
                      3
                    </span>
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                sideOffset={10}
                className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white shadow-xl"
              >
                <span className="font-semibold">Notifications</span>
                <p className="text-[10px] text-zinc-400">3 unread operational alerts</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent
              align="end"
              sideOffset={12}
              className="w-80 rounded-2xl border border-zinc-200/80 bg-white p-2 shadow-2xl"
            >
              <DropdownMenuLabel className="px-3 py-2 text-xs flex items-center justify-between">
                <span className="font-bold text-zinc-900 text-sm">Notifications</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                  Live
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Notification 1: PayPal sandbox */}
              <DropdownMenuItem
                onClick={() => navigate('/invoices')}
                className="rounded-xl p-2.5 text-xs cursor-pointer hover:bg-zinc-50 flex items-start gap-2.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <CheckCircle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 leading-snug">PayPal Sandbox Connected</p>
                  <p className="text-[11px] text-zinc-500 line-clamp-1">API v2 webhook & invoicing ready</p>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Clock size={11} /> Just now
                  </span>
                </div>
              </DropdownMenuItem>

              {/* Notification 2: AI Intake */}
              <DropdownMenuItem
                onClick={() => navigate('/create')}
                className="rounded-xl p-2.5 text-xs cursor-pointer hover:bg-zinc-50 flex items-start gap-2.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                  <MagicStar size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 leading-snug">AI Intake Draft Ready</p>
                  <p className="text-[11px] text-zinc-500 line-clamp-1">Structured bill proposed from raw brief</p>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Clock size={11} /> 12m ago
                  </span>
                </div>
              </DropdownMenuItem>

              {/* Notification 3: Khata dues reminder */}
              <DropdownMenuItem
                onClick={() => navigate('/khata')}
                className="rounded-xl p-2.5 text-xs cursor-pointer hover:bg-zinc-50 flex items-start gap-2.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  <Bell size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-900 leading-snug">Customer Due Reminder</p>
                  <p className="text-[11px] text-zinc-500 line-clamp-1">Sharma Uncle balance due tomorrow</p>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Clock size={11} /> 1h ago
                  </span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate('/activity')}
                className="rounded-lg py-1.5 text-center justify-center text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
              >
                View full activity log
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

      {/* Floating Right AI Chatbot Drawer */}
      <AIChatbotDrawer open={isAIOpen} onOpenChange={setIsAIOpen} />
    </TooltipProvider>
  );
}
