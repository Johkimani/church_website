import { apiClient } from "./axiosInstance";

/** Clear public page localStorage caches so admin changes appear immediately */
function clearPublicCache() {
  const keys = [
    "csa_cache_activities/semester",
    "csa_cache_activities/weekly",
    "csa_cache_public_activities",
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}

const activitiesService = {
  // ── Weekly (public read, admin write) ──────────────────
  getWeekly: async () => {
    const res = await apiClient.get("/activities/weekly");
    return res.data.data || [];
  },

  createWeekly: async (data) => {
    const res = await apiClient.post("/admin/activities/weekly", data);
    clearPublicCache();
    return res.data.data;
  },

  updateWeekly: async (id, data) => {
    const res = await apiClient.patch(`/admin/activities/weekly/${id}`, data);
    clearPublicCache();
    return res.data.data;
  },

  deleteWeekly: async (id) => {
    const res = await apiClient.delete(`/admin/activities/weekly/${id}`);
    clearPublicCache();
    return res.data.data;
  },

  activateWeekly: async (id) => {
    const res = await apiClient.post(`/admin/activities/weekly/${id}/activate`);
    clearPublicCache();
    return res.data.data;
  },

  deactivateWeekly: async (id) => {
    const res = await apiClient.post(`/admin/activities/weekly/${id}/deactivate`);
    clearPublicCache();
    return res.data.data;
  },

  reorderWeekly: async (items) => {
    const res = await apiClient.post("/admin/activities/weekly/reorder", { items });
    clearPublicCache();
    return res.data.data;
  },

  // ── Semester (public read, admin write) ────────────────
  getSemester: async () => {
    const res = await apiClient.get("/activities/semester");
    return res.data.data || [];
  },

  createSemester: async (data) => {
    const res = await apiClient.post("/admin/activities/semester", data);
    clearPublicCache();
    return res.data.data;
  },

  updateSemester: async (id, data) => {
    const res = await apiClient.patch(`/admin/activities/semester/${id}`, data);
    clearPublicCache();
    return res.data.data;
  },

  deleteSemester: async (id) => {
    const res = await apiClient.delete(`/admin/activities/semester/${id}`);
    clearPublicCache();
    return res.data.data;
  },

  activateSemester: async (id) => {
    const res = await apiClient.post(`/admin/activities/semester/${id}/activate`);
    clearPublicCache();
    return res.data.data;
  },

  deactivateSemester: async (id) => {
    const res = await apiClient.post(`/admin/activities/semester/${id}/deactivate`);
    clearPublicCache();
    return res.data.data;
  },
};

export default activitiesService;

// ── Bookings (admin + public) ─────────────────────────
export const bookingService = {
  getPaidActivities: async () => {
    const res = await apiClient.get("/activities/paid");
    return res.data.data || [];
  },
  book: async (activityId, activityType) => {
    const res = await apiClient.post("/activities/book", { activity_id: activityId, activity_type: activityType });
    return res.data.data;
  },
  pay: async (bookingId, amount, phone) => {
    const res = await apiClient.post("/activities/pay", { booking_id: bookingId, amount, phoneNumber: phone });
    return res.data;
  },
  myBookings: async () => {
    const res = await apiClient.get("/activities/my-bookings");
    return res.data.data || [];
  },
  // admin
  getBookings: async () => {
    const res = await apiClient.get("/admin/activities/bookings");
    return res.data.data || [];
  },
  exportBookingsCSV: async () => {
    const res = await apiClient.get("/admin/activities/bookings/export", { responseType: "blob" });
    return res.data;
  },
  checkPaymentStatus: async (checkoutId) => {
    const res = await apiClient.get(`/activities/payment-status/${checkoutId}`);
    return res.data.data;
  },
};
