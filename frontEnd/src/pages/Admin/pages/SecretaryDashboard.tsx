import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { memberService } from "../../../api/jumuiyaMemberService";
import {
  Users, Search, RefreshCw, Download, Church, Calendar,
  BarChart3, List, TrendingUp, Upload, GitMerge, CheckCircle,
  ArrowLeftRight, ClipboardList, UserCheck, Image, X, Loader2
} from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import MemberImportForm from "../../Jumuiya/admin/MemberImportForm";
import MemberReview from "../../Jumuiya/admin/MemberReview";
import OrganizationPanel from "../../Jumuiya/admin/OrganizationPanel";
import CsaAllocationsApproval from "../../Jumuiya/components/CsaAllocationsApproval";
import GalleryManager from "./GalleryManager";

type DashboardTab = "overview" | "import" | "organize" | "review" | "members" | "allocations" | "analytics" | "gallery";

const TAB_CONFIGS: Record<string, { id: DashboardTab; label: string; icon: any }[]> = {
  chair: [
    { id: "overview", label: "Dashboard", icon: BarChart3 },
    { id: "import", label: "New Admission", icon: Upload },
    { id: "organize", label: "Organize", icon: GitMerge },
    { id: "review", label: "Review", icon: ClipboardList },
    { id: "members", label: "All Members", icon: Users },
    { id: "allocations", label: "Allocations", icon: UserCheck },
    { id: "analytics", label: "Reports", icon: TrendingUp },
  ],
  secretary: [
    { id: "overview", label: "Dashboard", icon: BarChart3 },
    { id: "review", label: "Review", icon: ClipboardList },
    { id: "members", label: "All Members", icon: Users },
    { id: "analytics", label: "Reports", icon: TrendingUp },
  ],
  os: [
    { id: "overview", label: "Dashboard", icon: BarChart3 },
    { id: "members", label: "All Members", icon: Users },
    { id: "gallery", label: "Gallery", icon: Image },
  ],
};

// ── Jumuiya config ──
const JUMUIYAS: Record<string, { name: string; color: string; initials: string }> = {
  "st-anthony": { name: "St. Anthony", color: "#8b5cf6", initials: "SA" },
  "st-augustine": { name: "St. Augustine", color: "#3b82f6", initials: "AU" },
  "st-catherine": { name: "St. Catherine", color: "#800000", initials: "CA" },
  "st-dominic": { name: "St. Dominic", color: "#979695ff", initials: "DO" },
  "st-elizabeth": { name: "St. Elizabeth", color: "#07a414d1", initials: "EL" },
  "st-maria-goretti": { name: "St. Maria Goretti", color: "#0ea5e9", initials: "MG" },
  "st-monica": { name: "St. Monica", color: "#ef4444", initials: "MO" },
};

const SEMESTERS = [
  { label: "1.1", dbCol: "sem_1_reg" },
  { label: "1.2", dbCol: "sem_2_reg" },
  { label: "2.1", dbCol: "sem_3_reg" },
  { label: "2.2", dbCol: "sem_4_reg" },
  { label: "3.1", dbCol: "sem_5_reg" },
  { label: "3.2", dbCol: "sem_6_reg" },
  { label: "4.1", dbCol: "sem_7_reg" },
  { label: "4.2", dbCol: "sem_8_reg" },
];

function getYearSemLabel(m: any): string {
  for (let i = 8; i >= 1; i--) {
    const col = `sem_${i}_reg`;
    if (m[col]) {
      const sem = SEMESTERS[i - 1];
      return sem ? sem.label : "";
    }
  }
  return "—";
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
  } catch { return d; }
}

export default function SecretaryDashboard() {
  const { user } = useAuth();
  const jumuiyaId = user?.jumuiya_id || "";
  const jumuiyaInfo = JUMUIYAS[jumuiyaId] || { name: jumuiyaId || "Your Jumuiya", color: "#6b7280", initials: "J" };

  // ── Role detection ──
  const userRoles = Array.isArray(user?.role) ? user.role : user?.role ? [user.role] : [];
  const normalizedRoles = userRoles.map(r => String(r).toUpperCase().trim());
  const isChair = normalizedRoles.includes("JUMUIYA_CHAIRPERSON");
  const isSecretary = normalizedRoles.includes("JUMUIYA_SECRETARY");
  const isOS = normalizedRoles.includes("JUMUIYA_OS");
  const roleKey = isChair ? "chair" : isSecretary ? "secretary" : "os";
  const tabs = TAB_CONFIGS[roleKey];
  const roleLabel = isChair ? "Chairperson Dashboard" : isSecretary ? "Secretary Dashboard" : "Jumuiya Dashboard";

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // ── Overview data ──
  const [stats, setStats] = useState<any>(null);
  const [csaAllocations, setCsaAllocations] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // ── Members data ──
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showExport, setShowExport] = useState(false);
  const [exportCols, setExportCols] = useState<Record<string, boolean>>({
    name: true, reg_number: true, gender: true, course: true,
    year_sem: true, registration_date: true,
    sem_1_reg: false, sem_2_reg: false, sem_3_reg: false, sem_4_reg: false,
    sem_5_reg: false, sem_6_reg: false, sem_7_reg: false, sem_8_reg: false,
  });

  // ── Analytics data ──
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // ── Fetch overview stats ──
  const fetchOverview = useCallback(async () => {
    if (!jumuiyaId) return;
    setLoadingStats(true);
    try {
      const [statsRes, csaRes, seasonsRes] = await Promise.all([
        memberService.getStatistics(jumuiyaId),
        memberService.getCsaAllocations(jumuiyaId).catch(() => ({ data: { members: [] } })),
        memberService.getSeasons(jumuiyaId).catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data || null);
      setCsaAllocations((csaRes.data?.members || csaRes.data || []));
      setSeasons(seasonsRes.data || []);
    } catch (err) {
      console.error("Failed to load overview:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoadingStats(false);
    }
  }, [jumuiyaId]);

  // ── Fetch members ──
  const fetchMembers = useCallback(async () => {
    if (!jumuiyaId) return;
    setLoadingMembers(true);
    try {
      const res = await memberService.csaGetJumuiyaMemberList(jumuiyaId);
      setMembers(res.data || []);
    } catch (err) {
      // Fallback: try export members endpoint
      try {
        const res = await memberService.exportMembers(jumuiyaId);
        setMembers(res.data || []);
      } catch (err2) {
        console.error("Failed to load members:", err2);
        toast.error("Failed to load members");
      }
    } finally {
      setLoadingMembers(false);
    }
  }, [jumuiyaId]);

  // ── Fetch analytics ──
  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const res = await memberService.getAnalytics();
      const allData = res.data || res || {};
      
      // Filter analytics for this jumuiya
      const jumuiyaSlug = jumuiyaId.toLowerCase().replace(/\s+/g, "-");
      const regByJum = (allData.registrationsByJumuiya || []).find(
        (j: any) => (j.jumuiya_slug || "").toLowerCase() === jumuiyaSlug
      );
      
      setAnalytics({
        totalRegistered: allData.totalRegistered || 0,
        totalMembers: allData.totalMembers || 0,
        jumuiyaData: regByJum || null,
        semesterFillRates: allData.semesterFillRates || null,
        recentRegistrations: (allData.recentRegistrations || []).filter(
          (r: any) => (r.jumuiya_slug || "").toLowerCase() === jumuiyaSlug
        ).slice(0, 10),
      });
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [jumuiyaId]);

  useEffect(() => {
    fetchOverview();
    fetchMembers();
  }, [jumuiyaId]);

  useEffect(() => {
    if (activeTab === "analytics") fetchAnalytics();
    if (activeTab === "members" && members.length === 0) fetchMembers();
  }, [activeTab, jumuiyaId]);

  // ── Filtered & sorted members ──
  const filteredMembers = useMemo(() => {
    let result = [...members];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        (m.name || "").toLowerCase().includes(q) ||
        (m.reg_number || "").toLowerCase().includes(q) ||
        (m.course || "").toLowerCase().includes(q)
      );
    }

    if (genderFilter !== "all") {
      result = result.filter(m => (m.gender || "").toLowerCase() === genderFilter.toLowerCase());
    }

    if (semesterFilter !== "all") {
      const col = SEMESTERS.find(s => s.label === semesterFilter)?.dbCol;
      if (col) result = result.filter(m => m[col] === true || m[col] === "true" || m[col] === 1);
    }

    result.sort((a, b) => {
      let aVal = (a[sortKey] || "").toString().toLowerCase();
      let bVal = (b[sortKey] || "").toString().toLowerCase();
      if (sortKey === "name") {
        aVal = (a.name || `${a.first_name || ""} ${a.last_name || ""}`).toLowerCase();
        bVal = (b.name || `${b.first_name || ""} ${b.last_name || ""}`).toLowerCase();
      }
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    return result;
  }, [members, search, genderFilter, semesterFilter, sortKey, sortDir]);

  // ── Export ──
  const handleExport = () => {
    const cols = Object.entries(exportCols).filter(([, v]) => v).map(([k]) => k);
    const data = filteredMembers.map(m => {
      const row: Record<string, any> = {};
      cols.forEach(col => {
        if (col.startsWith("sem_")) {
          row[col] = m[col] ? "Yes" : "—";
        } else if (col === "name") {
          row[col] = m.name || `${m.first_name || ""} ${m.last_name || ""}`.trim();
        } else if (col === "registration_date") {
          row[col] = formatDate(m[col]);
        } else if (col === "year_sem") {
          row[col] = getYearSemLabel(m);
        } else {
          row[col] = m[col] ?? "—";
        }
      });
      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, `${jumuiyaInfo.name.replace(/\s+/g, "-")}-members.xlsx`);
    setShowExport(false);
  };

  const genderCounts = useMemo(() => {
    let male = 0, female = 0;
    members.forEach(m => {
      const g = (m.gender || "").toLowerCase();
      if (g === "male") male++;
      else if (g === "female") female++;
    });
    return { male, female };
  }, [members]);

  const semesterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SEMESTERS.forEach(s => {
      counts[s.label] = members.filter(m => m[s.dbCol] === true || m[s.dbCol] === "true" || m[s.dbCol] === 1).length;
    });
    return counts;
  }, [members]);

  if (!jumuiyaId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Church size={64} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-600">No Jumuiya Assigned</h2>
        <p className="text-slate-400 mt-2 max-w-md">
          Your account is not linked to a specific Jumuiya. Please contact the admin to assign you to a Jumuiya.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
            style={{ background: `linear-gradient(135deg, ${jumuiyaInfo.color}, ${jumuiyaInfo.color}cc)` }}
          >
            {jumuiyaInfo.initials}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">{jumuiyaInfo.name}</h2>
            <p className="text-sm text-slate-500">
              {roleLabel}
            </p>
          </div>
        </div>
        <button
          onClick={() => { fetchOverview(); fetchMembers(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw size={16} className={(loadingStats || loadingMembers) ? "animate-spin" : ""} />
          Refresh All
        </button>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════ OVERVIEW TAB ═══════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {loadingStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Users size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-800">{stats?.totalMembers || 0}</p>
                      <p className="text-xs text-slate-400 font-medium">Total Members</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <CheckCircle size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-800">{stats?.jum?.total || 0}</p>
                      <p className="text-xs text-slate-400 font-medium">Jum Members</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                      <GitMerge size={20} className="text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-800">{stats?.csa?.total || 0}</p>
                      <p className="text-xs text-slate-400 font-medium">CSA Allocated</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <List size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-800">{stats?.groups?.length || 0}</p>
                      <p className="text-xs text-slate-400 font-medium">Groups</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gender Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Gender Distribution</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Male</span>
                        <span className="font-bold text-blue-600">{genderCounts.male}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${members.length > 0 ? (genderCounts.male / members.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Female</span>
                        <span className="font-bold text-pink-600">{genderCounts.female}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pink-500 rounded-full transition-all"
                          style={{ width: `${members.length > 0 ? (genderCounts.female / members.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Semester Progress */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 md:col-span-2">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Semester Registration Progress</h3>
                  <div className="flex items-end gap-1 h-28">
                    {SEMESTERS.map(s => {
                      const count = semesterCounts[s.label] || 0;
                      const maxH = Math.max(...Object.values(semesterCounts), 1);
                      const pct = (count / maxH) * 100;
                      return (
                        <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-slate-600">{count}</span>
                          <div className="w-full bg-indigo-100 rounded-t-md transition-all" style={{ height: `${pct}%`, minHeight: count > 0 ? 4 : 0 }} />
                          <span className="text-[10px] text-slate-400 font-medium">{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Seasons */}
              {seasons.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-500" />
                    Registration Seasons
                  </h3>
                  <div className="space-y-2">
                    {seasons.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${
                            s.status === "active" ? "bg-emerald-500" : s.status === "closed" ? "bg-red-400" : "bg-slate-300"
                          }`} />
                          <span className="font-semibold text-sm text-slate-700">{s.season_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>{s.start_date?.slice(0, 10)} — {s.end_date?.slice(0, 10)}</span>
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${
                            s.status === "active" ? "bg-emerald-100 text-emerald-700" :
                            s.status === "closed" ? "bg-red-100 text-red-700" :
                            "bg-slate-200 text-slate-600"
                          }`}>{s.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent CSA Allocations */}
              {csaAllocations.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <ArrowLeftRight size={16} className="text-cyan-500" />
                    Recent CSA Allocations ({csaAllocations.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Reg #</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Gender</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Year</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csaAllocations.slice(0, 10).map((m: any, i: number) => (
                          <tr key={m.id || i} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-2 px-3 font-medium text-slate-700">{m.name}</td>
                            <td className="py-2 px-3 text-slate-500 font-mono text-xs">{m.reg_number || "—"}</td>
                            <td className="py-2 px-3">
                              <span className={`text-xs font-semibold ${m.gender === "Male" ? "text-blue-600" : "text-pink-600"}`}>
                                {m.gender === "Male" ? "M" : m.gender === "Female" ? "W" : "—"}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-500 text-xs">{m.academic_year || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══════════ MEMBERS TAB ═══════════ */}
      {activeTab === "members" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, reg number, course..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <select
              value={semesterFilter}
              onChange={e => setSemesterFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Semesters</option>
              {SEMESTERS.map(s => (
                <option key={s.label} value={s.label}>Sem {s.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Download size={16} /> Export
            </button>
            <button
              onClick={fetchMembers}
              disabled={loadingMembers}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              <RefreshCw size={16} className={loadingMembers ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Count badge */}
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-700">{filteredMembers.length}</span> of{" "}
            <span className="font-bold text-slate-700">{members.length}</span> members
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {[
                      { key: "name", label: "Name" },
                      { key: "reg_number", label: "Reg Number" },
                      { key: "gender", label: "Gender" },
                      { key: "course", label: "Course" },
                      { key: "year_sem", label: "Year.Sem" },
                      { key: "registration_date", label: "Registered" },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => {
                          if (sortKey === col.key) setSortDir(d => d === "asc" ? "desc" : "asc");
                          else { setSortKey(col.key); setSortDir("asc"); }
                        }}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortKey === col.key && (
                            <span className="text-indigo-500">{sortDir === "asc" ? "▲" : "▼"}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingMembers ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <Loader2 size={32} className="text-indigo-500 animate-spin mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">Loading members...</p>
                      </td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                        {members.length === 0 ? "No members found in this Jumuiya" : "No members match your filters"}
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m, i) => (
                      <tr key={m.registration_id || m.id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {m.name || `${m.first_name || ""} ${m.last_name || ""}`.trim() || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{m.reg_number || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            (m.gender || "").toLowerCase() === "male"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-pink-50 text-pink-600"
                          }`}>
                            {(m.gender || "").toLowerCase() === "male" ? "M" : "W"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs max-w-[120px] truncate" title={m.course}>
                          {m.course || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                            {m.year_sem || getYearSemLabel(m)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {formatDate(m.registration_date)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Modal */}
          {showExport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowExport(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Export Members</h3>
                  <button onClick={() => setShowExport(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-4">Select columns to include:</p>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                  {Object.entries(exportCols).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => setExportCols(prev => ({ ...prev, [key]: !prev[key] }))}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700 capitalize">{key.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleExport}
                  disabled={!Object.values(exportCols).some(v => v)}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Download size={16} className="inline mr-2" />
                  Export {filteredMembers.length} Members
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ ANALYTICS TAB ═══════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {loadingAnalytics ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={32} className="text-indigo-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Analytics Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-3xl font-black text-slate-800">{members.length}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Total in {jumuiyaInfo.name}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-3xl font-black text-emerald-600">{genderCounts.male}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Male Members</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-3xl font-black text-pink-600">{genderCounts.female}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Female Members</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <p className="text-3xl font-black text-amber-600">{csaAllocations.length}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">CSA Allocations</p>
                </div>
              </div>

              {/* Semester Fill Rate Details */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Semester Registration Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SEMESTERS.map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-black text-indigo-600">{semesterCounts[s.label] || 0}</p>
                      <p className="text-xs text-slate-400 font-medium">Sem {s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Groups Overview */}
              {stats?.groups && stats.groups.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">Groups Overview</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stats.groups.map((g: any) => (
                      <div key={g.id || g.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Users size={14} className="text-indigo-600" />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{g.name || `Group ${g.id}`}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-500">{g.member_count ?? g.count ?? "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Registrations */}
              {analytics?.recentRegistrations?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">Recent Registrations</h3>
                  <div className="space-y-2">
                    {analytics.recentRegistrations.map((r: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {(r.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{r.name || "—"}</p>
                            <p className="text-xs text-slate-400">{r.reg_number || ""}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{formatDate(r.registration_date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══════════ NEW ADMISSION TAB (Chair only) ═══════════ */}
      {activeTab === "import" && (
        <MemberImportForm jumuiyaId={jumuiyaId} />
      )}

      {/* ═══════════ ORGANIZE TAB (Chair only) ═══════════ */}
      {activeTab === "organize" && (
        <OrganizationPanel jumuiyaId={jumuiyaId} />
      )}

      {/* ═══════════ REVIEW TAB (Chair + Secretary) ═══════════ */}
      {activeTab === "review" && (
        <MemberReview jumuiyaId={jumuiyaId} jumuiyaName={jumuiyaInfo.name} />
      )}

      {/* ═══════════ ALLOCATIONS TAB (Chair only) ═══════════ */}
      {activeTab === "allocations" && (
        <CsaAllocationsApproval jumuiyaId={jumuiyaId} jumuiyaName={jumuiyaInfo.name} jumuiyaColor={jumuiyaInfo.color} />
      )}

      {/* ═══════════ GALLERY TAB (OS only) ═══════════ */}
      {activeTab === "gallery" && (
        <GalleryManager />
      )}
    </div>
  );
}
