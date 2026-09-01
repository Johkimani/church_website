import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaSave, FaImage, FaCalendarAlt, FaMapMarkerAlt, FaAlignLeft, FaInfoCircle } from 'react-icons/fa';
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

  const inputClass = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all";

  return (
    <div className="max-w-2xl">
      <h2 className="admin-section-title">Home Page / About</h2>
      <p className="text-xs sm:text-sm text-slate-500 font-semibold mb-5">
        This content appears on the public community home page.
      </p>

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
            <FaInfoCircle style={{ color }} size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Community Details</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Edit your community's public info</p>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            <FaAlignLeft size={12} /> Tagline
          </label>
          <textarea value={form.description} onChange={set('description')} rows={2}
            placeholder="One-line invitation shown at the top of the page"
            className={inputClass + ' resize-none'} />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            <FaAlignLeft size={12} /> Full Story / About
          </label>
          <textarea value={form.story} onChange={set('story')} rows={6}
            placeholder="Detailed story of this ministry"
            className={inputClass + ' resize-none'} />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            <FaImage size={12} /> Hero Image URL
          </label>
          <input type="url" value={form.image} onChange={set('image')}
            placeholder="https://..."
            className={inputClass} />
          {form.image && (
            <img src={form.image} alt="preview" className="w-full max-h-40 object-cover rounded-xl mt-3" />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              <FaCalendarAlt size={12} /> Schedule Label
            </label>
            <input type="text" value={form.schedule_label} onChange={set('schedule_label')}
              placeholder="e.g. Practice Schedule"
              className={inputClass} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              <FaCalendarAlt size={12} /> Meeting Time
            </label>
            <input type="text" value={form.training_time} onChange={set('training_time')}
              placeholder="e.g. Every Friday, 5-7 PM"
              className={inputClass} />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            <FaMapMarkerAlt size={12} /> Meeting Location
          </label>
          <input type="text" value={form.location} onChange={set('location')}
            placeholder="e.g. Church Hall"
            className={inputClass} />
        </div>

        <button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
          style={{ background: color }}
        >
          <FaSave size={14} /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default CommunityAdminAbout;
