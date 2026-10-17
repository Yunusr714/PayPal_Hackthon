import React, { createContext, useContext, useState, useEffect } from 'react';
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

// Preset personas for quick testing & demo
export const DEMO_USERS: Record<string, UserProfile> = {
  shop_sharma: {
    id: 'user-shop-1',
    name: 'Ramesh Sharma',
    businessName: 'Sharma Kirana Store',
    phone: '+91 98100 12345',
    email: 'ramesh.kirana@example.com',
    category: 'shop',
    subCategory: 'Kirana & FMCG Retail',
    avatar: 'RS',
    address: 'Shop 14, Main Market, Sector 18, Noida',
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
    address: 'Plot 42, Green Park Extension, New Delhi',
  },
};

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Men\'s 2-Piece Suit Stitching',
    category: 'Tailoring',
    pricingType: 'Fixed',
    price: 1800,
    duration: '3-4 days',
    description: 'Custom tailored coat and trousers with lining and interior pockets.',
    isAvailable: true,
  },
  {
    id: 'srv-2',
    name: 'Bathroom Pipe Leak Repair & Sealing',
    category: 'Plumbing',
    pricingType: 'Fixed',
    price: 450,
    duration: '1-2 hours',
    description: 'Full inspection of concealed leakages, sealing joint threads & pipe patch.',
    isAvailable: true,
  },
  {
    id: 'srv-3',
    name: 'Designer Blouse Stitching & Embroidery',
    category: 'Tailoring',
    pricingType: 'Fixed',
    price: 750,
    duration: '2 days',
    description: 'Custom pattern cuts with piping, tassels, and inner padding.',
    isAvailable: true,
  },
  {
    id: 'srv-4',
    name: 'Water Tank & Motor Pump Installation',
    category: 'Plumbing',
    pricingType: 'Fixed',
    price: 1250,
    duration: '3 hours',
    description: 'Complete piping, valve check, union connections, and pressure testing.',
    isAvailable: true,
  },
  {
    id: 'srv-5',
    name: 'AC Deep Clean & Jet Pump Wash',
    category: 'Appliance Repair',
    pricingType: 'Fixed',
    price: 1199,
    duration: '2 hours',
    description: 'Indoor coil deep foaming, outdoor condenser pressure wash, gas test.',
    isAvailable: true,
  },
  {
    id: 'srv-6',
    name: 'Troubleshooting & Electrical Wiring',
    category: 'Electrical',
    pricingType: 'Hourly',
    price: 350,
    duration: 'Hourly',
    description: 'MCB tripping, short circuit resolution, switchboard rewiring.',
    isAvailable: true,
  },
  {
    id: 'srv-7',
    name: 'Pant Hemming & Urgent Alterations',
    category: 'Tailoring',
    pricingType: 'Per Unit',
    price: 150,
    duration: '30 mins',
    description: 'Length adjustments, waist alteration, seam tightening.',
    isAvailable: true,
  },
  {
    id: 'srv-8',
    name: 'Tap / Mixer Faucet Replacement',
    category: 'Plumbing',
    pricingType: 'Per Unit',
    price: 250,
    duration: '45 mins',
    description: 'Removal of faulty taps and installation of new brass/quarter-turn bibcocks.',
    isAvailable: true,
  },
];

const INITIAL_JOBS: ServiceJob[] = [
  {
    id: 'JOB-201',
    customerName: 'Sharma Uncle',
    phone: '+91 98100 12345',
    serviceName: 'Men\'s 2-Piece Suit Stitching',
    amount: 1800,
    status: 'In Progress',
    date: '14 Oct 2026',
    dueDate: '18 Oct 2026',
    notes: 'Italian navy fabric, double vent back.',
  },
  {
    id: 'JOB-202',
    customerName: 'Priya Verma',
    phone: '+91 98100 67890',
    serviceName: 'Designer Blouse Stitching',
    amount: 750,
    status: 'Completed',
    date: '13 Oct 2026',
    dueDate: '15 Oct 2026',
    notes: 'Trial done, customer ready for pickup.',
  },
  {
    id: 'JOB-203',
    customerName: 'Anil Kumar',
    phone: '+91 98100 23456',
    serviceName: 'Bathroom Pipe Leak Repair & Sealing',
    amount: 450,
    status: 'Scheduled',
    date: '14 Oct 2026',
    dueDate: '16 Oct 2026',
    notes: 'Visit scheduled for 4:00 PM at sector 14.',
  },
  {
    id: 'JOB-204',
    customerName: 'Sunita Devi',
    phone: '+91 98100 45678',
    serviceName: 'Water Tank & Motor Pump Installation',
    amount: 1250,
    status: 'Delivered',
    date: '11 Oct 2026',
    dueDate: '12 Oct 2026',
    notes: 'Payment collected via UPI.',
  },
  {
    id: 'JOB-205',
    customerName: 'Mohit Jain',
    phone: '+91 98100 90123',
    serviceName: 'AC Deep Clean & Jet Pump Wash',
    amount: 1199,
    status: 'In Progress',
    date: '13 Oct 2026',
    dueDate: '16 Oct 2026',
    notes: 'Split AC 1.5 ton in master bedroom.',
  },
];

const INITIAL_SERVICE_CUSTOMERS: Customer[] = [
  { name: 'Sharma Uncle', phone: '+91 98100 12345', totalPurchases: 2950, outstanding: 1800, behaviour: 'Good', riskScore: 35, lastVisit: '12 Oct 2026' },
  { name: 'Anil Kumar', phone: '+91 98100 23456', totalPurchases: 1250, outstanding: 950, behaviour: 'Fair', riskScore: 68, lastVisit: '04 Oct 2026' },
  { name: 'Priya Verma', phone: '+91 98100 67890', totalPurchases: 1450, outstanding: 750, behaviour: 'Excellent', riskScore: 18, lastVisit: '08 Oct 2026' },
  { name: 'Vikas Mehta', phone: '+91 98100 34567', totalPurchases: 1400, outstanding: 700, behaviour: 'Good', riskScore: 28, lastVisit: '10 Oct 2026' },
  { name: 'Rakesh Yadav', phone: '+91 98100 56789', totalPurchases: 3200, outstanding: 1800, behaviour: 'Poor', riskScore: 82, lastVisit: '20 Sep 2026' },
  { name: 'Sunita Devi', phone: '+91 98100 45678', totalPurchases: 2850, outstanding: 0, behaviour: 'Excellent', riskScore: 8, lastVisit: '11 Oct 2026' },
  { name: 'Mohit Jain', phone: '+91 98100 90123', totalPurchases: 2199, outstanding: 0, behaviour: 'Good', riskScore: 22, lastVisit: '11 Oct 2026' },
  { name: 'Rahul Gupta', phone: '+91 98100 78901', totalPurchases: 1650, outstanding: 0, behaviour: 'Good', riskScore: 25, lastVisit: '09 Oct 2026' },
  { name: 'Neha Singh', phone: '+91 98100 89012', totalPurchases: 950, outstanding: 0, behaviour: 'Excellent', riskScore: 12, lastVisit: '07 Oct 2026' },
  { name: 'Kavita Sharma', phone: '+91 98100 11223', totalPurchases: 1800, outstanding: 0, behaviour: 'Good', riskScore: 30, lastVisit: '05 Oct 2026' },
];

const INITIAL_SHOP_DUES: CustomerDueItem[] = [
  {
    id: 'DUE-SH101',
    customerName: 'Sharma Uncle',
    serviceName: 'Basmati Rice & Tata Salt Combo',
    quantity: 1,
    unitPrice: 340,
    totalAmount: 340,
    dueDate: '18 Oct 2026',
    date: '13 Oct 2026',
    status: 'Pending',
    notes: 'Weekly grocery store credit billing.',
  },
  {
    id: 'DUE-SH102',
    customerName: 'Sharma Uncle',
    serviceName: 'Aashirvaad Shudh Chakki Atta (10kg)',
    quantity: 1,
    unitPrice: 420,
    totalAmount: 420,
    dueDate: '02 Oct 2026',
    date: '25 Sep 2026',
    status: 'Paid',
    notes: 'Settled via cash on 01 Oct.',
  },
  {
    id: 'DUE-SH103',
    customerName: 'Sharma Uncle',
    serviceName: 'Fortune Sunlite Sunflower Oil (2L)',
    quantity: 1,
    unitPrice: 280,
    totalAmount: 280,
    dueDate: '20 Sep 2026',
    date: '15 Sep 2026',
    status: 'Paid',
    notes: 'Paid via UPI.',
  },
  {
    id: 'DUE-SH104',
    customerName: 'Anil Kumar',
    serviceName: 'Dal & Sugar Monthly Combo',
    quantity: 1,
    unitPrice: 450,
    totalAmount: 450,
    dueDate: '07 Oct 2026',
    date: '30 Sep 2026',
    status: 'Overdue',
    notes: 'Reminder sent on WhatsApp.',
  },
  {
    id: 'DUE-SH105',
    customerName: 'Anil Kumar',
    serviceName: 'Wheat Flour & Cooking Oil Ration',
    quantity: 1,
    unitPrice: 800,
    totalAmount: 800,
    dueDate: '16 Oct 2026',
    date: '10 Oct 2026',
    status: 'Pending',
    notes: 'Kitchen ration items.',
  },
  {
    id: 'DUE-SH106',
    customerName: 'Vikas Mehta',
    serviceName: 'Dairy, Milk Packets & Bakery Pack',
    quantity: 1,
    unitPrice: 540,
    totalAmount: 540,
    dueDate: '16 Oct 2026',
    date: '10 Oct 2026',
    status: 'Pending',
    notes: 'Regular weekly credit billing.',
  },
  {
    id: 'DUE-SH107',
    customerName: 'Priya Verma',
    serviceName: 'Tea, Biscuits & Spices Pack',
    quantity: 1,
    unitPrice: 180,
    totalAmount: 180,
    dueDate: '15 Oct 2026',
    date: '11 Oct 2026',
    status: 'Pending',
    notes: 'Snack items.',
  },
  {
    id: 'DUE-SH108',
    customerName: 'Rakesh Yadav',
    serviceName: 'Wholesale Grains & Household Detergent',
    quantity: 1,
    unitPrice: 2100,
    totalAmount: 2100,
    dueDate: '28 Sep 2026',
    date: '15 Sep 2026',
    status: 'Overdue',
    notes: 'Bulk purchase credit.',
  },
];

const INITIAL_SERVICE_DUES: CustomerDueItem[] = [
  {
    id: 'DUE-SV101',
    customerName: 'Sharma Uncle',
    serviceName: "Men's 2-Piece Suit Stitching",
    quantity: 1,
    unitPrice: 1800,
    totalAmount: 1800,
    dueDate: '18 Oct 2026',
    date: '12 Oct 2026',
    status: 'Pending',
    notes: 'Italian navy fabric, balance due on trial.',
  },
  {
    id: 'DUE-SV102',
    customerName: 'Sharma Uncle',
    serviceName: 'Pant Hemming & Urgent Alterations',
    quantity: 2,
    unitPrice: 150,
    totalAmount: 300,
    dueDate: '05 Oct 2026',
    date: '02 Oct 2026',
    status: 'Paid',
    notes: 'Urgent waist fitting. Paid in cash.',
  },
  {
    id: 'DUE-SV103',
    customerName: 'Sharma Uncle',
    serviceName: 'Designer Kurta Stitching',
    quantity: 1,
    unitPrice: 850,
    totalAmount: 850,
    dueDate: '28 Sep 2026',
    date: '22 Sep 2026',
    status: 'Paid',
    notes: 'Festive embroidery. Paid via UPI.',
  },
  {
    id: 'DUE-SV104',
    customerName: 'Anil Kumar',
    serviceName: 'Bathroom Pipe Leak Repair & Sealing',
    quantity: 1,
    unitPrice: 450,
    totalAmount: 450,
    dueDate: '07 Oct 2026',
    date: '03 Oct 2026',
    status: 'Overdue',
    notes: 'Valve replacement and leak sealing.',
  },
  {
    id: 'DUE-SV105',
    customerName: 'Anil Kumar',
    serviceName: 'Tap / Mixer Faucet Replacement',
    quantity: 2,
    unitPrice: 250,
    totalAmount: 500,
    dueDate: '10 Oct 2026',
    date: '04 Oct 2026',
    status: 'Pending',
    notes: 'Kitchen sink dual taps.',
  },
  {
    id: 'DUE-SV106',
    customerName: 'Vikas Mehta',
    serviceName: 'Troubleshooting & Electrical Wiring',
    quantity: 2,
    unitPrice: 350,
    totalAmount: 700,
    dueDate: '16 Oct 2026',
    date: '10 Oct 2026',
    status: 'Pending',
    notes: '2 hours inspection and fuse replacement.',
  },
  {
    id: 'DUE-SV107',
    customerName: 'Priya Verma',
    serviceName: 'Designer Blouse Stitching & Embroidery',
    quantity: 1,
    unitPrice: 750,
    totalAmount: 750,
    dueDate: '14 Oct 2026',
    date: '08 Oct 2026',
    status: 'Pending',
    notes: 'Custom pattern cuts with piping.',
  },
  {
    id: 'DUE-SV108',
    customerName: 'Sunita Devi',
    serviceName: 'Water Tank & Motor Pump Installation',
    quantity: 1,
    unitPrice: 1250,
    totalAmount: 1250,
    dueDate: '12 Oct 2026',
    date: '11 Oct 2026',
    status: 'Paid',
    notes: 'Payment collected via UPI.',
  },
  {
    id: 'DUE-SV109',
    customerName: 'Mohit Jain',
    serviceName: 'AC Deep Clean & Jet Pump Wash',
    quantity: 1,
    unitPrice: 1199,
    totalAmount: 1199,
    dueDate: '13 Oct 2026',
    date: '11 Oct 2026',
    status: 'Paid',
    notes: 'Split AC 1.5 ton in master bedroom.',
  },
  {
    id: 'DUE-SV110',
    customerName: 'Rakesh Yadav',
    serviceName: 'Commercial Drain Unblocking & Snaking',
    quantity: 1,
    unitPrice: 1800,
    totalAmount: 1800,
    dueDate: '28 Sep 2026',
    date: '20 Sep 2026',
    status: 'Overdue',
    notes: 'Main line descaling.',
  },
];

const INITIAL_SERVICE_SALES: Sale[] = [
  { id: 'INV-2045', customer: 'Client Walk-in', items: "Men's 2-Piece Suit Stitching (1 unit)", amount: 1800, mode: 'UPI', status: 'Paid', date: '14 Oct 2026' },
  { id: 'INV-2044', customer: 'Priya Verma', items: 'Designer Blouse Stitching & Embroidery (1 unit)', amount: 750, mode: 'Cash', status: 'Paid', date: '13 Oct 2026' },
  { id: 'INV-2043', customer: 'Anil Kumar', items: 'Bathroom Pipe Leak Repair & Sealing (1 visit)', amount: 450, mode: 'UPI', status: 'Paid', date: '13 Oct 2026' },
  { id: 'INV-2042', customer: 'Client Walk-in', items: 'Water Tank & Motor Pump Installation (1 job)', amount: 1250, mode: 'Cash', status: 'Paid', date: '12 Oct 2026' },
  { id: 'INV-2041', customer: 'Mohit Jain', items: 'AC Deep Clean & Jet Pump Wash (1 unit)', amount: 1199, mode: 'UPI', status: 'Paid', date: '11 Oct 2026' },
  { id: 'INV-2040', customer: 'Vikas Mehta', items: 'Troubleshooting & Electrical Wiring (2 hrs)', amount: 700, mode: 'Credit', status: 'Pending', date: '10 Oct 2026', dueDate: '16 Oct 2026' },
  { id: 'INV-2039', customer: 'Client Walk-in', items: 'Pant Hemming & Urgent Alterations (2 units)', amount: 300, mode: 'Cash', status: 'Paid', date: '09 Oct 2026' },
  { id: 'INV-2038', customer: 'Sunita Devi', items: 'Tap / Mixer Faucet Replacement (1 unit)', amount: 250, mode: 'Cash', status: 'Paid', date: '08 Oct 2026' },
];

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
  registerUser: (data: {
    name: string;
    businessName: string;
    phone: string;
    email: string;
    category: BusinessCategory;
    subCategory: string;
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
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'kiranapay_user',
  SERVICES: 'kiranapay_services',
  JOBS: 'kiranapay_jobs',
  PRODUCTS: 'kiranapay_products',
  SHOP_CUSTOMERS: 'kiranapay_shop_customers',
  SERVICE_CUSTOMERS: 'kiranapay_service_customers',
  SHOP_DUES: 'kiranapay_shop_dues',
  SERVICE_DUES: 'kiranapay_service_dues',
  SHOP_SALES: 'kiranapay_shop_sales',
  SERVICE_SALES: 'kiranapay_service_sales',
};

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load user
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEMO_USERS.shop_sharma;
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

  // Shop Customers state
  const [shopCustomers, setShopCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOP_CUSTOMERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultCustomers;
  });

  // Service Customers state
  const [serviceCustomers, setServiceCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICE_CUSTOMERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SERVICE_CUSTOMERS;
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
    localStorage.setItem(STORAGE_KEYS.SHOP_CUSTOMERS, JSON.stringify(shopCustomers));
  }, [shopCustomers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICE_CUSTOMERS, JSON.stringify(serviceCustomers));
  }, [serviceCustomers]);

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
    setUser((prev) => {
      const nextCategory: BusinessCategory = prev.category === 'shop' ? 'service' : 'shop';
      return {
        ...prev,
        category: nextCategory,
        subCategory: nextCategory === 'service' ? 'Service Specialist (Tailor / Plumber)' : 'Kirana & Retail Store',
      };
    });
  };

  const loginUser = (profile: UserProfile) => {
    setUser(profile);
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
    address?: string;
  }): UserProfile => {
    const initials = data.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'US';

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name,
      businessName: data.businessName,
      phone: data.phone,
      email: data.email,
      category: data.category,
      subCategory: data.subCategory || (data.category === 'shop' ? 'Retail Store' : 'Service Provider'),
      avatar: initials,
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
    return created;
  };

  const updateService = (id: string, updatedFields: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((item) => item.id !== id));
  };

  const addServiceJob = (job: Omit<ServiceJob, 'id'>): ServiceJob => {
    const created: ServiceJob = {
      ...job,
      id: `JOB-${Math.floor(100 + Math.random() * 900)}`,
    };
    setServiceJobs((prev) => [created, ...prev]);
    return created;
  };

  const updateJobStatus = (id: string, status: ServiceJob['status']) => {
    setServiceJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, status } : job))
    );
  };

  const addProduct = (prod: Product) => {
    setProducts((prev) => [prod, ...prev]);
  };

  const deleteProduct = (name: string) => {
    setProducts((prev) => prev.filter((p) => p.name !== name));
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
  };

  const isService = user.category === 'service';
  const activeCustomers = isService ? serviceCustomers : shopCustomers;
  const activeDues = isService ? serviceDues : shopDues;
  const activeSales = isService ? serviceSales : shopSales;

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
      setServiceCustomers((prev) =>
        prev.map((c) =>
          c.name.toLowerCase() === due.customerName.toLowerCase()
            ? {
                ...c,
                outstanding: c.outstanding + due.totalAmount,
                totalPurchases: c.totalPurchases + due.totalAmount,
                lastVisit: today,
              }
            : c
        )
      );
    } else {
      setShopDues((prev) => [newDue, ...prev]);
      setShopCustomers((prev) =>
        prev.map((c) =>
          c.name.toLowerCase() === due.customerName.toLowerCase()
            ? {
                ...c,
                outstanding: c.outstanding + due.totalAmount,
                totalPurchases: c.totalPurchases + due.totalAmount,
                lastVisit: today,
              }
            : c
        )
      );

      // If item is a product in shop mode, deduct inventory stock!
      setProducts((prev) =>
        prev.map((p) => {
          if (p.name.toLowerCase() === due.serviceName.toLowerCase()) {
            const nextStock = Math.max(0, p.stock - due.quantity);
            return {
              ...p,
              stock: nextStock,
              status: nextStock <= 0 ? 'Critical' : nextStock <= p.reorderLevel ? 'Low Stock' : 'In Stock',
            };
          }
          return p;
        })
      );
    }

    return newDue;
  };

  const markDuePaid = (dueId: string) => {
    const isServiceMode = user.category === 'service';
    if (isServiceMode) {
      const due = serviceDues.find((d) => d.id === dueId);
      if (!due || due.status === 'Paid') return;

      setServiceDues((prev) =>
        prev.map((d) => (d.id === dueId ? { ...d, status: 'Paid' } : d))
      );

      setServiceCustomers((prev) =>
        prev.map((c) =>
          c.name.toLowerCase() === due.customerName.toLowerCase()
            ? {
                ...c,
                outstanding: Math.max(0, c.outstanding - due.totalAmount),
              }
            : c
        )
      );
    } else {
      const due = shopDues.find((d) => d.id === dueId);
      if (!due || due.status === 'Paid') return;

      setShopDues((prev) =>
        prev.map((d) => (d.id === dueId ? { ...d, status: 'Paid' } : d))
      );

      setShopCustomers((prev) =>
        prev.map((c) =>
          c.name.toLowerCase() === due.customerName.toLowerCase()
            ? {
                ...c,
                outstanding: Math.max(0, c.outstanding - due.totalAmount),
              }
            : c
        )
      );
    }
  };

  const getDuesForCustomer = (customerName: string): CustomerDueItem[] => {
    const duesList = user.category === 'service' ? serviceDues : shopDues;
    return duesList.filter((d) => d.customerName.toLowerCase() === customerName.toLowerCase());
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
    if (isServiceSale) {
      const saleItem: Sale = {
        id: `INV-${2046 + serviceSales.length}`,
        customer: newSale.customer || 'Client Walk-in',
        items: `${newSale.productName} (${newSale.quantity} ${newSale.quantity === 1 ? 'unit' : 'units'})`,
        amount: newSale.totalAmount,
        mode: newSale.mode || 'Cash',
        status: newSale.status || 'Paid',
        date: '14 Oct 2026',
      };
      setServiceSales((prev) => [saleItem, ...prev]);
      return saleItem;
    } else {
      const saleItem: Sale = {
        id: `INV-${1043 + shopSales.length}`,
        customer: newSale.customer || 'Counter Sale',
        items: `${newSale.productName} (${newSale.quantity} units)`,
        amount: newSale.totalAmount,
        mode: newSale.mode || 'Cash',
        status: newSale.status || 'Paid',
        date: '14 Oct 2026',
      };
      setShopSales((prev) => [saleItem, ...prev]);

      // Deduct stock from products in shop mode
      setProducts((prev) =>
        prev.map((p) => {
          if (p.name.toLowerCase() === newSale.productName.toLowerCase()) {
            const nextStock = Math.max(0, p.stock - newSale.quantity);
            return {
              ...p,
              stock: nextStock,
              status: nextStock <= 0 ? 'Critical' : nextStock <= p.reorderLevel ? 'Low Stock' : 'In Stock',
            };
          }
          return p;
        })
      );
      return saleItem;
    }
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
