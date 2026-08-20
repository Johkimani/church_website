import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../api/axiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { timeAgo } from "../../../utils";
import {
  RefreshCw,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  ShieldCheck,
  Users,
  Filter,
  Trash2,
  Sparkles,
  Shield,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

interface LogEntry {
  id: number;
  actor_id: string | number | null;
  actor_name: string;
  actor_role: string | null;
  jumuiya_id: string | null;
  jumuiya_name: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  "csa chair": "bg-purple-100 text-purple-800 border-purple-200",
  "csa vice chair": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  "csa secretary": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "jumuiya coordinator": "bg-blue-100 text-blue-800 border-blue-200",
  "jumuiya chairperson": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "jumuiya vice chairperson": "bg-sky-100 text-sky-800 border-sky-200",
  "jumuiya secretary": "bg-teal-100 text-teal-800 border-teal-200",
  "jumuiya os": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "os": "bg-amber-100 text-amber-800 border-amber-200",
  "project manager": "bg-orange-100 text-orange-800 border-orange-200",
  "treasurer": "bg-lime-100 text-lime-800 border-lime-200",
  "liturgist": "bg-rose-100 text-rose-800 border-rose-200",
  "developer": "bg-violet-100 text-violet-800 border-violet-200",
  "admin": "bg-purple-100 text-purple-800 border-purple-200",
};

const JUMUIYA_COLORS: Record<string, string> = {
  "st. anthony": "bg-purple-50 text-purple-700 border-purple-200",
  "st. augustine": "bg-blue-50 text-blue-700 border-blue-200",
  "st. catherine": "bg-rose-50 text-rose-800 border-rose-200",
  "st. dominic": "bg-slate-100 text-slate-700 border-slate-200",
  "st. elizabeth": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "st. maria goretti": "bg-sky-50 text-sky-700 border-sky-200",
  "st. monica": "bg-red-50 text-red-700 border-red-200",
};

const getRoleBadgeStyle = (role: string | null) => {
  if (!role) return "bg-slate-50 text-slate-600 border-slate-200";
  const normalized = role.toLowerCase().replace(/_/g, " ").trim();
  for (const [key, val] of Object.entries(ROLE_COLORS)) {
    if (normalized.includes(key)) return val;
  }
  return "bg-indigo-50 text-indigo-700 border-indigo-200";
};

const getJumuiyaBadgeStyle = (name: string | null) => {
  if (!name) return "bg-slate-50 text-slate-600 border-slate-200";
  const normalized = name.toLowerCase().trim();
  for (const [key, val] of Object.entries(JUMUIYA_COLORS)) {
    if (normalized.includes(key)) return val;
  }
  return "bg-slate-50 text-slate-600 border-slate-200";
};

const actionColor = (action: string) => {
  const a = action.toLowerCase();
  if (a.startsWith("deleted") || a.includes("remove") || a.includes("cancel"))
    return "text-rose-700 bg-rose-50 border-rose-200";
  if (a.startsWith("created") || a.includes("import") || a.startsWith("added"))
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (a.startsWith("flagged") || a.includes("reject"))
    return "text-red-700 bg-red-50 border-red-200";
  if (a.includes("finalized") || a.includes("distributed") || a.includes("published") || a.includes("submitted"))
    return "text-indigo-700 bg-indigo-50 border-indigo-200";
  if (a.includes("approved") || a.includes("validated") || a.startsWith("unflagged") || a.includes("batch-review"))
    return "text-blue-700 bg-blue-50 border-blue-200";
  if (a.startsWith("updated") || a.includes("managed") || a.includes("reviewed") || a.includes("replied"))
    return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-slate-700 bg-slate-100 border-slate-200";
};

export default function ActivityLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [jumuiyaFilter, setJumuiyaFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterOptions, setFilterOptions] = useState<{
    actions: string[];
    jumuiyas: { jumuiya_id: string; jumuiya_name: string | null }[];
    roles: string[];
  }>({ actions: [], jumuiyas: [], roles: [] });
  const limit = 30;

  const userRoles = Array.isArray(user?.role) ? user.role : [user?.role].filter(Boolean);
  const canClearLogs = userRoles.some((r: any) =>
    ["csa_chair", "jumuiya_coordinator", "admin", "developer"].includes(String(r).toLowerCase().trim())
  );

  const hasFilters = search || actionFilter || jumuiyaFilter || roleFilter || dateFrom || dateTo;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit, offset: (page - 1) * limit };
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      if (jumuiyaFilter) params.jumuiya_id = jumuiyaFilter;
      if (roleFilter) params.role = roleFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const res = await apiClient.get("/activity-logs", { params });
      setLogs(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err: any) {
      console.error("Failed to fetch activity logs", err);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter, jumuiyaFilter, roleFilter, dateFrom, dateTo]);

  const fetchFilters = useCallback(async () => {
    try {
      const res = await apiClient.get("/activity-logs/filters");
      setFilterOptions(res.data || { actions: [], jumuiyas: [], roles: [] });
    } catch (err) {
      console.error("Failed to fetch log filters", err);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to permanently clear all activity logs? This action cannot be undone.")) {
      return;
    }
    setClearing(true);
    try {
      await apiClient.delete("/activity-logs/clear");
      toast.success("Activity logs cleared successfully");
      fetchLogs();
      fetchFilters();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to clear logs");
    } finally {
      setClearing(false);
    }
  };

  const resetPageAndFetch = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setActionFilter("");
    setJumuiyaFilter("");
    setRoleFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner with Glassmorphism */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-40 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2.5">
              <Activity className="text-indigo-600" size={28} />
              Activity Audit Log
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles size={12} />
              Real-time
            </span>
          </div>
          <p className="text-slate-500 font-medium uppercase tracking-wider text-xs">
            Reliable audit trail recording official actions, jumuiya names, and timestamps · {total} recorded events
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          {canClearLogs && (
            <button
              onClick={handleClearLogs}
              disabled={clearing || total === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40"
              title="Clear all logs"
            >
              <Trash2 size={16} />
              {clearing ? "Clearing..." : "Clear Logs"}
            </button>
          )}
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-indigo-600" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Filter size={14} className="text-indigo-500" /> Filter Logs
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold normal-case">
              <X size={13} /> Clear filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => resetPageAndFetch(setSearch)(e.target.value)}
              placeholder="Search official, role, action..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
            {search && (
              <button onClick={() => resetPageAndFetch(setSearch)("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={actionFilter}
            onChange={(e) => resetPageAndFetch(setActionFilter)(e.target.value)}
            className="text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="">All Actions</option>
            {filterOptions.actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={jumuiyaFilter}
            onChange={(e) => resetPageAndFetch(setJumuiyaFilter)(e.target.value)}
            className="text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="">All Jumuiyas</option>
            {filterOptions.jumuiyas.map((j) => (
              <option key={j.jumuiya_id || j.jumuiya_name} value={j.jumuiya_name || j.jumuiya_id}>
                {j.jumuiya_name || j.jumuiya_id}
              </option>
            ))}
          </select>
          <select
            value={roleFilter}
            onChange={(e) => resetPageAndFetch(setRoleFilter)(e.target.value)}
            className="text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="">All Roles</option>
            {filterOptions.roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => resetPageAndFetch(setDateFrom)(e.target.value)}
            className="text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            title="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => resetPageAndFetch(setDateTo)(e.target.value)}
            className="text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            title="To date"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200/60 p-4" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Activity size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Activity Recorded Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            {hasFilters
              ? "No events matched your current search filters. Try resetting the filters."
              : "As officials manage members, activities, suggestions, and announcements, their actions will be securely logged here."}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {logs.map((log) => {
              const roleStyle = getRoleBadgeStyle(log.actor_role);
              const jumuiyaStyle = getJumuiyaBadgeStyle(log.jumuiya_name);

              return (
                <div
                  key={log.id}
                  className="px-6 py-5 flex items-start gap-4 hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Official Avatar */}
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 text-white font-black text-sm shadow-md shadow-indigo-500/20">
                    {initials(log.actor_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Official & Role Row */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 leading-tight">
                        {log.actor_name}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${roleStyle}`}
                      >
                        {log.actor_role || "Official"}
                      </span>
                      {log.jumuiya_name && (
                        <span
                          className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${jumuiyaStyle}`}
                        >
                          <Users size={11} /> {log.jumuiya_name}
                        </span>
                      )}
                    </div>

                    {/* Action Description */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-xl border ${actionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                      {log.entity_id && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <ShieldCheck size={13} className="text-slate-400" />
                          {log.entity_type || "record"} #{log.entity_id}
                        </span>
                      )}
                    </div>

                    {/* Timestamp & Metadata */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock size={12} className="text-slate-400" />
                        {formatDate(log.created_at)}
                      </span>
                      <span>•</span>
                      <span title="Relative time">{timeAgo(log.created_at)}</span>
                      {log.ip_address && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            IP: {log.ip_address}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-600">
                Page {page} of {totalPages} ({total} entries)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-slate-700 font-bold px-2">{page}</span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
