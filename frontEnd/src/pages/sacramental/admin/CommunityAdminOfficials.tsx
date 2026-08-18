import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import '../../Jumuiya/admin/AdminOfficials.css';

interface Props {
  color: string;
}

const CommunityAdminOfficials: React.FC<Props> = ({ color }) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const queryClient = useQueryClient();

  const { data: officials = [] } = useQuery({
    queryKey: ['community-officials', moduleId],
    queryFn: async () => {
      const res = await apiClient.get(`/community-view/${moduleId}`);
      return res.data?.officials || [];
    },
    enabled: !!moduleId,
  });

  const [newOfficial, setNewOfficial] = useState({ name: '', position: '', phone: '', email: '' });

  const addMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.post(`/community-officials`, {
        module_id: moduleId,
        ...newOfficial,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-officials', moduleId] });
      toast.success('Official added!');
      setNewOfficial({ name: '', position: '', phone: '', email: '' });
    },
    onError: () => toast.error('Failed to add'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/community-officials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-officials', moduleId] });
      toast.success('Official removed');
    },
    onError: () => toast.error('Failed to remove'),
  });

  return (
    <div className="admin-officials">
      <h2 className="admin-section-title">Manage Officials</h2>

      <div className="add-official-form">
        <div className="form-row">
          <input placeholder="Name" value={newOfficial.name} onChange={e => setNewOfficial({ ...newOfficial, name: e.target.value })} />
          <input placeholder="Position" value={newOfficial.position} onChange={e => setNewOfficial({ ...newOfficial, position: e.target.value })} />
          <input placeholder="Phone" value={newOfficial.phone} onChange={e => setNewOfficial({ ...newOfficial, phone: e.target.value })} />
          <input placeholder="Email" value={newOfficial.email} onChange={e => setNewOfficial({ ...newOfficial, email: e.target.value })} />
        </div>
        <button className="btn-premium primary" onClick={() => addMutation.mutate()} disabled={!newOfficial.name || addMutation.isPending}>
          <FaPlus /> Add Official
        </button>
      </div>

      <div className="officials-list">
        {officials.map((off: any) => (
          <div key={off.id} className="official-item">
            <div className="official-item-info">
              <strong>{off.name}</strong>
              <span className="position-badge" style={{ background: `${color}15`, color }}>{off.position}</span>
              {off.phone && <span className="text-gray-500 text-sm">{off.phone}</span>}
            </div>
            <button className="delete-btn" onClick={() => deleteMutation.mutate(off.id)}>
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityAdminOfficials;
