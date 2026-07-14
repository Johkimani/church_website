import { useState, useEffect, useRef } from 'react';
import { FaStar, FaPen } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import apiService from '../../Landing/services/api';
import { useProjectsData } from '../context/ProjectsProvider';
import { toast } from 'react-hot-toast';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  created_at: string;
}

interface Props {
  variant?: 'blue' | 'emerald';
  title?: string;
}

const THEMES = {
  blue: {
    badge: 'text-blue-600 bg-blue-100',
    border: 'border-blue-50',
    btn: 'bg-blue-600 hover:bg-blue-700',
  },
  emerald: {
    badge: 'text-emerald-600 bg-emerald-100',
    border: 'border-emerald-50',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
  },
};

export default function TestimonialsSection({ variant = 'blue', title = 'Trusted by Our Community' }: Props) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', text: '', rating: 5, reference: '' });
  const theme = THEMES[variant];
  const ctx = useProjectsData();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    if (ctx.testimonials.length > 0) {
      setTestimonials(ctx.testimonials);
      setLoading(false);
      return;
    }
    apiService.getTestimonials(true)
      .then(data => { setTestimonials(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ctx.testimonials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      toast.error('Please provide your name and testimonial');
      return;
    }
    if (!form.reference.trim()) {
      toast.error('Please provide your order or hire reference number');
      return;
    }
    setSaving(true);
    try {
      await apiService.submitTestimonial(form);
      toast.success('Thank you! Your testimonial has been submitted for review.');
      setForm({ name: '', role: '', text: '', rating: 5, reference: '' });
      setShowForm(false);
    } catch {
      toast.error('Failed to submit testimonial. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!loading && testimonials.length === 0 && !showForm) return null;

  return (
    <div className="py-10 sm:py-14 px-4">
      <div className="max-w-5xl mx-auto text-center mb-8 sm:mb-10">
        <span className={`inline-block text-[10px] sm:text-xs font-black ${theme.badge} px-4 py-1.5 rounded-full uppercase tracking-widest mb-3`}>
          What Our Customers Say
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800">{title}</h2>
      </div>

      {testimonials.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-3 max-w-5xl mx-auto mb-10">
          {loading
            ? [1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 shadow animate-pulse">
                  <div className="h-3 bg-slate-200 rounded w-1/3 mx-auto mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-5/6 mx-auto mb-4" />
                  <div className="h-3 bg-slate-200 rounded w-1/4 mx-auto" />
                </div>
              ))
            : testimonials.map(t => (
                <div key={t.id} className={`bg-white rounded-2xl p-5 sm:p-6 shadow hover:shadow-lg transition-all duration-300 border ${theme.border} hover:-translate-y-1 text-center`}>
                  <div className="flex justify-center gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <FaStar key={i} size={12} className="text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                    {t.role && <p className="text-xs text-slate-400">{t.role}</p>}
                  </div>
                </div>
              ))
          }
        </div>
      )}

      {/* Share your testimony button / form */}
      <div className="max-w-2xl mx-auto">
        {!showForm ? (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className={`inline-flex items-center gap-2 px-6 py-3 ${theme.btn} text-white font-bold rounded-xl transition-colors text-sm shadow`}
            >
              <FaPen size={12} /> Share Your Testimony
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">Share Your Experience</h3>
            <p className="text-xs text-slate-500 -mt-2">Only customers who have purchased or hired from us may submit a testimony. Provide your order/hire reference below so we can verify.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Your Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Grace Wanjiku"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Your Role (optional)</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  placeholder="Parishioner"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Order or Hire Reference *</label>
              <input
                type="text"
                value={form.reference}
                onChange={e => setForm(p => ({ ...p, reference: e.target.value }))}
                placeholder="e.g. CSA-2026-0001 or HR-2026-001"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Your Testimonial *</label>
              <textarea
                value={form.text}
                onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                placeholder="Tell us about your experience..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, rating: s }))}
                    className={`p-1 rounded-lg transition-all ${s <= form.rating ? 'text-amber-400 scale-110' : 'text-slate-200'}`}
                  >
                    <FaStar size={20} className={s <= form.rating ? 'text-amber-400' : 'text-slate-200'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2.5 ${theme.btn} disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center gap-2 text-sm disabled:cursor-not-allowed`}
              >
                {saving ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Testimony'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-slate-500 hover:text-slate-700 font-medium rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
