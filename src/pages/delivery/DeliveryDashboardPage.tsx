import { useEffect, useState } from 'react';
import { Truck, MapPin, Clock, Check, Package, Navigation } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Order } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatPrice, formatDate } from '@/lib/constants';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';

export default function DeliveryDashboardPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assigned' | 'delivered'>('assigned');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('assigned_to', profile.id)
      .order('created_at', { ascending: false });
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: Order['status']) => {
    const updates: any = { status };
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    await supabase.from('orders').update(updates).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    toast(`Order marked as ${ORDER_STATUS_LABELS[status]}`, 'success');

    const order = orders.find(o => o.id === id);
    if (order?.user_id) {
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        title: 'Delivery Update',
        message: `Your order ${order.order_number} is now ${ORDER_STATUS_LABELS[status]}.`,
        type: 'delivery',
        related_id: id,
      });
    }
  };

  const filtered = orders.filter(o => activeTab === 'assigned' ? o.status === 'out_for_delivery' : o.status === 'delivered');

  if (loading) return <LoadingSpinner size="lg" label="Loading deliveries..." />;

  return (
    <div className="min-h-screen bg-cream-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest-500 to-terracotta-500 flex items-center justify-center">
            <Truck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-800">Delivery Dashboard</h1>
            <p className="text-sm text-ink-400">Welcome, {profile?.full_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['assigned', 'delivered'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'bg-terracotta-500 text-white' : 'bg-white text-ink-600 hover:bg-cream-200'
              }`}
            >
              {tab} ({tab === 'assigned' ? orders.filter(o => o.status === 'out_for_delivery').length : orders.filter(o => o.status === 'delivered').length})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 mx-auto text-ink-200 mb-4" />
          <p className="text-ink-400 text-lg">No {activeTab} deliveries.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(order => (
            <div key={order.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold text-ink-800">{order.order_number}</span>
                <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-start gap-2 text-ink-600">
                  <MapPin className="w-4 h-4 mt-0.5 text-terracotta-500 flex-shrink-0" />
                  <span>{order.delivery_address ?? 'Pickup order'}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-500">
                  <Clock className="w-4 h-4 text-ink-400" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-500">
                  <Package className="w-4 h-4 text-ink-400" />
                  <span>{formatPrice(order.total)} · {order.payment_method === 'cash_on_delivery' ? 'Cash on delivery' : 'Paid'}</span>
                </div>
              </div>

              {order.status === 'out_for_delivery' && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(order.id, 'delivered')} className="btn-secondary text-xs flex-1">
                    <Check className="w-3.5 h-3.5" /> Mark Delivered
                  </button>
                  <a href={`https://maps.google.com?q=${encodeURIComponent(order.delivery_address ?? '')}`} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs">
                    <Navigation className="w-3.5 h-3.5" /> Navigate
                  </a>
                </div>
              )}
              {order.status === 'delivered' && order.delivered_at && (
                <p className="text-xs text-forest-600 font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> Delivered at {formatDate(order.delivered_at)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
