export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_amount: number;
  total_amount?: number;
  source_text?: string;
  confidence?: number;
  confirmed_by_user?: boolean;
}

export interface Invoice {
  id: string;
  workspace_id: string;
  recipient_name: string;
  recipient_email: string;
  currency: string;
  issue_date: string;
  due_date: string;
  memo?: string;
  raw_work_brief?: string;
  paypal_invoice_id?: string;
  paypal_invoice_number?: string;
  subtotal: number;
  total: number;
  status: InvoiceStatus;
  is_simulated: boolean;
  source_type: string;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
  items: InvoiceLineItem[];
}

export interface InvoiceCreatePayload {
  recipient_name: string;
  recipient_email: string;
  currency: string;
  issue_date: string;
  due_date: string;
  memo?: string;
  raw_work_brief?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_amount: number;
    source_text?: string;
    confidence?: number;
    confirmed_by_user?: boolean;
  }>;
}

export interface IntakeExtractionResult {
  recipient_name: string;
  recipient_email?: string;
  currency: string;
  due_date?: string;
  issue_date?: string;
  memo?: string;
  confidence_score: number;
  missing_fields: string[];
  items: Array<{
    description: string;
    quantity: number;
    unit_amount: number;
    source_text?: string;
    confidence: number;
  }>;
}

export type TriageIntent =
  | 'PROMISE_TO_PAY'
  | 'PAYMENT_ALREADY_SENT'
  | 'DISPUTE_OR_QUESTION'
  | 'REQUEST_INVOICE_COPY'
  | 'NEED_MORE_TIME'
  | 'OUT_OF_OFFICE'
  | 'UNRESPONSIVE_OR_OTHER';

export interface TriageClassificationResult {
  intent: TriageIntent;
  confidence: number;
  promised_payment_date: string | null;
  summary: string;
  recommended_action: string;
}

export interface TriageClassifyResponse {
  invoice_id: string;
  invoice_status: string;
  classification: TriageClassificationResult;
}

export interface TriageDraftResult {
  subject: string;
  draft_reply: string;
  draft_message?: string;
  tone?: string;
  rationale?: string;
  payment_link_included?: boolean;
  payment_link?: string;
  balance_due?: number;
  total_invoice_amount?: number;
  currency?: string;
  recipient_name?: string;
  recipient_email?: string;
  fact_citations?: string[];
  is_partial_payment?: boolean;
  partial_amount?: number;
  remaining_balance?: number;
  next_due_date?: string;
  merchant_name?: string;
}

export interface AuditEvent {
  id: string;
  actor_type: 'HUMAN' | 'AI' | 'PAYPAL_API' | 'FIXTURE' | 'SYSTEM';
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  details?: any;
  created_at: string;
}

export interface ConnectionStatus {
  environment: string;
  demo_mode: boolean;
  paypal_configured: boolean;
  paypal_mode: string;
  paypal_base_url: string;
  database_connected: boolean;
  llm_provider: string;
  llm_configured: boolean;
}
