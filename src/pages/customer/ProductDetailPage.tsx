import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Plus, Minus, ShoppingBag, ArrowLeft, Heart, Flame, Leaf, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, ProductExtra, Review, OrderItemExtra } from '@/types';
import { formatPrice, formatDate } from '@/lib/constants';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { profile } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [extras, setExtras] = useState<ProductExtra[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<OrderItemExtra[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('products').select('*, category:categories(*)').eq('id', id).maybeSingle(),
      supabase.from('product_extras').select('*').eq('product_id', id).order('sort_order'),
      supabase.from('reviews').select('*').eq('product_id', id).eq('is_published', true).order('created_at', { ascending: false }),
    ]).then(([prodRes, extrasRes, revRes]) => {
      if (prodRes.data) setProduct(prodRes.data as Product);
      if (extrasRes.data) setExtras(extrasRes.data as ProductExtra[]);
      if (revRes.data) setReviews(revRes.data as Review[]);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (profile && id) {
      supabase.from('favorites').select('id').eq('user_id', profile.id).eq('product_id', id).maybeSingle().then(({ data }) => {
        setIsFavorite(!!data);
      });
    }
  }, [profile, id]);

  const toggleExtra = (extra: ProductExtra) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.name === extra.name);
      if (exists) return prev.filter(e => e.name !== extra.name);
      return [...prev, { name: extra.name, price_adjustment: extra.price_adjustment }];
    });
  };

  const toggleFavorite = async () => {
    if (!profile) {
      toast('Please sign in to save favorites', 'info');
      return;
    }
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', profile.id).eq('product_id', id!);
      setIsFavorite(false);
      toast('Removed from favorites', 'info');
    } else {
      await supabase.from('favorites').insert({ user_id: profile.id, product_id: id! });
      setIsFavorite(true);
      toast('Added to favorites', 'success');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity, selectedExtras, specialInstructions || undefined);
    toast(`${product.name} added to cart`, 'success');
    navigate('/cart');
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading product..." />;
  if (!product) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-ink-400 text-lg">Product not found.</p>
      <Link to="/menu" className="btn-primary mt-4">Back to Menu</Link>
    </div>
  );

  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price_adjustment, 0);
  const unitPrice = product.price + extrasTotal;
  const totalPrice = unitPrice * quantity;
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const sizeExtras = extras.filter(e => e.type === 'size');
  const addonExtras = extras.filter(e => e.type === 'addon' || e.type === 'extra');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/menu" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-terracotta-500 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Menu
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="aspect-square rounded-2xl overflow-hidden bg-cream-200 shadow-md">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
            )}
          </div>
          <button
            onClick={toggleFavorite}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors ${
              isFavorite ? 'bg-terracotta-500 text-white' : 'bg-white text-ink-400 hover:text-terracotta-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex flex-wrap gap-2 mb-3">
            {product.tags.includes('bestseller') && (
              <span className="badge bg-gold-100 text-gold-700"><Award className="w-3 h-3" /> Bestseller</span>
            )}
            {product.tags.includes('spicy') && (
              <span className="badge bg-red-100 text-red-700"><Flame className="w-3 h-3" /> Spicy</span>
            )}
            {product.tags.includes('vegetarian') && (
              <span className="badge bg-forest-100 text-forest-700"><Leaf className="w-3 h-3" /> Vegetarian</span>
            )}
          </div>

          <h1 className="font-display text-3xl font-bold text-ink-800 mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(n => (
                <Star key={n} className={`w-4 h-4 ${n <= Math.round(avgRating) ? 'fill-gold-500 text-gold-500' : 'text-ink-200'}`} />
              ))}
            </div>
            <span className="text-sm text-ink-500">{avgRating.toFixed(1)} ({reviews.length} reviews)</span>
          </div>

          <p className="text-2xl font-display font-bold text-terracotta-600 mb-4">{formatPrice(product.price)}</p>
          <p className="text-ink-600 leading-relaxed mb-6">{product.description}</p>

          {/* Size options */}
          {sizeExtras.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-ink-800 mb-3">Choose Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {sizeExtras.map(extra => {
                  const isSelected = selectedExtras.some(e => e.name === extra.name);
                  return (
                    <button
                      key={extra.id}
                      onClick={() => {
                        const otherSizes = selectedExtras.filter(e => sizeExtras.some(se => se.name === e.name));
                        setSelectedExtras([...selectedExtras.filter(e => !otherSizes.includes(e)), { name: extra.name, price_adjustment: extra.price_adjustment }]);
                      }}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        isSelected ? 'border-terracotta-500 bg-terracotta-50' : 'border-ink-200 hover:border-terracotta-300'
                      }`}
                    >
                      <p className="text-sm font-medium text-ink-800">{extra.name}</p>
                      <p className="text-xs text-ink-500">{extra.price_adjustment > 0 ? `+${formatPrice(extra.price_adjustment)}` : 'Included'}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {addonExtras.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-ink-800 mb-3">Add Extras</h3>
              <div className="space-y-2">
                {addonExtras.map(extra => {
                  const isSelected = selectedExtras.some(e => e.name === extra.name);
                  return (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                        isSelected ? 'border-terracotta-500 bg-terracotta-50' : 'border-ink-200 hover:border-terracotta-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-ink-800">{extra.name}</span>
                      <span className="text-sm text-ink-500">+{formatPrice(extra.price_adjustment)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div className="mb-6">
            <label className="label">Special Instructions</label>
            <textarea
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              placeholder="e.g., no onions, extra spicy..."
              rows={2}
              className="input resize-none"
            />
          </div>

          {/* Quantity + Add */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-cream-200 rounded-xl p-1">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg bg-white flex items-center justify-center hover:bg-cream-100">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="w-9 h-9 rounded-lg bg-white flex items-center justify-center hover:bg-cream-100">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button onClick={handleAddToCart} className="btn-primary flex-1">
              <ShoppingBag className="w-4 h-4" />
              Add to Cart · {formatPrice(totalPrice)}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Tabs: Description / Reviews */}
      <div className="mt-12">
        <div className="flex gap-1 border-b border-ink-100 mb-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'description' ? 'border-terracotta-500 text-terracotta-600' : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'reviews' ? 'border-terracotta-500 text-terracotta-600' : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {activeTab === 'description' ? (
          <div className="prose max-w-none text-ink-600 leading-relaxed">
            <p>{product.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-cream-200 rounded-xl p-4">
                <p className="text-xs text-ink-400">Preparation Time</p>
                <p className="text-lg font-semibold text-ink-800">{product.prep_time_minutes} min</p>
              </div>
              <div className="bg-cream-200 rounded-xl p-4">
                <p className="text-xs text-ink-400">Spice Level</p>
                <p className="text-lg font-semibold text-ink-800">{'🌶️'.repeat(product.spice_level) || 'Mild'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-center text-ink-400 py-8">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`w-4 h-4 ${n <= review.rating ? 'fill-gold-500 text-gold-500' : 'text-ink-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-ink-400">{formatDate(review.created_at)}</span>
                  </div>
                  {review.comment && <p className="text-sm text-ink-600">{review.comment}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
