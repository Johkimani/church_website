import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaSave, FaCalendarAlt } from 'react-icons/fa';
import '../../Jumuiya/admin/Admin.css';

interface Props {
  color: string;
}

const CommunityAdminActivities: React.FC<Props> = ({ color }) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const queryClient = useQueryClient();

  const [meetingDay, setMeetingDay] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingVenue, setMeetingVenue] = useState('');

  const { data: moduleData } = useQuery({
    queryKey: ['community-admin-about', moduleId],
    queryFn: async () => {
      const res = await apiClient.get(`/community-view/${moduleId}`);
      return res.data;
    },
    enabled: !!moduleId,
  });

  React.useEffect(() => {
    if (moduleData) {
      setMeetingDay(moduleData.meetingSchedule || '');
    }
  }, [moduleData]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.put(`/hub_modules/${moduleId}`, {
        meetingSchedule: meetingDay,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-admin-about', moduleId] });
      toast.success('Schedule updated!');
    },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <div className="admin-activities">
      <h2 className="admin-section-title">Meeting Schedule</h2>

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
            <FaCalendarAlt style={{ color }} size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Weekly Schedule</h3>
            <p className="text-[11px] text-slate-400 font-semibold">When does your community meet?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Meeting Schedule</label>
            <input
              value={meetingDay}
              onChange={e => setMeetingDay(e.target.value)}
              placeholder="e.g. Every Sunday at 10:00 AM, Church Hall"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
            />
          </div>
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
            style={{ background: color }}
          >
            <FaSave size={14} /> {updateMutation.isPending ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityAdminActivities;
