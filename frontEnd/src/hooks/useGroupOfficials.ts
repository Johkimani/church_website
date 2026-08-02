import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_GROUP_BASE } from '../utils/officialsApi';
import { showSuccessToast, showErrorToast } from '../utils/customToast';
import { apiClient } from '../api/axiosInstance';
import apiService from '../pages/Landing/services/api';

export interface GroupOfficial {
  id: number;
  name: string;
  category: string;
  position: string;
  contact?: string;
  photo?: string;
  term_of_service?: string;
  status?: string;
  reg_number?: string;
  term_name?: string;
  term_year?: string;
}

export function useGroupOfficials(filters: { termId?: number | string; category?: string } = {}) {
  const queryClient = useQueryClient();
  const { termId, category } = filters;

  const officialsQuery = useQuery({
    queryKey: ['group-officials', termId, category],
    queryFn: async () => {
      let url = `${API_GROUP_BASE}/list`;
      const queryParams = new URLSearchParams();
      if (termId) queryParams.append('term_id', String(termId));
      if (category) queryParams.append('category', category);
      
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch Group officials');
      const json = await res.json();
      return json.data as GroupOfficial[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiClient.post('/group-officials', formData);
      return res.data;
    },
    onMutate: async (formData: FormData) => {
      await queryClient.cancelQueries({ queryKey: ['group-officials'] });

      const name = formData.get('name') as string | null;
      const category = formData.get('category') as string | null;
      const position = formData.get('position') as string | null;
      const contact = formData.get('contact') as string | null;
      const term_of_service = formData.get('term_of_service') as string | null;
      const status = formData.get('status') as string | null;
      const photoFile = formData.get('photo');

      let photoUrl: string | undefined = undefined;
      if (photoFile instanceof File && photoFile.size > 0) {
        photoUrl = URL.createObjectURL(photoFile);
      }

      const tempId = Date.now() * -1;
      const optimisticOfficial: GroupOfficial = {
        id: tempId,
        name: name || '',
        category: category || '',
        position: position || '',
        contact: contact || '',
        term_of_service: term_of_service || '',
        status: status || 'active',
        photo: photoUrl,
      };

      const queries = queryClient.getQueryCache().findAll({ queryKey: ['group-officials'] });
      const snapshots = queries.map(query => ({
        queryKey: query.queryKey,
        data: query.state.data as GroupOfficial[] | undefined
      }));

      snapshots.forEach(snapshot => {
        if (!snapshot.data) return;
        const queryCategory = snapshot.queryKey[2] as string | undefined;
        if (queryCategory && queryCategory !== optimisticOfficial.category) {
          return;
        }
        queryClient.setQueryData(snapshot.queryKey, [optimisticOfficial, ...snapshot.data]);
      });

      return { snapshots, photoUrl };
    },
    onError: (error: Error, formData, context) => {
      if (context?.snapshots) {
        context.snapshots.forEach(snapshot => {
          queryClient.setQueryData(snapshot.queryKey, snapshot.data);
        });
      }
      if (context?.photoUrl) {
        URL.revokeObjectURL(context.photoUrl);
      }
      showErrorToast('Failed to Add Group Official', error.message);
    },
    onSuccess: (data, formData, context) => {
      if (context?.photoUrl) {
        URL.revokeObjectURL(context.photoUrl);
      }
      apiService.clearAllCache();
      queryClient.invalidateQueries({ queryKey: ['group-officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      showSuccessToast('Group Official Added Successfully', 'The Group official has been registered.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['group-officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const res = await apiClient.put(`/group-officials/${id}`, formData);
      return res.data;
    },
    onMutate: async ({ id, formData }: { id: number; formData: FormData }) => {
      await queryClient.cancelQueries({ queryKey: ['group-officials'] });

      const name = formData.get('name') as string | null;
      const category = formData.get('category') as string | null;
      const position = formData.get('position') as string | null;
      const contact = formData.get('contact') as string | null;
      const term_of_service = formData.get('term_of_service') as string | null;
      const status = formData.get('status') as string | null;
      const photoFile = formData.get('photo');

      const queries = queryClient.getQueryCache().findAll({ queryKey: ['group-officials'] });
      const snapshots = queries.map(query => ({
        queryKey: query.queryKey,
        data: query.state.data as GroupOfficial[] | undefined
      }));

      let photoUrl: string | undefined = undefined;
      let newPhotoUrlCreated = false;
      if (photoFile instanceof File && photoFile.size > 0) {
        photoUrl = URL.createObjectURL(photoFile);
        newPhotoUrlCreated = true;
      } else if (typeof photoFile === 'string') {
        photoUrl = photoFile;
      }

      snapshots.forEach(snapshot => {
        if (!snapshot.data) return;

        const existing = snapshot.data.find(o => o.id === id);
        if (!existing) return;

        const optimisticOfficial: GroupOfficial = {
          id,
          name: name !== null ? name : (existing.name || ''),
          category: category !== null ? category : (existing.category || ''),
          position: position !== null ? position : (existing.position || ''),
          contact: contact !== null ? contact : (existing.contact || ''),
          term_of_service: term_of_service !== null ? term_of_service : (existing.term_of_service || ''),
          status: status !== null ? status : (existing.status || ''),
          photo: newPhotoUrlCreated ? photoUrl : (photoUrl || existing.photo),
        };

        const updatedData = snapshot.data.map(o => o.id === id ? optimisticOfficial : o);
        const queryCategory = snapshot.queryKey[2] as string | undefined;
        let finalData = updatedData;
        if (queryCategory && optimisticOfficial.category !== queryCategory) {
          finalData = updatedData.filter(o => o.id !== id);
        }

        queryClient.setQueryData(snapshot.queryKey, finalData);
      });

      return { snapshots, photoUrl: newPhotoUrlCreated ? photoUrl : undefined };
    },
    onError: (error: Error, variables, context) => {
      if (context?.snapshots) {
        context.snapshots.forEach(snapshot => {
          queryClient.setQueryData(snapshot.queryKey, snapshot.data);
        });
      }
      if (context?.photoUrl) {
        URL.revokeObjectURL(context.photoUrl);
      }
      showErrorToast('Failed to Update Group Official', error.message);
    },
    onSuccess: (data, variables, context) => {
      if (context?.photoUrl) {
        URL.revokeObjectURL(context.photoUrl);
      }
      apiService.clearAllCache();
      queryClient.invalidateQueries({ queryKey: ['group-officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      showSuccessToast('Group Official Updated Successfully', 'The Group official details have been updated.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['group-officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.delete(`/group-officials/${id}`);
      return res.data;
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['group-officials'] });

      const queries = queryClient.getQueryCache().findAll({ queryKey: ['group-officials'] });
      const snapshots = queries.map(query => ({
        queryKey: query.queryKey,
        data: query.state.data as GroupOfficial[] | undefined
      }));

      snapshots.forEach(snapshot => {
        if (!snapshot.data) return;
        queryClient.setQueryData(
          snapshot.queryKey,
          snapshot.data.filter(o => o.id !== id)
        );
      });

      return { snapshots };
    },
    onError: (error: Error, id, context) => {
      if (context?.snapshots) {
        context.snapshots.forEach(snapshot => {
          queryClient.setQueryData(snapshot.queryKey, snapshot.data);
        });
      }
      showErrorToast('Failed to Delete Group Official', error.message);
    },
    onSuccess: () => {
      apiService.clearAllCache();
      queryClient.invalidateQueries({ queryKey: ['group-officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      showSuccessToast('Group Official Deleted Successfully', 'The Group official record has been removed.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['group-officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });

  return {
    officials: officialsQuery.data || [],
    isLoading: officialsQuery.isLoading,
    isError: officialsQuery.isError,
    error: officialsQuery.error,
    refetch: officialsQuery.refetch,
    addOfficial: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    updateOfficial: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteOfficial: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
