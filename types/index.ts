export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  order: number;
  imageUrl?: string;
  isActive: boolean;
  children?: Category[];
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[] | { name: string; priceModifier: number }[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  purchasePrice?: number;
  categoryId: string;
  brand?: string;
  stockCode?: string;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  isNewProduct?: boolean;
  isFastShipping?: boolean;
  isShowcase?: boolean;
  order: number;
  options?: ProductOption[];
  source?: string;
  updatedAt?: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  selectedOptions?: { [key: string]: string };
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: Date;
  orderNumber: number;
  orderType: 'kiosk' | 'online';
  customerInfo?: {
    name: string;
    phone: string;
    address?: string;
    tableNumber?: string;
  };
  paymentMethod?: 'cash' | 'card';
  estimatedTime?: number;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrder?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  kioskOrders: number;
  onlineOrders: number;
  activeTables: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
}

export type UserRole = 'admin' | 'manager' | 'waiter' | 'kitchen' | 'delivery' | 'cashier' | 'customer';

export interface Permission {
  module: 'dashboard' | 'catalog' | 'orders' | 'tables' | 'customers' | 'reports' | 'inventory' | 'users' | 'settings' | 'mobile-waiter' | 'mobile-kitchen' | 'mobile-delivery' | 'qr-codes' | 'customization' | 'ai';
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Hashed
  fullName: string;
  phone: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  // Management user specific
  employeeId?: string;
  department?: string;
  salary?: number;
  hireDate?: Date;
  workShift?: 'morning' | 'afternoon' | 'evening' | 'night';
  // Customer user specific
  customerType?: 'regular' | 'vip' | 'corporate';
  loyaltyPoints?: number;
  membershipLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent?: number;
  orderCount?: number;
  favoriteProducts?: string[];
  address?: string;
  birthDate?: Date;
}

