import { apiClient } from "./axiosInstance";

export type TallyDimension = "jumuiya" | "year";

export interface TallyCountInput {
  jumuiya_id?: string;
  year?: string;
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

  saveSession: (
    date: string,
    counts: TallyCountInput[],
    recordedBy: "coordinator" | "assistant" = "coordinator",
    dimension: TallyDimension = "jumuiya"
  ) => apiClient.post("/attendance/sessions", { date, counts, recordedBy, dimension }).then((r) => r.data),

  deleteSession: (date: string) =>
    apiClient.delete(`/attendance/sessions/${date}`).then((r) => r.data),

  getAnalytics: (from: string, to: string, dimension: TallyDimension = "jumuiya") =>
    apiClient
      .get("/attendance/analytics", { params: { from, to, dimension } })
      .then((r) => r.data?.data || null),

  exportAnalyticsExcel: (from: string, to: string, dimension: TallyDimension = "jumuiya") =>
    apiClient
      .get("/attendance/analytics/export", { params: { from, to, dimension }, responseType: "blob" })
      .then((r) => r.data),

  getHistory: (params: { from?: string; to?: string }) =>
    apiClient
      .get("/attendance/history", { params })
      .then((r) => r.data?.data || []),

  updateHistoryDate: (
    date: string,
    counts: TallyCountInput[],
    recordedBy: "coordinator" | "assistant"
  ) =>
    apiClient.patch(`/attendance/history/${date}`, { counts, recordedBy }).then((r) => r.data),

  getNovenas: () =>
    apiClient.get("/attendance/novena").then((r) => r.data?.data || []),

  createNovena: (payload: { start_date: string; end_date: string; is_active?: boolean }) =>
    apiClient.post("/attendance/novena", payload).then((r) => r.data),

  updateNovena: (
    id: number,
    payload: { start_date: string; end_date: string; is_active?: boolean }
  ) => apiClient.patch(`/attendance/novena/${id}`, payload).then((r) => r.data),

  deleteNovena: (id: number) =>
    apiClient.delete(`/attendance/novena/${id}`).then((r) => r.data),
};

export const getApiError = (err: any): string =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  "Failed to load attendance data";
