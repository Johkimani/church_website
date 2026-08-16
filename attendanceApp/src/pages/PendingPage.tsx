import { useEffect, useState } from "react";
import { RefreshCw, WifiOff, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { getAllSessions, syncPending } from "../sync/sync";
import { db, getSession } from "../db/db";
import type { AttendanceSession } from "../db/db";

interface Props {
  token: string;
  pending: number;
  onSynced: (n: number) => void;
}

export default function PendingPage({ token, pending, onSynced }: Props) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setSessions(await getAllSessions());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const sync = async () => {
    setSyncing(true);
    setStatus(null);
    try {
      const t = (await getSession("token")) || token;
      const res = await syncPending(t);
      setStatus({
        ok: true,
        text:
          res.pushed > 0
            ? `Synced ${res.pushed} date${res.pushed === 1 ? "" : "s"}`
            : "Nothing to sync",
      });
      if (res.pushed > 0) onSynced(res.pushed);
      load();
    } catch {
      setStatus({ ok: false, text: "Sync failed — you're likely offline. It will retry automatically." });
    } finally {
      setSyncing(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this saved date?")) return;
    await db.sessions.delete(id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h2>Saved Dates</h2>
          <span className={`chip ${pending > 0 ? "pending" : "synced"}`}>
            {pending > 0 ? <Clock size={12} /> : <CheckCircle2 size={12} />}
            {pending > 0 ? `${pending} pending` : "all synced"}
          </span>
        </div>
        <p className="sub">Tap Sync Now, or just wait — saved dates auto-sync when internet returns.</p>
        <button className="btn btn-primary btn-block" onClick={sync} disabled={syncing || pending === 0}>
          <RefreshCw size={18} className={syncing ? "spin" : ""} />
          {syncing ? "Syncing…" : "Sync now"}
        </button>
        {status && <div className={`banner ${status.ok ? "online" : "error"}`} style={{ margin: "12px 0 0" }}>{status.text}</div>}
      </div>

      {loading ? (
        <div className="card">
          <p className="sub" style={{ margin: 0 }}>Loading…</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: "center", color: "var(--muted)", padding: "8px 0" }}>
            <WifiOff size={28} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: 14 }}>No saved dates yet.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2>History</h2>
          <div>
            {sessions.map((s) => (
              <div key={s.sessionId} className="record-row">
                <div style={{ flex: 1 }}>
                  <strong>{new Date(s.date + "T00:00:00").toLocaleDateString()}</strong>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>
                    {s.activityLabel} · {s.counts.reduce((t, c) => t + c.count, 0)} attendees across{" "}
                    {s.counts.length} {s.dimension === "year" ? "year group" : "jumuiya"}
                    {s.counts.length > 1 ? "s" : ""}
                  </div>
                </div>
                <span className={`chip ${s.syncedAt ? "synced" : "pending"}`}>
                  {s.syncedAt ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {s.syncedAt ? "Synced" : "Pending"}
                </span>
                <button
                  onClick={() => remove(s.sessionId)}
                  style={{ border: 0, background: "transparent", color: "var(--red)", cursor: "pointer", padding: 4 }}
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
