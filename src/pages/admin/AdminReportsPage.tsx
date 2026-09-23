import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/lib/constants';
import AdminSidebar from '@/components/layout/AdminSidebar';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [avgOrder, setAvgOrder] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState<{ date: string; total: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; count: number; revenue: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('total, status, created_at'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('order_items').select('product_name, quantity, line_total'),
    ]).then(([ordersRes, usersRes, itemsRes]) => {
      const orders = (ordersRes.data as any[]) || [];
      const completed = orders.filter(o => o.status !== 'cancelled');
      const totalRev = completed.reduce((sum, o) => sum + Number(o.total), 0);
      setRevenue(totalRev);
      setOrderCount(completed.length);
      setAvgOrder(completed.length > 0 ? totalRev / completed.length : 0);
      setCustomerCount(usersRes.count ?? 0);

      // Daily revenue (last 7 days)
      const byDate: Record<string, number> = {};
      completed.forEach(o => {
        const d = new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        byDate[d] = (byDate[d] || 0) + Number(o.total);
      });
      setDailyRevenue(Object.entries(byDate).slice(-7).map(([date, total]) => ({ date, total })));

      // Top products
      const prodStats: Record<string, { count: number; revenue: number }> = {};
      ((itemsRes.data as any[]) || []).forEach(item => {
        if (!prodStats[item.product_name]) prodStats[item.product_name] = { count: 0, revenue: 0 };
        prodStats[item.product_name].count += item.quantity;
        prodStats[item.product_name].revenue += Number(item.line_total);
      });
      setTopProducts(Object.entries(prodStats).map(([name, s]) => ({ name, ...s })).sort((a, b) => b.revenue - a.revenue).slice(0, 10));

      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const exportCSV = () => {
    const csv = ['Order #,Date,Status,Total'];
    recentOrders.forEach(o => {
      csv.push(`${o.order_number},${new Date(o.created_at).toISOString()},${o.status},${o.total}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mahussi-report.csv';
    a.click();
  };

  if (loading) return <div className="flex"><AdminSidebar /><div className="flex-1"><LoadingSpinner size="lg" /></div></div>;

  const maxRevenue = Math.max(...dailyRevenue.map(d => d.total), 1);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <PageHeader title="Reports & Analytics" subtitle="Track your restaurant performance"
          action={<button onClick={exportCSV} className="btn-outline"><Download className="w-4 h-4" /> Export CSV</button>} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: formatPrice(revenue), icon: DollarSign, color: 'forest' },
            { label: 'Orders', value: orderCount.toString(), icon: ShoppingBag, color: 'terracotta' },
            { label: 'Avg Order Value', value: formatPrice(avgOrder), icon: TrendingUp, color: 'gold' },
            { label: 'Customers', value: customerCount.toString(), icon: Users, color: 'terracotta' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card p-5">
                <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 text-${s.color}-500`} />
                </div>
                <p className="text-xl font-display font-bold text-ink-800">{s.value}</p>
                <p className="text-sm text-ink-400">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue chart */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink-800 mb-4">Revenue (Last 7 Days)</h3>
            {dailyRevenue.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-8">No data yet</p>
            ) : (
              <div className="flex items-end gap-2 h-48">
                {dailyRevenue.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-terracotta-200 rounded-t-lg transition-all hover:bg-terracotta-300" style={{ height: `${(d.total / maxRevenue) * 100}%` }}>
                      <div className="text-[10px] text-terracotta-700 text-center pt-1 font-medium">{Math.round(d.total / 1000)}k</div>
                    </div>
                    <span className="text-xs text-ink-400">{d.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top products */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink-800 mb-4">Best Sellers</h3>
            {topProducts.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-gold-50 text-gold-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="flex-1 text-sm text-ink-700">{p.name}</span>
                    <span className="text-xs text-ink-400">{p.count}×</span>
                    <span className="text-sm font-medium text-terracotta-600">{formatPrice(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
