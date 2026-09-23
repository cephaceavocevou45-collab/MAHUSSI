import { useEffect, useState } from 'react';
import { Plus, Trash2, X, MapPin, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DeliveryZone } from '@/types';
import { formatPrice } from '@/lib/constants';
import AdminSidebar from '@/components/layout/AdminSidebar';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Modal from '@/components/common/Modal';
import { useToast } from '@/context/ToastContext';

export default function AdminDeliveryZonesPage() {
  const { toast } = useToast();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState({ name: '', description: '', base_price: '', estimated_time_minutes: '30' });

  useEffect(() => { fetchZones(); }, []);

  const fetchZones = async () => {
    setLoading(true);
    const { data } = await supabase.from('delivery_zones').select('*').order('base_price');
    setZones((data as DeliveryZone[]) || []);
    setLoading(false);
  };

  const openModal = (zone: DeliveryZone | null) => {
    if (zone) {
      setEditing(zone);
      setForm({ name: zone.name, description: zone.description ?? '', base_price: zone.base_price.toString(), estimated_time_minutes: zone.estimated_time_minutes.toString() });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', base_price: '', estimated_time_minutes: '30' });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      description: form.description || null,
      base_price: parseFloat(form.base_price),
      estimated_time_minutes: parseInt(form.estimated_time_minutes),
      is_active: true,
    };
    if (editing) {
      const { error } = await supabase.from('delivery_zones').update(payload).eq('id', editing.id);
      if (error) { toast(error.message, 'error'); return; }
      toast('Zone updated', 'success');
    } else {
      const { error } = await supabase.from('delivery_zones').insert(payload);
      if (error) { toast(error.message, 'error'); return; }
      toast('Zone created', 'success');
    }
    setShowModal(false);
    fetchZones();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this zone?')) return;
    await supabase.from('delivery_zones').delete().eq('id', id);
    toast('Zone deleted', 'info');
    fetchZones();
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <PageHeader title="Delivery Zones" subtitle="Manage delivery areas and pricing"
          action={<button onClick={() => openModal(null)} className="btn-primary"><Plus className="w-4 h-4" /> Add Zone</button>} />

        {loading ? <LoadingSpinner size="lg" /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map(zone => (
              <div key={zone.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-terracotta-50 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-terracotta-500" />
                    </div>
                    <h3 className="font-semibold text-ink-800">{zone.name}</h3>
                  </div>
                </div>
                {zone.description && <p className="text-sm text-ink-400 mb-2">{zone.description}</p>}
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-ink-600">Fee: <strong className="text-terracotta-600">{formatPrice(Number(zone.base_price))}</strong></span>
                  <span className="text-ink-600">Est: <strong>{zone.estimated_time_minutes} min</strong></span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(zone)} className="btn-ghost text-xs flex-1"><Edit className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => handleDelete(zone.id)} className="btn-ghost text-xs text-red-500 hover:bg-red-50 flex-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Zone' : 'Add Delivery Zone'}>
          <div className="space-y-4">
            <div>
              <label className="label">Zone Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Downtown Dakar" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Base Price (FCFA)</label>
                <input type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })} className="input" placeholder="1000" />
              </div>
              <div>
                <label className="label">Est. Time (min)</label>
                <input type="number" value={form.estimated_time_minutes} onChange={e => setForm({ ...form, estimated_time_minutes: e.target.value })} className="input" placeholder="30" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="btn-primary flex-1">{editing ? 'Update' : 'Create'}</button>
              <button onClick={() => setShowModal(false)} className="btn-ghost"><X className="w-4 h-4" /> Cancel</button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
