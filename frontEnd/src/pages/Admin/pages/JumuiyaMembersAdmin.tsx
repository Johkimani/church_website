import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, ArrowLeft, Church, RefreshCw, UserPlus, Upload, Search, ClipboardList, ThumbsDown, Edit2, Save, Trash2, GraduationCap, UserCheck, PieChart } from "lucide-react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { useAuth } from "../../../context/AuthContext";
import RegistrationDashboard from "../../Jumuiya/admin/RegistrationDashboard";
import MemberImportForm from "../../Jumuiya/admin/MemberImportForm";
import MemberReview from "../../Jumuiya/admin/MemberReview";
import ValidationReview from "../../Jumuiya/admin/ValidationReview";
import MembersList from "../../Jumuiya/admin/MembersList";
import CSADistributionCenter from "./CSADistributionCenter";
import CsaAllocationsApproval from "../../Jumuiya/components/CsaAllocationsApproval";
import AllMembersTable from "./AllMembersTable";
import AssociatesTable from "./AssociatesTable";
import CopyWhatsAppButton from "../../Jumuiya/components/CopyWhatsAppButton";

// Improved cache with longer TTL (60s) and memory efficiency
let statsCache: { data: Record<string, any>; ts: number } | null = null;
const CACHE_TTL = 60000; // Increased from 30s to 60s
function getCachedStats() {
  if (statsCache && Date.now() - statsCache.ts < CACHE_TTL) return statsCache.data;
  statsCache = null; // Clear expired cache
  return null;
}
function setCachedStats(data: Record<string, any>) { statsCache = { data, ts: Date.now() }; }
function clearCache() { statsCache = null; }

const JUMUIYAS = [
  { id: "st-anthony", name: "St. Anthony", color: "#8b5cf6", initials: "SA" },
  { id: "st-augustine", name: "St. Augustine", color: "#3b82f6", initials: "AU" },
  { id: "st-catherine", name: "St. Catherine", color: "#800000", initials: "CA" },
  { id: "st-dominic", name: "St. Dominic", color: "#979695ff", initials: "DO" },
  { id: "st-elizabeth", name: "St. Elizabeth", color: "#07a414d1", initials: "EL" },
  { id: "st-maria-goretti", name: "St. Maria Goretti", color: "#0ea5e9", initials: "MG" },
  { id: "st-monica", name: "St. Monica", color: "#ef4444", initials: "MO" },
];

type Tab = "admissions" | "jumuiyas" | "all-members" | "associates";

type SubTab = "dashboard" | "staging" | "review" | "results" | "allocations" | "import";

const subTabMeta: Record<SubTab, { label: string; icon: React.ReactNode; description: string }> = {
  dashboard: { label: "Dashboard", icon: <PieChart size={16} />, description: "Overview and registration statistics" },
  staging: { label: "Pending Queue", icon: <ClipboardList size={16} />, description: "Review and approve WhatsApp self-registrations & imports" },
  review: { label: "Active Review", icon: <UserCheck size={16} />, description: "Review and edit active registered members" },
  results: { label: "All Members", icon: <Users size={16} />, description: "View and manage all registered members" },
  allocations: { label: "Allocations", icon: <UserCheck size={16} />, description: "Approve CSA member allocations" },
  import: { label: "Manual Admission", icon: <Upload size={16} />, description: "Import and add new members manually" },
};

function SummaryBar({ stats }: { stats: Record<string, any> }) {
  const total = Object.values(stats).reduce((sum: number, s: any) => sum + (s?.totalMembers || 0), 0);
  const totalJum = Object.values(stats).reduce((sum: number, s: any) => sum + (s?.jum?.total || 0), 0);
  const totalCSA = Object.values(stats).reduce((sum: number, s: any) => sum + (s?.csa?.total || 0), 0);
  const totalMale = Object.values(stats).reduce((sum: number, s: any) => {
    const m = s?.genderBreakdown?.find((g: any) => g.gender === "Male" || g.gender === "male");
    return sum + (m?.count || 0);
  }, 0);
  const totalFemale = Object.values(stats).reduce((sum: number, s: any) => {
    const f = s?.genderBreakdown?.find((g: any) => g.gender === "Female" || g.gender === "female");
    return sum + (f?.count || 0);
  }, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-3xl font-bold text-slate-800">{total}</p>
        <p className="text-xs text-slate-500 font-medium">Total Members</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-3xl font-bold text-slate-800">{totalJum}</p>
        <p className="text-xs text-slate-500 font-medium">Jum</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-3xl font-bold text-slate-800">{totalCSA}</p>
        <p className="text-xs text-slate-500 font-medium">CSA</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-blue-600">♂ {totalMale}</span>
          <span className="text-slate-300">|</span>
          <span className="text-pink-600">♀ {totalFemale}</span>
        </p>
        <p className="text-xs text-slate-500 font-medium">Men / Women</p>
      </div>
    </div>
  );
}

const SummaryBarMemo = memo(SummaryBar);

const MemberManagementView: React.FC<{ jumuiyaId: string; jumuiyaName: string; jumuiyaColor: string; isJumuiyaOfficial?: boolean }> = ({ jumuiyaId, jumuiyaName, jumuiyaColor, isJumuiyaOfficial }) => {
  const [activeTab, setActiveTab] = useState<SubTab>("dashboard");

  const visibleTabs = (Object.entries(subTabMeta) as [SubTab, typeof subTabMeta[SubTab]][]).filter(
    ([id]) => !(isJumuiyaOfficial && id === "import")
  );

  return (
    <div>
      {/* Main Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
          {visibleTabs.map(([id, meta]) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  {meta.icon}
                </div>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "dashboard" && <RegistrationDashboard jumuiyaId={jumuiyaId} jumuiyaName={jumuiyaName} jumuiyaColor={jumuiyaColor} />}
      {activeTab === "staging" && <ValidationReview jumuiyaId={jumuiyaId} />}
      {activeTab === "review" && <MemberReview jumuiyaId={jumuiyaId} jumuiyaName={jumuiyaName} />}
      {activeTab === "results" && <MembersList jumuiyaId={jumuiyaId} jumuiyaName={jumuiyaName} />}
      {activeTab === "allocations" && <CsaAllocationsApproval jumuiyaId={jumuiyaId} jumuiyaName={jumuiyaName} jumuiyaColor={jumuiyaColor} />}
      {activeTab === "import" && !isJumuiyaOfficial && <MemberImportForm jumuiyaId={jumuiyaId} />}
    </div>
  );
};

function JumuiyaCard({ j, stats, onClick }: { j: typeof JUMUIYAS[0]; stats: any; onClick?: () => void }) {
  const s = stats;
  const totalMembers = s?.totalMembers || 0;
  const hasData = totalMembers > 0;
  const isLocked = !onClick;
  const maleTotal = (s?.genderBreakdown?.find((g: any) => g.gender === "Male" || g.gender === "male")?.count || 0);
  const femaleTotal = (s?.genderBreakdown?.find((g: any) => g.gender === "Female" || g.gender === "female")?.count || 0);

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`bg-white rounded-xl border ${isLocked ? "border-slate-100 opacity-50 cursor-not-allowed" : "border-slate-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"} p-5 text-left transition-all duration-200 group w-full`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: j.color }}
        >
          {j.initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
            {j.name}
          </h3>
          {hasData && (
            <p className="text-xs text-slate-400 mt-0.5">
              {s.groups?.length || 0} group{s.groups?.length !== 1 ? "s" : ""}
              {s?.csa?.total > 0 && (
                <span className="ml-2 text-indigo-400">· {s.csa.total} from CSA</span>
              )}
            </p>
          )}
        </div>
        {hasData && (
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-slate-800">{totalMembers}</p>
            <p className="text-[10px] text-slate-400 font-medium">members</p>
          </div>
        )}
      </div>

      {hasData ? (
        <div className="space-y-2.5">
          {/* Jum vs CSA bar */}
          <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
            {s?.jum?.total > 0 && (
              <div className="bg-indigo-400 h-full transition-all" style={{ width: `${(s.jum.total / totalMembers) * 100}%` }} />
            )}
            {s?.csa?.total > 0 && (
              <div className="bg-cyan-400 h-full transition-all" style={{ width: `${(s.csa.total / totalMembers) * 100}%` }} />
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-indigo-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400" /> {s?.jum?.total || 0} Jum
            </span>
            <span className="text-cyan-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> {s?.csa?.total || 0} CSA
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium text-xs">
              ♂ {maleTotal}
            </span>
            <span className="text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full font-medium text-xs">
              ♀ {femaleTotal}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400">No data yet — click to get started</p>
      )}
    </button>
  );
}

const JumuiyaCardMemo = memo(JumuiyaCard);

export default function JumuiyaMembersAdmin() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const userRoles = useMemo(() => (
    Array.isArray(user?.role) ? user.role : user?.role ? [user.role] : []
  ), [user?.role]);
  const normalizedRoles = useMemo(() => (
    userRoles.map(r => String(r).toUpperCase().trim())
  ), [userRoles]);
  const isJumuiyaOfficial = useMemo(() => (
    normalizedRoles.some(r => ["JUMUIYA_OS", "JUMUIYA_SECRETARY", "JUMUIYA_CHAIRPERSON"].includes(r))
  ), [normalizedRoles]);
  const userJumuiyaId = user?.jumuiya_id || "";
  const [userJumuiyaSlug, setUserJumuiyaSlug] = useState("");
  const [globalTab, setGlobalTab] = useState<Tab>("admissions");

  useEffect(() => {
    if (user && isJumuiyaOfficial) setGlobalTab("jumuiyas");
  }, [user, isJumuiyaOfficial]);

  // Resolve UUID jumuiya_id → slug for matching against JUMUIYAS array
  useEffect(() => {
    if (!userJumuiyaId || !isJumuiyaOfficial) { setUserJumuiyaSlug(""); return; }
    const found = JUMUIYAS.find(j => j.id === userJumuiyaId);
    if (found) { setUserJumuiyaSlug(found.id); return; }
    memberService.getJumuiyaLookup().then((res: any) => {
      const lookup = res?.data || res || {};
      const entry = lookup[userJumuiyaId];
      if (entry) {
        const slug = JUMUIYAS.find(j => j.name.toLowerCase() === (entry.name || "").toLowerCase())?.id || "";
        setUserJumuiyaSlug(slug);
      }
    }).catch(() => {});
  }, [userJumuiyaId, isJumuiyaOfficial]);

  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [rejectedMembers, setRejectedMembers] = useState<any[]>([]);
  const [editingRejected, setEditingRejected] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    reg_number: string;
    gender: string;
    phone: string;
    email: string;
  }>({ name: "", reg_number: "", gender: "", phone: "", email: "" });
  const [assigning, setAssigning] = useState<number | null>(null);

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAllStats = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCachedStats();
      if (cached) { setStats(cached); setLoading(false); return; }
    }
    setLoading(true);
    try {
      const res = await memberService.getBatchStatistics();
      setCachedStats(res.data);
      setStats(res.data);
    } catch {
      const results: Record<string, any> = {};
      await Promise.all(
        JUMUIYAS.map(async (j) => {
          try { const r = await memberService.getStatistics(j.id); results[j.id] = r.data; }
          catch { results[j.id] = null; }
        })
      );
      setStats(results);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRejectedMembers = useCallback(async () => {
    try {
      const res = await memberService.csaGetRejectedMembers();
      setRejectedMembers(res.data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (id) return;
    
    const loadData = async () => {
      await fetchAllStats();
      await fetchRejectedMembers();
    };
    
    loadData();

    const handleMembersUpdated = () => {
      clearCache();
      fetchAllStats(true);
      setRefreshKey(k => k + 1);
    };
    window.addEventListener("csa_members_updated", handleMembersUpdated);
    return () => window.removeEventListener("csa_members_updated", handleMembersUpdated);
  }, [id, refreshKey, fetchAllStats, fetchRejectedMembers]);

  const handleEditRejected = (m: any) => {
    setEditingRejected(m.id);
    setEditForm({ name: m.name || "", reg_number: m.reg_number || "", gender: m.gender || "", phone: m.phone || "", email: m.email || "" });
  };

  const handleSaveRejected = async (id: number) => {
    try {
      await memberService.csaUpdateRejectedMember(id, editForm);
      setEditingRejected(null);
      fetchRejectedMembers();
    } catch { /* ignore */ }
  };

  const handleAssignRejected = async (id: number, jumuiyaName: string) => {
    setAssigning(id);
    try {
      await memberService.csaUpdateRejectedMember(id, { assign_jumuiya: jumuiyaName });
      fetchRejectedMembers();
    } catch { /* ignore */ }
    finally { setAssigning(null); }
  };

  const handleDeleteRejected = async (id: number) => {
    if (!confirm("Permanently delete this member?")) return;
    try {
      await memberService.csaDeleteRejectedMember(id);
      setRejectedMembers(prev => prev.filter(m => m.id !== id));
    } catch { /* ignore */ }
  };

  const filtered = useMemo(() => 
    JUMUIYAS.filter((j) => j.name.toLowerCase().includes(debouncedSearch.toLowerCase())),
    [debouncedSearch]
  );

  // ── Per-Jumuiya detail view ──
  if (id) {
    const jumuiya = JUMUIYAS.find((j) => j.id === id);
    if (!jumuiya) {
      return (
        <div className="text-center py-20">
          <p className="text-red-500 font-semibold">Jumuiya not found</p>
          <button onClick={() => navigate("/admin/jumuiya-members")} className="mt-4 text-sm text-indigo-600 hover:underline">
            Back to all Jumuiyas
          </button>
        </div>
      );
    }
    if (isJumuiyaOfficial && userJumuiyaSlug && userJumuiyaSlug !== id) {
      return (
        <div className="text-center py-20">
          <p className="text-red-500 font-semibold">Access denied</p>
          <p className="text-sm text-slate-500 mt-1 mb-4">You can only manage your own Jumuiya.</p>
          <button onClick={() => navigate("/admin/jumuiya-members")} className="mt-4 text-sm text-indigo-600 hover:underline">
            Back to all Jumuiyas
          </button>
        </div>
      );
    }
    return (
      <div>
        <button
          onClick={() => navigate("/admin/jumuiya-members")}
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-5 transition-colors"
        >
          <ArrowLeft size={16} /> Back to all Jumuiyas
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: jumuiya.color }}>
              {jumuiya.initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{jumuiya.name}</h2>
              <p className="text-sm text-slate-500">Member Management</p>
            </div>
          </div>
          <CopyWhatsAppButton jumuiyaSlug={jumuiya.id} jumuiyaName={jumuiya.name} />
        </div>

        <MemberManagementView jumuiyaId={id} jumuiyaName={jumuiya.name} jumuiyaColor={jumuiya.color} isJumuiyaOfficial={isJumuiyaOfficial} />
      </div>
    );
  }

  // ── Global view with tabs ──
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Church size={24} className="text-indigo-500" />
            Jumuiya Members Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Admit and distribute new members across Jumuiyas, or manage individual Jumuiyas.
          </p>
        </div>
      </div>

      {/* Global Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {!isJumuiyaOfficial && (
          <button
            onClick={() => { setGlobalTab("admissions"); setRefreshKey(k => k + 1); }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              globalTab === "admissions"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            <UserPlus size={16} /> New Admissions
          </button>
        )}
        {!isJumuiyaOfficial && (
          <button
            onClick={() => { setGlobalTab("all-members"); setRefreshKey(k => k + 1); }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              globalTab === "all-members"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            <Users size={16} /> All CSA Members
          </button>
        )}
        {!isJumuiyaOfficial && (
          <button
            onClick={() => { setGlobalTab("associates"); setRefreshKey(k => k + 1); }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              globalTab === "associates"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            <GraduationCap size={16} /> Associates
          </button>
        )}
        <button
          onClick={() => { setGlobalTab("jumuiyas"); setRefreshKey(k => k + 1); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
            globalTab === "jumuiyas"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
          }`}
        >
          <Church size={16} /> Per-Jumuiya
        </button>
      </div>

      {!isJumuiyaOfficial && globalTab === "admissions" && <CSADistributionCenter />}

      {!isJumuiyaOfficial && globalTab === "all-members" && <AllMembersTable key={refreshKey} refreshKey={refreshKey} />}

      {!isJumuiyaOfficial && globalTab === "associates" && <AssociatesTable key={refreshKey} refreshKey={refreshKey} />}

      {globalTab === "jumuiyas" && (
        <div>
          {!loading && <SummaryBarMemo stats={stats} />}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">Select a Jumuiya to manage member registration, validation, organization, and distribution.</p>
            <button
              onClick={() => { clearCache(); setRefreshKey(k => k + 1); }}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Jumuiya..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((j) => {
                const canClick = !isJumuiyaOfficial || userJumuiyaSlug === j.id;
                return (
                  <JumuiyaCardMemo
                    key={j.id}
                    j={j}
                    stats={stats[j.id]}
                    onClick={canClick ? () => navigate(`/admin/jumuiya-members/${j.id}`) : undefined}
                  />
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400">
                  No Jumuiya matching "{debouncedSearch}"
                </div>
              )}
            </div>
          )}

          {/* ── Rejected Members ── */}
          {rejectedMembers.length > 0 && (
            <div className="bg-white rounded-xl border border-red-200 p-5 mt-6">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <ThumbsDown size={16} className="text-red-500" />
                Rejected Members ({rejectedMembers.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Name</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Reg #</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Gender</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Phone</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Year</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Reason</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Assign To</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedMembers.map(m => {
                      const isEditing = editingRejected === m.id;
                      return (
                        <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                className="text-xs border border-slate-200 rounded px-1.5 py-1 w-28" />
                            ) : (
                              <span className="text-slate-700 font-medium">{m.name}</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input value={editForm.reg_number} onChange={e => setEditForm(p => ({ ...p, reg_number: e.target.value }))}
                                className="text-xs border border-slate-200 rounded px-1.5 py-1 w-24" />
                            ) : (
                              <span className="text-slate-600">{m.reg_number || "—"}</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <select value={editForm.gender} onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))}
                                className="text-xs border border-slate-200 rounded px-1.5 py-1">
                                <option value="">—</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            ) : (
                              <span className={`text-xs font-semibold ${m.gender === "Male" ? "text-blue-600" : "text-pink-600"}`}>
                                {m.gender === "Male" ? "M" : m.gender === "Female" ? "W" : "—"}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                                className="text-xs border border-slate-200 rounded px-1.5 py-1 w-24" />
                            ) : (
                              <span className="text-slate-600">{m.phone || "—"}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-600">{m.academic_year || "—"}</td>
                          <td className="py-2 px-3">
                            <span className="text-xs text-red-500">{m.rejection_reason || "Rejected"}</span>
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value=""
                              onChange={e => { if (e.target.value) handleAssignRejected(m.id, e.target.value); }}
                              disabled={assigning === m.id}
                              className="text-xs border border-slate-200 rounded px-1.5 py-1 w-28">
                              <option value="">{assigning === m.id ? "Assigning..." : "— Choose —"}</option>
                              {JUMUIYAS.map(j => (
                                <option key={j.id} value={j.name}>{j.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex gap-1">
                              {isEditing ? (
                                <button onClick={() => handleSaveRejected(m.id)}
                                  className="text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200">
                                  <Save size={12} />
                                </button>
                              ) : (
                                <button onClick={() => handleEditRejected(m)}
                                  className="text-xs font-semibold px-2 py-1 rounded bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200">
                                  <Edit2 size={12} />
                                </button>
                              )}
                              <button onClick={() => handleDeleteRejected(m.id)}
                                className="text-xs font-semibold px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}