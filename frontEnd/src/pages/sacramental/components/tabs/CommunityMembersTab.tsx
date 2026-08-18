import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import { FaUsers } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  moduleId: string;
  moduleName: string;
  color: string;
}

const CommunityMembersTab: React.FC<Props> = ({ moduleId, moduleName, color }) => {
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', moduleId],
    queryFn: async () => {
      const res = await apiClient.get('/enrollments');
      return Array.isArray(res.data)
        ? res.data.filter((e: any) => e.class_id === moduleId || e.module_id === moduleId)
        : [];
    },
    retry: 1,
    staleTime: 300000,
  });

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Registered Members</h1>
          <p className="page-description">{enrollments.length} member{enrollments.length !== 1 ? 's' : ''} in {moduleName}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full" />
        </div>
      ) : enrollments.length > 0 ? (
        <div className="members-grid">
          {enrollments.map((member: any) => {
            const name = member.fullName || member.full_name || 'Unknown';
            const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={member.id} className="member-card">
                <div className="member-avatar" style={{ background: `${color}15`, color }}>
                  {initials}
                </div>
                <div className="member-info">
                  <h3 className="member-name">{name}</h3>
                  <span className={`member-badge ${member.status === 'Approved' ? 'approved' : member.status === 'Rejected' ? 'rejected' : 'pending'}`}>
                    {member.status || 'Pending'}
                  </span>
                </div>
                <div className="member-details">
                  {member.voice_type && <span className="detail-item">Voice: {member.voice_type}</span>}
                  {member.music_level && <span className="detail-item">Level: {member.music_level}</span>}
                  {(member.phoneNumber || member.phone) && (
                    <a href={`tel:${member.phoneNumber || member.phone}`} className="detail-item link">
                      {member.phoneNumber || member.phone}
                    </a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="detail-item link truncate">
                      {member.email}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <FaUsers className="empty-icon" />
          <p>No members registered yet. Be the first to join!</p>
        </div>
      )}
    </div>
  );
};

export default CommunityMembersTab;
