import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, Phone, Calendar, Clock, IndianRupee,
  Share2, CheckCircle2, AlertTriangle, Check, Wallet,
  User, Sparkles, Filter, ChevronRight, BookOpen, Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { PrintableReceiptModal, ReceiptData } from '@/components/shared/PrintableReceiptModal';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBusiness, CustomerDueItem } from '@/context/BusinessContext';
import { formatINR } from '@/data/mock-data';
import { sendWhatsAppReminder } from '@/utils/paypal';

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function CustomerDetailPage() {
  const { customerName } = useParams<{ customerName: string }>();
  const navigate = useNavigate();
  const { user, customers, services, products, category, addCustomerDue, markDuePaid, getDuesForCustomer } = useBusiness();

  const decodedName = customerName ? decodeURIComponent(customerName) : '';

  const customer = useMemo(() => {
    return customers.find(
      (c) => c.name.toLowerCase() === decodedName.toLowerCase()
    );
  }, [customers, decodedName]);

  // Dues filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  // Add Due Popup state
  const [isAddDueOpen, setIsAddDueOpen] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [dueDate, setDueDate] = useState('18 Oct 2026');
  const [dueNotes, setDueNotes] = useState('');
  const [printableData, setPrintableData] = useState<ReceiptData | null>(null);

  // Retrieve customer dues
  const dues = useMemo(() => {
    if (!customer) return [];
    return getDuesForCustomer(customer.name);
  }, [customer, getDuesForCustomer]);

  const filteredDues = useMemo(() => {
    if (statusFilter === 'all') return dues;
    if (statusFilter === 'pending') return dues.filter((d) => d.status === 'Pending' || d.status === 'Overdue');
    if (statusFilter === 'paid') return dues.filter((d) => d.status === 'Paid');
    return dues;
  }, [dues, statusFilter]);

  const pendingDuesCount = dues.filter((d) => d.status === 'Pending').length;
  const overdueDuesCount = dues.filter((d) => d.status === 'Overdue').length;

  // Handle item dropdown selection (Product for Shop, Service for Service)
  const handleItemSelect = (itemName: string) => {
    setSelectedServiceName(itemName);
    if (category === 'shop') {
      const matched = products.find((p) => p.name === itemName);
      if (matched) {
        setUnitPrice(matched.sellingPrice.toString());
      }
    } else {
      const matched = services.find((s) => s.name === itemName);
      if (matched) {
        setUnitPrice(matched.price.toString());
      }
    }
  };

  const handleOpenAddDue = () => {
    if (category === 'shop') {
      const defaultProd = products[0]?.name || 'Slim Fit Cotton Oxford Shirt';
      const defaultPrice = products[0]?.sellingPrice?.toString() || '1499';
      setSelectedServiceName(defaultProd);
      setUnitPrice(defaultPrice);
    } else {
      const defaultSvc = services[0]?.name || 'Custom Service';
      const defaultPrice = services[0]?.price?.toString() || '450';
      setSelectedServiceName(defaultSvc);
      setUnitPrice(defaultPrice);
    }
    setQuantity('1');
    setDueDate('18 Oct 2026');
    setDueNotes('');
    setIsAddDueOpen(true);
  };

  // Selected product when in shop mode
  const selectedProduct = useMemo(() => {
    if (category !== 'shop') return null;
    return products.find((p) => p.name === selectedServiceName);
  }, [products, selectedServiceName, category]);

  const handleSaveDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    const numQty = parseFloat(quantity);
    const numPrice = parseFloat(unitPrice);

    if (isNaN(numQty) || numQty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error('Please enter a valid rate/price');
      return;
    }

    if (category === 'shop' && selectedProduct && numQty > selectedProduct.stock) {
      toast.error('Insufficient Stock!', {
        description: `Cannot add due for ${numQty} ${selectedProduct.unit}. Only ${selectedProduct.stock} ${selectedProduct.unit} available in inventory.`,
      });
      return;
    }

    const total = numQty * numPrice;

    addCustomerDue({
      customerName: customer.name,
      serviceName: selectedServiceName || (category === 'shop' ? 'Grocery Item' : 'Custom Work Order'),
      quantity: numQty,
      unitPrice: numPrice,
      totalAmount: total,
      dueDate: dueDate.trim() || '18 Oct 2026',
      notes: dueNotes.trim(),
    });

    toast.success('Due Recorded & Stock Updated!', {
      description: `${formatINR(total)} recorded for ${customer.name}.${
        selectedProduct ? ` Deducted ${numQty} ${selectedProduct.unit} from ${selectedProduct.name} stock.` : ''
      }`,
    });

    setIsAddDueOpen(false);
  };

  if (!customer) {
    return (
      <div className="space-y-4 animate-fade-in py-10 text-center">
        <p className="text-sm font-semibold text-muted-foreground">Customer not found</p>
        <Button onClick={() => navigate('/customers')} variant="outline" size="sm">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Customers
        </Button>
      </div>
    );
  }

  const risk = customer.riskScore < 30 ? 'Low' : customer.riskScore < 60 ? 'Medium' : 'High';

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/customers')}
            className="h-9 w-9 p-0 rounded-xl border-border hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/customers" className="hover:underline hover:text-foreground">
                Customers
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-foreground">{customer.name}</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
              Customer Profile & Khata Ledger
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const statementData: ReceiptData = {
                id: `STMT-${customer.name.replace(/\s+/g, '').toUpperCase().slice(0, 6)}`,
                type: 'statement',
                title: 'Customer Khata Statement & Ledger',
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                dueDate: (customer as any).lastPaymentDate || customer.lastVisit || 'Immediate',
                customerName: customer.name,
                customerPhone: customer.phone,
                items: dues.length > 0
                  ? dues.map((d) => ({
                      description: `${d.serviceName} [${d.status}] (${d.date})`,
                      quantity: d.quantity,
                      unitPrice: d.unitPrice,
                      total: d.totalAmount,
                    }))
                  : [
                      {
                        description: 'Outstanding Balance',
                        quantity: 1,
                        unitPrice: customer.outstanding,
                        total: customer.outstanding,
                      },
                    ],
                subtotal: dues.length > 0 ? dues.reduce((acc, d) => acc + d.totalAmount, 0) : customer.outstanding,
                tax: 0,
                total: customer.outstanding,
                paymentMode: 'Credit / Ledger',
                status: customer.outstanding > 0 ? 'Pending' : 'Paid',
                notes: `Official Khata statement for ${customer.name}. Outstanding balance: ${formatINR(customer.outstanding)}.`,
              };
              setPrintableData(statementData);
            }}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold h-9 rounded-xl"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Statement
          </Button>

          {customer.outstanding > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const toastId = toast.loading('Generating live PayPal payment link...');
                try {
                  await sendWhatsAppReminder({
                    customerName: customer.name,
                    phone: customer.phone,
                    amount: customer.outstanding,
                    businessName: user?.businessName || 'Cashiko',
                  });
                  toast.success('WhatsApp Reminder Dispatched', {
                    id: toastId,
                    description: `Opened WhatsApp chat with live PayPal payment link for ${customer.name}.`,
                  });
                } catch (e: any) {
                  toast.error('Failed to open WhatsApp reminder', { id: toastId });
                }
              }}
              className={category === 'service'
                ? 'border-[#007F7C]/30 text-[#007F7C] hover:bg-[#E6F5F5] text-xs font-semibold h-9 rounded-xl'
                : 'border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold h-9 rounded-xl'}
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5" /> WhatsApp Reminder
            </Button>
          )}

          <Button
            onClick={handleOpenAddDue}
            className="bg-primary hover:bg-primary-hover text-white font-semibold text-xs h-9 rounded-xl shadow-sm"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add New Due
          </Button>
        </div>
      </div>

      {/* Single Unified Horizontal Customer & Financial Metric Row Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:p-5 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-0 divide-y xl:divide-y-0 xl:divide-x divide-slate-100">
          
          {/* Section 1: Customer Profile Details */}
          <div className="flex items-center gap-3.5 xl:pr-6 shrink-0">
            <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-xs shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-black text-base">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">{customer.name}</h3>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  <User className="h-3 w-3 mr-0.5 text-slate-400" /> Active
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> {customer.phone}
                <span className="text-slate-300">·</span>
                <span>Visited: {customer.lastVisit}</span>
              </p>
            </div>
          </div>

          {/* Section 2: Outstanding Due Balance */}
          <div className="flex items-center gap-3 pt-3 xl:pt-0 xl:px-8 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-destructive border border-rose-100 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Outstanding Due</span>
                {customer.outstanding > 0 && (
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full border border-rose-200">
                    {overdueDuesCount + pendingDuesCount} pending
                  </span>
                )}
              </div>
              <p className="text-xl font-black text-destructive mt-0.5 leading-none">
                {formatINR(customer.outstanding)}
              </p>
            </div>
          </div>

          {/* Section 4: Lifetime Khata Purchases */}
          <div className="flex items-center gap-3 pt-3 xl:pt-0 xl:pl-6 shrink-0">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border shrink-0 ${
              category === 'service'
                ? 'bg-[#E6F5F5] text-[#007F7C] border-[#007F7C]/30'
                : 'bg-blue-50 text-blue-600 border-blue-100'
            }`}>
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Lifetime Volume</span>
              <p className="text-xl font-black text-slate-900 mt-0.5 leading-none">
                {formatINR(customer.totalPurchases)}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Dues Ledger Table Card */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                {category === 'service' ? 'Service Khata & Work Order Ledger' : 'Store Credit & Grocery Khata Ledger'}
              </CardTitle>
              <CardDescription className="text-xs">
                {category === 'service'
                  ? 'Detailed record of client service work orders, labor charges, and payment settlements.'
                  : 'Detailed record of retail goods taken on credit, grocery items, and settlement dates.'}
              </CardDescription>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({dues.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === 'pending' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending / Overdue ({pendingDuesCount + overdueDuesCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('paid')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === 'paid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paid ({dues.filter((d) => d.status === 'Paid').length})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          {filteredDues.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50/70">
                <TableRow className="border-border">
                  <TableHead className="pl-6 text-xs uppercase font-semibold">{category === 'shop' ? 'Product / Goods Taken' : 'Service / Description'}</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-center">Quantity</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-right">Unit Rate</TableHead>
                  <TableHead className="text-xs uppercase font-semibold text-right">Total Due</TableHead>
                  <TableHead className="text-xs uppercase font-semibold">Due Date</TableHead>
                  <TableHead className="text-xs uppercase font-semibold">Billed On</TableHead>
                  <TableHead className="text-xs uppercase font-semibold">Status</TableHead>
                  <TableHead className="pr-6 text-xs uppercase font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDues.map((due) => (
                  <TableRow key={due.id} className="border-border hover:bg-slate-50/60 transition-colors">
                    <TableCell className="pl-6">
                      <p className="text-sm font-bold text-slate-900">{due.serviceName}</p>
                      {due.notes && <p className="text-[11px] text-muted-foreground mt-0.5">{due.notes}</p>}
                    </TableCell>
                    <TableCell className="text-xs text-center font-semibold text-slate-700">
                      {due.quantity}
                    </TableCell>
                    <TableCell className="text-xs text-right text-muted-foreground">
                      {formatINR(due.unitPrice)}
                    </TableCell>
                    <TableCell className="text-sm font-bold text-right text-slate-900">
                      {formatINR(due.totalAmount)}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-700">
                      {due.dueDate}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {due.date}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          due.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : due.status === 'Overdue'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {due.status}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const itemReceipt: ReceiptData = {
                              id: `DUE-${due.id.slice(0, 6).toUpperCase()}`,
                              type: category === 'service' ? 'service_order' : 'retail_sale',
                              title: category === 'service' ? 'Service Due Bill' : 'Credit Sale Slip',
                              date: due.date,
                              dueDate: due.dueDate,
                              customerName: customer.name,
                              customerPhone: customer.phone,
                              items: [
                                {
                                  description: due.serviceName,
                                  quantity: due.quantity,
                                  unitPrice: due.unitPrice,
                                  total: due.totalAmount,
                                },
                              ],
                              subtotal: due.totalAmount,
                              tax: 0,
                              total: due.totalAmount,
                              paymentMode: 'Credit / Khata',
                              status: due.status,
                              notes: due.notes || undefined,
                            };
                            setPrintableData(itemReceipt);
                          }}
                          className="h-7 text-xs px-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                        >
                          <Printer className="h-3 w-3 mr-1" /> Slip
                        </Button>
                        {due.status !== 'Paid' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              markDuePaid(due.id);
                              toast.success(`Due settled for ${due.serviceName}!`);
                            }}
                            className="h-7 text-xs px-2.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300 font-bold"
                          >
                            <Check className="h-3 w-3 mr-1" /> Mark Paid
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Cleared
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-14 text-center space-y-3">
              <Wallet className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-bold text-slate-800">No dues found under this filter</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Click "+ Add New Due" to record a new service or goods charge for {customer.name}.
              </p>
              <Button
                onClick={handleOpenAddDue}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add New Due Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADD NEW DUE POPUP MODAL */}
      <Dialog open={isAddDueOpen} onOpenChange={setIsAddDueOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141518] text-foreground p-6 shadow-2xl">
          <DialogHeader className="pb-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Plus className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  Add New Due
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Adding charge for <strong className="text-foreground">{customer.name}</strong>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveDue} className="space-y-4 pt-2">
            
            {/* Product or Service Selection Dropdown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  {category === 'shop' ? 'Select Product from Inventory' : 'Select Service from Rate Card'} <span className="text-destructive">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  {category === 'shop' ? 'Stock items' : 'Labor & rates'}
                </span>
              </div>
              <Select value={selectedServiceName} onValueChange={handleItemSelect}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder={category === 'shop' ? 'Choose product...' : 'Choose service...'} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {category === 'shop' ? (
                    <>
                      {products.map((prod) => (
                        <SelectItem key={prod.name} value={prod.name}>
                          {prod.name} · {formatINR(prod.sellingPrice)}/{prod.unit} (Stock: {prod.stock} {prod.unit})
                        </SelectItem>
                      ))}
                      <SelectItem value="Custom Fashion Apparel">Custom Apparel / Fashion Goods</SelectItem>
                    </>
                  ) : (
                    <>
                      {services.map((svc) => (
                        <SelectItem key={svc.id} value={svc.name}>
                          {svc.name} · {formatINR(svc.price)} ({svc.category})
                        </SelectItem>
                      ))}
                      <SelectItem value="Custom Work Order">Custom Work Order</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity and Rate in 2 Columns */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="due-qty-popup" className="text-xs font-semibold text-foreground">
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="due-qty-popup"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-10 text-sm font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="due-price-popup" className="text-xs font-semibold text-foreground">
                  Unit Rate / Price (₹) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₹</span>
                  <Input
                    id="due-price-popup"
                    type="number"
                    min="0"
                    step="1"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="h-10 pl-7 text-sm font-semibold"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Live Stock Updation Preview for Shop Mode */}
            {category === 'shop' && selectedProduct && (
              <div className={`rounded-xl border p-3 transition-colors ${
                (parseFloat(quantity) || 0) > selectedProduct.stock
                  ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                  : 'border-blue-200 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/30 text-slate-800 dark:text-blue-100'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Original Stock:</span>
                  <span className="font-bold">{selectedProduct.stock} {selectedProduct.unit}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="font-medium">Credit Qty to Deduct:</span>
                  <span className="font-bold text-destructive">-{parseFloat(quantity) || 0} {selectedProduct.unit}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t border-slate-200 dark:border-zinc-800 font-bold">
                  <span>Remaining Stock after Due:</span>
                  <span className={(parseFloat(quantity) || 0) > selectedProduct.stock ? 'text-destructive font-black' : 'text-emerald-700 dark:text-emerald-400 font-black'}>
                    {(parseFloat(quantity) || 0) > selectedProduct.stock
                      ? 'Insufficient Stock in Inventory!'
                      : `${Math.max(0, selectedProduct.stock - (parseFloat(quantity) || 0))} ${selectedProduct.unit}`}
                  </span>
                </div>
              </div>
            )}

            {/* Total Amount Auto-Calculation Banner */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Total Calculated Due</span>
                <p className="text-[10px] text-muted-foreground">Quantity × Unit Rate</p>
              </div>
              <span className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                {formatINR((parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0))}
              </span>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="due-date-popup" className="text-xs font-semibold text-foreground">
                Payment Due Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="due-date-popup"
                  placeholder="e.g. 18 Oct 2026"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-10 pl-9 text-sm"
                />
              </div>
            </div>

            {/* Work Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="due-notes-popup" className="text-xs font-semibold text-foreground">
                Work Notes / Particulars (Optional)
              </Label>
              <Input
                id="due-notes-popup"
                placeholder="e.g. 2 pant alteration, trial on Saturday..."
                value={dueNotes}
                onChange={(e) => setDueNotes(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDueOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Save Due
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Printable Thermal & A4 Statement Modal */}
      <PrintableReceiptModal
        open={!!printableData}
        onOpenChange={(open) => !open && setPrintableData(null)}
        data={printableData}
      />

    </div>
  );
}
