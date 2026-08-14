import axios from "axios";
import { SessionStorage } from "../utils";
import type { fileUpload } from "../interface/api";
import { normalizeFiles } from "../pages/Devotions/utitlty";
import { BASE_URL } from "./config";

const API_BASE_URL = BASE_URL;

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return (
        error.response.data?.error ||
        error.response.data?.message ||
        `Server responded with status ${error.response.status}`
      );

      
    }
    if (error.request) {
      return "Unable to reach the backend. Please ensure the server is running and the URL is correct.";
    }
    return error.message;
  }
  return typeof error === "string" ? error : "An unexpected error occurred.";
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 120000,
});

export const getApiErrorMessageFromError = getApiErrorMessage;

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const userdata = SessionStorage.get("userdata");
    if (userdata?.accessToken) {
      const token = userdata.accessToken;
      if (typeof token === "string" && token.split(".").length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("Malformed access token detected; clearing it.");
        SessionStorage.remove("userdata");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute =
      originalRequest.url?.includes("authentication/login") ||
      originalRequest.url?.includes("authentication/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const userdata = SessionStorage.get("userdata");
        if (!userdata?.accessToken) throw new Error("No session available");

        const { data } = await refreshAccessAndRefreshToken(userdata.accessToken);

        const updatedData = {
          ...userdata,
          accessToken: data.accessToken,
        };
        SessionStorage.set("userdata", updatedData);

        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        SessionStorage.remove("userdata");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=true";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const refreshClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

// The refresh token lives in an httpOnly cookie (sent automatically via
// withCredentials). The current access token is passed as a binding so the
// server can reject the request if the cookie belongs to a different member.
const refreshAccessAndRefreshToken = (accessToken: string) =>
  refreshClient.post("authentication/refresh", { accessToken });

// --- Your API functions below ---
export const generateAndSaveQuestions = (data: { topic: string; numberOfQuestions?: number }) =>
  apiClient.post("/questions", data);

export const createManualQuestion = (data: {
  questionText: string;
  answers: { option: string; text: string }[];
  correctAnswer: { option: string; text: string; explanation?: string };
  topic?: string;
}) => apiClient.post("/questions/manual", data);

export const fetchDailyQuestions = (limit: number = 10) =>
  apiClient.get(`/questions/?limit=${limit}`);

export const fetchManageQuestions = (params?: { page?: number; limit?: number; search?: string; topic?: string }) =>
  apiClient.get("/questions/manage", { params });

export const fetchQuestionTopics = () => apiClient.get("/questions/topics");

export const updateQuestionApi = (id: string | number, payload: any) =>
  apiClient.put(`/questions/${id}`, payload);

export const deleteQuestionApi = (id: string | number) =>
  apiClient.delete(`/questions/${id}`);

export const deleteQuestionsByTopicApi = (topic: string) =>
  apiClient.delete("/questions/by-topic", { params: { topic } });

export const recordAttemptApi = (payload: {
  questionId: number | string;
  selectedOption: number;
}) => apiClient.post("/questions/attempt", payload);

export const fetchTodayChallengeStatus = () => apiClient.get("/questions/today-status");

export const setQuestionStatusApi = (id: number | string, status: "approved" | "rejected") =>
  apiClient.put(`/questions/${id}/status`, { status });

// Weekly challenge (member-facing)
export const fetchCurrentWeeklyChallenge = () => apiClient.get("/weekly-challenge/current");

// Weekly challenge (liturgist-facing)
export const listWeeklyChallenges = () => apiClient.get("/weekly-challenge/challenges");
export const createWeeklyChallenge = (payload: {
  weekStart: string;
  topic: string;
  questionIds: number[];
}) => apiClient.post("/weekly-challenge/challenges", payload);
export const fetchWeeklyChallengeDetail = (id: number | string) =>
  apiClient.get(`/weekly-challenge/challenges/${id}`);
export const updateWeeklyChallengeApi = (id: number | string, payload: any) =>
  apiClient.put(`/weekly-challenge/challenges/${id}`, payload);
export const activateWeeklyChallengeApi = (id: number | string) =>
  apiClient.post(`/weekly-challenge/challenges/${id}/activate`);
export const publishWeeklyChallengeApi = (id: number | string) =>
  apiClient.post(`/weekly-challenge/challenges/${id}/publish`);
export const reviewWeeklyChallengeApi = (id: number | string) =>
  apiClient.get(`/weekly-challenge/challenges/${id}/review`);


export type AssistantChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export const postAssistantChat = (data: {
  message: string;
  history?: AssistantChatHistoryItem[];
  context?: {
    path?: string;
    name?: string;
    role?: string | string[];
    knowledge?: string;
  };
}) => apiClient.post("/assistant/chat", data);

export const fetchJumuiyaComparisonData = () => apiClient.get("/csa/jumuiya-comparison");

// Published stats (admin-controlled snapshots)
export const publishStats = () => apiClient.post("/publish-stats");
export const fetchPublishedComparison = (params?: { week?: string; from?: string; to?: string }) =>
  apiClient.get("/published/comparison", { params });
export const fetchComparisonOptions = () => apiClient.get("/published/comparison/options");
export const fetchPublishedMemberProgress = () => apiClient.get("/published/member-progress");
export const fetchPublishedJumuiyaDashboard = (jumuiyaId: string) =>
  apiClient.get(`/published/jumuiya-dashboard/${jumuiyaId}`);

export const fetchGalleryTeaser = () => apiClient.get("/gallery/teaser");

export const fetchSystemSettings = () => apiClient.get("/settings");

export const updateSystemSettings = (settings: Record<string, string>) =>
  apiClient.put("/settings", settings);

export const memberProgressData = () => apiClient.get("/member/progress");

export const memberSummaryData = () => apiClient.get("/member/summary");

export const fetchNotifications = () => apiClient.get("/notifications");

export const createNotificationEventApi = (payload: {
  title: string;
  message: string;
  images?: fileUpload[];
  posted_To?: string;
  status?: string;
}) => apiClient.post("/notifications", payload);

export const updateNotificationEventApi = (
  id: string | number,
  payload: {
    title?: string;
    message?: string;
    images?: fileUpload[];
    posted_To?: string;
    status?: string;
  }
) => apiClient.patch(`/notifications/${id}`, payload);


export const uploadFile = async (
  files: File[] | File,
  options?: { onProgress?: (percent: number) => void; compress?: boolean }
) => {
  const normalized = normalizeFiles(files);
  const processed = options?.compress !== false
    ? await Promise.all(normalized.map(async (f) => {
        if (f.size < 200 * 1024 || !f.type.startsWith('image/')) return f;
        const { resizeImage } = await import('../utils/imageOptimization');
        const blob = await resizeImage(f, 1200, 1200);
        return new File([blob], f.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
      }))
    : normalized;
  const formData = new FormData();
  processed.forEach((file) => formData.append("files", file));
  return apiClient.post("/files", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: options?.onProgress
      ? (e) => { if (e.total) options.onProgress!(Math.round((e.loaded / e.total) * 100)); }
      : undefined,
  });
};

export const fetchAllUploadedFiles = () => apiClient.post("/files");

export const deleteOneOrMoreFiles = (publicIds: string | string[]) => {
  const ids = Array.isArray(publicIds) ? publicIds : [publicIds];
  return apiClient.delete("/files", { data: { publicIds: ids } });
};

export const fetchTable = (table: string, params: Record<string, any> = {}) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return apiClient.get(`/${table}${qs ? `?${qs}` : ""}`);
};

export const createTableRecord = (table: string, payload: Record<string, any>) =>
  apiClient.post(`/${table}`, payload);

export const updateTableRecord = (table: string, id: string | number, payload: Record<string, any>) =>
  apiClient.patch(`/${table}/${id}`, payload);

export const deleteTableRecord = (table: string, id: string | number) =>
  apiClient.delete(`/${table}/${id}`);

export const loginApi = (data: { userReg: string; password: string }) =>
  apiClient.post("/authentication/login", data);

export const initiateSTKPush = (data: { amount: number; phoneNumber: string }) => {
  return apiClient.post("/payments/stkpush", data);
};

export const initiateGuestSTKPush = (data: { amount: number; phoneNumber: string }) =>
  apiClient.post("/authentication/stk-push-guest", data);

export const getSTKPushStatus = (checkoutId: string) =>
  apiClient.get(`/authentication/stk-push-status/${checkoutId}`);

export const resetEmailApi = (data: { email: string; password?: string; purpose: string }) =>
  apiClient.post("/authentication/reset-email", data);

export const resetPasswordApi = (data: { email: string; password?: string; purpose: string }) =>
  apiClient.post("/authentication/reset", data);
