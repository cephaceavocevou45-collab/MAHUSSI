import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import { formatPrice } from '@/lib/constants';
import AdminSidebar from '@/components/layout/AdminSidebar';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Modal from '@/components/common/Modal';
import { useToast } from '@/context/ToastContext';

export default function AdminMenuPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', image_url: '', tags: '', is_featured: false, is_daily_special: false, is_active: true });

  useEffect(() => {
    fetchProducts();
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  const openModal = (product: Product | null) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        name: product.name,
        description: product.description ?? '',
        price: product.price.toString(),
        category_id: product.category_id ?? '',
        image_url: product.image_url ?? '',
        tags: product.tags.join(', '),
        is_featured: product.is_featured,
        is_daily_special: product.is_daily_special,
        is_active: product.is_active,
      });
    } else {
      setEditingProduct(null);
      setForm({ name: '', description: '', price: '', category_id: '', image_url: '', tags: '', is_featured: false, is_daily_special: false, is_active: true });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      category_id: form.category_id || null,
      image_url: form.image_url || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      is_featured: form.is_featured,
      is_daily_special: form.is_daily_special,
      is_active: form.is_active,
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      if (error) { toast(error.message, 'error'); return; }
      toast('Product updated', 'success');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { toast(error.message, 'error'); return; }
      toast('Product created', 'success');
    }
    setShowModal(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast('Product deleted', 'info');
    fetchProducts();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <PageHeader
          title="Menu Management"
          subtitle="Add, edit, and manage your menu items"
          action={<button onClick={() => openModal(null)} className="btn-primary"><Plus className="w-4 h-4" /> Add Product</button>}
        />

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input pl-10" />
        </div>

        {loading ? <LoadingSpinner size="lg" /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(product => (
              <div key={product.id} className="card overflow-hidden">
                <div className="aspect-video bg-cream-200 relative">
                  {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {product.is_featured && <span className="badge bg-terracotta-500 text-white text-[10px]">Featured</span>}
                    {product.is_daily_special && <span className="badge bg-gold-500 text-ink-900 text-[10px]">Special</span>}
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-sm text-ink-800">{product.name}</h3>
                      <p className="text-xs text-ink-400">{product.category?.name ?? 'Uncategorized'}</p>
                    </div>
                    <span className="font-semibold text-terracotta-600 text-sm">{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openModal(product)} className="btn-ghost text-xs flex-1"><Edit className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="btn-ghost text-xs text-red-500 hover:bg-red-50 flex-1"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Price (FCFA)</label>
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="input resize-none" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="input">
                  <option value="">Uncategorized</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Image URL</label>
                <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="input" placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="label">Tags (comma-separated)</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="input" placeholder="spicy, vegetarian, bestseller" />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="accent-terracotta-500" /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
                <input type="checkbox" checked={form.is_daily_special} onChange={e => setForm({ ...form, is_daily_special: e.target.checked })} className="accent-terracotta-500" /> Daily Special
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="accent-terracotta-500" /> Active
              </label>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="btn-primary flex-1">{editingProduct ? 'Update' : 'Create'}</button>
              <button onClick={() => setShowModal(false)} className="btn-ghost"><X className="w-4 h-4" /> Cancel</button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
