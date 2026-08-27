import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaSave, FaImage, FaCalendarAlt, FaMapMarkerAlt, FaAlignLeft } from 'react-icons/fa';
import '../../Jumuiya/admin/Admin.css';

interface Props {
  color: string;
}

const CommunityAdminAbout: React.FC<Props> = ({ color }) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const queryClient = useQueryClient();
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({
    description: '',
    story: '',
    image: '',
    schedule_label: '',
    training_time: '',
    location: '',
  });

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
      setForm({
        description: data.description || '',
        story: data.story || data.about || '',
        image: data.saint_image_url || data.image || '',
        schedule_label: data.scheduleLabel || data.schedule_label || '',
        training_time: data.training_time || data.meetingSchedule || '',
        location: data.location || '',
      });
      setLoaded(true);
    }
  }, [data, loaded]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.put(`/hub_modules/${moduleId}`, {
        description: form.description,
        story: form.story,
        saint_image_url: form.image,
        schedule_label: form.schedule_label,
        training_time: form.training_time,
        location: form.location,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-admin-about', moduleId] });
      queryClient.invalidateQueries({ queryKey: ['community-view', moduleId] });
      toast.success('Home page content updated!');
    },
    onError: () => toast.error('Failed to update'),
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div style={{ maxWidth: '720px' }}>
      <h2 className="admin-section-title">Home Page / About</h2>
      <p className="admin-hint" style={{ color: '#64748b', fontSize: '13px', marginTop: '-6px', marginBottom: '16px' }}>
        This content appears on the public community home page. All fields below are shown to visitors.
      </p>

      <div className="admin-form">
        <div className="form-group">
          <label><FaAlignLeft style={{ marginRight: 6 }} /> Tagline (short description under the title)</label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            placeholder="One-line invitation shown at the top of the page" />
        </div>

        <div className="form-group">
          <label><FaAlignLeft style={{ marginRight: 6 }} /> Full Story / About</label>
          <textarea value={form.story} onChange={set('story')} rows={8}
            placeholder="Detailed story of this ministry — shown in the 'Our story' section" />
        </div>

        <div className="form-group">
          <label><FaImage style={{ marginRight: 6 }} /> Hero image URL</label>
          <input type="url" value={form.image} onChange={set('image')}
            placeholder="https://...  (leave blank to use the default church image)" />
          {form.image && (
            <img src={form.image} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 10, marginTop: 10 }} />
          )}
        </div>

        <div className="form-group">
          <label><FaCalendarAlt style={{ marginRight: 6 }} /> Schedule label</label>
          <input type="text" value={form.schedule_label} onChange={set('schedule_label')}
            placeholder="e.g. Practice Schedule" />
        </div>

        <div className="form-group">
          <label><FaCalendarAlt style={{ marginRight: 6 }} /> Meeting time (text, e.g. 'Every Friday, 5:00 – 7:00 PM')</label>
          <input type="text" value={form.training_time} onChange={set('training_time')} />
        </div>

        <div className="form-group">
          <label><FaMapMarkerAlt style={{ marginRight: 6 }} /> Meeting location</label>
          <input type="text" value={form.location} onChange={set('location')} />
        </div>

        <button
          className="btn-premium primary"
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          style={{ background: color, border: 'none', color: '#fff' }}
        >
          <FaSave /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default CommunityAdminAbout;
