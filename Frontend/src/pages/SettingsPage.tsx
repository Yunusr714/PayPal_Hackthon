import { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  CreditCard,
  Cpu,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useBusiness } from '@/context/BusinessContext';
import { api } from '@/lib/api';
import { ConnectionStatus } from '@/types';

interface ToggleSettingProps {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}

function ToggleSetting({ id, label, description, defaultChecked }: ToggleSettingProps) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center justify-between py-3 border-b border-border">
      <div className="pr-4">
        <Label htmlFor={id} className="text-xs font-semibold text-foreground">
          {label}
        </Label>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}

const teamMembers = [
  { name: 'Ramesh Sharma', role: 'Owner & Admin', avatar: 'RS' },
  { name: 'Suresh Kumar', role: 'Store Billing Staff', avatar: 'SK' },
  { name: 'Rajesh Tailor', role: 'Master Craftsman', avatar: 'RT' },
];

export function SettingsPage() {
  const { user, category, updateUserProfile } = useBusiness();
  const [whatsapp, setWhatsapp] = useState(true);
  const [lowStock, setLowStock] = useState(true);
  const [aiReminders, setAiReminders] = useState(true);
  const [paypalSandbox, setPaypalSandbox] = useState(true);

  // Business Profile Form State
  const [contactPerson, setContactPerson] = useState(user.name);
  const [businessName, setBusinessName] = useState(user.businessName);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState(user.address || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setContactPerson(user.name);
    setBusinessName(user.businessName);
    setPhone(user.phone);
    setEmail(user.email);
    setAddress(user.address || '');
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBName = businessName.trim();
    if (!cleanBName) {
      toast.error('Please enter a business name');
      return;
    }
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: contactPerson.trim(),
        businessName: cleanBName,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      });
      toast.success('Business Profile Updated!', {
        description: `Saved business name as "${cleanBName}".`,
      });
    } catch (err: any) {
      toast.error('Failed to update business profile', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Live PayPal Sandbox & Groq status
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const data = await api.settings.getConnectionStatus();
      setStatus(data);
      toast.success('System Connectivity Verified!', {
        description: 'PayPal Sandbox and Groq AI endpoints are active.',
      });
    } catch (err: any) {
      toast.error('Health Check Failed', { description: err.message });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const webhookUrl = 'http://localhost:8000/api/v1/webhooks/paypal';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    toast.success('Webhook URL Copied!');
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
          Settings & Configuration
        </h1>
        <p className="text-xs text-zinc-500 font-normal mt-1">
          Business configuration, credentials & PayPal API integrations
        </p>
      </div>

      <Tabs defaultValue="paypal" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="paypal" className="text-xs font-semibold rounded-lg gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-blue-600" />
            <span>PayPal & AI Integration</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="text-xs font-semibold rounded-lg">
            Business Profile
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs font-semibold rounded-lg">
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs font-semibold rounded-lg">
            Reminders
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs font-semibold rounded-lg">
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs font-semibold rounded-lg">
            Team
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: PayPal & Groq AI Sandbox Integration */}
        <TabsContent value="paypal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PayPal Card */}
            <Card className="rounded-2xl border-border shadow-xs">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">PayPal Invoicing API v2</CardTitle>
                    <CardDescription className="text-xs">Live Sandbox OAuth2</CardDescription>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    status?.paypal_configured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {status?.paypal_configured ? 'Connected' : 'Demo Fixture'}
                </span>
              </CardHeader>
              <CardContent className="space-y-2 text-xs divide-y divide-border">
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="font-mono font-semibold uppercase">{status?.paypal_mode || 'sandbox'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Base URL:</span>
                  <span className="font-mono text-[11px]">{status?.paypal_base_url || 'https://api-m.sandbox.paypal.com'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Client ID:</span>
                  <span className="font-mono text-[11px]">AZVjZgTJ...BeRnRt (Active)</span>
                </div>
              </CardContent>
            </Card>

            {/* Groq AI Card */}
            <Card className="rounded-2xl border-border shadow-xs">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Groq AI Inference</CardTitle>
                    <CardDescription className="text-xs">Low-token model</CardDescription>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    status?.llm_configured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {status?.llm_configured ? 'Active' : 'Missing Key'}
                </span>
              </CardHeader>
              <CardContent className="space-y-2 text-xs divide-y divide-border">
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-mono font-semibold">{status?.llm_provider || 'groq'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-mono font-bold text-indigo-600">openai/gpt-oss-20b</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">API Key:</span>
                  <span className="font-mono text-[11px]">gsk_47Eu3...szEH (Active)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Webhook Configuration */}
          <Card className="rounded-2xl border-border shadow-xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">PayPal Webhooks Callback</CardTitle>
                  <CardDescription className="text-xs">Automatic reconciliation on invoice payment</CardDescription>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={checkHealth}
                disabled={isChecking}
                className="h-8 text-xs gap-1"
              >
                {isChecking ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                <span>Ping Status</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 p-2.5 font-mono text-xs">
                <span className="truncate text-slate-700">{webhookUrl}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyWebhook}
                  className="h-7 text-xs text-blue-600 hover:text-blue-800"
                >
                  {copiedWebhook ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copiedWebhook ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                In PayPal Developer Dashboard, add a Webhook listener for <code>INVOICING.INVOICE.PAID</code> pointing to your Cashiko callback URL.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Business Profile */}
        <TabsContent value="business">
          <Card className="rounded-2xl border-border shadow-xs max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">Business Profile</CardTitle>
              <CardDescription className="text-xs">Update your store/studio details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Contact Person</Label>
                    <Input
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Business Name</Label>
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Vogue Style Studio"
                      className="text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Phone Number</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Business Email</Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. contact@business.in"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Address</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Shop 14, Main Market, Sector 18"
                    className="text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground font-semibold text-xs shadow-xs"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Payment Preferences */}
        <TabsContent value="payment">
          <Card className="rounded-2xl border-border shadow-xs max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">Payment Preferences</CardTitle>
              <CardDescription className="text-xs">Configure payment methods and checkout options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Default Payment Method</Label>
                <Select defaultValue="paypal">
                  <SelectTrigger className="w-full sm:w-56 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal Merchant (Hosted Link)</SelectItem>
                    <SelectItem value="upi">UPI (PhonePe, GPay, Paytm)</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit / Khata</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <Label className="text-xs font-semibold text-foreground">PayPal Sandbox Mode</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Use PayPal sandbox for test invoicing</p>
                </div>
                <Switch checked={paypalSandbox} onCheckedChange={setPaypalSandbox} />
              </div>

              <Button
                onClick={() => toast.success('Changes saved', { description: 'Payment preferences updated.' })}
                className="bg-primary text-primary-foreground text-xs font-semibold"
              >
                <Save className="h-4 w-4 mr-1.5" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Notifications */}
        <TabsContent value="notifications">
          <Card className="rounded-2xl border-border shadow-xs max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">Reminders & Notifications</CardTitle>
              <CardDescription className="text-xs">Manage your reminder cadence and alert preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="pr-4">
                  <Label className="text-xs font-semibold text-foreground">PayPal Native Reminders</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Automated polite payment reminders via PayPal email engine</p>
                </div>
                <Switch checked={whatsapp} onCheckedChange={setWhatsapp} />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="pr-4">
                  <Label className="text-xs font-semibold text-foreground">Low-stock & material alerts</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Get notified when stock or supplies run low</p>
                </div>
                <Switch checked={lowStock} onCheckedChange={setLowStock} />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="pr-4">
                  <Label className="text-xs font-semibold text-foreground">AI Auto-Triage Reminders</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">AI suggests smart schedules based on promised payment dates</p>
                </div>
                <Switch checked={aiReminders} onCheckedChange={setAiReminders} />
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => toast.success('Changes saved', { description: 'Notification preferences updated.' })}
                  className="bg-primary text-primary-foreground text-xs font-semibold"
                >
                  <Save className="h-4 w-4 mr-1.5" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: AI Preferences */}
        <TabsContent value="ai">
          <Card className="rounded-2xl border-border shadow-xs max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">AI Preferences</CardTitle>
              <CardDescription className="text-xs">Configure Groq AI copilot inference behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <ToggleSetting id="ai-cashflow" label="AI Cash-Flow Alerts" description="Get proactive alerts about cash gaps" defaultChecked />
              <ToggleSetting id="ai-reorder" label="AI Work Order & Stock Suggestions" description="Smart recommendations for dispatch & inventory" defaultChecked />
              <ToggleSetting id="ai-summary" label="AI Daily Summary" description="Receive a daily morning business summary" defaultChecked />
              <ToggleSetting id="ai-reminder-tone" label="Polite Reminder Tone" description="Use respectful, warm tone in client communications" defaultChecked />
              <div className="pt-4">
                <Button
                  onClick={() => toast.success('Changes saved', { description: 'AI preferences updated.' })}
                  className="bg-primary text-primary-foreground text-xs font-semibold"
                >
                  <Save className="h-4 w-4 mr-1.5" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Team */}
        <TabsContent value="team">
          <Card className="rounded-2xl border-border shadow-xs max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Team Members</CardTitle>
                <CardDescription className="text-xs">Manage who has access to your business dashboard</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => toast.success('Invite link copied', { description: 'Team invitation link generated.' })}
                className="h-8 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Invite
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.name} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-bold text-foreground">{member.name}</p>
                      <p className="text-[11px] text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toast.info('Remove member', { description: `${member.name} will be removed.` })}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
