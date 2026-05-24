import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_HISTORY, API_RESTORE, API_JUMUIYA_HISTORY, API_JUMUIYA_RESTORE } from '../utils/officialsApi';
import { showSuccessToast, showErrorToast } from '../utils/customToast';
import type { Official } from './useOfficials';

import { useAuth } from '../context/AuthContext';

export interface HistoryResponse {
  data: Official[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useHistory(filters: { termId?: string; onlyArchived?: boolean; page?: number; limit?: number; mode?: 'csa' | 'jumuiya' }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { termId, onlyArchived, page = 1, limit = 20, mode = 'csa' } = filters;

  const getBaseUrl = () => mode === 'jumuiya' ? API_JUMUIYA_HISTORY : API_HISTORY;
  const getRestoreUrl = () => mode === 'jumuiya' ? API_JUMUIYA_RESTORE : API_RESTORE;

  const historyQuery = useQuery({
    queryKey: ['history', filters],
    enabled: !!termId,
    queryFn: async () => {
      let url = getBaseUrl();
      if (termId) {
        url = `${url}/${termId}`;
      }
      
      const queryParams = new URLSearchParams();
      if (onlyArchived) queryParams.append('only_archived', 'true');
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      const res = await fetch(`${url}?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      return (await res.json()) as HistoryResponse;
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (officialIds: number[]) => {
      const res = await fetch(getRestoreUrl(), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken}`
        },
        body: JSON.stringify({ officialIds }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to restore officials');
      }
      return res.json();
    },
    onSuccess: (json) => {
      queryClient.invalidateQueries({ queryKey: mode === 'jumuiya' ? ['jumuiya_officials'] : ['officials'] });
      queryClient.invalidateQueries({ queryKey: mode === 'jumuiya' ? ['jumuiya_history'] : ['history'] });
      showSuccessToast('Officials Restored Successfully', json.message || 'The selected official records have been restored.');
    },
    onError: (error: Error) => {
      showErrorToast('Failed to Restore Officials', error.message);
    },
  });

  const deleteArchivedMutation = useMutation({
    mutationFn: async (officialId: number) => {
      const res = await fetch(`${getBaseUrl()}/${officialId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to delete archived official');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mode === 'jumuiya' ? ['jumuiya_history'] : ['history'] });
      showSuccessToast('Archived Official Deleted', 'The archived record has been permanently removed.');
    },
    onError: (error: Error) => {
      showErrorToast('Failed to Delete Archived Official', error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (officialIds: number[]) => {
      const res = await fetch(`${getBaseUrl()}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken}`
        },
        body: JSON.stringify({ officialIds }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to perform bulk delete');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mode === 'jumuiya' ? ['jumuiya_history'] : ['history'] });
      showSuccessToast('Archived Officials Deleted', 'The selected records have been permanently removed.');
    },
    onError: (error: Error) => {
      showErrorToast('Failed to Perform Bulk Delete', error.message);
    },
  });

  return {
    history: historyQuery.data?.data || [],
    meta: historyQuery.data?.meta,
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
    restoreOfficials: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    deleteArchived: deleteArchivedMutation.mutateAsync,
    isDeleting: deleteArchivedMutation.isPending,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    isBulkDeleting: bulkDeleteMutation.isPending,
  };
}
