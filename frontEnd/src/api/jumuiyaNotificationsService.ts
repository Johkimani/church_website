import { apiClient } from "./axiosInstance";

export interface BackendNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  posted_by: string | null;
  date: string | null;
  posted_at: string | null;
}

const BASE = "/jumuiya-notifications";

const jumuiyaNotificationsService = {
  list: async (): Promise<BackendNotification[]> => {
    const { data } = await apiClient.get(BASE);
    return data;
  },

  create: async (payload: {
    title: string;
    message: string;
    status?: string;
  }): Promise<BackendNotification> => {
    const { data } = await apiClient.post(BASE, payload);
    return data;
  },

  update: async (
    id: number,
    payload: { title?: string; message?: string; status?: string }
  ): Promise<BackendNotification> => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, payload);
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};

export default jumuiyaNotificationsService;
