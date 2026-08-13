import { useState } from "react";
import { Link } from "react-router-dom";
import { footerSections, footerSocialMedia } from "./footerRoutes";
import DeveloperModal from "./DeveloperModal";

const Footers = () => {
  const currentYear = new Date().getFullYear();
  const [hoveredSocial, setHoveredSocial] = useState<number | null>(null);
  const [devModalOpen, setDevModalOpen] = useState(false);

  return (
    <footer style={{ backgroundColor: "#111827", color: "#D1D5DB", padding: "80px 24px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 48, paddingTop: 16 }}>
        
        {/* Slogan Section */}
        <section style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ height: 4, width: 40, backgroundColor: "#2563EB", borderRadius: 9999, marginBottom: 16 }} />
            <p style={{ fontSize: 18, fontWeight: 900, fontStyle: "italic", color: "#F9FAFB", lineHeight: 1.3, margin: 0 }}>
              "Growing Together in Faith and Service."
            </p>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 280, fontWeight: 500, color: "#9CA3AF", margin: 0 }}>
            Empowering students through spiritual guidance and community hubs.
          </p>
        </section>

        {/* Dynamic Navigation Sections */}
        {footerSections.map((section, idx) => (
          <section key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 32 }}>
            <h3 style={{ fontSize: 11, fontWeight: 900, color: "#F9FAFB", textTransform: "uppercase", letterSpacing: "0.4em", margin: 0 }}>
              {section.title}
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              {section.routes.map((route, rIdx) => (
                <li key={rIdx}>
                  <Link 
                    to={route.path} 
                    style={{ fontSize: 14, fontWeight: 500, color: "#D1D5DB", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#60A5FA"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#D1D5DB"; }}
                  >
                    {route.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Social Icons */}
        <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, marginTop: 32 }}>
          <div style={{ height: 1, width: "100%", maxWidth: 400, backgroundColor: "#374151" }} />
          <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
            {footerSocialMedia.map((platform, index) => {
              const isHovered = hoveredSocial === index;
              return (
                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={platform.name}
                  style={{
                    width: 44, height: 44, borderRadius: 16,
                    backgroundColor: isHovered ? `${platform.iconColor}22` : "#1F2937",
                    border: `1px solid ${isHovered ? platform.iconColor : "#374151"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s",
                    transform: isHovered ? "scale(1.1)" : "scale(1)",
                    cursor: "pointer", textDecoration: "none",
                  }}
                  onMouseEnter={() => setHoveredSocial(index)}
                  onMouseLeave={() => setHoveredSocial(null)}
                >
                  <span style={{ fontSize: 18, color: isHovered ? "#FFFFFF" : platform.iconColor, transition: "color 0.3s" }}>
                    <platform.icon />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 40, marginTop: 24, borderTop: "1px solid #374151" }} className="footer-bottom-bar">
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9CA3AF", margin: 0 }}>
          &copy; {currentYear} St. Thomas Aquinas CSA &mdash; Crafted for the Catholic Community.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9CA3AF" }}>
          <Link to="/privacy" style={{ color: "#9CA3AF", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#D1D5DB"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9CA3AF"; }}
          >Privacy</Link>
          <span style={{ color: "#4B5563" }}>&middot;</span>
          <Link to="/terms" style={{ color: "#9CA3AF", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#D1D5DB"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9CA3AF"; }}
          >Terms</Link>
          <span style={{ color: "#4B5563" }}>&middot;</span>
          <button
            onClick={() => setDevModalOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={devModalOpen}
            style={{
              color: "#9CA3AF", background: "none", border: "none", padding: 0, margin: 0,
              font: "inherit", textTransform: "inherit", letterSpacing: "inherit", fontWeight: "inherit",
              fontSize: "inherit", cursor: "pointer", transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#D1D5DB"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#9CA3AF"; }}
          >Developers</button>
          {/* Ask Rafiki — inline on mobile, hidden on md+ (desktop has floating pill) */}
          <span className="footer-rafiki-sep" style={{ color: "#4B5563" }}>&middot;</span>
          <button
            id="footer-rafiki-trigger"
            className="footer-rafiki-btn"
            onClick={() => document.dispatchEvent(new CustomEvent("rafiki:open"))}
            style={{
              color: "#F59E0B", background: "none", border: "none", padding: 0, margin: 0,
              font: "inherit", textTransform: "inherit", letterSpacing: "inherit", fontWeight: "inherit",
              fontSize: "inherit", cursor: "pointer", transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#FBBF24"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#F59E0B"; }}
          >Ask Rafiki</button>
        </div>
      </div>

      <DeveloperModal open={devModalOpen} onClose={() => setDevModalOpen(false)} />

      <style>{`
        .footer-bottom-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        /* On mobile: stack copyright above links, hide Rafiki sep+btn (shown inline below) */
        @media (max-width: 767px) {
          .footer-bottom-bar { flex-direction: column; align-items: flex-start; gap: 10px; }
          .footer-rafiki-sep, .footer-rafiki-btn { display: inline !important; }
        }
        /* On md+: hide the inline footer rafiki button (floating pill handles it) */
        @media (min-width: 768px) {
          .footer-rafiki-sep, .footer-rafiki-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          footer > div { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          footer > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footers;
