import axios from "axios";

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

export interface TallyContext {
  date: string;
  isTallyDay: boolean;
  activityType: string;
  activityLabel: string;
  jumuiyas: TallyJumuiya[];
  years: { year: string; label: string; color: string; total_members?: number; active_members?: number }[];
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

export interface SessionPayload {
  date: string;
  counts: { jumuiya_id: string; count: number }[];
  recordedBy: "coordinator" | "assistant";
  dimension: "jumuiya";
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

export async function pushSession(
  token: string,
  session: SessionPayload
): Promise<{ success: boolean }> {
  const res = await apiClient.post("/attendance/sessions", session, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as { success: boolean };
}

export function getApiErrorMessage(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string; error?: string } } };
  return (
    anyErr?.response?.data?.message ||
    anyErr?.response?.data?.error ||
    "Connection failed. Records stay saved offline."
  );
}
