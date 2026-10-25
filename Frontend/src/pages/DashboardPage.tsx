import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IndianRupee,
  Wallet,
  Users,
  Package,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Scissors,
  Wrench,
  Briefcase,
  Clock,
  CheckCircle2,
  Store,
  CreditCard,
  FileText,
  Send,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DuoToneBarChart } from '@/components/shared/DuoToneBarChart';
import { AddServiceDialog } from '@/components/shared/AddServiceDialog';
import { AddProductDialog } from '@/components/shared/AddProductDialog';
import { AddJobDialog } from '@/components/shared/AddJobDialog';
import { AIChatbotDrawer } from '@/components/shared/AIChatbotDrawer';
import { useBusiness } from '@/context/BusinessContext';
import { useReceivables } from '@/context/ReceivablesContext';
import { formatINR } from '@/data/mock-data';

interface ActivityItem {
  id: string;
  activity: string;
  category: 'Service' | 'Retail' | 'PayPal' | 'Khata';
  price: string;
  status: 'Completed' | 'Pending';
  date: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, category, services, serviceJobs, products, customers, sales } = useBusiness();
  const { metrics, invoices } = useReceivables();
  const location = useLocation();

  const [balanceCurrency, setBalanceCurrency] = useState<'INR' | 'USD'>('INR');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityStatusFilter, setActivityStatusFilter] = useState<'all' | 'Completed' | 'Pending'>('all');

  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const isService = category === 'service';

  // Dynamic Time-of-Day Greeting
  const greetingGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Compute live financial totals from DB sales & customers
  const totalRevenue = useMemo(() => {
    return sales
      .filter((s) => s.status === 'Paid')
      .reduce((acc, s) => acc + s.amount, 0);
  }, [sales]);

  const totalOutstanding = useMemo(() => {
    return customers.reduce((acc, c) => acc + (c.outstanding || 0), 0);
  }, [customers]);

  // Live POS & Service Cash/UPI sales totals
  const cashTotal = useMemo(() => {
    return sales
      .filter((s) => s.status === 'Paid' && s.mode === 'Cash')
      .reduce((acc, s) => acc + s.amount, 0);
  }, [sales]);

  const upiTotal = useMemo(() => {
    return sales
      .filter((s) => s.status === 'Paid' && s.mode === 'UPI')
      .reduce((acc, s) => acc + s.amount, 0);
  }, [sales]);

  // PayPal USD collected from invoices or sandbox metrics
  const paypalTotalUSD = useMemo(() => {
    const fromInvoices = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((acc, inv) => acc + (Number(inv.total) || 0), 0);
    return fromInvoices > 0 ? fromInvoices : (metrics.totalCollected || metrics.totalInvoiced || 0);
  }, [invoices, metrics.totalCollected, metrics.totalInvoiced]);

  // Unified balances using standard conversion 1 USD = ₹83.5
  const paypalTotalINR = useMemo(() => Math.round(paypalTotalUSD * 83.5), [paypalTotalUSD]);
  const totalSettledINR = useMemo(() => cashTotal + upiTotal + paypalTotalINR, [cashTotal, upiTotal, paypalTotalINR]);
  const totalSettledUSD = useMemo(() => Number((totalSettledINR / 83.5).toFixed(2)), [totalSettledINR]);

  // Cost and margin computations based on mode
  const estimatedCosts = useMemo(() => {
    const rate = isService ? 0.18 : 0.65;
    return Math.round(totalRevenue * rate);
  }, [isService, totalRevenue]);

  const netIncome = useMemo(() => Math.max(0, totalRevenue - estimatedCosts), [totalRevenue, estimatedCosts]);

  // Monthly credit limit & safety threshold buffer
  const ceilingLimit = 25000;
  const currentUtilized = totalOutstanding;
  const limitPercentage = useMemo(() => {
    return Math.min(100, Math.round((currentUtilized / ceilingLimit) * 100));
  }, [currentUtilized, ceilingLimit]);
  const remainingLimit = Math.max(0, ceilingLimit - currentUtilized);
  const dailyBurnRate = Math.round(currentUtilized / 30);

  // Auto-open AI chatbot drawer if routed with query param
  useEffect(() => {
    if (location.search.includes('openAI=true')) {
      setIsAIOpen(true);
    }
  }, [location.search]);

  // Build live unified activities from sales, service jobs, and PayPal invoices
  const liveActivities = useMemo(() => {
    const items: ActivityItem[] = [];

    // 1. Add Sales / Service billings
    sales.forEach((s) => {
      items.push({
        id: s.id,
        activity: s.items || `${s.customer} (${s.mode})`,
        category: s.mode === 'PayPal' ? 'PayPal' : isService ? 'Service' : 'Retail',
        price: formatINR(s.amount),
        status: s.status === 'Paid' ? 'Completed' : 'Pending',
        date: s.date || 'Today',
      });
    });

    // 2. Add PayPal Invoicing API v2 records
    invoices.forEach((inv) => {
      items.push({
        id: inv.paypal_invoice_number || `INV-${inv.id.substring(0, 6).toUpperCase()}`,
        activity: `${inv.recipient_name} (PayPal)`,
        category: 'PayPal',
        price: `$${Number(inv.total).toFixed(2)}`,
        status: inv.status === 'PAID' ? 'Completed' : 'Pending',
        date: new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      });
    });

    return items;
  }, [sales, invoices, isService]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return liveActivities.filter((act) => {
      const matchSearch =
        act.activity.toLowerCase().includes(activitySearch.toLowerCase()) ||
        act.id.toLowerCase().includes(activitySearch.toLowerCase());
      const matchStatus =
        activityStatusFilter === 'all' || act.status === activityStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [liveActivities, activitySearch, activityStatusFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header: Greeting (NO bye emoji!) + Subtitle + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
              {greetingGreeting}, {user.name.split(' ')[0]}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                isService
                  ? 'bg-[#E6F5F5] dark:bg-[#007F7C]/20 text-[#007F7C] dark:text-[#38D5D2] border-[#007F7C]/30'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/80'
              }`}
            >
              {isService ? 'Service Business' : 'Retail Shop'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal mt-1">
            Stay on top of your tasks, monitor progress, and track operational status.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isService ? (
            <>
              <Button
                onClick={() => setIsAddServiceOpen(true)}
                className="bg-[#007F7C] hover:bg-[#006663] text-white font-semibold text-xs shadow-xs"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Service
              </Button>

              <Button
                onClick={() => setIsAddJobOpen(true)}
                variant="outline"
                className="border-zinc-200 dark:border-zinc-800 text-foreground hover:bg-muted text-xs font-medium"
              >
                <Briefcase className="mr-1.5 h-3.5 w-3.5 text-[#007F7C]" /> New Work Order
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate('/sales')}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold text-xs shadow-xs"
              >
                <IndianRupee className="mr-1.5 h-3.5 w-3.5" /> New Sale
              </Button>

              <Button
                onClick={() => setIsAddProductOpen(true)}
                variant="outline"
                className="border-zinc-200 dark:border-zinc-800 text-foreground hover:bg-muted text-xs font-medium"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Add Inventory
              </Button>
            </>
          )}

          <Link to="/create">
            <Button
              variant="outline"
              className={
                isService
                  ? 'border-[#007F7C]/40 bg-[#007F7C]/10 dark:bg-[#007F7C]/20 text-[#007F7C] dark:text-[#38D5D2] hover:bg-[#007F7C]/20 text-xs font-semibold shadow-2xs'
                  : 'border-blue-200/80 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100/70 text-xs font-semibold shadow-2xs'
              }
            >
              <Sparkles className={`mr-1.5 h-3.5 w-3.5 ${isService ? 'text-[#007F7C] dark:text-[#38D5D2]' : 'text-blue-600 dark:text-blue-400'}`} /> Intake with AI
            </Button>
          </Link>

          <Button
            onClick={() => setIsAIOpen(true)}
            variant="outline"
            className="border-zinc-200 dark:border-zinc-800 text-foreground hover:bg-muted text-xs font-semibold shadow-2xs"
          >
            <Sparkles className={`mr-1.5 h-3.5 w-3.5 ${isService ? 'text-[#007F7C] dark:text-[#38D5D2]' : 'text-blue-600 dark:text-blue-400'}`} /> Ask AI
          </Button>
        </div>
      </div>

      {/* 2. Top Metric & Graph Row (Matching Image 1 in Our Theme) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Col 1: Total Balance Card (Width: ~34%) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#141518] border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Header: Label + Currency Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Total Balance
              </span>
              <div className="flex items-center gap-1 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                <span>{balanceCurrency === 'INR' ? '🇮🇳 INR' : '🇺🇸 USD'}</span>
                <button
                  type="button"
                  onClick={() =>
                    setBalanceCurrency(balanceCurrency === 'INR' ? 'USD' : 'INR')
                  }
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white ml-0.5 text-[10px]"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Big Bold Balance */}
            <div className="mt-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
                {balanceCurrency === 'INR' ? formatINR(totalSettledINR || totalRevenue) : `$${totalSettledUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h2>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3" />
                <span>+{(sales.length + invoices.length) > 0 ? Math.min(18, (sales.length + invoices.length) * 2) : 5}% monthly velocity</span>
              </div>
            </div>

            {/* Action Buttons: Transfer / Request */}
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => navigate('/payments')}
                className="flex items-center justify-center gap-1.5 rounded-full bg-zinc-950 hover:bg-black text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-xs font-semibold py-2.5 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                <span>Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/khata')}
                className="flex items-center justify-center gap-1.5 rounded-full bg-white dark:bg-[#1C1E22] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/90 dark:border-zinc-700/80 text-xs font-semibold py-2.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <ArrowDownRight className="h-3.5 w-3.5" />
                <span>Request</span>
              </button>
            </div>
          </div>

          {/* Wallets / Accounts Breakdown */}
          <div className="pt-5 mt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 font-medium mb-2.5">
              <span>Wallets</span>
              <span className="text-[11px]">3 active rails</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 p-2.5 text-center">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Cash
                </p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1">
                  {formatINR(cashTotal)}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 p-2.5 text-center">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> UPI
                </p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1">
                  {formatINR(upiTotal)}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/60 p-2.5 text-center">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> PayPal
                </p>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1">
                  ${Math.round(paypalTotalUSD).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: 2x2 Metric Cards Grid (Width: ~34%) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3.5">
          {/* Accent Highlight Metric Card: IN OUR THEME ONLY (Blue for shop, Teal for service) */}
          <div
            className={`rounded-3xl p-4 flex flex-col justify-between text-white shadow-md transition-all ${
              isService
                ? 'bg-gradient-to-br from-[#007F7C] via-[#006E6B] to-[#005553] shadow-[#007F7C]/20 border border-[#007F7C]/40'
                : 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-blue-500/20 border border-blue-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/90">Total Earnings</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-xs">
                <IndianRupee className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold font-mono tracking-tight">
                {formatINR(totalRevenue)}
              </h3>
              <span className="inline-block mt-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white/90">
                {sales.filter((s) => s.status === 'Paid').length} paid sales
              </span>
            </div>
          </div>

          {/* Mini Card 2: Total Spending */}
          <div className="rounded-3xl bg-white dark:bg-[#141518] border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Total Spending
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
                {formatINR(estimatedCosts)}
              </h3>
              <span className="inline-flex items-center gap-0.5 mt-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 px-2 py-0.5 text-[10px] font-semibold">
                <TrendingDown className="h-2.5 w-2.5" /> {isService ? '18% OpEx' : '65% COGS'}
              </span>
            </div>
          </div>

          {/* Mini Card 3: Total Income */}
          <div className="rounded-3xl bg-white dark:bg-[#141518] border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Total Income
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
                {formatINR(netIncome)}
              </h3>
              <span className="inline-flex items-center gap-0.5 mt-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 text-[10px] font-semibold">
                <TrendingUp className="h-2.5 w-2.5" /> Net Margin
              </span>
            </div>
          </div>

          {/* Mini Card 4: Total Revenue */}
          <div className="rounded-3xl bg-white dark:bg-[#141518] border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Outstanding Dues
              </span>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-xl ${
                  isService
                    ? 'bg-[#007F7C]/15 text-[#007F7C] dark:text-[#38D5D2]'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                }`}
              >
                <Package className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
                {formatINR(totalOutstanding)}
              </h3>
              <span
                className={`inline-flex items-center gap-0.5 mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  isService
                    ? 'bg-[#007F7C]/10 text-[#007F7C] dark:text-[#38D5D2] border border-[#007F7C]/30'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60'
                }`}
              >
                {customers.filter((c) => (c.outstanding || 0) > 0).length} parties pending
              </span>
            </div>
          </div>
        </div>

        {/* Col 3: Total Income Chart Card (Width: ~32%) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#141518] border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  Total Income
                </h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  View your income and margin over time
                </p>
              </div>

              {/* Legend matching Image 1: Profit and Loss */}
              <div className="text-right">
                <span className="text-[10px] font-semibold text-zinc-400 block mb-1">
                  Profit and Loss
                </span>
                <div className="flex items-center gap-2 text-[11px] font-semibold">
                  <span className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                    <span className="h-2 w-2 rounded-full bg-[#18181B] dark:bg-zinc-400" /> Profit
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      isService ? 'text-[#007F7C] dark:text-[#38D5D2]' : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isService ? 'bg-[#007F7C]' : 'bg-[#2563EB]'
                      }`}
                    />
                    Revenue
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive DuoTone Stacked Bar Chart */}
          <div className="mt-4">
            <DuoToneBarChart height={180} />
          </div>
        </div>
      </div>

      {/* 3. Bottom Grid: Monthly Spending Limit / Milestone Card + Recent Activities Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Bottom Left: Monthly Spending Limit / Target Progress (Width: ~34%) */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#141518] border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Monthly Credit Buffer
              </h3>
              <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                {limitPercentage}% Utilized
              </span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              Current customer dues vs safety threshold
            </p>

            {/* Target Numbers matching Image 1 */}
            <div className="flex items-baseline justify-between mt-5 font-mono">
              <div>
                <span className="text-xs text-zinc-400 block font-sans">Current Utilized</span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatINR(currentUtilized)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 block font-sans">Ceiling Limit</span>
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  {formatINR(ceilingLimit)}
                </span>
              </div>
            </div>

            {/* Smooth Theme Progress Bar */}
            <div className="mt-4">
              <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isService
                      ? 'bg-gradient-to-r from-[#007F7C] to-[#00A8A4]'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                  }`}
                  style={{ width: `${limitPercentage}%` }}
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {formatINR(remainingLimit)} remaining before safety limit alert.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">Daily Burn Rate</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                {formatINR(dailyBurnRate)}/day
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">Audit Cycle</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                End of Month
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Right: Recent Activities Table Card (Width: ~66%) */}
        <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#141518] border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Header: Title + Search + Filter Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Recent Activities
                </h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Synchronized ledger from POS sales, service orders & PayPal
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative w-44 sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="h-8 w-full rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900 pl-8 pr-3 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                {/* Filter */}
                <select
                  value={activityStatusFilter}
                  onChange={(e) =>
                    setActivityStatusFilter(
                      e.target.value as 'all' | 'Completed' | 'Pending'
                    )
                  }
                  className="h-8 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Table Matching Image 1 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs mt-2">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-500 text-[11px] font-semibold">
                    <th className="py-2.5 pl-2">Order ID</th>
                    <th className="py-2.5">Activity</th>
                    <th className="py-2.5 text-right">Price</th>
                    <th className="py-2.5 text-center">Status</th>
                    <th className="py-2.5 pr-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/40">
                  {filteredActivities.slice(0, 5).map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="py-3 pl-2 font-mono font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                        {item.id}
                      </td>

                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                            {item.category === 'PayPal' ? (
                              <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                            ) : item.category === 'Service' ? (
                              <Scissors className="h-3.5 w-3.5 text-[#007F7C]" />
                            ) : (
                              <Store className="h-3.5 w-3.5 text-emerald-600" />
                            )}
                          </div>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                            {item.activity}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {item.price}
                      </td>

                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            item.status === 'Completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.status === 'Completed'
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3 pr-2 text-right text-zinc-400 dark:text-zinc-500 text-[11px]">
                        {item.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              Showing {Math.min(5, filteredActivities.length)} of {liveActivities.length} ledger activities
            </span>
            <Link
              to="/activity"
              className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1"
            >
              View full ledger <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. PayPal Sandbox Invoicing API v2 Copilot Strip */}
      <div
        className={`rounded-2xl border p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isService
            ? 'border-[#007F7C]/30 bg-gradient-to-r from-[#007F7C]/10 via-[#006663]/5 to-transparent dark:from-[#007F7C]/20 dark:via-[#006663]/10 dark:to-zinc-900/60'
            : 'border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50/80 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-zinc-900/60'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold shadow-xs shrink-0 ${
              isService ? 'bg-[#007F7C]' : 'bg-blue-600'
            }`}
          >
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                PayPal Invoicing API v2 Sandbox
              </span>
              <span
                className={`rounded text-[10px] font-bold px-1.5 py-0.2 ${
                  isService
                    ? 'bg-[#007F7C]/20 text-[#007F7C] dark:text-[#38D5D2]'
                    : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                }`}
              >
                Live Sandbox Connected
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Outstanding receivables: <span className={`font-bold ${isService ? 'text-[#007F7C] dark:text-[#38D5D2]' : 'text-blue-600 dark:text-blue-400'}`}>${metrics.totalOutstanding.toFixed(2)}</span> across {metrics.sentCount} sent and {metrics.draftsCount} draft invoices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/invoices">
            <Button
              size="sm"
              className={`h-8 text-xs text-white font-semibold ${
                isService
                  ? 'bg-[#007F7C] hover:bg-[#006663]'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FileText className="h-3.5 w-3.5 mr-1" /> View PayPal Invoices
            </Button>
          </Link>
          <Link to="/triage">
            <Button
              size="sm"
              variant="outline"
              className={`h-8 text-xs bg-white dark:bg-zinc-800 font-semibold border-zinc-200 dark:border-zinc-700 ${
                isService
                  ? 'text-zinc-700 dark:text-zinc-200 hover:text-[#007F7C] dark:hover:text-[#38D5D2]'
                  : 'text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Reply Copilot
            </Button>
          </Link>
        </div>
      </div>

      {/* Dialog Modals */}
      <AddServiceDialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen} />
      <AddProductDialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen} />
      <AddJobDialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen} />

      {/* Slide-over Right Chatbot Drawer */}
      <AIChatbotDrawer open={isAIOpen} onOpenChange={setIsAIOpen} />
    </div>
  );
}
