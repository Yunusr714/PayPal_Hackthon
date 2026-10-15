import { useState } from 'react';
import { toast } from 'sonner';
import { Store, CreditCard, Bell, Sparkles, Users, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  const [whatsapp, setWhatsapp] = useState(true);
  const [lowStock, setLowStock] = useState(true);
  const [aiReminders, setAiReminders] = useState(true);
  const [paypalSandbox, setPaypalSandbox] = useState(true);

  return (
    <div className="animate-fade-in">
      <Tabs defaultValue="profile">
        <TabsList className="h-9 flex-wrap mb-5">
          <TabsTrigger value="profile" className="text-sm"><Store className="h-3.5 w-3.5 mr-1.5" /> Store Profile</TabsTrigger>
          <TabsTrigger value="payment" className="text-sm"><CreditCard className="h-3.5 w-3.5 mr-1.5" /> Payment Preferences</TabsTrigger>
          <TabsTrigger value="notifications" className="text-sm"><Bell className="h-3.5 w-3.5 mr-1.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="ai" className="text-sm"><Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Preferences</TabsTrigger>
          <TabsTrigger value="team" className="text-sm"><Users className="h-3.5 w-3.5 mr-1.5" /> Team Members</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="rounded-xl border-border shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Store Profile</CardTitle>
              <CardDescription className="text-sm">Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="store-name" className="text-sm font-medium">Store Name</Label>
                  <Input id="store-name" defaultValue="Sharma Kirana Store" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner-name" className="text-sm font-medium">Owner Name</Label>
                  <Input id="owner-name" defaultValue="Ramesh Sharma" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                  <Input id="phone" defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                  <Input id="address" defaultValue="Shop No. 12, Main Market, Delhi" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Currency</Label>
                  <Select defaultValue="inr">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">INR (₹)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hinglish">Hinglish</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => toast.success('Changes saved', { description: 'Store profile updated.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                <Save className="h-4 w-4 mr-1.5" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="rounded-xl border-border shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Payment Preferences</CardTitle>
              <CardDescription className="text-sm">Configure payment methods and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Default Payment Method</Label>
                <Select defaultValue="upi">
                  <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <Label className="text-sm font-medium text-foreground">PayPal Sandbox Mode</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Use PayPal sandbox for testing</p>
                </div>
                <Switch checked={paypalSandbox} onCheckedChange={setPaypalSandbox} />
              </div>
              <Button onClick={() => toast.success('Changes saved', { description: 'Payment preferences updated.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                <Save className="h-4 w-4 mr-1.5" /> Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="rounded-xl border-border shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Notifications</CardTitle>
              <CardDescription className="text-sm">Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="pr-4">
                  <Label className="text-sm font-medium text-foreground">Enable WhatsApp reminders</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Send payment reminders via WhatsApp</p>
                </div>
                <Switch checked={whatsapp} onCheckedChange={setWhatsapp} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="pr-4">
                  <Label className="text-sm font-medium text-foreground">Enable low-stock alerts</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Get notified when products run low</p>
                </div>
                <Switch checked={lowStock} onCheckedChange={setLowStock} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="pr-4">
                  <Label className="text-sm font-medium text-foreground">Enable AI payment reminders</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">AI auto-sends reminders to overdue customers</p>
                </div>
                <Switch checked={aiReminders} onCheckedChange={setAiReminders} />
              </div>
              <div className="pt-4">
                <Button onClick={() => toast.success('Changes saved', { description: 'Notification preferences updated.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                  <Save className="h-4 w-4 mr-1.5" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="rounded-xl border-border shadow-sm max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">AI Preferences</CardTitle>
              <CardDescription className="text-sm">Configure your AI assistant behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <ToggleSetting id="ai-cashflow" label="AI Cash-Flow Alerts" description="Get proactive alerts about cash gaps" defaultChecked />
              <ToggleSetting id="ai-reorder" label="AI Reorder Suggestions" description="Automatic reorder recommendations" defaultChecked />
              <ToggleSetting id="ai-summary" label="AI Daily Summary" description="Receive a daily business summary" defaultChecked />
              <ToggleSetting id="ai-reminder-tone" label="Polite Reminder Tone" description="Use respectful tone in reminders" defaultChecked />
              <div className="pt-4">
                <Button onClick={() => toast.success('Changes saved', { description: 'AI preferences updated.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                  <Save className="h-4 w-4 mr-1.5" /> Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card className="rounded-xl border-border shadow-sm max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Team Members</CardTitle>
                  <CardDescription className="text-sm">Manage who has access to your store dashboard</CardDescription>
                </div>
                <Button size="sm" onClick={() => toast.success('Invite sent', { description: 'Team invitation email sent.' })} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toast.info('Remove member', { description: `${member.name} will be removed.` })}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
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
