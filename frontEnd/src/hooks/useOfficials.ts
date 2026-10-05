import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '../utils/officialsApi';
import { showSuccessToast, showErrorToast } from '../utils/customToast';
import { apiClient } from '../api/axiosInstance';
import apiService from '../services/api';

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
  reg_number?: string;
}

export function useOfficials() {
  const queryClient = useQueryClient();

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
      const res = await apiClient.post('/officials', formData);
      return res.data;
    },
    onMutate: async (formData: FormData) => {
      await queryClient.cancelQueries({ queryKey: ['officials'] });
      const previousOfficials = queryClient.getQueryData<Official[]>(['officials']) || [];

      const name = formData.get('name') as string | null;
      const category = formData.get('category') as string | null;
      const position = formData.get('position') as string | null;
      const contact = formData.get('contact') as string | null;
      const term_of_service = formData.get('term_of_service') as string | null;
      const status = formData.get('status') as string | null;
      const term_name = formData.get('term_name') as string | null;
      const term_year = formData.get('term_year') as string | null;
      const photoFile = formData.get('photo');

      let photoUrl: string | undefined = undefined;
      if (photoFile instanceof File && photoFile.size > 0) {
        photoUrl = URL.createObjectURL(photoFile);
      }

      const tempId = Date.now() * -1;
      const optimisticOfficial: Official = {
        id: tempId,
        name: name || '',
        category: category || '',
        position: position || '',
        contact: contact || '',
        term_of_service: term_of_service || '',
        status: status || 'active',
        term_name: term_name || '',
        term_year: term_year || '',
        photo: photoUrl,
      };

      queryClient.setQueryData<Official[]>(['officials'], [optimisticOfficial, ...previousOfficials]);

      return { previousOfficials, photoUrl };
    },
    onError: (error: Error, _formData, context) => {
      if (context?.previousOfficials) {
        queryClient.setQueryData(['officials'], context.previousOfficials);
      }
      if (context?.photoUrl) {
        URL.revokeObjectURL(context.photoUrl);
      }
      showErrorToast('Failed to Add Official', error.message);
    },
    onSuccess: (data: any, _formData, context) => {
      if (context?.photoUrl) {
        URL.revokeObjectURL(context.photoUrl);
      }
      apiService.clearOfficialsCache();
      queryClient.invalidateQueries({ queryKey: ['officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      if (data?.warning) {
        showErrorToast('Official Added — Role Not Assigned', data.warning);
      } else {
        showSuccessToast('Official Added Successfully', 'The official has been added to the database records.');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
    },
  });

  const updateOfficialMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const res = await apiClient.put(`/officials/${id}`, formData);
      return res.data;
    },
    onMutate: async ({ id, formData }: { id: number; formData: FormData }) => {
      await queryClient.cancelQueries({ queryKey: ['officials'] });
      const previousOfficials = queryClient.getQueryData<Official[]>(['officials']) || [];

      const name = formData.get('name') as string | null;
      const category = formData.get('category') as string | null;
      const position = formData.get('position') as string | null;
      const contact = formData.get('contact') as string | null;
      const term_of_service = formData.get('term_of_service') as string | null;
      const status = formData.get('status') as string | null;
      const term_name = formData.get('term_name') as string | null;
      const term_year = formData.get('term_year') as string | null;
      const photoFile = formData.get('photo');

      const existing = previousOfficials.find(o => o.id === id);
      let photoUrl = existing?.photo;
      let newPhotoUrlCreated = false;

      if (photoFile instanceof File && photoFile.size > 0) {
        photoUrl = URL.createObjectURL(photoFile);
        newPhotoUrlCreated = true;
      } else if (typeof photoFile === 'string') {
        photoUrl = photoFile;
      }

      const optimisticOfficial: Official = {
        id,
        name: name !== null ? name : (existing?.name || ''),
        category: category !== null ? category : (existing?.category || ''),
        position: position !== null ? position : (existing?.position || ''),
        contact: contact !== null ? contact : (existing?.contact || ''),
        term_of_service: term_of_service !== null ? term_of_service : (existing?.term_of_service || ''),
        status: status !== null ? status : (existing?.status || ''),
        term_name: term_name !== null ? term_name : (existing?.term_name || ''),
        term_year: term_year !== null ? term_year : (existing?.term_year || ''),
        photo: photoUrl,
      };

      queryClient.setQueryData<Official[]>(
        ['officials'],
        previousOfficials.map(o => o.id === id ? optimisticOfficial : o)
      );

      return { previousOfficials, photoUrl: newPhotoUrlCreated ? photoUrl : undefined };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousOfficials) {
        queryClient.setQueryData(['officials'], context.previousOfficials);
      }
      if (context?.photoUrl) {
        URL.revokeObjectURL(context.photoUrl);
      }
      showErrorToast('Failed to Update Official', error.message);
    },
    onSuccess: (data: any, _variables, context) => {
      if (context?.photoUrl) {
        URL.revokeObjectURL(context.photoUrl);
      }
      apiService.clearOfficialsCache();
      queryClient.invalidateQueries({ queryKey: ['officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      if (data?.warning) {
        showErrorToast('Official Updated — Role Not Assigned', data.warning);
      } else {
        showSuccessToast('Official Updated Successfully', 'The official details have been updated.');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });

  const deleteOfficialMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.delete(`/officials/${id}`);
      return res.data;
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['officials'] });
      const previousOfficials = queryClient.getQueryData<Official[]>(['officials']) || [];

      queryClient.setQueryData<Official[]>(
        ['officials'],
        previousOfficials.filter(o => o.id !== id)
      );

      return { previousOfficials };
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousOfficials) {
        queryClient.setQueryData(['officials'], context.previousOfficials);
      }
      showErrorToast('Failed to Delete Official', error.message);
    },
    onSuccess: () => {
      apiService.clearOfficialsCache();
      queryClient.invalidateQueries({ queryKey: ['officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      showSuccessToast('Official Deleted Successfully', 'The official record has been removed.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });

  const archiveOfficialsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/officials/archive', data);
      return res.data;
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
