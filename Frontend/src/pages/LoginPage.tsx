import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Lock, Mail, Phone, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useBusiness, BusinessCategory } from '@/context/BusinessContext';
import { api } from '@/lib/api';

// Handcrafted Cashiko Brand Icon matching the template's green hexagon mark
function CashikoBrandMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-lg bg-[#2E7D32] text-white shadow-xs ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
        <path
          d="M12 2L4 6.5V17.5L12 22L20 17.5V6.5L12 2Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 7V17M7.5 9.5L16.5 14.5M16.5 9.5L7.5 14.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// 7 Representative Customer Avatars for Testimonial Row
const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
];

export function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useBusiness();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const ident = identifier.trim();
    if (!ident) {
      toast.error('Please enter your email or phone number');
      return;
    }

    setLoading(true);

    try {
      // 1. Primary check: Query backend database via /settings/merchant/login
      try {
        const backendRes = await api.settings.loginMerchant(ident, password.trim() || undefined);
        if (backendRes && backendRes.merchant) {
          const m = backendRes.merchant;
          const userCategory: BusinessCategory = (m.category || 'shop').toLowerCase() === 'service' ? 'service' : 'shop';

          loginUser({
            id: m.id,
            name: m.owner_name,
            businessName: m.business_name,
            phone: m.phone,
            email: m.email || `${m.owner_name.toLowerCase()}@business.in`,
            category: userCategory,
            subCategory: m.sub_category || (userCategory === 'service' ? 'Tailoring & Boutique' : 'Fashion & Apparel Retail'),
            avatar: (m.owner_name || 'CS').slice(0, 2).toUpperCase(),
            logoUrl: m.logo_url,
            address: m.address || '',
          });

          toast.success(`Welcome back, ${m.owner_name}!`, {
            description: `Signed in to ${m.business_name} (${userCategory === 'service' ? 'Service Specialist' : 'Fashion Retail Shop'}).`,
          });

          setLoading(false);
          // Navigate based on user mode
          if (userCategory === 'service') {
            navigate('/services');
          } else {
            navigate('/inventory');
          }
          return;
        }
      } catch (backendErr: any) {
        console.warn('Backend authentication response:', backendErr);
        // If password explicitly failed on backend, display error
        if (backendErr?.message && backendErr.message.includes('401')) {
          setLoading(false);
          setErrorMsg('Incorrect password. Please verify your credentials.');
          toast.error('Authentication failed: Incorrect password');
          return;
        }
      }

      // 2. Secondary check: Multi-account registry in localStorage (cashiko_accounts)
      const existingAccountsRaw = localStorage.getItem('cashiko_accounts');
      let accountsList: any[] = [];
      if (existingAccountsRaw) {
        try {
          accountsList = JSON.parse(existingAccountsRaw);
        } catch (e) {
          console.error(e);
        }
      }

      const cleanInput = ident.replace(/[^0-9]/g, '');
      const matchedLocal = accountsList.find((acc: any) => {
        const cleanPhone = (acc.phone || '').replace(/[^0-9]/g, '');
        const emailMatch = acc.email && acc.email.toLowerCase() === ident.toLowerCase();
        const phoneMatch = cleanPhone && cleanInput && (cleanPhone.endsWith(cleanInput) || cleanInput.endsWith(cleanPhone));
        return emailMatch || phoneMatch;
      });

      if (matchedLocal) {
        if (matchedLocal.password && password.trim() && matchedLocal.password !== password.trim()) {
          setLoading(false);
          setErrorMsg('Incorrect password. Please try again.');
          toast.error('Authentication failed: Incorrect password');
          return;
        }

        const userCategory: BusinessCategory = (matchedLocal.category || 'shop').toLowerCase() === 'service' ? 'service' : 'shop';

        loginUser({
          id: matchedLocal.id || `user-${Date.now()}`,
          name: matchedLocal.name,
          businessName: matchedLocal.businessName,
          phone: matchedLocal.phone,
          email: matchedLocal.email || `${matchedLocal.name.toLowerCase()}@business.in`,
          category: userCategory,
          subCategory: matchedLocal.subCategory || (userCategory === 'service' ? 'Tailoring & Boutique' : 'Fashion & Apparel Retail'),
          avatar: (matchedLocal.name || 'CS').slice(0, 2).toUpperCase(),
          logoUrl: matchedLocal.logoUrl,
          address: matchedLocal.address || '',
        });

        toast.success(`Welcome back, ${matchedLocal.name}!`, {
          description: `Signed in to ${matchedLocal.businessName} (${userCategory === 'service' ? 'Service Specialist' : 'Fashion Retail Shop'}).`,
        });

        setLoading(false);
        // Navigate based on user mode
        if (userCategory === 'service') {
          navigate('/services');
        } else {
          navigate('/inventory');
        }
        return;
      }

      // 3. Fallback: Check legacy single account key
      const legacyRaw = localStorage.getItem('cashiko_registered_user');
      if (legacyRaw) {
        try {
          const acc = JSON.parse(legacyRaw);
          const cleanPhone = (acc.phone || '').replace(/[^0-9]/g, '');
          const emailMatch = acc.email && acc.email.toLowerCase() === ident.toLowerCase();
          const phoneMatch = cleanPhone && cleanInput && (cleanPhone.endsWith(cleanInput) || cleanInput.endsWith(cleanPhone));

          if (emailMatch || phoneMatch) {
            const userCategory: BusinessCategory = (acc.category || 'shop').toLowerCase() === 'service' ? 'service' : 'shop';
            loginUser({
              id: acc.id || `user-${Date.now()}`,
              name: acc.name,
              businessName: acc.businessName,
              phone: acc.phone,
              email: acc.email,
              category: userCategory,
              subCategory: acc.subCategory || (userCategory === 'service' ? 'Tailoring & Boutique' : 'Fashion & Apparel Retail'),
              avatar: (acc.name || 'CS').slice(0, 2).toUpperCase(),
              logoUrl: acc.logoUrl,
              address: acc.address || '',
            });

            toast.success(`Welcome back, ${acc.name}!`);
            setLoading(false);
            if (userCategory === 'service') {
              navigate('/services');
            } else {
              navigate('/inventory');
            }
            return;
          }
        } catch (e) {}
      }

      // 4. Not found in any registry
      setLoading(false);
      setErrorMsg('No account found with this email or phone. Please sign up to create your account.');
      toast.error('Account not found', { description: 'Please create an account first.' });
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Login failed. Please try again.');
      toast.error('Login error', { description: err.message });
    }
  };



  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#0B0D0E] text-zinc-900 dark:text-zinc-100">
      {/* ================= LEFT VISUAL HERO PANEL (50%) ================= */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900 select-none">
        {/* Lifestyle Background Photo */}
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600&auto=format&fit=crop&q=85"
          alt="Entrepreneur using Cashiko"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Ambient Dark-to-Transparent Gradient for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        {/* Value Proposition & Customer Reviews Overlay at Bottom */}
        <div className="relative z-10 mt-auto p-12 xl:p-16 space-y-6 text-white max-w-xl">
          <h2 className="text-2xl xl:text-3xl font-semibold leading-snug tracking-tight text-white drop-shadow-sm">
            Cashiko increases efficiency, saves time, and improves the service you provide to your customers
          </h2>

          <div className="flex items-center gap-4 pt-2">
            {/* Overlapping Avatars */}
            <div className="flex -space-x-2.5 overflow-hidden">
              {AVATARS.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Customer ${idx + 1}`}
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-white/90 object-cover shadow-sm"
                />
              ))}
            </div>

            {/* Rating Stars and Counter */}
            <div className="flex flex-col">
              <div className="flex items-center text-amber-400 text-sm tracking-wider">
                {'★'.repeat(5)}
              </div>
              <span className="text-xs text-white/90 font-medium">from 100+ reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIGNIN FORM PANEL (50%) ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 xl:px-20 py-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-2.5">
            <CashikoBrandMark />
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Cashiko</span>
          </div>

          {/* Heading & Subtitle */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Sign In</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Welcome back, please enter your details.</p>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Identifier Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Email or Phone Number
              </label>
              <input
                id="login-email"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or phone"
                className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
              />
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-300 text-[#2E7D32] focus:ring-[#2E7D32] h-3.5 w-3.5"
                />
                Remember me
              </label>
              <span className="text-[#2E7D32] hover:underline font-medium cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#2E7D32] hover:bg-[#25632A] text-white font-medium rounded-lg text-sm transition-all duration-200 shadow-sm flex items-center justify-center cursor-pointer active:scale-[0.99] disabled:opacity-70 mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#2E7D32] hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
