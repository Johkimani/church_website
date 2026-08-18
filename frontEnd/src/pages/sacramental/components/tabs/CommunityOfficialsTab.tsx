import React from 'react';
import type { CommunityModule } from '../../context/CommunityDataContext';
import { FaCalendarCheck, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  module: CommunityModule;
  color: string;
  isAdmin?: boolean;
}

const CommunityOfficialsTab: React.FC<Props> = ({ module, color, isAdmin }) => {
  const officials = module.officials || [];

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Leadership Team</h1>
          <p className="page-description">Meet the dedicated leaders who guide and serve the {module.title} community.</p>
        </div>
      </div>

      {officials.length > 0 ? (
        <div className="officials-grid">
          {officials.map((official: any) => {
            const initials = official.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div key={official.id} className="official-card group">
                <div className="official-avatar" style={{ '--jumuiya-color': color } as React.CSSProperties}>
                  {(official.photoUrl || official.photo_url) ? (
                    <img src={official.photoUrl || official.photo_url} alt={official.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-white text-xl" style={{ background: color }}>
                      {initials}
                    </div>
                  )}
                </div>
                <div className="official-info">
                  <h3 className="official-name">{official.name}</h3>
                  <span className="official-position" style={{ background: `${color}15`, color }}>{official.position}</span>
                  <div className="official-actions">
                    {(official.phoneNumber || official.phone) && (
                      <a href={`tel:${official.phoneNumber || official.phone}`} className="official-action-btn phone">
                        <FaPhoneAlt /> Call
                      </a>
                    )}
                    {(official.phoneNumber || official.phone) && (
                      <a
                        href={`https://wa.me/${(official.phoneNumber || official.phone).replace(/\D/g, '').replace(/^0/, '254')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="official-action-btn whatsapp"
                      >
                        <FaWhatsapp /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <FaCalendarCheck className="empty-icon" />
          <p>Leadership team information coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default CommunityOfficialsTab;
