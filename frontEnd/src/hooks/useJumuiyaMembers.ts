import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api/jumuiya-members';

export interface JumuiyaMember {
  id: string;
  jumuiya_id: string;
  name: string;
  year?: string;
  phone?: string;
  email?: string;
  is_registered: boolean;
  is_current_jumuiya: boolean;
  joined_at?: string;
}

export interface UnregisteredMember {
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  year_of_study?: string;
}

export type MemberFormData = Omit<JumuiyaMember, 'id' | 'joined_at'>;

interface UseJumuiyaMembersOptions {
  jumuiya_id?: string;
}

export const useJumuiyaMembers = ({ jumuiya_id }: UseJumuiyaMembersOptions = {}) => {
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
      const url = jumuiya_id
        ? `${API_BASE}?jumuiya_id=${encodeURIComponent(jumuiya_id)}`
        : API_BASE;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setMembers(json.data);
      else setError(json.error || 'Failed to load members');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [jumuiya_id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // --- Fetch unregistered members (not yet in any Jumuiya) ---
  const fetchUnregistered = async (): Promise<UnregisteredMember[]> => {
    const res = await fetch(`${API_BASE}/unregistered`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load unregistered members');
    return json.data;
  };

  // --- Add a single member manually ---
  const addMember = async (data: MemberFormData) => {
    setIsAdding(true);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
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
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
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
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to delete member');
      setMembers(prev => prev.filter(m => m.id !== id));
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Bulk-join: assign multiple members to this jumuiya ---
  const bulkJoin = async (member_ids: string[], target_jumuiya_id: string): Promise<number> => {
    setIsBulkJoining(true);
    try {
      const res = await fetch(`${API_BASE}/bulk-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_ids, jumuiya_id: target_jumuiya_id }),
      });
      const json = await res.json();
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
    bulkJoin,
    fetchUnregistered,
    refetch: fetchMembers,
  };
};
