import { useState } from 'react';
import { toast } from 'sonner';
import { Download, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ChartCard } from '@/components/shared/ChartCard';
import { BarChartCard, PieChartCard } from '@/components/shared/Charts';
import { monthlySalesData, topProductsData, creditRiskData, formatINR } from '@/data/mock-data';

export function ReportsPage() {
  const [reportType, setReportType] = useState('sales');

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-full sm:w-48 h-9">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales Report</SelectItem>
              <SelectItem value="khata">Khata Report</SelectItem>
              <SelectItem value="inventory">Inventory Report</SelectItem>
              <SelectItem value="cashflow">Cash Flow Report</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="text"
            placeholder="Date range: 01 Oct 2026 - 31 Oct 2026"
            disabled
            className="h-9 w-full sm:w-72 rounded-lg border border-input bg-muted/50 px-3 text-sm text-muted-foreground"
          />
        </div>
        <Button onClick={() => toast.success('Report downloaded', { description: `${reportType} report exported as PDF.` })} className="bg-primary text-primary-foreground hover:bg-primary-hover shrink-0">
          <Download className="h-4 w-4 mr-1.5" /> Download Report
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Monthly Sales Summary"
          subtitle="Revenue trend over the last 6 months"
          trend={{ value: '8.1% growth', positive: true }}
        >
          <BarChartCard data={monthlySalesData} xKey="month" yKey="sales" height={280} showLabels />
        </ChartCard>

        <ChartCard
          title="Top Selling Products"
          subtitle="Best performers by units sold"
        >
          <BarChartCard data={topProductsData} xKey="product" yKey="units" horizontal height={280} color="hsl(var(--primary))" />
        </ChartCard>

        <ChartCard
          title="Customer Credit Risk"
          subtitle="Risk distribution across customers"
        >
          <PieChartCard data={creditRiskData} height={280} />
        </ChartCard>

        <ChartCard
          title="AI Business Summary"
          subtitle="Smart insights from your store data"
        >
          <div className="rounded-xl bg-accent/50 border border-blue-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">AI Insights</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              Your store earned <span className="font-semibold">{formatINR(342000)}</span> this month.
              Credit sales increased by <span className="font-semibold text-success">12%</span>, but collections improved by
              <span className="font-semibold text-success"> 8%</span>. Aata, oil, and rice are likely to require reorder
              within the next 5 days. Consider sending reminders to high-risk customers to improve Friday cash flow.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-success" />
                <span className="text-xs font-medium text-success">Sales up 12%</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-warning/10 px-3 py-1.5">
                <span className="text-xs font-medium text-warning">3 items need reorder</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
