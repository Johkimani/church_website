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
  published?: {
    is_published: boolean;
    published_at?: string | null;
    published_by?: string | null;
  };
  message?: string;
}

export interface PublishedPrayerPartnersResponse {
  success: boolean;
  published: boolean;
  pairs: PrayerPartnerUnit[];
  published_at?: string | null;
  published_by?: string | null;
  message?: string;
}

const BASE = (jumuiyaId: string) => `/prayer-partners/${jumuiyaId}`;

export const prayerPartnersService = {
  getData: (jumuiyaId: string): Promise<PrayerPartnersResponse> =>
    apiClient.get(BASE(jumuiyaId)).then((r) => r.data),

  getPublished: (jumuiyaId: string): Promise<PublishedPrayerPartnersResponse> =>
    apiClient.get(`${BASE(jumuiyaId)}/published`).then((r) => r.data),

  createGroup: (jumuiyaId: string, memberIds: string[]): Promise<{ success: boolean; groupId?: number; message?: string }> =>
    apiClient.post(BASE(jumuiyaId), { member_ids: memberIds }).then((r) => r.data),

  cancelGroup: (jumuiyaId: string, groupId: number): Promise<{ success: boolean; message?: string }> =>
    apiClient.delete(`${BASE(jumuiyaId)}/groups/${groupId}`).then((r) => r.data),

  post: (jumuiyaId: string): Promise<{ success: boolean; message?: string }> =>
    apiClient.post(`${BASE(jumuiyaId)}/post`).then((r) => r.data),

  unpost: (jumuiyaId: string): Promise<{ success: boolean; message?: string }> =>
    apiClient.post(`${BASE(jumuiyaId)}/unpost`).then((r) => r.data),
};