import { useEffect, useMemo, useState } from "react";
import activitiesService, { rsvpService } from "../../../api/activitiesServices";
import { RefreshCw, Users, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface RsvpRow {
  member_id: string;
  member_name: string;
  jumuiya_id: string;
  jumuiya_name: string | null;
  created_at: string;
}

interface Activity {
  id: number;
  day?: string;
  activity?: string;
  title?: string;
  date_time?: string;
}

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function AdminRsvps() {
  const [type, setType] = useState<"weekly" | "semester">("weekly");
  const [weeklyActs, setWeeklyActs] = useState<Activity[]>([]);
  const [semesterActs, setSemesterActs] = useState<Activity[]>([]);
  const [activityId, setActivityId] = useState<number | null>(null);
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const acts = type === "weekly" ? weeklyActs : semesterActs;

  // Load the activity lists once
  useEffect(() => {
    (async () => {
      try {
        const [w, s] = await Promise.all([
          activitiesService.getWeekly().catch(() => []),
          activitiesService.getSemester().catch(() => []),
        ]);
        setWeeklyActs(w || []);
        setSemesterActs(s || []);
        const first = (w && w[0]) || (s && s[0]);
        if (first) {
          setType(w && w[0] ? "weekly" : "semester");
          setActivityId(first.id);
        }
      } catch {
        toast.error("Failed to load activities");
      }
    })();
  }, []);

  // Keep a valid activity selected when the type or list changes
  useEffect(() => {
    if (acts.length === 0) return;
    setActivityId((prev) => (prev && acts.some((a) => a.id === prev) ? prev : acts[0].id));
  }, [type, acts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load the RSVP list whenever the selection changes
  useEffect(() => {
    if (activityId == null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    rsvpService
      .getAdminList(type, activityId, offset, pageSize)
      .then((res) => {
        if (cancelled) return;
        setRows(res.data || []);
        setTotal(res.total || 0);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.response?.data?.error || err?.message || "Failed to load RSVPs");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, activityId, offset, pageSize]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.member_name || "").toLowerCase().includes(q) ||
        (r.member_id || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.floor(offset / pageSize) + 1;

  const activityLabel = (a: Activity) =>
    type === "weekly"
      ? `${a.day || "?"} — ${a.activity || a.id}`
      : `${a.title || a.id}`;

  const selectedActivity = acts.find((a) => a.id === activityId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Activity RSVPs</h2>
          <p className="text-sm text-slate-500 mt-1">
            Who's coming — attendance intent for weekly and semester activities.
          </p>
        </div>
        <button
          onClick={() => setOffset(0)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Activity picker */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/30 shrink-0">
          <Users size={18} className="mx-auto" />
        </div>
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <select
            value={type}
            onChange={(e) => { setType(e.target.value as "weekly" | "semester"); setOffset(0); }}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          >
            <option value="weekly">Weekly Activities</option>
            <option value="semester">Semester Events</option>
          </select>

          <select
            value={activityId ?? ""}
            onChange={(e) => { setActivityId(Number(e.target.value)); setOffset(0); }}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 min-w-[220px]"
          >
            {acts.length === 0 && <option value="">No {type} activities</option>}
            {acts.map((a) => (
              <option key={a.id} value={a.id}>{activityLabel(a)}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-sm text-slate-500 ml-auto">
            <span className="text-slate-400">Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setOffset(0); }}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-slate-400">rows</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 shrink-0">
          <Users size={18} />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-800 leading-none">{total}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {selectedActivity ? `Going to "${activityLabel(selectedActivity)}"` : "Going"}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search this page..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Loading RSVPs...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            {activityId == null ? "Select an activity to view RSVPs." : "No RSVPs yet for this activity."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Registration No.</th>
                  <th className="px-4 py-3 font-semibold">Member</th>
                  <th className="px-4 py-3 font-semibold">Jumuiya</th>
                  <th className="px-4 py-3 font-semibold">RSVP Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={`${r.member_id}-${i}`} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{offset + i + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600">{r.member_id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{r.member_name || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {r.jumuiya_name ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                          {r.jumuiya_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Page {page} of {pageCount} · {total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={offset <= 0}
                onClick={() => setOffset(Math.max(0, offset - pageSize))}
                className="flex items-center gap-1 text-sm text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                disabled={offset + pageSize >= total}
                onClick={() => setOffset(offset + pageSize)}
                className="flex items-center gap-1 text-sm text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed hover:text-indigo-600 transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
