import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { CartItem, Product, OrderItemExtra } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity: number, extras: OrderItemExtra[], specialInstructions?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'mahussi_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product, quantity: number, extras: OrderItemExtra[], specialInstructions?: string) => {
    const extrasTotal = extras.reduce((sum, e) => sum + e.price_adjustment, 0);
    const unitPrice = product.price + extrasTotal;
    const lineTotal = unitPrice * quantity;

    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id && JSON.stringify(i.extras) === JSON.stringify(extras));
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id && JSON.stringify(i.extras) === JSON.stringify(extras)
            ? { ...i, quantity: i.quantity + quantity, line_total: (i.unit_price) * (i.quantity + quantity) }
            : i
        );
      }
      const newItem: CartItem = {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity,
        extras,
        special_instructions: specialInstructions ?? null,
        unit_price: unitPrice,
        line_total: lineTotal,
      };
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product_id !== productId));
      return;
    }
    setItems(prev => prev.map(i =>
      i.product_id === productId
        ? { ...i, quantity, line_total: i.unit_price * quantity }
        : i
    ));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.line_total, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
