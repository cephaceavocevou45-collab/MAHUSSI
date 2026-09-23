import { Link } from 'react-router-dom';
import { Star, Plus } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/constants';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1, []);
    toast(`${product.name} added to cart`, 'success');
  };

  return (
    <Link to={`/product/${product.id}`} className="card-hover group block">
      <div className="relative aspect-square overflow-hidden bg-cream-200">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-300">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {product.is_daily_special && (
          <span className="absolute top-2 left-2 badge bg-gold-500 text-ink-900">Daily Special</span>
        )}
        {product.is_featured && !product.is_daily_special && (
          <span className="absolute top-2 left-2 badge bg-terracotta-500 text-white">Featured</span>
        )}
        {product.tags.includes('spicy') && (
          <span className="absolute top-2 right-2 badge bg-red-500 text-white">🌶️ Spicy</span>
        )}
        {product.tags.includes('vegetarian') && (
          <span className="absolute top-2 right-2 badge bg-forest-500 text-white">🥬 Veg</span>
        )}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-terracotta-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-terracotta-600"
          aria-label="Add to cart"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm text-ink-800 line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-ink-400 mt-0.5 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-display font-bold text-terracotta-600">{formatPrice(product.price)}</span>
          {product.tags.includes('bestseller') && (
            <span className="flex items-center gap-0.5 text-xs text-gold-600">
              <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
              Bestseller
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
