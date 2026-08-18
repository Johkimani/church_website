import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash } from 'react-icons/fa';
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

      <div className="admin-form">
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Notification title"
          />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            placeholder="Notification content..."
          />
        </div>
        <button
          className="btn-premium primary"
          onClick={() => createMutation.mutate()}
          disabled={!title || !content || createMutation.isPending}
        >
          <FaPlus /> Create Notification
        </button>
      </div>
    </div>
  );
};

export default CommunityAdminNotifications;
