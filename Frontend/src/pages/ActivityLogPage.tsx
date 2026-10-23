import { useState, useEffect } from 'react';
import {
  History,
  Filter,
  RefreshCw,
  Cpu,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { AuditEvent } from '@/types';
import { toast } from 'sonner';

export function ActivityLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedActor, setSelectedActor] = useState<string>('ALL');

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await api.audit.list(100);
      setEvents(data);
    } catch (err: any) {
      toast.error('Failed to load activity log', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter((ev) => {
    if (selectedActor === 'ALL') return true;
    return ev.actor_type.toUpperCase() === selectedActor.toUpperCase();
  });

  const getActorBadge = (actor: string) => {
    switch (actor.toUpperCase()) {
      case 'AI':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border dark:border-indigo-800/50 px-2 py-0.5 text-[11px] font-bold">
            <Cpu className="h-3 w-3" />
            AI Copilot
          </span>
        );
      case 'PAYPAL_API':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border dark:border-blue-800/50 px-2 py-0.5 text-[11px] font-bold">
            <CreditCard className="h-3 w-3" />
            PayPal API
          </span>
        );
      case 'HUMAN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800/50 px-2 py-0.5 text-[11px] font-bold">
            <User className="h-3 w-3" />
            User Action
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 text-slate-700 dark:bg-zinc-800/70 dark:text-zinc-300 dark:border dark:border-zinc-700/50 px-2 py-0.5 text-[11px] font-bold">
            {actor}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
            Activity & Audit Ledger
          </h1>
          <p className="text-xs text-zinc-500 font-normal mt-1">
            Immutable record of AI proposals, user approvals & PayPal events
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadEvents}
          disabled={isLoading}
          className="gap-1.5 text-xs dark:border-zinc-800 dark:hover:bg-zinc-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#141518] p-2 shadow-xs">
        {['ALL', 'HUMAN', 'AI', 'PAYPAL_API'].map((actor) => (
          <button
            key={actor}
            onClick={() => setSelectedActor(actor)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedActor === actor
                ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200'
            }`}
          >
            {actor === 'ALL'
              ? 'All Actors'
              : actor === 'PAYPAL_API'
              ? 'PayPal Events'
              : actor === 'AI'
              ? 'AI Actions'
              : 'Human Actions'}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#141518] p-6 shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Loading audit events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500">
              <History className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-zinc-100">No events found</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
              Events will be automatically recorded whenever invoices are created, sent, reminded, or classified.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-zinc-800 ml-4 space-y-6 py-2">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="relative pl-6 group">
                {/* Node icon */}
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#141518] bg-blue-600 dark:bg-blue-500 shadow-xs" />

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getActorBadge(ev.actor_type)}
                    <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
                      {ev.action}
                    </span>
                    <span className="text-slate-300 dark:text-zinc-600">•</span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                      {new Date(ev.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                    {ev.summary}
                  </p>

                  {ev.entity_id && (
                    <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      Entity: {ev.entity_type} ({ev.entity_id})
                    </p>
                  )}

                  {ev.details && Object.keys(ev.details).length > 0 && (
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                        View Payload Details
                      </summary>
                      <pre className="mt-1.5 overflow-x-auto rounded-xl bg-slate-50 dark:bg-[#18191D] p-3 font-mono text-[11px] text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-800 max-h-48">
                        {JSON.stringify(ev.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
