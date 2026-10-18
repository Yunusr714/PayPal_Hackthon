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
  { product: 'Milk', units: 320 },
  { product: 'Bread', units: 280 },
  { product: 'Aata', units: 210 },
  { product: 'Rice', units: 180 },
  { product: 'Biscuits', units: 160 },
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

export const recentSales: Sale[] = [
  { id: 'INV-1042', customer: 'Sharma Uncle', items: 'Rice, Oil, Biscuits', amount: 340, mode: 'Credit', status: 'Pending', date: '13 Oct 2026', dueDate: '18 Oct 2026' },
  { id: 'INV-1041', customer: 'Priya Verma', items: 'Milk, Bread, Eggs', amount: 180, mode: 'UPI', status: 'Paid', date: '13 Oct 2026' },
  { id: 'INV-1040', customer: 'Rahul Gupta', items: 'Atta, Sugar', amount: 620, mode: 'Cash', status: 'Paid', date: '13 Oct 2026' },
  { id: 'INV-1039', customer: 'Anil Kumar', items: 'Cooking Oil', amount: 450, mode: 'Credit', status: 'Overdue', date: '12 Oct 2026', dueDate: '07 Oct 2026' },
  { id: 'INV-1038', customer: 'Neha Singh', items: 'Snacks, Cold Drinks', amount: 310, mode: 'UPI', status: 'Paid', date: '12 Oct 2026' },
  { id: 'INV-1037', customer: 'Mohit Jain', items: 'Rice, Dal', amount: 890, mode: 'PayPal', status: 'Paid', date: '11 Oct 2026' },
  { id: 'INV-1036', customer: 'Sunita Devi', items: 'Vegetables', amount: 260, mode: 'Cash', status: 'Paid', date: '11 Oct 2026' },
  { id: 'INV-1035', customer: 'Vikas Mehta', items: 'Detergent, Soap', amount: 540, mode: 'Credit', status: 'Pending', date: '10 Oct 2026', dueDate: '16 Oct 2026' },
];

export const allSales: Sale[] = [
  ...recentSales,
  { id: 'INV-1034', customer: 'Rajesh Khanna', items: 'Tea, Sugar, Biscuits', amount: 220, mode: 'Cash', status: 'Paid', date: '10 Oct 2026' },
  { id: 'INV-1033', customer: 'Kavita Sharma', items: 'Cooking Oil, Rice', amount: 780, mode: 'UPI', status: 'Paid', date: '09 Oct 2026' },
  { id: 'INV-1032', customer: 'Deepak Verma', items: 'Dal, Atta, Salt', amount: 410, mode: 'Credit', status: 'Pending', date: '09 Oct 2026', dueDate: '16 Oct 2026' },
  { id: 'INV-1031', customer: 'Sunita Devi', items: 'Vegetables, Fruits', amount: 350, mode: 'Cash', status: 'Paid', date: '08 Oct 2026' },
  { id: 'INV-1030', customer: 'Arjun Reddy', items: 'Cold Drinks, Snacks', amount: 290, mode: 'UPI', status: 'Paid', date: '08 Oct 2026' },
];

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

export const khataData: KhataEntry[] = [
  { customer: 'Sharma Uncle', phone: '+91 98100 12345', totalCredit: 3400, paid: 3060, outstanding: 340, lastPayment: '01 Oct 2026', dueDate: '18 Oct 2026', risk: 'Medium' },
  { customer: 'Anil Kumar', phone: '+91 98100 23456', totalCredit: 4200, paid: 2950, outstanding: 1250, lastPayment: '28 Sep 2026', dueDate: '07 Oct 2026', risk: 'High' },
  { customer: 'Vikas Mehta', phone: '+91 98100 34567', totalCredit: 1800, paid: 1260, outstanding: 540, lastPayment: '05 Oct 2026', dueDate: '16 Oct 2026', risk: 'Low' },
  { customer: 'Sunita Devi', phone: '+91 98100 45678', totalCredit: 2200, paid: 2200, outstanding: 0, lastPayment: '10 Oct 2026', dueDate: 'No dues', risk: 'Low' },
  { customer: 'Rakesh Yadav', phone: '+91 98100 56789', totalCredit: 5600, paid: 3500, outstanding: 2100, lastPayment: '20 Sep 2026', dueDate: '01 Oct 2026', risk: 'High' },
  { customer: 'Priya Verma', phone: '+91 98100 67890', totalCredit: 980, paid: 800, outstanding: 180, lastPayment: '08 Oct 2026', dueDate: '14 Oct 2026', risk: 'Low' },
];

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

export const customersData: Customer[] = [
  { name: 'Sharma Uncle', phone: '+91 98100 12345', totalPurchases: 12400, outstanding: 340, behaviour: 'Good', riskScore: 42, lastVisit: '13 Oct 2026' },
  { name: 'Anil Kumar', phone: '+91 98100 23456', totalPurchases: 8200, outstanding: 1250, behaviour: 'Poor', riskScore: 78, lastVisit: '12 Oct 2026' },
  { name: 'Vikas Mehta', phone: '+91 98100 34567', totalPurchases: 6800, outstanding: 540, behaviour: 'Good', riskScore: 25, lastVisit: '10 Oct 2026' },
  { name: 'Sunita Devi', phone: '+91 98100 45678', totalPurchases: 15200, outstanding: 0, behaviour: 'Excellent', riskScore: 8, lastVisit: '11 Oct 2026' },
  { name: 'Rakesh Yadav', phone: '+91 98100 56789', totalPurchases: 9600, outstanding: 2100, behaviour: 'Poor', riskScore: 85, lastVisit: '28 Sep 2026' },
  { name: 'Priya Verma', phone: '+91 98100 67890', totalPurchases: 4800, outstanding: 180, behaviour: 'Excellent', riskScore: 15, lastVisit: '13 Oct 2026' },
  { name: 'Rahul Gupta', phone: '+91 98100 78901', totalPurchases: 11200, outstanding: 0, behaviour: 'Good', riskScore: 30, lastVisit: '13 Oct 2026' },
  { name: 'Neha Singh', phone: '+91 98100 89012', totalPurchases: 5400, outstanding: 0, behaviour: 'Excellent', riskScore: 12, lastVisit: '12 Oct 2026' },
  { name: 'Mohit Jain', phone: '+91 98100 90123', totalPurchases: 8900, outstanding: 0, behaviour: 'Good', riskScore: 35, lastVisit: '11 Oct 2026' },
  { name: 'Kavita Sharma', phone: '+91 98100 11223', totalPurchases: 7300, outstanding: 0, behaviour: 'Good', riskScore: 28, lastVisit: '09 Oct 2026' },
];

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

export const productsData: Product[] = [
  { name: 'Aata / Wheat Flour', category: 'Grains', stock: 4, unit: 'kg', reorderLevel: 10, costPrice: 35, sellingPrice: 42, status: 'Low Stock' },
  { name: 'Basmati Rice', category: 'Grains', stock: 6, unit: 'kg', reorderLevel: 15, costPrice: 85, sellingPrice: 95, status: 'Low Stock' },
  { name: 'Sunflower Oil', category: 'Oil', stock: 2, unit: 'litres', reorderLevel: 8, costPrice: 120, sellingPrice: 140, status: 'Critical' },
  { name: 'Sugar', category: 'Grains', stock: 3, unit: 'kg', reorderLevel: 10, costPrice: 42, sellingPrice: 48, status: 'Low Stock' },
  { name: 'Milk Packet', category: 'Dairy', stock: 25, unit: 'units', reorderLevel: 10, costPrice: 24, sellingPrice: 28, status: 'In Stock' },
  { name: 'Bread', category: 'Bakery', stock: 12, unit: 'units', reorderLevel: 6, costPrice: 28, sellingPrice: 35, status: 'In Stock' },
  { name: 'Detergent Powder', category: 'Household', stock: 5, unit: 'packets', reorderLevel: 12, costPrice: 65, sellingPrice: 80, status: 'Low Stock' },
  { name: 'Biscuits', category: 'Snacks', stock: 48, unit: 'packets', reorderLevel: 20, costPrice: 10, sellingPrice: 15, status: 'In Stock' },
  { name: 'Dal', category: 'Grains', stock: 18, unit: 'kg', reorderLevel: 8, costPrice: 95, sellingPrice: 110, status: 'In Stock' },
  { name: 'Cold Drinks', category: 'Beverages', stock: 3, unit: 'bottles', reorderLevel: 12, costPrice: 25, sellingPrice: 35, status: 'Critical' },
];

export const lowStockAlerts = [
  { name: 'Aata / Wheat Flour', stock: 4, unit: 'kg', reorder: 10 },
  { name: 'Sunflower Oil', stock: 2, unit: 'litres', reorder: 8 },
  { name: 'Basmati Rice', stock: 6, unit: 'kg', reorder: 15 },
  { name: 'Sugar', stock: 3, unit: 'kg', reorder: 10 },
  { name: 'Detergent Powder', stock: 5, unit: 'packets', reorder: 12 },
];

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
