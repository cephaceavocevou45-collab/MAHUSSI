import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, ChefHat, Package, Truck, XCircle, RefreshCw, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Order, OrderItem } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS, DELIVERY_TYPE_LABELS, formatDate, formatPrice } from '@/lib/constants';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const statusSteps = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('orders').select('*, delivery_zone:delivery_zones(*)').eq('id', id).maybeSingle(),
      supabase.from('order_items').select('*').eq('order_id', id),
    ]).then(([orderRes, itemsRes]) => {
      if (orderRes.data) setOrder(orderRes.data as Order);
      if (itemsRes.data) setOrderItems(itemsRes.data as OrderItem[]);
      setLoading(false);
    });
  }, [id]);

  const handleReorder = async () => {
    if (!profile || !order) return;
    const orderNumber = `MH-${Date.now().toString().slice(-10)}`;
    const { data: newOrder, error } = await supabase.from('orders').insert({
      user_id: profile.id,
      order_number: orderNumber,
      status: 'placed',
      payment_method: order.payment_method,
      delivery_type: order.delivery_type,
      delivery_zone_id: order.delivery_zone_id,
      delivery_address: order.delivery_address,
      delivery_fee: order.delivery_fee,
      subtotal: order.subtotal,
      total: order.total,
      loyalty_points_earned: Math.floor(order.total / 1000),
    }).select().single();

    if (error || !newOrder) {
      toast('Failed to reorder. Please try again.', 'error');
      return;
    }

    const newItems = orderItems.map(item => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      extras: item.extras,
      special_instructions: item.special_instructions,
      line_total: item.line_total,
    }));
    await supabase.from('order_items').insert(newItems);
    toast('Order placed successfully!', 'success');
    navigate(`/orders/${newOrder.id}`);
  };

  const handleCancel = async () => {
    if (!order || !id) return;
    const { error } = await supabase.from('orders').update({ status: 'cancelled', cancellation_reason: 'Cancelled by customer' }).eq('id', id);
    if (error) {
      toast('Failed to cancel order', 'error');
      return;
    }
    setOrder({ ...order, status: 'cancelled' });
    toast('Order cancelled', 'info');
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading order..." />;
  if (!order) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-ink-400 text-lg">Order not found.</p>
      <Link to="/orders" className="btn-primary mt-4">Back to Orders</Link>
    </div>
  );

  const canCancel = ['placed', 'confirmed'].includes(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-terracotta-500 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-800">{order.order_number}</h1>
          <p className="text-sm text-ink-400">{formatDate(order.created_at)}</p>
        </div>
        <span className={`badge ${ORDER_STATUS_COLORS[order.status]} text-sm`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Progress tracker */}
      {order.status !== 'cancelled' ? (
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-1">
            {statusSteps.map((step, i) => {
              const stepIndex = statusSteps.indexOf(order.status);
              const isComplete = i <= stepIndex;
              const icons = [Clock, CheckCircle, ChefHat, Package, Truck, CheckCircle];
              const Icon = icons[i];
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isComplete ? 'bg-terracotta-500 text-white' : 'bg-ink-100 text-ink-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs ${isComplete ? 'text-terracotta-600 font-medium' : 'text-ink-400'}`}>
                      {ORDER_STATUS_LABELS[step as keyof typeof ORDER_STATUS_LABELS]}
                    </span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 -mt-5 ${i < stepIndex ? 'bg-terracotta-500' : 'bg-ink-100'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card p-6 mb-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="font-semibold text-red-700">Order Cancelled</p>
              {order.cancellation_reason && <p className="text-sm text-red-500">{order.cancellation_reason}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold text-ink-800 mb-4">Order Items</h3>
            <div className="space-y-3">
              {orderItems.map(item => (
                <div key={item.id} className="flex justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-800">{item.quantity}× {item.product_name}</p>
                    {item.extras && item.extras.length > 0 && (
                      <p className="text-xs text-ink-400">{item.extras.map((e: any) => e.name).join(', ')}</p>
                    )}
                    {item.special_instructions && (
                      <p className="text-xs text-terracotta-500">Note: {item.special_instructions}</p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-ink-800">{formatPrice(item.line_total)}</span>
                </div>
              ))}
            </div>
          </div>

          {order.special_instructions && (
            <div className="card p-5">
              <h3 className="font-semibold text-ink-800 mb-2">Order Notes</h3>
              <p className="text-sm text-ink-600">{order.special_instructions}</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold text-ink-800 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-forest-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between text-ink-600"><span>Delivery Fee</span><span>{formatPrice(order.delivery_fee)}</span></div>
              <div className="flex justify-between font-bold text-ink-800 text-base border-t border-ink-100 pt-2"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-ink-800 mb-3">Payment & Delivery</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-400">Payment</span><span className="text-ink-800">{PAYMENT_METHOD_LABELS[order.payment_method]}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-ink-400">Payment Status</span>
                <span className={`badge ${PAYMENT_STATUS_COLORS[order.payment_status]}`}>{PAYMENT_STATUS_LABELS[order.payment_status]}</span>
              </div>
              <div className="flex justify-between"><span className="text-ink-400">Delivery</span><span className="text-ink-800">{DELIVERY_TYPE_LABELS[order.delivery_type]}</span></div>
              {order.delivery_address && (
                <div className="flex items-start gap-2 pt-2 border-t border-ink-50">
                  <MapPin className="w-4 h-4 text-ink-400 mt-0.5" />
                  <span className="text-ink-600">{order.delivery_address}</span>
                </div>
              )}
              {order.estimated_delivery_time && (
                <div className="flex justify-between"><span className="text-ink-400">Est. Delivery</span><span className="text-ink-800">{formatDate(order.estimated_delivery_time)}</span></div>
              )}
              {order.pickup_time && (
                <div className="flex justify-between"><span className="text-ink-400">Pickup Time</span><span className="text-ink-800">{formatDate(order.pickup_time)}</span></div>
              )}
            </div>
            {order.loyalty_points_earned > 0 && (
              <p className="text-xs text-gold-600 mt-3">Earned {order.loyalty_points_earned} loyalty points!</p>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={handleReorder} className="btn-outline flex-1">
              <RefreshCw className="w-4 h-4" /> Reorder
            </button>
            {canCancel && (
              <button onClick={handleCancel} className="btn-ghost text-red-500 hover:bg-red-50 flex-1">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
