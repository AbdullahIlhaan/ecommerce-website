// Simple localStorage-based store for demo data

export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'customer';

export interface AuthUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  canAccessAdminPanel: boolean;
  isSuperAdmin: boolean;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: string | null;
}

export interface RoleOption {
  value: UserRole;
  label: string;
}

export interface DashboardNavigationItem {
  title: string;
  url: string;
  icon: string;
  exact: boolean;
}

export interface DashboardNavigationGroup {
  label: string;
  items: DashboardNavigationItem[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  salePrice: number | null;
  stock: number;
  status: 'active' | 'draft' | 'archived';
  categoryId: string;
  brandId: string;
  images: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonUrl: string;
  imagePath: string;
  imagePaths?: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface FlashDeal {
  id: string;
  name: string;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  status: 'scheduled' | 'running' | 'ended' | 'disabled';
  productIds: string[];
  products: Product[];
  createdAt: string | null;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
}

export interface Order {
  id: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  returnRequestUrl?: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod: 'cod' | 'online';
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  estimatedDeliveryAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  internalNotes?: string | null;
  hasOpenReturnRequest?: boolean;
  createdAt: string;
  formattedDate?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'expired' | 'disabled';
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  orderReference: string | null;
  type: 'refund' | 'return' | 'exchange';
  status: 'pending' | 'approved' | 'rejected' | 'received' | 'refunded' | 'closed';
  refundAmount: number | null;
  restockItems: boolean;
  reason: string;
  details: string | null;
  resolutionNotes: string | null;
  requestedAt: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string | null;
  productSku: string | null;
  orderId: string | null;
  returnRequestId: string | null;
  type: string;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  reference: string | null;
  notes: string | null;
  createdAt: string | null;
  createdAtLabel: string | null;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function getStore<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Generic CRUD
export function getAll<T>(key: string): T[] {
  return getStore<T>(key);
}

export function getById<T extends { id: string }>(key: string, id: string): T | undefined {
  return getStore<T>(key).find(item => item.id === id);
}

export function create<T extends { id: string }>(key: string, item: Omit<T, 'id'>): T {
  const items = getStore<T>(key);
  const newItem = { ...item, id: generateId() } as T;
  items.push(newItem);
  setStore(key, items);
  return newItem;
}

export function update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | undefined {
  const items = getStore<T>(key);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return undefined;
  items[index] = { ...items[index], ...updates };
  setStore(key, items);
  return items[index];
}

export function remove<T extends { id: string }>(key: string, id: string): boolean {
  const items = getStore<T>(key);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  setStore(key, filtered);
  return true;
}

// Seed data
export function seedData() {
  if (localStorage.getItem('_seeded')) return;

  const categories: Category[] = [
    { id: 'cat1', name: 'Electronics', slug: 'electronics', parentId: null, createdAt: '2024-01-15' },
    { id: 'cat2', name: 'Clothing', slug: 'clothing', parentId: null, createdAt: '2024-01-15' },
    { id: 'cat3', name: 'Smartphones', slug: 'smartphones', parentId: 'cat1', createdAt: '2024-01-16' },
    { id: 'cat4', name: 'Laptops', slug: 'laptops', parentId: 'cat1', createdAt: '2024-01-16' },
    { id: 'cat5', name: 'Men\'s Wear', slug: 'mens-wear', parentId: 'cat2', createdAt: '2024-01-17' },
  ];

  const brands: Brand[] = [
    { id: 'br1', name: 'Apple', slug: 'apple', createdAt: '2024-01-10' },
    { id: 'br2', name: 'Samsung', slug: 'samsung', createdAt: '2024-01-10' },
    { id: 'br3', name: 'Nike', slug: 'nike', createdAt: '2024-01-10' },
    { id: 'br4', name: 'Sony', slug: 'sony', createdAt: '2024-01-11' },
  ];

  const products: Product[] = [
    { id: 'p1', name: 'iPhone 15 Pro', sku: 'APL-IP15P', description: 'Latest iPhone with titanium design', price: 999, salePrice: 949, stock: 45, status: 'active', categoryId: 'cat3', brandId: 'br1', images: [], createdAt: '2024-02-01' },
    { id: 'p2', name: 'Galaxy S24 Ultra', sku: 'SAM-S24U', description: 'Premium Samsung flagship', price: 1199, salePrice: null, stock: 32, status: 'active', categoryId: 'cat3', brandId: 'br2', images: [], createdAt: '2024-02-05' },
    { id: 'p3', name: 'MacBook Pro 16"', sku: 'APL-MBP16', description: 'M3 Pro chip laptop', price: 2499, salePrice: 2399, stock: 18, status: 'active', categoryId: 'cat4', brandId: 'br1', images: [], createdAt: '2024-02-10' },
    { id: 'p4', name: 'Air Jordan 1', sku: 'NK-AJ1', description: 'Classic basketball shoe', price: 180, salePrice: null, stock: 120, status: 'active', categoryId: 'cat5', brandId: 'br3', images: [], createdAt: '2024-02-15' },
    { id: 'p5', name: 'Sony WH-1000XM5', sku: 'SNY-WH5', description: 'Noise cancelling headphones', price: 349, salePrice: 299, stock: 67, status: 'active', categoryId: 'cat1', brandId: 'br4', images: [], createdAt: '2024-02-20' },
    { id: 'p6', name: 'iPad Air M2', sku: 'APL-IPAM2', description: 'Versatile tablet', price: 599, salePrice: null, stock: 0, status: 'draft', categoryId: 'cat1', brandId: 'br1', images: [], createdAt: '2024-03-01' },
  ];

  const customers: Customer[] = [
    { id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '+1 555-0101', status: 'active', createdAt: '2024-01-20' },
    { id: 'c2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1 555-0102', status: 'active', createdAt: '2024-01-22' },
    { id: 'c3', name: 'Bob Wilson', email: 'bob@example.com', phone: '+1 555-0103', status: 'inactive', createdAt: '2024-02-01' },
    { id: 'c4', name: 'Alice Brown', email: 'alice@example.com', phone: '+1 555-0104', status: 'active', createdAt: '2024-02-15' },
  ];

  const orders: Order[] = [
    { id: 'o1', customerId: 'c1', items: [{ productId: 'p1', productName: 'iPhone 15 Pro', quantity: 1, price: 949 }], subtotal: 949, tax: 85.41, total: 1034.41, status: 'delivered', paymentStatus: 'paid', paymentMethod: 'online', createdAt: '2024-03-01' },
    { id: 'o2', customerId: 'c2', items: [{ productId: 'p3', productName: 'MacBook Pro 16"', quantity: 1, price: 2399 }, { productId: 'p5', productName: 'Sony WH-1000XM5', quantity: 1, price: 299 }], subtotal: 2698, tax: 242.82, total: 2940.82, status: 'shipped', paymentStatus: 'paid', paymentMethod: 'online', createdAt: '2024-03-05' },
    { id: 'o3', customerId: 'c4', items: [{ productId: 'p4', productName: 'Air Jordan 1', quantity: 2, price: 180 }], subtotal: 360, tax: 32.40, total: 392.40, status: 'processing', paymentStatus: 'paid', paymentMethod: 'cod', createdAt: '2024-03-10' },
    { id: 'o4', customerId: 'c3', items: [{ productId: 'p2', productName: 'Galaxy S24 Ultra', quantity: 1, price: 1199 }], subtotal: 1199, tax: 107.91, total: 1306.91, status: 'pending', paymentStatus: 'pending', paymentMethod: 'cod', createdAt: '2024-03-12' },
  ];

  const coupons: Coupon[] = [
    { id: 'cp1', code: 'SAVE10', type: 'percentage', value: 10, startDate: '2024-01-01', endDate: '2024-12-31', usageLimit: 100, usageCount: 42, status: 'active', createdAt: '2024-01-01' },
    { id: 'cp2', code: 'FLAT50', type: 'fixed', value: 50, startDate: '2024-03-01', endDate: '2024-06-30', usageLimit: 50, usageCount: 12, status: 'active', createdAt: '2024-03-01' },
    { id: 'cp3', code: 'SUMMER20', type: 'percentage', value: 20, startDate: '2024-06-01', endDate: '2024-08-31', usageLimit: 200, usageCount: 0, status: 'disabled', createdAt: '2024-02-15' },
  ];

  const reviews: Review[] = [
    { id: 'r1', productId: 'p1', productName: 'iPhone 15 Pro', customerName: 'John Doe', rating: 5, comment: 'Best phone I\'ve ever had!', status: 'approved', createdAt: '2024-03-05' },
    { id: 'r2', productId: 'p3', productName: 'MacBook Pro 16"', customerName: 'Jane Smith', rating: 4, comment: 'Great laptop, a bit pricey', status: 'approved', createdAt: '2024-03-08' },
    { id: 'r3', productId: 'p5', productName: 'Sony WH-1000XM5', customerName: 'Alice Brown', rating: 5, comment: 'Amazing noise cancellation!', status: 'pending', createdAt: '2024-03-11' },
    { id: 'r4', productId: 'p4', productName: 'Air Jordan 1', customerName: 'Bob Wilson', rating: 3, comment: 'Good but runs small', status: 'pending', createdAt: '2024-03-12' },
  ];

  setStore('products', products);
  setStore('categories', categories);
  setStore('brands', brands);
  setStore('customers', customers);
  setStore('orders', orders);
  setStore('coupons', coupons);
  setStore('reviews', reviews);
  localStorage.setItem('_seeded', '1');
}
