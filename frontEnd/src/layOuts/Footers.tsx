import { Link } from "react-router-dom";
import { footerSections, footerSocialMedia } from "./footerRoutes";

const Footers = () => {
  const currentYear = new Date().getFullYear();

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
            {footerSocialMedia.map((platform, index) => (
              <a 
                key={index} 
                href={platform.url} 
                target="_blank" 
                rel="noreferrer"
                aria-label={platform.name}
                style={{
                  width: 44, height: 44, borderRadius: 16,
                  backgroundColor: "#1F2937", border: "1px solid #374151",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s",
                  cursor: "pointer", textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                  e.currentTarget.style.borderColor = "#2563EB";
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1F2937";
                  e.currentTarget.style.borderColor = "#374151";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <span style={{ fontSize: 18, color: platform.color === "text-blue-600" ? "#2563EB" : platform.color === "text-sky-500" ? "#0EA5E9" : platform.color === "text-pink-500" ? "#EC4899" : "#1D4ED8", transition: "color 0.3s" }}>
                  <platform.icon />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 40, marginTop: 24, borderTop: "1px solid #374151", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
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
        </div>
      </div>

      <style>{`
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
