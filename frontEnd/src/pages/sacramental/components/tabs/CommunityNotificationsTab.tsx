import React from 'react';
import type { CommunityModule } from '../../context/CommunityDataContext';
import { FaBell, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  module: CommunityModule;
  color: string;
}

const CommunityNotificationsTab: React.FC<Props> = ({ module, color }) => {
  const announcements = (module as any).announcements || [];

  if (announcements.length === 0) {
    return (
      <div className="notifications-empty">
        <FaBell style={{ fontSize: '2rem', color: '#ccc' }} />
        <p>No new notifications</p>
      </div>
    );
  }

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'warning': return <FaExclamationTriangle />;
      case 'success': return <FaCheckCircle />;
      case 'urgent': return <FaExclamationCircle />;
      default: return <FaInfoCircle />;
    }
  };

  const getNotifColor = (type: string) => {
    switch (type) {
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      case 'urgent': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="notifications-list">
      {announcements.map((notif: any) => {
        const type = notif.type || 'info';
        return (
          <div key={notif.id} className="notification-card" style={{ borderLeftColor: getNotifColor(type) }}>
            <div className="notif-icon" style={{ color: getNotifColor(type) }}>
              {getNotifIcon(type)}
            </div>
            <div className="notif-content">
              <h4 className="notif-title">{notif.announcement_title || notif.title}</h4>
              <p className="notif-message">{notif.announcement_content || notif.content}</p>
              <span className="notif-date">
                {new Date(notif.announcement_date || notif.date || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommunityNotificationsTab;
