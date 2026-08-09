import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import apiService from '../../Landing/services/api';
import { apiClient } from '../../../api/axiosInstance';
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
const JUMUIYA_ROLES = ['jumuiya_chairperson', 'jumuiya_os', 'jumuiya_secretary'];
const SUBGROUP_ROLES = ['choir_chairperson', 'choir_secretary', 'choir_project_coordinator', 'st_francis_chair', 'charismatic_chair', 'dance_chair', 'mentorship_chair'];

type TabKey = 'csa' | 'jumuiya' | 'subgroup';

const SECTIONS: { key: TabKey; label: string; color: string }[] = [
  { key: 'csa', label: 'CSA Officials', color: 'text-blue-600' },
  { key: 'jumuiya', label: 'Jumuiya Officials', color: 'text-emerald-600' },
  { key: 'subgroup', label: 'Sub-Group Officials', color: 'text-violet-600' },
];

const getPagesForRole = (roleName: string): string[] => {
  const key = roleName.replace(/\s+/g, '_').toLowerCase();
  return ROLE_PAGES_MAP[key] || [`Role: ${roleName}`];
};

const roleBelongsToTab = (roleName: string, tab: TabKey): boolean => {
  const name = roleName.toLowerCase();
  switch (tab) {
    case 'csa': return CSA_ROLES.includes(name);
    case 'jumuiya': return JUMUIYA_ROLES.includes(name);
    case 'subgroup': return SUBGROUP_ROLES.includes(name);
  }
};

/** Single assignment card – replaces a table row */
function AssignmentCard({ a, actions }: { a: Assignment; actions: React.ReactNode }) {
  const initials = `${a.first_name[0] ?? '?'}${(a.last_name?.[0]) ?? ''}`;
  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3">
      {/* Row 1: avatar + name + role badge */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-slate-600 font-bold text-xs border-2 border-white shadow-sm">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-slate-900 truncate">{a.first_name} {a.last_name}</p>
          <p className="text-[10px] text-slate-400 font-medium uppercase truncate">{a.member_id}</p>
        </div>
        <span className="shrink-0 px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100 capitalize whitespace-nowrap">
          {a.role_name.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Row 2: pages + scope + meta */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {getPagesForRole(a.role_name).map((page) => (
          <span key={page} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-md border border-emerald-100">
            {page}
          </span>
        ))}
        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-md border border-slate-200">
          {a.jumuiya_name || 'Global'}
        </span>
      </div>

      {/* Row 3: meta info + actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400">
          {a.assigned_by_first
            ? `Assigned by ${a.assigned_by_first} ${a.assigned_by_last}`
            : a.approved_by_first
            ? `Approved by ${a.approved_by_first} ${a.approved_by_last}`
            : null}
          {a.approved_at ? ` · ${new Date(a.approved_at).toLocaleDateString()}` :
           a.created_at ? ` · ${new Date(a.created_at).toLocaleDateString()}` : ''}
        </span>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Sliders className="w-8 h-8 text-blue-600" />
          Approval Queue
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Review and approve/reject role assignments. Roles are auto-assigned when the Jumuiya Coordinator adds officials.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.key} className="space-y-4">
          <h2 className={`text-base font-black uppercase tracking-widest ${section.color} flex items-center gap-2`}>
            <span className="block w-4 h-[3px] rounded-full bg-current" />
            {section.label}
          </h2>
          <ApprovalsPanel activeTab={section.key} />
          <ActiveRolesPanel activeTab={section.key} />
          <RevokedRolesPanel activeTab={section.key} />
        </div>
      ))}
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
      const [pendingData, csaOfficials, jumuiyaOfficials] = await Promise.all([
        apiService.getRoleAssignments('pending'),
        apiClient.get('/officials/list').then((r) => r.data?.data || r.data || []),
        apiClient.get('/jumuiya-officials/list').then((r) => r.data?.data || r.data || []),
      ]);

      const allOfficialRegNumbers = new Set<string>();
      for (const off of [...(Array.isArray(csaOfficials) ? csaOfficials : []), ...(Array.isArray(jumuiyaOfficials) ? jumuiyaOfficials : [])]) {
        if (off.reg_number) allOfficialRegNumbers.add(off.reg_number);
      }

      setAssignments(
        (Array.isArray(pendingData) ? pendingData : []).filter(
          (a: Assignment) => allOfficialRegNumbers.has(a.member_id)
        )
      );
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
      <div className="flex items-center gap-3 py-6 text-slate-400">
        <div className="w-5 h-5 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading pending approvals…</span>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
        <p className="text-sm font-medium text-emerald-700">No pending approvals — all caught up!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <Clock className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-bold text-slate-900">Pending Approvals</span>
        <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">{filtered.length}</span>
      </div>
      <div className="p-4 grid gap-3">
        {filtered.map((a) => (
          <AssignmentCard
            key={a.id}
            a={a}
            actions={
              <>
                <button
                  onClick={() => handleApprove(a.id)}
                  disabled={actionLoading === a.id}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  {actionLoading === a.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                  Approve
                </button>
                <button
                  onClick={() => handleReject(a.id)}
                  disabled={actionLoading === a.id}
                  className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  <Ban size={12} />
                  Reject
                </button>
              </>
            }
          />
        ))}
      </div>
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

  if (loading || filtered.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <Shield className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-bold text-slate-900">Active Role Assignments</span>
        <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">{filtered.length}</span>
      </div>
      <div className="p-4 grid gap-3">
        {filtered.map((a) => (
          <AssignmentCard
            key={a.id}
            a={a}
            actions={
              <button
                onClick={() => handleRevoke(a.id)}
                disabled={actionLoading === a.id}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-1"
              >
                {actionLoading === a.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldOff size={12} />}
                Revoke
              </button>
            }
          />
        ))}
      </div>
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

  if (loading || filteredRevoked.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 transition-colors text-left flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span className="text-sm font-bold text-slate-900">Revoked Role Assignments</span>
          <span className="ml-1 px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">{filteredRevoked.length}</span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="p-4 grid gap-3">
          {filteredRevoked.map((a) => (
            <AssignmentCard
              key={a.id}
              a={a}
              actions={
                <>
                  <button
                    onClick={() => handleActivate(a.id)}
                    disabled={actionLoading === a.id}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    {actionLoading === a.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                    Activate
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={actionLoading === a.id}
                    className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
