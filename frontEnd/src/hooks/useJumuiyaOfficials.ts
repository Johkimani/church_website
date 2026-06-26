import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_JUMUIYA_BASE } from '../utils/officialsApi';
import { showSuccessToast, showErrorToast } from '../utils/customToast';
import { useAuth } from '../context/AuthContext';
import apiService from '../pages/Landing/services/api';

export interface JumuiyaOfficial {
  id: number;
  name: string;
  category: string;
  position: string;
  contact?: string;
  photo?: string;
  term_of_service?: string;
  status?: string;
}

export function useJumuiyaOfficials(filters: { termId?: number | string; category?: string } = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { termId, category } = filters;

  const officialsQuery = useQuery({
    queryKey: ['jumuiya-officials', termId, category],
    queryFn: async () => {
      let url = `${API_JUMUIYA_BASE}/list`;
      const queryParams = new URLSearchParams();
      if (termId) queryParams.append('term_id', String(termId));
      if (category) queryParams.append('category', category);
      
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch Jumuiya officials');
      const json = await res.json();
      return json.data as JumuiyaOfficial[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(API_JUMUIYA_BASE, { 
        method: 'POST', 
        body: formData,
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to add Jumuiya official');
      }
      return res.json();
    },
    onMutate: async (formData: FormData) => {
      await queryClient.cancelQueries({ queryKey: ['jumuiya-officials'] });

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
      const optimisticOfficial: JumuiyaOfficial = {
        id: tempId,
        name: name || '',
        category: category || '',
        position: position || '',
        contact: contact || '',
        term_of_service: term_of_service || '',
        status: status || 'active',
        photo: photoUrl,
      };

      const queries = queryClient.getQueryCache().findAll({ queryKey: ['jumuiya-officials'] });
      const snapshots = queries.map(query => ({
        queryKey: query.queryKey,
        data: query.state.data as JumuiyaOfficial[] | undefined
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
      showErrorToast('Failed to Add Jumuiya Official', error.message);
    },
    onSuccess: (data, formData, context) => {
      if (context?.photoUrl) {
        URL.revokeObjectURL(context.photoUrl);
      }
      apiService.clearAllCache();
      queryClient.invalidateQueries({ queryKey: ['jumuiya-officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      showSuccessToast('Jumuiya Official Added Successfully', 'The Jumuiya official has been registered.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jumuiya-officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const res = await fetch(`${API_JUMUIYA_BASE}/${id}`, { 
        method: 'PUT', 
        body: formData,
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to update Jumuiya official');
      }
      return res.json();
    },
    onMutate: async ({ id, formData }: { id: number; formData: FormData }) => {
      await queryClient.cancelQueries({ queryKey: ['jumuiya-officials'] });

      const name = formData.get('name') as string | null;
      const category = formData.get('category') as string | null;
      const position = formData.get('position') as string | null;
      const contact = formData.get('contact') as string | null;
      const term_of_service = formData.get('term_of_service') as string | null;
      const status = formData.get('status') as string | null;
      const photoFile = formData.get('photo');

      const queries = queryClient.getQueryCache().findAll({ queryKey: ['jumuiya-officials'] });
      const snapshots = queries.map(query => ({
        queryKey: query.queryKey,
        data: query.state.data as JumuiyaOfficial[] | undefined
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

        const optimisticOfficial: JumuiyaOfficial = {
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
      showErrorToast('Failed to Update Jumuiya Official', error.message);
    },
    onSuccess: (data, variables, context) => {
      if (context?.photoUrl) {
        URL.revokeObjectURL(context.photoUrl);
      }
      apiService.clearAllCache();
      queryClient.invalidateQueries({ queryKey: ['jumuiya-officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      showSuccessToast('Jumuiya Official Updated Successfully', 'The Jumuiya official details have been updated.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jumuiya-officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_JUMUIYA_BASE}/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Failed to delete Jumuiya official');
      }
      return res.json();
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ['jumuiya-officials'] });

      const queries = queryClient.getQueryCache().findAll({ queryKey: ['jumuiya-officials'] });
      const snapshots = queries.map(query => ({
        queryKey: query.queryKey,
        data: query.state.data as JumuiyaOfficial[] | undefined
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
      showErrorToast('Failed to Delete Jumuiya Official', error.message);
    },
    onSuccess: () => {
      apiService.clearAllCache();
      queryClient.invalidateQueries({ queryKey: ['jumuiya-officials'] });
      queryClient.invalidateQueries({ queryKey: ['currentTerm'] });
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      showSuccessToast('Jumuiya Official Deleted Successfully', 'The Jumuiya official record has been removed.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jumuiya-officials'] });
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
