import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Sparkles, Send, Mic, FileText, Bell, Package, TrendingUp, Wallet,
  Check, Edit3, X, Plus, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Message {
  role: 'user' | 'ai';
  content: string;
  showInvoice?: boolean;
  showReminder?: boolean;
}

const initialMessages: Message[] = [
  {
    role: 'user',
    content: 'Sharma uncle ne 2 kg chawal, 1 litre tel aur 1 packet biscuit liya. ₹340 udhaar, next Sunday denge.',
  },
  {
    role: 'ai',
    content:
      'I found a matching customer: Sharma Uncle. I can create a credit khata entry of ₹340, set the due date to Sunday, and prepare a polite payment reminder. Would you like me to proceed?',
    showInvoice: true,
  },
  {
    role: 'user',
    content: 'Send him a polite reminder.',
  },
  {
    role: 'ai',
    content:
      "Here is a suggested reminder: 'Namaste Sharma Uncle ji, aapki ₹340 ki dukaan khata pending hai aur payment Sunday ko due hai. Kripya samay par payment kar dijiye. Dhanyavaad!' Would you like to send this with a PayPal payment link?",
    showReminder: true,
  },
];

const quickActions = [
  { label: 'Create Credit Entry', icon: FileText },
  { label: 'Send Payment Reminder', icon: Bell },
  { label: 'Check Low Stock', icon: Package },
  { label: 'Generate Daily Summary', icon: TrendingUp },
  { label: 'Forecast Cash Flow', icon: Wallet },
];

const recentActions = [
  'Created khata entry for Sharma Uncle — ₹340',
  'Drafted reminder for Anil Kumar — ₹450',
  'Suggested reorder for Aata — 20 kg',
  'Generated cash-flow alert for Friday',
];

export function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const aiMsg: Message = {
        role: 'ai',
        content: "I've processed your request. Based on your store data, I can help you with that. Would you like me to proceed?",
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  const handleQuickAction = (label: string) => {
    setInput(label);
  };

  return (
    <div className="animate-fade-in">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="rounded-xl border-border shadow-sm flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">KiranaPay AI Assistant</CardTitle>
                  <CardDescription className="text-xs">Ask about sales, khata, stock, payments, or cash flow.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'w-full'}`}>
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium text-primary">AI Assistant</span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-tl-md'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {msg.showInvoice && (
                      <div className="mt-3 rounded-xl border border-border bg-white p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Invoice Preview</span>
                          <span className="text-xs font-medium text-muted-foreground">INV-1043</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Customer</span>
                            <span className="font-medium text-foreground">Sharma Uncle</span>
                          </div>
                          <div className="border-t border-border my-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Rice — 2 kg</span>
                            <span className="font-medium text-foreground">₹120</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Cooking Oil — 1 litre</span>
                            <span className="font-medium text-foreground">₹180</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Biscuits — 1 packet</span>
                            <span className="font-medium text-foreground">₹40</span>
                          </div>
                          <div className="border-t border-border my-2" />
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-foreground">Total</span>
                            <span className="font-bold text-foreground">₹340</span>
                          </div>
                          <div className="flex justify-between text-xs mt-2">
                            <span className="text-muted-foreground">Payment mode: Credit</span>
                            <span className="text-muted-foreground">Due: Sunday, 18 Oct 2026</span>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => toast.success('Sale saved successfully', { description: 'Credit entry created for Sharma Uncle.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                            <Check className="h-3.5 w-3.5 mr-1" /> Approve & Save
                          </Button>
                          <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-muted">
                            <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Details
                          </Button>
                          <Button size="sm" variant="ghost" className="text-muted-foreground hover:bg-muted">
                            <X className="h-3.5 w-3.5 mr-1" /> Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {msg.showReminder && (
                      <div className="mt-3 rounded-xl border border-border bg-accent/30 p-4">
                        <p className="text-sm text-foreground italic leading-relaxed">
                          "Namaste Sharma Uncle ji, aapki ₹340 ki dukaan khata pending hai aur payment Sunday ko due hai. Kripya samay par payment kar dijiye. Dhanyavaad!"
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => toast.success('Reminder sent successfully', { description: 'Reminder sent to Sharma Uncle.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                            <Send className="h-3.5 w-3.5 mr-1" /> Send Reminder
                          </Button>
                          <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-muted" onClick={() => toast.success('PayPal payment link added', { description: 'Link attached to reminder.' })}>
                            Add PayPal Payment Link
                          </Button>
                          <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-muted" onClick={() => toast.success('Reminder scheduled', { description: 'Will be sent on Sunday.' })}>
                            Schedule for Sunday
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2">
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors">
                  <Mic className="h-[18px] w-[18px]" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type or speak your sale… e.g. 2 kg sugar ₹120 cash"
                  className="flex-1 h-10 rounded-xl border border-input bg-muted/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-white transition-all"
                />
                <Button onClick={handleSend} size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover">
                  <Send className="h-[18px] w-[18px]" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-xl border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              <CardDescription className="text-xs">Common tasks the AI can handle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors text-left"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shrink-0">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  {action.label}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Recent AI Actions</CardTitle>
              <CardDescription className="text-xs">Tasks completed by your AI copilot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {recentActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10 shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{action}</p>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full text-primary hover:bg-accent">
                  <Zap className="h-3.5 w-3.5 mr-1.5" /> View All Actions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
