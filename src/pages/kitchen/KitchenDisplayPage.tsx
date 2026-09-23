import { useEffect, useState } from 'react';
import { ChefHat, Clock, Check, Package, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderItem } from '@/types';
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/constants';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';

export default function KitchenDisplayPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<(Order & { order_items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'preparing' | 'ready'>('new');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .in('status', ['confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: true });
    setOrders((data as any[]) || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: Order['status']) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    toast(`Order moved to ${ORDER_STATUS_LABELS[status]}`, 'success');

    const order = orders.find(o => o.id === id);
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

  const filtered = orders.filter(o => {
    if (activeTab === 'new') return o.status === 'confirmed';
    if (activeTab === 'preparing') return o.status === 'preparing';
    return o.status === 'ready';
  });

  if (loading) return <LoadingSpinner size="lg" label="Loading kitchen orders..." />;

  return (
    <div className="min-h-screen bg-ink-50 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta-500 to-gold-500 flex items-center justify-center">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-800">Kitchen Display</h1>
            <p className="text-sm text-ink-400">Live order queue</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['new', 'preparing', 'ready'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'bg-terracotta-500 text-white' : 'bg-white text-ink-600 hover:bg-cream-100'
              }`}
            >
              {tab === 'new' ? 'New' : tab} ({orders.filter(o => tab === 'new' ? o.status === 'confirmed' : tab === 'preparing' ? o.status === 'preparing' : o.status === 'ready').length})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 mx-auto text-ink-200 mb-4" />
          <p className="text-ink-400 text-lg">No orders in this queue.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(order => {
            const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
            const isUrgent = elapsed > 15;
            return (
              <div key={order.id} className={`card p-4 border-l-4 ${isUrgent ? 'border-l-red-500' : 'border-l-terracotta-500'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-bold text-ink-800">{order.order_number}</span>
                  <span className={`badge ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-cream-200 text-ink-600'}`}>
                    <Clock className="w-3 h-3" /> {elapsed}m ago
                  </span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {order.order_items?.map(item => (
                    <div key={item.id} className="text-sm">
                      <span className="font-medium text-ink-800">{item.quantity}×</span> <span className="text-ink-600">{item.product_name}</span>
                      {item.extras && item.extras.length > 0 && (
                        <p className="text-xs text-ink-400 ml-4">{item.extras.map((e: any) => e.name).join(', ')}</p>
                      )}
                      {item.special_instructions && (
                        <p className="text-xs text-terracotta-500 ml-4 flex items-center gap-1"><Flame className="w-3 h-3" /> {item.special_instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-3 border-t border-ink-50">
                  {order.status === 'confirmed' && (
                    <button onClick={() => updateStatus(order.id, 'preparing')} className="btn-primary text-xs flex-1">
                      <Flame className="w-3.5 h-3.5" /> Start Cooking
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateStatus(order.id, 'ready')} className="btn-secondary text-xs flex-1">
                      <Check className="w-3.5 h-3.5" /> Mark Ready
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <div className="text-xs text-forest-600 font-medium flex items-center gap-1 w-full justify-center py-2">
                      <Check className="w-4 h-4" /> Ready for pickup/delivery
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
