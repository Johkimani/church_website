import { db, type AttendanceSession } from "../db/db";
import { pushSession, getApiErrorMessage, type SessionPayload } from "../api/client";

export interface SyncResult {
  pushed: number;
  failed: number;
}

/**
 * Flushes all unsynced attendance sessions to the backend.
 * Each saved date is one POST to /attendance/sessions — the backend replaces
 * that date's tallies atomically, so re-pushing an already-saved date is safe.
 */
export async function syncPending(
  token: string,
  onError?: (session: AttendanceSession, message: string) => void
): Promise<SyncResult> {
  if (!token) return { pushed: 0, failed: 0 };

  const pending = await db.sessions.filter((s) => !s.syncedAt).toArray();
  if (pending.length === 0) return { pushed: 0, failed: 0 };

  let pushed = 0;
  let failed = 0;

  for (const s of pending) {
    try {
      const isYear = s.dimension === "year";
      await pushSession(token, {
        date: s.date,
        dimension: isYear ? "year" : "jumuiya",
        counts: s.counts.map((c) =>
          isYear
            ? { year: String(c.year ?? 1), count: c.count }
            : { jumuiya_id: c.jumuiyaId!, count: c.count }
        ) as SessionPayload["counts"],
        recordedBy: s.recordedBy || "coordinator",
      });
      await db.sessions.update(s.sessionId, { syncedAt: Date.now() });
      pushed += 1;
    } catch (err) {
      failed += 1;
      onError?.(s, getApiErrorMessage(err));
      // Stop on first failure — remaining sessions stay queued for the next retry.
      break;
    }
  }

  return { pushed, failed };
}

export async function pendingCount(): Promise<number> {
  return db.sessions.filter((s) => !s.syncedAt).count();
}

export async function getAllSessions(): Promise<AttendanceSession[]> {
  return db.sessions.orderBy("recordedAt").reverse().toArray();
}
