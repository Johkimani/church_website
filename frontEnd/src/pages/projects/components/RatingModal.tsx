import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import apiService from '../../../services/api';
import { toast } from 'react-hot-toast';

interface Props {
  orderRef: string;
  customerName?: string;
  customerPhone?: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function RatingModal({ orderRef, customerName: initialName, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState(initialName || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        text: message.trim() || 'Great service!',
        rating,
        reference: orderRef,
        type: 'purchase',
        approved: false,
      };
      await apiService.createTestimonial(payload);
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
      setTimeout(() => { onSubmitted(); }, 1500);
    } catch {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <Star size={24} className="text-emerald-600" fill="currentColor" />
          </div>
          <h3 className="text-lg font-black text-slate-800">Thank You!</h3>
          <p className="text-sm text-slate-500 mt-1">Your feedback helps us serve you better.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <Star size={14} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Rate Your Experience</h3>
              <p className="text-[10px] text-slate-500">Order #{orderRef}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-center">
            <p className="text-xs font-medium text-slate-500 mb-2">How would you rate our service?</p>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  className={`p-1 rounded-lg transition-all ${(hover || rating) >= s ? 'text-amber-400 scale-110' : 'text-slate-200'}`}
                >
                  <Star size={22} fill={(hover || rating) >= s ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Message (optional)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition resize-none"
            />
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all disabled:cursor-not-allowed"
          >
            {submitting ? <><Loader2 size={12} className="animate-spin" /> Sending...</> : <><Star size={12} /> Submit Rating</>}
          </button>
        </div>
      </div>
    </div>
  );
}
