import React, { useState } from "react";
import type { CommunityModule } from "../../context/CommunityDataContext";
import { FaCalendarDay, FaClock, FaMapMarkerAlt, FaFilePdf, FaChurch, FaHeart, FaUsers, FaArrowRight, FaDownload } from "react-icons/fa";
import '../../Jumuiya/components/TabsSystem.css';

interface Props {
  module: CommunityModule;
  color: string;
  onNavigateBack: () => void;
  onQuickLink?: (tab: 'officials' | 'activities' | 'channels' | 'tshirts') => void;
}

const CommunityAboutTab: React.FC<Props> = ({ module, color, onQuickLink }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="tab-system-content" style={{ "--jumuiya-color": color } as React.CSSProperties}>
      <div className="about-hero" style={{ background: color }}>
        <div className="about-hero-overlay" />
        {(module.saint_image_url || module.image_url) && (
          <div className="about-hero-image-wrap">
            <img
              src={module.saint_image_url || module.image_url}
              alt={module.title}
              className={`about-hero-image ${imgLoaded ? "loaded" : ""}`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        )}
        <div className="about-hero-text">
          <div className="about-hero-badge">
            <FaChurch style={{ fontSize: "0.75rem" }} />
            <span>{module.description || "Community Ministry"}</span>
          </div>
          <h1 className="about-hero-title">{module.title}</h1>
        </div>
      </div>

      <div className="about-stats-row">
        <div className="about-stat-card">
          <div className="about-stat-icon" style={{ background: `${color}15`, color }}>
            <FaUsers />
          </div>
          <div>
            <p className="about-stat-value">Weekly</p>
            <p className="about-stat-label">Meetings</p>
          </div>
        </div>
        <div className="about-stat-card">
          <div className="about-stat-icon" style={{ background: `${color}15`, color }}>
            <FaHeart />
          </div>
          <div>
            <p className="about-stat-value">Fellowship</p>
            <p className="about-stat-label">& Prayer</p>
          </div>
        </div>
        <div className="about-stat-card">
          <div className="about-stat-icon" style={{ background: `${color}15`, color }}>
            <FaChurch />
          </div>
          <div>
            <p className="about-stat-value">{module.title}</p>
            <p className="about-stat-label">Community</p>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2 className="section-title">Our Story</h2>
        <p className="about-text">{module.story || module.about || module.description}</p>
        {(module.history_pdf_url || (module as any).pdf_url) && (
          <a
            href={module.history_pdf_url || (module as any).pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="about-pdf-btn"
          >
            <FaDownload /> Download History (PDF)
          </a>
        )}
      </div>

      {module.agenda && module.agenda.length > 0 && (
        <div className="about-section">
          <h2 className="section-title">Our Mission & Objectives</h2>
          <ul className="space-y-3">
            {module.agenda.map((item, i) => (
              <li key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="w-8 h-8 rounded-2xl flex items-center justify-center font-black text-sm shrink-0" style={{ background: `${color}15`, color }}>
                  {i + 1}
                </span>
                <span className="text-slate-700 font-semibold text-sm leading-relaxed pt-0.5">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="about-section">
        <h2 className="section-title">
          <FaClock /> Meeting Schedule
        </h2>
        <div className="about-meeting-card">
          <div className="meeting-info">
            <FaCalendarDay style={{ color }} />
            <span>{module.meetingSchedule || 'Contact parish office for schedule'}</span>
          </div>
        </div>
      </div>

      <div className="about-quick-links">
        <h3 className="quick-links-title">Quick Links</h3>
        <div className="quick-links-grid">
          {onQuickLink && (
            <>
              <button className="quick-link-card" onClick={() => onQuickLink('officials')}>
                <FaUsers style={{ color }} />
                <span>Officials</span>
              </button>
              <button className="quick-link-card" onClick={() => onQuickLink('activities')}>
                <FaCalendarDay style={{ color }} />
                <span>Activities</span>
              </button>
              <button className="quick-link-card" onClick={() => onQuickLink('channels')}>
                <FaChurch style={{ color }} />
                <span>Channels</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityAboutTab;
