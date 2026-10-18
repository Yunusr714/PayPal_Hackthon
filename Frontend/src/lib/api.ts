import {
  Invoice,
  InvoiceCreatePayload,
  IntakeExtractionResult,
  TriageClassifyResponse,
  TriageDraftResult,
  AuditEvent,
  ConnectionStatus,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      let errorDetails = null;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.detail || errorJson.message || errorMessage;
        errorDetails = errorJson;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new ApiError(errorMessage, response.status, errorDetails);
    }
    return (await response.json()) as T;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.message || 'Network error: could not connect to Cashiko backend server.',
      0
    );
  }
}

export const api = {
  invoices: {
    list: async (status?: string): Promise<Invoice[]> => {
      const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
      return request<Invoice[]>(`/invoices${query}`);
    },

    get: async (id: string): Promise<Invoice> => {
      return request<Invoice>(`/invoices/${id}`);
    },

    create: async (payload: InvoiceCreatePayload): Promise<Invoice> => {
      return request<Invoice>('/invoices', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    createPayPalDraft: async (id: string): Promise<Invoice> => {
      return request<Invoice>(`/invoices/${id}/create-paypal-draft`, {
        method: 'POST',
      });
    },

    sendPayPal: async (id: string): Promise<Invoice> => {
      return request<Invoice>(`/invoices/${id}/send-paypal`, {
        method: 'POST',
      });
    },

    remindPayPal: async (id: string, subject?: string, note?: string): Promise<Invoice> => {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (note) params.append('note', note);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<Invoice>(`/invoices/${id}/remind-paypal${query}`, {
        method: 'POST',
      });
    },

    refresh: async (id: string): Promise<Invoice> => {
      return request<Invoice>(`/invoices/${id}/refresh`, {
        method: 'POST',
      });
    },
  },

  customers: {
    list: async (category?: string) => {
      const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
      return request<any[]>(`/customers${query}`);
    },
    get: async (id: string) => {
      return request<any>(`/customers/${id}`);
    },
    create: async (data: any) => {
      return request<any>('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return request<any>(`/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return request<void>(`/customers/${id}`, {
        method: 'DELETE',
      });
    },
    getLedger: async (id: string) => {
      return request<any>(`/customers/${id}/ledger`);
    },
  },

  catalog: {
    list: async (category_type?: string) => {
      const query = category_type && category_type !== 'all' ? `?category_type=${encodeURIComponent(category_type)}` : '';
      return request<any[]>(`/catalog${query}`);
    },
    create: async (data: any) => {
      return request<any>('/catalog', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return request<any>(`/catalog/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return request<void>(`/catalog/${id}`, {
        method: 'DELETE',
      });
    },
  },

  sales: {
    list: async (category_type?: string, status?: string) => {
      const params = new URLSearchParams();
      if (category_type && category_type !== 'all') params.append('category_type', category_type);
      if (status && status !== 'all') params.append('status', status);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<any[]>(`/sales${query}`);
    },
    create: async (data: any) => {
      return request<any>('/sales', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any) => {
      return request<any>(`/sales/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return request<void>(`/sales/${id}`, {
        method: 'DELETE',
      });
    },
  },

  webhooks: {
    simulatePaid: async (invoiceId?: string, paypalInvoiceId?: string) => {
      return request<{ status: string; message: string; new_status: string }>('/webhooks/simulate-paid', {
        method: 'POST',
        body: JSON.stringify({ invoice_id: invoiceId, paypal_invoice_id: paypalInvoiceId }),
      });
    },
  },

  chat: {
    sendMessage: async (message: string, category_mode: string = 'service', context?: any) => {
      return request<{ reply: string; suggested_actions: string[]; action_card?: any }>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, category_mode, context }),
      });
    },
  },

  intake: {
    extract: async (workBrief: string): Promise<IntakeExtractionResult> => {
      return request<IntakeExtractionResult>('/intake/extract', {
        method: 'POST',
        body: JSON.stringify({ work_brief: workBrief }),
      });
    },
  },

  triage: {
    classify: async (invoiceId: string, customerReply: string): Promise<TriageClassifyResponse> => {
      return request<TriageClassifyResponse>('/triage/classify', {
        method: 'POST',
        body: JSON.stringify({
          invoice_id: invoiceId,
          customer_reply: customerReply,
        }),
      });
    },

    draft: async (
      invoiceId: string,
      customerReply: string,
      intent: string
    ): Promise<TriageDraftResult> => {
      return request<TriageDraftResult>('/triage/draft', {
        method: 'POST',
        body: JSON.stringify({
          invoice_id: invoiceId,
          customer_reply: customerReply,
          intent,
        }),
      });
    },
  },

  audit: {
    list: async (limit: number = 50, entityId?: string): Promise<AuditEvent[]> => {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (entityId) params.append('entity_id', entityId);
      return request<AuditEvent[]>(`/audit?${params.toString()}`);
    },
  },

  settings: {
    getConnectionStatus: async (): Promise<ConnectionStatus> => {
      return request<ConnectionStatus>('/settings/connection');
    },
  },
};
