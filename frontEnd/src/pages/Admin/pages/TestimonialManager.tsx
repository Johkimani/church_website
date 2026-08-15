import { useState, useEffect, useCallback } from 'react';
import { Star, Trash2, MessageCircle, CheckCircle, Clock } from 'lucide-react';
import apiService from '../../Landing/services/api';
import { toast } from 'react-hot-toast';
import Skeleton from '../../../components/Skeleton';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  reference: string;
  type: string;
  approved: boolean;
  created_at: string;
}

type Filter = 'all' | 'pending' | 'approved';

export default function TestimonialManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('pending');

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

  const handleApprove = async (t: Testimonial) => {
    try {
      await apiService.approveTestimonial(t.id);
      toast.success('Testimonial approved');
      setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, approved: true } : x));
    } catch {
      toast.error('Failed to approve');
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

  const pending = testimonials.filter(t => !t.approved);
  const approved = testimonials.filter(t => t.approved);

  const filteredList = filter === 'all' ? testimonials : filter === 'pending' ? pending : approved;

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Testimonials
        </h1>
        <p className="text-slate-700 font-medium mt-0.5 text-xs">
          Customer ratings appear here after payment. Approve the ones you want shown publicly.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {(['pending', 'approved', 'all'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300'
            }`}
          >
            {f === 'pending' && <Clock size={12} className="inline mr-1" />}
            {f === 'approved' && <CheckCircle size={12} className="inline mr-1" />}
            {f === 'all' && <MessageCircle size={12} className="inline mr-1" />}
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pending.length > 0 && (
              <span className="ml-1 bg-amber-400 text-white text-[9px] px-1 py-0.5 rounded-full">{pending.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-10 text-slate-700">
          <MessageCircle size={32} className="mx-auto mb-2 opacity-40" />
          <p className="font-bold text-slate-700">
            {filter === 'pending' ? 'No pending testimonials' : filter === 'approved' ? 'No approved testimonials' : 'No testimonials yet'}
          </p>
          <p className="text-sm">
            {filter === 'pending' ? 'Customer ratings will appear here after payment.' : 'Approved testimonials will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredList.map(t => (
            <div key={t.id} className={`bg-white rounded-xl p-3 shadow-sm border transition-all ${
              !t.approved ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {!t.approved && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full mb-2 uppercase tracking-wider">
                      <Clock size={10} /> Pending Review
                    </span>
                  )}
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < t.rating ? 'text-amber-400' : 'text-slate-200'} fill={i < t.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 mb-1 italic">"{t.text}"</p>
                  <p className="font-bold text-slate-800 text-xs">{t.name}</p>
                  {t.role && <p className="text-[11px] text-slate-700">{t.role}</p>}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {t.type && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        t.type === 'purchase' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {t.type === 'purchase' ? 'Purchase' : 'Hire'}
                      </span>
                    )}
                    {t.reference && <span className="text-[10px] text-slate-700 font-mono">Ref: {t.reference}</span>}
                  </div>
                  <p className="text-[9px] text-slate-700">{new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!t.approved && (
                    <button
                      onClick={() => handleApprove(t)}
                      className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Approve"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(t)}
                    className="p-1.5 text-slate-700 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
