import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PromoCode } from '@/types';
import { formatPrice, formatDate } from '@/lib/constants';
import AdminSidebar from '@/components/layout/AdminSidebar';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Modal from '@/components/common/Modal';
import { useToast } from '@/context/ToastContext';

export default function AdminPromotionsPage() {
  const { toast } = useToast();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_uses: '', valid_until: '' });

  useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    setLoading(true);
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    setPromos((data as PromoCode[]) || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    const payload = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      valid_until: form.valid_until || null,
      is_active: true,
    };
    const { error } = await supabase.from('promo_codes').insert(payload);
    if (error) { toast(error.message, 'error'); return; }
    toast('Promo code created', 'success');
    setShowModal(false);
    setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_uses: '', valid_until: '' });
    fetchPromos();
  };

  const toggleActive = async (promo: PromoCode) => {
    await supabase.from('promo_codes').update({ is_active: !promo.is_active }).eq('id', promo.id);
    fetchPromos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    await supabase.from('promo_codes').delete().eq('id', id);
    toast('Promo code deleted', 'info');
    fetchPromos();
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <PageHeader title="Promotions" subtitle="Manage discount codes and promotions"
          action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Promo Code</button>} />

        {loading ? <LoadingSpinner size="lg" /> : promos.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 mx-auto text-ink-200 mb-3" />
            <p className="text-ink-400">No promo codes yet</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map(p => (
              <div key={p.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-display text-lg font-bold text-terracotta-600">{p.code}</span>
                    <p className="text-sm text-ink-500">{p.discount_type === 'percentage' ? `${p.discount_value}% off` : `${formatPrice(Number(p.discount_value))} off`}</p>
                  </div>
                  <button onClick={() => toggleActive(p)} className={`badge cursor-pointer ${p.is_active ? 'bg-forest-100 text-forest-700' : 'bg-ink-100 text-ink-500'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="text-xs text-ink-400 space-y-1">
                  <p>Min order: {formatPrice(Number(p.min_order_amount))}</p>
                  <p>Used: {p.uses_count}{p.max_uses ? ` / ${p.max_uses}` : ''}</p>
                  {p.valid_until && <p>Valid until: {formatDate(p.valid_until)}</p>}
                </div>
                <button onClick={() => handleDelete(p.id)} className="btn-ghost text-xs text-red-500 hover:bg-red-50 mt-3 w-full"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Promo Code">
          <div className="space-y-4">
            <div>
              <label className="label">Code</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input uppercase" placeholder="SUMMER20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Discount Type</label>
                <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="input">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="label">Value</label>
                <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} className="input" placeholder="20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Min Order (FCFA)</label>
                <input type="number" value={form.min_order_amount} onChange={e => setForm({ ...form, min_order_amount: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Max Uses (optional)</label>
                <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Valid Until (optional)</label>
              <input type="datetime-local" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} className="input" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCreate} className="btn-primary flex-1">Create</button>
              <button onClick={() => setShowModal(false)} className="btn-ghost"><X className="w-4 h-4" /> Cancel</button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
