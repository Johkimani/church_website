import axios from "axios";
import { BASE_URL } from "./config";
import { SessionStorage } from "../utils";

const lightClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 120000,
});

lightClient.interceptors.request.use((config) => {
  const userdata = SessionStorage.get("userdata");
  if (userdata?.accessToken) {
    const token = userdata.accessToken;
    if (typeof token === "string" && token.split(".").length === 3) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

function clearPublicCache() {
  ["csa_cache_activities/semester", "csa_cache_activities/weekly", "csa_cache_public_activities"].forEach((k) => localStorage.removeItem(k));
}

const jumuiyaActivitiesService = {
  getJumuiyaWeekly: async (jumuiyaId: string, includeInactive = false) => {
    const params = includeInactive ? "?all=true" : "";
    const res = await lightClient.get(`/jumuiya-activities/${jumuiyaId}/weekly${params}`);
    return res.data.data || [];
  },
  createJumuiyaWeekly: async (jumuiyaId: string, data: any) => {
    const res = await lightClient.post(`/jumuiya-activities/${jumuiyaId}/weekly`, data);
    clearPublicCache();
    return res.data.data;
  },
  updateJumuiyaWeekly: async (id: number, data: any) => {
    const res = await lightClient.patch(`/jumuiya-activities/weekly/${id}`, data);
    clearPublicCache();
    return res.data.data;
  },
  deleteJumuiyaWeekly: async (id: number) => {
    const res = await lightClient.delete(`/jumuiya-activities/weekly/${id}`);
    clearPublicCache();
    return res.data.data;
  },
  reorderJumuiyaWeekly: async (items: any[]) => {
    const res = await lightClient.post("/jumuiya-activities/weekly/reorder", { items });
    clearPublicCache();
    return res.data.data;
  },
  uploadWeeklyImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await lightClient.post(`/jumuiya-activities/weekly/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    clearPublicCache();
    return res.data.data;
  },
  removeWeeklyImage: async (id: number) => {
    const res = await lightClient.delete(`/jumuiya-activities/weekly/${id}/image`);
    clearPublicCache();
    return res.data.data;
  },
  getJumuiyaSemester: async (jumuiyaId: string, includeInactive = false) => {
    const params = includeInactive ? "?all=true" : "";
    const res = await lightClient.get(`/jumuiya-activities/${jumuiyaId}/semester${params}`);
    return res.data.data || [];
  },
  createJumuiyaSemester: async (jumuiyaId: string, data: any) => {
    const res = await lightClient.post(`/jumuiya-activities/${jumuiyaId}/semester`, data);
    clearPublicCache();
    return res.data.data;
  },
  updateJumuiyaSemester: async (id: number, data: any) => {
    const res = await lightClient.patch(`/jumuiya-activities/semester/${id}`, data);
    clearPublicCache();
    return res.data.data;
  },
  deleteJumuiyaSemester: async (id: number) => {
    const res = await lightClient.delete(`/jumuiya-activities/semester/${id}`);
    clearPublicCache();
    return res.data.data;
  },
  uploadSemesterImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await lightClient.post(`/jumuiya-activities/semester/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    clearPublicCache();
    return res.data.data;
  },
  removeSemesterImage: async (id: number) => {
    const res = await lightClient.delete(`/jumuiya-activities/semester/${id}/image`);
    clearPublicCache();
    return res.data.data;
  },
};

export default jumuiyaActivitiesService;
