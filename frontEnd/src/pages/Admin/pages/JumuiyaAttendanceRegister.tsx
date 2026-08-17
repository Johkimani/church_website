import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  History,
  Users,
  Save,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Flag,
  TrendingUp,
  ListChecks,
} from "lucide-react";
import { jumuiyaAttendanceService, getApiError } from "../../../api/jumuiyaAttendanceService";

interface RegisterContext {
  date: string;
  today: string;
  jumuiya: { group_id: string; name: string; color: string };
  meeting_day: number | null;
  meeting_label: string | null;
  is_meeting_day: boolean;
  is_past: boolean;
  is_future: boolean;
  session_exists: boolean;
  present_count: number;
  roster: { member_id: string; first_name: string; last_name: string; name: string }[];
}

interface SummarySession {
  date: string;
  total_count: number;
  present_count: number;
}

interface SummaryMember {
  member_id: string;
  name: string;
  present_count: number;
  sessions: number;
  rate: number | null;
  flag_candidate: boolean;
}

interface SummaryData {
  jumuiya: { group_id: string; name: string; color: string };
  sessions: SummarySession[];
  members: SummaryMember[];
}

interface StripDay {
  date: string;
  recorded: boolean;
}

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const todayStr = () => fmt(new Date());

const friendlyDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

const pctLabel = (rate: number | null) =>
  rate == null ? "—" : `${(rate * 100).toFixed(1)}%`;

export default function JumuiyaAttendanceRegister({
  jumuiyaId,
  jumuiyaName,
  jumuiyaColor,
}: {
  jumuiyaId: string;
  jumuiyaName: string;
  jumuiyaColor: string;
}) {
  const [view, setView] = useState<"register" | "tracking">("register");

  const [date, setDate] = useState<string>(todayStr());
  const [ctx, setCtx] = useState<RegisterContext | null>(null);
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const loadRegister = useCallback(
    async (target: string) => {
      if (!jumuiyaId) return;
      setLoading(true);
      try {
        const [c, rows] = await Promise.all([
          jumuiyaAttendanceService.getContext(jumuiyaId, target),
          jumuiyaAttendanceService.getRegister(jumuiyaId, target),
        ]);
        setCtx(c);
        const map: Record<string, boolean> = {};
        (c.roster || []).forEach((m: any) => {
          map[m.member_id] = true;
        });
        (rows || []).forEach((r: any) => {
          map[r.member_id] = r.present === true;
        });
        setPresentMap(map);
      } catch (err) {
        toast.error(getApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [jumuiyaId]
  );

  const loadSummary = useCallback(async () => {
    if (!jumuiyaId) return;
    setSummaryLoading(true);
    try {
      const s = await jumuiyaAttendanceService.getSummary(jumuiyaId, 8);
      setSummary(s);
    } catch {
      // non-blocking
    } finally {
      setSummaryLoading(false);
    }
  }, [jumuiyaId]);

  useEffect(() => {
    loadRegister(date);
  }, [date, loadRegister]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Recent meeting days strip (for quick backfill navigation)
  const strip: StripDay[] = useMemo(() => {
    if (!ctx || !summary) return [];
    const recordedDates = new Set(summary.sessions.map((s) => s.date));
    const days: StripDay[] = [];
    const meeting = ctx.meeting_day;
    const cursor = new Date();
    let guard = 0;
    while (days.length < 8 && guard < 120) {
      guard++;
      cursor.setDate(cursor.getDate() - 1);
      const ds = fmt(cursor);
      if (ds >= ctx.today) continue;
      if (meeting == null || cursor.getDay() === meeting) {
        days.push({ date: ds, recorded: recordedDates.has(ds) });
      }
    }
    return days.reverse();
  }, [ctx, summary]);

  const roster = ctx?.roster || [];
  const presentCount = useMemo(
    () => roster.filter((m) => presentMap[m.member_id] === true).length,
    [roster, presentMap]
  );
  const isMeetingDay = ctx?.is_meeting_day ?? false;
  const canSave =
    !!ctx &&
    !ctx.is_future &&
    (ctx.meeting_day == null || isMeetingDay || ctx.session_exists) &&
    roster.length > 0 &&
    !saving;

  const setAll = (value: boolean) => {
    const next: Record<string, boolean> = {};
    roster.forEach((m) => {
      next[m.member_id] = value;
    });
    setPresentMap(next);
  };

  const handleSave = async () => {
    if (!ctx) return;
    if (ctx.is_future) {
      toast.error("Cannot record attendance for a future date");
      return;
    }
    if (ctx.meeting_day != null && !isMeetingDay && !ctx.session_exists) {
      toast.error(`${jumuiyaName} meets every ${ctx.meeting_label}`);
      return;
    }
    if (roster.length === 0) {
      toast.error("No members in the roster to record");
      return;
    }
    const records = roster.map((m) => ({
      member_id: m.member_id,
      present: presentMap[m.member_id] === true,
    }));
    setSaving(true);
    try {
      await jumuiyaAttendanceService.saveRegister(jumuiyaId, date, records);
      toast.success(`Register for ${date} saved`);
      await Promise.all([loadRegister(date), loadSummary()]);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Clear the register for ${date}? This cannot be undone.`)) return;
    try {
      await jumuiyaAttendanceService.deleteRegister(jumuiyaId, date);
      toast.success(`Register for ${date} cleared`);
      await Promise.all([loadRegister(date), loadSummary()]);
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: jumuiyaColor || "#6366f1" }} />
            Attendance Register
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Per-member attendance for {jumuiyaName}, recorded by the secretary on each meeting day.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-200/70 rounded-xl p-1 w-fit">
          <button
            onClick={() => setView("register")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              view === "register" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <ListChecks size={16} /> Register
          </button>
          <button
            onClick={() => setView("tracking")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              view === "tracking" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <TrendingUp size={16} /> Member Tracking
          </button>
        </div>
      </div>

      {view === "register" ? (
        <div className="space-y-6">
          {/* Date + context */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Register Date
                </label>
                <input
                  type="date"
                  value={date}
                  max={todayStr()}
                  onChange={(e) => setDate(e.target.value || todayStr())}
                  className={inputCls}
                />
              </div>

              <div className="flex-1">
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 size={16} className="animate-spin" /> Loading schedule…
                  </div>
                ) : ctx?.meeting_day == null ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2 text-sm font-bold rounded-full border border-slate-200 bg-slate-50 text-slate-700 px-4 py-2">
                      <CalendarCheck size={15} /> No fixed meeting day — register any day
                    </span>
                  </div>
                ) : isMeetingDay ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm font-bold rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-2">
                    <CalendarCheck size={15} /> Meeting day — {ctx?.meeting_label}
                  </div>
                ) : ctx?.session_exists ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2.5">
                    {date} is not a {jumuiyaName} meeting day ({jumuiyaName} meets every <b>{ctx?.meeting_label}</b>),
                    but a register already exists here — you can still edit it.
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2.5">
                    {date} is not a {jumuiyaName} meeting day. {jumuiyaName} meets every{" "}
                    <b>{ctx?.meeting_label}</b> — the register is for the weekly meeting.
                  </div>
                )}

                {!loading && ctx?.session_exists && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-2.5 flex items-center justify-between gap-3">
                    <span>
                      ✓ Register already recorded for this date ({ctx.present_count} present) — toggle members and save
                      to overwrite.
                    </span>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-lg px-3 py-1.5 hover:bg-rose-50 transition-colors shrink-0"
                    >
                      <Trash2 size={13} /> Clear this day
                    </button>
                  </div>
                )}

                {!loading && !ctx?.session_exists && ctx?.is_past && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-2.5">
                    This is a <b>past meeting day</b> with no register yet. Mark members below to <b>backfill</b> the
                    attendance for this day.
                  </div>
                )}
              </div>
            </div>

            {/* Recent meeting days (backfill helper) */}
            {strip.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <History size={16} className="text-slate-400" /> Recent Meeting Days
                  </h3>
                  <span className="text-[11px] text-slate-400">Click a day to open or backfill it</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {strip.map((d) => {
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
          </div>

          {/* Roster marking */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Users size={16} className="text-slate-400" /> Members
                </h3>
                <span className="text-xs text-slate-400">
                  {presentCount} / {roster.length} present
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAll(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-100 transition-colors"
                >
                  <CheckCircle size={13} /> All present
                </button>
                <button
                  onClick={() => setAll(false)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 hover:bg-rose-100 transition-colors"
                >
                  <XCircle size={13} /> All absent
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Loading members…
              </div>
            ) : roster.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No active members in this jumuiya's roster.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {roster.map((m) => {
                  const present = presentMap[m.member_id] === true;
                  return (
                    <div
                      key={m.member_id}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{m.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{m.member_id}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setPresentMap((prev) => ({ ...prev, [m.member_id]: true }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            present
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                              : "bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600"
                          }`}
                        >
                          <CheckCircle size={13} /> Present
                        </button>
                        <button
                          onClick={() => setPresentMap((prev) => ({ ...prev, [m.member_id]: false }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                            !present
                              ? "bg-rose-500 border-rose-500 text-white shadow-sm"
                              : "bg-white border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600"
                          }`}
                        >
                          <XCircle size={13} /> Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              Attendance:{" "}
              <span className="font-black text-slate-900 text-lg">{presentCount}</span>{" "}
              <span className="text-slate-400">of {roster.length} members</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadRegister(date)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RefreshCw size={15} /> Reset
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-colors ${
                  canSave
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30"
                    : "bg-indigo-300 cursor-not-allowed"
                }`}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving…" : ctx?.session_exists ? "Update Register" : "Save Register"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sessions overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <History size={16} className="text-slate-400" /> Meeting History
              </h3>
              <span className="text-[11px] text-slate-400">Last {summary?.sessions.length || 0} recorded sessions</span>
            </div>
            {summaryLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                <Loader2 size={16} className="animate-spin" /> Loading history…
              </div>
            ) : !summary?.sessions.length ? (
              <div className="text-sm text-slate-400 py-4">No sessions recorded yet.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...summary.sessions].reverse().map((s) => (
                  <button
                    key={s.date}
                    onClick={() => {
                      setDate(s.date);
                      setView("register");
                    }}
                    className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors text-center"
                  >
                    <span className="text-xs font-semibold text-slate-700">{friendlyDate(s.date)}</span>
                    <span className="text-[11px] text-slate-500">
                      {s.present_count}/{s.total_count} present
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Per-member tracking */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-slate-400" /> Member Attendance Rate
              </h3>
              <span className="text-[11px] text-slate-400">
                Rate = sessions attended ÷ sessions recorded
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                    <th className="px-5 py-3">Member</th>
                    <th className="px-3 py-3 text-center">Attended</th>
                    <th className="px-3 py-3 text-center">Sessions</th>
                    <th className="px-3 py-3 text-center">Rate</th>
                    <th className="px-3 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary?.members.map((m) => {
                    const ratePct = m.rate == null ? 0 : m.rate * 100;
                    return (
                      <tr key={m.member_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800">{m.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{m.member_id}</p>
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-slate-800">
                          {m.present_count}
                        </td>
                        <td className="px-3 py-3 text-center text-slate-600">{m.sessions}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[80px]">
                              <div
                                className={`h-full rounded-full ${
                                  m.flag_candidate ? "bg-rose-400" : "bg-emerald-500"
                                }`}
                                style={{ width: `${ratePct}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-11 text-right">
                              {pctLabel(m.rate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {m.flag_candidate ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                              <Flag size={11} /> Flag candidate
                            </span>
                          ) : m.rate == null ? (
                            <span className="text-[11px] text-slate-400">—</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                              <CheckCircle size={11} /> Good
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {summary && summary.sessions.length >= 2 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400">
                Members attending less than 50% of sessions are flagged as candidates for the inactive list. You can flag
                them from the Dashboard members list.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
