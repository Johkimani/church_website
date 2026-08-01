import { apiClient } from "./axiosInstance";

export interface TallyCountInput {
  jumuiya_id: string;
  count: number;
}

export const attendanceServices = {
  getTallyContext: (date: string) =>
    apiClient
      .get("/attendance/tally-context", { params: { date } })
      .then((r) => r.data?.data || r.data),

  getSession: (date: string) =>
    apiClient
      .get("/attendance/sessions", { params: { date } })
      .then((r) => r.data?.data || []),

  getRecentStatus: (days = 14) =>
    apiClient
      .get("/attendance/recent-status", { params: { days } })
      .then((r) => r.data?.data || { today: "", tally_days: [] }),

  saveSession: (date: string, counts: TallyCountInput[]) =>
    apiClient.post("/attendance/sessions", { date, counts }).then((r) => r.data),

  deleteSession: (date: string) =>
    apiClient.delete(`/attendance/sessions/${date}`).then((r) => r.data),

  getAnalytics: (from: string, to: string) =>
    apiClient
      .get("/attendance/analytics", { params: { from, to } })
      .then((r) => r.data?.data || null),
};

export const getApiError = (err: any): string =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  "Something went wrong";
