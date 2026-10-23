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
  const [isCopied, setIsCopied] = useState<boolean>(false);

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
      setEditedDraft(draft.draft_reply);
      toast.success('Evidence-Grounded Reply Generated!', {
        description: `Referenced balance due of $${draft.balance_due.toFixed(2)} and payment link.`,
      });
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
    const subject = encodeURIComponent(draftResult?.subject || `Re: Invoice ${selectedInvoice.paypal_invoice_number || ''}`);
    const body = encodeURIComponent(editedDraft);
    window.location.href = `mailto:${selectedInvoice.recipient_email}?subject=${subject}&body=${body}`;
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
                {/* Subject Line */}
                <div className="rounded-xl bg-slate-50 dark:bg-[#18191D] p-2.5 border border-slate-100 dark:border-zinc-800 text-xs">
                  <span className="text-slate-400 dark:text-zinc-500 font-semibold">Subject:</span>{' '}
                  <span className="font-bold text-slate-800 dark:text-zinc-100">{draftResult.subject}</span>
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

                {/* Editable Response Body */}
                <Textarea
                  rows={10}
                  value={editedDraft}
                  onChange={(e) => setEditedDraft(e.target.value)}
                  className="font-sans text-xs leading-relaxed border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-[#18191D] text-foreground"
                />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyDraft}
                    className="w-full sm:w-auto gap-1.5 text-xs dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={handleOpenMail}
                    className={`w-full sm:w-auto gap-1.5 text-white text-xs font-semibold ${
                      isService
                        ? 'bg-[#007F7C] hover:bg-[#006663]'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Open in Email Client (mailto)</span>
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
