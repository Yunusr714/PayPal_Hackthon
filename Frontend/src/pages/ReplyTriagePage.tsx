import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquareQuote,
  Sparkles,
  Calendar,
  Send,
  Copy,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  Mail,
  Loader2,
  FileText,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useReceivables } from '@/context/ReceivablesContext';
import { useBusiness } from '@/context/BusinessContext';
import { Invoice, TriageClassificationResult, TriageDraftResult } from '@/types';

const SAMPLE_REPLIES = [
  {
    label: 'Promise to Pay',
    text: 'Hey! Just saw your reminder. We are running our batch payroll next Friday, so I will make sure the invoice is cleared by then. Thanks for your patience!',
  },
  {
    label: 'Payment Already Sent',
    text: 'Hi there, I already sent this payment yesterday afternoon via PayPal. Can you please check and confirm on your end?',
  },
  {
    label: 'Dispute / Scope Question',
    text: 'Hi, looking at line item 2 on the invoice for $800. I thought our original agreement was $500 for the component setup? Can you check the project notes?',
  },
  {
    label: 'Request Copy / Lost Link',
    text: 'Could you resend the invoice link? The previous email seems to have gone into spam or expired.',
  },
  {
    label: 'Need More Time',
    text: 'We are facing a brief cash-flow delay waiting for our enterprise client to pay us. Could we push the due date out by 10 business days?',
  },
];

export function ReplyTriagePage() {
  const [searchParams] = useSearchParams();
  const urlInvoiceId = searchParams.get('invoiceId');

  const { category } = useBusiness();
  const isService = category === 'service';
  const { invoices } = useReceivables();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(urlInvoiceId || '');
  const [customerReply, setCustomerReply] = useState<string>('');

  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [classification, setClassification] = useState<TriageClassificationResult | null>(null);

  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [draftResult, setDraftResult] = useState<TriageDraftResult | null>(null);
  const [editedDraft, setEditedDraft] = useState<string>('');
  const [editedSubject, setEditedSubject] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  // Partial payment management state
  const [isPartialPayment, setIsPartialPayment] = useState<boolean>(false);
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const [remainingBalance, setRemainingBalance] = useState<number>(0);
  const [nextDueDate, setNextDueDate] = useState<string>('');

  // Set default invoice if available and none selected
  useEffect(() => {
    if (urlInvoiceId) {
      setSelectedInvoiceId(urlInvoiceId);
    } else if (invoices.length > 0 && !selectedInvoiceId) {
      setSelectedInvoiceId(invoices[0].id);
    }
  }, [urlInvoiceId, invoices, selectedInvoiceId]);

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];

  const handleApplySampleReply = (text: string) => {
    setCustomerReply(text);
    setClassification(null);
    setDraftResult(null);
    setIsPartialPayment(false);
  };

  const handleClassify = async () => {
    if (!selectedInvoice) {
      toast.error('Please select an invoice first');
      return;
    }
    if (!customerReply.trim() || customerReply.trim().length < 3) {
      toast.error('Please enter the customer reply message');
      return;
    }

    setIsClassifying(true);
    setClassification(null);
    setDraftResult(null);
    setIsPartialPayment(false);

    try {
      const res = await api.triage.classify(selectedInvoice.id, customerReply.trim());
      setClassification(res.classification);
      toast.success(`Intent Classified: ${res.classification.intent}`, {
        description: `Confidence: ${(res.classification.confidence * 100).toFixed(0)}%`,
      });
    } catch (err: any) {
      toast.error('Classification failed', { description: err.message });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!selectedInvoice) return;
    if (!customerReply.trim()) return;

    setIsDrafting(true);
    try {
      const intent = classification?.intent || 'UNRESPONSIVE_OR_OTHER';
      const draft = await api.triage.draft(selectedInvoice.id, customerReply.trim(), intent);
      setDraftResult(draft);

      // merchant_name comes from the backend DB (MerchantProfile table) — never from localStorage
      const businessName = draft.merchant_name || 'Our Store';

      // Clean up any lingering placeholder brackets in drafted text
      let cleanDraft = (draft.draft_reply || draft.draft_message || '')
        .replace(/\[Merchant Name\]/g, businessName)
        .replace(/\[Your Name\]/g, businessName)
        .replace(/\[Store Name\]/g, businessName)
        .replace(/\[Business Name\]/g, businessName);

      setEditedDraft(cleanDraft);
      setEditedSubject(draft.subject || `Regarding Invoice ${selectedInvoice.paypal_invoice_number || selectedInvoice.id.substring(0, 8)}`);
      setEmailSent(false);

      const currencySymbol = selectedInvoice.currency === 'INR' ? '₹' : '$';

      // Check if partial payment was detected or negotiated
      if (draft.is_partial_payment && draft.partial_amount) {
        setIsPartialPayment(true);
        setPartialAmount(draft.partial_amount);
        const rem = draft.remaining_balance ?? Math.max(0, selectedInvoice.total - draft.partial_amount);
        setRemainingBalance(rem);
        setNextDueDate(draft.next_due_date || '');
        toast.success('Partial Payment Arrangement Identified!', {
          description: `Initial payment due today: ${currencySymbol}${draft.partial_amount.toFixed(2)} (Remaining: ${currencySymbol}${rem.toFixed(2)})`,
        });
      } else {
        setIsPartialPayment(false);
        setPartialAmount(0);
        setRemainingBalance(0);
        setNextDueDate('');
        const balance = typeof draft.balance_due === 'number' ? draft.balance_due : (selectedInvoice.total || 0);
        toast.success('Evidence-Grounded Reply Generated!', {
          description: `Referenced balance due of ${currencySymbol}${balance.toFixed(2)} and payment link.`,
        });
      }
    } catch (err: any) {
      toast.error('Draft generation failed', { description: err.message });
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopyDraft = () => {
    if (!editedDraft) return;
    navigator.clipboard.writeText(editedDraft);
    setIsCopied(true);
    toast.success('Copied to Clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenMail = () => {
    if (!selectedInvoice || !editedDraft) return;
    const subject = encodeURIComponent(editedSubject || draftResult?.subject || `Re: Invoice ${selectedInvoice.paypal_invoice_number || ''}`);
    const body = encodeURIComponent(editedDraft);
    window.location.href = `mailto:${selectedInvoice.recipient_email}?subject=${subject}&body=${body}`;
  };

  const handleDirectSendEmail = async () => {
    if (!selectedInvoice || !editedDraft) return;
    setIsSendingEmail(true);
    try {
      // No localStorage — backend reads MerchantProfile from DB for branding
      await api.invoices.sendEmail(
        selectedInvoice.id,
        selectedInvoice.recipient_email,
        undefined,
        {
          subject: editedSubject.trim() || draftResult?.subject || undefined,
          body_text: editedDraft.trim(),
          is_partial_payment: isPartialPayment,
          partial_amount: isPartialPayment && partialAmount > 0 ? partialAmount : undefined,
          remaining_balance: isPartialPayment ? remainingBalance : undefined,
          next_due_date: isPartialPayment && nextDueDate ? nextDueDate : undefined,
        }
      );
      setEmailSent(true);
      toast.success(isPartialPayment ? 'Partial Payment Email Dispatched!' : 'Response Email Dispatched Directly!', {
        description: isPartialPayment
          ? `Dispatched partial payment request of ₹${partialAmount.toFixed(2)} to ${selectedInvoice.recipient_email}`
          : `Delivered your response message with PayPal checkout link to ${selectedInvoice.recipient_email}`,
      });
    } catch (err: any) {
      toast.error('Email dispatch failed', { description: err.message });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!selectedInvoice || !editedDraft) return;
    const text = encodeURIComponent(editedDraft);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
          Customer Context & Reply Copilot
        </h1>
        <p className="text-xs text-zinc-500 font-normal mt-1">
          7-intent classification, promised date detection & grounded context-aware replies
        </p>
      </div>

      {/* Invoice Context Selector */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#141518] p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isService
                  ? 'bg-[#007F7C]/15 text-[#007F7C] dark:text-[#38D5D2]'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
              }`}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Grounded Invoice Target
              </p>
              {invoices.length > 0 ? (
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    setClassification(null);
                    setDraftResult(null);
                  }}
                  className="mt-1 font-bold text-sm text-slate-900 dark:text-zinc-100 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id} className="dark:bg-[#18191D] dark:text-zinc-100">
                      {inv.recipient_name} — ${inv.total.toFixed(2)} {inv.currency} ({inv.status}) [
                      {inv.paypal_invoice_number || inv.id.substring(0, 8)}]
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-slate-400 dark:text-zinc-500">No invoices available</p>
              )}
            </div>
          </div>

          {selectedInvoice && (
            <div className="flex items-center gap-3 text-xs bg-slate-50 dark:bg-[#18191D] rounded-xl p-2.5 border border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-slate-400 dark:text-zinc-500">Recipient:</span>{' '}
                <span className="font-semibold text-slate-700 dark:text-zinc-200">{selectedInvoice.recipient_email}</span>
              </div>
              <div className="h-3 w-px bg-slate-300 dark:bg-zinc-700" />
              <div>
                <span className="text-slate-400 dark:text-zinc-500">Due:</span>{' '}
                <span className="font-semibold text-slate-700 dark:text-zinc-200">{selectedInvoice.due_date}</span>
              </div>
              <div className="h-3 w-px bg-slate-300 dark:bg-zinc-700" />
              <div>
                <span className="text-slate-400 dark:text-zinc-500">Status:</span>{' '}
                <span className={`font-bold ${isService ? 'text-[#007F7C] dark:text-[#38D5D2]' : 'text-blue-600 dark:text-blue-400'}`}>{selectedInvoice.status}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left = Inbound Message & Intent, Right = Grounded Response */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Client Inbound Message */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#141518] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className={`h-5 w-5 ${isService ? 'text-[#007F7C] dark:text-[#38D5D2]' : 'text-blue-600 dark:text-blue-400'}`} />
                <h3 className="font-bold text-slate-900 dark:text-zinc-100">Inbound Customer Message</h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Triage Step 1</span>
            </div>

            <Textarea
              rows={6}
              value={customerReply}
              onChange={(e) => setCustomerReply(e.target.value)}
              placeholder="Paste email, SMS, or client chat response here..."
              className={`resize-none font-sans text-sm border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18191D] text-foreground placeholder:text-muted-foreground ${
                isService
                  ? 'focus:border-[#007F7C] focus:ring-[#007F7C]/20'
                  : 'focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />

            {/* Realistic Sample Replies */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Or try a realistic client reply scenario:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_REPLIES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySampleReply(sample.text)}
                    className={`rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800/70 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-zinc-200 transition-colors ${
                      isService
                        ? 'hover:bg-[#007F7C]/10 hover:border-[#007F7C]/40 hover:text-[#007F7C] dark:hover:text-[#38D5D2]'
                        : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-300'
                    }`}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleClassify}
              disabled={isClassifying || !customerReply.trim() || !selectedInvoice}
              className={`w-full gap-2 text-white font-semibold shadow-xs ${
                isService
                  ? 'bg-[#007F7C] hover:bg-[#006663]'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isClassifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Groq AI Analyzing Intent...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Classify Intent & Promised Date</span>
                </>
              )}
            </Button>
          </div>

          {/* Classification Result Card */}
          {classification && (
            <div
              className={`rounded-2xl border p-5 shadow-xs space-y-4 ${
                isService
                  ? 'border-[#007F7C]/30 bg-[#007F7C]/5 dark:bg-[#007F7C]/15'
                  : 'border-blue-200/80 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isService ? 'text-[#007F7C] dark:text-[#38D5D2]' : 'text-blue-900 dark:text-blue-200'
                  }`}
                >
                  Intent Classification
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    isService
                      ? 'bg-[#007F7C]/20 text-[#007F7C] dark:text-[#38D5D2]'
                      : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                  }`}
                >
                  {(classification.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-xl text-white px-3 py-1 text-xs font-black tracking-wide ${
                    isService ? 'bg-[#007F7C] dark:bg-[#009995]' : 'bg-blue-600 dark:bg-blue-500'
                  }`}
                >
                  {classification.intent}
                </span>
                <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                  {classification.summary}
                </span>
              </div>

              {/* Promised Payment Date Alert */}
              {classification.promised_payment_date && (
                <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold">Promised Payment Date Detected:</span>{' '}
                    <span className="font-mono font-semibold">{classification.promised_payment_date}</span>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                      Cashiko recommends snoozing reminders until this date.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={handleGenerateDraft}
                  disabled={isDrafting}
                  className={`w-full gap-2 text-white font-semibold text-xs py-2.5 ${
                    isService
                      ? 'bg-[#007F7C] hover:bg-[#006663]'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isDrafting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Drafting Evidence-Grounded Response...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-amber-400 dark:text-amber-500" />
                      <span>Draft Grounded Email Response</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Evidence Grounded Draft Response */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#141518] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-zinc-100">Grounded Response Draft</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Grounded on live invoice details, balance due, and PayPal checkout link.
                </p>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Triage Step 2</span>
            </div>

            {draftResult ? (
              <div className="space-y-4">
                {/* Editable Subject Line */}
                <div className="rounded-xl bg-slate-50 dark:bg-[#18191D] p-2.5 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-slate-500 dark:text-zinc-400 font-semibold">Email Subject Line:</label>
                    <span className="text-[10px] text-slate-400 font-medium">Editable</span>
                  </div>
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 dark:text-zinc-100 bg-white dark:bg-[#141518] border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Tone & Rationale Tag */}
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`rounded-md px-2 py-0.5 font-semibold text-[11px] ${
                      isService
                        ? 'bg-[#007F7C]/15 text-[#007F7C] dark:text-[#38D5D2] border border-[#007F7C]/30'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50'
                    }`}
                  >
                    Tone: {draftResult.tone}
                  </span>
                  <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                    Rationale: {draftResult.rationale}
                  </span>
                </div>

                {/* Verified Fact Citations Banner */}
                {draftResult.fact_citations && draftResult.fact_citations.length > 0 && (
                  <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-950/20 p-2.5 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] uppercase tracking-wider">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Verified Invoice Facts Grounded by AI</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {draftResult.fact_citations.map((cite, cIdx) => (
                        <span key={cIdx} className="inline-block bg-white dark:bg-[#18191D] text-slate-700 dark:text-zinc-300 border border-emerald-200 dark:border-emerald-900/60 rounded-md px-2 py-0.5 text-[11px] font-mono">
                          {cite}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Partial Payment Configuration Card */}
                {isPartialPayment ? (
                  <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                        <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Agreed Partial Payment Plan</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPartialPayment(false)}
                        className="text-[11px] text-slate-500 hover:text-red-500 underline"
                      >
                        Revert to Full Payment
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                          Due Today (Partial Amount):
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            {selectedInvoice.currency === 'INR' ? '₹' : '$'}
                          </span>
                          <input
                            type="number"
                            step="any"
                            value={partialAmount}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setPartialAmount(val);
                              setRemainingBalance(Math.max(0, (selectedInvoice.total || 0) - val));
                            }}
                            className="w-full pl-7 pr-2.5 py-1.5 text-xs font-bold text-emerald-950 dark:text-white bg-white dark:bg-[#18191D] border border-emerald-300 dark:border-emerald-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Remaining Balance Due:
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-500">
                            {selectedInvoice.currency === 'INR' ? '₹' : '$'}
                          </span>
                          <input
                            type="number"
                            step="any"
                            value={remainingBalance}
                            onChange={(e) => setRemainingBalance(parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-[#18191D] border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Next Balance Due Date:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 2026-11-10 or Next Friday"
                          value={nextDueDate}
                          onChange={(e) => setNextDueDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-zinc-100 bg-white dark:bg-[#18191D] border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 border-t border-emerald-200/80 dark:border-emerald-900/60 pt-2">
                      <span>Total Invoice Value: <strong>{selectedInvoice.currency === 'INR' ? '₹' : '$'}{selectedInvoice.total.toFixed(2)}</strong></span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">✓ Email and PayPal payment link will request {selectedInvoice.currency === 'INR' ? '₹' : '$'}{partialAmount.toFixed(2)} today</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#18191D]/50 text-xs text-slate-500">
                    <span>Single full invoice payment (Total: {selectedInvoice.currency === 'INR' ? '₹' : '$'}{selectedInvoice.total.toFixed(2)})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPartialPayment(true);
                        setPartialAmount(Math.round(selectedInvoice.total / 2));
                        setRemainingBalance(Math.round(selectedInvoice.total / 2));
                        setNextDueDate('Next Friday');
                      }}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Enable Partial Payment Plan
                    </button>
                  </div>
                )}

                {/* Editable Response Body */}
                <Textarea
                  rows={9}
                  value={editedDraft}
                  onChange={(e) => setEditedDraft(e.target.value)}
                  className="font-sans text-xs leading-relaxed border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-[#18191D] text-foreground"
                />

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyDraft}
                      className="gap-1.5 text-xs dark:border-zinc-800 dark:hover:bg-zinc-800"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleShareWhatsApp}
                      className="gap-1.5 text-xs border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenMail}
                      className="gap-1.5 text-xs text-slate-600 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Mailto</span>
                    </Button>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    disabled={isSendingEmail}
                    onClick={handleDirectSendEmail}
                    className={`gap-1.5 text-white text-xs font-semibold shadow-xs ${
                      emailSent
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : isService
                        ? 'bg-[#007F7C] hover:bg-[#006663]'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Sending to {selectedInvoice.recipient_email}...</span>
                      </>
                    ) : emailSent ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Email Sent!</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-3.5 w-3.5" />
                        <span>
                          {isPartialPayment && partialAmount > 0
                            ? `Dispatch Partial Payment (${selectedInvoice.currency === 'INR' ? '₹' : '$'}${partialAmount.toFixed(2)})`
                            : `Dispatch to ${selectedInvoice.recipient_email}`}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    isService
                      ? 'bg-[#007F7C]/15 text-[#007F7C] dark:text-[#38D5D2]'
                      : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-zinc-200">No Draft Generated Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mt-1">
                    Select a client message and click "Classify Intent" on the left to produce a grounded email response.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
