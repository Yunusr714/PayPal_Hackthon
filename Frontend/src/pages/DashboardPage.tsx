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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { KPICard } from '@/components/shared/KPICard';
import { ChartCard } from '@/components/shared/ChartCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AreaChartCard } from '@/components/shared/Charts';
import { AddServiceDialog } from '@/components/shared/AddServiceDialog';
import { AddProductDialog } from '@/components/shared/AddProductDialog';
import { AddJobDialog } from '@/components/shared/AddJobDialog';
import { AIChatbotDrawer } from '@/components/shared/AIChatbotDrawer';
import { useBusiness } from '@/context/BusinessContext';
import { useReceivables } from '@/context/ReceivablesContext';
import {
  formatINR,
  salesOverviewData,
  salesOverview30Data,
  salesOverview90Data,
  recentSales,
  lowStockAlerts,
  Sale,
} from '@/data/mock-data';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, category, toggleCategory, services, serviceJobs, products, customers, sales } = useBusiness();
  const { metrics, connectionStatus } = useReceivables();
  const location = useLocation();

  const [salesRange, setSalesRange] = useState<'7' | '30' | '90'>('7');
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Compute live financial totals from DB
  const totalRevenue = useMemo(() => {
    return sales
      .filter((s) => s.status === 'Paid')
      .reduce((acc, s) => acc + s.amount, 0);
  }, [sales]);

  const totalOutstanding = useMemo(() => {
    return customers.reduce((acc, c) => acc + (c.outstanding || 0), 0);
  }, [customers]);

  const customersWithDuesCount = useMemo(() => {
    return customers.filter((c) => c.outstanding > 0).length;
  }, [customers]);

  // Auto-open AI chatbot drawer if routed with query param
  useEffect(() => {
    if (location.search.includes('openAI=true')) {
      setIsAIOpen(true);
    }
  }, [location.search]);

  const chartData =
    salesRange === '7'
      ? salesOverviewData
      : salesRange === '30'
      ? salesOverview30Data
      : salesOverview90Data;

  const handleNewSale = () =>
    toast.success('Sale saved successfully', { description: 'New sale bill recorded.' });
  const handleReorder = (name: string) =>
    toast.success('Reorder request created', { description: `${name} added to supplier reorder list.` });
  const handleSendReminders = () =>
    toast.success('Reminders sent successfully', {
      description: 'Customer reminders dispatched for outstanding dues.',
    });

  const activeServiceJobs = serviceJobs.filter(
    (j) => j.status === 'In Progress' || j.status === 'Scheduled'
  );
  const lowStockCount = products.filter((p) => p.status === 'Low Stock' || p.status === 'Critical').length;

  return (
    <div className="space-y-6">
      {/* Dynamic Header with Category Badge, PayPal Status, & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Good day, {user.name.split(' ')[0]}
            </h2>
            <span
              onClick={toggleCategory}
              title="Click to switch between Service and Shop modes"
              className={`cursor-pointer inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                category === 'service'
                  ? 'bg-[#E6F5F5] text-[#007F7C] border-[#007F7C]/30 hover:bg-[#D4EFEF]'
                  : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
              }`}
            >
              {category === 'service' ? (
                <>
                  <Scissors className="h-3 w-3" /> Service Business
                </>
              ) : (
                <>
                  <Store className="h-3 w-3" /> Retail Shop
                </>
              )}
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              PayPal Sandbox v2
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user.businessName} · {category === 'service' ? 'Service Operations' : 'Shop Operations'}
          </p>
        </div>

        {/* Action Buttons tailored to Category */}
        <div className="flex items-center gap-2 flex-wrap">
          {category === 'service' ? (
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
                className="border-border text-foreground hover:bg-muted text-xs font-medium"
              >
                <Briefcase className="mr-1.5 h-3.5 w-3.5 text-[#007F7C]" /> New Work Order
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate('/sales')}
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs shadow-xs"
              >
                <IndianRupee className="mr-1.5 h-3.5 w-3.5" /> New Sale
              </Button>

              <Button
                onClick={() => setIsAddProductOpen(true)}
                variant="outline"
                className="border-border text-foreground hover:bg-muted text-xs font-medium"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5 text-primary" /> Add Inventory
              </Button>
            </>
          )}

          <Link to="/create">
            <Button
              variant="outline"
              className="border-blue-200 bg-blue-50/60 text-blue-700 hover:bg-blue-100/70 text-xs font-semibold shadow-2xs"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-600" /> Intake with AI
            </Button>
          </Link>

          <Button
            onClick={() => setIsAIOpen(true)}
            variant="outline"
            className="border-border text-foreground hover:bg-muted text-xs font-semibold shadow-2xs"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-indigo-600" /> Ask AI
          </Button>
        </div>
      </div>

      {/* PayPal Sandbox Receivables Copilot Banner */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50/40 to-slate-50 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-xs shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">PayPal Invoicing API v2 Hub</span>
              <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2">
                Live Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Outstanding receivables: <span className="font-bold text-blue-600">${metrics.totalOutstanding.toFixed(2)}</span> across {metrics.sentCount} sent and {metrics.draftsCount} draft invoices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/invoices">
            <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <FileText className="h-3.5 w-3.5 mr-1" /> View PayPal Invoices
            </Button>
          </Link>
          <Link to="/triage">
            <Button size="sm" variant="outline" className="h-8 text-xs bg-white text-slate-700 font-semibold">
              Reply Copilot
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards: Dynamic for Service vs Shop */}
      {category === 'service' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Service Collected Revenue"
            value={formatINR(totalRevenue)}
            icon={IndianRupee}
            trend={{ value: 'Live SQLite ledger', positive: true }}
          />

          <KPICard
            title="Active Work Orders"
            value={activeServiceJobs.length.toString()}
            icon={Briefcase}
            variant="warning"
            subtext="Work orders pending"
          />

          <KPICard
            title="Outstanding Service Khata"
            value={formatINR(totalOutstanding)}
            icon={Wallet}
            variant="default"
            subtext={`${customersWithDuesCount} clients with balance`}
          />

          <KPICard
            title="Configured Services"
            value={services.length.toString()}
            icon={Sparkles}
            subtext="Live in your rate card"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Shop Sales"
            value={formatINR(totalRevenue)}
            icon={IndianRupee}
            trend={{ value: 'Live counter sales', positive: true }}
          />

          <KPICard
            title="Outstanding Khata"
            value={formatINR(totalOutstanding)}
            icon={Wallet}
            trend={{ value: `${customersWithDuesCount} customers pending`, positive: false }}
            variant="warning"
          />

          <KPICard
            title="Customers with Dues"
            value={customersWithDuesCount.toString()}
            icon={Users}
            subtext="Credit ledger tracking"
          />

          <KPICard
            title="Low Stock Items"
            value={lowStockCount.toString()}
            icon={Package}
            subtext="Reorder alerts triggered"
            variant="danger"
          />
        </div>
      )}

      {/* Charts & AI Insight Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title={
            category === 'service'
              ? 'Service Revenue Overview — Last 7 Days'
              : 'Sales Overview — Last 7 Days'
          }
          subtitle={
            category === 'service'
              ? 'Daily billings & work orders completed'
              : 'Daily sales performance'
          }
          trend={{ value: '12.4% this week', positive: true }}
          className="lg:col-span-2"
          action={
            <Tabs
              value={salesRange}
              onValueChange={(v) => setSalesRange(v as '7' | '30' | '90')}
            >
              <TabsList className="h-8">
                <TabsTrigger value="7" className="text-xs px-2.5 py-0.5">
                  7 Days
                </TabsTrigger>
                <TabsTrigger value="30" className="text-xs px-2.5 py-0.5">
                  30 Days
                </TabsTrigger>
                <TabsTrigger value="90" className="text-xs px-2.5 py-0.5">
                  90 Days
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
        >
          <AreaChartCard data={chartData} xKey="day" yKey="sales" height={280} />
        </ChartCard>

        {/* AI Cash-Flow Insight */}
        <Card className="rounded-2xl border-border shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">
                  {category === 'service' ? 'AI Service & Cash Copilot' : 'AI Cash-Flow Insight'}
                </CardTitle>
                <CardDescription className="text-xs">Smart forecast for this week</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-accent/50 border border-blue-100 p-4">
              {category === 'service' ? (
                <p className="text-sm text-foreground leading-relaxed">
                  You have <span className="font-semibold text-emerald-700">2 urgent work orders</span> scheduled for tomorrow.
                  Outstanding client khata is <span className="font-semibold">{formatINR(14200)}</span>.
                  Customer <span className="font-semibold">Deepak Verma</span> has ₹1,200 pending since 7 days.
                </p>
              ) : (
                <p className="text-sm text-foreground leading-relaxed">
                  Supplier payment of <span className="font-semibold">{formatINR(8000)}</span> is due on Friday.
                  Expected collections are <span className="font-semibold">{formatINR(5200)}</span>.
                  Net cash balance is healthy.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={handleSendReminders}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary-hover flex-1 text-xs"
              >
                Send Reminders
              </Button>
              <Button
                onClick={() => setIsAIOpen(true)}
                variant="outline"
                size="sm"
                className="w-full flex-1 border-border text-foreground hover:bg-muted text-xs font-semibold"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" /> Ask AI Copilot
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Bottom Section: Dynamic for Service vs Shop */}
      {category === 'service' ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Active Service Work Orders */}
          <Card className="rounded-2xl border-border shadow-xs lg:col-span-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Active Service Work Orders</CardTitle>
                <CardDescription className="text-xs">
                  Live status of customer jobs, repairs & tailor orders
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setIsAddJobOpen(true)}
                  className="h-8 text-xs font-bold bg-[#007F7C] hover:bg-[#00605D] text-white"
                >
                  <Plus className="h-3 w-3 mr-1" /> New Job
                </Button>
                <Link to="/sales">
                  <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-primary">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="pl-6 text-xs uppercase tracking-wide">Job ID</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Customer</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Service</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-right">Amount</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Due</TableHead>
                    <TableHead className="pr-6 text-xs uppercase tracking-wide text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceJobs.slice(0, 5).map((job) => (
                    <TableRow key={job.id} className="border-border hover:bg-muted/40">
                      <TableCell className="pl-6 font-semibold text-foreground text-xs">{job.id}</TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{job.customerName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">
                        {job.serviceName}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-foreground text-right">
                        {formatINR(job.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={job.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{job.dueDate}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <Link to={`/create?brief=${encodeURIComponent(`Client: ${job.customerName}. Service deliverable: ${job.serviceName} for amount $${job.amount}. Due in 7 days.`)}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-[11px] text-[#007F7C] hover:bg-emerald-50 px-2 font-bold">
                            <Send className="h-3 w-3 mr-1" /> PayPal
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Popular Services & Rates Card */}
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Services & Rate Card</CardTitle>
                <CardDescription className="text-xs">Standardized pricing catalog</CardDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddServiceOpen(true)}
                className="h-7 text-xs font-bold text-[#007F7C] hover:bg-emerald-50 px-2"
              >
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {services.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-border p-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-bold text-foreground truncate">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.duration}</p>
                  </div>
                  <span className="text-xs font-bold text-[#007F7C] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {formatINR(s.price)}
                  </span>
                </div>
              ))}

              <Link to="/services" className="block pt-1">
                <Button variant="ghost" className="w-full text-xs text-primary font-semibold h-8 hover:bg-accent">
                  Manage all {services.length} services <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Recent Store Sales */}
          <Card className="rounded-2xl border-border shadow-xs lg:col-span-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Recent Store Sales</CardTitle>
                <CardDescription className="text-xs">Latest customer transactions</CardDescription>
              </div>
              <Link to="/sales" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="pl-6 text-xs uppercase tracking-wide">Invoice</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Customer</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Items</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-right">Amount</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Mode</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="pr-6 text-xs uppercase tracking-wide">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(sales.length > 0 ? sales : recentSales).slice(0, 5).map((sale: Sale) => (
                    <TableRow key={sale.id} className="border-border hover:bg-muted/40">
                      <TableCell className="pl-6 font-semibold text-foreground text-xs">{sale.id}</TableCell>
                      <TableCell className="text-xs text-foreground font-medium">{sale.customer}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{sale.items}</TableCell>
                      <TableCell className="text-xs font-bold text-foreground text-right">{formatINR(sale.amount)}</TableCell>
                      <TableCell><StatusBadge status={sale.mode} /></TableCell>
                      <TableCell><StatusBadge status={sale.status} /></TableCell>
                      <TableCell className="pr-6 text-xs text-muted-foreground">{sale.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <div>
                  <CardTitle className="text-sm font-bold">Low Stock Alerts</CardTitle>
                  <CardDescription className="text-xs">Inventory safety alerts</CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddProductOpen(true)}
                className="h-7 text-xs font-bold text-primary hover:bg-accent px-2"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Stock
              </Button>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {lowStockAlerts.slice(0, 4).map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-border p-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="text-destructive font-semibold">{item.stock} {item.unit}</span> left · min {item.reorder}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleReorder(item.name)}
                    className="h-7 text-xs font-semibold px-2"
                  >
                    Reorder
                  </Button>
                </div>
              ))}

              <Link to="/inventory" className="block pt-1">
                <Button variant="ghost" className="w-full text-xs text-primary font-semibold h-8 hover:bg-accent">
                  Open Full Inventory <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog Modals */}
      <AddServiceDialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen} />
      <AddProductDialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen} />
      <AddJobDialog open={isAddJobOpen} onOpenChange={setIsAddJobOpen} />

      {/* Slide-over Right Chatbot Drawer */}
      <AIChatbotDrawer open={isAIOpen} onOpenChange={setIsAIOpen} />
    </div>
  );
}
