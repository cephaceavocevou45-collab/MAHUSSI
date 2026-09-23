import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/types';
import ProductCard from '@/components/common/ProductCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatPrice } from '@/lib/constants';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const selectedCategory = searchParams.get('category') || 'all';
  const filter = searchParams.get('filter');

  const allTags = ['spicy', 'vegetarian', 'bestseller', 'gluten-free'];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('products').select('*, category:categories(*)').eq('is_active', true);

    if (selectedCategory !== 'all') {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', selectedCategory).maybeSingle();
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (filter === 'specials') query = query.eq('is_daily_special', true);
    if (filter === 'featured') query = query.eq('is_featured', true);

    if (search) query = query.ilike('name', `%${search}%`);
    query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);

    if (activeTags.length > 0) {
      query = query.contains('tags', activeTags);
    }

    const { data } = await query.order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  }, [selectedCategory, filter, search, priceRange, activeTags]);

  useEffect(() => {
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      if (data) setCategories(data as Category[]);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug === 'all') params.delete('category');
    else params.set('category', slug);
    setSearchParams(params);
  };

  const toggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink-800 mb-2">Our Menu</h1>
        <p className="text-ink-500">Discover authentic African pastries and cuisine</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline whitespace-nowrap"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-5 mb-6 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-ink-800">Filters</h3>
            <button onClick={() => { setActiveTags([]); setPriceRange([0, 50000]); }} className="text-sm text-terracotta-500 hover:underline">
              Reset all
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label">Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</label>
              <input
                type="range"
                min={0}
                max={50000}
                step={500}
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-terracotta-500"
              />
            </div>
            <div>
              <label className="label">Dietary Preferences</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`badge cursor-pointer transition-colors ${
                      activeTags.includes(tag)
                        ? 'bg-terracotta-500 text-white'
                        : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                    }`}
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    {activeTags.includes(tag) && <X className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        <button
          onClick={() => setCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'all' ? 'bg-terracotta-500 text-white' : 'bg-white text-ink-600 hover:bg-cream-200 border border-ink-100'
          }`}
        >
          All Items
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.slug)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.slug ? 'bg-terracotta-500 text-white' : 'bg-white text-ink-600 hover:bg-cream-200 border border-ink-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <LoadingSpinner size="lg" label="Loading menu..." />
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-400 text-lg">No dishes found matching your filters.</p>
          <button onClick={() => { setSearch(''); setActiveTags([]); setPriceRange([0, 50000]); setCategory('all'); }} className="btn-outline mt-4">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
