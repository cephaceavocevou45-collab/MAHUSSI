import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, Clock, Award, Flame, Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import ProductCard from '@/components/common/ProductCard';
import { formatPrice } from '@/lib/constants';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [dailySpecials, setDailySpecials] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*, category:categories(*)').eq('is_featured', true).eq('is_active', true).limit(8),
      supabase.from('products').select('*, category:categories(*)').eq('is_daily_special', true).eq('is_active', true).limit(4),
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
    ]).then(([feat, special, cats]) => {
      if (feat.data) setFeaturedProducts(feat.data as Product[]);
      if (special.data) setDailySpecials(special.data as Product[]);
      if (cats.data) setCategories(cats.data as Category[]);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-terracotta-500 via-terracotta-600 to-forest-700">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://images.pexels.com/photos/1410225/pexels-photo-1410225.jpeg?auto=compress&cs=tinysrgb&w=1920")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="badge bg-gold-500/20 text-gold-300 border border-gold-400/30 mb-4">
              <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
              Authentic African Cuisine
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              Taste the Soul of Africa
            </h1>
            <p className="text-lg text-cream-200/90 mb-8 max-w-lg">
              From handcrafted pastries to traditional dishes — order fresh, authentic African cuisine delivered to your door.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/menu" className="btn bg-gold-500 text-ink-900 hover:bg-gold-400 shadow-lg">
                Explore Menu <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register" className="btn border-2 border-white/30 text-white hover:bg-white/10">
                Join MAHUSSI
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-12 fill-cream-100">
            <path d="M0,30 C360,60 720,0 1080,20 C1260,30 1380,40 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Features bar */}
      <section className="bg-cream-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'Fast Delivery', desc: '30-45 min in your zone' },
              { icon: Clock, title: 'Fresh Daily', desc: 'Made to order' },
              { icon: Award, title: 'Loyalty Rewards', desc: 'Earn points per order' },
              { icon: Leaf, title: 'Authentic Recipes', desc: 'Traditional flavors' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-ink-100"
              >
                <div className="w-10 h-10 rounded-lg bg-terracotta-50 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-terracotta-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-800">{f.title}</p>
                  <p className="text-xs text-ink-400">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="section-title">Browse by Category</h2>
            <p className="text-ink-500 mt-2">Explore our diverse menu selections</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/menu?category=${cat.slug}`}
                  className="block card-hover text-center p-5"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-terracotta-100 to-gold-100 flex items-center justify-center mb-3 overflow-hidden">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-ink-800">{cat.name}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Specials */}
      {dailySpecials.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-gold-50 to-cream-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <span className="badge bg-gold-500 text-ink-900 mb-2">
                  <Flame className="w-3 h-3" /> Limited Time
                </span>
                <h2 className="section-title">Today's Specials</h2>
              </div>
              <Link to="/menu?filter=specials" className="btn-outline">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dailySpecials.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="section-title">Featured Favorites</h2>
              <p className="text-ink-500 mt-2">Most loved by our customers</p>
            </div>
            <Link to="/menu" className="btn-outline">
              Full Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="aspect-square skeleton" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-3 skeleton w-full" />
                    <div className="h-5 skeleton w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-forest-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-100 mb-4">
            Ready to Taste Africa?
          </h2>
          <p className="text-cream-200/80 mb-8 max-w-xl mx-auto">
            Join our loyalty program and earn points on every order. Climb tiers from Bronze to Platinum and unlock exclusive rewards.
          </p>
          <Link to="/register" className="btn bg-gold-500 text-ink-900 hover:bg-gold-400 shadow-lg">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
