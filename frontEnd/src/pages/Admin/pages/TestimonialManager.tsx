import { useState, useEffect, useCallback } from 'react';
import { Star, Plus, Trash2, Loader2, MessageCircle } from 'lucide-react';
import apiService from '../../Landing/services/api';
import { toast } from 'react-hot-toast';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  created_at: string;
}

export default function TestimonialManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', text: '', rating: 5 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getTestimonials();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch {
      setTestimonials([]);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      toast.error('Name and testimonial text are required');
      return;
    }
    setSaving(true);
    try {
      await apiService.createTestimonial(form);
      toast.success('Testimonial added!');
      setForm({ name: '', role: '', text: '', rating: 5 });
      setShowForm(false);
      load();
    } catch {
      toast.error('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: Testimonial) => {
    if (!window.confirm(`Delete testimonial from "${t.name}"?`)) return;
    try {
      await apiService.deleteTestimonial(t.id);
      toast.success('Testimonial deleted');
      setTestimonials(prev => prev.filter(x => x.id !== t.id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            Testimonials
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Customer feedback shown on the sacramentals page.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm"
        >
          <Plus size={16} /> {showForm ? 'Cancel' : 'Add Testimonial'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Grace Wanjiku"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Role</label>
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
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Testimonial *</label>
            <textarea
              value={form.text}
              onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
              placeholder="The communion set I ordered was beautiful..."
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
                  <Star size={22} fill={s <= form.rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors flex items-center gap-2 text-sm disabled:cursor-not-allowed"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Testimonial'}
          </button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-blue-600" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <MessageCircle size={48} className="mx-auto mb-3 opacity-40" />
          <p className="font-bold text-slate-500">No testimonials yet</p>
          <p className="text-sm">Add your first customer feedback above.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < t.rating ? 'text-amber-400' : 'text-slate-200'} fill={i < t.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-2 italic">"{t.text}"</p>
                <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                {t.role && <p className="text-xs text-slate-400">{t.role}</p>}
                <p className="text-[10px] text-slate-300 mt-1">{new Date(t.created_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleDelete(t)}
                className="flex-shrink-0 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
