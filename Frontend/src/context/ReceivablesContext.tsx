import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Invoice, InvoiceCreatePayload, ConnectionStatus } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ReceivablesMetrics {
  totalInvoiced: number;
  totalOutstanding: number;
  totalCollected: number;
  draftsCount: number;
  sentCount: number;
  paidCount: number;
  aging: {
    current: number;    // 0-15 days
    warning: number;    // 16-30 days
    overdue: number;    // 31+ days
  };
  urgentCount: number;
}

interface ReceivablesContextType {
  invoices: Invoice[];
  isLoading: boolean;
  metrics: ReceivablesMetrics;
  connectionStatus: ConnectionStatus | null;
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (inv: Invoice | null) => void;
  fetchInvoices: (status?: string) => Promise<void>;
  createInvoice: (payload: InvoiceCreatePayload, autoPushDraft?: boolean) => Promise<Invoice>;
  createPayPalDraft: (id: string) => Promise<Invoice>;
  sendInvoice: (id: string) => Promise<Invoice>;
  remindInvoice: (id: string, subject?: string, note?: string) => Promise<Invoice>;
  refreshInvoiceStatus: (id: string) => Promise<Invoice>;
  checkConnection: () => Promise<void>;
}

const defaultMetrics: ReceivablesMetrics = {
  totalInvoiced: 0,
  totalOutstanding: 0,
  totalCollected: 0,
  draftsCount: 0,
  sentCount: 0,
  paidCount: 0,
  aging: { current: 0, warning: 0, overdue: 0 },
  urgentCount: 0,
};

const ReceivablesContext = createContext<ReceivablesContextType | undefined>(undefined);

export function ReceivablesProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const calculateMetrics = (list: Invoice[]): ReceivablesMetrics => {
    let totalInvoiced = 0;
    let totalOutstanding = 0;
    let totalCollected = 0;
    let draftsCount = 0;
    let sentCount = 0;
    let paidCount = 0;
    let currentAging = 0;
    let warningAging = 0;
    let overdueAging = 0;
    let urgentCount = 0;

    const now = new Date();

    for (const inv of list) {
      totalInvoiced += inv.total;
      if (inv.status === 'PAID') {
        totalCollected += inv.total;
        paidCount++;
      } else {
        totalOutstanding += inv.total;
        if (inv.status === 'DRAFT') draftsCount++;
        if (inv.status === 'SENT') sentCount++;

        // Calculate days relative to due_date
        const due = new Date(inv.due_date);
        const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 3600 * 24));

        if (diffDays > 30) {
          overdueAging += inv.total;
          urgentCount++;
        } else if (diffDays > 0) {
          warningAging += inv.total;
          urgentCount++;
        } else {
          currentAging += inv.total;
        }
      }
    }

    return {
      totalInvoiced,
      totalOutstanding,
      totalCollected,
      draftsCount,
      sentCount,
      paidCount,
      aging: {
        current: currentAging,
        warning: warningAging,
        overdue: overdueAging,
      },
      urgentCount,
    };
  };

  const fetchInvoices = useCallback(async (statusFilter?: string) => {
    setIsLoading(true);
    try {
      const data = await api.invoices.list(statusFilter);
      setInvoices(data);
    } catch (err: any) {
      toast.error('Failed to load invoices', {
        description: err.message || 'Make sure the Cashiko backend is running on port 8000.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const status = await api.settings.getConnectionStatus();
      setConnectionStatus(status);
    } catch (err) {
      console.warn('Backend connection check failed:', err);
      setConnectionStatus(null);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    checkConnection();
  }, [fetchInvoices, checkConnection]);

  const createInvoice = async (payload: InvoiceCreatePayload, autoPushDraft: boolean = true): Promise<Invoice> => {
    try {
      const newInv = await api.invoices.create(payload);
      let finalInv = newInv;
      if (autoPushDraft) {
        try {
          finalInv = await api.invoices.createPayPalDraft(newInv.id);
          toast.success('PayPal Sandbox Draft Created', {
            description: `Draft ID: ${finalInv.paypal_invoice_id || finalInv.id.substring(0, 8)}`,
          });
        } catch (draftErr: any) {
          toast.warning('Invoice saved locally, but PayPal draft sync failed', {
            description: draftErr.message,
          });
        }
      } else {
        toast.success('Invoice created locally');
      }
      await fetchInvoices();
      return finalInv;
    } catch (err: any) {
      toast.error('Failed to create invoice', { description: err.message });
      throw err;
    }
  };

  const createPayPalDraft = async (id: string): Promise<Invoice> => {
    try {
      const updated = await api.invoices.createPayPalDraft(id);
      toast.success('Pushed draft to PayPal Sandbox', {
        description: `PayPal Invoice ID: ${updated.paypal_invoice_id}`,
      });
      await fetchInvoices();
      return updated;
    } catch (err: any) {
      toast.error('PayPal draft creation failed', { description: err.message });
      throw err;
    }
  };

  const sendInvoice = async (id: string): Promise<Invoice> => {
    try {
      const updated = await api.invoices.sendPayPal(id);
      toast.success('Invoice Sent via PayPal!', {
        description: `Sent to ${updated.recipient_email}. Status is now SENT.`,
      });
      await fetchInvoices();
      return updated;
    } catch (err: any) {
      toast.error('Failed to send PayPal invoice', { description: err.message });
      throw err;
    }
  };

  const remindInvoice = async (id: string, subject?: string, note?: string): Promise<Invoice> => {
    try {
      const updated = await api.invoices.remindPayPal(id, subject, note);
      toast.success('PayPal Reminder Dispatched', {
        description: `Sent official reminder to ${updated.recipient_email}`,
      });
      await fetchInvoices();
      return updated;
    } catch (err: any) {
      toast.error('Failed to dispatch reminder', { description: err.message });
      throw err;
    }
  };

  const refreshInvoiceStatus = async (id: string): Promise<Invoice> => {
    try {
      const updated = await api.invoices.refresh(id);
      toast.info('Status Reconciled', {
        description: `Invoice status is ${updated.status}`,
      });
      await fetchInvoices();
      return updated;
    } catch (err: any) {
      toast.error('Status sync failed', { description: err.message });
      throw err;
    }
  };

  const metrics = calculateMetrics(invoices);

  return (
    <ReceivablesContext.Provider
      value={{
        invoices,
        isLoading,
        metrics,
        connectionStatus,
        selectedInvoice,
        setSelectedInvoice,
        fetchInvoices,
        createInvoice,
        createPayPalDraft,
        sendInvoice,
        remindInvoice,
        refreshInvoiceStatus,
        checkConnection,
      }}
    >
      {children}
    </ReceivablesContext.Provider>
  );
}

export function useReceivables() {
  const context = useContext(ReceivablesContext);
  if (!context) {
    throw new Error('useReceivables must be used within a ReceivablesProvider');
  }
  return context;
}
