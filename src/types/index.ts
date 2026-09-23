export type UserRole = 'super_admin' | 'restaurant_admin' | 'kitchen_staff' | 'delivery_agent' | 'customer' | 'guest';

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'mobile_money' | 'cash_on_delivery' | 'bank_transfer' | 'card';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';
export type DeliveryType = 'internal_delivery' | 'pickup' | 'external_delivery';
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  loyalty_points: number;
  loyalty_tier: LoyaltyTier;
  address: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductExtra {
  id: string;
  product_id: string;
  name: string;
  type: 'size' | 'addon' | 'extra';
  price_adjustment: number;
  is_required: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  tags: string[];
  is_featured: boolean;
  is_daily_special: boolean;
  is_active: boolean;
  spice_level: number;
  prep_time_minutes: number;
  category?: Category;
  extras?: ProductExtra[];
  reviews?: Review[];
}

export interface DeliveryZone {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  estimated_time_minutes: number;
  is_active: boolean;
}

export interface OrderItemExtra {
  name: string;
  price_adjustment: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  extras: OrderItemExtra[];
  special_instructions: string | null;
  line_total: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_type: DeliveryType;
  delivery_zone_id: string | null;
  delivery_address: string | null;
  delivery_fee: number;
  subtotal: number;
  discount: number;
  total: number;
  special_instructions: string | null;
  promo_code: string | null;
  assigned_to: string | null;
  pickup_time: string | null;
  estimated_delivery_time: string | null;
  delivered_at: string | null;
  cancellation_reason: string | null;
  loyalty_points_earned: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  delivery_zone?: DeliveryZone;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'delivery' | 'loyalty' | 'promotion' | 'general';
  is_read: boolean;
  related_id: string | null;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  extras: OrderItemExtra[];
  special_instructions: string | null;
  unit_price: number;
  line_total: number;
}
