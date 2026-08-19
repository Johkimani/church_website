import { useEffect, useState } from 'react';
import {
  Sliders,
  Loader2,
  Clock,
  CheckCircle,
  Ban,
  ShieldOff,
  Shield,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CalendarDays,
  Lock,
  Save,
} from 'lucide-react';
import apiService from '../../../services/api';
import { apiClient } from '../../../api/axiosInstance';
import { semesterServices, SemesterConfig } from '../../../api/semesterServices';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface Assignment {
  id: number;
  member_id: string;
  role_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  assigned_by: string;
  approved_by: string | null;
  approved_at: string | null;
  jumuiya_id: string | null;
  created_at: string;
  role_name: string;
  role_description: string;
  first_name: string;
  last_name: string;
  jumuiya_name: string | null;
  assigned_by_first: string | null;
  assigned_by_last: string | null;
  approved_by_first: string | null;
  approved_by_last: string | null;
}

const ROLE_PAGES_MAP: Record<string, string[]> = {
  csa_chair: ['All pages (Super Admin)'],
  csa_vice_chair: ['Suggestion Box'],
  jumuiya_coordinator: ['Officials Management', 'Members'],
  project_manager: ['Sacramentals Banners', 'Products', 'Orders', 'Hire Requests', 'Project Management'],
  instrument_manager: ['Seats and Instruments'],
  os: ['Announcements Management', 'Weekly Activities', 'Semester Activities', 'Gallery Manager'],
  csa_secretary: ['Registered Members (all Jumuiyas)'],
  jumuiya_chairperson: ['Members (scoped to their Jumuiya)'],
  jumuiya_vice_chairperson: ['Suggestion Box (scoped to their Jumuiya)'],
  jumuiya_os: ['Gallery (scoped to their Jumuiya)'],
  jumuiya_secretary: ['Members (scoped to their Jumuiya)'],
  choir_chairperson: ['Community Management (Choir)'],
  choir_secretary: ['Community Management (Choir)'],
  choir_project_coordinator: ['Community Management (Choir Gallery)'],
  st_francis_chair: ['Community Management (St. Francis)'],
  charismatic_chair: ['Community Management (Charismatic)'],
  dance_chair: ['Community Management (Dance)'],
  mentorship_chair: ['Community Management (Mentorship)'],
  liturgist: ['Devotions & AI'],
  treasurer: ['Donation Monitor'],
};

const CSA_ROLES = ['csa_chair', 'csa_vice_chair', 'csa_secretary', 'jumuiya_coordinator', 'os', 'project_manager', 'instrument_manager', 'treasurer', 'liturgist'];
const JUMUIYA_ROLES = ['jumuiya_chairperson', 'jumuiya_vice_chairperson', 'jumuiya_os', 'jumuiya_secretary'];
const SUBGROUP_ROLES = ['choir_chairperson', 'choir_secretary', 'choir_project_coordinator', 'st_francis_chair', 'charismatic_chair', 'dance_chair', 'mentorship_chair'];

type TabKey = 'all' | 'csa' | 'jumuiya' | 'subgroup';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'csa', label: 'CSA' },
  { key: 'jumuiya', label: 'Jumuiya' },
  { key: 'subgroup', label: 'Sub Groups' },
];

const getPagesForRole = (roleName: string): string[] => {
  const key = (roleName || '').replace(/\s+/g, '_').toLowerCase();
  return ROLE_PAGES_MAP[key] || [`Role: ${roleName}`];
};

const roleBelongsToTab = (roleName: string, tab: TabKey): boolean => {
  const name = (roleName || '').toLowerCase().trim();
  switch (tab) {
    case 'all':
      return true;
    case 'jumuiya':
      return JUMUIYA_ROLES.includes(name) || name.includes('jumuiya');
    case 'subgroup':
      return SUBGROUP_ROLES.includes(name) || name.includes('choir') || name.includes('dance') || name.includes('charismatic') || name.includes('francis') || name.includes('mentorship');
    case 'csa':
      return CSA_ROLES.includes(name) || (!JUMUIYA_ROLES.includes(name) && !SUBGROUP_ROLES.includes(name) && !name.includes('jumuiya') && !name.includes('choir') && !name.includes('dance') && !name.includes('charismatic') && !name.includes('francis') && !name.includes('mentorship'));
  }
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Sliders className="w-8 h-8 text-blue-600" />
            Approval Queue
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Review and approve/reject role assignments. Roles are auto-assigned when officials are added.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(activeTab === 'csa' || activeTab === 'all') && <SemesterConfigPanel />}
      <ApprovalsPanel activeTab={activeTab} />
      <ActiveRolesPanel activeTab={activeTab} />
      <RevokedRolesPanel activeTab={activeTab} />
    </div>
  );
}

function SemesterConfigPanel() {
  const { user } = useAuth();
  const isChair = (Array.isArray(user?.role) ? user.role : user?.role ? [user.role] : [])
    .some((r) => String(r).toLowerCase().trim() === 'csa_chair');

  const [semester, setSemester] = useState<SemesterConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await semesterServices.getCurrent();
        setSemester(data);
        if (data) {
          setLabel(data.label || '');
          setStartDate(data.start_date);
          setEndDate(data.end_date);
        }
      } catch {
        toast.error('Failed to load semester configuration');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!startDate || !endDate) {
      toast.error('Set both the start and end date');
      return;
    }
    if (startDate > endDate) {
      toast.error('Start date must be on or before the end date');
      return;
    }
    setSaving(true);
    try {
      const data = await semesterServices.setCurrent({ label, start_date: startDate, end_date: endDate });
      setSemester(data);
      setLabel(data.label || '');
      setStartDate(data.start_date);
      setEndDate(data.end_date);
      toast.success('Current semester updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to update semester');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          Loading semester configuration...
        </div>
      </div>
    );
  }

  const displayLabel = semester ? (semester.label || 'Current Semester') : 'No semester configured';

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-indigo-500" />
          Current Semester
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          The semester window drives attendance tally periods, member semester registration, and jumuiya meeting days.
          {!isChair && <span className="flex items-center gap-1 mt-1 text-xs font-semibold text-amber-600"><Lock className="w-3 h-3" /> Only the CSA Chairperson can change this.</span>}
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Label</label>
            <input
              type="text"
              value={label}
              disabled={!isChair}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. 2025/2026 Semester 1"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              disabled={!isChair}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              disabled={!isChair}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm disabled:bg-slate-50 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
            {displayLabel}
          </span>
          {semester && (
            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
              {semester.start_date} → {semester.end_date}
            </span>
          )}
          {isChair && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="ml-auto flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-xs transition-all shadow-sm shadow-indigo-200 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Semester
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ApprovalsPanel({ activeTab }: { activeTab: TabKey }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    setLoading(true);
    try {
      const pendingData = await apiService.getRoleAssignments('pending');
      setAssignments(Array.isArray(pendingData) ? pendingData : []);
    } catch {
      toast.error('Failed to load pending assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await apiService.approveAssignment(id);
      toast.success('Assignment approved');
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await apiService.rejectAssignment(id);
      toast.success('Assignment rejected');
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = assignments.filter((a) => roleBelongsToTab(a.role_name, activeTab));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading approval queue...</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-6 bg-emerald-50 rounded-full">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
          <p className="text-slate-500">No pending {activeTab} role assignments need your approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Pending Approvals
          <span className="ml-2 px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
            {filtered.length}
          </span>
        </h2>
      </div>
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
            <th className="px-3 py-3 w-[17%]">Member</th>
            <th className="pl-1 pr-2 py-3 w-[9%]">Role</th>
            <th className="px-3 py-3 w-[21%]">Pages Access</th>
            <th className="px-3 py-3 w-[12%]">Assigned By</th>
            <th className="px-3 py-3 w-[8%]">Date</th>
            <th className="px-3 py-3 w-[33%] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-3 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-slate-600 font-bold text-xs border-2 border-white shadow-sm">
                    {a.first_name[0]}{a.last_name?.[0] ?? ''}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{a.first_name} {a.last_name}</p>
                    <p className="text-[9px] text-slate-400 font-medium uppercase truncate">{a.member_id}</p>
                  </div>
                </div>
              </td>
              <td className="pl-1 pr-2 py-3">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100 capitalize block truncate">
                  {a.role_name.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-1">
                  {getPagesForRole(a.role_name).map((page) => (
                    <span key={page} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-semibold rounded border border-emerald-100 leading-tight">
                      {page}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-3 py-3">
                <span className="text-[10px] text-slate-600 font-medium truncate block">
                  {a.assigned_by_first ? `${a.assigned_by_first} ${a.assigned_by_last}` : '—'}
                </span>
              </td>
              <td className="px-3 py-3">
                <span className="text-[10px] text-slate-400">
                  {new Date(a.created_at).toLocaleDateString()}
                </span>
              </td>
              <td className="px-3 py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleApprove(a.id)}
                    disabled={actionLoading === a.id}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    {actionLoading === a.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(a.id)}
                    disabled={actionLoading === a.id}
                    className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-[10px] transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    <Ban size={11} />
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActiveRolesPanel({ activeTab }: { activeTab: TabKey }) {
  const [active, setActive] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadActive();
  }, []);

  const loadActive = async () => {
    setLoading(true);
    try {
      const data = await apiService.getRoleAssignments('approved');
      setActive(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load active role assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: number) => {
    setActionLoading(id);
    try {
      await apiService.revokeAssignment(id);
      toast.success('Access revoked');
      loadActive();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to revoke');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = active.filter((a) => roleBelongsToTab(a.role_name, activeTab));

  if (loading) return null;
  if (filtered.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          Active Role Assignments
          <span className="ml-2 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            {active.length}
          </span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Officials with approved access. You can revoke access at any time.
        </p>
      </div>
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
            <th className="px-3 py-3 w-[17%]">Member</th>
            <th className="pl-1 pr-2 py-3 w-[9%]">Role</th>
            <th className="px-3 py-3 w-[21%]">Pages Access</th>
            <th className="px-3 py-3 w-[12%]">Approved By</th>
            <th className="px-3 py-3 w-[8%]">Approved At</th>
            <th className="px-3 py-3 w-[33%] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-3 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center text-slate-600 font-bold text-xs border-2 border-white shadow-sm">
                    {a.first_name[0]}{a.last_name?.[0] ?? ''}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{a.first_name} {a.last_name}</p>
                    <p className="text-[9px] text-slate-400 font-medium uppercase truncate">{a.member_id}</p>
                  </div>
                </div>
              </td>
              <td className="pl-1 pr-2 py-3">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 capitalize block truncate">
                  {a.role_name.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-1">
                  {getPagesForRole(a.role_name).map((page) => (
                    <span key={page} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-semibold rounded border border-emerald-100 leading-tight">
                      {page}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-3 py-3">
                <span className="text-[10px] text-slate-600 font-medium truncate block">
                  {a.approved_by_first ? `${a.approved_by_first} ${a.approved_by_last}` : '—'}
                </span>
              </td>
              <td className="px-3 py-3">
                <span className="text-[10px] text-slate-400">
                  {a.approved_at ? new Date(a.approved_at).toLocaleDateString() : '—'}
                </span>
              </td>
              <td className="px-3 py-3 text-right">
                <button
                  onClick={() => handleRevoke(a.id)}
                  disabled={actionLoading === a.id}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-[10px] transition-all disabled:opacity-50 flex items-center gap-1 ml-auto"
                >
                  {actionLoading === a.id ? <Loader2 size={11} className="animate-spin" /> : <ShieldOff size={11} />}
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RevokedRolesPanel({ activeTab }: { activeTab: TabKey }) {
  const [revoked, setRevoked] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadRevoked();
  }, []);

  const loadRevoked = async () => {
    setLoading(true);
    try {
      const data = await apiService.getRoleAssignments('revoked');
      setRevoked(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load revoked assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    setActionLoading(id);
    try {
      await apiService.activateAssignment(id);
      toast.success('Role reactivated');
      loadRevoked();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reactivate');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Permanently delete this role assignment? This cannot be undone.')) return;
    setActionLoading(id);
    try {
      await apiService.deleteAssignment(id);
      toast.success('Assignment deleted');
      setRevoked((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRevoked = revoked.filter((a) => roleBelongsToTab(a.role_name, activeTab));

  if (loading) return null;
  if (filteredRevoked.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Revoked Role Assignments
            <span className="ml-2 px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
              {filteredRevoked.length}
            </span>
          </h2>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Officials whose access was revoked. Reactivate to restore or delete permanently.
        </p>
      </button>
      {expanded && (
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="px-3 py-3 w-[15%]">Member</th>
              <th className="pl-1 pr-2 py-3 w-[9%]">Role</th>
              <th className="px-3 py-3 w-[20%]">Pages Access</th>
              <th className="px-3 py-3 w-[13%]">Previous Approval</th>
              <th className="px-3 py-3 w-[43%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRevoked.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-rose-50 to-red-50 flex items-center justify-center text-slate-600 font-bold text-xs border-2 border-white shadow-sm">
                      {a.first_name[0]}{a.last_name?.[0] ?? ''}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{a.first_name} {a.last_name}</p>
                      <p className="text-[9px] text-slate-400 font-medium uppercase truncate">{a.member_id}</p>
                    </div>
                  </div>
                </td>
                <td className="pl-1 pr-2 py-3">
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-lg border border-rose-100 capitalize block truncate">
                    {a.role_name.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {getPagesForRole(a.role_name).map((page) => (
                      <span key={page} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-semibold rounded border border-slate-200 leading-tight">
                        {page}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="text-[10px] text-slate-600 font-medium truncate block">
                    {a.approved_by_first ? `${a.approved_by_first} ${a.approved_by_last}` : '—'}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleActivate(a.id)}
                      disabled={actionLoading === a.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      {actionLoading === a.id ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                      Activate
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={actionLoading === a.id}
                      className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-[10px] transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      <Trash2 size={11} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
