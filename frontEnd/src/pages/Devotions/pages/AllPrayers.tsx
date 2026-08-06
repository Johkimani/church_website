import { useState } from "react";
import { Link } from "react-router-dom";
import PrayerBook from "./PrayerBook";
import PrayerModule from "./PrayerModule";
import Rosary from "./Rosary";
import LiturgySection from "./LiturgySection";

type SubTab = "book" | "novenas" | "rosary" | "liturgy";

const SUB_TABS: { key: SubTab; label: string; icon: string; desc: string; gradient: string }[] = [
  { key: "book",     label: "Prayer Book",  icon: "\uD83D\uDCD6", desc: "Daily prayers, devotions & litanies",  gradient: "linear-gradient(135deg, #F59E0B, #F97316)" },
  { key: "novenas",  label: "Novenas & Litanies", icon: "\uD83D\uDD6F\uFE0F", desc: "9-day novenas, litanies, saints prayers", gradient: "linear-gradient(135deg, #8B5CF6, #A855F7)" },
  { key: "rosary",   label: "Holy Rosary",  icon: "\u25C9",  desc: "Marian mysteries & bead tracker",       gradient: "linear-gradient(135deg, #7C3AED, #6D28D9)" },
  { key: "liturgy",  label: "Liturgy Guide", icon: "\u269B\uFE0F", desc: "Mass structure, prayers & seasons",     gradient: "linear-gradient(135deg, #E11D48, #BE123C)" },
];

export default function AllPrayers() {
  const [activeTab, setActiveTab] = useState<SubTab>("book");

  return (
    <div style={{ minHeight: "100vh", color: "#E2E8F0", position: "relative" }}>
      {/* COSMIC SKY BACKGROUND */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #020617 0%, #0a0e27 20%, #0f172a 40%, #1a1040 65%, #0c0a1d 85%, #020617 100%)" }} />
        <div style={{ position: "absolute", top: "5%", left: "10%", width: 500, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", top: "30%", right: "5%", width: 600, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(70px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `
          radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 40% 8%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 55% 22%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 12% 20%, rgba(255,255,255,0.9) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 28% 45%, rgba(255,255,255,0.8) 0%, transparent 100%),
          radial-gradient(2px 2px at 45% 15%, rgba(200,220,255,1) 0%, transparent 100%),
          radial-gradient(2.5px 2.5px at 20% 30%, rgba(255,230,180,1) 0%, transparent 100%),
          radial-gradient(3px 3px at 50% 25%, rgba(180,200,255,1) 0%, transparent 100%)
        ` }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%, rgba(2,6,23,0.4) 100%)" }} />
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tabSlide { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .ap-tab { transition: all 0.25s cubic-bezier(.4,0,.2,1); }
        .ap-tab:hover { transform: translateY(-2px); }
      `}</style>

      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(2,6,23,0.6)", backdropFilter: "blur(16px) saturate(1.5)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/devotions" style={{
            padding: "8px 18px", borderRadius: 10,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer", fontSize: 13, fontWeight: 600, textDecoration: "none",
            color: "#94A3B8", display: "inline-flex", alignItems: "center", gap: 8,
            transition: "all 0.2s", backdropFilter: "blur(8px)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#FFFFFF"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#94A3B8"; }}
          >
            <span style={{ fontSize: 16 }}>&larr;</span> Dashboard
          </Link>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: "#D97706", boxShadow: "0 0 8px #D9770680", animation: "glowPulse 3s ease-in-out infinite" }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#D97706" }}>Ora Pro Nobis</span>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 1400, margin: "0 auto", padding: "32px 24px 0" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#FFFFFF", margin: 0, lineHeight: 1.15, letterSpacing: "-0.02em", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
          All Prayers
        </h1>
        <p style={{ fontSize: 15, color: "#94A3B8", margin: "8px 0 0", lineHeight: 1.5 }}>
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
                  background: isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                  border: isActive ? `1px solid rgba(255,255,255,0.15)` : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: isActive ? `0 4px 20px rgba(0,0,0,0.3), 0 0 30px ${tab.gradient.includes("#F59E0B") ? "rgba(245,158,11,0.15)" : tab.gradient.includes("#8B5CF6") ? "rgba(139,92,246,0.15)" : tab.gradient.includes("#7C3AED") ? "rgba(124,58,237,0.15)" : "rgba(225,29,72,0.15)"}` : "0 2px 8px rgba(0,0,0,0.15)",
                  minWidth: 180,
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              >
                {isActive && (
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 30% 50%, ${tab.gradient.includes("#F59E0B") ? "rgba(245,158,11,0.08)" : tab.gradient.includes("#8B5CF6") ? "rgba(139,92,246,0.08)" : tab.gradient.includes("#7C3AED") ? "rgba(124,58,237,0.08)" : "rgba(225,29,72,0.08)"} 0%, transparent 60%)`, pointerEvents: "none" }} />
                )}
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, background: isActive ? tab.gradient : "rgba(255,255,255,0.06)",
                  boxShadow: isActive ? `0 4px 12px ${tab.gradient.includes("#F59E0B") ? "rgba(245,158,11,0.3)" : tab.gradient.includes("#8B5CF6") ? "rgba(139,92,246,0.3)" : tab.gradient.includes("#7C3AED") ? "rgba(124,58,237,0.3)" : "rgba(225,29,72,0.3)"}` : "none",
                }}>{tab.icon}</div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: isActive ? "#FFFFFF" : "#CBD5E1" }}>{tab.label}</div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{tab.desc}</div>
                </div>
                {isActive && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: tab.gradient }} />}
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
