import { apiClient } from "./axiosInstance";

export interface RegisterRecordInput {
  member_id: string;
  present: boolean;
}

export const jumuiyaAttendanceService = {
  getContext: (jumuiyaId: string, date: string) =>
    apiClient
      .get("/jumuiya-attendance/context", { params: { jumuiya_id: jumuiyaId, date } })
      .then((r) => r.data?.data || r.data),

  getRegister: (jumuiyaId: string, date: string) =>
    apiClient
      .get("/jumuiya-attendance/register", { params: { jumuiya_id: jumuiyaId, date } })
      .then((r) => r.data?.data || []),

  saveRegister: (jumuiyaId: string, date: string, records: RegisterRecordInput[]) =>
    apiClient.post("/jumuiya-attendance/register", { jumuiya_id: jumuiyaId, date, records }).then((r) => r.data),

  deleteRegister: (jumuiyaId: string, date: string) =>
    apiClient.delete(`/jumuiya-attendance/register/${date}`, { params: { jumuiya_id: jumuiyaId } }).then((r) => r.data),

  getSummary: (jumuiyaId: string, sessions = 6) =>
    apiClient
      .get("/jumuiya-attendance/summary", { params: { jumuiya_id: jumuiyaId, sessions } })
      .then((r) => r.data?.data || r.data),

  getMeetingConfigs: () =>
    apiClient
      .get("/jumuiya-attendance/meeting-config")
      .then((r) => r.data?.data || { configured: [], unconfigured: [] }),

  updateMeetingConfig: (jumuiyaId: string, meetingDay: number) =>
    apiClient
      .put(`/jumuiya-attendance/meeting-config/${jumuiyaId}`, { meeting_day: meetingDay })
      .then((r) => r.data),

  deleteMeetingConfig: (jumuiyaId: string) =>
    apiClient
      .delete(`/jumuiya-attendance/meeting-config/${jumuiyaId}`)
      .then((r) => r.data),
};

export const getApiError = (err: any): string =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  "Something went wrong";
