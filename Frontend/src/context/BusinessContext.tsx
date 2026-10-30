import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  productsData as defaultProducts, Product,
  customersData as defaultCustomers, Customer,
  allSales as defaultSales, Sale, PaymentMode, SaleStatus,
} from '@/data/mock-data';

export type BusinessCategory = 'shop' | 'service';

export interface UserProfile {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  category: BusinessCategory;
  subCategory: string;
  avatar: string;
  logoUrl?: string;
  address?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  pricingType: 'Fixed' | 'Hourly' | 'Per Unit' | 'Inspection Fee';
  price: number;
  duration: string;
  description: string;
  isAvailable: boolean;
}

export interface ServiceJob {
  id: string;
  customerName: string;
  phone: string;
  serviceName: string;
  amount: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Delivered';
  date: string;
  dueDate: string;
  notes?: string;
}

export interface CustomerDueItem {
  id: string;
  customerName: string;
  serviceId?: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  dueDate: string;
  date: string;
  status: 'Pending' | 'Paid' | 'Overdue';
  notes?: string;
}

export const DG_FASHION_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2309090b"/><stop offset="50%" stop-color="%2318181b"/><stop offset="100%" stop-color="%2327272a"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23d97706"/><stop offset="100%" stop-color="%23fbbf24"/></linearGradient></defs><rect width="200" height="200" rx="44" fill="url(%23bg)"/><rect x="8" y="8" width="184" height="184" rx="36" fill="none" stroke="url(%23gold)" stroke-width="2.5" opacity="0.7"/><circle cx="100" cy="82" r="44" fill="%23ffffff" fill-opacity="0.06"/><text x="100" y="96" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="44" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="1">DG</text><text x="100" y="142" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="13" font-weight="800" fill="%23fbbf24" text-anchor="middle" letter-spacing="4">FASHION</text><text x="100" y="162" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="8" font-weight="700" fill="%23a1a1aa" text-anchor="middle" letter-spacing="2">EST. 2026 • STUDIO</text></svg>`;

export const DEFAULT_STORE_LOGO = DG_FASHION_LOGO_SVG;

// Preset personas for quick testing & demo
export const DEMO_USERS: Record<string, UserProfile> = {
  shop_sharma: {
    id: 'user-shop-1',
    name: 'Dinesh G',
    businessName: 'DG FASHION',
    phone: '8639838847',
    email: 'contact@dgfashion.in',
    category: 'shop',
    subCategory: 'Fashion & Apparel Retail',
    avatar: 'DG',
    logoUrl: DEFAULT_STORE_LOGO,
    address: 'Shop 14, Main Market, Sector 18',
  },
  service_tailor: {
    id: 'user-service-1',
    name: 'Rajesh Kumar',
    businessName: 'Mastercraft Tailors & Boutique',
    phone: '+91 98765 43210',
    email: 'rajesh.tailors@example.com',
    category: 'service',
    subCategory: 'Tailor & Designer Boutique',
    avatar: 'RK',
    logoUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=250&auto=format&fit=crop&q=80',
    address: 'Shop 7, Gandhi Road, Karol Bagh, Delhi',
  },
  service_plumber: {
    id: 'user-service-2',
    name: 'Amit Verma',
    businessName: 'QuickFix Plumbing & Sanitation',
    phone: '+91 98111 22334',
    email: 'amit.plumbing@example.com',
    category: 'service',
    subCategory: 'Plumber & Sanitary Specialist',
    avatar: 'AV',
    logoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=250&auto=format&fit=crop&q=80',
    address: 'Plot 42, Green Park Extension, New Delhi',
  },
};

const INITIAL_SERVICES: ServiceItem[] = [];

const INITIAL_JOBS: ServiceJob[] = [];

const INITIAL_SERVICE_CUSTOMERS: Customer[] = [];
const INITIAL_SHOP_DUES: CustomerDueItem[] = [];

const INITIAL_SERVICE_DUES: CustomerDueItem[] = [];

const INITIAL_SERVICE_SALES: Sale[] = [];

interface BusinessContextType {
  user: UserProfile;
  category: BusinessCategory;
  services: ServiceItem[];
  serviceJobs: ServiceJob[];
  products: Product[];
  customers: Customer[];
  customerDues: CustomerDueItem[];
  sales: Sale[];
  setCategory: (category: BusinessCategory) => void;
  toggleCategory: () => void;
  loginUser: (profile: UserProfile) => void;
  logoutUser: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  registerUser: (data: {
    name: string;
    businessName: string;
    phone: string;
    email: string;
    category: BusinessCategory;
    subCategory: string;
    logoUrl?: string;
    address?: string;
  }) => UserProfile;
  loadDemoUser: (key: keyof typeof DEMO_USERS) => void;
  addService: (service: Omit<ServiceItem, 'id'>) => ServiceItem;
  updateService: (id: string, service: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  addServiceJob: (job: Omit<ServiceJob, 'id'>) => ServiceJob;
  updateJobStatus: (id: string, status: ServiceJob['status']) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (name: string) => void;
  updateProductStock: (name: string, newStock: number) => void;
  addCustomerDue: (due: {
    customerName: string;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    dueDate: string;
    notes?: string;
  }) => CustomerDueItem;
  markDuePaid: (dueId: string) => void;
  getDuesForCustomer: (customerName: string) => CustomerDueItem[];
  addSale: (sale: {
    productName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    mode: PaymentMode;
    status?: SaleStatus;
    customer?: string;
  }) => Sale;
  addCustomer: (customer: {
    name: string;
    phone: string;
    email?: string;
    category?: string;
  }) => Promise<void>;
  refreshData: () => Promise<void>;
  isSyncing: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'cashiko_user',
  SERVICES: 'cashiko_services',
  JOBS: 'cashiko_jobs',
  PRODUCTS: 'cashiko_products',
  CUSTOMERS: 'cashiko_customers',
  SHOP_DUES: 'cashiko_shop_dues',
  SERVICE_DUES: 'cashiko_service_dues',
  SHOP_SALES: 'cashiko_shop_sales',
  SERVICE_SALES: 'cashiko_service_sales',
};

// Purge legacy cached dummy grocery, services, and old test items
if (typeof window !== 'undefined') {
  const SYNC_VERSION = 'cashiko_v7_fresh_start';
  if (localStorage.getItem(SYNC_VERSION) !== 'true') {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('cashiko_user');
    localStorage.removeItem('cashiko_registered_user');
    localStorage.removeItem('cashiko_accounts');
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.JOBS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SHOP_DUES);
    localStorage.removeItem(STORAGE_KEYS.SHOP_SALES);
    localStorage.removeItem(STORAGE_KEYS.SERVICE_DUES);
    localStorage.removeItem(STORAGE_KEYS.SERVICE_SALES);
    localStorage.setItem(SYNC_VERSION, 'true');
  }
}

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load user
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.phone) {
          if (!parsed.logoUrl || parsed.logoUrl.includes('unsplash.com')) {
            parsed.logoUrl = DEFAULT_STORE_LOGO;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return {
      id: '',
      name: '',
      businessName: '',
      phone: '',
      email: '',
      category: 'shop',
      subCategory: '',
      avatar: 'CS',
      logoUrl: DEFAULT_STORE_LOGO,
      address: '',
    };
  });

  // Services state
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SERVICES;
  });

  // Service jobs state
  const [serviceJobs, setServiceJobs] = useState<ServiceJob[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_JOBS;
  });

  // Products state (for shops)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultProducts;
  });

  // Unified Customers state (backed directly by SQLite database)
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Shop Customer Dues state
  const [shopDues, setShopDues] = useState<CustomerDueItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOP_DUES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SHOP_DUES;
  });

  // Service Customer Dues state
  const [serviceDues, setServiceDues] = useState<CustomerDueItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICE_DUES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SERVICE_DUES;
  });

  // Shop sales state
  const [shopSales, setShopSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOP_SALES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultSales;
  });

  // Service sales state
  const [serviceSales, setServiceSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICE_SALES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SERVICE_SALES;
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Live database refresh function
  const refreshData = useCallback(async () => {
    try {
      setIsSyncing(true);

      // 0. Fetch Merchant Profile directly from SQLite DB for the active user
      try {
        const activeIdentifier = user?.phone || user?.email;
        if (activeIdentifier) {
          const profile = await api.settings.getMerchantProfile(activeIdentifier);
          if (profile && profile.business_name) {
            setUser(prev => ({
              ...prev,
              businessName: profile.business_name || prev.businessName,
              name: profile.owner_name || prev.name,
              phone: profile.phone || prev.phone,
              email: profile.email || prev.email,
              category: (profile.category as BusinessCategory) || prev.category,
              subCategory: profile.sub_category || prev.subCategory,
              logoUrl: (profile.logo_url && !profile.logo_url.includes('unsplash.com')) ? profile.logo_url : (prev.logoUrl || DEFAULT_STORE_LOGO),
              avatar: profile.owner_name ? profile.owner_name.slice(0, 2).toUpperCase() : prev.avatar,
            }));
          }
        }
      } catch (profileErr) {
        console.warn('Merchant profile not found or offline:', profileErr);
      }

      // 1. Fetch Customers directly from SQLite DB
      const dbCustomers = await api.customers.list();
      if (Array.isArray(dbCustomers)) {
        const mapped: Customer[] = dbCustomers.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone || '',
          email: c.email || '',
          category: c.category || 'both',
          totalPurchases: Number(c.total_purchases) || 0,
          outstanding: Number(c.outstanding) || 0,
          behaviour: (c.behaviour as any) || 'Good',
          riskScore: Number(c.risk_score) || 20,
          lastVisit: c.last_visit || 'Recent',
        }));
        setCustomers(mapped);
      }

      // 2. Fetch Catalog Items directly from SQLite DB
      const dbCatalog = await api.catalog.list();
      if (Array.isArray(dbCatalog) && dbCatalog.length > 0) {
        const dbServices: ServiceItem[] = dbCatalog
          .filter((i: any) => i.category_type === 'service')
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            category: s.sub_category || 'Service',
            pricingType: s.pricing_type || 'Fixed',
            price: Number(s.price) || 0,
            duration: s.duration || '1-2 days',
            description: s.description || '',
            isAvailable: s.is_available ?? true,
          }));
        if (dbServices.length > 0) setServices(dbServices);

        const dbProducts: Product[] = dbCatalog
          .filter((i: any) => i.category_type === 'shop')
          .map((p: any) => ({
            name: p.name,
            category: p.sub_category || 'Retail',
            stock: Number(p.stock_quantity) || 0,
            unit: 'pcs',
            reorderLevel: 5,
            costPrice: Math.round((Number(p.price) || 0) * 0.6),
            sellingPrice: Number(p.price) || 0,
            status: (Number(p.stock_quantity) || 0) <= 0 ? 'Critical' : (Number(p.stock_quantity) || 0) <= 5 ? 'Low Stock' : 'In Stock',
          }));
        if (dbProducts.length > 0) setProducts(dbProducts);
      }

      // 3. Fetch Sales & Dues directly from SQLite DB
      const dbSales = await api.sales.list();
      if (Array.isArray(dbSales)) {
        // Strictly isolate shop sales from service sales
        const shopOnlySales: Sale[] = dbSales
          .filter((s: any) => (s.category_type || 'shop').toLowerCase() === 'shop')
          .map((s: any) => ({
            id: s.id.startsWith('INV-') ? s.id : `INV-${s.id.slice(0, 6).toUpperCase()}`,
            customer: s.customer_name,
            items: s.item_name,
            amount: Number(s.total_amount) || 0,
            mode: (s.payment_mode === 'PAYPAL' ? 'PayPal' : s.payment_mode === 'CREDIT' ? 'Credit' : s.payment_mode === 'UPI' ? 'UPI' : 'Cash') as PaymentMode,
            status: (s.status === 'PAID' || s.status === 'COMPLETED' || s.status === 'DELIVERED' ? 'Paid' : s.status === 'OVERDUE' ? 'Overdue' : 'Pending') as SaleStatus,
            date: s.date || 'Today',
            dueDate: s.due_date,
          }));

        const serviceOnlySales: Sale[] = dbSales
          .filter((s: any) => (s.category_type || '').toLowerCase() === 'service')
          .map((s: any) => ({
            id: s.id.startsWith('INV-') ? s.id : `INV-${s.id.slice(0, 6).toUpperCase()}`,
            customer: s.customer_name,
            items: s.item_name,
            amount: Number(s.total_amount) || 0,
            mode: (s.payment_mode === 'PAYPAL' ? 'PayPal' : s.payment_mode === 'CREDIT' ? 'Credit' : s.payment_mode === 'UPI' ? 'UPI' : 'Cash') as PaymentMode,
            status: (s.status === 'PAID' || s.status === 'COMPLETED' || s.status === 'DELIVERED' ? 'Paid' : s.status === 'OVERDUE' ? 'Overdue' : 'Pending') as SaleStatus,
            date: s.date || 'Today',
            dueDate: s.due_date,
          }));

        setShopSales(shopOnlySales);
        setServiceSales(serviceOnlySales);

        // Map credit/pending sales to CustomerDueItem strictly per category
        const creditSales = dbSales.filter((s: any) => s.payment_mode === 'CREDIT' || s.status === 'PENDING' || s.status === 'OVERDUE');

        const shopOnlyDues: CustomerDueItem[] = creditSales
          .filter((s: any) => (s.category_type || 'shop').toLowerCase() === 'shop')
          .map((s: any) => ({
            id: s.id,
            customerName: s.customer_name,
            serviceName: s.item_name,
            quantity: Number(s.quantity) || 1,
            unitPrice: Number(s.unit_price) || Number(s.total_amount) || 0,
            totalAmount: Number(s.total_amount) || 0,
            dueDate: s.due_date || '18 Oct 2026',
            date: s.date || 'Today',
            status: (s.status === 'PAID' || s.status === 'COMPLETED' ? 'Paid' : s.status === 'OVERDUE' ? 'Overdue' : 'Pending') as any,
            notes: s.notes,
          }));

        const serviceOnlyDues: CustomerDueItem[] = creditSales
          .filter((s: any) => (s.category_type || '').toLowerCase() === 'service')
          .map((s: any) => ({
            id: s.id,
            customerName: s.customer_name,
            serviceName: s.item_name,
            quantity: Number(s.quantity) || 1,
            unitPrice: Number(s.unit_price) || Number(s.total_amount) || 0,
            totalAmount: Number(s.total_amount) || 0,
            dueDate: s.due_date || '18 Oct 2026',
            date: s.date || 'Today',
            status: (s.status === 'PAID' || s.status === 'COMPLETED' ? 'Paid' : s.status === 'OVERDUE' ? 'Overdue' : 'Pending') as any,
            notes: s.notes,
          }));

        setShopDues(shopOnlyDues);
        setServiceDues(serviceOnlyDues);
      }
    } catch (e) {
      console.warn('Backend sync initializing or offline:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Run backend sync on startup
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Sync to local storage & set theme attribute on document root
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-category', user.category);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(serviceJobs));
  }, [serviceJobs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOP_DUES, JSON.stringify(shopDues));
  }, [shopDues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICE_DUES, JSON.stringify(serviceDues));
  }, [serviceDues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOP_SALES, JSON.stringify(shopSales));
  }, [shopSales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICE_SALES, JSON.stringify(serviceSales));
  }, [serviceSales]);

  const setCategory = (cat: BusinessCategory) => {
    setUser((prev) => ({
      ...prev,
      category: cat,
      subCategory: cat === 'service' ? 'Tailor / Plumber / Services' : 'Kirana & Retail Store',
    }));
  };

  const toggleCategory = () => {
    // Mode toggle is disabled: A user remains strictly in their registered business mode
    console.warn('Mode switching is disabled. A business operates in its registered mode.');
  };

  const loginUser = (profile: UserProfile) => {
    setUser(profile);
  };

  const logoutUser = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('cashiko_user');
    localStorage.removeItem('cashiko_registered_user');
    setUser({
      id: '',
      name: '',
      businessName: '',
      phone: '',
      email: '',
      category: 'shop',
      subCategory: '',
      avatar: 'CS',
      logoUrl: DEFAULT_STORE_LOGO,
      address: '',
    });
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    setUser((prev) => {
      const updated: UserProfile = {
        ...prev,
        ...updates,
        avatar: updates.name
          ? updates.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'CS'
          : prev.avatar,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Keep multi-account registry in cashiko_accounts synchronized
    try {
      const rawAccounts = localStorage.getItem('cashiko_accounts');
      if (rawAccounts) {
        const accounts = JSON.parse(rawAccounts);
        const updatedAccounts = accounts.map((acc: any) => {
          if (
            (user.id && acc.id === user.id) ||
            (user.phone && acc.phone === user.phone) ||
            (user.email && acc.email === user.email)
          ) {
            return {
              ...acc,
              ...updates,
              name: updates.name ?? acc.name,
              businessName: updates.businessName ?? acc.businessName,
              phone: updates.phone ?? acc.phone,
              email: updates.email ?? acc.email,
              address: updates.address ?? acc.address,
            };
          }
          return acc;
        });
        localStorage.setItem('cashiko_accounts', JSON.stringify(updatedAccounts));
      }
    } catch (e) {
      console.error('Failed to sync accounts in localStorage:', e);
    }

    // Persist to SQLite DB via API
    try {
      await api.settings.updateMerchantProfile({
        id: user.id || undefined,
        business_name: updates.businessName ?? user.businessName,
        owner_name: updates.name ?? user.name,
        phone: updates.phone ?? user.phone,
        email: updates.email ?? user.email,
        category: updates.category ?? user.category,
        sub_category: updates.subCategory ?? user.subCategory,
        logo_url: updates.logoUrl ?? user.logoUrl,
        address: updates.address ?? user.address,
      });
    } catch (err) {
      console.warn('Backend profile update failed:', err);
    }
  };

  const loadDemoUser = (key: keyof typeof DEMO_USERS) => {
    if (DEMO_USERS[key]) {
      setUser(DEMO_USERS[key]);
    }
  };

  const registerUser = (data: {
    name: string;
    businessName: string;
    phone: string;
    email: string;
    category: BusinessCategory;
    subCategory: string;
    logoUrl?: string;
    address?: string;
  }): UserProfile => {
    const initials = data.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'CS';

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name,
      businessName: data.businessName,
      phone: data.phone,
      email: data.email,
      category: data.category,
      subCategory: data.subCategory || (data.category === 'shop' ? 'Fashion & Apparel Retail' : 'Service Provider'),
      avatar: initials,
      logoUrl: data.logoUrl,
      address: data.address || '',
    };
    setUser(newUser);
    return newUser;
  };

  const addService = (newService: Omit<ServiceItem, 'id'>): ServiceItem => {
    const created: ServiceItem = {
      ...newService,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [created, ...prev]);

    // Persist to SQLite DB
    api.catalog.create({
      name: newService.name,
      category_type: 'service',
      sub_category: newService.category,
      pricing_type: newService.pricingType,
      price: newService.price,
      duration: newService.duration,
      description: newService.description,
      is_available: newService.isAvailable,
    }).then(() => refreshData()).catch((e) => console.error('Failed to persist service to DB:', e));

    return created;
  };

  const updateService = (id: string, updatedFields: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
    api.catalog.update(id, updatedFields).then(() => refreshData()).catch((e) => console.error(e));
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((item) => item.id !== id));
    api.catalog.delete(id).then(() => refreshData()).catch((e) => console.error(e));
  };

  const addServiceJob = (job: Omit<ServiceJob, 'id'>): ServiceJob => {
    const created: ServiceJob = {
      ...job,
      id: `JOB-${Math.floor(100 + Math.random() * 900)}`,
    };
    setServiceJobs((prev) => [created, ...prev]);

    // Persist as sale record
    api.sales.create({
      customer_name: job.customerName,
      customer_phone: job.phone,
      category_type: 'service',
      item_name: job.serviceName,
      quantity: 1.0,
      unit_price: job.amount,
      total_amount: job.amount,
      payment_mode: 'CREDIT',
      status: job.status.toUpperCase(),
      date: job.date || 'Today',
      due_date: job.dueDate,
      notes: job.notes,
    }).then(() => refreshData()).catch((e) => console.error(e));

    return created;
  };

  const updateJobStatus = (id: string, status: ServiceJob['status']) => {
    setServiceJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, status } : job))
    );
    api.sales.update(id, { status: status.toUpperCase() }).then(() => refreshData()).catch((e) => console.error(e));
  };

  const addProduct = (prod: Product) => {
    setProducts((prev) => [prod, ...prev]);
    // Persist to DB
    api.catalog.create({
      name: prod.name,
      category_type: 'shop',
      sub_category: prod.category,
      pricing_type: 'Per Unit',
      price: prod.sellingPrice,
      stock_quantity: Math.round(prod.stock),
      description: `Stock: ${prod.stock} ${prod.unit}`,
    }).then(() => refreshData()).catch((e) => console.error('Failed to persist product to DB:', e));
  };

  const deleteProduct = (name: string) => {
    setProducts((prev) => prev.filter((p) => p.name !== name));
    api.catalog.list('shop').then((items) => {
      const match = items.find((i) => i.name.toLowerCase() === name.toLowerCase());
      if (match) api.catalog.delete(match.id).then(() => refreshData());
    }).catch((e) => console.error(e));
  };

  const updateProductStock = (name: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.name === name
          ? {
              ...p,
              stock: Math.max(0, newStock),
              status: newStock <= 0 ? 'Critical' : newStock <= p.reorderLevel ? 'Low Stock' : 'In Stock',
            }
          : p
      )
    );
    api.catalog.list('shop').then((items) => {
      const match = items.find((i) => i.name.toLowerCase() === name.toLowerCase());
      if (match) api.catalog.update(match.id, { stock_quantity: Math.max(0, Math.round(newStock)) }).then(() => refreshData());
    }).catch((e) => console.error(e));
  };

  const isService = user.category === 'service';
  const activeCustomers = customers.filter((c) => {
    const cat = (c.category || 'both').toLowerCase();
    return isService ? (cat === 'service' || cat === 'both') : (cat === 'shop' || cat === 'both');
  });
  const activeDues = isService ? serviceDues : shopDues;
  const activeSales = isService ? serviceSales : shopSales;

  const addCustomer = async (data: {
    name: string;
    phone: string;
    email?: string;
    category?: string;
  }) => {
    const custCat = data.category || (user.category === 'service' ? 'service' : 'shop');
    const optimistic: Customer = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      category: custCat,
      totalPurchases: 0.0,
      outstanding: 0.0,
      behaviour: 'Good',
      riskScore: 20,
      lastVisit: 'Today',
    };
    // Optimistic immediate update so customer never vanishes!
    setCustomers((prev) => [optimistic, ...prev.filter(c => c.name.toLowerCase() !== data.name.trim().toLowerCase())]);

    try {
      const created = await api.customers.create({
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        category: custCat,
        total_purchases: 0.0,
        outstanding: 0.0,
        credit_limit: 5000.0,
        behaviour: 'Good',
        risk_score: 20,
        last_visit: 'Today',
      });
      if (created && created.id) {
        setCustomers((prev) =>
          prev.map((c) => (c.name.toLowerCase() === created.name.toLowerCase() ? { ...c, id: created.id } : c))
        );
      }
      await refreshData();
    } catch (e) {
      console.error('Failed to create customer in DB:', e);
      await refreshData();
      throw e;
    }
  };

  const addCustomerDue = (due: {
    customerName: string;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    dueDate: string;
    notes?: string;
  }): CustomerDueItem => {
    const today = '14 Oct 2026';
    const isServiceMode = user.category === 'service';
    const newDue: CustomerDueItem = {
      id: `DUE-${isServiceMode ? 'SV' : 'SH'}${Math.floor(100 + Math.random() * 900)}`,
      customerName: due.customerName,
      serviceName: due.serviceName,
      quantity: due.quantity,
      unitPrice: due.unitPrice,
      totalAmount: due.totalAmount,
      dueDate: due.dueDate || '18 Oct 2026',
      date: today,
      status: 'Pending',
      notes: due.notes,
    };

    if (isServiceMode) {
      setServiceDues((prev) => [newDue, ...prev]);
    } else {
      setShopDues((prev) => [newDue, ...prev]);
    }

    // Persist as a credit sale in the database
    api.sales.create({
      customer_name: due.customerName,
      category_type: user.category,
      item_name: due.serviceName,
      quantity: due.quantity,
      unit_price: due.unitPrice,
      total_amount: due.totalAmount,
      payment_mode: 'CREDIT',
      status: 'PENDING',
      due_date: due.dueDate || '18 Oct 2026',
      date: today,
      notes: due.notes,
    }).then(() => refreshData()).catch((e) => console.error('Failed to persist customer due to DB:', e));

    return newDue;
  };

  const markDuePaid = (dueId: string) => {
    // Optimistic local state update
    setServiceDues((prev) =>
      prev.map((d) => (d.id === dueId ? { ...d, status: 'Paid' } : d))
    );
    setShopDues((prev) =>
      prev.map((d) => (d.id === dueId ? { ...d, status: 'Paid' } : d))
    );

    // Persist to backend
    api.sales.update(dueId, { status: 'PAID' })
      .then(() => refreshData())
      .catch((e) => {
        console.error('Failed to mark due paid on DB:', e);
        refreshData();
      });
  };

  const getDuesForCustomer = (customerName: string): CustomerDueItem[] => {
    const uniqueMap = new Map<string, CustomerDueItem>();
    for (const d of activeDues) {
      if (!uniqueMap.has(d.id)) {
        uniqueMap.set(d.id, d);
      }
    }
    return Array.from(uniqueMap.values()).filter(
      (d) => d.customerName.toLowerCase() === customerName.toLowerCase()
    );
  };

  const addSale = (newSale: {
    productName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    mode: PaymentMode;
    status?: SaleStatus;
    customer?: string;
  }): Sale => {
    const isServiceSale = user.category === 'service';
    const saleId = `INV-${Date.now().toString().slice(-6)}`;
    const saleItem: Sale = {
      id: saleId,
      customer: newSale.customer || (isServiceSale ? 'Client Walk-in' : 'Counter Sale'),
      items: `${newSale.productName} (${newSale.quantity} units)`,
      amount: newSale.totalAmount,
      mode: newSale.mode || 'Cash',
      status: newSale.status || 'Paid',
      date: '14 Oct 2026',
    };

    if (isServiceSale) {
      setServiceSales((prev) => [saleItem, ...prev]);
    } else {
      setShopSales((prev) => [saleItem, ...prev]);
    }

    // Persist to SQLite DB via /api/v1/sales
    api.sales.create({
      customer_name: newSale.customer || (isServiceSale ? 'Client Walk-in' : 'Counter Sale'),
      category_type: user.category,
      item_name: newSale.productName,
      quantity: newSale.quantity,
      unit_price: newSale.unitPrice,
      total_amount: newSale.totalAmount,
      payment_mode: newSale.mode.toUpperCase(),
      status: (newSale.status || (newSale.mode === 'Credit' ? 'PENDING' : 'PAID')).toUpperCase(),
      date: '14 Oct 2026',
    }).then(() => refreshData()).catch((e) => console.error('Failed to persist sale to DB:', e));

    return saleItem;
  };

  return (
    <BusinessContext.Provider
      value={{
        user,
        category: user.category,
        services,
        serviceJobs,
        products,
        customers: activeCustomers,
        customerDues: activeDues,
        sales: activeSales,
        setCategory,
        toggleCategory,
        loginUser,
        logoutUser,
        updateUserProfile,
        registerUser,
        loadDemoUser,
        addService,
        updateService,
        deleteService,
        addServiceJob,
        updateJobStatus,
        addProduct,
        deleteProduct,
        updateProductStock,
        addCustomerDue,
        markDuePaid,
        getDuesForCustomer,
        addSale,
        addCustomer,
        refreshData,
        isSyncing,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
