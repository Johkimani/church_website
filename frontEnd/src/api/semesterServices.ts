import { apiClient } from "./axiosInstance";

export interface SemesterConfig {
  id: number;
  label: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  semester_number: 1 | 2;
  created_by: string;
}

export const semesterServices = {
  getCurrent: () =>
    apiClient
      .get("/settings/semester")
      .then((r) => r.data?.data || null),

  setCurrent: (payload: { label: string; start_date: string; end_date: string }) =>
    apiClient
      .put("/settings/semester", payload)
      .then((r) => r.data?.data || null),
};
