import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, CheckCircle2, User, Mail, Sparkles, EyeOff, Clock3, Reply } from 'lucide-react';
import apiService from '../../../../services/api';
import { apiClient } from '../../../../api/axiosInstance';
import { useAuth } from '../../../../context/AuthContext';

interface MySuggestion {
  id: number;
  suggestion: string;
  category: string | null;
  status: string | null;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
  replied: { label: 'Replied', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  approved: { label: 'Identity Approved', cls: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  unmask_requested: { label: 'Reviewing Identity', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  rejected: { label: 'Closed', cls: 'bg-slate-100 text-slate-400 border-slate-200' },
};

const SuggestionBox: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    suggestion: ''
  });
  const [anonymous, setAnonymous] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [targetScope, setTargetScope] = useState<'csa' | 'jumuiya'>('csa');

  const [mySuggestions, setMySuggestions] = useState<MySuggestion[]>([]);
  const [loadingMine, setLoadingMine] = useState(false);

  const fetchMySuggestions = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingMine(true);
    try {
      const res = await apiClient.get('/suggestions/mine');
      setMySuggestions(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setMySuggestions([]);
    }
    setLoadingMine(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) fetchMySuggestions();
  }, [isOpen, fetchMySuggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.suggestion.trim()) return;

    setStatus('submitting');

    // Only send a jumuiya-scoped suggestion when the member actually belongs to
    // a jumuiya; otherwise fall back to CSA scope (never send a bare 'jumuiya'
    // literal that the backend cannot resolve).
    const jumuiyaTarget = user?.jumuiya_id || '';
    const useJumuiyaScope = targetScope === 'jumuiya' && !!jumuiyaTarget;

    const submissionData: Record<string, string> = {
      suggestion: formData.suggestion.trim(),
      scope: useJumuiyaScope ? 'jumuiya' : 'csa',
      jumuiya_id: useJumuiyaScope ? jumuiyaTarget : 'csa'
    };

    if (!anonymous) {
      if (formData.name.trim()) submissionData.name = formData.name.trim();
      if (formData.email.trim()) submissionData.email = formData.email.trim();
    }
    // user_id is bound server-side from the verified token.

    try {
      await apiService.createRecord('suggestions', submissionData);
      setStatus('success');
      setFormData({ name: user?.name || '', email: user?.email || '', suggestion: '' });
      fetchMySuggestions();

      setTimeout(() => {
        setStatus('idle');
        setIsOpen(false);
      }, 4000);
    } catch (error: unknown) {
      console.error('Error submitting suggestion:', error);
      setStatus('error');
      const msg = error instanceof Error ? error.message : 'Failed to submit suggestion. Please try again.';
      setErrorMessage((error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? msg);
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="pt-4 md:pt-6 pb-20 bg-slate-50 relative overflow-hidden" id="suggestions">
      {/* Dynamic Background Elements - Subtler blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/20 rounded-full blur-3xl -ml-48 -mb-48 opacity-60"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header Card with Faded Gradient Border */}
          <div className="p-[1.5px] rounded-[1.8rem] bg-gradient-to-r from-primary/20 via-slate-200/50 to-indigo-400/20 shadow-md transition-all duration-500 hover:shadow-lg">
            <div 
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center justify-between p-1.5 bg-white rounded-[1.7rem] transition-all duration-500 cursor-pointer group ${isOpen ? 'ring-2 ring-primary/5' : ''}`}
            >
              <div className="flex items-center gap-4 p-2 md:p-3">
                <div className={`p-3 rounded-2xl transition-all duration-700 ${isOpen ? 'bg-primary text-white scale-105' : 'bg-slate-50 text-primary group-hover:bg-primary/5'}`}>
                  <MessageSquare size={24} className={isOpen ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    Suggestion Box
                    {!isOpen && <Sparkles size={14} className="text-amber-400 animate-[bounce_2s_infinite]" />}
                  </h2>
                  <p className="text-slate-400 font-bold text-[10px] md:text-xs tracking-widest uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                    Help us Grow
                  </p>
                </div>
              </div>
              <div className="pr-4 md:pr-6">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center transition-all duration-700 ${isOpen ? 'bg-primary/10 text-primary' : 'text-slate-300'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content - Compact and High Contrast */}
          <div className={`grid transition-all duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4 md:mt-6 scale-100' : 'grid-rows-[0fr] opacity-0 scale-95 pointer-events-none'}`}>
            <div className="overflow-hidden">
              <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 relative overflow-hidden">
                
                {status === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in slide-in-from-bottom-6 duration-700">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Transmitted!</h3>
                    <p className="text-slate-500 text-sm font-medium">Thank you for your valuable input.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="flex items-center gap-2 text-[10px] font-black text-slate-500 tracking-wider ml-1">
                          <User size={12} className="text-primary" />
                          NAME (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          autoComplete="name"
                          placeholder="Your name"
                          className={`w-full px-5 py-3.5 rounded-xl bg-white border-2 outline-none transition-all duration-300 placeholder:text-slate-400 font-bold text-sm focus:shadow-sm ${
                            anonymous ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed' : 'border-slate-200 focus:border-primary/40 text-slate-900'
                          }`}
                          value={anonymous ? '' : formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={status === 'submitting' || !!user?.name || anonymous}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="flex items-center gap-2 text-[10px] font-black text-slate-500 tracking-wider ml-1">
                          <Mail size={12} className="text-primary" />
                          EMAIL (OPTIONAL)
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          autoComplete="email"
                          placeholder="your@email.com"
                          className={`w-full px-5 py-3.5 rounded-xl bg-white border-2 outline-none transition-all duration-300 placeholder:text-slate-400 font-bold text-sm focus:shadow-sm ${
                            anonymous ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed' : 'border-slate-200 focus:border-primary/40 text-slate-900'
                          }`}
                          value={anonymous ? '' : formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={status === 'submitting' || !!user?.email || anonymous}
                        />
                      </div>
                    </div>
                    
                    {/* Target Selector: CSA vs Jumuiya */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 tracking-wider ml-1 uppercase">
                        RECIPIENT / TARGET
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTargetScope('csa')}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                            targetScope === 'csa'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          CSA
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetScope('jumuiya')}
                          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                            targetScope === 'jumuiya'
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          My Jumuiya
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={anonymous}
                        onClick={() => setAnonymous(!anonymous)}
                        className="flex items-center gap-3 px-1 py-2 -m-1 text-[10px] font-black text-slate-500 tracking-wider cursor-pointer select-none"
                      >
                        <EyeOff size={12} className="text-slate-400" />
                        SUBMIT ANONYMOUSLY
                        <span
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-1 ${
                            anonymous ? 'bg-primary' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              anonymous ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="suggestion" className="flex items-center gap-2 text-[10px] font-black text-slate-500 tracking-wider ml-1">
                        <MessageSquare size={12} className="text-primary" />
                        MESSAGE
                      </label>
                      <textarea
                        id="suggestion"
                        name="suggestion"
                        autoComplete="off"
                        required
                        placeholder="Tell us what's on your mind..."
                        rows={4}
                        className="w-full px-5 py-4 rounded-xl bg-white border-2 border-slate-200 focus:border-primary/40 outline-none transition-all duration-300 placeholder:text-slate-400 font-bold text-slate-900 text-sm resize-none focus:shadow-sm"
                        value={formData.suggestion}
                        onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                        disabled={status === 'submitting'}
                      ></textarea>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={status === 'submitting' || !formData.suggestion.trim()}
                        className="w-full group relative overflow-hidden px-6 py-4 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white rounded-xl font-black tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-3"
                      >
                        {status === 'submitting' ? (
                          <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>SEND SUGGESTION</span>
                            <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </>
                        )}
                      </button>

                      {status === 'error' && errorMessage && (
                        <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                          {errorMessage}
                        </div>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* My Suggestions + Replies */}
          <div className="mt-6">
            <h3 className="text-[10px] font-black text-slate-500 tracking-widest uppercase flex items-center gap-2 px-1 mb-3">
              <Reply size={12} className="text-primary" />
              My Suggestions &amp; Replies
            </h3>

            {loadingMine && mySuggestions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-xs font-bold text-slate-400">Loading your suggestions...</div>
            ) : mySuggestions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <MessageSquare size={20} className="text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">No suggestions yet — yours will appear here with official replies.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mySuggestions.map(item => {
                  const meta = STATUS_META[item.status || 'pending'] || STATUS_META.pending;
                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">{item.suggestion}</p>
                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${meta.cls}`}>
                          {item.status === 'replied' && <CheckCircle2 size={10} />}
                          {(item.status || 'pending') === 'pending' && <Clock3 size={10} />}
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Sent {new Date(item.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {item.category ? ` · ${item.category}` : ''}
                      </p>
                      {item.reply && (
                        <div className="mt-3 pt-3 border-t border-emerald-100 bg-emerald-50/50 rounded-xl p-3">
                          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-1">
                            <Reply size={11} /> Official Reply
                            {item.replied_at && (
                              <span className="font-medium normal-case text-slate-400">
                                · {new Date(item.replied_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">{item.reply}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuggestionBox;
