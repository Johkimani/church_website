import { useCallback, useEffect, useMemo, useState } from "react";
import { Save, RefreshCw, Zap, AlertTriangle } from "lucide-react";
import { db, getMeta, setMeta, type AttendanceSession, type TallyJumuiya } from "../db/db";
import { fetchTallyContext, getApiErrorMessage } from "../api/client";
import { getSession } from "../db/db";
import { syncPending } from "../sync/sync";

interface Props {
  token: string;
  onSaved: () => void;
}

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Offline heuristic — mirrors the backend's default tally days.
// Mon (1) Rosary, Wed (3) Bible Study, Thu (4) Rosary. Novena days also count
// but are decided server-side, so offline saves are still allowed for any date.
const DAY_ACTIVITY: Record<number, { type: string; label: string }> = {
  1: { type: "rosary", label: "Monday Rosary" },
  3: { type: "bible_study", label: "Wednesday Bible Study" },
  4: { type: "rosary", label: "Thursday Rosary" },
};

const dayActivity = (date: string) => DAY_ACTIVITY[new Date(date + "T12:00:00").getDay()] ?? null;

export default function RecordPage({ token, onSaved }: Props) {
  const [date, setDate] = useState(todayISO());
  const [jumuiyas, setJumuiyas] = useState<TallyJumuiya[]>([]);
  const [activity, setActivity] = useState<{ isTallyDay: boolean; type: string; label: string } | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mode, setMode] = useState<"jumuiya" | "year">("jumuiya");
  const [recordedBy, setRecordedBy] = useState<"coordinator" | "assistant">("coordinator");

  const loadFromCache = useCallback(
    (d: string) => {
      return getMeta<TallyJumuiya[]>("jumuiyas").then((j) => {
        setJumuiyas(j || []);
        const offline = dayActivity(d);
        setActivity(
          offline
            ? { isTallyDay: true, type: offline.type, label: offline.label }
            : { isTallyDay: false, type: "", label: "" }
        );
        return j;
      });
    },
    []
  );

  const refreshContext = useCallback(
    async (d: string) => {
      setLoadingContext(true);
      try {
        const ctx = await fetchTallyContext(token, d);
        setJumuiyas(ctx.jumuiyas);
        setActivity({
          isTallyDay: ctx.isTallyDay,
          type: ctx.activityType,
          label: ctx.activityLabel,
        });
        await setMeta("jumuiyas", ctx.jumuiyas);
        if (ctx.isTallyDay) {
          setMessage({ ok: true, text: `Tally day: ${ctx.activityLabel} — enter counts below.` });
        } else {
          setMessage({
            ok: false,
            text: `${d} is not a tally day (Mon/Wed/Thu or an active novena). You can still save it offline.`,
          });
        }
      } catch {
        await loadFromCache(d);
        setMessage({ ok: false, text: "Offline — using the saved jumuiya list. Records sync later." });
      } finally {
        setLoadingContext(false);
      }
    },
    [token, loadFromCache]
  );

  useEffect(() => {
    loadFromCache(date);
    refreshContext(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const setCount = (id: string, value: string) => {
    if (value !== "" && !/^\d+$/.test(value)) return;
    setCounts((prev) => ({ ...prev, [id]: value }));
  };

  const validJumuiyas = useMemo(
    () => jumuiyas.filter((j) => counts[j.group_id] !== undefined && counts[j.group_id] !== "" && counts[j.group_id] !== "0"),
    [jumuiyas, counts]
  );

  const modeControls = (
    <div className="mode-toggle" style={{ marginBottom: 12, display: "flex", gap: 8 }}>
      <button
        className={mode === "jumuiya" ? "active" : ""}
        onClick={() => setMode("jumuiya")}
        style={{ padding: "6px 12px", fontSize: 12, border: "1px solid currentColor", borderRadius: 6, cursor: "pointer" }}
      >
        Jumuiya
      </button>
      <button
        className={mode === "year" ? "active" : ""}
        onClick={() => setMode("year")}
        style={{ padding: "6px 12px", fontSize: 12, border: "1px solid currentColor", borderRadius: 6, cursor: "pointer" }}
      >
        Year
      </button>
    </div>
  );

  const recordedByControls = (
    <div className="recorded-by-toggle" style={{ marginBottom: 12, display: "flex", gap: 8 }}>
      <button
        className={recordedBy === "coordinator" ? "active" : ""}
        onClick={() => setRecordedBy("coordinator")}
        style={{ padding: "6px 12px", fontSize: 12, border: "1px solid currentColor", borderRadius: 6, cursor: "pointer" }}
      >
        Coordinator
      </button>
      <button
        className={recordedBy === "assistant" ? "active" : ""}
        onClick={() => setRecordedBy("assistant")}
        style={{ padding: "6px 12px", fontSize: 12, border: "1px solid currentColor", borderRadius: 6, cursor: "pointer" }}
      >
        Assistant
      </button>
    </div>
  );

  const saveAll = async () => {
    if (validJumuiyas.length === 0) {
      setMessage({ ok: false, text: "Enter at least one attendance count" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const dimension = mode === "year" ? "year" : "jumuiya";
      let sessionCounts: { jumuiyaId: string; jumuiyaName: string; count: number; year?: number }[] = [];
      if (mode === "year") {
        sessionCounts = validJumuiyas.map((j) => {
          const y = counts[j.group_id] ? Number(counts[j.group_id]) : 0;
          const yearVal = counts[`year_${j.group_id}`] ? Number(counts[`year_${j.group_id}`]) : 1;
          return { jumuiyaId: j.group_id, jumuiyaName: j.name, count: y, year: yearVal };
        });
      } else {
        sessionCounts = validJumuiyas.map((j) => ({
          jumuiyaId: j.group_id,
          jumuiyaName: j.name,
          count: Number(counts[j.group_id]),
        }));
      }
      const session: AttendanceSession = {
        sessionId: date,
        date,
        activityType: activity?.type || "rosary",
        activityLabel: activity?.label || dayActivity(date)?.label || "Attendance",
        recordedBy,
        counts: sessionCounts.map((c) => ({
          jumuiyaId: c.jumuiyaId,
          jumuiyaName: c.jumuiyaName,
          count: c.count,
          ...(c.year !== undefined ? { year: c.year } : {}),
        })),
        recordedAt: Date.now(),
        syncedAt: null,
      };
      await db.sessions.put(session);

      const online = navigator.onLine;
      if (online && token) {
        let lastError = "";
        const res = await syncPending(token, (_s, msg) => {
          lastError = msg;
        });
        if (res.pushed > 0) {
          setMessage({ ok: true, text: `Saved tallies for ${date} and synced to the server.` });
        } else if (res.failed > 0) {
          setMessage({
            ok: true,
            text: `Saved ${date} locally, but the server rejected it: ${lastError}. It will retry later.`,
          });
        }
      } else {
        setMessage({ ok: true, text: `Saved ${date} offline. Will auto-sync when online.` });
      }
      setCounts({});
      onSaved();
    } catch (err) {
      setMessage({ ok: false, text: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString();

  return (
    <div className="space-y-4">
      {message && (
        <div className={`banner ${message.ok ? "online" : "error"}`}>
          {message.ok ? <Zap size={16} /> : <AlertTriangle size={16} />}
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="flex" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h2>Record Attendance</h2>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setRefreshing(true);
              refreshContext(date).finally(() => setRefreshing(false));
            }}
            disabled={refreshing || loadingContext}
            style={{ padding: "8px 12px", fontSize: 13 }}
          >
            <RefreshCw size={15} className={refreshing || loadingContext ? "spin" : ""} /> Refresh
          </button>
        </div>
        <p className="sub">Pick the date, then enter the number of attendees per jumuiya.</p>

        <div className="field">
          <label>Activity date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {modeControls}

        {recordedByControls}

        {activity?.isTallyDay && activity.label ? (
          <p className="sub" style={{ marginTop: -6 }}>
            Selected: <strong>{activity.label}</strong> on {dateLabel}
          </p>
        ) : (
          <p className="sub" style={{ marginTop: -6 }}>
            {dateLabel} is not a regular tally day (Mon/Wed/Thu). Novena days also count — the server decides on sync.
          </p>
        )}
      </div>

      {jumuiyas.length === 0 ? (
        <div className="card">
          <p className="sub" style={{ margin: 0 }}>
            No jumuiya list cached yet. Connect once so the app can fetch the tally-day list.
          </p>
        </div>
      ) : (
        <div className="card">
          <h2>Attendees per Jumuiya</h2>
          <p className="sub">Leave a jumuiya blank or 0 if none attended.</p>
          <div className="space-y-2">
            {jumuiyas.map((j) => (
              <div key={j.group_id} className="jum-row">
                <div className="jum-dot" style={{ backgroundColor: j.color || "#6366f1" }}>
                  {initials(j.name)}
                </div>
                <span className="jum-name">{j.name}</span>
                <input
                  className="jum-count"
                  inputMode="numeric"
                  placeholder="0"
                  value={counts[j.group_id] ?? ""}
                  onChange={(e) => setCount(j.group_id, e.target.value)}
                />
                {mode === "year" && (
                  <input
                    className="jum-year"
                    type="number"
                    min={1}
                    max={4}
                    placeholder="1"
                    value={counts[`year_${j.group_id}`] ?? ""}
                    onChange={(e) => setCounts({ ...counts, [`year_${j.group_id}`]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-block" disabled={saving} onClick={saveAll} style={{ marginTop: 16 }}>
            <Save size={18} />
            {saving ? "Saving…" : mode === "jumuiya" ? `Save${validJumuiyas.length ? ` ${validJumuiyas.length} Jumuiya` : ""}` : `Save ${validJumuiyas.length} Year entries`}
          </button>
        </div>
      )}
    </div>
  );
}

function initials(name: string): string {
  return name
    .replace("St. ", "")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
