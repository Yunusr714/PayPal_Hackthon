import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ShoppingBag, Wrench, Scissors, Store, Sparkles, CheckCircle2,
  ArrowRight, ShieldCheck, Zap, Users, IndianRupee, Layers, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBusiness, BusinessCategory } from '@/context/BusinessContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser, loadDemoUser } = useBusiness();

  const [category, setCategoryState] = useState<BusinessCategory>('service');
  const [subCategory, setSubCategory] = useState('Tailoring & Boutique');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCategorySelect = (selectedCat: BusinessCategory) => {
    setCategoryState(selectedCat);
    if (selectedCat === 'shop') {
      setSubCategory('Kirana & Grocery');
      if (!businessName) setBusinessName('Sharma Kirana & General Store');
    } else {
      setSubCategory('Tailoring & Boutique');
      if (!businessName) setBusinessName('Mastercraft Tailors & Designers');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim() || !phone.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newUser = registerUser({
        name: ownerName.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        email: email.trim() || `${ownerName.toLowerCase().replace(/\s+/g, '')}@business.in`,
        category,
        subCategory,
      });

      toast.success(`Welcome to KiranaPay, ${newUser.name}!`, {
        description: `Your ${category === 'service' ? 'Service Business' : 'Retail Shop'} workspace is ready.`,
      });

      setLoading(false);
      navigate('/');
    }, 600);
  };

  const handleQuickDemo = (demoKey: 'shop_sharma' | 'service_tailor' | 'service_plumber') => {
    loadDemoUser(demoKey);
    toast.success('Demo account loaded!', {
      description: demoKey === 'shop_sharma' ? 'Loaded Sharma Kirana Store (Shop with Inventory)' : 'Loaded Service Specialist (Zero Inventory · Rate Card & Jobs)',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Brand Showcase & Value Props */}
        <div className="lg:col-span-5 space-y-6 lg:pr-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Unified Platform for India's 63M+ Businesses
          </div>

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">KiranaPay</span>
                <span className="ml-2 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  OS 2.0
                </span>
              </div>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              One platform. <br />
              <span className="text-primary bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Every business type.
              </span>
            </h1>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Whether you sell physical products at a counter or offer skilled services like tailoring, plumbing, or repairs — KiranaPay adapts to your workflow.
            </p>
          </div>

          {/* Differentiating Cards Comparison */}
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">For Retail Shops & Kiranas</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Full inventory tracking, low-stock warnings, supplier reorders, and quick barcode billing.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">For Service Pros (Tailors, Plumbers, Technicians)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong className="text-emerald-700">Zero inventory clutter.</strong> Custom service rate cards, job/order scheduling, labor charges & WhatsApp reminders.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Personas */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center justify-between">
              <span>Instant Test Personas (Skip typing):</span>
              <span className="text-[10px] text-muted-foreground">1-Click Login</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('shop_sharma')}
                className="flex flex-col items-start rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-left hover:border-primary hover:bg-blue-50/50 transition-all"
              >
                <span className="text-[11px] font-bold text-slate-900">Sharma Kirana</span>
                <span className="text-[10px] text-blue-600 font-medium">Shop · With Inventory</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('service_tailor')}
                className="flex flex-col items-start rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-left hover:border-emerald-500 hover:bg-emerald-50/50 transition-all"
              >
                <span className="text-[11px] font-bold text-slate-900">Rajesh Tailors</span>
                <span className="text-[10px] text-emerald-600 font-medium">Service · Tailoring</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('service_plumber')}
                className="flex flex-col items-start rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-left hover:border-violet-500 hover:bg-violet-50/50 transition-all"
              >
                <span className="text-[11px] font-bold text-slate-900">Amit Plumbing</span>
                <span className="text-[10px] text-violet-600 font-medium">Service · Plumbing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form Card */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Create your Business Profile</h2>
              <p className="mt-1 text-sm text-slate-500">
                Select your business model first. We customize your dashboard and tools automatically.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              
              {/* Step 1: Category Selection Cards */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Step 1: Choose Business Category <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">Select one</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Shop Option Card */}
                  <div
                    onClick={() => handleCategorySelect('shop')}
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                      category === 'shop'
                        ? 'border-primary bg-blue-50/40 shadow-sm ring-2 ring-primary/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {category === 'shop' && (
                      <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        category === 'shop' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Shop / Retail Store</h3>
                        <p className="text-[11px] font-medium text-blue-600">Includes Inventory</p>
                      </div>
                    </div>
                  </div>

                  {/* Service Option Card */}
                  <div
                    onClick={() => handleCategorySelect('service')}
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                      category === 'service'
                        ? 'border-[#007F7C] bg-[#E6F5F5]/60 shadow-sm ring-2 ring-[#007F7C]/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {category === 'service' && (
                      <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#007F7C] text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        category === 'service' ? 'bg-[#007F7C] text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Scissors className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Service Provider</h3>
                        <p className="text-[11px] font-medium text-[#007F7C]">Zero Inventory · Rate Card</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Personal & Business Fields */}
              <div className="space-y-4 pt-1 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="biz-name" className="text-xs font-semibold text-slate-800">
                      Business / Shop / Studio Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="biz-name"
                      placeholder={category === 'service' ? 'e.g. Mastercraft Tailors' : 'e.g. Sharma Kirana Store'}
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="h-10 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="owner-name" className="text-xs font-semibold text-slate-800">
                      Owner / Professional Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="owner-name"
                      placeholder="e.g. Rajesh Kumar"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="h-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-phone" className="text-xs font-semibold text-slate-800">
                      Mobile Number (+91) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-xs font-semibold text-slate-800">
                      Email Address (Optional)
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="owner@business.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-pass" className="text-xs font-semibold text-slate-800">
                    Create Password
                  </Label>
                  <Input
                    id="reg-pass"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              {/* Submit & Navigation */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-11 text-sm font-semibold transition-all shadow-md ${
                    category === 'service'
                      ? 'bg-[#007F7C] hover:bg-[#006663] text-white'
                      : 'bg-primary hover:bg-primary-hover text-white'
                  }`}
                >
                  {loading ? 'Setting up workspace...' : `Create ${category === 'service' ? 'Service Professional' : 'Shop'} Account`}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-center text-xs text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-primary hover:underline">
                    Sign in to your account
                  </Link>
                </div>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
