import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import '../../Jumuiya/admin/AdminRegisteredMembers.css';

interface Props {
  color: string;
}

const CommunityAdminMembers: React.FC<Props> = ({ color }) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['community-admin-members', moduleId],
    queryFn: async () => {
      const res = await apiClient.get('/enrollments');
      return Array.isArray(res.data)
        ? res.data.filter((e: any) => e.class_id === moduleId || e.module_id === moduleId)
        : [];
    },
    enabled: !!moduleId,
    staleTime: 300000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiClient.put(`/enrollments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-admin-members', moduleId] });
      toast.success('Status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/enrollments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-admin-members', moduleId] });
      toast.success('Member removed');
    },
  });

  return (
    <div className="admin-members">
      <h2 className="admin-section-title">Registered Members ({members.length})</h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full" />
        </div>
      ) : members.length > 0 ? (
        <div className="members-table">
          <div className="table-header">
            <span>Name</span>
            <span>Phone</span>
            <span>Email</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {members.map((m: any) => (
            <div key={m.id} className="table-row">
              <span className="font-semibold">{m.fullName || m.full_name}</span>
              <span>{m.phoneNumber || m.phone || '-'}</span>
              <span>{m.email || '-'}</span>
              <span className={`status-badge ${m.status?.toLowerCase() || 'pending'}`}>{m.status || 'Pending'}</span>
              <span className="actions">
                <button className="action-btn approve" onClick={() => updateStatusMutation.mutate({ id: m.id, status: 'Approved' })}>
                  <FaCheck />
                </button>
                <button className="action-btn reject" onClick={() => updateStatusMutation.mutate({ id: m.id, status: 'Rejected' })}>
                  <FaTimes />
                </button>
                <button className="action-btn delete" onClick={() => deleteMutation.mutate(m.id)}>
                  <FaTrash />
                </button>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state py-12 text-center text-gray-400">
          <p>No registered members yet.</p>
        </div>
      )}
    </div>
  );
};

export default CommunityAdminMembers;
