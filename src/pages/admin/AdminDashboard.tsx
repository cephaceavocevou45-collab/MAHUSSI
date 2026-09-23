import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, DollarSign, Users, TrendingUp, Clock, ArrowRight, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import type { Order } from '@/types';
import AdminSidebar from '@/components/layout/AdminSidebar';
import PageHeader from '@/components/common/PageHeader';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, activeUsers: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('total, status'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(8),
      supabase.from('order_items').select('product_name').limit(100),
    ]).then(([ordersRes, usersRes, recentRes, itemsRes]) => {
      const orders = ordersRes.data || [];
      const revenue = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
      const pending = orders.filter((o: any) => ['placed', 'confirmed', 'preparing'].includes(o.status)).length;
      setStats({
        totalOrders: orders.length,
        revenue,
        activeUsers: usersRes.count ?? 0,
        pendingOrders: pending,
      });
      if (recentRes.data) setRecentOrders(recentRes.data as Order[]);

      // Count top products
      if (itemsRes.data) {
        const counts: Record<string, number> = {};
        itemsRes.data.forEach((item: any) => {
          counts[item.product_name] = (counts[item.product_name] || 0) + 1;
        });
        const top = Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
        setTopProducts(top);
      }
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'terracotta' },
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'forest' },
    { label: 'Active Users', value: stats.activeUsers.toString(), icon: Users, color: 'gold' },
    { label: 'Pending Orders', value: stats.pendingOrders.toString(), icon: Clock, color: 'terracotta' },
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <PageHeader title="Dashboard" subtitle="Overview of your restaurant performance" />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${card.color}-500`} />
                  </div>
                </div>
                <p className="text-2xl font-display font-bold text-ink-800">{card.value}</p>
                <p className="text-sm text-ink-400">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-800">Recent Orders</h3>
              <Link to="/admin/orders" className="text-sm text-terracotta-500 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-ink-400 text-center py-4">No orders yet</p>
              ) : (
                recentOrders.map(order => (
                  <Link key={order.id} to={`/admin/orders/${order.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-cream-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-ink-800">{order.order_number}</p>
                      <p className="text-xs text-ink-400">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                      <span className="text-sm font-semibold text-terracotta-600">{formatPrice(order.total)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Top products */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-800">Top Products</h3>
              <TrendingUp className="w-5 h-5 text-ink-300" />
            </div>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-sm text-ink-400 text-center py-4">No data yet</p>
              ) : (
                topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold-50 flex items-center justify-center text-sm font-bold text-gold-600">{i + 1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-800">{p.name}</p>
                      <div className="w-full bg-ink-100 rounded-full h-1.5 mt-1">
                        <div className="bg-terracotta-500 h-1.5 rounded-full" style={{ width: `${(p.count / topProducts[0].count) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-sm text-ink-500">{p.count}×</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
