import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '../utils/officialsApi';
import { showSuccessToast, showErrorToast } from '../utils/customToast';

import { useAuth } from '../context/AuthContext';
import apiService from '../pages/Landing/services/api';

export interface Official {
  id: number;
  name: string;
  category: string;
  position: string;
  contact?: string;
  photo?: string;
  term_of_service?: string;
  status?: string;
  term_name?: string;
  term_year?: string;
}

export function useOfficials() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const officialsQuery = useQuery({
    queryKey: ['officials'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/list`);
      if (!res.ok) throw new Error('Failed to fetch officials');
      const json = await res.json();
      return json.data as Official[];
    },
  });

  const addOfficialMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(API_BASE, { 
        method: 'POST', 
        body: formData,
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to add official');
      }
      return res.json();
    },
    onSuccess: () => {
      apiService.clearOfficialsCache();
      queryClient.invalidateQueries({ queryKey: ['officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      showSuccessToast('Official Added Successfully', 'The official has been added to the database records.');
    },
    onError: (error: Error) => {
      showErrorToast('Failed to Add Official', error.message);
    },
  });

  const updateOfficialMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const res = await fetch(`${API_BASE}/${id}`, { 
        method: 'PUT', 
        body: formData,
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to update official');
      }
      return res.json();
    },
    onSuccess: () => {
      apiService.clearOfficialsCache();
      queryClient.invalidateQueries({ queryKey: ['officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      showSuccessToast('Official Updated Successfully', 'The official details have been updated.');
    },
    onError: (error: Error) => {
      showErrorToast('Failed to Update Official', error.message);
    },
  });

  const deleteOfficialMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to delete official');
      }
      return res.json();
    },
    onSuccess: () => {
      apiService.clearOfficialsCache();
      queryClient.invalidateQueries({ queryKey: ['officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      showSuccessToast('Official Deleted Successfully', 'The official record has been removed.');
    },
    onError: (error: Error) => {
      showErrorToast('Failed to Delete Official', error.message);
    },
  });

  const archiveOfficialsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/archive`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken}`
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to archive officials');
      }
      return res.json();
    },
    onSuccess: () => {
      apiService.clearOfficialsCache();
      queryClient.invalidateQueries({ queryKey: ['officials'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      showSuccessToast('Officials Archived Successfully', 'The current term officials have been archived.');
    },
    onError: (error: Error) => {
      showErrorToast('Failed to Archive Officials', error.message);
    },
  });

  return {
    officials: officialsQuery.data || [],
    isLoading: officialsQuery.isLoading,
    isError: officialsQuery.isError,
    error: officialsQuery.error,
    addOfficial: addOfficialMutation.mutateAsync,
    isAdding: addOfficialMutation.isPending,
    updateOfficial: updateOfficialMutation.mutateAsync,
    isUpdating: updateOfficialMutation.isPending,
    deleteOfficial: deleteOfficialMutation.mutateAsync,
    isDeleting: deleteOfficialMutation.isPending,
    archiveOfficials: archiveOfficialsMutation.mutateAsync,
    isArchiving: archiveOfficialsMutation.isPending,
  };
}
