import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Store, Lock, Phone, ArrowRight, Sparkles, ShoppingBag,
  Wrench, Scissors, CheckCircle2, UserCheck, Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBusiness, DEMO_USERS } from '@/context/BusinessContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { loadDemoUser, user } = useBusiness();
  const [identifier, setIdentifier] = useState('+91 98100 12345');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Welcome back, ${user.name}!`, {
        description: `Logged in to ${user.businessName} (${user.category === 'service' ? 'Service Business' : 'Retail Store'}).`,
      });
      navigate('/');
    }, 450);
  };

  const handleSelectDemo = (key: keyof typeof DEMO_USERS) => {
    loadDemoUser(key);
    const demo = DEMO_USERS[key];
    toast.success(`Logged in as ${demo.name}`, {
      description: `${demo.businessName} (${demo.category === 'service' ? 'Service Provider' : 'Shopkeeper'})`,
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">KiranaPay OS</h1>
          <p className="text-xs text-slate-500">
            Sign in to manage your shop or service business
          </p>
        </div>

        {/* Demo Persona Quick-Switch Panel */}
        <div className="rounded-2xl border border-blue-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-primary" /> One-Click Demo Sign-in:
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
              Instant
            </span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleSelectDemo('shop_sharma')}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 p-2.5 text-left hover:border-primary hover:bg-blue-50/40 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-primary">Ramesh Sharma</p>
                  <p className="text-[11px] text-slate-500">Sharma Kirana Store · <span className="text-blue-600 font-medium">Shop (Inventory)</span></p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo('service_tailor')}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 p-2.5 text-left hover:border-[#007F7C] hover:bg-[#E6F5F5]/60 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F5F5] text-[#007F7C]">
                  <Scissors className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#007F7C]">Rajesh Kumar</p>
                  <p className="text-[11px] text-slate-500">Mastercraft Tailors · <span className="text-[#007F7C] font-medium">Service (Zero Inventory)</span></p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#007F7C] transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo('service_plumber')}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 p-2.5 text-left hover:border-violet-600 hover:bg-violet-50/40 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-violet-700">Amit Verma</p>
                  <p className="text-[11px] text-slate-500">QuickFix Plumbing · <span className="text-violet-700 font-medium">Service (Zero Inventory)</span></p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Standard Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Sign in with Credentials</h2>
            <span className="text-[11px] text-muted-foreground">Registered phone/email</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-id" className="text-xs font-semibold text-slate-800">
                Phone Number or Email
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-id"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-10 pl-9 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-pass" className="text-xs font-semibold text-slate-800">
                  Password
                </Label>
                <a href="#/login" className="text-[11px] text-primary hover:underline font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pl-9 text-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register business category
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
