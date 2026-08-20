import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Sender,
  CheckCircle2,
  XCircle,
  Shield,
  Reply,
  Clock,
  Filter,
  Search,
  Trash2,
  Eye,
  ChevronDown,
  User,
  Mail,
  Calendar,
} from 'lucide-react';

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

const JUMUIYA_LIST = [
  { id: 'st-anthony', name: 'St. Anthony', color: '#8b5cf6', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'st-augustine', name: 'St. Augustine', color: '#3b82f6', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'st-catherine', name: 'St. Catherine', color: '#800000', badge: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 'st-dominic', name: 'St. Dominic', color: '#64748b', badge: 'bg-slate-50 text-slate-700 border-slate-200' },
  { id: 'st-elizabeth', name: 'St. Elizabeth', color: '#059669', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'st-maria-goretti', name: 'St. Maria Goretti', color: '#0284c7', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'st-monica', name: 'St. Monica', color: '#dc2626', badge: 'bg-red-50 text-red-700 border-red-200' },
];

export default function JumuiyaSuggestionsAdmin() {
  const { user, isAuthenticated } = useAuth();
  const userRoles = useMemo(() => {
    const roles = Array.isArray(user?.role) ? user?.role : user?.role ? [user?.role] : [];
    return roles.map(r => String(r).toUpperCase().trim());
  }, [user?.role]);

  const isVC = userRoles.some((r: any) => ['JUMUIYA_VICE_CHAIRPERSON', 'CSA_VICE_CHAIR'].includes(r));
  const userJumuiyaId = user?.jumuiya_id || '';

  if (!isAuthenticated || !isVC) {
    return null;
  }

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'replied' | 'approved' | 'rejected' | 'unmask_requested'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadSuggestions = async () => {
    if (!userJumuiyaId) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/suggestions', { params: { jumuiya_id: userJumuiyaId } });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setSuggestions(data);
    } catch (err: any) {
      console.error('Error fetching jumuiya suggestions:', err);
      setError(err.message || 'Failed to load suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [userJumuiyaId]);

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
      toast.error(err.response?.data?.error || 'Failed to send reply');
    }
  };

  const handleRequestUnmask = async (id: number) => {
    if (!window.confirm('Request to unmask this anonymous suggestion? Both Chair and Secretary must approve.')) return;
    try {
      await apiClient.post(`/suggestions/${id}/request-unmask`);
      toast.success('Unmask request sent to Chair and Secretary');
      loadSuggestions();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to request unmask');
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
            <Shield className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Jumuiya Suggestions</h2>
              <p className="text-sm text-slate-500">View and manage suggestions from {user?.jumuiya_id ? user?.jumuiya_id : 'your'} members</p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" />
              <p className="text-sm font-semibold">Loading suggestions...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">No suggestions yet</h3>
              <p className="text-sm text-slate-500">When members submit suggestions, they'll appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Filter */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    statusFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-600 hover:bg-indigo-100'
                  }`}
                >
                  All <span className="text-xs ml-1">({suggestions.length})</span>
                </button>
                {['pending', 'replied', 'approved', 'rejected', 'unmask_requested'].map(s => {
                  const count = countByStatus(s);
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s as any)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                        statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-indigo-100'
                      }`}
                    >
                      {s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} <span className="text-xs ml-1">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  const statusColor: Record<string, string> = {
                    pending: 'bg-amber-100 text-amber-700 border-amber-200',
                    replied: 'bg-blue-100 text-blue-700 border-blue-200',
                    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
                    unmask_requested: 'bg-purple-100 text-purple-700 border-purple-200',
                  };
                  const statusLabel: Record<string, string> = {
                    pending: 'Pending',
                    replied: 'Replied',
                    approved: 'Approved',
                    rejected: 'Rejected',
                    unmask_requested: 'Unmask Pending',
                  };

                  return (
                    <div
                      key={s.id}
                      className="bg-slate-50 rounded-xl border border-slate-200 p-5 hover:bg-white transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 rounded-full ${
                          isAnonymous ? 'bg-slate-400' : 'bg-indigo-600'
                        } shrink-0" />
                        <div>
                          <p className="text-slate-700 font-medium">{displayName}</p>
                          <p className="text-xs text-slate-500">{s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}</p>
                        </div>
                      </div>

                      <p className="text-slate-600 whitespace-pre-wrap text-sm line-clamp-3 line-clamp Maxw-none">{s.suggestion}</p>

                      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                        <span className={`px-2 py-1 rounded-full ${statusStatusColor[s.status] || 'bg-slate-100 text-slate-400'}`}>
                          {statusLabel[s.status]}
                        </span>
                        {s.category && <span className="mx-2 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{s.category}</span>}
                        {s.member_jumuiya && <span className="text-indigo-500 text-xs">• {s.member_jumuiya}</span>}
                      </div>

                      {isVC && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => handleReply(s.id)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                            title="Reply to suggestion"
                          >
                            <Reply className="w-3 h-3" /> Reply
                          </button>
                          {s.status !== 'unmask_requested' && (
                            <button
                              onClick={() => handleRequestUnmask(s.id)}
                              className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
                              title="Request to unmask author"
                            >
                              <Shield className="w-3 h-3" /> Unmask
                            </button>
                          )}
                          {s.status === 'pending' && (
                            <button
                              onClick={() => window.open(`/suggestions/unmask/jumuiya_vice_chairperson/${s.id}`)} // placeholder
                              className="text-rose-600 hover:text-rose-800 text-sm font-medium"
                              title="Soft delete suggestion"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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