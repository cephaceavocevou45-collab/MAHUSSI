import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/constants';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  const applyPromo = async () => {
    if (!promoCode) return;
    setPromoError('');
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      setPromoError('Invalid promo code');
      setDiscount(0);
      return;
    }
    if (data.min_order_amount && subtotal < Number(data.min_order_amount)) {
      setPromoError(`Minimum order of ${formatPrice(Number(data.min_order_amount))} required`);
      setDiscount(0);
      return;
    }
    const disc = data.discount_type === 'percentage'
      ? (subtotal * Number(data.discount_value)) / 100
      : Number(data.discount_value);
    setDiscount(disc);
    toast(`Promo applied: -${formatPrice(disc)}`, 'success');
  };

  const total = subtotal - discount;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-cream-200 flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10 text-ink-300" />
        </div>
        <h2 className="font-display text-2xl font-bold text-ink-800 mb-2">Your cart is empty</h2>
        <p className="text-ink-500 mb-6">Browse our menu and add some delicious items!</p>
        <Link to="/menu" className="btn-primary">
          Explore Menu <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-ink-800 mb-6">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.product_id + JSON.stringify(item.extras)} className="card p-4 flex gap-4">
              <Link to={`/product/${item.product_id}`} className="flex-shrink-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream-200">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-ink-800">{item.name}</h3>
                {item.extras.length > 0 && (
                  <p className="text-xs text-ink-400 mt-0.5">
                    {item.extras.map(e => e.name).join(', ')}
                  </p>
                )}
                {item.special_instructions && (
                  <p className="text-xs text-terracotta-500 mt-0.5">Note: {item.special_instructions}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 bg-cream-200 rounded-lg p-0.5">
                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="w-7 h-7 rounded-md bg-white flex items-center justify-center hover:bg-cream-100">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="w-7 h-7 rounded-md bg-white flex items-center justify-center hover:bg-cream-100">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-terracotta-600">{formatPrice(item.line_total)}</span>
                    <button onClick={() => removeItem(item.product_id)} className="text-ink-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-ink-400 hover:text-red-500 transition-colors">
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h3 className="font-display text-lg font-semibold text-ink-800 mb-4">Order Summary</h3>

            {/* Promo code */}
            <div className="mb-4">
              <label className="label">Promo Code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="input pl-9 text-sm"
                  />
                </div>
                <button onClick={applyPromo} className="btn-outline text-sm">Apply</button>
              </div>
              {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
            </div>

            <div className="space-y-2 text-sm border-t border-ink-100 pt-4">
              <div className="flex justify-between text-ink-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-forest-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-400 text-xs">
                <span>Delivery fee</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-bold text-ink-800 text-base border-t border-ink-100 pt-2">
                <span>Estimated Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button onClick={() => navigate('/checkout', { state: { discount } })} className="btn-primary w-full mt-4">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/menu" className="btn-ghost w-full mt-2">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
