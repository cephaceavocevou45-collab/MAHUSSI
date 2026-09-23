import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  DeliveryType,
  LoyaltyTier,
  UserRole,
} from '@/types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  placed: 'bg-ink-100 text-ink-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-gold-100 text-gold-700',
  ready: 'bg-forest-100 text-forest-700',
  out_for_delivery: 'bg-terracotta-100 text-terracotta-700',
  delivered: 'bg-forest-200 text-forest-800',
  cancelled: 'bg-red-100 text-red-700',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mobile_money: 'Mobile Money',
  cash_on_delivery: 'Cash on Delivery',
  bank_transfer: 'Bank Transfer',
  card: 'Credit/Debit Card',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  failed: 'Failed',
  refunded: 'Refunded',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-gold-100 text-gold-700',
  confirmed: 'bg-forest-100 text-forest-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-ink-100 text-ink-700',
};

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  internal_delivery: 'Home Delivery',
  pickup: 'In-Store Pickup',
  external_delivery: 'External Partner',
};

export const LOYALTY_TIERS: Record<LoyaltyTier, { label: string; color: string; min: number }> = {
  bronze: { label: 'Bronze', color: 'text-amber-600', min: 0 },
  silver: { label: 'Silver', color: 'text-gray-400', min: 500 },
  gold: { label: 'Gold', color: 'text-gold-500', min: 1500 },
  platinum: { label: 'Platinum', color: 'text-cyan-500', min: 3000 },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  restaurant_admin: 'Restaurant Manager',
  kitchen_staff: 'Kitchen Staff',
  delivery_agent: 'Delivery Agent',
  customer: 'Customer',
  guest: 'Guest',
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateOrderNumber = (): string => {
  const date = new Date();
  const ymd = date.getFullYear().toString() + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MH-${ymd}-${random}`;
};

export const cn = (...classes: (string | false | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
