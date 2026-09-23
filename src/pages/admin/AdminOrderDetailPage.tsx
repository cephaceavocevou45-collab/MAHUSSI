import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, CreditCard, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderItem } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS, DELIVERY_TYPE_LABELS, formatDate, formatPrice } from '@/lib/constants';
import AdminSidebar from '@/components/layout/AdminSidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignTo, setAssignTo] = useState('');
  const [deliveryAgents, setDeliveryAgents] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('orders').select('*, delivery_zone:delivery_zones(*)').eq('id', id).maybeSingle(),
      supabase.from('order_items').select('*').eq('order_id', id),
      supabase.from('profiles').select('id, full_name').eq('role', 'delivery_agent'),
    ]).then(([orderRes, itemsRes, agentsRes]) => {
      if (orderRes.data) setOrder(orderRes.data as Order);
      if (itemsRes.data) setItems(itemsRes.data as OrderItem[]);
      if (agentsRes.data) setDeliveryAgents(agentsRes.data as any);
      setLoading(false);
    });
  }, [id]);

  const updateStatus = async (status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id!);
    if (error) { toast('Failed to update status', 'error'); return; }
    setOrder(prev => prev ? { ...prev, status } : null);
    toast('Order status updated', 'success');

    // Notify customer
    if (order?.user_id) {
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        title: 'Order Status Updated',
        message: `Your order ${order.order_number} is now ${ORDER_STATUS_LABELS[status]}.`,
        type: 'order',
        related_id: id,
      });
    }
  };

  const updatePaymentStatus = async (payment_status: Order['payment_status']) => {
    await supabase.from('orders').update({ payment_status }).eq('id', id!);
    setOrder(prev => prev ? { ...prev, payment_status } : null);
    toast('Payment status updated', 'success');
  };

  const assignAgent = async () => {
    if (!assignTo) return;
    await supabase.from('orders').update({ assigned_to: assignTo, status: 'out_for_delivery' }).eq('id', id!);
    setOrder(prev => prev ? { ...prev, assigned_to: assignTo, status: 'out_for_delivery' } : null);
    toast('Delivery agent assigned', 'success');
  };

  if (loading) return <div className="flex"><AdminSidebar /><div className="flex-1"><LoadingSpinner size="lg" /></div></div>;
  if (!order) return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8 text-center">
        <p className="text-ink-400">Order not found.</p>
        <Link to="/admin/orders" className="btn-primary mt-4">Back to Orders</Link>
      </div>
    </div>
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-terracotta-500 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-800">{order.order_number}</h1>
            <p className="text-sm text-ink-400">{formatDate(order.created_at)}</p>
          </div>
          <span className={`badge ${ORDER_STATUS_COLORS[order.status]} text-sm`}>{ORDER_STATUS_LABELS[order.status]}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="card p-5">
              <h3 className="font-semibold text-ink-800 mb-4">Order Items</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-ink-800">{item.quantity}× {item.product_name}</p>
                      {item.extras && item.extras.length > 0 && <p className="text-xs text-ink-400">{item.extras.map((e: any) => e.name).join(', ')}</p>}
                    </div>
                    <span className="text-sm font-medium">{formatPrice(item.line_total)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-ink-100 mt-4 pt-3 space-y-1 text-sm">
                    <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                    {order.discount > 0 && <div className="flex justify-between text-forest-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
                    <div className="flex justify-between text-ink-600"><span>Delivery Fee</span><span>{formatPrice(order.delivery_fee)}</span></div>
                    <div className="flex justify-between font-bold text-ink-800"><span>Total</span><span>{formatPrice(order.total)}</span></div>
                  </div>
            </div>

            {/* Status management */}
            <div className="card p-5">
              <h3 className="font-semibold text-ink-800 mb-4">Manage Order</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Order Status</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                      <button
                        key={k}
                        onClick={() => updateStatus(k as Order['status'])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          order.status === k ? ORDER_STATUS_COLORS[k] : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Payment Status</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => (
                      <button
                        key={k}
                        onClick={() => updatePaymentStatus(k as Order['payment_status'])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          order.payment_status === k ? PAYMENT_STATUS_COLORS[k as keyof typeof PAYMENT_STATUS_COLORS] : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                {order.delivery_type === 'internal_delivery' && (
                  <div>
                    <label className="label">Assign Delivery Agent</label>
                    <div className="flex gap-2">
                      <select value={assignTo} onChange={e => setAssignTo(e.target.value)} className="input flex-1">
                        <option value="">Select agent...</option>
                        {deliveryAgents.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                      </select>
                      <button onClick={assignAgent} className="btn-primary">Assign</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Customer</h3>
              <p className="text-sm text-ink-600">Order placed by registered customer</p>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Delivery</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-400">Type</span><span className="text-ink-800">{DELIVERY_TYPE_LABELS[order.delivery_type]}</span></div>
                {order.delivery_address && <p className="text-ink-600">{order.delivery_address}</p>}
                {order.pickup_time && <div className="flex justify-between"><span className="text-ink-400">Pickup</span><span className="text-ink-800">{formatDate(order.pickup_time)}</span></div>}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-ink-800 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-400">Method</span><span className="text-ink-800">{PAYMENT_METHOD_LABELS[order.payment_method]}</span></div>
                <div className="flex justify-between items-center"><span className="text-ink-400">Status</span><span className={`badge ${PAYMENT_STATUS_COLORS[order.payment_status]}`}>{PAYMENT_STATUS_LABELS[order.payment_status]}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
