import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/constants';
import AdminSidebar from '@/components/layout/AdminSidebar';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase.from('reviews').select('*, product:products(name)').order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  const togglePublish = async (review: any) => {
    await supabase.from('reviews').update({ is_published: !review.is_published }).eq('id', review.id);
    toast(review.is_published ? 'Review hidden' : 'Review published', 'success');
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    toast('Review deleted', 'info');
    fetchReviews();
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <PageHeader title="Reviews" subtitle="Moderate customer reviews" />

        {loading ? <LoadingSpinner size="lg" /> : reviews.length === 0 ? (
          <p className="text-center text-ink-400 py-12">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => (
              <div key={review.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-4 h-4 ${n <= review.rating ? 'fill-gold-500 text-gold-500' : 'text-ink-200'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-ink-700">{review.product?.name ?? 'Unknown product'}</span>
                      <span className={`badge ${review.is_published ? 'bg-forest-100 text-forest-700' : 'bg-ink-100 text-ink-500'}`}>
                        {review.is_published ? 'Published' : 'Hidden'}
                      </span>
                    </div>
                    {review.comment && <p className="text-sm text-ink-600">{review.comment}</p>}
                    <p className="text-xs text-ink-400 mt-1">{formatDate(review.created_at)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => togglePublish(review)} className="btn-ghost text-xs">
                      {review.is_published ? 'Hide' : 'Publish'}
                    </button>
                    <button onClick={() => handleDelete(review.id)} className="btn-ghost text-xs text-red-500 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
