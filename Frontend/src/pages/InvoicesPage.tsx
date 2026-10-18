import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Send,
  Bell,
  RefreshCw,
  ExternalLink,
  Copy,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquareQuote,
  Eye,
  Loader2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useReceivables } from '@/context/ReceivablesContext';
import { Invoice, InvoiceStatus } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function InvoicesPage() {
  const navigate = useNavigate();
  const {
    invoices,
    isLoading,
    sendInvoice,
    remindInvoice,
    refreshInvoiceStatus,
    fetchInvoices,
  } = useReceivables();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeModalInvoice, setActiveModalInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.paypal_invoice_id && inv.paypal_invoice_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inv.paypal_invoice_number && inv.paypal_invoice_number.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'ALL' || inv.status.toUpperCase() === selectedStatus.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const getPayerUrl = (inv: Invoice) => {
    if (!inv.paypal_invoice_id) return null;
    return `https://www.sandbox.paypal.com/invoice/p/#${inv.paypal_invoice_id}`;
  };

  const handleCopyLink = (inv: Invoice) => {
    const url = getPayerUrl(inv);
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success('Payer Link Copied!', {
        description: 'Direct PayPal hosted payment checkout URL copied to clipboard.',
      });
    } else {
      toast.error('No PayPal Invoice ID available to generate link');
    }
  };

  const handleSend = async (inv: Invoice) => {
    setActionLoadingId(`send-${inv.id}`);
    try {
      const updated = await sendInvoice(inv.id);
      setActiveModalInvoice(updated);
    } catch (err: any) {
      // Toast handled in context
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemind = async (inv: Invoice) => {
    if (inv.status === 'PAID') {
      toast.error('Cannot Remind', {
        description: 'Invoice is already marked as PAID. Reminders are suppressed.',
      });
      return;
    }
    setActionLoadingId(`remind-${inv.id}`);
    try {
      await remindInvoice(inv.id);
    } catch (err: any) {
      // Toast handled in context
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRefresh = async (inv: Invoice) => {
    setActionLoadingId(`refresh-${inv.id}`);
    try {
      await refreshInvoiceStatus(inv.id);
    } catch (err: any) {
      // Toast handled in context
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSimulateWebhookPaid = async (inv: Invoice) => {
    setActionLoadingId(`sim-${inv.id}`);
    try {
      await api.webhooks.simulatePaid(inv.id, inv.paypal_invoice_id || undefined);
      toast.success('Live Webhook Received & Processed!', {
        description: `Invoice ${inv.paypal_invoice_number || inv.id} marked PAID. Automated reminders now suppressed.`,
      });
      await fetchInvoices();
    } catch (err: any) {
      toast.error('Simulation failed', { description: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold">
            <CheckCircle2 className="h-3 w-3" />
            PAID
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-bold">
            <Send className="h-3 w-3" />
            SENT / AWAITING
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-800 px-2.5 py-0.5 text-xs font-bold">
            <Clock className="h-3 w-3" />
            DRAFT
          </span>
        );
      case 'CANCELLED':
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-xs font-bold">
            <AlertCircle className="h-3 w-3" />
            {status}
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Invoices Ledger
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Full lifecycle control of PayPal Sandbox invoices with native sending, automated reminder triggers, and live reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInvoices()}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh All</span>
          </Button>

          <Link to="/create">
            <Button
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Intake with AI</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by client, email, or invoice #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-slate-50/50"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'DRAFT', 'SENT', 'PAID'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All Invoices' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-slate-500">Loading live PayPal invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">No invoices found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {searchQuery || selectedStatus !== 'ALL'
                  ? 'No invoices match your active search and filter criteria.'
                  : 'No invoices have been created yet. Use AI intake to convert project notes into your first PayPal draft!'}
              </p>
            </div>
            <Link to="/create">
              <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs">
                Create First Invoice
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Invoice Numbers</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const payerUrl = getPayerUrl(inv);
                  const isPaid = inv.status === 'PAID';
                  const isDraft = inv.status === 'DRAFT';
                  const isSent = inv.status === 'SENT';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{inv.recipient_name}</div>
                        <div className="text-[11px] text-slate-500">{inv.recipient_email}</div>
                      </td>

                      {/* Invoice Numbers */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-slate-800">
                          {inv.paypal_invoice_number || `CSK-${inv.id.substring(0, 8).toUpperCase()}`}
                        </div>
                        {inv.paypal_invoice_id ? (
                          <div className="flex items-center gap-1 font-mono text-[10px] text-blue-600">
                            <span>{inv.paypal_invoice_id}</span>
                            <button
                              onClick={() => handleCopyLink(inv)}
                              title="Copy PayPal payment URL"
                              className="hover:text-blue-800"
                            >
                              <Copy className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Local Only</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-sm font-bold text-slate-900">
                          ${inv.total.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold ml-1">
                          {inv.currency}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{inv.due_date}</div>
                        <div className="text-[10px] text-slate-400">Issued {inv.issue_date}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(inv.status)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send via PayPal */}
                          {isDraft && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleSend(inv)}
                              disabled={actionLoadingId === `send-${inv.id}`}
                              className="h-8 gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5"
                            >
                              {actionLoadingId === `send-${inv.id}` ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Send className="h-3 w-3" />
                              )}
                              <span>Send</span>
                            </Button>
                          )}

                          {/* Remind via PayPal */}
                          {isSent && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemind(inv)}
                              disabled={actionLoadingId === `remind-${inv.id}` || isPaid}
                              className="h-8 gap-1 border-amber-300 text-amber-700 hover:bg-amber-50 text-xs px-2.5"
                              title={isPaid ? 'Suppressed: Customer already paid' : 'Send native PayPal email reminder'}
                            >
                              {actionLoadingId === `remind-${inv.id}` ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Bell className="h-3 w-3" />
                              )}
                              <span>Remind</span>
                            </Button>
                          )}

                          {/* ⚡ Instant Webhook Payment Simulator for Hackathon Judges */}
                          {isSent && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSimulateWebhookPaid(inv)}
                              disabled={actionLoadingId === `sim-${inv.id}`}
                              className="h-8 gap-1 border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/70 text-xs px-2.5 font-bold"
                              title="Simulate payer completing payment (clears invoice and tests reminder suppression)"
                            >
                              {actionLoadingId === `sim-${inv.id}` ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Zap className="h-3 w-3 text-emerald-600" />
                              )}
                              <span>Simulate Paid</span>
                            </Button>
                          )}

                          {/* Sync / Refresh */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRefresh(inv)}
                            disabled={actionLoadingId === `refresh-${inv.id}`}
                            className="h-8 w-8 text-slate-500 hover:text-slate-800"
                            title="Reconcile status with PayPal Invoicing API"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${actionLoadingId === `refresh-${inv.id}` ? 'animate-spin' : ''}`} />
                          </Button>

                          {/* Copy Link */}
                          {payerUrl && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleCopyLink(inv)}
                              className="h-8 w-8 text-slate-500 hover:text-blue-600"
                              title="Copy PayPal hosted checkout URL"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {/* Reply Triage Shortcut */}
                          <Link to={`/triage?invoiceId=${inv.id}`}>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                              title="Open Reply Triage Copilot for this invoice"
                            >
                              <MessageSquareQuote className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          {/* View Detail */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setActiveModalInvoice(inv)}
                            className="h-8 w-8 text-slate-500 hover:text-slate-900"
                            title="View Invoice Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Dialog */}
      {activeModalInvoice && (
        <Dialog open={!!activeModalInvoice} onOpenChange={() => setActiveModalInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between pr-4">
                <DialogTitle className="text-lg font-bold">
                  {activeModalInvoice.paypal_invoice_number || `Invoice ${activeModalInvoice.id.substring(0, 8)}`}
                </DialogTitle>
                {getStatusBadge(activeModalInvoice.status)}
              </div>
              <DialogDescription className="text-xs text-slate-500">
                Created on {new Date(activeModalInvoice.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Recipient Details */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-500">Bill To:</p>
                  <p className="font-bold text-slate-900 text-sm">{activeModalInvoice.recipient_name}</p>
                  <p className="text-slate-600">{activeModalInvoice.recipient_email}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500">Payment Terms:</p>
                  <p className="text-slate-800">Due: <span className="font-bold">{activeModalInvoice.due_date}</span></p>
                  <p className="text-slate-600">Issued: {activeModalInvoice.issue_date}</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Line Items</p>
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold">
                      <tr>
                        <th className="py-2 px-3 text-left">Description</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Price</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeModalInvoice.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-medium text-slate-800">{it.description}</td>
                          <td className="py-2 px-3 text-center">{it.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono">${it.unit_amount.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">${((it.quantity || 1) * it.unit_amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <div className="w-48 text-right space-y-1">
                    <div className="text-xs text-slate-500 flex justify-between">
                      <span>Total Due:</span>
                      <span className="font-mono font-bold text-slate-900 text-base">
                        ${activeModalInvoice.total.toFixed(2)} {activeModalInvoice.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hosted Checkout URL */}
              {getPayerUrl(activeModalInvoice) && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 space-y-2">
                  <p className="text-xs font-semibold text-blue-900">
                    Live PayPal Sandbox Payment View:
                  </p>
                  <div className="flex items-center justify-between gap-2 bg-white rounded-lg p-2 border border-blue-100 text-xs font-mono text-slate-700 overflow-x-auto">
                    <span className="truncate">{getPayerUrl(activeModalInvoice)}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyLink(activeModalInvoice)}
                        className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <a
                        href={getPayerUrl(activeModalInvoice)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center h-7 px-2 text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
