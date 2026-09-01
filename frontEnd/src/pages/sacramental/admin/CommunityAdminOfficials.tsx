import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaSave, FaUserTie, FaPhone, FaEnvelope } from 'react-icons/fa';
import '../../Jumuiya/admin/Admin.css';

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

      <div className="add-official-form bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <FaUserTie style={{ color }} /> Add New Official
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="Full Name"
            value={newOfficial.name}
            onChange={e => setNewOfficial({ ...newOfficial, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
          />
          <input
            placeholder="Position / Role"
            value={newOfficial.position}
            onChange={e => setNewOfficial({ ...newOfficial, position: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
          />
          <input
            placeholder="Phone Number"
            value={newOfficial.phone}
            onChange={e => setNewOfficial({ ...newOfficial, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
          />
          <input
            placeholder="Email (optional)"
            value={newOfficial.email}
            onChange={e => setNewOfficial({ ...newOfficial, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
          />
        </div>
        <button
          onClick={() => addMutation.mutate()}
          disabled={!newOfficial.name || addMutation.isPending}
          className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{ background: color }}
        >
          <FaPlus size={14} /> {addMutation.isPending ? 'Adding...' : 'Add Official'}
        </button>
      </div>

      <div className="space-y-3">
        {officials.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <FaUserTie size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-400">No officials added yet.</p>
          </div>
        ) : (
          officials.map((off: any) => (
            <div
              key={off.id}
              className="flex items-center gap-3 sm:gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
              >
                {(off.name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="text-sm font-bold text-slate-800 truncate">{off.name}</strong>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md" style={{ background: `${color}12`, color }}>
                    {off.position}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {off.phone && (
                    <a href={`tel:${off.phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
                      <FaPhone size={10} /> {off.phone}
                    </a>
                  )}
                  {off.email && (
                    <a href={`mailto:${off.email}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 truncate">
                      <FaEnvelope size={10} /> <span className="truncate">{off.email}</span>
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.confirm(`Remove ${off.name}?`)) {
                    deleteMutation.mutate(off.id);
                  }
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 transition-all cursor-pointer shrink-0"
              >
                <FaTrash size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunityAdminOfficials;
