import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IndianRupee, Wallet, Users, Package, Sparkles, ArrowRight,
  TrendingUp, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { KPICard } from '@/components/shared/KPICard';
import { ChartCard } from '@/components/shared/ChartCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { AreaChartCard } from '@/components/shared/Charts';
import { formatINR, salesOverviewData, salesOverview30Data, salesOverview90Data, recentSales, lowStockAlerts } from '@/data/mock-data';

export function DashboardPage() {
  const [salesRange, setSalesRange] = useState<'7' | '30' | '90'>('7');

  const chartData = salesRange === '7' ? salesOverviewData : salesRange === '30' ? salesOverview30Data : salesOverview90Data;

  const handleNewSale = () => toast.success('Sale saved successfully', { description: 'INV-1043 has been created.' });
  const handleAskAI = () => window.location.assign('/#/ai-assistant');
  const handleReorder = (name: string) => toast.success('Reorder request created', { description: `${name} added to reorder list.` });
  const handleSendReminders = () => toast.success('Reminders sent successfully', { description: 'Reminders sent to top 3 credit customers.' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Good evening, Ramesh</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Here is your store performance for today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleNewSale} className="bg-primary text-primary-foreground hover:bg-primary-hover">
            <IndianRupee className="mr-1.5 h-4 w-4" /> New Sale
          </Button>
          <Link to="/ai-assistant">
            <Button variant="outline" className="border-border text-foreground hover:bg-muted">
              <Sparkles className="mr-1.5 h-4 w-4 text-primary" /> Ask AI Assistant
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Today's Sales"
          value={formatINR(12450)}
          icon={IndianRupee}
          trend={{ value: '8.2% vs yesterday', positive: true }}
        >
          <div className="h-10">
            <AreaChartCard data={salesOverviewData} xKey="day" yKey="sales" height={40} />
          </div>
        </KPICard>
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
          value="9"
          icon={Package}
          subtext="3 need urgent reorder"
          variant="danger"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Sales Overview — Last 7 Days"
          subtitle="Daily sales performance"
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

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Cash-Flow Insight</CardTitle>
                <CardDescription className="text-xs">Smart forecast for this week</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-accent/50 border border-blue-100 p-4">
              <p className="text-sm text-foreground leading-relaxed">
                Supplier payment of <span className="font-semibold">{formatINR(8000)}</span> is due on Friday.
                Expected customer collections are <span className="font-semibold">{formatINR(5200)}</span>.
                You may face a short-term cash gap of <span className="font-semibold text-destructive">{formatINR(2800)}</span>.
                Send reminders to your top 3 credit customers.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleSendReminders} size="sm" className="bg-primary text-primary-foreground hover:bg-primary-hover flex-1">
                Send Reminders
              </Button>
              <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted flex-1">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-xl border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Recent Sales</CardTitle>
                <CardDescription className="text-xs">Latest transactions in your store</CardDescription>
              </div>
              <Link to="/sales" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
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
                  <TableRow key={sale.id} className="border-border">
                    <TableCell className="pl-6 font-medium text-foreground text-sm">{sale.id}</TableCell>
                    <TableCell className="text-sm text-foreground">{sale.customer}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">{sale.items}</TableCell>
                    <TableCell className="text-sm font-semibold text-foreground text-right">{formatINR(sale.amount)}</TableCell>
                    <TableCell><StatusBadge status={sale.mode} /></TableCell>
                    <TableCell><StatusBadge status={sale.status} /></TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground">{sale.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <div>
                <CardTitle className="text-sm font-semibold">Low Stock Alerts</CardTitle>
                <CardDescription className="text-xs">Items needing reorder</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockAlerts.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="text-destructive font-medium">{item.stock} {item.unit}</span> left · reorder at {item.reorder} {item.unit}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleReorder(item.name)}
                  className="ml-2 shrink-0 bg-primary text-primary-foreground hover:bg-primary-hover"
                >
                  Reorder
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
