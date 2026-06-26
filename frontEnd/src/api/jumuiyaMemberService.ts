import { apiClient } from "./axiosInstance";

const BASE = (jumuiyaId: string) => `/jumuiya-members/${jumuiyaId}`;

export const memberService = {
  // ── Seasons ──
  createSeason: (jumuiyaId: string, data: any) =>
    apiClient.post(`${BASE(jumuiyaId)}/seasons`, data).then(r => r.data),

  getSeasons: (jumuiyaId: string) =>
    apiClient.get(`${BASE(jumuiyaId)}/seasons`).then(r => r.data),

  updateSeason: (jumuiyaId: string, id: number, data: any) =>
    apiClient.patch(`${BASE(jumuiyaId)}/seasons/${id}`, data).then(r => r.data),

  deleteSeason: (jumuiyaId: string, id: number) =>
    apiClient.delete(`${BASE(jumuiyaId)}/seasons/${id}`).then(r => r.data),

  // ── Imports ──
  importMembers: (jumuiyaId: string, data: { members: any[]; season_id?: number; file_name?: string }) =>
    apiClient.post(`${BASE(jumuiyaId)}/import-members`, data).then(r => r.data),

  getImports: (jumuiyaId: string) =>
    apiClient.get(`${BASE(jumuiyaId)}/imports`).then(r => r.data),

  getImportStatus: (jumuiyaId: string, importId: number) =>
    apiClient.get(`${BASE(jumuiyaId)}/import-status/${importId}`).then(r => r.data),

  updateImportStatus: (jumuiyaId: string, importId: number, data: { status: string; notes?: string }) =>
    apiClient.patch(`${BASE(jumuiyaId)}/import-status/${importId}`, data).then(r => r.data),

  // ── Validation ──
  validateImportData: (jumuiyaId: string, members: any[]) =>
    apiClient.post(`${BASE(jumuiyaId)}/validate-import`, { members }).then(r => r.data),

  // ── Groups ──
  createGroups: (jumuiyaId: string, data: { groups: any[]; season_id?: number }) =>
    apiClient.post(`${BASE(jumuiyaId)}/create-groups`, data).then(r => r.data),

  getGroups: (jumuiyaId: string, params?: { season_id?: number }) =>
    apiClient.get(`${BASE(jumuiyaId)}/groups`, { params }).then(r => r.data),

  updateGroup: (jumuiyaId: string, groupId: number, data: any) =>
    apiClient.patch(`${BASE(jumuiyaId)}/groups/${groupId}`, data).then(r => r.data),

  deleteGroup: (jumuiyaId: string, groupId: number) =>
    apiClient.delete(`${BASE(jumuiyaId)}/groups/${groupId}`).then(r => r.data),

  getGroupMembers: (jumuiyaId: string, groupId: number) =>
    apiClient.get(`${BASE(jumuiyaId)}/groups/${groupId}/members`).then(r => r.data),

  // ── Distribution ──
  autoDistribute: (jumuiyaId: string, data: { season_id?: number; strategy?: string; import_id?: number }) =>
    apiClient.post(`${BASE(jumuiyaId)}/auto-distribute`, data).then(r => r.data),

  reassignMember: (jumuiyaId: string, groupId: number, memberId: number) =>
    apiClient.patch(`${BASE(jumuiyaId)}/groups/${groupId}/reassign`, { member_id: memberId }).then(r => r.data),

  // ── Statistics ──
  getStatistics: (jumuiyaId: string) =>
    apiClient.get(`${BASE(jumuiyaId)}/statistics`).then(r => r.data),

  getDistributionHistory: (jumuiyaId: string) =>
    apiClient.get(`${BASE(jumuiyaId)}/distribution-history`).then(r => r.data),

  // ── Export ──
  exportMembers: (jumuiyaId: string) =>
    apiClient.get(`${BASE(jumuiyaId)}/export/members`).then(r => r.data),

  exportAssignments: (jumuiyaId: string) =>
    apiClient.get(`${BASE(jumuiyaId)}/export/assignments`).then(r => r.data),
};
