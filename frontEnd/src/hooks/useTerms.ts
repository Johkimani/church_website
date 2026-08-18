import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_TERMS, API_ARCHIVE, API_JUMUIYA_ARCHIVE, API_GROUP_ARCHIVE } from '../utils/officialsApi';
import { showSuccessToast, showErrorToast } from '../utils/customToast';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export interface ElectionTerm {
  id: number;
  name: string;
  year: string;
  start_date: string;
  end_date?: string;
  description?: string;
  is_current: boolean;
  created_at?: string;
  archived_csa_count?: string | number;
  archived_jumuiya_count?: string | number;
  archived_group_count?: string | number;
}

export function useTerms() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const termsQuery = useQuery({
    queryKey: ['terms'],
    queryFn: async () => {
      const res = await fetch(API_TERMS);
      if (!res.ok) throw new Error('Failed to fetch terms');
      const json = await res.json();
      return json.data as ElectionTerm[];
    },
  });

  const currentTermQuery = useQuery({
    queryKey: ['currentTerm'],
    queryFn: async () => {
      const res = await fetch(`${API_TERMS}/current`);
      if (!res.ok) throw new Error('Failed to fetch current term');
      const json = await res.json();
      return json.data as ElectionTerm | null;
    },
  });

  const createTermMutation = useMutation({
    mutationFn: async (termData: Partial<ElectionTerm> & { set_as_current?: boolean }) => {
      const res = await fetch(API_TERMS, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken}`
        },
        body: JSON.stringify(termData),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to create term');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      showSuccessToast('Election Term Created', 'New election term has been initialized.');
    },
    onError: (error: Error) => {
      showErrorToast('Failed to Create Term', error.message);
    },
  });

  const archiveOfficialsMutation = useMutation({
    mutationFn: async (payload: any & { isJumuiya?: boolean; isGroup?: boolean }) => {
      const url = payload.isGroup ? API_GROUP_ARCHIVE : (payload.isJumuiya ? API_JUMUIYA_ARCHIVE : API_ARCHIVE);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken}`
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to archive officials');
      return json;
    },
    onMutate: async (variables) => {
      const targetQueryKey = variables.isGroup ? ['group-officials'] : (variables.isJumuiya ? ['jumuiya-officials'] : ['officials']);
      
      // Cancel outgoing refetches to prevent them overwriting our optimistic state
      await queryClient.cancelQueries({ queryKey: targetQueryKey });
      
      // Snapshot the current officials list
      const snapshots = queryClient.getQueryCache().findAll({ queryKey: targetQueryKey }).map(query => ({
        queryKey: query.queryKey,
        data: query.state.data as unknown
      }));

      // Optimistically clear every matching active list immediately
      snapshots.forEach(snapshot => {
        queryClient.setQueryData(snapshot.queryKey, []);
      });

      // Instantly clear client-side localStorage persist caches
      apiService.clearOfficialsCache();
      
      return { snapshots };
    },
    onSuccess: (json, variables) => {
      const activeKey = variables.isGroup ? ['group-officials'] : (variables.isJumuiya ? ['jumuiya-officials'] : ['officials']);
      const historyKey = variables.isGroup ? ['group_history'] : (variables.isJumuiya ? ['jumuiya_history'] : ['history']);
      queryClient.invalidateQueries({ queryKey: activeKey });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: historyKey });
      showSuccessToast('Officials Archived Successfully', `${json.data?.archived_count || 'Officials'} records have been successfully archived.`);
    },
    onError: (error: Error, _variables, context) => {
      // Rollback to original state if mutation fails
      if (context?.snapshots) {
        context.snapshots.forEach(snapshot => {
          queryClient.setQueryData(snapshot.queryKey, snapshot.data);
        });
      }
      showErrorToast('Failed to Archive Officials', error.message);
    },
  });

  return {
    terms: termsQuery.data || [],
    isLoadingTerms: termsQuery.isLoading,
    currentTerm: currentTermQuery.data || null,
    isLoadingCurrentTerm: currentTermQuery.isLoading,
    createTerm: createTermMutation.mutateAsync,
    isCreatingTerm: createTermMutation.isPending,
    archiveOfficials: archiveOfficialsMutation.mutateAsync,
    isArchiving: archiveOfficialsMutation.isPending,
  };
}
