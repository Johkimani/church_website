import Dexie, { type Table } from "dexie";

export interface TallyJumuiya {
  group_id: string;
  name: string;
  slug: string;
  color: string;
}

export interface TallyCount {
  jumuiyaId?: string;
  jumuiyaName?: string;
  count: number;
  year?: number;
}

export interface AttendanceSession {
  sessionId: string; // = date (YYYY-MM-DD), one saved session per date
  date: string; // YYYY-MM-DD
  activityType: string; // e.g. "rosary" | "bible_study"
  activityLabel: string;
  dimension: "jumuiya" | "year";
  recordedBy: "coordinator" | "assistant";
  counts: TallyCount[];
  recordedAt: number;
  syncedAt?: number | null;
}

interface MetaEntry {
  key: string;
  data: unknown;
  fetchedAt: number;
}

interface Session {
  key: string;
  value: string;
}

export class AttendanceDB extends Dexie {
  meta!: Table<MetaEntry, string>;
  sessions!: Table<AttendanceSession, string>;
  session!: Table<Session, string>;

  constructor() {
    super("csa-attendance");
    this.version(1).stores({
      meta: "key",
      sessions: "sessionId, date, syncedAt",
      session: "key",
    });
  }
}

export const db = new AttendanceDB();

export async function getSession(key: string): Promise<string | null> {
  const row = await db.session.get(key);
  return row?.value ?? null;
}

export async function setSession(key: string, value: string): Promise<void> {
  await db.session.put({ key, value });
}

export async function clearSession(): Promise<void> {
  await db.session.clear();
}

export async function getMeta<T>(key: string): Promise<T | null> {
  const row = await db.meta.get(key);
  return (row?.data as T) ?? null;
}

export async function setMeta(key: string, data: unknown): Promise<void> {
  await db.meta.put({ key, data, fetchedAt: Date.now() });
}

export interface OfflineCredential {
  regNumber: string;
  salt: string;
  verifier: string;
  profile?: {
    member_id?: string;
    name?: string;
    role?: string[];
    jumuiya_id?: string;
  };
  savedAt: number;
}

const OFFLINE_CRED_KEY = "offline_credential";

export async function getOfflineCredential(): Promise<OfflineCredential | null> {
  return getMeta<OfflineCredential>(OFFLINE_CRED_KEY);
}

export async function setOfflineCredential(cred: OfflineCredential): Promise<void> {
  await setMeta(OFFLINE_CRED_KEY, cred);
}

export async function clearOfflineCredential(): Promise<void> {
  await db.meta.delete(OFFLINE_CRED_KEY);
}
