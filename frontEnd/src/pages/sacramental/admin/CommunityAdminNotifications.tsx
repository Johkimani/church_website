import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaBell } from 'react-icons/fa';
import '../../Jumuiya/admin/Admin.css';

interface Props {
  color: string;
}

const CommunityAdminNotifications: React.FC<Props> = ({ color }) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.post('/hub_announcements', {
        module_id: moduleId,
        title,
        content,
        announcement_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', moduleId] });
      toast.success('Notification created!');
      setTitle('');
      setContent('');
    },
    onError: () => toast.error('Failed to create'),
  });

  return (
    <div className="admin-notifications">
      <h2 className="admin-section-title">Create Notification</h2>

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}12` }}
          >
            <FaBell style={{ color }} size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">New Announcement</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Send to all community members</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="form-group">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Notification title"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
            />
          </div>
          <div className="form-group">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              placeholder="Write your announcement here..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all resize-none"
            />
          </div>
          <button
            onClick={() => createMutation.mutate()}
            disabled={!title || !content || createMutation.isPending}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: color }}
          >
            <FaPlus size={14} /> {createMutation.isPending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityAdminNotifications;
