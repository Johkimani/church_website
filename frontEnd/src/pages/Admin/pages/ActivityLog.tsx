import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../api/axiosInstance";
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
} from "lucide-react";

interface LogEntry {
  id: number;
  actor_id: number | null;
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
  csa_chair: "bg-purple-50 text-purple-700 border-purple-200",
  jumuiya_coordinator: "bg-blue-50 text-blue-700 border-blue-200",
  jumuiya_secretary: "bg-teal-50 text-teal-700 border-teal-200",
  jumuiya_chairperson: "bg-indigo-50 text-indigo-700 border-indigo-200",
  jumuiya_vice_chairperson: "bg-sky-50 text-sky-700 border-sky-200",
  jumuiya_os: "bg-cyan-50 text-cyan-700 border-cyan-200",
  os: "bg-amber-50 text-amber-700 border-amber-200",
  csa_secretary: "bg-emerald-50 text-emerald-700 border-emerald-200",
  csa_vice_chair: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  project_manager: "bg-orange-50 text-orange-700 border-orange-200",
  treasurer: "bg-lime-50 text-lime-700 border-lime-200",
  liturgist: "bg-rose-50 text-rose-700 border-rose-200",
};

const roleColor = (role: string) =>
  ROLE_COLORS[String(role).toLowerCase().trim()] || "bg-slate-50 text-slate-600 border-slate-200";

const actionColor = (action: string) => {
  const a = action.toLowerCase();
  if (a.startsWith("deleted") || a.includes("remove")) return "text-rose-700 bg-rose-50 border-rose-200";
  if (a.startsWith("created") || a.includes("import") || a.startsWith("added")) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (a.startsWith("flagged") || a.includes("reject")) return "text-red-700 bg-red-50 border-red-200";
  if (a.includes("finalized") || a.includes("distributed") || a.includes("published") || a.includes("submitted")) return "text-indigo-700 bg-indigo-50 border-indigo-200";
  if (a.includes("approved") || a.includes("validated") || a.startsWith("unflagged") || a.includes("batch-review")) return "text-blue-700 bg-blue-50 border-blue-200";
  if (a.startsWith("updated") || a.includes("managed") || a.includes("reviewed")) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-slate-600 bg-slate-50 border-slate-200";
};

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" /> Activity Log
          </h2>
          <p className="text-xs text-slate-500">
            Who did what and when across the admin system · {total} entries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Filter size={14} className="text-slate-400" /> Filters
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-rose-500 hover:text-rose-600">
              <X size={12} /> Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => resetPageAndFetch(setSearch)(e.target.value)}
              placeholder="Search name, role, action..."
              className="w-full pl-8 pr-8 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
            {search && (
              <button onClick={() => resetPageAndFetch(setSearch)("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={actionFilter}
            onChange={(e) => resetPageAndFetch(setActionFilter)(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Actions</option>
            {filterOptions.actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={jumuiyaFilter}
            onChange={(e) => resetPageAndFetch(setJumuiyaFilter)(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Jumuiyas</option>
            {filterOptions.jumuiyas.map((j) => (
              <option key={j.jumuiya_id} value={j.jumuiya_id}>
                {j.jumuiya_name || j.jumuiya_id}
              </option>
            ))}
          </select>
          <select
            value={roleFilter}
            onChange={(e) => resetPageAndFetch(setRoleFilter)(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            title="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => resetPageAndFetch(setDateTo)(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            title="To date"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Activity size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">No activity logs found.</p>
          <p className="text-xs text-slate-400 mt-1">
            {hasFilters ? "Try adjusting or clearing the filters." : "Admin actions will appear here as officials make changes."}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5 text-indigo-600 font-bold text-sm">
                  {initials(log.actor_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800">{log.actor_name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${roleColor(log.actor_role || "")}`}>
                      {log.actor_role || "Member"}
                    </span>
                    {log.jumuiya_name && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-50 border-slate-200 text-slate-600">
                        <Users size={10} /> {log.jumuiya_name}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${actionColor(log.action)}`}>
                      {log.action}
                    </span>
                    {log.entity_id && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <ShieldCheck size={11} className="text-slate-400" />
                        {log.entity_type || "record"} #{log.entity_id}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {formatDate(log.created_at)}
                    </span>
                    <span title="Time ago">{timeAgo(log.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">
                Page {page} of {totalPages} ({total} entries)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-slate-600 font-semibold px-2">{page}</span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
