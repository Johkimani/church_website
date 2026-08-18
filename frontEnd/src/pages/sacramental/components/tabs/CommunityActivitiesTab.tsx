import React from 'react';
import { FaCalendarAlt, FaClock, FaMapPin } from 'react-icons/fa';
import type { CommunityModule } from '../../context/CommunityDataContext';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  moduleId: string;
  color: string;
  module: CommunityModule;
}

const CommunityActivitiesTab: React.FC<Props> = ({ moduleId, color, module }) => {
  const activities = module.activities || [];
  const practiceSchedules = module.practiceSchedules || [];

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Activities</h1>
          <p className="page-description">Our schedule and upcoming events.</p>
        </div>
      </div>

      {/* Practice Schedule */}
      {practiceSchedules.length > 0 && (
        <div className="activities-section">
          <h2 className="section-title"><FaClock /> Practice Schedule</h2>
          <div className="schedule-list">
            {practiceSchedules.map(ps => (
              <div key={ps.id} className="schedule-card">
                <div className="schedule-day">{ps.day}</div>
                <div className="schedule-details">
                  <span className="schedule-time">{ps.startTime} – {ps.endTime}</span>
                  <span className="schedule-location"><FaMapPin /> {ps.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activities */}
      {activities.length > 0 ? (
        <div className="activities-section">
          <h2 className="section-title"><FaCalendarAlt /> Upcoming Activities</h2>
          <div className="activities-list">
            {activities.map((activity: any) => (
              <div key={activity.id} className="activity-card">
                <div className="activity-date-badge" style={{ background: `${color}15`, color }}>
                  <span className="month">
                    {new Date(activity.date || Date.now()).toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                  <span className="day">
                    {new Date(activity.date || Date.now()).getDate()}
                  </span>
                </div>
                <div className="activity-info">
                  <h3 className="activity-title">{activity.title}</h3>
                  <p className="activity-desc">{activity.description}</p>
                  <span className={`activity-status ${activity.status?.toLowerCase() || 'upcoming'}`}>
                    {activity.status || 'Event'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <FaCalendarAlt className="empty-icon" />
          <p>No activities scheduled yet.</p>
        </div>
      )}
    </div>
  );
};

export default CommunityActivitiesTab;
