import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import { useAuth } from '../../../../context/AuthContext';
import { FaStamp, FaDownload, FaPrint } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  moduleId: string;
  moduleName: string;
  color: string;
}

const CommunityStampCardTab: React.FC<Props> = ({ moduleId, moduleName, color }) => {
  const { user } = useAuth();

  const { data: memberData } = useQuery({
    queryKey: ['enrollments', moduleId, user?.member_id],
    queryFn: async () => {
      const res = await apiClient.get('/enrollments');
      const all = Array.isArray(res.data) ? res.data : [];
      return all.find((e: any) =>
        (e.class_id === moduleId || e.module_id === moduleId) &&
        (e.member_id === user?.member_id || e.reg_number === user?.member_id)
      );
    },
    retry: 1,
    staleTime: 300000,
  });

  const semesters = [
    { id: '1.1', label: 'Sem 1.1' }, { id: '1.2', label: 'Sem 1.2' },
    { id: '2.1', label: 'Sem 2.1' }, { id: '2.2', label: 'Sem 2.2' },
    { id: '3.1', label: 'Sem 3.1' }, { id: '3.2', label: 'Sem 3.2' },
    { id: '4.1', label: 'Sem 4.1' }, { id: '4.2', label: 'Sem 4.2' },
  ];

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="stamp-card-container">
        <div className="stamp-card" style={{ '--jumuiya-color': color } as React.CSSProperties}>
          <div className="stamp-card-header" style={{ background: color }}>
            <div className="stamp-card-logo">{moduleName}</div>
            <div className="stamp-card-badge">MEMBER</div>
          </div>

          <div className="stamp-card-body">
            <div className="stamp-card-member-info">
              <div className="member-avatar" style={{ background: `${color}15`, color }}>
                {user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="member-name">{user?.name || 'Member'}</h3>
                <p className="member-id">{user?.member_id || 'N/A'}</p>
              </div>
            </div>

            <div className="semester-grid">
              {semesters.map(sem => (
                <div key={sem.id} className="semester-cell">
                  <div className="semester-label">{sem.label}</div>
                  <div className="semester-stamp empty" style={{ borderColor: `${color}40` }}>
                    <FaStamp style={{ color: `${color}30` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="stamp-card-footer">
              <span>Year of Study: {user?.year || 'N/A'}</span>
              <span>Community: {moduleName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityStampCardTab;
