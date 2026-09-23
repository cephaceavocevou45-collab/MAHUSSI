import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_METHOD_LABELS, formatDate, formatPrice } from '@/lib/constants';
import AdminSidebar from '@/components/layout/AdminSidebar';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    if (paymentFilter !== 'all') query = query.eq('payment_method', paymentFilter);
    const { data } = await query;
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    (o.delivery_address ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id: string, status: Order['status']) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <PageHeader title="Orders" subtitle="Manage all customer orders" />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="input pl-10" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-auto">
            <option value="all">All Statuses</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="input w-auto">
            <option value="all">All Payments</option>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : filtered.length === 0 ? (
          <p className="text-center text-ink-400 py-12">No orders found.</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 text-ink-500 text-xs uppercase">
                <tr>
                  <th className="text-left p-3">Order #</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Payment</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-3 font-medium text-ink-800">
                      <Link to={`/admin/orders/${order.id}`} className="hover:text-terracotta-500">{order.order_number}</Link>
                    </td>
                    <td className="p-3 text-ink-500">{formatDate(order.created_at)}</td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value as Order['status'])}
                        className={`text-xs font-medium rounded-lg border-0 cursor-pointer px-2 py-1 ${ORDER_STATUS_COLORS[order.status]}`}
                      >
                        {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-ink-500">{PAYMENT_METHOD_LABELS[order.payment_method]}</td>
                    <td className="p-3 font-semibold text-terracotta-600">{formatPrice(order.total)}</td>
                    <td className="p-3">
                      <Link to={`/admin/orders/${order.id}`} className="text-terracotta-500 hover:underline text-xs">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
