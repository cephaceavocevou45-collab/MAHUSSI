import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, ChefHat, XCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Order } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_METHOD_LABELS, formatDate, formatPrice } from '@/lib/constants';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const statusSteps = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

export default function OrdersPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!profile) return;
    let query = supabase.from('orders').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    query.then(({ data }) => {
      setOrders((data as Order[]) || []);
      setLoading(false);
    });
  }, [profile, filter]);

  if (loading) return <LoadingSpinner size="lg" label="Loading your orders..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-ink-800 mb-6">My Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {['all', 'placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-terracotta-500 text-white' : 'bg-white text-ink-600 hover:bg-cream-200 border border-ink-100'
            }`}
          >
            {f === 'all' ? 'All Orders' : ORDER_STATUS_LABELS[f as keyof typeof ORDER_STATUS_LABELS]}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-ink-200 mb-4" />
          <p className="text-ink-400 text-lg mb-4">No orders found.</p>
          <Link to="/menu" className="btn-primary">Start Ordering <ArrowRight className="w-4 h-4" /></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold text-ink-800">{order.order_number}</span>
                    <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                  </div>
                  <p className="text-xs text-ink-400">{formatDate(order.created_at)}</p>
                  <p className="text-sm text-ink-600 mt-1">
                    {order.order_items?.length ?? '—'} items · {PAYMENT_METHOD_LABELS[order.payment_method]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-terracotta-600">{formatPrice(order.total)}</p>
                </div>
              </div>

              {/* Progress tracker */}
              {order.status !== 'cancelled' && (
                <div className="flex items-center gap-1 mt-4">
                  {statusSteps.map((step, i) => {
                    const stepIndex = statusSteps.indexOf(order.status);
                    const isComplete = i <= stepIndex;
                    const icons = [Clock, CheckCircle, ChefHat, Package, Truck, CheckCircle];
                    const Icon = icons[i];
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          isComplete ? 'bg-terracotta-500 text-white' : 'bg-ink-100 text-ink-300'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {i < statusSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 ${i < stepIndex ? 'bg-terracotta-500' : 'bg-ink-100'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
