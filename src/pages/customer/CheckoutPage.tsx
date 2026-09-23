import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CreditCard, Banknote, Smartphone, MapPin, Store, Truck, Check, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, generateOrderNumber, DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants';
import type { DeliveryZone, DeliveryType, PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const discount = (location.state as { discount?: number } | null)?.discount ?? 0;

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('internal_delivery');
  const [deliveryZoneId, setDeliveryZoneId] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState(profile?.address ?? '');
  const [pickupTime, setPickupTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from('delivery_zones').select('*').eq('is_active', true).then(({ data }) => {
      if (data) {
        setZones(data as DeliveryZone[]);
        if (data.length > 0) setDeliveryZoneId(data[0].id);
      }
    });
  }, []);

  const selectedZone = zones.find(z => z.id === deliveryZoneId);
  const deliveryFee = deliveryType === 'pickup' ? 0 : (selectedZone ? Number(selectedZone.base_price) : 0);
  const total = subtotal - discount + deliveryFee;

  const handleSubmit = async () => {
    if (!profile) {
      toast('Please sign in to place an order', 'info');
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      toast('Your cart is empty', 'error');
      return;
    }
    if (deliveryType !== 'pickup' && !deliveryAddress) {
      toast('Please enter a delivery address', 'error');
      return;
    }

    setSubmitting(true);
    const orderNumber = generateOrderNumber();
    const loyaltyPoints = Math.floor(total / 1000);

    const { data: order, error } = await supabase.from('orders').insert({
      user_id: profile.id,
      order_number: orderNumber,
      status: 'placed',
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
      delivery_type: deliveryType,
      delivery_zone_id: deliveryType !== 'pickup' ? deliveryZoneId : null,
      delivery_address: deliveryType !== 'pickup' ? deliveryAddress : null,
      delivery_fee: deliveryFee,
      subtotal,
      discount,
      total,
      special_instructions: specialInstructions || null,
      pickup_time: deliveryType === 'pickup' && pickupTime ? new Date(pickupTime).toISOString() : null,
      estimated_delivery_time: selectedZone && deliveryType === 'internal_delivery'
        ? new Date(Date.now() + selectedZone.estimated_time_minutes * 60000).toISOString()
        : null,
      loyalty_points_earned: loyaltyPoints,
    }).select().single();

    if (error || !order) {
      toast('Failed to place order. Please try again.', 'error');
      setSubmitting(false);
      return;
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      extras: item.extras,
      special_instructions: item.special_instructions,
      line_total: item.line_total,
    }));

    await supabase.from('order_items').insert(orderItems);

    // Award loyalty points
    await supabase.from('profiles').update({
      loyalty_points: profile.loyalty_points + loyaltyPoints,
    }).eq('id', profile.id);

    // Create notification
    await supabase.from('notifications').insert({
      user_id: profile.id,
      title: 'Order Placed Successfully',
      message: `Your order ${orderNumber} has been placed. We'll notify you when it's confirmed.`,
      type: 'order',
      related_id: order.id,
    });

    clearCart();
    toast('Order placed successfully!', 'success');
    navigate(`/orders/${order.id}`);
    setSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-400 text-lg mb-4">Your cart is empty.</p>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-terracotta-500 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>
      <h1 className="font-display text-3xl font-bold text-ink-800 mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery type */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink-800 mb-4">Delivery Method</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { type: 'internal_delivery' as DeliveryType, label: DELIVERY_TYPE_LABELS.internal_delivery, icon: Truck },
                { type: 'pickup' as DeliveryType, label: DELIVERY_TYPE_LABELS.pickup, icon: Store },
                { type: 'external_delivery' as DeliveryType, label: DELIVERY_TYPE_LABELS.external_delivery, icon: MapPin },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.type}
                    onClick={() => setDeliveryType(opt.type)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      deliveryType === opt.type ? 'border-terracotta-500 bg-terracotta-50' : 'border-ink-200 hover:border-terracotta-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${deliveryType === opt.type ? 'text-terracotta-500' : 'text-ink-400'}`} />
                    <p className="text-sm font-medium text-ink-800">{opt.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery details */}
          {deliveryType !== 'pickup' && (
            <div className="card p-5">
              <h3 className="font-semibold text-ink-800 mb-4">Delivery Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Delivery Zone</label>
                  <select value={deliveryZoneId} onChange={e => setDeliveryZoneId(e.target.value)} className="input">
                    {zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name} — {formatPrice(Number(z.base_price))} ({z.estimated_time_minutes} min)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Delivery Address</label>
                  <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Enter your full address" rows={2} className="input resize-none" />
                </div>
              </div>
            </div>
          )}

          {deliveryType === 'pickup' && (
            <div className="card p-5">
              <h3 className="font-semibold text-ink-800 mb-4">Pickup Details</h3>
              <div>
                <label className="label">Preferred Pickup Time</label>
                <input type="datetime-local" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="input" />
              </div>
              <p className="text-xs text-ink-400 mt-2">A QR code will be generated for pickup confirmation after your order is placed.</p>
            </div>
          )}

          {/* Payment method */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink-800 mb-4">Payment Method</h3>
            <div className="space-y-2">
              {[
                { method: 'mobile_money' as PaymentMethod, label: PAYMENT_METHOD_LABELS.mobile_money, icon: Smartphone, desc: 'MTN Mobile Money, Orange Money' },
                { method: 'cash_on_delivery' as PaymentMethod, label: PAYMENT_METHOD_LABELS.cash_on_delivery, icon: Banknote, desc: 'Pay with cash when you receive your order' },
                { method: 'bank_transfer' as PaymentMethod, label: PAYMENT_METHOD_LABELS.bank_transfer, icon: CreditCard, desc: 'Bank details will be provided after confirmation' },
                { method: 'card' as PaymentMethod, label: PAYMENT_METHOD_LABELS.card, icon: CreditCard, desc: 'Visa, Mastercard (sandbox mode)' },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.method}
                    onClick={() => setPaymentMethod(opt.method)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === opt.method ? 'border-terracotta-500 bg-terracotta-50' : 'border-ink-200 hover:border-terracotta-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${paymentMethod === opt.method ? 'text-terracotta-500' : 'text-ink-400'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-800">{opt.label}</p>
                      <p className="text-xs text-ink-400">{opt.desc}</p>
                    </div>
                    {paymentMethod === opt.method && <Check className="w-5 h-5 text-terracotta-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special instructions */}
          <div className="card p-5">
            <label className="label">Order Notes (optional)</label>
            <textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} placeholder="Any special requests for your order..." rows={2} className="input resize-none" />
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h3 className="font-display text-lg font-semibold text-ink-800 mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.product_id + JSON.stringify(item.extras)} className="flex justify-between text-sm">
                  <span className="text-ink-600">{item.quantity}× {item.name}</span>
                  <span className="text-ink-800 font-medium">{formatPrice(item.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-ink-100 pt-4">
              <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-forest-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-ink-600"><span>Delivery Fee</span><span>{formatPrice(deliveryFee)}</span></div>
              <div className="flex justify-between font-bold text-ink-800 text-base border-t border-ink-100 pt-2">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
            <p className="text-xs text-ink-400 mt-2">You'll earn {Math.floor(total / 1000)} loyalty points!</p>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full mt-4">
              {submitting ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
