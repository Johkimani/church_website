import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../api/axiosInstance';
import { memberService } from '../../../api/jumuiyaMemberService';
import toast from 'react-hot-toast';

interface Suggestion {
  id: number;
  suggestion: string;
  name?: string;
  email?: string;
  category?: string;
  status: 'pending' | 'replied' | 'approved' | 'rejected' | 'unmask_requested';
  created_at: string;
  member_first_name?: string;
  member_last_name?: string;
  member_year_of_study?: number;
  member_jumuiya?: string;
}

// Known slug → human-readable name map (from sub_groups table)
const SLUG_NAME_MAP: Record<string, string> = {
  'st-anthony': 'St. Anthony',
  'st-augustine': 'St. Augustine',
  'st-catherine': 'St. Catherine',
  'st-dominic': 'St. Dominic',
  'st-elizabeth': 'St. Elizabeth',
  'st-maria-goretti': 'St. Maria Goretti',
  'st-monica': 'St. Monica',
};

const JUMUIYA_OPTIONS = [
  { id: '', name: 'All Jumuiyas' },
  { id: 'st-anthony', name: 'St. Anthony' },
  { id: 'st-augustine', name: 'St. Augustine' },
  { id: 'st-catherine', name: 'St. Catherine' },
  { id: 'st-dominic', name: 'St. Dominic' },
  { id: 'st-elizabeth', name: 'St. Elizabeth' },
  { id: 'st-maria-goretti', name: 'St. Maria Goretti' },
  { id: 'st-monica', name: 'St. Monica' },
];

const STATUSES = ['all', 'pending', 'replied', 'approved', 'rejected', 'unmask_requested'] as const;

const STATUS_META: Record<string, { active: string; inactive: string }> = {
  all:                { active: 'bg-slate-800 text-white border-slate-800 shadow-md',          inactive: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50' },
  pending:            { active: 'bg-amber-600 text-white border-amber-600 shadow-md',          inactive: 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50' },
  replied:            { active: 'bg-blue-600 text-white border-blue-600 shadow-md',            inactive: 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50' },
  approved:           { active: 'bg-emerald-600 text-white border-emerald-600 shadow-md',      inactive: 'bg-white text-emerald-700 border-emerald-700 hover:bg-emerald-50' },
  rejected:           { active: 'bg-rose-600 text-white border-rose-600 shadow-md',            inactive: 'bg-white text-rose-700 border-rose-700 hover:bg-rose-50' },
  unmask_requested:   { active: 'bg-purple-600 text-white border-purple-600 shadow-md',        inactive: 'bg-white text-purple-700 border-purple-700 hover:bg-purple-50' },
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  replied: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  unmask_requested: 'bg-purple-50 text-purple-700 border-purple-200',
};

const CATEGORIES = ['general', 'worship', 'progress', 'feedback', 'other', 'officials', 'jumuiya', 'members', 'ideas', 'requests', 'events'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-slate-100 text-slate-600 border-slate-200',
  worship: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  progress: 'bg-teal-50 text-teal-600 border-teal-200',
  feedback: 'bg-amber-50 text-amber-600 border-amber-200',
  other: 'bg-slate-100 text-slate-500 border-slate-200',
  officials: 'bg-orange-50 text-orange-600 border-orange-200',
  jumuiya: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  members: 'bg-green-50 text-green-600 border-green-200',
  ideas: 'bg-violet-50 text-violet-600 border-violet-200',
  requests: 'bg-rose-50 text-rose-600 border-rose-200',
  events: 'bg-yellow-50 text-yellow-600 border-yellow-200',
};

export default function JumuiyaSuggestionsAdmin() {
  const { user, isAuthenticated } = useAuth();
  const userRoles = useMemo(() => {
    const roles = Array.isArray(user?.role) ? user?.role : user?.role ? [user?.role] : [];
    return roles.map(r => String(r).toUpperCase().trim());
  }, [user?.role]);

  const userJumuiyaId = user?.jumuiya_id || '';
  const [selectedJumuiya, setSelectedJumuiya] = useState<string>(userJumuiyaId);

  // Sync selectedJumuiya if user's jumuiya becomes available
  useEffect(() => {
    if (userJumuiyaId && !selectedJumuiya) {
      setSelectedJumuiya(userJumuiyaId);
    }
  }, [userJumuiyaId]);

  const isGlobalRole = userRoles.some((r: any) =>
    ['csa_chair', 'csa_vice_chair', 'csa_secretary', 'jumuiya_coordinator', 'admin', 'developer'].includes(r)
  );

  const isVC = userRoles.some((r: any) => ['JUMUIYA_VICE_CHAIRPERSON', 'CSA_VICE_CHAIR'].includes(r));

  // Resolve UUID → human-readable jumuiya name via lookup API + slug map
  const [resolvedName, setResolvedName] = useState<string>('');
  useEffect(() => {
    const activeId = selectedJumuiya || userJumuiyaId;
    if (!activeId) return;
    // If it's already a known slug, no lookup needed
    if (SLUG_NAME_MAP[activeId]) {
      setResolvedName(SLUG_NAME_MAP[activeId]);
      return;
    }
    memberService.getJumuiyaLookup()
      .then((res: any) => {
        const data = res?.data || res || {};
        const entry = data[activeId];
        if (entry) {
          setResolvedName(entry.name || entry.fullName || activeId);
        } else {
          setResolvedName('');
        }
      })
      .catch(() => setResolvedName(''));
  }, [selectedJumuiya, userJumuiyaId]);

  // Priority: resolved API name > known slug map > fall back to 'Jumuiya'
  const activeId = selectedJumuiya || userJumuiyaId;
  const displayName = resolvedName || SLUG_NAME_MAP[activeId] || (activeId ? 'Jumuiya' : 'All Jumuiyas');

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'replied' | 'approved' | 'rejected' | 'unmask_requested'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadSuggestions = async () => {
    const activeJumuiya = selectedJumuiya || userJumuiyaId;
    const params = activeJumuiya ? { jumuiya_id: activeJumuiya } : {};
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/suggestions', { params });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      const sortedData = data.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setSuggestions(sortedData);
    } catch (err: any) {
      console.error('Error fetching jumuiya suggestions:', err.message);
      setError(err.message || 'Failed to load suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [selectedJumuiya, userJumuiyaId]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to soft-delete this suggestion?')) {
      try {
        await apiClient.delete(`/suggestions/${id}`);
        toast.success('Suggestion deleted');
        loadSuggestions();
      } catch (err: any) {
        toast.error('Failed to delete: ' + err.message);
      }
    }
  };

  const handleReply = async (id: number) => {
    const replyText = window.prompt('Enter your reply:', '');
    if (!replyText?.trim()) return;
    try {
      await apiClient.post(`/suggestions/${id}/reply`, { reply: replyText.trim() });
      toast.success('Reply sent');
      loadSuggestions();
    } catch (err: any) {
      toast.error('Failed to send reply: ' + err.message);
    }
  };

  const handleRequestUnmask = async (id: number) => {
    if (!window.confirm('Request to unmask this anonymous suggestion? Both Chair and Secretary must approve.')) return;
    try {
      await apiClient.post(`/suggestions/${id}/request-unmask`);
      toast.success('Unmask request sent to Chair and Secretary');
      loadSuggestions();
    } catch (err: any) {
      toast.error('Failed to request unmask: ' + err.message);
    }
  };

  const countByStatus = (status: string) =>
    suggestions.filter(s => s.status === status).length;

  const filteredSuggestions = suggestions.filter(s => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch = !searchTerm ||
      s.suggestion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (s.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (s.member_jumuiya?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (s.member_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (s.member_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      String(s.member_year_of_study || '').includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in text-slate-800">
      {isAuthenticated ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
              SUG
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Jumuiya Suggestions</h2>
              <p className="text-sm text-slate-500">View and manage suggestions from {displayName} members</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <span className="text-3xl font-bold text-indigo-500 animate-spin mb-3">S</span>
              <p className="text-sm font-semibold">Loading suggestions...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <span className="text-2xl font-bold text-indigo-600">S</span>
              <h3 className="text-base font-bold text-slate-700">No suggestions yet</h3>
              <p className="text-sm text-slate-500">When members submit suggestions, they'll appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => {
                  const meta = STATUS_META[s];
                  const isActive = statusFilter === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s as any)}
                      className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-indigo-100'
                      } ${meta.active}`}
                    >
                      {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} <span className="text-xs ml-1">({countByStatus(s)})</span>
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search suggestions, names, or emails..."
                  className="w-full pl-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Suggestions List */}
              <div className="space-y-4" aria-live="polite">
                {filteredSuggestions.map((s) => {
                  const isAnonymous = !s.name && !s.email;
                  const fullName = `${s.member_first_name || ''} ${s.member_last_name || ''}`.trim();
                  const displayName = isAnonymous ? 'Anonymous' : fullName || s.name || 'Unknown';
                  const statusLabel: Record<string, string> = {
                    pending: 'Pending',
                    replied: 'Replied',
                    approved: 'Approved',
                    rejected: 'Rejected',
                    unmask_requested: 'Unmask Pending',
                  };
                  const statusColor: Record<string, string> = {
                    pending: 'bg-amber-100 text-amber-700 border-amber-200',
                    replied: 'bg-blue-100 text-blue-700 border-blue-200',
                    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
                    unmask_requested: 'bg-purple-100 text-purple-700 border-purple-200',
                  };

                  return (
                    <div
                      key={s.id}
                      className="bg-slate-50 rounded border border-slate-200 p-4 border-t border-b hover:bg-white transition"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          isAnonymous ? 'bg-slate-400' : 'bg-indigo-600'
                        } shrink-0`} />
                        <span className="font-medium text-slate-700">{displayName}</span>
                        <span className="text-xs text-slate-500 ms-2">{s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}</span>
                      </div>

                      <p className="text-slate-600 whitespace-pre-wrap text-sm line-clamp-3 line-clamp max-w-none">{s.suggestion}</p>

                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <span className={`px-2 py-1 rounded ${
                          statusColor[s.status] || 'bg-slate-100 text-slate-400'
                        }`}>
                          {statusLabel[s.status]}
                        </span>
                        {s.category && <span className="mx-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{s.category}</span>}
                        {s.member_jumuiya && <span className="text-indigo-600 text-xs">• {s.member_jumuiya}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VC Actions */}
              {isVC && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.alert('Reply feature coming soon')}
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-sm font-medium"
                      title="Reply"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => window.alert('Unmask feature coming soon')}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm font-medium"
                      title="Unmask"
                    >
                      Unmask
                    </button>
                    <button
                      onClick={() => window.alert('Delete feature coming soon')}
                      className="px-3 py-1 bg-rose-600 text-white rounded text-sm font-medium"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <p className="text-slate-600">Please log in to view suggestions.</p>
        </div>
      )}
    </div>
  );
}