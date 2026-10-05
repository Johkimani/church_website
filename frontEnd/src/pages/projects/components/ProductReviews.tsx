import { useState, useEffect } from 'react';
import { FaStar, FaSpinner, FaCheck } from 'react-icons/fa';
import { apiClient } from '../../../api/axiosInstance';

interface Review {
  id: number;
  product_id: number;
  customer_name: string;
  rating: number;
  title: string;
  comment: string;
  approved: boolean;
  created_at: string;
}

interface ReviewStats {
  avg: number;
  count: number;
  distribution: Record<number, number>;
}

const StarRating: React.FC<{ rating: number; size?: number; interactive?: boolean; onChange?: (r: number) => void }> = ({
  rating, size = 16, interactive = false, onChange
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(s)}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <FaStar
            size={size}
            className={s <= (hover || rating) ? 'text-amber-400' : 'text-slate-200'}
          />
        </button>
      ))}
    </div>
  );
};

export const ReviewStatsBar: React.FC<{ stats: ReviewStats }> = ({ stats }) => {
  if (stats.count === 0) return null;
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <p className="text-3xl font-black text-slate-800">{stats.avg}</p>
        <StarRating rating={Math.round(stats.avg)} size={14} />
        <p className="text-[10px] text-slate-500 mt-1">{stats.count} review{stats.count !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex-1 space-y-1">
        {[5, 4, 3, 2, 1].map(n => {
          const pct = stats.count > 0 ? (stats.distribution[n] / stats.count) * 100 : 0;
          return (
            <div key={n} className="flex items-center gap-2 text-[10px]">
              <span className="w-3 text-slate-500 text-right">{n}</span>
              <FaStar size={8} className="text-amber-400" />
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-6 text-slate-400 text-right">{stats.distribution[n] || 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ReviewForm: React.FC<{ productId: number; onSubmit: () => void }> = ({ productId, onSubmit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rating === 0) {
      setError('Please provide your name and a rating');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post('/product-reviews', {
        product_id: productId,
        customer_name: name.trim(),
        customer_phone: phone.trim() || null,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
      setSubmitted(true);
      onSubmit();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <FaCheck size={32} className="text-emerald-500 mx-auto mb-2" />
        <p className="font-bold text-emerald-800">Review submitted!</p>
        <p className="text-xs text-emerald-600 mt-1">Thank you for your feedback. It will appear after admin approval.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <h4 className="font-bold text-sm text-slate-800">Write a Review</h4>

      {error && <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}

      <div>
        <label className="text-xs font-bold text-slate-600 mb-1 block">Your Rating *</label>
        <StarRating rating={rating} size={24} interactive onChange={setRating} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-600 mb-1 block">Your Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} required
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="John Doe" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 mb-1 block">Phone (optional)</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="0712 345 678" />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-600 mb-1 block">Review Title (optional)</label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Great product!" />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-600 mb-1 block">Your Review (optional)</label>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" placeholder="Tell others what you think..." />
      </div>

      <button type="submit" disabled={submitting || rating === 0}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2">
        {submitting ? <><FaSpinner className="animate-spin" /> Submitting...</> : 'Submit Review'}
      </button>
    </form>
  );
};

export const ReviewsList: React.FC<{ productId: number }> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ avg: 0, count: 0, distribution: {} });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [revRes, statsRes] = await Promise.all([
        apiClient.get(`/product-reviews?product_id=${productId}`),
        apiClient.get(`/product-reviews/stats?product_id=${productId}`),
      ]);
      setReviews(Array.isArray(revRes.data) ? revRes.data : []);
      setStats(statsRes.data || { avg: 0, count: 0, distribution: {} });
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [productId]);

  if (loading) return <div className="flex items-center justify-center py-8"><FaSpinner className="animate-spin text-blue-500" size={20} /></div>;

  return (
    <div className="space-y-6">
      {stats.count > 0 && <ReviewStatsBar stats={stats} />}

      {reviews.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-4">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="border-b border-slate-100 pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={r.rating} size={12} />
                <span className="text-xs font-bold text-slate-800">{r.customer_name}</span>
                <span className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.title && <p className="text-sm font-bold text-slate-700">{r.title}</p>}
              {r.comment && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
