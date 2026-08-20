import { apiClient } from "./axiosInstance";

/** Clear public page localStorage caches so admin changes appear immediately */
function clearPublicCache() {
  const keys = [
    "csa_cache_activities/semester",
    "csa_cache_activities/weekly",
    "csa_cache_public_activities",
    "csa_cache_public_activities_v3",
    "csa_cache_public_activities_v4",
    "csa_cache_settings",
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}

const activitiesService = {
  getWeekly: async () => {
    const res = await apiClient.get("/activities/weekly");
    return res.data.data || [];
  },

  createWeekly: async (data: any) => {
    const res = await apiClient.post("/admin/activities/weekly", data);
    clearPublicCache();
    return res.data.data;
  },

  updateWeekly: async (id: number, data: any) => {
    const res = await apiClient.patch(`/admin/activities/weekly/${id}`, data);
    clearPublicCache();
    return res.data.data;
  },

  deleteWeekly: async (id: number) => {
    const res = await apiClient.delete(`/admin/activities/weekly/${id}`);
    clearPublicCache();
    return res.data.data;
  },

  uploadWeeklyImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post(`/admin/activities/weekly/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    clearPublicCache();
    return res.data.data;
  },

  removeWeeklyImage: async (id: number) => {
    const res = await apiClient.delete(`/admin/activities/weekly/${id}/image`);
    clearPublicCache();
    return res.data.data;
  },

  activateWeekly: async (id: number) => {
    const res = await apiClient.post(`/admin/activities/weekly/${id}/activate`);
    clearPublicCache();
    return res.data.data;
  },

  deactivateWeekly: async (id: number) => {
    const res = await apiClient.post(`/admin/activities/weekly/${id}/deactivate`);
    clearPublicCache();
    return res.data.data;
  },

  reorderWeekly: async (items: any[]) => {
    const res = await apiClient.post("/admin/activities/weekly/reorder", { items });
    clearPublicCache();
    return res.data.data;
  },

  getSemester: async () => {
    const res = await apiClient.get("/activities/semester");
    return res.data.data || [];
  },

  createSemester: async (data: any) => {
    const res = await apiClient.post("/admin/activities/semester", data);
    clearPublicCache();
    return res.data.data;
  },

  updateSemester: async (id: number, data: any) => {
    const res = await apiClient.patch(`/admin/activities/semester/${id}`, data);
    clearPublicCache();
    return res.data.data;
  },

  deleteSemester: async (id: number) => {
    const res = await apiClient.delete(`/admin/activities/semester/${id}`);
    clearPublicCache();
    return res.data.data;
  },

  uploadSemesterImage: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post(`/admin/activities/semester/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    clearPublicCache();
    return res.data.data;
  },

  removeSemesterImage: async (id: number) => {
    const res = await apiClient.delete(`/admin/activities/semester/${id}/image`);
    clearPublicCache();
    return res.data.data;
  },

  /** Upload (or replace) the global default image for semester events. */
  uploadSemesterDefaultImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post("/admin/activities/semester/default-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    clearPublicCache();
    return res.data.data as { image_url: string };
  },

  /** Remove the global default image for semester events. */
  removeSemesterDefaultImage: async () => {
    const res = await apiClient.delete("/admin/activities/semester/default-image");
    clearPublicCache();
    return res.data;
  },

  activateSemester: async (id: number) => {
    const res = await apiClient.post(`/admin/activities/semester/${id}/activate`);
    clearPublicCache();
    return res.data.data;
  },

  deactivateSemester: async (id: number) => {
    const res = await apiClient.post(`/admin/activities/semester/${id}/deactivate`);
    clearPublicCache();
    return res.data.data;
  },

  // ── Jumuiya-scoped (for per-jumuiya CRUD) ─────────────
  getJumuiyaWeekly: async (jumuiyaId: string, includeInactive = false) => {
    const params = includeInactive ? '?all=true' : '';
    const res = await apiClient.get(`/jumuiya-activities/${jumuiyaId}/weekly${params}`);
    return res.data.data || [];
  },

  createJumuiyaWeekly: async (jumuiyaId: string, data: any) => {
    const res = await apiClient.post(`/jumuiya-activities/${jumuiyaId}/weekly`, data);
    clearPublicCache();
    return res.data.data;
  },

  updateJumuiyaWeekly: async (id: number, data: any) => {
    const res = await apiClient.patch(`/jumuiya-activities/weekly/${id}`, data);
    clearPublicCache();
    return res.data.data;
  },

  deleteJumuiyaWeekly: async (id: number) => {
    const res = await apiClient.delete(`/jumuiya-activities/weekly/${id}`);
    clearPublicCache();
    return res.data.data;
  },

  reorderJumuiyaWeekly: async (items: any[]) => {
    const res = await apiClient.post("/jumuiya-activities/weekly/reorder", { items });
    clearPublicCache();
    return res.data.data;
  },

  getJumuiyaSemester: async (jumuiyaId: string, includeInactive = false) => {
    const params = includeInactive ? '?all=true' : '';
    const res = await apiClient.get(`/jumuiya-activities/${jumuiyaId}/semester${params}`);
    return res.data.data || [];
  },

  createJumuiyaSemester: async (jumuiyaId: string, data: any) => {
    const res = await apiClient.post(`/jumuiya-activities/${jumuiyaId}/semester`, data);
    clearPublicCache();
    return res.data.data;
  },

  updateJumuiyaSemester: async (id: number, data: any) => {
    const res = await apiClient.patch(`/jumuiya-activities/semester/${id}`, data);
    clearPublicCache();
    return res.data.data;
  },

  deleteJumuiyaSemester: async (id: number) => {
    const res = await apiClient.delete(`/jumuiya-activities/semester/${id}`);
    clearPublicCache();
    return res.data.data;
  },
};

export default activitiesService;

export const bookingService = {
  getPaidActivities: async () => {
    const res = await apiClient.get("/activities/paid");
    return res.data.data || [];
  },
  book: async (activityId: number, activityType: string) => {
    const res = await apiClient.post("/activities/book", { activity_id: activityId, activity_type: activityType });
    return res.data.data;
  },
  pay: async (bookingId: number, amount: number, phone: string) => {
    const res = await apiClient.post("/activities/pay", { booking_id: bookingId, amount, phoneNumber: phone });
    return res.data;
  },
  myBookings: async () => {
    const res = await apiClient.get("/activities/my-bookings");
    return res.data.data || [];
  },
  // admin
  getBookings: async (page: number = 1, pageSize: number = 100) => {
    const res = await apiClient.get(`/admin/activities/bookings?page=${page}&limit=${pageSize}`);
    return res.data;
  },
  createBookingForMember: async (payload: {
    activity_id: number;
    activity_type: string;
    member_id?: string;
    guest_name?: string;
    phone?: string;
    year_of_study?: string;
  }) => {
    const res = await apiClient.post("/admin/activities/bookings", payload);
    return res.data.data;
  },
  recordCashPayment: async (bookingId: number, amount: number) => {
    const res = await apiClient.patch(`/admin/activities/bookings/${bookingId}/payment`, { amount });
    return res.data.data;
  },
  cancelBooking: async (bookingId: number) => {
    const res = await apiClient.patch(`/admin/activities/bookings/${bookingId}/cancel`);
    return res.data.data;
  },
  lookupMemberByRegNumber: async (search: string) => {
    const res = await apiClient.get(`/jumuiya-members/lookup/reg-number/${encodeURIComponent(search)}`);
    return res.data.data || [];
  },
  exportBookingsExcel: async (status: string = "all") => {
    const res = await apiClient.get(`/admin/activities/bookings/export?status=${encodeURIComponent(status)}`, { responseType: "blob" });
    return res.data;
  },
  checkPaymentStatus: async (checkoutId: string) => {
    const res = await apiClient.get(`/activities/payment-status/${checkoutId}`);
    return res.data.data;
  },
};
