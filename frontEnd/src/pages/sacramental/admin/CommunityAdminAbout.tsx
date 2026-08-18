import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaSave } from 'react-icons/fa';
import '../../Jumuiya/admin/AdminAbout.css';

interface Props {
  color: string;
}

const CommunityAdminAbout: React.FC<Props> = ({ color }) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState('');
  const [about, setAbout] = useState('');
  const [loaded, setLoaded] = useState(false);

  const { data } = useQuery({
    queryKey: ['community-admin-about', moduleId],
    queryFn: async () => {
      const res = await apiClient.get(`/community-view/${moduleId}`);
      return res.data;
    },
    enabled: !!moduleId,
  });

  React.useEffect(() => {
    if (data && !loaded) {
      setDescription(data.description || '');
      setAbout(data.story || data.about || '');
      setLoaded(true);
    }
  }, [data, loaded]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.put(`/hub_modules/${moduleId}`, { description, about });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-admin-about', moduleId] });
      toast.success('About updated!');
    },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <div className="admin-about">
      <h2 className="admin-section-title">About Content</h2>
      <div className="admin-form">
        <div className="form-group">
          <label>Short Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief description of this ministry"
          />
        </div>
        <div className="form-group">
          <label>Full Story / About</label>
          <textarea
            value={about}
            onChange={e => setAbout(e.target.value)}
            rows={8}
            placeholder="Detailed about text..."
          />
        </div>
        <button
          className="btn-premium primary"
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
        >
          <FaSave /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default CommunityAdminAbout;
