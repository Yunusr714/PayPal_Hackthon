import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Store, Scissors, Image as ImageIcon
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

export function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser } = useBusiness();

  const [category, setCategoryState] = useState<BusinessCategory>('shop');
  const [subCategory, setSubCategory] = useState('Fashion & Apparel Retail');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCategorySelect = (selectedCat: BusinessCategory) => {
    setCategoryState(selectedCat);
    if (selectedCat === 'shop') {
      setSubCategory('Fashion & Apparel Retail');
    } else {
      setSubCategory('Tailoring & Boutique');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size too large', { description: 'Please choose an image under 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
        toast.success('Company logo preview loaded!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim() || !ownerName.trim() || !phone.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      toast.error('Passwords do not match', { description: 'Please make sure both passwords match.' });
      return;
    }

    setLoading(true);
    try {
      const bName = businessName.trim();
      const oName = ownerName.trim();
      const pNum = phone.trim();
      const em = email.trim() || `${ownerName.toLowerCase().replace(/\s+/g, '')}@business.in`;
      const lUrl = logoUrl.trim() || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=250&auto=format&fit=crop&q=80';

      // 1. Persist directly to SQLite database
      await api.settings.updateMerchantProfile({
        business_name: bName,
        owner_name: oName,
        phone: pNum,
        email: em,
        category,
        sub_category: subCategory,
        password: password.trim() || 'password123',
        logo_url: lUrl,
      });

      // 2. Update BusinessContext
      const newUser = registerUser({
        name: oName,
        businessName: bName,
        phone: pNum,
        email: em,
        category,
        subCategory,
        logoUrl: lUrl,
      });

      // 3. Persist credentials in multi-account storage
      const registeredAccount = {
        name: oName,
        businessName: bName,
        phone: pNum,
        email: em,
        password: password.trim() || 'password123',
        category,
        subCategory,
        logoUrl: lUrl,
      };

      try {
        const existingRaw = localStorage.getItem('cashiko_accounts');
        let accountsList: any[] = existingRaw ? JSON.parse(existingRaw) : [];
        if (!Array.isArray(accountsList)) accountsList = [];
        // Remove duplicate matching phone or email
        accountsList = accountsList.filter((a: any) => a.phone !== pNum && a.email !== em);
        accountsList.push(registeredAccount);
        localStorage.setItem('cashiko_accounts', JSON.stringify(accountsList));
        localStorage.setItem('cashiko_registered_user', JSON.stringify(registeredAccount));
      } catch (storageErr) {
        console.error(storageErr);
      }

      toast.success(`Welcome to Cashiko, ${newUser.name}!`, {
        description: `Your ${category === 'service' ? 'Service Specialist' : 'Fashion Retail Shop'} workspace is ready.`,
      });

      // Navigate based on registered user mode
      if (category === 'service') {
        navigate('/services');
      } else {
        navigate('/inventory');
      }
    } catch (err: any) {
      toast.error('Registration error', { description: err.message });
    } finally {
      setLoading(false);
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

      {/* ================= RIGHT SIGNUP FORM PANEL (50%) ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 xl:px-20 py-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
        

          {/* Heading & Subtitle */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Sign Up</h1>
          </div>

          {/* Business Mode Segmented Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Select Your Business Mode
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl border border-zinc-200/70 dark:border-zinc-700/60">
              <button
                type="button"
                onClick={() => handleCategorySelect('shop')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  category === 'shop'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Store className="h-4 w-4 text-[#2E7D32]" />
                Retail / Shop
              </button>
              <button
                type="button"
                onClick={() => handleCategorySelect('service')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  category === 'service'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Scissors className="h-4 w-4 text-[#2E7D32]" />
                Service
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
              />
            </div>

            {/* Business Name Field */}
            <div className="space-y-1.5">
              <label htmlFor="reg-business-name" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                id="reg-business-name"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={category === 'service' ? 'e.g. Mastercraft Tailors & Designers' : 'e.g. Vogue Style Studio'}
                className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
              />
            </div>

            {/* Two Columns: Owner Name & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="reg-owner-name" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-owner-name"
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-phone" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="reg-password" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
              />
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Must be at least 8 characters.</p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="reg-confirm-password" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Confirm Password
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter password again"
                className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
              />
            </div>

            {/* Optional Logo Upload Pill */}
            <div className="pt-1">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/40 cursor-pointer transition-all">
                <div className="flex items-center gap-2.5">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Store logo" className="h-7 w-7 rounded-md object-cover border border-zinc-200" />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-zinc-400" />
                  )}
                  <div className="text-left">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {logoUrl ? 'Custom logo attached' : 'Upload Store Logo (Optional)'}
                    </p>
                    <p className="text-[10px] text-zinc-400">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#2E7D32] hover:underline">
                  {logoUrl ? 'Change' : 'Browse'}
                </span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#2E7D32] hover:bg-[#25632A] text-white font-medium rounded-lg text-sm transition-all duration-200 shadow-sm flex items-center justify-center cursor-pointer active:scale-[0.99] disabled:opacity-70 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#2E7D32] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
