import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import '../../Jumuiya/admin/AdminActivities.css';

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

      <div className="admin-form">
        <div className="form-group">
          <label>Meeting Schedule</label>
          <input
            value={meetingDay}
            onChange={e => setMeetingDay(e.target.value)}
            placeholder="e.g. Every Sunday at 10:00 AM, Church Hall"
          />
        </div>
        <button className="btn-premium primary" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
          <FaSave /> {updateMutation.isPending ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  );
};

export default CommunityAdminActivities;
