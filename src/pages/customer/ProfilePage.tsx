import { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Award, Heart, ShoppingBag, Edit, Save, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { LOYALTY_TIERS, ROLE_LABELS, formatPrice } from '@/lib/constants';
import type { Product, Favorite } from '@/types';
import ProductCard from '@/components/common/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('favorites')
      .select('product_id, product:products(*)')
      .eq('user_id', profile.id)
      .then(({ data }) => {
        if (data) setFavorites(data.map((f: any) => f.product as Product));
      });
  }, [profile]);

  if (!profile) return <LoadingSpinner size="lg" />;

  const tier = LOYALTY_TIERS[profile.loyalty_tier];
  const nextTier = Object.values(LOYALTY_TIERS).find(t => t.min > profile.loyalty_points);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      phone,
      address,
      city,
    }).eq('id', profile.id);
    if (error) {
      toast('Failed to update profile', 'error');
    } else {
      await refreshProfile();
      toast('Profile updated successfully', 'success');
      setEditing(false);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-ink-800 mb-6">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="md:col-span-1">
          <div className="card p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-terracotta-400 to-gold-400 flex items-center justify-center text-white text-2xl font-bold mb-3">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-display text-lg font-semibold text-ink-800">{profile.full_name}</h2>
            <p className="text-sm text-ink-400">{profile.email}</p>
            <span className="badge bg-cream-200 text-terracotta-600 mt-2">{ROLE_LABELS[profile.role]}</span>

            {/* Loyalty */}
            <div className="mt-6 pt-6 border-t border-ink-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className={`w-5 h-5 ${tier.color}`} />
                <span className={`font-display text-lg font-bold ${tier.color}`}>{tier.label} Member</span>
              </div>
              <p className="text-sm text-ink-600">{profile.loyalty_points} points</p>
              {nextTier && (
                <p className="text-xs text-ink-400 mt-1">{nextTier.min - profile.loyalty_points} points to {nextTier.label}</p>
              )}
              <div className="w-full bg-ink-100 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-terracotta-400 to-gold-400 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (profile.loyalty_points / (nextTier?.min ?? 3000)) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-800">Personal Information</h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="btn-ghost text-sm"><Edit className="w-4 h-4" /> Edit</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="btn-ghost text-sm"><X className="w-4 h-4" /> Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm"><Save className="w-4 h-4" /> Save</button>
                </div>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                {editing ? <input value={fullName} onChange={e => setFullName(e.target.value)} className="input" /> : (
                  <div className="flex items-center gap-2 text-ink-700"><User className="w-4 h-4 text-ink-400" /> {profile.full_name}</div>
                )}
              </div>
              <div>
                <label className="label">Email</label>
                <div className="flex items-center gap-2 text-ink-700"><Mail className="w-4 h-4 text-ink-400" /> {profile.email}</div>
              </div>
              <div>
                <label className="label">Phone</label>
                {editing ? <input value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="Your phone" /> : (
                  <div className="flex items-center gap-2 text-ink-700"><Phone className="w-4 h-4 text-ink-400" /> {profile.phone || 'Not set'}</div>
                )}
              </div>
              <div>
                <label className="label">City</label>
                {editing ? <input value={city} onChange={e => setCity(e.target.value)} className="input" placeholder="Your city" /> : (
                  <div className="flex items-center gap-2 text-ink-700"><MapPin className="w-4 h-4 text-ink-400" /> {profile.city || 'Not set'}</div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address</label>
                {editing ? <textarea value={address} onChange={e => setAddress(e.target.value)} className="input resize-none" rows={2} placeholder="Your address" /> : (
                  <div className="flex items-center gap-2 text-ink-700"><MapPin className="w-4 h-4 text-ink-400" /> {profile.address || 'Not set'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Favorites */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-terracotta-500" /> Favorite Items
            </h3>
            {favorites.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-4">No favorites yet. Tap the heart icon on any product!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {favorites.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
