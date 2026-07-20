import React, { useState } from "react";
import type { JumuiyaData } from "../data/jumuiyaData";
import { FaCalendarDay, FaClock, FaMapMarkerAlt, FaFilePdf, FaChurch, FaHeart, FaUsers, FaQuoteRight, FaArrowRight, FaDownload } from "react-icons/fa";
import "./TabsSystem.css";

interface AboutTabProps {
  jumuiya: JumuiyaData;
  onNavigateBack: () => void;
}

const AboutTab: React.FC<AboutTabProps> = ({ jumuiya }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="tab-system-content" style={{ "--jumuiya-color": jumuiya.color } as React.CSSProperties}>
      {/* ═══ Hero Banner ═══ */}
      <div className="about-hero" style={{ background: jumuiya.color }}>
        <div className="about-hero-overlay" />
        
        {/* Saint image */}
        {jumuiya.saintImage && (
          <div className="about-hero-image-wrap">
            <img
              src={jumuiya.saintImage}
              alt={jumuiya.name}
              className={`about-hero-image ${imgLoaded ? "loaded" : ""}`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        )}

        {/* Hero text */}
        <div className="about-hero-text">
          <div className="about-hero-badge">
            <FaChurch style={{ fontSize: "0.75rem" }} />
            <span>Jumuiya Community</span>
          </div>
          <h1 className="about-hero-title">{jumuiya.fullName || jumuiya.name}</h1>
          {jumuiya.description && (
            <p className="about-hero-desc">"{jumuiya.description}"</p>
          )}
        </div>
      </div>

      {/* ═══ Stats Row ═══ */}
      <div className="about-stats-row">
        <div className="about-stat-card">
          <div className="about-stat-icon" style={{ background: `${jumuiya.color}15`, color: jumuiya.color }}>
            <FaUsers />
          </div>
          <div>
            <p className="about-stat-value">Weekly</p>
            <p className="about-stat-label">Meetings</p>
          </div>
        </div>
        <div className="about-stat-card">
          <div className="about-stat-icon" style={{ background: `${jumuiya.color}15`, color: jumuiya.color }}>
            <FaHeart />
          </div>
          <div>
            <p className="about-stat-value">Fellowship</p>
            <p className="about-stat-label">& Prayer</p>
          </div>
        </div>
        <div className="about-stat-card">
          <div className="about-stat-icon" style={{ background: `${jumuiya.color}15`, color: jumuiya.color }}>
            <FaChurch />
          </div>
          <div>
            <p className="about-stat-value">{jumuiya.name}</p>
            <p className="about-stat-label">Community</p>
          </div>
        </div>
      </div>

      {/* ═══ Main Content Grid ═══ */}
      <div className="about-main-grid">
        {/* Left: Story Section */}
        <div className="about-story-section">
          <div className="about-section-header">
            <div className="about-section-line" style={{ background: jumuiya.color }} />
            <h2 className="about-section-title">Our Story</h2>
          </div>

          <div className="about-story-card">
            {/* Quote decoration */}
            <div className="about-quote-decor" style={{ color: `${jumuiya.color}30` }}>
              <FaQuoteRight />
            </div>

            {/* Story text */}
            <div className="about-story-text">
              {jumuiya.about?.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* PDF Button */}
            {jumuiya.historyPdf && (
              <a
                href={jumuiya.historyPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="about-pdf-btn"
                style={{
                  background: jumuiya.color,
                  boxShadow: `0 4px 14px ${jumuiya.color}40`,
                }}
              >
                <FaFilePdf />
                <span>Download Full History (PDF)</span>
                <FaDownload style={{ marginLeft: "auto", opacity: 0.7 }} />
              </a>
            )}
          </div>
        </div>

        {/* Right: Meeting Info + Quick Info */}
        <div className="about-side-column">
          {/* Meeting Schedule Card */}
          <div className="about-meeting-card">
            <div className="about-meeting-header" style={{ background: jumuiya.color }}>
              <FaCalendarDay style={{ fontSize: "1.2rem" }} />
              <h3>Meeting Schedule</h3>
            </div>

            <div className="about-meeting-body">
              <div className="about-meeting-item">
                <div className="about-meeting-icon-wrap" style={{ color: jumuiya.color, background: `${jumuiya.color}12` }}>
                  <FaCalendarDay />
                </div>
                <div>
                  <p className="about-meeting-label">Day</p>
                  <p className="about-meeting-value">{jumuiya.meetingSchedule.day}</p>
                </div>
              </div>

              <div className="about-meeting-item">
                <div className="about-meeting-icon-wrap" style={{ color: jumuiya.color, background: `${jumuiya.color}12` }}>
                  <FaClock />
                </div>
                <div>
                  <p className="about-meeting-label">Time</p>
                  <p className="about-meeting-value">{jumuiya.meetingSchedule.time}</p>
                </div>
              </div>

              <div className="about-meeting-item">
                <div className="about-meeting-icon-wrap" style={{ color: jumuiya.color, background: `${jumuiya.color}12` }}>
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="about-meeting-label">Venue</p>
                  <p className="about-meeting-value">{jumuiya.meetingSchedule.venue}</p>
                </div>
              </div>
            </div>

            <div className="about-meeting-footer" style={{ borderTopColor: `${jumuiya.color}20` }}>
              <FaHeart style={{ color: "#ef4444", fontSize: "0.75rem" }} />
              <span>All are welcome! Come join us for prayer, fellowship, and community building.</span>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="about-quick-links">
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Explore {jumuiya.name}
            </h4>
            <div className="about-links-grid">
              {[
                { label: "View Officials", icon: "👥" },
                { label: "See Activities", icon: "📅" },
                { label: "Join Community", icon: "🤝" },
                { label: "Order T-Shirt", icon: "👕" },
              ].map((link) => (
                <button
                  key={link.label}
                  className="about-quick-link"
                  style={{ "--hover-color": jumuiya.color } as React.CSSProperties}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                  <FaArrowRight style={{ fontSize: "0.6rem", opacity: 0.4, marginLeft: "auto" }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutTab;
