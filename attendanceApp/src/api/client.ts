import axios from "axios";
import { setSession } from "../db/db";

const rawBase = (import.meta.env.VITE_SERVER_URI as string) || "http://localhost:3001/api/v1";
export const BASE_URL = rawBase.replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("csa_attendance_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Silent token renewal.
 *
 * Access tokens are deliberately short-lived (15 minutes), but the server
 * also issues a 20-hour refresh token into an httpOnly cookie. When an API
 * call comes back 401 we mint a new access token from that cookie and replay
 * the request, so a coordinator signs in roughly once a day instead of every
 * 15 minutes — which is what allows pending records to upload unattended.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function requestNewAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${BASE_URL}/authentication/refresh`,
      // Only used by the server to confirm this refresh belongs to the same
      // member (tab-session binding); the cookie is the real credential.
      { accessToken: localStorage.getItem("csa_attendance_token") || "" },
      { withCredentials: true, timeout: 20000 }
    );
    const token = res.data?.accessToken;
    if (typeof token !== "string" || !token) return null;
    localStorage.setItem("csa_attendance_token", token);
    // Keep the IndexedDB copy in step — the service worker reads it from there.
    await setSession("token", token);
    return token;
  } catch {
    return null;
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = requestNewAccessToken().finally(() => {
      // Release on the next tick so parallel 401s share a single refresh call.
      setTimeout(() => {
        refreshInFlight = null;
      }, 0);
    });
  }
  return refreshInFlight;
}

/**
 * Session-expiry guard. If renewal also fails the 20-hour session is genuinely
 * over, so clear the local token and bounce back to the login screen. The
 * IndexedDB session (profile + offline credential) is deliberately preserved
 * so the user can unlock again without internet via the local verifier.
 */
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;
    const original = err?.config;
    const isAuthCall = String(original?.url || "").includes("/authentication/");

    // Renew and replay instead of logging the coordinator out. `_retried`
    // stops a failing refresh from looping.
    if (status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      const fresh = await refreshAccessToken();
      if (fresh) {
        if (typeof original.headers?.set === "function") {
          original.headers.set("Authorization", `Bearer ${fresh}`);
        } else if (original.headers) {
          original.headers.Authorization = `Bearer ${fresh}`;
        }
        return apiClient(original);
      }
    }

    if (status === 401 && !isAuthCall && localStorage.getItem("csa_attendance_token")) {
      localStorage.removeItem("csa_attendance_token");
      window.dispatchEvent(new Event("csa:auth-expired"));
    }
    return Promise.reject(err);
  }
);

/** True when a request failed without any server response (offline/timeout). */
export function isNetworkError(err: unknown): boolean {
  const anyErr = err as { response?: unknown };
  return !anyErr?.response;
}

export interface LoginResult {
  member_id: string;
  accessToken: string;
  refreshToken?: string;
  role: string[];
  name: string;
  email?: string;
  jumuiya_id?: string;
  forcePasswordChange?: boolean;
  hasEmail?: boolean;
}

export interface TallyJumuiya {
  group_id: string;
  name: string;
  slug: string;
  color: string;
  total_members?: number;
  active_members?: number;
  register_status?: string;
  register_count?: number | null;
}

export interface TallyYear {
  year: string;
  label: string;
  color: string;
  total_members?: number;
  active_members?: number;
}

export interface NovenaWindow {
  id?: number;
  start_date: string;
  end_date: string;
}

export interface TallyContext {
  date: string;
  isTallyDay: boolean;
  canSave: boolean;
  activityType: string;
  activityLabel: string;
  active_novenas?: NovenaWindow[];
  jumuiyas: TallyJumuiya[];
  years: TallyYear[];
  semester?: { start_date: string; end_date: string } | null;
}

export interface TallyDayInfo {
  date: string;
  activityType: string;
  activityLabel: string;
  recorded: boolean;
}

export interface RecentStatus {
  today: string;
  tally_days: TallyDayInfo[];
}

export interface SessionCountJumuiya {
  jumuiya_id: string;
  count: number;
}

export interface SessionCountYear {
  year: string;
  count: number;
}

export interface SessionPayload {
  date: string;
  counts: SessionCountJumuiya[] | SessionCountYear[];
  recordedBy: "coordinator" | "assistant";
  dimension: "jumuiya" | "year";
}

export async function login(userReg: string, password: string): Promise<LoginResult> {
  const res = await apiClient.post("/authentication/login", {
    userReg: userReg.trim().toUpperCase(),
    password,
  });
  return res.data as LoginResult;
}

export async function fetchTallyContext(token: string, date: string): Promise<TallyContext> {
  const res = await apiClient.get("/attendance/tally-context", {
    params: { date },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data as TallyContext;
}

export async function fetchRecentStatus(token: string, days = 14): Promise<RecentStatus> {
  const res = await apiClient.get("/attendance/recent-status", {
    params: { days },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data as RecentStatus;
}

/**
 * Pushes a single attendance session to the server. Uses the apiClient
 * interceptor for auth (reads from localStorage). Do NOT pass a manual
 * Authorization header — the interceptor handles it.
 */
export async function pushSession(
  session: SessionPayload
): Promise<{ success: boolean; data?: { saved?: number; date?: string } }> {
  const res = await apiClient.post("/attendance/sessions", session);
  return res.data as { success: boolean; data?: { saved?: number; date?: string } };
}

/**
 * Checks whether a tally session for `date` exists on the server.
 * Returns `true` if at least one tally row is found, `false` otherwise.
 * Silently returns `false` on network errors so callers don't block on offline.
 */
export async function checkSessionExists(date: string): Promise<boolean> {
  try {
    const res = await apiClient.get("/attendance/sessions", {
      params: { date },
    });
    const rows = res.data?.data;
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

/** Shape of a single tally row returned by GET /attendance/history */
interface HistoryCount {
  kind: "jumuiya" | "year";
  jumuiya_name?: string;
  jumuiya_color?: string;
  year?: string;
  label?: string;
  count: number;
  source: string;
}

export interface ServerRecordedSession {
  date: string;
  activityType: string;
  activityLabel: string;
  dimension: "jumuiya" | "year";
  recordedBy: string;
  totalCount: number;
  counts: HistoryCount[];
}

/**
 * Fetches the last `limit` recorded sessions from the server (main site).
 * Returns them newest-first. Silently returns [] on network errors.
 */
export async function fetchRecentRecorded(
  limit = 5
): Promise<ServerRecordedSession[]> {
  try {
    const to = new Date().toISOString().slice(0, 10);
    const fromObj = new Date();
    fromObj.setDate(fromObj.getDate() - 30);
    const from = fromObj.toISOString().slice(0, 10);

    const res = await apiClient.get("/attendance/history", {
      params: { from, to },
    });
    const rows = res.data?.data;
    if (!Array.isArray(rows)) return [];

    return rows.slice(0, limit).map((r: any) => ({
      date: r.date,
      activityType: r.activity_type,
      activityLabel: r.activity_label,
      dimension: r.dimension,
      recordedBy: r.recorded_by_name || r.recorded_role || "",
      totalCount: (r.counts || []).reduce(
        (sum: number, c: any) => sum + (c.count || 0),
        0
      ),
      counts: r.counts || [],
    }));
  } catch {
    return [];
  }
}

export function getApiErrorMessage(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string; error?: string } } };
  return (
    anyErr?.response?.data?.message ||
    anyErr?.response?.data?.error ||
    "Connection failed. Records stay saved offline."
  );
}
