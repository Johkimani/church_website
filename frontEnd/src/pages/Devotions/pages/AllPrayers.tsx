import { useState } from "react";
import { Link } from "react-router-dom";
import PrayerBook from "./PrayerBook";
import PrayerModule from "./PrayerModule";
import Rosary from "./Rosary";
import LiturgySection from "./LiturgySection";

type SubTab = "book" | "novenas" | "rosary" | "liturgy";

const SUB_TABS: { key: SubTab; label: string; icon: string; desc: string }[] = [
  { key: "book",     label: "Prayer Book",  icon: "\uD83D\uDCD6", desc: "Daily prayers, devotions & litanies" },
  { key: "novenas",  label: "Novenas & Litanies", icon: "\uD83D\uDD6F\uFE0F", desc: "9-day novenas, litanies, saints prayers" },
  { key: "rosary",   label: "Holy Rosary",  icon: "\u25C9",  desc: "Marian mysteries & bead tracker" },
  { key: "liturgy",  label: "Liturgy Guide", icon: "\u269B\uFE0F", desc: "Mass structure, prayers & seasons" },
];

const GOLD = "#D97706";
const AMBER = "#B45309";

export default function AllPrayers() {
  const [activeTab, setActiveTab] = useState<SubTab>("book");

  return (
    <div style={{ minHeight: "100vh", color: "#57534E", position: "relative", background: "#FAF8F5" }}>
      {/* CELESTIAL BACKGROUND */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(217,119,6,0.05), transparent 70%)" }} />
        <div style={{ position: "absolute", top: "20%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.03) 0%, transparent 70%)", filter: "blur(90px)" }} />
        <div style={{ position: "absolute", inset: 0, background: "transparent" }} />
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tabSlide { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .ap-tab { transition: all 0.25s cubic-bezier(.4,0,.2,1); }
        .ap-tab:hover { transform: translateY(-2px); }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 8px rgba(217,119,6,0.3)} 50%{box-shadow:0 0 14px rgba(217,119,6,0.2)} }
      `}</style>

      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(250,248,245,0.85)", backdropFilter: "blur(16px) saturate(1.5)", borderBottom: "1px solid rgba(28,25,23,0.08)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/devotions" style={{
            padding: "8px 18px", borderRadius: 10,
            background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.15)",
            cursor: "pointer", fontSize: 13, fontWeight: 600, textDecoration: "none",
            color: "#D97706", display: "inline-flex", alignItems: "center", gap: 8,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(217,119,6,0.15)"; e.currentTarget.style.color = "#B45309"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(217,119,6,0.08)"; e.currentTarget.style.color = "#D97706"; }}
          >
            <span style={{ fontSize: 16 }}>&larr;</span> Dashboard
          </Link>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: GOLD, boxShadow: "0 0 8px rgba(217,119,6,0.3)", animation: "glowPulse 3s ease-in-out infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: GOLD }}>Ora Pro Nobis</span>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 1400, margin: "0 auto", padding: "32px 24px 0" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#1C1917", margin: 0, lineHeight: 1.15, letterSpacing: "-0.02em", fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
          All Prayers
        </h1>
        <p style={{ fontSize: 15, color: "#78716C", margin: "8px 0 0", lineHeight: 1.5 }}>
          Explore our complete collection of Catholic prayers, novenas, rosary, and liturgy guides
        </p>
      </div>

      {/* SUB-TAB NAVIGATION */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 1400, margin: "0 auto", padding: "24px 24px 0" }}>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          {SUB_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className="ap-tab"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: "0 0 auto", padding: "14px 22px", borderRadius: 14,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                  textAlign: "left", position: "relative", overflow: "hidden",
                  background: isActive ? "rgba(217,119,6,0.08)" : "#FFFFFF",
                  border: isActive ? `1px solid rgba(217,119,6,0.3)` : "1px solid #E7E5E4",
                  boxShadow: isActive ? "0 4px 20px rgba(217,119,6,0.15)" : "0 2px 8px rgba(28,25,23,0.05)",
                  minWidth: 180,
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#F5F5F4"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "#FFFFFF"; }}
              >
                {isActive && (
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 50%, rgba(217,119,6,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
                )}
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, background: isActive ? `linear-gradient(135deg, ${GOLD}, #B45309)` : "#F5F5F4",
                  boxShadow: isActive ? "0 4px 12px rgba(217,119,6,0.3)" : "none",
                }}>{tab.icon}</div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: isActive ? "#B45309" : "#57534E" }}>{tab.label}</div>
                  <div style={{ fontSize: 10, color: "#78716C", marginTop: 2 }}>{tab.desc}</div>
                </div>
                {isActive && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${GOLD}, ${AMBER})` }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 1400, margin: "0 auto", padding: "24px 0 60px", animation: "tabSlide 0.3s ease" }} key={activeTab}>
        {activeTab === "book" && <PrayerBook />}
        {activeTab === "novenas" && <PrayerModule />}
        {activeTab === "rosary" && <Rosary />}
        {activeTab === "liturgy" && <LiturgySection />}
      </div>
    </div>
  );
}