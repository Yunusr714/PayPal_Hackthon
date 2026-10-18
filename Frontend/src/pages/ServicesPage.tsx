import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Scissors, Wrench, Sparkles, Plus, Search, Filter,
  Clock, IndianRupee, CheckCircle2, AlertCircle, Calendar,
  Phone, User, Trash2, Edit3, ArrowRight, Briefcase, Zap, ShieldCheck, Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { KPICard } from '@/components/shared/KPICard';
import { AddServiceDialog } from '@/components/shared/AddServiceDialog';
import { AddJobDialog } from '@/components/shared/AddJobDialog';
import { PrintableReceiptModal, ReceiptData } from '@/components/shared/PrintableReceiptModal';
import { useBusiness, ServiceItem, ServiceJob } from '@/context/BusinessContext';
import { formatINR } from '@/data/mock-data';

export function ServicesPage() {
  const { services, serviceJobs, updateService, deleteService, updateJobStatus, category, user } = useBusiness();
  const [activeTab, setActiveTab] = useState<'catalog' | 'jobs'>('catalog');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [printableData, setPrintableData] = useState<ReceiptData | null>(null);

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const activeJobsCount = serviceJobs.filter((j) => j.status === 'In Progress' || j.status === 'Scheduled').length;
  const completedJobsCount = serviceJobs.filter((j) => j.status === 'Completed' || j.status === 'Delivered').length;
  const totalServiceRevenue = serviceJobs.reduce((acc, j) => acc + j.amount, 0);

  const getStatusBadge = (status: ServiceJob['status']) => {
    switch (status) {
      case 'Completed':
        return <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F5F5] px-2.5 py-0.5 text-xs font-semibold text-[#007F7C] border border-[#007F7C]/30">Completed</span>;
      case 'In Progress':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">In Progress</span>;
      case 'Scheduled':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">Scheduled</span>;
      case 'Delivered':
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">Delivered & Paid</span>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (cat: string) => {
    if (cat.toLowerCase().includes('tailor')) return Scissors;
    if (cat.toLowerCase().includes('plumb')) return Wrench;
    if (cat.toLowerCase().includes('electr')) return Zap;
    return Sparkles;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Actions Bar */}
      <div className="flex items-center justify-end gap-2">
        <Button
          onClick={() => setIsAddServiceOpen(true)}
          className="bg-[#007F7C] hover:bg-[#006663] text-white font-semibold text-xs shadow-sm"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add New Service
        </Button>

        <Button
          variant="outline"
          onClick={() => setIsAddJobOpen(true)}
          className="border-slate-200 text-foreground hover:bg-slate-50 text-xs font-medium"
        >
          <Briefcase className="mr-1.5 h-3.5 w-3.5 text-[#007F7C]" /> New Work Order
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Active Services"
          value={services.length.toString()}
          icon={Sparkles}
          subtext="Configured in rate card"
        />
        <KPICard
          title="Active Work Orders"
          value={activeJobsCount.toString()}
          icon={Clock}
          variant="warning"
          subtext={`${serviceJobs.filter(j => j.status === 'Scheduled').length} upcoming bookings`}
        />
        <KPICard
          title="Completed Jobs"
          value={completedJobsCount.toString()}
          icon={CheckCircle2}
          subtext="100% on-time turnaround"
        />
        <KPICard
          title="Service Revenue"
          value={formatINR(totalServiceRevenue)}
          icon={IndianRupee}
          trend={{ value: '14.8% this month', positive: true }}
        />
      </div>

      {/* Main Tabs: Service Catalog vs Client Work Orders */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <TabsList className="h-9">
            <TabsTrigger value="catalog" className="text-xs font-semibold px-3">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Service Catalog ({services.length})
            </TabsTrigger>
            <TabsTrigger value="jobs" className="text-xs font-semibold px-3">
              <Briefcase className="mr-1.5 h-3.5 w-3.5" /> Client Work Orders ({serviceJobs.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === 'catalog' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search service name or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-60 rounded-lg border border-input bg-white pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Service Catalog */}
        <TabsContent value="catalog" className="space-y-4 pt-1">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => {
              const Icon = getCategoryIcon(service.category);
              return (
                <div
                  key={service.id}
                  className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-[#007F7C]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Category Badge & Availability Switch */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F5F5] px-2.5 py-0.5 text-[11px] font-semibold text-[#007F7C] border border-[#007F7C]/20">
                        <Icon className="h-3 w-3 text-[#007F7C]" />
                        {service.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-medium ${service.isAvailable ? 'text-[#007F7C]' : 'text-slate-400'}`}>
                          {service.isAvailable ? 'Available' : 'Paused'}
                        </span>
                        <Switch
                          checked={service.isAvailable}
                          onCheckedChange={(val) => updateService(service.id, { isAvailable: val })}
                          className="scale-75 origin-right"
                        />
                      </div>
                    </div>

                    {/* Service Name & Description */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#007F7C] transition-colors">
                      {service.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground">{service.pricingType} Rate</span>
                        <p className="text-xl font-extrabold text-slate-900">
                          {formatINR(service.price)}
                          {service.pricingType === 'Hourly' && <span className="text-xs font-normal text-muted-foreground"> / hr</span>}
                          {service.pricingType === 'Per Unit' && <span className="text-xs font-normal text-muted-foreground"> / unit</span>}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" /> {service.duration}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end pt-2 border-t border-slate-50">
                      <button
                        type="button"
                        onClick={() => {
                          deleteService(service.id);
                          toast.success('Service removed from catalog');
                        }}
                        className="text-slate-400 hover:text-destructive p-1 rounded transition-colors text-xs inline-flex items-center gap-1"
                        title="Delete service"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="text-[11px]">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
              <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="text-sm font-bold text-slate-800">No services match your search</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try searching with another keyword or click "+ Add New Service" to add tailored offerings.
              </p>
              <Button
                onClick={() => setIsAddServiceOpen(true)}
                size="sm"
                className="bg-[#007F7C] hover:bg-[#006663] text-white font-semibold text-xs"
              >
                + Add Service Now
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Work Orders & Client Jobs Tracker */}
        <TabsContent value="jobs" className="space-y-4 pt-1">
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">Active Work Orders & Service Jobs</CardTitle>
                <CardDescription className="text-xs">
                  Track ongoing tailor garments, plumbing visits, repair status, and customer payments.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddJobOpen(true)}
                className="bg-[#007F7C] hover:bg-[#006663] text-white font-semibold text-xs"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> New Work Order
              </Button>
            </CardHeader>

            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="pl-6 text-xs uppercase tracking-wide">Job ID</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Customer & Contact</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Service Details</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-right">Labor / Charge</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Due Date</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                    <TableHead className="pr-6 text-xs uppercase tracking-wide text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceJobs.map((job) => (
                    <TableRow key={job.id} className="border-border hover:bg-slate-50/70">
                      <TableCell className="pl-6 font-bold text-foreground text-xs">{job.id}</TableCell>
                      <TableCell>
                        <p className="text-sm font-semibold text-foreground">{job.customerName}</p>
                        <p className="text-[11px] text-muted-foreground">{job.phone}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-foreground">{job.serviceName}</p>
                        {job.notes && <p className="text-[11px] text-muted-foreground truncate max-w-xs">{job.notes}</p>}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-foreground text-right">
                        {formatINR(job.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {job.dueDate}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(job.status)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {job.status !== 'Delivered' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const nextStatus = job.status === 'Scheduled' ? 'In Progress' :
                                  job.status === 'In Progress' ? 'Completed' : 'Delivered';
                                updateJobStatus(job.id, nextStatus as any);
                                toast.success(`Job marked as ${nextStatus}`);
                              }}
                              className="h-7 text-[11px] px-2 font-medium"
                            >
                              Mark {job.status === 'Scheduled' ? 'In Progress' : job.status === 'In Progress' ? 'Completed' : 'Delivered'}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const rData: ReceiptData = {
                                id: job.id,
                                type: 'service_order',
                                title: 'Service Work Order & Job Slip',
                                date: job.dueDate || 'Today',
                                dueDate: job.dueDate,
                                customerName: job.customerName,
                                customerPhone: job.phone,
                                items: [
                                  {
                                    description: `${job.serviceName}${job.notes ? ` (${job.notes})` : ''}`,
                                    quantity: 1,
                                    unitPrice: job.amount,
                                    total: job.amount,
                                  },
                                ],
                                subtotal: job.amount,
                                tax: 0,
                                total: job.amount,
                                paymentMode: job.status === 'Delivered' ? 'Cash / Paid' : 'Credit / Khata',
                                status: job.status === 'Delivered' ? 'Paid' : 'Pending',
                                notes: 'Zero Inventory Specialist Services: Workmanship guaranteed for 30 days.',
                              };
                              setPrintableData(rData);
                            }}
                            className="h-7 text-[11px] px-2 text-[#007F7C] border-[#007F7C]/30 hover:bg-[#E6F5F5] font-semibold"
                          >
                            <Printer className="mr-1 h-3 w-3" /> Slip
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const cleanPhone = (job.phone || '').replace(/[^0-9]/g, '');
                              const waPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
                              const msg = `Namaste ${job.customerName}! Here is your Cashiko service job slip for ${job.serviceName}. Amount: ₹${job.amount.toLocaleString('en-IN')}. Status: ${job.status}. Due Date: ${job.dueDate}. Thank you!`;
                              window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                              toast.success('WhatsApp Receipt Dispatched!', {
                                description: `Opened WhatsApp for ${job.customerName} (${job.phone}).`,
                              });
                            }}
                            className="h-7 text-[11px] px-2 text-emerald-700 hover:text-emerald-800"
                          >
                            Share Bill
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Modals */}
      <AddServiceDialog
        open={isAddServiceOpen}
        onOpenChange={setIsAddServiceOpen}
      />

      <AddJobDialog
        open={isAddJobOpen}
        onOpenChange={setIsAddJobOpen}
      />

      {/* Printable Thermal & A4 Work Order Slip Modal */}
      <PrintableReceiptModal
        open={!!printableData}
        onOpenChange={(open) => !open && setPrintableData(null)}
        data={printableData}
      />
    </div>
  );
}
