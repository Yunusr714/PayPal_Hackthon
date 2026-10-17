import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Sparkles, Send, Mic, FileText, Bell, Package, TrendingUp, Wallet,
  Check, Edit3, X, ArrowRight, CornerDownLeft, MessageSquare, Bot,
  ExternalLink, Share2, RefreshCw, Copy, CheckCheck,
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

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  showInvoice?: boolean;
  showReminder?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Sharma uncle ne 2 kg chawal, 1 litre tel aur 1 packet biscuit liya. ₹340 udhaar, next Sunday denge.',
    timestamp: '10:42 AM',
  },
  {
    id: 'msg-2',
    role: 'ai',
    content:
      'I found matching customer: Sharma Uncle. I parsed ₹340 on credit with due date on Sunday, 18 Oct 2026. Here is the draft khata bill:',
    timestamp: '10:42 AM',
    showInvoice: true,
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'Send him a polite payment reminder on WhatsApp.',
    timestamp: '10:44 AM',
  },
  {
    id: 'msg-4',
    role: 'ai',
    content:
      "Here is the prepared WhatsApp reminder draft with payment link:",
    timestamp: '10:44 AM',
    showReminder: true,
  },
];

const QUICK_PROMPTS = [
  { text: 'Sharma Uncle ₹340 credit entry', action: 'Record ₹340 credit for Sharma Uncle' },
  { text: 'Check overdue customer khata', action: 'Which customers have overdue payments?' },
  { text: 'Low stock & reorder alerts', action: 'Check low stock and supplier reorder alerts' },
  { text: 'Weekly cash flow forecast', action: 'What is this week\'s estimated cash flow?' },
];

interface AIChatbotDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIChatbotDrawer({ open, onOpenChange }: AIChatbotDrawerProps) {
  const { user, category, products, customers } = useBusiness();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
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

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = `I analyzed your query: "${userText}". `;
      let showInvoice = false;
      let showReminder = false;

      const lower = userText.toLowerCase();
      if (lower.includes('sharma') || lower.includes('udhaar') || lower.includes('credit')) {
        aiResponseText = `I found Sharma Uncle in your records with ₹340 outstanding balance. Here is the credit entry summary:`;
        showInvoice = true;
      } else if (lower.includes('remind') || lower.includes('whatsapp') || lower.includes('payment')) {
        aiResponseText = `I drafted an automated WhatsApp payment reminder slip for your customer:`;
        showReminder = true;
      } else if (lower.includes('stock') || lower.includes('low') || lower.includes('inventory')) {
        const lowStock = products.filter((p) => p.stock <= p.reorderLevel);
        aiResponseText = `You have ${lowStock.length} items reaching reorder thresholds (including Aata & Cooking Oil). Recommended total reorder amount is ₹14,200.`;
      } else if (lower.includes('cash') || lower.includes('flow') || lower.includes('sale')) {
        aiResponseText = `Based on your sales trends, expected collections this week are ₹12,450, while supplier payments are ₹8,000. Your net projected cash flow is healthy.`;
      } else {
        aiResponseText = `Based on ${user.businessName}'s real-time records, I can help you record khata dues, deduct inventory, or send automated WhatsApp reminders. What would you like to do?`;
      }

      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        role: 'ai',
        content: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showInvoice,
        showReminder,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleMicClick = () => {
    setIsListening(true);
    toast.info('Listening to voice input...', {
      description: 'Speak your khata entry or question (Hindi or English).',
    });
    setTimeout(() => {
      setIsListening(false);
      setInput('Sharma Uncle ₹340 grocery credit note on Sunday');
      toast.success('Voice recognized: "Sharma Uncle ₹340 grocery credit note on Sunday"');
    }, 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full bg-white border-l border-slate-200 shadow-2xl z-50 text-slate-900"
      >
        {/* Drawer Header (Solid White, Padded to avoid collision with close button) */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 pr-14 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/20 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-bold text-slate-900 leading-tight">
                  KiranaPay AI Copilot
                </SheetTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
              <SheetDescription className="text-[11px] text-muted-foreground mt-0.5">
                Smart khata, sales & voice business copilot
              </SheetDescription>
            </div>
          </div>

          {/* Action reset button */}
          <button
            type="button"
            onClick={() => {
              setMessages(INITIAL_MESSAGES);
              toast.success('Chat history reset to default demonstration.');
            }}
            title="Reset conversation"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Suggested Prompts: 2x2 Grid with NO Horizontal Scrollbars */}
        <div className="shrink-0 bg-white border-b border-slate-100 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Suggested Prompts
            </span>
            <span className="text-[10px] text-slate-400">Click to autofill</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.text}
                type="button"
                onClick={() => setInput(prompt.action)}
                className="text-left rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 p-2 text-[11px] font-medium text-slate-700 transition-all active:scale-[0.99] flex items-start gap-1.5 shadow-2xs"
              >
                <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                <span className="line-clamp-1 leading-tight">{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Thread Container (Solid Opaque #F8FAFC, 100% Zero Scrollbars) */}
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
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-xs font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                {msg.content}
              </div>

              {/* Interactive Draft Invoice Card */}
              {msg.showInvoice && (
                <div className="mt-2.5 w-full max-w-[88%] rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" /> Khata Credit Preview
                    </span>
                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                      INV-1043
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Customer:</span>
                      <strong className="text-foreground">Sharma Uncle</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Items:</span>
                      <span className="font-medium text-foreground">Rice (2kg), Oil (1L), Biscuits</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Due Date:</span>
                      <span className="font-semibold text-slate-800">Sunday, 18 Oct 2026</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-slate-100 font-bold text-sm text-foreground">
                      <span>Total Credit:</span>
                      <span className="text-primary font-black">₹340</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <Button
                      size="sm"
                      onClick={() => toast.success('Credit Entry Approved!', { description: '₹340 recorded in Sharma Uncle ledger.' })}
                      className="bg-primary hover:bg-primary-hover text-white text-[11px] font-semibold h-7 flex-1 rounded-lg shadow-2xs"
                    >
                      <Check className="h-3 w-3 mr-1" /> Approve & Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info('Edit mode', { description: 'Adjust rates or quantities directly in customer ledger.' })}
                      className="text-[11px] h-7 px-2.5 rounded-lg border-slate-200 text-slate-700"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              )}

              {/* Interactive Draft WhatsApp Reminder Card */}
              {msg.showReminder && (
                <div className="mt-2.5 w-full max-w-[88%] rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-emerald-700" /> WhatsApp Payment Reminder
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                      Automated Draft
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 italic bg-white p-2.5 rounded-lg border border-emerald-100 leading-relaxed shadow-2xs">
                    "Namaste Sharma Uncle ji, aapki ₹340 ki dukaan khata pending hai aur payment Sunday ko due hai. Kripya samay par payment kar dijiye. Dhanyavaad!"
                  </p>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => toast.success('WhatsApp Reminder Sent!', { description: 'Slip delivered with payment link.' })}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold h-7 flex-1 rounded-lg shadow-2xs"
                    >
                      <Share2 className="h-3 w-3 mr-1" /> Send WhatsApp Slip
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success('PayPal Link Copied', { description: 'Payment link copied to clipboard.' })}
                      className="text-[11px] h-7 px-2 rounded-lg border-emerald-300 text-emerald-800 bg-white"
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white border border-slate-200 rounded-xl px-3 py-2 w-fit shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-spin" />
              <span>AI Copilot is processing your store records...</span>
            </div>
          )}
        </div>

        {/* Bottom Input Area (Solid Pure White) */}
        <div className="shrink-0 border-t border-slate-200 bg-white p-3 space-y-2 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
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
                placeholder="Ask AI... e.g. Ramesh ne ₹250 diya"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={!input.trim()}
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
