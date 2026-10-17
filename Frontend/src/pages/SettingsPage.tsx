import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Store, CreditCard, Bell, Sparkles, Users, Save, Plus, Trash2, Scissors, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useBusiness, BusinessCategory } from '@/context/BusinessContext';

interface ToggleSettingProps {
  id: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}

function ToggleSetting({ id, label, description, defaultChecked = false }: ToggleSettingProps) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="pr-4">
        <Label htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}

const teamMembers = [
  { name: 'Ramesh Sharma', role: 'Store Owner', avatar: 'RS' },
  { name: 'Suresh Sharma', role: 'Manager', avatar: 'SS' },
  { name: 'Anita Sharma', role: 'Cashier', avatar: 'AS' },
];

export function SettingsPage() {
  const { user, loginUser, setCategory } = useBusiness();

  const [businessName, setBusinessName] = useState(user.businessName);
  const [ownerName, setOwnerName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address || 'Main Market, Delhi NCR');
  const [bizCategory, setBizCategory] = useState<BusinessCategory>(user.category);
  const [subCategory, setSubCategory] = useState(user.subCategory);

  const [whatsapp, setWhatsapp] = useState(true);
  const [lowStock, setLowStock] = useState(true);
  const [aiReminders, setAiReminders] = useState(true);
  const [paypalSandbox, setPaypalSandbox] = useState(true);

  useEffect(() => {
    setBusinessName(user.businessName);
    setOwnerName(user.name);
    setPhone(user.phone);
    setAddress(user.address || 'Main Market, Delhi NCR');
    setBizCategory(user.category);
    setSubCategory(user.subCategory);
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser({
      ...user,
      businessName,
      name: ownerName,
      phone,
      address,
      category: bizCategory,
      subCategory,
    });
    toast.success('Business Profile Updated', {
      description: `Settings saved for ${businessName}.`,
    });
  };

  return (
    <div className="animate-fade-in">
      <Tabs defaultValue="profile">
        <TabsList className="h-9 flex-wrap mb-5">
          <TabsTrigger value="profile" className="text-xs sm:text-sm font-semibold">
            <Store className="h-3.5 w-3.5 mr-1.5" /> Business Profile
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs sm:text-sm font-semibold">
            <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Payment Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm font-semibold">
            <Bell className="h-3.5 w-3.5 mr-1.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs sm:text-sm font-semibold">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Preferences
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs sm:text-sm font-semibold">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Team Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="rounded-2xl border-border shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">Business Profile & Category</CardTitle>
              <CardDescription className="text-xs">
                Configure your business model (Shop vs Service) and primary details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                
                {/* Category Selection in Settings */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Business Model Category</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setBizCategory('shop');
                        setSubCategory('Kirana & Retail Store');
                      }}
                      className={`flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-all ${
                        bizCategory === 'shop'
                          ? 'border-primary bg-blue-50/50 ring-2 ring-primary/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <Store className={`h-4 w-4 ${bizCategory === 'shop' ? 'text-primary' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Shop / Retail</p>
                        <p className="text-[10px] text-muted-foreground">With Inventory</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBizCategory('service');
                        setSubCategory('Tailor & Boutique');
                      }}
                      className={`flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-all ${
                        bizCategory === 'service'
                          ? 'border-[#007F7C] bg-[#E6F5F5]/60 ring-2 ring-[#007F7C]/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <Scissors className={`h-4 w-4 ${bizCategory === 'service' ? 'text-[#007F7C]' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Service Provider</p>
                        <p className="text-[10px] text-[#007F7C] font-medium">Zero Inventory</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="store-name" className="text-xs font-semibold text-slate-800">Business / Shop Name</Label>
                    <Input
                      id="store-name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="h-10 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="owner-name" className="text-xs font-semibold text-slate-800">Owner Name</Label>
                    <Input
                      id="owner-name"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="h-10 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-slate-800">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subcategory" className="text-xs font-semibold text-slate-800">Profession / Speciality</Label>
                    <Input
                      id="subcategory"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address" className="text-xs font-semibold text-slate-800">Business Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold text-xs shadow-sm">
                    <Save className="h-4 w-4 mr-1.5" /> Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="rounded-2xl border-border shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">Payment Preferences</CardTitle>
              <CardDescription className="text-xs">Configure payment methods and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-800">Default Payment Method</Label>
                <Select defaultValue="upi">
                  <SelectTrigger className="w-full sm:w-48 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI (PhonePe, GPay, Paytm)</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit / Khata</SelectItem>
                    <SelectItem value="paypal">PayPal Merchant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <Label className="text-sm font-semibold text-foreground">PayPal Sandbox Mode</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Use PayPal sandbox for test transactions</p>
                </div>
                <Switch checked={paypalSandbox} onCheckedChange={setPaypalSandbox} />
              </div>
              <Button onClick={() => toast.success('Changes saved', { description: 'Payment preferences updated.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold">
                <Save className="h-4 w-4 mr-1.5" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="rounded-2xl border-border shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">Notifications</CardTitle>
              <CardDescription className="text-xs">Manage your customer reminder and alert preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="pr-4">
                  <Label className="text-sm font-semibold text-foreground">WhatsApp payment reminders</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Send friendly payment reminder slips via WhatsApp</p>
                </div>
                <Switch checked={whatsapp} onCheckedChange={setWhatsapp} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="pr-4">
                  <Label className="text-sm font-semibold text-foreground">Low-stock & material alerts</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Get notified when stock or supplies run low</p>
                </div>
                <Switch checked={lowStock} onCheckedChange={setLowStock} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="pr-4">
                  <Label className="text-sm font-semibold text-foreground">AI auto-reminders</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">AI suggests smart schedules to remind overdue accounts</p>
                </div>
                <Switch checked={aiReminders} onCheckedChange={setAiReminders} />
              </div>
              <div className="pt-4">
                <Button onClick={() => toast.success('Changes saved', { description: 'Notification preferences updated.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold">
                  <Save className="h-4 w-4 mr-1.5" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="rounded-2xl border-border shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">AI Preferences</CardTitle>
              <CardDescription className="text-xs">Configure your AI assistant copilot behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <ToggleSetting id="ai-cashflow" label="AI Cash-Flow Alerts" description="Get proactive alerts about cash gaps" defaultChecked />
              <ToggleSetting id="ai-reorder" label="AI Work Order & Stock Suggestions" description="Smart recommendations for dispatch & inventory" defaultChecked />
              <ToggleSetting id="ai-summary" label="AI Daily Summary" description="Receive a daily morning business summary" defaultChecked />
              <ToggleSetting id="ai-reminder-tone" label="Polite WhatsApp Tone" description="Use respectful, warm tone in customer reminders" defaultChecked />
              <div className="pt-4">
                <Button onClick={() => toast.success('Changes saved', { description: 'AI preferences updated.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold">
                  <Save className="h-4 w-4 mr-1.5" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card className="rounded-2xl border-border shadow-sm max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Team Members</CardTitle>
                  <CardDescription className="text-xs">Manage who has access to your business dashboard</CardDescription>
                </div>
                <Button size="sm" onClick={() => toast.success('Invite sent', { description: 'Team invitation link generated.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Invite Member
                </Button>
              </div>
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
