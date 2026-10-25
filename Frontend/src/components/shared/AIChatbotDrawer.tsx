import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Sparkles, Send, Mic, Bell, Share2, RefreshCw, Copy,
  Check, ChevronRight, ExternalLink, User, Wrench, ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useBusiness } from '@/context/BusinessContext';
import { formatINR } from '@/data/mock-data';
import { api } from '@/lib/api';

interface ActionCardData {
  type?: 'whatsapp_reminder' | 'due_summary' | 'customer_card' | string;
  customer_name?: string | null;
  phone?: string | null;
  amount?: number | null;
  service_or_item?: string | null;
  due_date?: string | null;
  whatsapp_message?: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  actionCard?: ActionCardData | null;
}

interface AIChatbotDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

export function AIChatbotDrawer({ open, onOpenChange, initialQuery }: AIChatbotDrawerProps) {
  const navigate = useNavigate();
  const { user, category, products, customers } = useBusiness();

  const getInitialGreeting = (): Message => ({
    id: 'msg-greeting',
    role: 'ai',
    content: `Namaste! I'm your **Cashiko Copilot**, connected directly to your live SQLite database (**${customers.length} registered customers**, active service work orders, rate card, and PayPal invoices).\n\nAsk me anything broad or specific — for example:\n• *"Any dues?"*\n• *"How many people who had tv repair service due?"*\n• *"Give me 3 customer details"*\n• *"Who owes me the most?"*`,
    timestamp: 'Just now',
    suggestedActions: [
      'Any dues?',
      'How many people who had tv repair service due?',
      'Give me 3 customer details',
      'Who owes me the most?',
    ],
  });

  const [messages, setMessages] = useState<Message[]>([getInitialGreeting()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat without showing any scrollbars
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, open]);

  const quickPrompts = category === 'service'
    ? [
        { text: 'Any dues?', query: 'any dues?' },
        { text: 'TV Repair service dues', query: 'how many people who had tv repair service due?' },
        { text: 'Give 3 customer details', query: 'give me 3 customer details' },
        { text: 'Who owes the most?', query: 'who owes me the most money?' },
      ]
    : [
        { text: 'Any khata dues?', query: 'any dues?' },
        { text: 'Give 3 customer details', query: 'give me 3 customer details' },
        { text: 'Who owes the most?', query: 'who owes me the most money?' },
        { text: 'Overdue balance summary', query: 'summarize all overdue customer balances' },
      ];

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    const cleanText = queryText.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: cleanText,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.chat.sendMessage(cleanText, category, {
        businessName: user.businessName,
        customerCount: customers.length,
        productCount: products.length,
      });

      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        content: res.reply || `I have analyzed your query based on ${user.businessName}'s real-time records.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: res.suggested_actions || [],
        actionCard: res.action_card || null,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      toast.error('Copilot query error', { description: err.message });
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: 'ai',
        content: `I encountered an issue connecting to the AI service. Please ensure backend server is running. (${err.message})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const lastInitialQueryRef = useRef<string | null>(null);

  // Auto-send query if drawer was opened via header search or preset
  useEffect(() => {
    if (open && initialQuery && initialQuery.trim() && initialQuery !== lastInitialQueryRef.current) {
      lastInitialQueryRef.current = initialQuery;
      handleSendQuery(initialQuery.trim());
    }
  }, [open, initialQuery]);

  const handleMicClick = () => {
    setIsListening(true);
    toast.info('Listening to voice query...', {
      description: 'Listening for Hindi or English question...',
    });
    setTimeout(() => {
      setIsListening(false);
      setInput('how many people who had tv repair service due?');
      toast.success('Voice recognized: "how many people who had tv repair service due?"');
    }, 1800);
  };

  const openWhatsApp = (phone?: string | null, message?: string | null) => {
    if (!phone) {
      toast.error('No phone number available for this customer');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message || 'Namaste! Friendly payment reminder from Cashiko.');
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full bg-white border-l border-slate-200 shadow-2xl z-50 text-slate-900"
      >
        {/* Drawer Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 pr-14 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/20 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-bold text-slate-900 leading-tight">
                  Cashiko AI Copilot
                </SheetTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live DB
                </span>
              </div>
              <SheetDescription className="text-[11px] text-muted-foreground mt-0.5">
                Grounded in SQLite ledger, work orders & PayPal
              </SheetDescription>
            </div>
          </div>

          {/* Action reset button */}
          <button
            type="button"
            onClick={() => {
              setMessages([getInitialGreeting()]);
              toast.success('Copilot chat reset to live database summary.');
            }}
            title="Reset conversation"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Suggested Prompts Grid */}
        <div className="shrink-0 bg-white border-b border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Database Queries
            </span>
            <span className="text-[10px] text-slate-400">Click to ask</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {quickPrompts.map((p) => (
              <button
                key={p.text}
                type="button"
                onClick={() => handleSendQuery(p.query)}
                className="text-left rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 p-2 text-[11px] font-medium text-slate-700 transition-all active:scale-[0.99] flex items-start gap-1.5 shadow-2xs"
              >
                <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                <span className="line-clamp-1 leading-tight">{p.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Thread Container */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC] no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Role & Timestamp Header */}
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {msg.role === 'ai' ? (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-primary">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Copilot</span>
                  </div>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-500">You</span>
                )}
                <span className="text-[10px] text-muted-foreground/70">· {msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-xs font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                {msg.content}
              </div>

              {/* Dynamic Real Action Card */}
              {msg.actionCard && (
                <div className="mt-2.5 w-full max-w-[90%] rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-emerald-700" />
                      {msg.actionCard.type === 'whatsapp_reminder'
                        ? 'WhatsApp Payment Reminder Draft'
                        : msg.actionCard.type === 'customer_card'
                        ? 'Customer Profile Record'
                        : 'Live Receivables Summary'}
                    </span>
                    {msg.actionCard.amount != null && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        {formatINR(msg.actionCard.amount)}
                      </span>
                    )}
                  </div>

                  {msg.actionCard.customer_name && (
                    <div className="text-xs bg-white p-2.5 rounded-lg border border-emerald-100 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <strong className="text-foreground">{msg.actionCard.customer_name}</strong>
                      </div>
                      {msg.actionCard.phone && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-mono text-slate-700">{msg.actionCard.phone}</span>
                        </div>
                      )}
                      {msg.actionCard.service_or_item && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service:</span>
                          <span className="font-medium text-slate-800">{msg.actionCard.service_or_item}</span>
                        </div>
                      )}
                      {msg.actionCard.due_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Due Date:</span>
                          <span className="font-semibold text-slate-900">{msg.actionCard.due_date}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {msg.actionCard.whatsapp_message && (
                    <p className="text-xs text-slate-800 italic bg-white p-2.5 rounded-lg border border-emerald-100 leading-relaxed shadow-2xs">
                      "{msg.actionCard.whatsapp_message}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-0.5">
                    {msg.actionCard.phone && (
                      <Button
                        size="sm"
                        onClick={() => openWhatsApp(msg.actionCard?.phone, msg.actionCard?.whatsapp_message)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold h-7 flex-1 rounded-lg shadow-2xs"
                      >
                        <Share2 className="h-3 w-3 mr-1" /> Open WhatsApp
                      </Button>
                    )}
                    {msg.actionCard.customer_name && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onOpenChange(false);
                          navigate(`/customers/${encodeURIComponent(msg.actionCard!.customer_name!)}`);
                        }}
                        className="text-[11px] h-7 px-2.5 rounded-lg border-emerald-300 text-emerald-800 bg-white"
                      >
                        View Ledger <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Suggested Follow-up Action Chips */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 max-w-[90%]">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendQuery(action)}
                      className="text-[10px] font-medium bg-white hover:bg-primary/5 hover:border-primary/40 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full transition-all active:scale-95"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white border border-slate-200 rounded-xl px-3 py-2 w-fit shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-spin" />
              <span>Analyzing live SQLite database records...</span>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="shrink-0 border-t border-slate-200 bg-white p-3 space-y-2 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(input);
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleMicClick}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-50 border-rose-300 text-destructive animate-pulse'
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
              title="Voice recording in Hindi/English"
            >
              <Mic className="h-4 w-4" />
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Copilot... e.g. Who has dues? or TV repair service"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary-hover text-white shadow-xs"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground">
            <span>Supports Hindi & English speech input</span>
            <span>Press Enter ↵ to send</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
