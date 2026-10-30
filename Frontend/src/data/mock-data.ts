export const formatINR = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const salesOverviewData = [
  { day: 'Mon', sales: 9800 },
  { day: 'Tue', sales: 11200 },
  { day: 'Wed', sales: 8600 },
  { day: 'Thu', sales: 12450 },
  { day: 'Fri', sales: 14300 },
  { day: 'Sat', sales: 18750 },
  { day: 'Sun', sales: 16200 },
];

export const salesOverview30Data = [
  { day: 'Week 1', sales: 68500 },
  { day: 'Week 2', sales: 72300 },
  { day: 'Week 3', sales: 78900 },
  { day: 'Week 4', sales: 84200 },
];

export const salesOverview90Data = [
  { day: 'Month 1', sales: 285000 },
  { day: 'Month 2', sales: 312000 },
  { day: 'Month 3', sales: 342000 },
];

export const monthlySalesData = [
  { month: 'May', sales: 284000 },
  { month: 'Jun', sales: 305000 },
  { month: 'Jul', sales: 298000 },
  { month: 'Aug', sales: 320000 },
  { month: 'Sep', sales: 336000 },
  { month: 'Oct', sales: 342000 },
];

export const topProductsData = [
  { product: 'Cotton Oxford Shirt', units: 140 },
  { product: 'Classic Denim Jacket', units: 95 },
  { product: 'Casual Stretch Chinos', units: 85 },
  { product: 'Streetwear Hoodie', units: 75 },
  { product: 'Festive Kurti', units: 60 },
];

export const creditRiskData = [
  { name: 'Low Risk', value: 62, fill: 'hsl(var(--success))' },
  { name: 'Medium Risk', value: 26, fill: 'hsl(var(--warning))' },
  { name: 'High Risk', value: 12, fill: 'hsl(var(--destructive))' },
];

export const paymentMethodData = [
  { name: 'Cash', value: 42, fill: 'hsl(var(--primary))' },
  { name: 'UPI', value: 38, fill: 'hsl(var(--success))' },
  { name: 'Credit', value: 15, fill: 'hsl(var(--warning))' },
  { name: 'PayPal', value: 5, fill: 'hsl(var(--chart-5))' },
];

export const collectionRingData = [
  { name: 'Paid', value: 68, fill: 'hsl(var(--success))' },
  { name: 'Pending', value: 22, fill: 'hsl(var(--warning))' },
  { name: 'Overdue', value: 10, fill: 'hsl(var(--destructive))' },
];

export const cashFlowData = [
  { day: 'Mon', inflow: 9800, outflow: 4200 },
  { day: 'Tue', inflow: 11200, outflow: 5100 },
  { day: 'Wed', inflow: 8600, outflow: 3800 },
  { day: 'Thu', inflow: 12450, outflow: 2800 },
  { day: 'Fri', inflow: 14300, outflow: 8000 },
  { day: 'Sat', inflow: 18750, outflow: 3200 },
  { day: 'Sun', inflow: 16200, outflow: 1800 },
];

export type SaleStatus = 'Paid' | 'Pending' | 'Overdue';
export type PaymentMode = 'Cash' | 'UPI' | 'Credit' | 'PayPal';

export interface Sale {
  id: string;
  customer: string;
  items: string;
  amount: number;
  mode: PaymentMode;
  status: SaleStatus;
  date: string;
  dueDate?: string;
}

export const recentSales: Sale[] = [];

export const allSales: Sale[] = [];

export interface KhataEntry {
  customer: string;
  phone: string;
  totalCredit: number;
  paid: number;
  outstanding: number;
  lastPayment: string;
  dueDate: string;
  risk: 'Low' | 'Medium' | 'High';
}

export const khataData: KhataEntry[] = [];

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  category?: 'shop' | 'service' | 'both' | string;
  totalPurchases: number;
  outstanding: number;
  behaviour: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  riskScore: number;
  lastVisit: string;
}

export const customersData: Customer[] = [];

export interface Product {
  name: string;
  category: string;
  stock: number;
  unit: string;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  status: 'In Stock' | 'Low Stock' | 'Critical';
}

export const productsData: Product[] = [];

export const lowStockAlerts: { name: string; stock: number; unit: string; reorder: number }[] = [];

export interface Supplier {
  name: string;
  category: string;
  contact: string;
  totalPurchases: number;
  pendingAmount: number;
  dueDate: string;
  status: 'Pending' | 'Overdue' | 'Paid';
}

export const suppliersData: Supplier[] = [
  { name: 'Gupta Wholesale Mart', category: 'Grains', contact: '+91 99100 11111', totalPurchases: 84000, pendingAmount: 12000, dueDate: 'Friday', status: 'Pending' },
  { name: 'Fresh Dairy Distributors', category: 'Dairy', contact: '+91 99100 22222', totalPurchases: 42000, pendingAmount: 4500, dueDate: 'Monday', status: 'Pending' },
  { name: 'Metro FMCG Supplies', category: 'Packaged Goods', contact: '+91 99100 33333', totalPurchases: 156000, pendingAmount: 18000, dueDate: 'Overdue 3 days', status: 'Overdue' },
  { name: 'Sharma Oil Agency', category: 'Oil', contact: '+91 99100 44444', totalPurchases: 68000, pendingAmount: 7500, dueDate: 'Next week', status: 'Pending' },
  { name: 'Bharat Snacks & Co.', category: 'Snacks', contact: '+91 99100 55555', totalPurchases: 32000, pendingAmount: 0, dueDate: 'No dues', status: 'Paid' },
  { name: 'Delhi Beverages Ltd.', category: 'Beverages', contact: '+91 99100 66666', totalPurchases: 28000, pendingAmount: 0, dueDate: 'No dues', status: 'Paid' },
];

export interface Transaction {
  id: string;
  customer: string;
  amount: number;
  method: PaymentMode;
  status: 'Completed' | 'Pending' | 'Failed';
  date: string;
}

export const transactionsData: Transaction[] = [
  { id: 'TXN-9940', customer: 'Rahul Gupta', amount: 620, method: 'Cash', status: 'Completed', date: '13 Oct 2026' },
  { id: 'TXN-9939', customer: 'Priya Verma', amount: 180, method: 'UPI', status: 'Completed', date: '13 Oct 2026' },
  { id: 'TXN-9938', customer: 'Sunita Devi', amount: 260, method: 'Cash', status: 'Completed', date: '13 Oct 2026' },
  { id: 'TXN-9937', customer: 'Neha Singh', amount: 310, method: 'UPI', status: 'Completed', date: '12 Oct 2026' },
  { id: 'TXN-9936', customer: 'Sharma Uncle', amount: 340, method: 'Credit', status: 'Pending', date: '13 Oct 2026' },
  { id: 'TXN-9935', customer: 'Vikas Mehta', amount: 540, method: 'Credit', status: 'Pending', date: '10 Oct 2026' },
  { id: 'TXN-9934', customer: 'Anil Kumar', amount: 450, method: 'Credit', status: 'Pending', date: '12 Oct 2026' },
  { id: 'TXN-9931', customer: 'Mohit Jain', amount: 890, method: 'PayPal', status: 'Completed', date: '11 Oct 2026' },
  { id: 'TXN-9930', customer: 'Aditya Rao', amount: 1250, method: 'PayPal', status: 'Completed', date: '10 Oct 2026' },
  { id: 'TXN-9929', customer: 'Kavita Sharma', amount: 450, method: 'PayPal', status: 'Pending', date: '10 Oct 2026' },
  { id: 'TXN-9928', customer: 'Rakesh Yadav', amount: 2100, method: 'PayPal', status: 'Failed', date: '09 Oct 2026' },
  { id: 'TXN-9927', customer: 'Arjun Reddy', amount: 290, method: 'UPI', status: 'Completed', date: '08 Oct 2026' },
];

export const navItems = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { label: 'AI Assistant', path: '/ai-assistant', icon: 'Sparkles' },
  { label: 'Sales', path: '/sales', icon: 'ShoppingCart' },
  { label: 'Khata / Credit Book', path: '/khata', icon: 'BookOpen' },
  { label: 'Customers', path: '/customers', icon: 'Users' },
  { label: 'Inventory', path: '/inventory', icon: 'Package' },
  { label: 'Payments', path: '/payments', icon: 'CreditCard' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
];
