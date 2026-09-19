import { apiClient } from "./axiosInstance";

export interface PrayerPartnerMember {
  member_id: string;
  name: string;
  gender?: string | null;
  year_of_study?: string | null;
}

export interface PrayerPartnerUnit {
  id: number;
  members: PrayerPartnerMember[];
}

export interface PrayerPartnersResponse {
  success: boolean;
  pairs: PrayerPartnerUnit[];
  members: PrayerPartnerMember[];
  message?: string;
}

const BASE = (jumuiyaId: string) => `/prayer-partners/${jumuiyaId}`;

export const prayerPartnersService = {
  getData: (jumuiyaId: string): Promise<PrayerPartnersResponse> =>
    apiClient.get(BASE(jumuiyaId)).then((r) => r.data),

  createGroup: (jumuiyaId: string, memberIds: string[]): Promise<{ success: boolean; groupId?: number; message?: string }> =>
    apiClient.post(BASE(jumuiyaId), { member_ids: memberIds }).then((r) => r.data),

  cancelGroup: (jumuiyaId: string, groupId: number): Promise<{ success: boolean; message?: string }> =>
    apiClient.delete(`${BASE(jumuiyaId)}/groups/${groupId}`).then((r) => r.data),
};