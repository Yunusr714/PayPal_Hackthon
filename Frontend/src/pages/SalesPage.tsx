import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Search, Plus, Eye, IndianRupee, Package, CheckCircle2,
  AlertTriangle, Wrench, Scissors, FileText, Printer, Sparkles,
  Clock, ShieldCheck, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PrintableReceiptModal, ReceiptData } from '@/components/shared/PrintableReceiptModal';
import { useBusiness } from '@/context/BusinessContext';
import { formatINR, PaymentMode, Sale } from '@/data/mock-data';

export function SalesPage() {
  const { sales, addSale, products, services, category, user } = useBusiness();
  const isService = category === 'service';

  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // New Sale Modal State
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);

  // Shop Mode State (Product selection & stock deduction)
  const [selectedProductName, setSelectedProductName] = useState(products[0]?.name || 'Basmati Rice');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState(products[0]?.sellingPrice?.toString() || '95');

  // Service Mode State (Rate card selection & labor billing — Zero inventory!)
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [serviceUnits, setServiceUnits] = useState('1');
  const [serviceRate, setServiceRate] = useState(services[0]?.price?.toString() || '1800');
  const [serviceClient, setServiceClient] = useState('Client Walk-in');
  const [serviceNotes, setServiceNotes] = useState('');

  // Common payment mode
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);
  const [printableData, setPrintableData] = useState<ReceiptData | null>(null);

  // Active product details (Shop mode)
  const activeProduct = useMemo(() => {
    return products.find((p) => p.name === selectedProductName) || products[0];
  }, [products, selectedProductName]);

  // Active service details (Service mode)
  const activeService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  // Handle product selection (Shop mode)
  const handleProductSelect = (name: string) => {
    setSelectedProductName(name);
    const matched = products.find((p) => p.name === name);
    if (matched) {
      setUnitPrice(matched.sellingPrice.toString());
    }
  };

  // Handle service selection (Service mode)
  const handleServiceSelect = (id: string) => {
    setSelectedServiceId(id);
    const matched = services.find((s) => s.id === id);
    if (matched) {
      setServiceRate(matched.price.toString());
    }
  };

  const handleOpenSaleModal = () => {
    if (isService) {
      const defaultSrv = services[0];
      setSelectedServiceId(defaultSrv?.id || '');
      setServiceRate(defaultSrv?.price?.toString() || '1800');
      setServiceUnits('1');
      setServiceClient('Client Walk-in');
      setServiceNotes('');
      setPaymentMode('Cash');
    } else {
      const defaultProd = products[0]?.name || 'Basmati Rice';
      const defaultPrice = products[0]?.sellingPrice?.toString() || '95';
      setSelectedProductName(defaultProd);
      setUnitPrice(defaultPrice);
      setQuantity('1');
      setPaymentMode('Cash');
    }
    setIsNewSaleOpen(true);
  };

  const buildReceiptDataFromSale = (sale: Sale): ReceiptData => ({
    id: sale.id,
    type: isService ? 'service_order' : 'retail_sale',
    title: isService ? 'Service Job & Work Order Receipt' : 'Retail POS Cash Memo',
    date: sale.date,
    customerName: sale.customer === 'Counter Sale' ? 'Counter Walk-in' : sale.customer,
    items: [
      {
        description: sale.items,
        quantity: 1,
        unitPrice: sale.amount,
        total: sale.amount,
      },
    ],
    subtotal: sale.amount,
    tax: 0,
    total: sale.amount,
    paymentMode: sale.mode,
    status: sale.status,
    notes: isService
      ? 'Zero Inventory Model: Quality workmanship & service guaranteed.'
      : 'Goods once sold cannot be returned. Thank you for your business!',
  });

  // Submit sale/invoice
  const handleSaveSale = (e: React.FormEvent) => {
    e.preventDefault();

    if (isService) {
      // SERVICE MODE: Zero inventory, labor & rate-card billing
      const numUnits = parseFloat(serviceUnits);
      const numRate = parseFloat(serviceRate);

      if (isNaN(numUnits) || numUnits <= 0) {
        toast.error('Please enter valid work units or hours');
        return;
      }
      if (isNaN(numRate) || numRate <= 0) {
        toast.error('Please enter a valid rate');
        return;
      }

      const total = numUnits * numRate;
      const srvName = activeService?.name || 'Custom Service';
      const unitLabel = activeService?.pricingType === 'Hourly' ? (numUnits === 1 ? 'hr' : 'hrs') : (numUnits === 1 ? 'unit' : 'units');
      const itemDescription = `${srvName} (${numUnits} ${unitLabel})${serviceNotes ? ` - ${serviceNotes}` : ''}`;

      const createdSale = addSale({
        productName: itemDescription,
        quantity: numUnits,
        unitPrice: numRate,
        totalAmount: total,
        mode: paymentMode,
        status: 'Paid',
        customer: serviceClient.trim() || 'Client Walk-in',
      });

      toast.success('Service Invoice Created & Paid!', {
        description: `${createdSale.id}: ${srvName} billed for ${formatINR(total)} (Zero inventory applied).`,
      });

      setIsNewSaleOpen(false);
    } else {
      // SHOP MODE: Physical inventory, stock deduction & counter sale
      const numQty = parseFloat(quantity);
      const numPrice = parseFloat(unitPrice);

      if (isNaN(numQty) || numQty <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }
      if (isNaN(numPrice) || numPrice <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      if (activeProduct && numQty > activeProduct.stock) {
        toast.error('Insufficient Stock!', {
          description: `Cannot sell ${numQty} ${activeProduct.unit}. Only ${activeProduct.stock} ${activeProduct.unit} available in inventory.`,
        });
        return;
      }

      const total = numQty * numPrice;

      const createdSale = addSale({
        productName: selectedProductName,
        quantity: numQty,
        unitPrice: numPrice,
        totalAmount: total,
        mode: paymentMode,
        status: 'Paid',
        customer: 'Counter Sale',
      });

      const remainingStock = Math.max(0, (activeProduct?.stock || 0) - numQty);

      toast.success('Sale Completed & Stock Deducted!', {
        description: `${createdSale.items} billed for ${formatINR(total)}. Remaining stock of ${selectedProductName}: ${remainingStock} ${activeProduct?.unit || 'units'}.`,
      });

      setIsNewSaleOpen(false);
    }
  };

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const matchSearch =
        s.customer.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.items.toLowerCase().includes(search.toLowerCase());
      const matchMode = modeFilter === 'all' || s.mode === modeFilter;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchMode && matchStatus;
    });
  }, [sales, search, modeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const current = Math.min(page, totalPages);
  const pageData = filtered.slice((current - 1) * itemsPerPage, current * itemsPerPage);

  // Shop calculations
  const numQty = parseFloat(quantity) || 0;
  const numPrice = parseFloat(unitPrice) || 0;
  const currentStock = activeProduct ? activeProduct.stock : 0;
  const stockAfterSale = Math.max(0, currentStock - numQty);
  const isOutOfStock = numQty > currentStock;

  // Service calculations
  const numUnits = parseFloat(serviceUnits) || 0;
  const numRate = parseFloat(serviceRate) || 0;
  const serviceTotal = numUnits * numRate;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
          {isService ? 'Service Billings' : 'Sales & POS'}
        </h1>
        <p className="text-xs text-zinc-500 font-normal mt-1">
          {isService
            ? 'Track work order charges, client billings & receipts'
            : 'Track counter sales, retail bills & payment receipts'}
        </p>
      </div>

      {/* Top Search & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={isService ? 'Search invoice, client, or service...' : 'Search invoice or items...'}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-9 w-full rounded-xl border border-input dark:border-zinc-800 bg-white dark:bg-[#141518] pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <Select value={modeFilter} onValueChange={(v) => { setModeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36 h-9 text-xs rounded-xl dark:bg-[#141518] dark:border-zinc-800 dark:text-zinc-200">
              <SelectValue placeholder="Payment Mode" />
            </SelectTrigger>
            <SelectContent className="dark:bg-[#141518] dark:border-zinc-800 dark:text-zinc-200">
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="Credit">Credit</SelectItem>
              <SelectItem value="PayPal">PayPal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-32 h-9 text-xs rounded-xl dark:bg-[#141518] dark:border-zinc-800 dark:text-zinc-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="dark:bg-[#141518] dark:border-zinc-800 dark:text-zinc-200">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Primary Action Button */}
        <Button
          onClick={handleOpenSaleModal}
          className="bg-primary hover:bg-primary-hover text-white shrink-0 text-xs font-semibold h-9 rounded-xl shadow-sm"
        >
          {isService ? (
            <>
              <Plus className="h-4 w-4 mr-1.5" /> New Service Invoice
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1.5" /> New Counter Sale
            </>
          )}
        </Button>
      </div>

      {/* Top Status Strip: Service Rate Card (Service mode) vs Live Inventory (Shop mode) */}
      {isService ? (
        <div className="rounded-2xl border border-[#007F7C]/30 bg-[#E6F5F5]/40 dark:bg-[#007F7C]/10 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-800 dark:text-teal-200 flex items-center gap-1.5">
              <Wrench className="h-4 w-4 text-[#007F7C] dark:text-teal-400" /> Active Services & Rate Card (Zero Inventory · Standard Labor Rates)
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              {services.length} services configured
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {services.slice(0, 4).map((srv) => (
              <div
                key={srv.id}
                className="rounded-xl border border-[#007F7C]/20 dark:border-[#007F7C]/30 bg-white dark:bg-[#141518] p-2.5 transition-all hover:border-[#007F7C]/40 hover:shadow-xs"
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">{srv.name}</p>
                  <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#E6F5F5] dark:bg-[#007F7C]/25 text-[#007F7C] dark:text-teal-300 border border-[#007F7C]/30">
                    {srv.pricingType}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#007F7C] dark:text-teal-400">
                    {formatINR(srv.price)}
                    <span className="text-[10px] font-medium text-muted-foreground">
                      /{srv.pricingType === 'Hourly' ? 'hr' : 'job'}
                    </span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">{srv.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#141518] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
              <Package className="h-4 w-4 text-primary" /> Live Inventory Stock Levels (Auto-updates with each sale)
            </span>
            <span className="text-[11px] text-muted-foreground">
              Total products: {products.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {products.slice(0, 6).map((prod) => (
              <div
                key={prod.name}
                className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#18191D] p-2.5 transition-all hover:bg-slate-100/70 dark:hover:bg-zinc-800/60"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">{prod.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-foreground">
                    {prod.stock} <span className="text-[10px] font-medium text-muted-foreground">{prod.unit}</span>
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                      prod.stock <= 0
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/50'
                        : prod.stock <= prod.reorderLevel
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50'
                    }`}
                  >
                    {prod.stock <= 0 ? 'Out' : prod.stock <= prod.reorderLevel ? 'Low' : 'OK'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Invoices Table Card */}
      <Card className="rounded-2xl border-border dark:border-zinc-800 bg-white dark:bg-[#141518] shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-[#18191D]">
              <TableRow className="border-border dark:border-zinc-800 hover:bg-transparent">
                <TableHead className="pl-6 text-xs uppercase font-semibold">Invoice ID</TableHead>
                <TableHead className="text-xs uppercase font-semibold">
                  {isService ? 'Client / Party' : 'Sale Type'}
                </TableHead>
                <TableHead className="text-xs uppercase font-semibold">
                  {isService ? 'Service Rendered & Scope' : 'Product & Qty Sold'}
                </TableHead>
                <TableHead className="text-xs uppercase font-semibold text-right">
                  {isService ? 'Charge Amount' : 'Amount'}
                </TableHead>
                <TableHead className="text-xs uppercase font-semibold">Payment Mode</TableHead>
                <TableHead className="text-xs uppercase font-semibold">Status</TableHead>
                <TableHead className="text-xs uppercase font-semibold">Date</TableHead>
                <TableHead className="pr-6 text-xs uppercase font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    {isService ? 'No service billings found matching your filters.' : 'No sales found matching your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((sale) => (
                  <TableRow key={sale.id} className="border-border dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-800/40">
                    <TableCell className="pl-6 font-bold text-foreground text-xs">{sale.id}</TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-transparent dark:border-zinc-700/60">
                        {sale.customer === 'Counter Sale' ? 'Counter Walk-in' : sale.customer}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium max-w-[240px] truncate">{sale.items}</TableCell>
                    <TableCell className="text-xs font-bold text-foreground text-right">{formatINR(sale.amount)}</TableCell>
                    <TableCell><StatusBadge status={sale.mode} /></TableCell>
                    <TableCell><StatusBadge status={sale.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{sale.date}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedReceipt(sale)}
                          className="h-7 text-xs text-slate-600 dark:text-zinc-300 font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 px-2"
                        >
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrintableData(buildReceiptDataFromSale(sale))}
                          className="h-7 text-xs text-primary dark:text-emerald-400 border-primary/30 dark:border-emerald-500/30 font-semibold hover:bg-primary/5 dark:hover:bg-emerald-500/10 px-2"
                        >
                          <Printer className="h-3 w-3 mr-1" /> Print Slip
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* NEW SALE / INVOICE MODAL */}
      <Dialog open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
        <DialogContent className="max-w-md rounded-2xl border-border dark:border-zinc-800 bg-white dark:bg-[#141518] p-6 shadow-2xl dark:text-zinc-100">
          <DialogHeader className="pb-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {isService ? <Wrench className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  {isService ? 'New Service Invoice' : 'New Counter Sale'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {isService
                    ? 'Bill client for tailoring, plumbing, or service charges. Zero inventory required.'
                    : 'Quick walk-in sale — select product and quantity. Stock is deducted automatically.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveSale} className="space-y-4 pt-2">
            
            {/* SERVICE MODE FORM FIELDS */}
            {isService ? (
              <>
                {/* Service Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">
                      Service Offering <span className="text-destructive">*</span>
                    </Label>
                    {activeService && (
                      <span className="text-[11px] font-semibold text-[#007F7C] dark:text-teal-300 bg-[#E6F5F5] dark:bg-[#007F7C]/25 px-2 py-0.5 rounded border border-[#007F7C]/30">
                        {activeService.pricingType} · {activeService.duration}
                      </span>
                    )}
                  </div>
                  <Select value={selectedServiceId} onValueChange={handleServiceSelect}>
                    <SelectTrigger className="h-10 text-sm dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100">
                      <SelectValue placeholder="Choose service from rate card..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 dark:bg-[#141518] dark:border-zinc-800 dark:text-zinc-100">
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} · {formatINR(s.price)} ({s.pricingType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Client Name Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="service-client" className="text-xs font-semibold text-foreground">
                    Client / Party Name
                  </Label>
                  <Input
                    id="service-client"
                    type="text"
                    placeholder="Client Walk-in or Customer Name"
                    value={serviceClient}
                    onChange={(e) => setServiceClient(e.target.value)}
                    className="h-10 text-sm dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100"
                  />
                </div>

                {/* Units & Rate */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="service-units" className="text-xs font-semibold text-foreground">
                      {activeService?.pricingType === 'Hourly' ? 'Hours / Time' : 'Work Units / Jobs'} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="service-units"
                      type="number"
                      min="1"
                      step="1"
                      value={serviceUnits}
                      onChange={(e) => setServiceUnits(e.target.value)}
                      className="h-10 text-sm font-semibold dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="service-rate" className="text-xs font-semibold text-foreground">
                      Labor Rate (₹) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</span>
                      <Input
                        id="service-rate"
                        type="number"
                        min="0"
                        step="10"
                        value={serviceRate}
                        onChange={(e) => setServiceRate(e.target.value)}
                        className="h-10 pl-7 text-sm font-semibold dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Service Particulars / Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="service-notes" className="text-xs font-semibold text-foreground">
                    Work Description / Particulars (Optional)
                  </Label>
                  <Input
                    id="service-notes"
                    type="text"
                    placeholder="e.g. Italian navy fabric trial, leak joint sealed"
                    value={serviceNotes}
                    onChange={(e) => setServiceNotes(e.target.value)}
                    className="h-9 text-xs dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100"
                  />
                </div>

                {/* Service Model Banner (Zero Inventory info) */}
                <div className="rounded-xl border border-[#007F7C]/30 bg-[#E6F5F5]/60 dark:bg-[#007F7C]/15 p-3 text-slate-800 dark:text-zinc-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#005B59] dark:text-teal-300">Billing Model:</span>
                    <span className="font-bold text-[#007F7C] dark:text-teal-400">Zero Inventory · Labor & Rates</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="font-medium text-muted-foreground">Standard Duration:</span>
                    <span className="font-semibold">{activeService?.duration || 'Same day'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t border-[#007F7C]/20 dark:border-[#007F7C]/30 font-bold">
                    <span className="text-[#005B59] dark:text-teal-300">Net Service Charge:</span>
                    <span className="text-[#007F7C] dark:text-teal-400 font-black text-sm">
                      {formatINR(serviceTotal)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* SHOP MODE FORM FIELDS */
              <>
                {/* Product Dropdown */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">
                      Select Product <span className="text-destructive">*</span>
                    </Label>
                    {activeProduct && (
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/50">
                        In Stock: {activeProduct.stock} {activeProduct.unit}
                      </span>
                    )}
                  </div>
                  <Select value={selectedProductName} onValueChange={handleProductSelect}>
                    <SelectTrigger className="h-10 text-sm dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100">
                      <SelectValue placeholder="Choose product..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 dark:bg-[#141518] dark:border-zinc-800 dark:text-zinc-100">
                      {products.map((p) => (
                        <SelectItem key={p.name} value={p.name}>
                          {p.name} · {formatINR(p.sellingPrice)}/{p.unit} ({p.stock} left)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity and Unit Price */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="sale-qty" className="text-xs font-semibold text-foreground">
                      Quantity ({activeProduct?.unit || 'units'}) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="sale-qty"
                      type="number"
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={`h-10 text-sm font-semibold dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100 ${isOutOfStock ? 'border-destructive text-destructive' : ''}`}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="sale-price" className="text-xs font-semibold text-foreground">
                      Unit Price (₹) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</span>
                      <Input
                        id="sale-price"
                        type="number"
                        min="0"
                        step="0.5"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                        className="h-10 pl-7 text-sm font-semibold dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Live Stock Updation Preview Box */}
                <div className={`rounded-xl border p-3 transition-colors ${
                  isOutOfStock
                    ? 'border-rose-300 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                    : 'border-blue-200 dark:border-zinc-800 bg-blue-50/60 dark:bg-[#18191D] text-slate-800 dark:text-zinc-200'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">Original Stock:</span>
                    <span className="font-bold">{currentStock} {activeProduct?.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="font-medium">Quantity to Sell:</span>
                    <span className="font-bold text-destructive">-{numQty} {activeProduct?.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t border-slate-200 dark:border-zinc-800 font-bold">
                    <span>Remaining Stock after Sale:</span>
                    <span className={isOutOfStock ? 'text-destructive font-black' : 'text-emerald-700 dark:text-emerald-400 font-black'}>
                      {isOutOfStock ? 'Insufficient Stock!' : `${stockAfterSale} ${activeProduct?.unit}`}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Payment Mode Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Payment Mode
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {(['Cash', 'UPI', 'Credit', 'PayPal'] as PaymentMode[]).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    className={`rounded-lg py-1.5 text-xs font-semibold border transition-all ${
                      paymentMode === mode
                        ? 'border-primary bg-primary text-white shadow-xs'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18191D] text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Bill Banner */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#18191D] p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {isService ? 'Total Service Invoice' : 'Total Bill Amount'}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  {isService ? 'Labor & workmanship charge' : 'Counter invoice total'}
                </p>
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-zinc-100">
                {formatINR(isService ? serviceTotal : numQty * numPrice)}
              </span>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewSaleOpen(false)}
                className="text-xs dark:border-zinc-800 dark:hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isService ? serviceTotal <= 0 : (isOutOfStock || numQty <= 0)}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
              >
                {isService ? (
                  <>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Generate Service Invoice
                  </>
                ) : (
                  <>
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Complete Sale & Deduct Stock
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* RECEIPT / INVOICE MODAL */}
      <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="max-w-md rounded-2xl border-border dark:border-zinc-800 bg-white dark:bg-[#141518] p-6 shadow-2xl dark:text-zinc-100">
          {selectedReceipt && (
            <div className="space-y-4">
              {/* Receipt Header */}
              <div className="border-b dark:border-zinc-800 pb-3 text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  {isService ? 'Service Billing & Receipt' : 'Retail Cash Memo'}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5">{user.businessName}</h3>
                <p className="text-[11px] text-muted-foreground">{user.address || 'GSTIN / Retail Store'}</p>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 text-xs gap-2 py-1 border-b border-dashed border-slate-200 dark:border-zinc-800">
                <div>
                  <span className="text-muted-foreground text-[10px]">Invoice No:</span>
                  <p className="font-bold text-slate-800 dark:text-zinc-200">{selectedReceipt.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-[10px]">Date:</span>
                  <p className="font-bold text-slate-800 dark:text-zinc-200">{selectedReceipt.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px]">{isService ? 'Client / Billed To:' : 'Customer:'}</span>
                  <p className="font-bold text-slate-800 dark:text-zinc-200">{selectedReceipt.customer}</p>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-[10px]">Payment Mode:</span>
                  <p className="font-bold text-slate-800 dark:text-zinc-200">{selectedReceipt.mode} ({selectedReceipt.status})</p>
                </div>
              </div>

              {/* Particulars Table */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase border-b dark:border-zinc-800 pb-1">
                  <span>{isService ? 'Service Scope / Work' : 'Item Particulars'}</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-900 dark:text-zinc-100 py-1">
                  <span className="max-w-[260px] truncate">{selectedReceipt.items}</span>
                  <span className="font-bold">{formatINR(selectedReceipt.amount)}</span>
                </div>
              </div>

              {/* Total & Model Note */}
              <div className="border-t border-slate-200 dark:border-zinc-800 pt-3">
                <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  <span>Total Amount Paid</span>
                  <span className="text-lg text-primary">{formatINR(selectedReceipt.amount)}</span>
                </div>
                {isService && (
                  <p className="mt-2 text-[10px] text-[#007F7C] dark:text-teal-300 bg-[#E6F5F5] dark:bg-[#007F7C]/20 rounded p-1.5 border border-[#007F7C]/30 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    Zero Inventory Model: Quality workmanship & service guaranteed.
                  </p>
                )}
              </div>

              <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2 justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReceipt(null)}
                  className="text-xs w-full sm:w-auto dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  Close
                </Button>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const msg = `Namaste ${selectedReceipt.customer}! Here is your Cashiko receipt for ${selectedReceipt.id}: ${selectedReceipt.items}. Total amount: ₹${selectedReceipt.amount.toLocaleString('en-IN')}. Mode: ${selectedReceipt.mode} (${selectedReceipt.status}). Thank you for your business!`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="text-xs border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  >
                    Share WhatsApp
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setPrintableData(buildReceiptDataFromSale(selectedReceipt));
                      setSelectedReceipt(null);
                    }}
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
                  >
                    <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Bill / Thermal Slip
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modern Printable Thermal & A4 Receipt Modal */}
      <PrintableReceiptModal
        open={!!printableData}
        onOpenChange={(open) => !open && setPrintableData(null)}
        data={printableData}
      />

    </div>
  );
}
