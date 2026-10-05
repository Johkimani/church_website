import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/axiosInstance';

const API_BASE = '/jumuiya-members';

export interface JumuiyaMember {
  id: string;
  jumuiya_id: string;
  jumuiya_name?: string;
  first_name?: string;
  last_name?: string;
  name: string;
  year_of_study?: string;
  year?: string;
  phone?: string;
  email?: string;
  is_registered: boolean;
  is_current_jumuiya: boolean;
  sem_1_reg: boolean;
  sem_2_reg: boolean;
  sem_3_reg: boolean;
  sem_4_reg: boolean;
  sem_5_reg: boolean;
  sem_6_reg: boolean;
  sem_7_reg: boolean;
  sem_8_reg: boolean;
  joined_at?: string;
}

export interface UnregisteredMember {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  year_of_study?: string;
  jumuiya_id?: string;
}

export type MemberFormData = Omit<JumuiyaMember, 'id' | 'joined_at'>;

interface UseJumuiyaMembersOptions {
  jumuiya_id?: string;
  type?: 'all' | 'registered';
}

export const useJumuiyaMembers = ({ jumuiya_id, type = 'all' }: UseJumuiyaMembersOptions = {}) => {
  const [members, setMembers] = useState<JumuiyaMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkJoining, setIsBulkJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch registered members for a jumuiya ---
  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = API_BASE;
      if (type === 'registered') {
        url += '/registered';
      }

      if (jumuiya_id) {
        url += `?jumuiya_id=${encodeURIComponent(jumuiya_id)}`;
      }

      const res = await apiClient.get(url);
      const json = res.data;
      if (json.success) setMembers(json.data);
      else setError(json.error || 'Failed to load members');
    } catch (e: any) {
      setError(e?.message || 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  }, [jumuiya_id, type]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // --- Fetch unregistered members (targeted for this Jumuiya if provided) ---
  const fetchUnregistered = async (): Promise<UnregisteredMember[]> => {
    let url = `${API_BASE}/unregistered`;
    if (jumuiya_id) {
      url += `?jumuiya_id=${encodeURIComponent(jumuiya_id)}`;
    }
    const res = await apiClient.get(url);
    const json = res.data;
    if (!json.success) throw new Error(json.error || 'Failed to load unregistered members');
    return json.data;
  };

  // --- Add a single member manually ---
  const addMember = async (data: MemberFormData) => {
    setIsAdding(true);
    try {
      const res = await apiClient.post(API_BASE, data);
      const json = res.data;
      if (!json.success) throw new Error(json.message || 'Failed to add member');
      setMembers(prev => [...prev, json.data]);
      return json.data;
    } finally {
      setIsAdding(false);
    }
  };

  // --- Update a member ---
  const updateMember = async (id: string, data: Partial<MemberFormData>) => {
    setIsUpdating(true);
    try {
      const res = await apiClient.put(API_BASE, data, { params: { id } });
      const json = res.data;
      if (!json.success) throw new Error(json.message || 'Failed to update member');
      setMembers(prev => prev.map(m => m.id === id ? json.data : m));
      return json.data;
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Delete a member ---
  const deleteMember = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await apiClient.delete(API_BASE, { params: { id } });
      const json = res.data;
      if (!json.success) throw new Error(json.message || 'Failed to delete member');
      setMembers(prev => prev.filter(m => m.id !== id));
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Unregister a member (removes from community but keeps in DB) ---
  const unregisterMember = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await apiClient.delete(`${API_BASE}/unregister`, { params: { id } });
      const json = res.data;
      if (!json.success) throw new Error(json.message || 'Failed to unregister member');
      // Update local state: if we're in 'all' view, we might want to just update the jumuiya_id
      // For now, we'll refetch to be safe since it affects multiple tables
      await fetchMembers();
    } finally {
      setIsDeleting(false);
    }
  };


  // --- Bulk-join: assign multiple members to this jumuiya ---
  const bulkJoin = async (member_ids: string[], target_jumuiya_id: string): Promise<number> => {
    setIsBulkJoining(true);
    try {
      const res = await apiClient.post(`${API_BASE}/bulk-join`, {
        member_ids, jumuiya_id: target_jumuiya_id,
      });
      const json = res.data;
      if (!json.success) throw new Error(json.message || 'Failed to register members');
      // Refresh the members list so the newly added show up
      await fetchMembers();
      return json.count as number;
    } finally {
      setIsBulkJoining(false);
    }
  };

  return {
    members,
    isLoading,
    isAdding,
    isUpdating,
    isDeleting,
    isBulkJoining,
    error,
    addMember,
    updateMember,
    deleteMember,
    unregisterMember,
    bulkJoin,
    fetchUnregistered,
    refetch: fetchMembers,
  };
};
