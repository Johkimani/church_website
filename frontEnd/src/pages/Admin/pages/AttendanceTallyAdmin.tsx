import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  BarChart3,
  Save,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Users,
  CalendarDays,
  Activity,
  RefreshCw,
  Download,
  Lightbulb,
  History,
  CheckCircle2,
  Lock,
  Settings2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { attendanceServices, getApiError } from "../../../api/attendanceServices";
import { jumuiyaAttendanceService } from "../../../api/jumuiyaAttendanceService";
import { useAuth } from "../../../context/AuthContext";

// ── Types ────────────────────────────────────────────────────────────────

interface JumuiyaContext {
  group_id: string;
  name: string;
  slug: string;
  color: string | null;
  total_members: number;
  active_members: number;
  register_status: "missing" | "recorded";
  register_count: number | null;
}

interface TallyContext {
  date: string;
  isTallyDay: boolean;
  activityType: string | null;
  activityLabel: string | null;
  novena: { id: number; start_date: string; end_date: string; day: number; total_days: number } | null;
  jumuiyas: JumuiyaContext[];
}

interface SessionRow {
  tally_id: number;
  tally_date: string;
  activity_type: string;
  activity_label: string;
  jumuiya_id: string;
  count: number;
  recorded_by: string;
  updated_at: string;
}

interface RecentTallyDay {
  date: string;
  activityType: string;
  activityLabel: string;
  recorded: boolean;
}

interface Trend {
  prev_attendance_count: number;
  prev_tally_days: number;
  prev_rate_vs_total: number;
  prev_rate_vs_active: number;
  delta_vs_total: number;
  delta_vs_active: number;
}

interface JumuiyaStat {
  jumuiya_id: string;
  name: string;
  slug: string;
  color: string;
  rank: number;
  total_members: number;
  active_members: number;
  tally_days: number;
  attendance_count: number;
  avg_per_session: number;
  register_days: number;
  manual_days: number;
  register_coverage: number;
  rate_vs_total: number;
  rate_vs_active: number;
  trend: Trend;
}

interface MeetingConfigRow {
  jumuiya_id: string;
  name: string;
  slug: string;
  color: string;
  meeting_day: number | null;
  meeting_label: string | null;
}

interface AnalyticsData {
  period: { from: string; to: string; calendar_days: number; prev_from: string; prev_to: string };
  tally_days: number;
  cumulative: {
    total_members: number;
    active_members: number;
    attendance_count: number;
    tally_days: number;
    avg_per_session: number;
    rate_vs_total: number;
    rate_vs_active: number;
    trend: Trend;
  };
  by_jumuiya: JumuiyaStat[];
}

// ── Date helpers ─────────────────────────────────────────────────────────

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const mondayOf = (d: Date) => {
  const x = new Date(d);
  x.setDate(x.getDate() - ((d.getDay() + 6) % 7));
  return x;
};

const todayStr = () => fmt(new Date());

const friendlyDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

type PresetKey =
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisSemester"
  | "lastSemester"
  | "thisAcademicYear"
  | "lastAcademicYear"
  | "custom";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "thisWeek", label: "This Week" },
  { key: "lastWeek", label: "Last Week" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "thisSemester", label: "This Semester" },
  { key: "lastSemester", label: "Last Semester" },
  { key: "thisAcademicYear", label: "This Academic Year" },
  { key: "lastAcademicYear", label: "Last Academic Year" },
  { key: "custom", label: "Custom Range" },
];

function presetRange(key: PresetKey, now: Date): { from: string; to: string } {
  switch (key) {
    case "thisWeek": {
      const m = mondayOf(now);
      return { from: fmt(m), to: fmt(addDays(m, 6)) };
    }
    case "lastWeek": {
      const m = mondayOf(now);
      return { from: fmt(addDays(m, -7)), to: fmt(addDays(m, -1)) };
    }
    case "thisMonth":
      return { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0)) };
    case "lastMonth":
      return { from: fmt(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: fmt(new Date(now.getFullYear(), now.getMonth(), 0)) };
    case "thisSemester": {
      const m = now.getMonth() + 1;
      const y = now.getFullYear();
      if (m >= 6) return { from: fmt(new Date(y, 5, 1)), to: fmt(new Date(y, 11, 31)) };
      return { from: fmt(new Date(y, 0, 1)), to: fmt(new Date(y, 4, 31)) };
    }
    case "lastSemester": {
      const m = now.getMonth() + 1;
      const y = now.getFullYear();
      if (m >= 6) return { from: fmt(new Date(y, 0, 1)), to: fmt(new Date(y, 4, 31)) };
      return { from: fmt(new Date(y - 1, 5, 1)), to: fmt(new Date(y - 1, 11, 31)) };
    }
    case "thisAcademicYear":
      return { from: fmt(new Date(now.getFullYear(), 0, 1)), to: fmt(new Date(now.getFullYear(), 11, 31)) };
    case "lastAcademicYear":
      return { from: fmt(new Date(now.getFullYear() - 1, 0, 1)), to: fmt(new Date(now.getFullYear() - 1, 11, 31)) };
    default:
      return { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: fmt(now) };
  }
}

const pct = (rate: number) => `${(rate * 100).toFixed(1)}%`;
const pts = (delta: number) => `${(delta * 100).toFixed(1)} pts`;

// ── Small presentational helpers ─────────────────────────────────────────

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

const DAY_OPTIONS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function TrendBadge({ delta }: { delta: number }) {
  if (delta > 0.0005) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
        <TrendingUp size={13} /> {pts(delta)}
      </span>
    );
  }
  if (delta < -0.0005) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-1">
        <TrendingDown size={13} /> {pts(delta)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
      <Minus size={13} /> 0.0 pts
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────

export default function AttendanceTallyAdmin() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"tally" | "analytics" | "config">("tally");

  // Take Tally state
  const [date, setDate] = useState<string>(todayStr());
  const [context, setContext] = useState<TallyContext | null>(null);
  const [sessionRows, setSessionRows] = useState<SessionRow[]>([]);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [tallyLoading, setTallyLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recentDays, setRecentDays] = useState<RecentTallyDay[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // Analytics state
  const [preset, setPreset] = useState<PresetKey>("thisWeek");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Meeting days config state
  const [configRows, setConfigRows] = useState<MeetingConfigRow[]>([]);
  const [configDrafts, setConfigDrafts] = useState<Record<string, string>>({});
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState<Record<string, boolean>>({});

  const canEditConfig = useMemo(() => {
    const roles = Array.isArray(user?.role) ? user.role : user?.role ? [user.role] : [];
    return roles.some((r) =>
      ["csa_secretary", "csa_chair", "jumuiya_coordinator"].includes(String(r).toLowerCase())
    );
  }, [user]);

  const loadConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const data = await jumuiyaAttendanceService.getMeetingConfigs();
      const rows = [...(data.configured || []), ...(data.unconfigured || [])].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setConfigRows(rows);
      const drafts: Record<string, string> = {};
      rows.forEach((r) => {
        drafts[r.jumuiya_id] = r.meeting_day != null ? String(r.meeting_day) : "";
      });
      setConfigDrafts(drafts);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "config") loadConfig();
  }, [tab, loadConfig]);

  const handleConfigSave = async (row: MeetingConfigRow) => {
    const val = configDrafts[row.jumuiya_id];
    setConfigSaving((prev) => ({ ...prev, [row.jumuiya_id]: true }));
    try {
      if (val === "" || val === "unset") {
        await jumuiyaAttendanceService.deleteMeetingConfig(row.jumuiya_id);
        toast.success(`${row.name}: no fixed meeting day (any day allowed)`);
      } else {
        const day = Number(val);
        await jumuiyaAttendanceService.updateMeetingConfig(row.jumuiya_id, day);
        toast.success(`${row.name} now meets every ${DAY_OPTIONS[day]}`);
      }
      await loadConfig();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setConfigSaving((prev) => ({ ...prev, [row.jumuiya_id]: false }));
    }
  };

  const loadTally = useCallback(async (target: string) => {
    setTallyLoading(true);
    try {
      const [ctx, session] = await Promise.all([
        attendanceServices.getTallyContext(target),
        attendanceServices.getSession(target),
      ]);
      setContext(ctx);
      setSessionRows(session);
      const next: Record<string, string> = {};
      ctx.jumuiyas.forEach((j: JumuiyaContext) => {
        next[j.group_id] =
          j.register_status === "recorded" && j.register_count != null ? String(j.register_count) : "";
      });
      session.forEach((s: SessionRow) => { next[s.jumuiya_id] = String(s.count); });
      setCounts(next);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setTallyLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTally(date);
  }, [date, loadTally]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await attendanceServices.getRecentStatus(14);
        if (mounted) setRecentDays(data.tally_days || []);
      } catch {
        // non-blocking — the strip is a convenience only
      } finally {
        if (mounted) setRecentLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const loadAnalytics = useCallback(async (from: string, to: string) => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const data = await attendanceServices.getAnalytics(from, to);
      setAnalytics(data);
    } catch (err) {
      setAnalyticsError(getApiError(err));
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (preset === "custom") return;
    const { from, to } = presetRange(preset, new Date());
    loadAnalytics(from, to);
  }, [preset, loadAnalytics]);

  const totalAttendance = useMemo(
    () =>
      Object.values(counts).reduce(
        (sum, v) => sum + (Number(v) > 0 ? Number(v) : 0),
        0
      ),
    [counts]
  );

  const isSaved = sessionRows.length > 0;
  const tallyDisabled = !context?.isTallyDay || tallyLoading;

  const handleSave = async () => {
    if (!context || !context.isTallyDay) return;
    const payload = context.jumuiyas.map((j) => ({
      jumuiya_id: j.group_id,
      count: Number(counts[j.group_id] || 0) || 0,
    }));
    setSaving(true);
    try {
      await attendanceServices.saveSession(date, payload);
      toast.success(`Tally for ${date} saved`);
      loadTally(date);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm(`Clear the tally for ${date}? This cannot be undone.`)) return;
    try {
      await attendanceServices.deleteSession(date);
      toast.success(`Tally for ${date} cleared`);
      loadTally(date);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleCustomLoad = () => {
    if (!customFrom || !customTo) {
      toast.error("Select both a start and end date");
      return;
    }
    if (customFrom > customTo) {
      toast.error("Start date must be before end date");
      return;
    }
    loadAnalytics(customFrom, customTo);
  };

  const chartData = useMemo(() => {
    if (!analytics) return [];
    return analytics.by_jumuiya.map((j) => ({
      name: j.name.split(/\s+/).slice(0, 2).join(" "),
      current: j.attendance_count,
      previous: j.trend.prev_attendance_count,
      rate: Math.round(j.rate_vs_active * 1000) / 10,
    }));
  }, [analytics]);

  const insights = useMemo(() => {
    if (!analytics) return null;
    const list = analytics.by_jumuiya;
    if (!list.length) return null;
    const improving = list.filter((j) => j.trend.delta_vs_active > 0.0005);
    const dropping = list.filter((j) => j.trend.delta_vs_active < -0.0005);
    const stable = list.filter((j) => Math.abs(j.trend.delta_vs_active) <= 0.0005);
    const top = list.find((j) => j.rank === 1) || list[0];
    const mostImproved = [...list].sort(
      (a, b) => b.trend.delta_vs_active - a.trend.delta_vs_active
    )[0];
    const mostDropped = [...list].sort(
      (a, b) => a.trend.delta_vs_active - b.trend.delta_vs_active
    )[0];
    return { improving, dropping, stable, top, mostImproved, mostDropped };
  }, [analytics]);

  const exportCsv = () => {
    if (!analytics) return;
    const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines: string[] = [];
    lines.push(q("Attendance Analytics Report"));
    lines.push(`"Filter",${q(preset === "custom" ? "Custom range" : PRESETS.find((p) => p.key === preset)?.label || preset)}`);
    lines.push(`"Period",${q(analytics.period.from)},${q(analytics.period.to)}`);
    lines.push(`"Previous period",${q(analytics.period.prev_from)},${q(analytics.period.prev_to)}`);
    lines.push(`"Tally sessions",${q(analytics.tally_days)}`);
    lines.push(`"Generated",${q(new Date().toLocaleString())}`);
    lines.push("");
    lines.push(q("Overall summary"));
    lines.push(`"Total attendance",${q(analytics.cumulative.attendance_count)}`);
    lines.push(`"Avg per session",${q(analytics.cumulative.avg_per_session)}`);
    lines.push(`"Total members",${q(analytics.cumulative.total_members)}`);
    lines.push(`"Active members",${q(analytics.cumulative.active_members)}`);
    lines.push(`"Rate vs total",${q(pct(analytics.cumulative.rate_vs_total))}`);
    lines.push(`"Rate vs active",${q(pct(analytics.cumulative.rate_vs_active))}`);
    lines.push(`"Improvement vs prev period",${q(pts(analytics.cumulative.trend.delta_vs_active))}`);
    lines.push("");
    lines.push(
      ["Rank", "Jumuiya", "Total Members", "Active Members", "Tally Days", "Attendance", "Avg/Session", "Rate vs Total", "Rate vs Active", "Prev Rate vs Active", "Delta (pts)"]
        .map(q)
        .join(",")
    );
    analytics.by_jumuiya.forEach((j) => {
      lines.push(
        [
          j.rank,
          j.name,
          j.total_members,
          j.active_members,
          j.tally_days,
          j.attendance_count,
          j.avg_per_session,
          pct(j.rate_vs_total),
          pct(j.rate_vs_active),
          pct(j.trend.prev_rate_vs_active),
          pts(j.trend.delta_vs_active),
        ]
          .map(q)
          .join(",")
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-analytics_${analytics.period.from}_${analytics.period.to}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activityStyles =
    context?.activityType === "novena"
      ? "bg-purple-50 border-purple-200 text-purple-700"
      : context?.activityType === "bible_study"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-blue-50 border-blue-200 text-blue-700";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Attendance Tally & Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">
            Record daily attendance and track which jumuiya is most active and improving.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-200/70 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("tally")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === "tally" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <CalendarCheck size={16} /> Take Tally
          </button>
          <button
            onClick={() => setTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === "analytics" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <BarChart3 size={16} /> Analytics
          </button>
          <button
            onClick={() => setTab("config")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === "config" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <Settings2 size={16} /> Meeting Days
          </button>
        </div>
      </div>

      {tab === "tally" ? (
        <div className="space-y-6">
          {/* Date + context */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Tally Date</label>
                <input
                  type="date"
                  value={date}
                  max={todayStr()}
                  onChange={(e) => setDate(e.target.value || todayStr())}
                  className={inputCls}
                />
              </div>

              <div className="flex-1">
                {tallyLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 size={16} className="animate-spin" /> Checking schedule…
                  </div>
                ) : context?.isTallyDay ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-2 text-sm font-bold rounded-full border px-4 py-2 ${activityStyles}`}>
                      <Activity size={15} /> {context.activityLabel}
                    </span>
                    {context.novena && (
                      <span className="text-xs text-slate-500">
                        Novena runs {context.novena.start_date} → {context.novena.end_date} — every day is a tally day.
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2.5">
                    {date} is not a tally day. Tally days are <b>Monday</b> (Rosary), <b>Wednesday</b> (Bible Study),{" "}
                    <b>Thursday</b> (Rosary), or any day of an active novena.
                  </div>
                )}

                {!tallyLoading && context?.isTallyDay && !isSaved && date < todayStr() && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2.5">
                    This is a <b>past tally day</b> with no tally recorded yet. Enter the counts below to{" "}
                    <b>backfill</b> this day (e.g. after a power outage or missed recording).
                  </div>
                )}
              </div>
            </div>

            {isSaved && !tallyLoading && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-2.5 flex items-center justify-between gap-3">
                <span>✓ Tally already recorded for this date — update the counts and save to overwrite.</span>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-lg px-3 py-1.5 hover:bg-rose-50 transition-colors shrink-0"
                >
                  <Trash2 size={13} /> Clear this day
                </button>
              </div>
            )}
          </div>

          {/* Recent tally days (backfill helper) */}
          {!recentLoading && recentDays.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <History size={16} className="text-slate-400" /> Recent Tally Days
                </h3>
                <span className="text-[11px] text-slate-400">Last 14 days — click a day to open or backfill it</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentDays.map((d) => {
                  const active = d.date === date;
                  return (
                    <button
                      key={d.date}
                      onClick={() => setDate(d.date)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                        active
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      <span>{friendlyDate(d.date)}</span>
                      {d.recorded ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                          ✓ Recorded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          Missing
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Jumuiya count inputs */}
          {tallyLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Loading jumuiya roster…
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {context?.jumuiyas.map((j) => {
                const registerRecorded = j.register_status === "recorded";
                const inputDisabled = !context?.isTallyDay || registerRecorded;
                return (
                  <div
                    key={j.group_id}
                    className={`bg-white rounded-xl border p-4 ${
                      registerRecorded ? "border-emerald-200" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: j.color || "#64748b" }} />
                      <h4 className="font-semibold text-slate-800 text-sm truncate">{j.name}</h4>
                      {registerRecorded ? (
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 shrink-0">
                          <CheckCircle2 size={11} /> Register
                        </span>
                      ) : (
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5 shrink-0">
                          No register
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      step={1}
                      value={counts[j.group_id] ?? ""}
                      onChange={(e) =>
                        setCounts((prev) => ({ ...prev, [j.group_id]: e.target.value }))
                      }
                      placeholder="0"
                      disabled={inputDisabled}
                      className={`${inputCls} text-lg font-bold ${
                        inputDisabled
                          ? registerRecorded
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-50 text-slate-300"
                          : ""
                      }`}
                    />
                    {registerRecorded ? (
                      <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1">
                        <Lock size={11} /> From secretary register — count set automatically
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                        <Users size={11} /> {j.active_members} active / {j.total_members} total members
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              Total attendance:{" "}
              <span className="font-black text-slate-900 text-lg">{totalAttendance}</span>{" "}
              <span className="text-slate-400">across {context?.jumuiyas.length || 0} jumuiyas</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadTally(date)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RefreshCw size={15} /> Reset
              </button>
              <button
                onClick={handleSave}
                disabled={tallyDisabled || saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-colors ${
                  tallyDisabled || saving
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30"
                }`}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving…" : isSaved ? "Update Tally" : "Save Tally"}
              </button>
            </div>
          </div>
        </div>
      ) : tab === "config" ? (
        <MeetingDaysTab
          rows={configRows}
          drafts={configDrafts}
          setDrafts={setConfigDrafts}
          loading={configLoading}
          saving={configSaving}
          canEdit={canEditConfig}
          onSave={handleConfigSave}
        />
      ) : (
        <div className="space-y-6">
          {/* Period selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Period</label>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value as PresetKey)}
                  className={inputCls}
                >
                  {PRESETS.map((p) => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
              </div>

              {preset === "custom" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">From</label>
                    <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">To</label>
                    <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className={inputCls} />
                  </div>
                  <button
                    onClick={handleCustomLoad}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    <BarChart3 size={15} /> Load
                  </button>
                </>
              )}

              <button
                onClick={exportCsv}
                disabled={!analytics || analyticsLoading}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-colors md:ml-auto ${
                  !analytics || analyticsLoading
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100"
                }`}
              >
                <Download size={15} /> Export CSV
              </button>
            </div>

            {analytics && (
              <p className="text-xs text-slate-400 mt-3">
                Comparing {analytics.period.from} → {analytics.period.to} against previous period{" "}
                {analytics.period.prev_from} → {analytics.period.prev_to} · {analytics.tally_days} tally session(s) recorded
              </p>
            )}
          </div>

          {analyticsError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{analyticsError}</div>
          )}

          {analyticsLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Computing analytics…
            </div>
          ) : analytics ? (
            <>
              {/* Summary cards (CSA level) */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <SummaryCard label="Attendance" value={String(analytics.cumulative.attendance_count)} icon={<Users size={17} />} />
                <SummaryCard label="Avg / Session" value={String(analytics.cumulative.avg_per_session)} icon={<Activity size={17} />} />
                <SummaryCard label="Active Members" value={String(analytics.cumulative.active_members)} icon={<Users size={17} />} />
                <SummaryCard label="Tally Days" value={String(analytics.cumulative.tally_days)} icon={<CalendarDays size={17} />} />
                <SummaryCard
                  label="Rate vs Active"
                  value={pct(analytics.cumulative.rate_vs_active)}
                  accent
                  icon={<BarChart3 size={17} />}
                />
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Improvement</p>
                  <div className="mt-1.5">
                    <TrendBadge delta={analytics.cumulative.trend.delta_vs_active} />
                  </div>
                </div>
              </div>

              {/* Insights report */}
              {insights && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Lightbulb size={16} className="text-amber-500" /> Analytics Insights
                  </h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Between <b>{analytics.period.from}</b> and <b>{analytics.period.to}</b>, {analytics.tally_days} tally
                    session(s) were recorded with <b>{analytics.cumulative.attendance_count}</b> total attendance (~
                    {analytics.cumulative.avg_per_session} per session) — an average of{" "}
                    <b>{pct(analytics.cumulative.rate_vs_active)}</b> of active members attending each session.
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    <li>
                      <span className="font-semibold text-slate-800">Top jumuiya:</span> <b>{insights.top.name}</b> with{" "}
                      {pct(insights.top.rate_vs_active)} attendance rate ({insights.top.attendance_count} across{" "}
                      {insights.top.tally_days} session(s)).
                    </li>
                    {insights.mostImproved.trend.delta_vs_active > 0.0005 && (
                      <li>
                        <span className="font-semibold text-slate-800">Most improved:</span> <b>{insights.mostImproved.name}</b>{" "}
                        rose {pts(insights.mostImproved.trend.delta_vs_active)} vs the previous period.
                      </li>
                    )}
                    {insights.mostDropped.trend.delta_vs_active < -0.0005 && (
                      <li>
                        <span className="font-semibold text-slate-800">Needs attention:</span> <b>{insights.mostDropped.name}</b>{" "}
                        fell {pts(Math.abs(insights.mostDropped.trend.delta_vs_active))} vs the previous period.
                      </li>
                    )}
                    <li className="flex flex-wrap gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                        <TrendingUp size={12} /> {insights.improving.length} improving
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
                        <Minus size={12} /> {insights.stable.length} stable
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-1">
                        <TrendingDown size={12} /> {insights.dropping.length} dropping
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-800 mb-1">Attendance Trend</h3>
                  <p className="text-xs text-slate-400 mb-4">Current vs previous period, per jumuiya</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} barGap={2} barCategoryGap="22%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-18}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip cursor={{ fill: "#f1f5f9" }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="current" name="Current period" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="previous" name="Previous period" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-800 mb-1">Engagement Rate</h3>
                  <p className="text-xs text-slate-400 mb-4">Attendance rate vs active members (%)</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} barCategoryGap="28%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-18}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                      />
                      <YAxis unit="%" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip cursor={{ fill: "#f1f5f9" }} formatter={(value: any) => [`${value}%`, "Rate vs active"]} />
                      <Bar dataKey="rate" name="Rate vs active" radius={[4, 4, 0, 0]}>
                        {chartData.map((d, i) => (
                          <Cell key={i} fill={analytics.by_jumuiya[i]?.color || "#4f46e5"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ranking table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Jumuiya Ranking</h3>
                  <span className="text-[11px] text-slate-400">
                    Ranked by attendance rate vs total members
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                        <th className="px-5 py-3">#</th>
                        <th className="px-3 py-3">Jumuiya</th>
                        <th className="px-3 py-3 text-right">Members (act/total)</th>
                        <th className="px-3 py-3 text-right">Tally Days</th>
                        <th className="px-3 py-3 text-right">Attendance</th>
                        <th className="px-3 py-3 text-right">Avg/Session</th>
                        <th className="px-3 py-3 text-right">Register Days</th>
                        <th className="px-3 py-3 text-right">Rate vs Total</th>
                        <th className="px-3 py-3 text-right">Rate vs Active</th>
                        <th className="px-3 py-3 text-right">vs Prev Period</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analytics.by_jumuiya.map((j) => (
                        <tr key={j.jumuiya_id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                                j.rank === 1
                                  ? "bg-amber-100 text-amber-700"
                                  : j.rank <= 3
                                  ? "bg-slate-200 text-slate-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {j.rank}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: j.color || "#64748b" }} />
                              <span className="font-semibold text-slate-800 whitespace-nowrap">{j.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right text-slate-600 whitespace-nowrap">
                            {j.active_members}<span className="text-slate-400"> / {j.total_members}</span>
                          </td>
                          <td className="px-3 py-3 text-right text-slate-600">{j.tally_days}</td>
                          <td className="px-3 py-3 text-right font-bold text-slate-800">{j.attendance_count}</td>
                          <td className="px-3 py-3 text-right text-slate-600">{j.avg_per_session}</td>
                          <td className="px-3 py-3 text-right">
                            <span className="text-slate-700 font-semibold">{j.register_days}</span>
                            <span className="text-slate-400"> / {j.tally_days}</span>
                            <div className="mt-1 flex justify-end">
                              <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-400 rounded-full"
                                  style={{ width: `${Math.round(j.register_coverage * 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right text-slate-600">{pct(j.rate_vs_total)}</td>
                          <td className="px-3 py-3 text-right font-semibold text-slate-700">{pct(j.rate_vs_active)}</td>
                          <td className="px-3 py-3 text-right">
                            <TrendBadge delta={j.trend.delta_vs_active} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400">
                  Rate vs total = attendance ÷ (total members × tally days) · Rate vs active = attendance ÷ (active
                  members × tally days) · Active members = roster minus flagged-inactive members · Register days = tally
                  sessions whose counts came from the secretary's per-member register (authoritative source) · Trend
                  compares the current period against the equal-length period before it.
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border p-4 ${accent ? "border-indigo-200 bg-indigo-50/40" : "border-slate-200"}`}>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className={`text-2xl font-black ${accent ? "text-indigo-700" : "text-slate-800"}`}>{value}</p>
    </div>
  );
}

function MeetingDaysTab({
  rows,
  drafts,
  setDrafts,
  loading,
  saving,
  canEdit,
  onSave,
}: {
  rows: MeetingConfigRow[];
  drafts: Record<string, string>;
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  loading: boolean;
  saving: Record<string, boolean>;
  canEdit: boolean;
  onSave: (row: MeetingConfigRow) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <CalendarDays size={16} className="text-slate-400" /> Jumuiya Meeting Days
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          These days drive the <b>secretary attendance register</b>: a register can only be saved on a jumuiya's
          meeting day, and saved registers automatically feed this page's tallies. Jumuiyas with no fixed day accept
          registers on any day.
        </p>
        {!canEdit && (
          <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Read-only — only the CSA Secretary, CSA Chairperson, or Jumuiya Coordinator can change meeting days.
          </p>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading meeting days…
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                  <th className="px-5 py-3">Jumuiya</th>
                  <th className="px-3 py-3">Meeting Day</th>
                  {canEdit && <th className="px-3 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const isSaving = saving[row.jumuiya_id];
                  const changed = drafts[row.jumuiya_id] !== (row.meeting_day != null ? String(row.meeting_day) : "");
                  return (
                    <tr key={row.jumuiya_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: row.color || "#64748b" }} />
                          <span className="font-semibold text-slate-800 whitespace-nowrap">{row.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={drafts[row.jumuiya_id] ?? ""}
                          onChange={(e) =>
                            setDrafts((prev) => ({ ...prev, [row.jumuiya_id]: e.target.value }))
                          }
                          disabled={!canEdit}
                          className={`${inputCls} max-w-[220px] ${!canEdit ? "bg-slate-50 text-slate-500" : ""}`}
                        >
                          <option value="">No fixed day (any day)</option>
                          {DAY_OPTIONS.map((label, i) => (
                            <option key={label} value={i}>
                              Every {label}
                            </option>
                          ))}
                        </select>
                        {row.meeting_day != null && changed && (
                          <p className="text-[11px] text-slate-400 mt-1">Currently: every {DAY_OPTIONS[row.meeting_day]}</p>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => onSave(row)}
                            disabled={isSaving || !changed}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors ${
                              isSaving || !changed
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                          >
                            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                            {isSaving ? "Saving…" : "Save"}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400">
            St. Thomas Aquinas is intentionally left without a fixed day (register can be taken any day). Saving "No
            fixed day (any day)" removes the configured day.
          </div>
        </div>
      )}
    </div>
  );
}
