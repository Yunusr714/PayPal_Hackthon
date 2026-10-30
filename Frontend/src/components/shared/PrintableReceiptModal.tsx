import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Printer, Copy, Check, QrCode
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBusiness, DG_FASHION_LOGO_SVG } from '@/context/BusinessContext';
import { formatINR } from '@/data/mock-data';

export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ReceiptData {
  id: string;
  type?: 'retail_sale' | 'service_order' | 'invoice' | 'statement';
  title?: string;
  date: string;
  dueDate?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: ReceiptItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  paymentMode: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Scheduled' | 'Completed' | string;
  notes?: string;
  paypalInvoiceId?: string;
}

interface PrintableReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ReceiptData | null;
}

export function PrintableReceiptModal({ open, onOpenChange, data }: PrintableReceiptModalProps) {
  const { user, category } = useBusiness();
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const handlePrint = () => {
    const printableElement = document.getElementById('printable-receipt');
    if (!printableElement) {
      window.print();
      return;
    }

    // Create an isolated hidden iframe for 100% spotless white background without any dark dialog overlay
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt_${data.id}</title>
            <style>
              @page { size: auto; margin: 8mm; }
              body { margin: 0; padding: 12px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace, sans-serif; background: #ffffff !important; color: #0f172a !important; }
              * { box-sizing: border-box; }
              .printable-container { width: 100%; max-width: ${printFormat === 'thermal' ? '340px' : '650px'}; margin: 0 auto; background: #ffffff !important; }
              img { max-width: 100%; height: auto; }
            </style>
            ${Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
              .map((tag) => tag.outerHTML)
              .join('\n')}
          </head>
          <body style="background: #ffffff !important;">
            <div class="printable-container" style="background: #ffffff !important;">
              ${printableElement.outerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch (e) {}
        }, 3000);
      }, 300);
    } else {
      window.print();
    }
  };

  const handleCopyTextSlip = () => {
    const lines = [
      `==============================`,
      `  ${user.businessName.toUpperCase()}`,
      `  ${category === 'service' ? 'Specialist Services & Repair' : 'General Store & Retail'}`,
      `  Tel: ${user.phone} | Cashiko Pay`,
      `==============================`,
      `Receipt No: ${data.id}`,
      `Date: ${data.date}`,
      `Customer: ${data.customerName}`,
      data.customerPhone ? `Contact: ${data.customerPhone}` : '',
      `------------------------------`,
      ...data.items.map(
        (it) => `${it.description.padEnd(20).slice(0, 20)} x${it.quantity}  ₹${it.total.toLocaleString('en-IN')}`
      ),
      `------------------------------`,
      `SUBTOTAL: ₹${data.subtotal.toLocaleString('en-IN')}`,
      data.tax ? `TAX/GST: ₹${data.tax.toLocaleString('en-IN')}` : '',
      `TOTAL AMOUNT: ₹${data.total.toLocaleString('en-IN')}`,
      `PAYMENT: ${data.paymentMode.toUpperCase()} (${data.status.toUpperCase()})`,
      `==============================`,
      `Thank you for your business!`,
      `Powered by Cashiko`,
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    toast.success('Slip Copied to Clipboard!', {
      description: 'You can paste it directly into WhatsApp or SMS.',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const isPaid = ['paid', 'completed', 'delivered'].includes(data.status.toLowerCase());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl bg-slate-50 border-slate-200 shadow-2xl">
        {/* Controls Toolbar (Hidden during print) */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Format:</span>
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setPrintFormat('thermal')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  printFormat === 'thermal'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                80mm Thermal Slip
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('a4')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  printFormat === 'a4'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Tax Invoice
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyTextSlip}
              className="h-8 text-xs font-semibold border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            >
              {copied ? <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-xs"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Area Container */}
        <div className="p-6 flex justify-center print:p-0 print:m-0 print:w-full">
          {/* FORMAT 1: 80mm THERMAL RECEIPT SLIP */}
          {printFormat === 'thermal' && (
            <div
              id="printable-receipt"
              className="printable-container w-full max-w-[340px] rounded-xl border border-slate-200 bg-white p-5 font-mono text-xs text-slate-900 shadow-sm print:max-w-none print:w-full print:border-none print:shadow-none print:p-2"
            >
              {/* Header with Store Logo */}
              <div className="text-center pb-3 border-b border-dashed border-slate-400 space-y-1">
                <div className="flex justify-center mb-1.5">
                  <img
                    src={user.logoUrl || DG_FASHION_LOGO_SVG}
                    alt={user.businessName}
                    className="h-12 w-auto max-w-[130px] object-contain rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DG_FASHION_LOGO_SVG;
                    }}
                  />
                </div>
                <p className="text-sm font-extrabold tracking-wider uppercase text-slate-950">
                  {user.businessName}
                </p>
                <p className="text-[10px] text-slate-600">
                  {user.subCategory || (category === 'service' ? 'Specialist Services & Repair' : 'Fashion & Apparel Retail')}
                </p>
                <p className="text-[10px] text-slate-500">
                  Phone: {user.phone} | Cashiko Pay
                </p>
                <p className="text-[9px] text-slate-400">GSTIN: 07AAAPL1234M1Z5 (Verified)</p>
              </div>

              {/* Meta */}
              <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bill No:</span>
                  <span className="font-bold text-slate-800">{data.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{data.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{data.customerName}</span>
                </div>
                {data.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span>{data.customerPhone}</span>
                  </div>
                )}
                {data.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Due Date:</span>
                    <span className="font-semibold text-amber-700">{data.dueDate}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="py-2.5 border-b border-dashed border-slate-400">
                <div className="flex justify-between pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <span>Item / Service</span>
                  <span>Amt</span>
                </div>
                <div className="space-y-1.5 pt-1.5 text-[11px]">
                  {data.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="max-w-[75%] pr-1">
                        <span className="font-medium text-slate-800">{it.description}</span>
                        {it.quantity > 1 && (
                          <span className="text-[10px] text-slate-500 block">
                            {it.quantity} x {formatINR(it.unitPrice)}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-slate-900">{formatINR(it.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Calculation */}
              <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatINR(data.subtotal)}</span>
                </div>
                {data.tax ? (
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>CGST/SGST:</span>
                    <span>{formatINR(data.tax)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-black text-slate-950">
                  <span>TOTAL:</span>
                  <span>{formatINR(data.total)}</span>
                </div>
              </div>

              {/* Payment Status Block */}
              <div className="py-2.5 border-b border-dashed border-slate-400 text-center space-y-1">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase border">
                  {isPaid ? (
                    <span className="text-emerald-700 bg-emerald-50 border-emerald-300">✓ PAID ({data.paymentMode})</span>
                  ) : (
                    <span className="text-amber-800 bg-amber-50 border-amber-300">⚠ PENDING PAYMENT ({data.paymentMode})</span>
                  )}
                </div>
                {data.paypalInvoiceId && (
                  <p className="text-[9px] text-blue-700 font-semibold">
                    PayPal Invoice ID: {data.paypalInvoiceId}
                  </p>
                )}
              </div>

              {/* Mock Scannable QR Code */}
              <div className="pt-3 text-center space-y-1.5">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg border-2 border-slate-800 bg-white p-1">
                  <QrCode className="h-full w-full text-slate-900" />
                </div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                  Scan to Pay via UPI / PayPal
                </p>
                <p className="text-[10px] text-slate-600 italic pt-1">
                  Thank you for your visit!
                </p>
                <div className="pt-1 text-[8px] text-slate-400 uppercase tracking-widest">
                  Powered by Cashiko Receivables
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 2: FORMAL A4 TAX INVOICE */}
          {printFormat === 'a4' && (
            <div
              id="printable-receipt"
              className="printable-container w-full max-w-[620px] rounded-xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm font-sans print:max-w-none print:w-full print:border-none print:shadow-none print:p-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-primary/20 pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <img
                      src={user.logoUrl || DG_FASHION_LOGO_SVG}
                      alt={user.businessName}
                      className="h-12 w-auto max-w-[150px] object-contain rounded-lg border border-slate-200 p-0.5 bg-white shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DG_FASHION_LOGO_SVG;
                      }}
                    />
                    <span className="text-xl font-black text-slate-950 tracking-tight">
                      {user.businessName}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.subCategory || (category === 'service' ? 'Specialist Services & Repair' : 'Fashion & Apparel Retail')}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">Phone: {user.phone}</p>
                  <p className="text-xs text-slate-500">Email: {user.email}</p>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-md bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
                    TAX INVOICE
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-2">Invoice #: {data.id}</p>
                  <p className="text-xs text-slate-500">Date: {data.date}</p>
                  {data.dueDate && (
                    <p className="text-xs font-semibold text-amber-700">Due Date: {data.dueDate}</p>
                  )}
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billed To (Customer):</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{data.customerName}</p>
                  {data.customerPhone && <p className="text-slate-600 mt-0.5">Phone: {data.customerPhone}</p>}
                  {data.customerEmail && <p className="text-slate-500">{data.customerEmail}</p>}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Terms & Mode:</p>
                  <p className="font-semibold text-slate-800 mt-0.5">Mode: {data.paymentMode}</p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {isPaid ? 'PAID IN FULL' : 'PENDING PAYMENT'}
                    </span>
                  </div>
                  {data.paypalInvoiceId && (
                    <p className="text-[10px] text-blue-700 font-mono mt-1">
                      PayPal Ref: {data.paypalInvoiceId}
                    </p>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="py-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold text-left">
                      <th className="py-2.5 px-3">Item / Service Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((it, idx) => (
                      <tr key={idx} className="text-slate-800">
                        <td className="py-2.5 px-3 font-medium">{it.description}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(it.unitPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Table */}
              <div className="flex justify-end pt-2 pb-6 border-t border-slate-200">
                <div className="w-56 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatINR(data.subtotal)}</span>
                  </div>
                  {data.tax ? (
                    <div className="flex justify-between text-slate-500">
                      <span>Estimated GST (5%):</span>
                      <span>{formatINR(data.tax)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-950">
                    <span>Total Amount:</span>
                    <span>{formatINR(data.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Signature */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-xs">
                <div>
                  <p className="font-bold text-slate-700">Terms & Payment Instructions:</p>
                  <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                    Payment is due on or before specified due date. For online payments, use our verified PayPal link or UPI QR code. Thank you for choosing {user.businessName}.
                  </p>
                </div>
                <div className="text-right flex flex-col justify-end items-end">
                  <div className="w-40 border-b border-slate-400 pb-8 text-center text-[10px] text-slate-400">
                    Authorized Signatory
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">{user.businessName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
