import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  FileCheck,
  CreditCard,
  ExternalLink,
  Copy,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useReceivables } from '@/context/ReceivablesContext';
import { useBusiness } from '@/context/BusinessContext';
import { Invoice, InvoiceLineItem } from '@/types';

const SAMPLE_PRESETS = [
  {
    title: 'Acme Corp Web Redesign',
    text: `Client: Acme Corporation (billing@acmecorp.io).
Completed deliverables for the SaaS platform overhaul:
1. 3 Responsive landing page designs in Figma: $600 each.
2. Design system tokens & component library: $800.
3. Mobile navigation polish & asset export: $350.
Issue date today, payment terms net 14 days. Currency USD. Please send via PayPal.`,
  },
  {
    title: 'DevOps & Cloud Migration',
    text: `Invoice for NexaTech (finance@nexatech.dev):
AWS ECS containerization and CI/CD pipeline setup: 40 hours at $85/hr.
Cloud architecture security review: fixed fee $900.
Due in 7 days, currency USD.`,
  },
  {
    title: 'Brand Strategy & Copywriting',
    text: `Project for Starlight Media (payments@starlight.co):
Brand messaging playbook ($1,400) and 5 technical blog posts ($300 each).
Issue date today, due date in 30 days. Currency USD.`,
  },
];

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBrief = searchParams.get('brief') || '';
  const { createInvoice } = useReceivables();
  const { category } = useBusiness();
  const isService = category === 'service';

  // Intake State
  const [workBrief, setWorkBrief] = useState<string>(initialBrief);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // Extracted Form State
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [issueDate, setIssueDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [memo, setMemo] = useState<string>('');
  const [items, setItems] = useState<InvoiceLineItem[]>([
    { description: 'Freelance Consultation & Implementation', quantity: 1, unit_amount: 500, confidence: 1.0 },
  ]);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Submission State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [createdResult, setCreatedResult] = useState<Invoice | null>(null);

  const handleApplyPreset = (presetText: string) => {
    setWorkBrief(presetText);
  };

  const handleExtract = async () => {
    if (!workBrief.trim() || workBrief.trim().length < 5) {
      toast.error('Please enter a work brief with project deliverables');
      return;
    }

    setIsExtracting(true);
    try {
      const extracted = await api.intake.extract(workBrief);
      if (extracted.recipient_name) setRecipientName(extracted.recipient_name);
      if (extracted.recipient_email) setRecipientEmail(extracted.recipient_email);
      if (extracted.currency) setCurrency(extracted.currency);
      if (extracted.issue_date) setIssueDate(extracted.issue_date);
      if (extracted.due_date) setDueDate(extracted.due_date);
      if (extracted.memo) setMemo(extracted.memo);

      if (extracted.items && extracted.items.length > 0) {
        setItems(
          extracted.items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            unit_amount: it.unit_amount,
            confidence: it.confidence,
            confirmed_by_user: true,
          }))
        );
      }

      setConfidenceScore(extracted.confidence_score);
      setMissingFields(extracted.missing_fields || []);
      toast.success('Work brief extracted successfully!', {
        description: `Identified ${extracted.items?.length || 0} line items with ${(extracted.confidence_score * 100).toFixed(0)}% confidence`,
      });
    } catch (err: any) {
      toast.error('AI Extraction Failed', { description: err.message });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { description: 'Additional deliverable', quantity: 1, unit_amount: 100, confidence: 1.0, confirmed_by_user: true },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('At least one line item is required');
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const subtotal = items.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unit_amount) || 0), 0);
  const total = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      toast.error('Recipient client name is required');
      return;
    }
    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      toast.error('Valid recipient email is required');
      return;
    }
    if (items.length === 0) {
      toast.error('At least one line item is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        recipient_name: recipientName.trim(),
        recipient_email: recipientEmail.trim(),
        currency: currency.toUpperCase(),
        issue_date: issueDate,
        due_date: dueDate,
        memo: memo.trim() || undefined,
        raw_work_brief: workBrief.trim() || undefined,
        items: items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity) || 1,
          unit_amount: Number(it.unit_amount) || 0,
          confidence: it.confidence || 1.0,
          confirmed_by_user: true,
        })),
      };

      const result = await createInvoice(payload, true);
      setCreatedResult(result);
    } catch (err: any) {
      // Toast handled in context
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
            Smart Invoice Intake
          </h1>
          <p className="text-xs text-zinc-500 font-normal mt-1">
            Extract structured line items from raw briefs via Groq AI & push directly to PayPal Invoicing API v2
          </p>
        </div>

        {createdResult && (
          <Button
            variant="outline"
            onClick={() => {
              setCreatedResult(null);
              setWorkBrief('');
            }}
            className="gap-2 shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Create Another</span>
          </Button>
        )}
      </div>

      {/* Success Banner if Created */}
      {createdResult && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                  Invoice Created & Pushed to PayPal Sandbox!
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Registered for {createdResult.recipient_name} ({createdResult.currency} {createdResult.total.toFixed(2)})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-white dark:bg-[#141518] border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40"
                onClick={() => navigate('/invoices')}
              >
                <span>View in Ledger</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl bg-white/90 dark:bg-[#141518] p-3 border border-emerald-100 dark:border-emerald-900/50">
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Internal Reference</p>
              <p className="font-mono text-sm font-bold text-slate-800 dark:text-zinc-100">
                {createdResult.paypal_invoice_number || `CSK-${createdResult.id.substring(0, 8).toUpperCase()}`}
              </p>
            </div>

            <div className="rounded-xl bg-white/90 dark:bg-[#141518] p-3 border border-emerald-100 dark:border-emerald-900/50">
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">PayPal Invoice ID</p>
              <p className={`font-mono text-sm font-bold ${isService ? 'text-[#007F7C] dark:text-[#38D5D2]' : 'text-blue-600 dark:text-blue-400'}`}>
                {createdResult.paypal_invoice_id || 'Pending Draft'}
              </p>
            </div>

            <div className="rounded-xl bg-white/90 dark:bg-[#141518] p-3 border border-emerald-100 dark:border-emerald-900/50">
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Status</p>
              <span className="inline-block mt-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-transparent dark:border-amber-800/50 px-2 py-0.5 text-xs font-bold">
                {createdResult.status} (Ready to Send)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Left = Intake Brief, Right = Review Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Natural Language Intake */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#141518] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className={`h-5 w-5 ${isService ? 'text-[#007F7C] dark:text-[#38D5D2]' : 'text-blue-600 dark:text-blue-400'}`} />
                <h3 className="font-bold text-slate-900 dark:text-zinc-100">Conversational Intake</h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Step 1</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Type or paste project notes, milestones, hourly logs, or email communications.
            </p>

            <Textarea
              rows={8}
              value={workBrief}
              onChange={(e) => setWorkBrief(e.target.value)}
              placeholder="e.g., Finished 3 landing pages for Acme Corp at $600 each and the brand guidelines for $800. Send to billing@acme.com due in 14 days..."
              className={`resize-none font-sans text-sm border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18191D] text-foreground placeholder:text-muted-foreground ${
                isService
                  ? 'focus:border-[#007F7C] focus:ring-[#007F7C]/20'
                  : 'focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />

            {/* Quick Demo Presets */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Or pick a realistic demo preset:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset.text)}
                    className={`rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800/70 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-zinc-200 transition-colors ${
                      isService
                        ? 'hover:bg-[#007F7C]/10 hover:border-[#007F7C]/40 hover:text-[#007F7C] dark:hover:text-[#38D5D2]'
                        : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-300'
                    }`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleExtract}
              disabled={isExtracting || !workBrief.trim()}
              className={`w-full gap-2 text-white font-semibold py-2.5 shadow-sm ${
                isService
                  ? 'bg-[#007F7C] hover:bg-[#006663]'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Groq AI Extracting Deliverables...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Extract with AI (Groq OSS-20B)</span>
                </>
              )}
            </Button>
          </div>

          {/* AI Confidence & Extraction Summary */}
          {confidenceScore !== null && (
            <div
              className={`rounded-2xl border p-4 space-y-2 ${
                isService
                  ? 'border-[#007F7C]/30 bg-[#007F7C]/5 dark:bg-[#007F7C]/15'
                  : 'border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${isService ? 'text-[#007F7C] dark:text-[#38D5D2]' : 'text-blue-900 dark:text-blue-200'}`}>
                  AI Confidence Score
                </span>
                <span className={`font-bold ${isService ? 'text-[#007F7C] dark:text-[#38D5D2]' : 'text-blue-700 dark:text-blue-300'}`}>
                  {(confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
              <div className={`h-1.5 w-full rounded-full overflow-hidden ${
                isService ? 'bg-[#007F7C]/20 dark:bg-[#007F7C]/30' : 'bg-blue-200/60 dark:bg-blue-900/60'
              }`}>
                <div
                  className={`h-full transition-all duration-500 ${
                    isService ? 'bg-[#007F7C] dark:bg-[#009995]' : 'bg-blue-600 dark:bg-blue-400'
                  }`}
                  style={{ width: `${Math.min(100, confidenceScore * 100)}%` }}
                />
              </div>

              {missingFields.length > 0 && (
                <div className="flex items-start gap-2 pt-1 text-xs text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <span>
                    Suggested missing info: {missingFields.join(', ')}. Please verify in the form.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Human-in-the-Loop Review Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#141518] p-6 shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-zinc-100">Human-in-the-Loop Review</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Verify or edit extracted client data and line items before committing to PayPal.
                </p>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Step 2 (Gate 1)</span>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Client / Company Name *</label>
                <Input
                  required
                  placeholder="e.g. Acme Corporation"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Client Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="billing@acmecorp.io"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-9 w-full rounded-md border border-input dark:border-zinc-800 bg-transparent dark:bg-[#18191D] px-3 py-1 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:text-zinc-100"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Issue Date</label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Due Date</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Deliverables & Line Items ({items.length})
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddItem}
                  className={`h-8 gap-1 text-xs dark:hover:bg-zinc-800 ${
                    isService
                      ? 'text-[#007F7C] dark:text-[#38D5D2] hover:text-[#006663]'
                      : 'text-blue-600 dark:text-blue-400 hover:text-blue-700'
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Line Item</span>
                </Button>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#18191D]/50"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="bg-white dark:bg-[#141518] dark:border-zinc-800 text-xs dark:text-zinc-100"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="w-20">
                        <Input
                          type="number"
                          step="any"
                          min="0.1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="bg-white dark:bg-[#141518] dark:border-zinc-800 text-xs dark:text-zinc-100"
                        />
                      </div>

                      <div className="w-28">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Rate"
                          value={item.unit_amount}
                          onChange={(e) => handleItemChange(idx, 'unit_amount', e.target.value)}
                          className="bg-white dark:bg-[#141518] dark:border-zinc-800 text-xs dark:text-zinc-100"
                        />
                      </div>

                      <div className="w-24 text-right font-mono text-xs font-bold text-slate-800 dark:text-zinc-100">
                        ${((Number(item.quantity) || 0) * (Number(item.unit_amount) || 0)).toFixed(2)}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(idx)}
                        className="h-8 w-8 text-slate-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 dark:hover:bg-zinc-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal & Total Display */}
              <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-[#18191D] p-4 flex flex-col items-end space-y-1">
                <div className="flex justify-between w-48 text-xs text-slate-600 dark:text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium dark:text-zinc-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 text-sm font-bold text-slate-900 dark:text-zinc-100 border-t border-slate-200 dark:border-zinc-800 pt-1">
                  <span>Total Due:</span>
                  <span className={`font-mono font-bold ${isService ? 'text-[#007F7C] dark:text-[#38D5D2]' : 'text-blue-600 dark:text-blue-400'}`}>${total.toFixed(2)} {currency}</span>
                </div>
              </div>
            </div>

            {/* Memo Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Payment Instructions / Memo</label>
              <Input
                placeholder="e.g. Thank you for your business. Remit payment via PayPal checkout link."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="dark:bg-[#18191D] dark:border-zinc-800 dark:text-zinc-100"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
              <Button
                type="submit"
                disabled={isSaving}
                className={`w-full sm:w-auto gap-2 text-white font-semibold shadow-xs px-6 py-2.5 ${
                  isService
                    ? 'bg-[#007F7C] hover:bg-[#006663]'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Pushing to PayPal Sandbox...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Create & Push PayPal Draft</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
