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
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Customer Context & Reply Copilot
          </h2>
          <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs font-bold">
            7-Intent Taxonomy
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          Triage tricky client emails, detect promise-to-pay dates, and draft polite, context-grounded responses citing balance and PayPal links.
        </p>
      </div>

      {/* Invoice Context Selector */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                  className="mt-1 font-bold text-sm text-slate-900 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.recipient_name} — ${inv.total.toFixed(2)} {inv.currency} ({inv.status}) [
                      {inv.paypal_invoice_number || inv.id.substring(0, 8)}]
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-slate-400">No invoices available</p>
              )}
            </div>
          </div>

          {selectedInvoice && (
            <div className="flex items-center gap-3 text-xs bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <div>
                <span className="text-slate-400">Recipient:</span>{' '}
                <span className="font-semibold text-slate-700">{selectedInvoice.recipient_email}</span>
              </div>
              <div className="h-3 w-px bg-slate-300" />
              <div>
                <span className="text-slate-400">Due:</span>{' '}
                <span className="font-semibold text-slate-700">{selectedInvoice.due_date}</span>
              </div>
              <div className="h-3 w-px bg-slate-300" />
              <div>
                <span className="text-slate-400">Status:</span>{' '}
                <span className="font-bold text-blue-600">{selectedInvoice.status}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left = Inbound Message & Intent, Right = Grounded Response */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Client Inbound Message */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Inbound Customer Message</h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Triage Step 1</span>
            </div>

            <Textarea
              rows={6}
              value={customerReply}
              onChange={(e) => setCustomerReply(e.target.value)}
              placeholder="Paste email, SMS, or client chat response here..."
              className="resize-none font-sans text-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
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
                    className="rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleClassify}
              disabled={isClassifying || !customerReply.trim() || !selectedInvoice}
              className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold shadow-xs"
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
            <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Intent Classification
                </span>
                <span className="rounded-full bg-indigo-100 text-indigo-800 px-2 py-0.5 text-xs font-bold">
                  {(classification.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-indigo-600 text-white px-3 py-1 text-xs font-black tracking-wide">
                  {classification.intent}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  {classification.summary}
                </span>
              </div>

              {/* Promised Payment Date Alert */}
              {classification.promised_payment_date && (
                <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                  <Calendar className="h-4 w-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Promised Payment Date Detected:</span>{' '}
                    <span className="font-mono font-semibold">{classification.promised_payment_date}</span>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Cashiko recommends snoozing reminders until this date.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  onClick={handleGenerateDraft}
                  disabled={isDrafting}
                  className="w-full gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5"
                >
                  {isDrafting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Drafting Evidence-Grounded Response...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
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
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900">Grounded Response Draft</h3>
                <p className="text-xs text-slate-500">
                  Grounded on live invoice details, balance due, and PayPal checkout link.
                </p>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Triage Step 2</span>
            </div>

            {draftResult ? (
              <div className="space-y-4">
                {/* Subject Line */}
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
                  <span className="text-slate-400 font-semibold">Subject:</span>{' '}
                  <span className="font-bold text-slate-800">{draftResult.subject}</span>
                </div>

                {/* Tone & Rationale Tag */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 font-semibold text-[11px]">
                    Tone: {draftResult.tone}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Rationale: {draftResult.rationale}
                  </span>
                </div>

                {/* Editable Response Body */}
                <Textarea
                  rows={10}
                  value={editedDraft}
                  onChange={(e) => setEditedDraft(e.target.value)}
                  className="font-sans text-xs leading-relaxed border-slate-200 bg-slate-50/30"
                />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyDraft}
                    className="w-full sm:w-auto gap-1.5 text-xs"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={handleOpenMail}
                    className="w-full sm:w-auto gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Open in Email Client (mailto)</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">No Draft Generated Yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
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
