import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IndianRupee, Wallet, Users, Package, Sparkles, ArrowRight,
  TrendingUp, AlertTriangle, Plus, Scissors, Wrench, Briefcase,
  Clock, CheckCircle2, Store, Calendar, ArrowUpRight,
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
import {
  formatINR,
  salesOverviewData,
  salesOverview30Data,
  salesOverview90Data,
  recentSales,
  lowStockAlerts,
} from '@/data/mock-data';

export function DashboardPage() {
  const { user, category, toggleCategory, services, serviceJobs, products } = useBusiness();
  const location = useLocation();
  const [salesRange, setSalesRange] = useState<'7' | '30' | '90'>('7');
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Auto-open AI chatbot drawer if routed with query param
  useEffect(() => {
    if (location.search.includes('openAI=true')) {
      setIsAIOpen(true);
    }
  }, [location.search]);

  const chartData = salesRange === '7' ? salesOverviewData : salesRange === '30' ? salesOverview30Data : salesOverview90Data;

  const handleNewSale = () => toast.success('Sale saved successfully', { description: 'INV-1043 has been created.' });
  const handleReorder = (name: string) => toast.success('Reorder request created', { description: `${name} added to supplier reorder list.` });
  const handleSendReminders = () => toast.success('Reminders sent successfully', { description: 'WhatsApp khata reminders sent to top credit customers.' });

  const activeServiceJobs = serviceJobs.filter((j) => j.status === 'In Progress' || j.status === 'Scheduled');
  const lowStockCount = products.filter((p) => p.status === 'Low Stock' || p.status === 'Critical').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Dynamic Header with Category Badge & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Good day, {user.name.split(' ')[0]}
            </h2>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                category === 'service'
                  ? 'bg-[#E6F5F5] text-[#007F7C] border-[#007F7C]/30'
                  : 'bg-blue-100 text-blue-800 border-blue-200'
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
          </div>
        </div>

        {/* Action Buttons tailored to Category */}
        <div className="flex items-center gap-2 flex-wrap">
          {category === 'service' ? (
            <>
              <Button
                onClick={() => setIsAddServiceOpen(true)}
                className="bg-[#007F7C] hover:bg-[#006663] text-white font-semibold text-xs shadow-sm"
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
                onClick={handleNewSale}
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs shadow-sm"
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

          <Button
            onClick={() => setIsAIOpen(true)}
            variant="outline"
            className="border-border text-foreground hover:bg-muted text-xs font-semibold shadow-2xs"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" /> Ask AI
          </Button>
        </div>
      </div>

      {/* KPI Cards: Dynamic for Service vs Shop */}
      {category === 'service' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Today's Service Revenue"
            value={formatINR(8450)}
            icon={IndianRupee}
            trend={{ value: '12.4% vs last week', positive: true }}
          />

          <KPICard
            title="Active Work Orders"
            value={activeServiceJobs.length.toString()}
            icon={Briefcase}
            variant="warning"
            subtext="2 jobs ready for delivery today"
          />

          <KPICard
            title="Outstanding Service Khata"
            value={formatINR(14200)}
            icon={Wallet}
            variant="default"
            subtext="4 customer invoices pending"
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
            title="Today's Sales"
            value={formatINR(12450)}
            icon={IndianRupee}
            trend={{ value: '8.2% vs yesterday', positive: true }}
          />

          <KPICard
            title="Outstanding Khata"
            value={formatINR(38700)}
            icon={Wallet}
            trend={{ value: '4.5% vs last week', positive: false }}
            variant="warning"
          />

          <KPICard
            title="Customers with Dues"
            value="24"
            icon={Users}
            subtext="6 payments overdue"
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
          title={category === 'service' ? 'Service Revenue Overview — Last 7 Days' : 'Sales Overview — Last 7 Days'}
          subtitle={category === 'service' ? 'Daily billings & work orders completed' : 'Daily sales performance'}
          trend={{ value: '12.4% this week', positive: true }}
          className="lg:col-span-2"
          action={
            <Tabs value={salesRange} onValueChange={(v) => setSalesRange(v as '7' | '30' | '90')}>
              <TabsList className="h-8">
                <TabsTrigger value="7" className="text-xs px-2.5 py-0.5">7 Days</TabsTrigger>
                <TabsTrigger value="30" className="text-xs px-2.5 py-0.5">30 Days</TabsTrigger>
                <TabsTrigger value="90" className="text-xs px-2.5 py-0.5">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          }
        >
          <AreaChartCard data={chartData} xKey="day" yKey="sales" height={280} />
        </ChartCard>

        {/* AI Cash-Flow Insight */}
        <Card className="rounded-2xl border-border shadow-sm flex flex-col justify-between">
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
                  You have <span className="font-semibold text-emerald-700">2 urgent work orders</span> scheduled for tomorrow (Suit Stitching & Leak Repair).
                  Outstanding client khata is <span className="font-semibold">{formatINR(14200)}</span>.
                  Customer <span className="font-semibold">Deepak Verma</span> has ₹1,200 pending since 7 days.
                </p>
              ) : (
                <p className="text-sm text-foreground leading-relaxed">
                  Supplier payment of <span className="font-semibold">{formatINR(8000)}</span> is due on Friday.
                  Expected customer collections are <span className="font-semibold">{formatINR(5200)}</span>.
                  You may face a short-term cash gap of <span className="font-semibold text-destructive">{formatINR(2800)}</span>.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleSendReminders} size="sm" className="bg-primary text-primary-foreground hover:bg-primary-hover flex-1 text-xs">
                Send WhatsApp Reminders
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
          
          {/* Left: Active Service Work Orders */}
          <Card className="rounded-2xl border-border shadow-sm lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Active Service Work Orders</CardTitle>
                  <CardDescription className="text-xs">Live status of customer jobs, repairs & tailor orders</CardDescription>
                </div>
                <Link to="/services" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                  View All Work Orders <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="pl-6 text-xs uppercase tracking-wide">Job</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Customer</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Service</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-right">Charge</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="pr-6 text-xs uppercase tracking-wide">Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceJobs.slice(0, 5).map((job) => (
                    <TableRow key={job.id} className="border-border hover:bg-muted/40">
                      <TableCell className="pl-6 font-bold text-xs text-foreground">{job.id}</TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{job.customerName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[160px]">{job.serviceName}</TableCell>
                      <TableCell className="text-sm font-bold text-foreground text-right">{formatINR(job.amount)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          job.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                          job.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                          job.status === 'Delivered' ? 'bg-slate-100 text-slate-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {job.status}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-xs text-muted-foreground">{job.dueDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Right: Configured Services & Quick Rate Card */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">My Service Rate Card</CardTitle>
                <CardDescription className="text-xs">Your services & charges</CardDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddServiceOpen(true)}
                className="h-7 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 p-1 px-2"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Service
              </Button>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {services.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-bold text-foreground truncate">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.duration}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
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
          
          {/* Left: Recent Store Sales */}
          <Card className="rounded-2xl border-border shadow-sm lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Recent Store Sales</CardTitle>
                  <CardDescription className="text-xs">Latest customer transactions</CardDescription>
                </div>
                <Link to="/sales" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
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
                  {recentSales.slice(0, 6).map((sale) => (
                    <TableRow key={sale.id} className="border-border hover:bg-muted/40">
                      <TableCell className="pl-6 font-semibold text-foreground text-xs">{sale.id}</TableCell>
                      <TableCell className="text-sm text-foreground">{sale.customer}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">{sale.items}</TableCell>
                      <TableCell className="text-sm font-bold text-foreground text-right">{formatINR(sale.amount)}</TableCell>
                      <TableCell><StatusBadge status={sale.mode} /></TableCell>
                      <TableCell><StatusBadge status={sale.status} /></TableCell>
                      <TableCell className="pr-6 text-xs text-muted-foreground">{sale.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Right: Low Stock Alerts */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <div>
                  <CardTitle className="text-sm font-bold">Low Stock Alerts</CardTitle>
                  <CardDescription className="text-xs">Items needing reorder</CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddProductOpen(true)}
                className="h-7 text-xs font-bold text-primary hover:bg-accent p-1 px-2"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Stock
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStockAlerts.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      <span className="text-destructive font-semibold">{item.stock} {item.unit}</span> left · reorder at {item.reorder} {item.unit}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleReorder(item.name)}
                    className="ml-2 shrink-0 bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold h-7"
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
      <AddServiceDialog
        open={isAddServiceOpen}
        onOpenChange={setIsAddServiceOpen}
      />

      <AddProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
      />

      <AddJobDialog
        open={isAddJobOpen}
        onOpenChange={setIsAddJobOpen}
      />

      {/* Slide-over Right Chatbot Drawer */}
      <AIChatbotDrawer
        open={isAIOpen}
        onOpenChange={setIsAIOpen}
      />

    </div>
  );
}
