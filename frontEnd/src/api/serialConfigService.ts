import { apiClient } from "../api";

export interface SerialConfig {
  id: number;
  next_serial: number;
  updated_at: string;
}

export const serialConfigService = {
  get: (): Promise<{ success: boolean; data: SerialConfig }> =>
    apiClient.get("/serial-config").then((r) => r.data),

  update: (next_serial: number): Promise<{ success: boolean; data: SerialConfig }> =>
    apiClient.patch("/serial-config", { next_serial }).then((r) => r.data),
};
