// src/api/activitiesService.js
import { apiClient } from "./axiosInstance";

const activitiesService = {
  // ── Weekly ──────────────────────────────────────────────────────
  getWeekly: async () => {
    const res = await apiClient.get("/activities/weekly");
    return res.data.data || [];
  },

  createWeekly: async (data) => {
    const res = await apiClient.post("/activities/weekly", data);
    return res.data.data;
  },

  updateWeekly: async (id, data) => {
    const res = await apiClient.patch(`/activities/weekly/${id}`, data);
    return res.data.data;
  },

  deleteWeekly: async (id) => {
    const res = await apiClient.delete(`/activities/weekly/${id}`);
    return res.data.data;
  },

  // ── Semester ─────────────────────────────────────────────────────
  getSemester: async () => {
    const res = await apiClient.get("/activities/semester");
    return res.data.data || [];
  },

  createSemester: async (data) => {
    const res = await apiClient.post("/activities/semester", data);
    return res.data.data;
  },

  updateSemester: async (id, data) => {
    const res = await apiClient.patch(`/activities/semester/${id}`, data);
    return res.data.data;
  },

  deleteSemester: async (id) => {
    const res = await apiClient.delete(`/activities/semester/${id}`);
    return res.data.data;
  },
};

export default activitiesService;