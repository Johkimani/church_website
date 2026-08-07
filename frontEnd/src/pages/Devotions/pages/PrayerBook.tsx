import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CATHOLIC_PRAYERS,
  CATEGORY_META,
  getCurrentTimeCategory,
  type CatholicPrayer,
  type PrayerCategory,
} from "../data/catholicPrayers";

const CATEGORIES = Object.keys(CATEGORY_META) as PrayerCategory[];

const CAT_THEME: Record<PrayerCategory, { accent: string; gradient: string }> = {
  morning:    { accent: "#FBBF24", gradient: "linear-gradient(135deg, #F59E0B, #F97316)" },
  daytime:    { accent: "#38BDF8", gradient: "linear-gradient(135deg, #0EA5E9, #3B82F6)" },
  evening:    { accent: "#A78BFA", gradient: "linear-gradient(135deg, #8B5CF6, #A855F7)" },
  night:      { accent: "#94A3B8", gradient: "linear-gradient(135deg, #475569, #64748B)" },
  mass:       { accent: "#FB7185", gradient: "linear-gradient(135deg, #E11D48, #BE123C)" },
  rosary:     { accent: "#C084FC", gradient: "linear-gradient(135deg, #7C3AED, #6D28D9)" },
  essential:  { accent: "#60A5FA", gradient: "linear-gradient(135deg, #2563EB, #1D4ED8)" },
  acts:       { accent: "#F472B6", gradient: "linear-gradient(135deg, #DB2777, #BE185D)" },
  litanies:   { accent: "#34D399", gradient: "linear-gradient(135deg, #059669, #047857)" },
  saints:     { accent: "#FBBF24", gradient: "linear-gradient(135deg, #D97706, #B45309)" },
  devotions:  { accent: "#C084FC", gradient: "linear-gradient(135deg, #7C3AED, #9333EA)" },
  fasting:    { accent: "#A8A29E", gradient: "linear-gradient(135deg, #57534E, #78716C)" },
  special:    { accent: "#2DD4BF", gradient: "linear-gradient(135deg, #0D9488, #0F766E)" },
};

export default function PrayerBook() {
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory>(() => getCurrentTimeCategory());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrayer, setSelectedPrayer] = useState<CatholicPrayer | null>(null);
  const [fontSize, setFontSize] = useState(() => {
    try { return parseInt(localStorage.getItem("prayer-book-font") || "17"); } catch { return 17; }
  });
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("prayer-book-marks") || "[]")); }
    catch { return new Set(); }
  });
  const [completedPrayers, setCompletedPrayers] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("prayer-book-completed") || "[]")); }
    catch { return new Set(); }
  });
  const [mobileSidebar, setMobileSidebar] = useState(false);

  useEffect(() => { localStorage.setItem("prayer-book-font", String(fontSize)); }, [fontSize]);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("prayer-book-marks", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const toggleCompleted = useCallback((id: string) => {
    setCompletedPrayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("prayer-book-completed", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const filteredPrayers = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return CATHOLIC_PRAYERS.filter(
        (p) => (p.title.toLowerCase().includes(q) || p.text.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)))
      );
    }
    return CATHOLIC_PRAYERS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, searchQuery]);

  const bookmarkedPrayers = useMemo(() => CATHOLIC_PRAYERS.filter((p) => bookmarks.has(p.id)), [bookmarks]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach((cat) => { counts[cat] = CATHOLIC_PRAYERS.filter((p) => p.category === cat).length; });
    return counts;
  }, []);

  useEffect(() => {
    if (!selectedPrayer) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPrayer(null);
      const i = filteredPrayers.findIndex((p) => p.id === selectedPrayer.id);
      if (i === -1) return;
      if ((e.key === "ArrowDown" || e.key === "ArrowRight") && i < filteredPrayers.length - 1) setSelectedPrayer(filteredPrayers[i + 1]);
      if ((e.key === "ArrowUp" || e.key === "ArrowLeft") && i > 0) setSelectedPrayer(filteredPrayers[i - 1]);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selectedPrayer, filteredPrayers]);

  const renderPrayerText = (text: string, size: number, accent: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const t = line.trim();
      if (!t) return <div key={i} style={{ height: 10 }} />;
      if (/^[VR]\.\s/.test(t)) {
        return (
          <div key={i} style={{ display: "flex", gap: 10, margin: "8px 0" }}>
            <span style={{ fontWeight: 700, color: accent, fontSize: size, flexShrink: 0, minWidth: 18 }}>{t.substring(0, 2)}</span>
            <span style={{ fontStyle: "italic", color: "#E2E8F0", fontSize: size, lineHeight: 1.9 }}>{t.substring(3)}</span>
          </div>
        );
      }
      if (/^Let us pray/i.test(t)) {
        return <div key={i} style={{ marginTop: 20, marginBottom: 10, fontStyle: "italic", color: "#D97706", fontSize: size }}>{t}</div>;
      }
      if (/^[A-Z\s]{8,}$/.test(t)) {
        return <div key={i} style={{ textAlign: "center", fontWeight: 700, marginTop: 28, marginBottom: 14, letterSpacing: "0.08em", fontSize: 12, textTransform: "uppercase", color: "#FFFFFF" }}>{t}</div>;
      }
      if (/^Glory be/i.test(t) || t === "Amen.") {
        return <div key={i} style={{ textAlign: "center", fontStyle: "italic", margin: "10px 0", color: "#94A3B8", fontSize: size - 1 }}>{t}</div>;
      }
      return <div key={i} style={{ lineHeight: 2, marginBottom: 14, color: "#E2E8F0", fontSize: size }}>{t}</div>;
    });
  };

  const meta = CATEGORY_META[selectedCategory];
  const theme = CAT_THEME[selectedCategory];

  return (
    <div style={{ minHeight: "100vh", color: "#E2E8F0", position: "relative" }}>
      {/* COSMIC SKY BACKGROUND */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #020617 0%, #0a0e27 20%, #0f172a 40%, #1a1040 65%, #0c0a1d 85%, #020617 100%)" }} />
        <div style={{ position: "absolute", top: "5%", left: "10%", width: 500, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%)", filter: "blur(60px)", animation: "nebDrift1 25s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "30%", right: "5%", width: 600, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.1) 0%, transparent 70%)", filter: "blur(70px)", animation: "nebDrift2 30s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "30%", width: 450, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)", filter: "blur(50px)", animation: "nebDrift3 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `
          radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 40% 8%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 55% 22%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 70% 12%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 85% 28%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 12% 20%, rgba(255,255,255,0.9) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 28% 45%, rgba(255,255,255,0.8) 0%, transparent 100%),
          radial-gradient(2px 2px at 45% 15%, rgba(200,220,255,1) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 62% 38%, rgba(255,255,255,0.9) 0%, transparent 100%),
          radial-gradient(2.5px 2.5px at 20% 30%, rgba(255,230,180,1) 0%, transparent 100%),
          radial-gradient(3px 3px at 50% 25%, rgba(180,200,255,1) 0%, transparent 100%),
          radial-gradient(2.5px 2.5px at 75% 45%, rgba(255,200,200,1) 0%, transparent 100%)
        ` }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%, rgba(2,6,23,0.4) 100%)" }} />
      </div>

      <style>{`
        @keyframes nebDrift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        @keyframes nebDrift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,15px)} }
        @keyframes nebDrift3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,25px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 15px ${theme.accent}20} 50%{box-shadow:0 0 25px ${theme.accent}40} }
        .pb-card { animation: fadeUp 0.4s ease both; transition: transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease; }
        .pb-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px -4px rgba(0,0,0,0.4), 0 0 0 1px ${theme.accent}30, 0 0 20px ${theme.accent}15 !important; border-color: ${theme.accent}50 !important; }
        .pb-card:hover .pb-card-glow { opacity: 1 !important; }
        .pb-fav { transition: color 0.2s, transform 0.2s; }
        .pb-fav:hover { transform: scale(1.2); }
        .pb-fav:active { animation: pulse 0.3s ease; }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.25)} }
        .pb-overlay { animation: fadeIn 0.2s ease; }
        .pb-modal { animation: slideUp 0.3s cubic-bezier(.4,0,.2,1); }
        .pb-search:focus { outline: none; box-shadow: 0 0 0 3px ${theme.accent}30, 0 0 15px ${theme.accent}15; border-color: ${theme.accent} !important; }
        .pb-side-item { transition: all 0.2s cubic-bezier(.4,0,.2,1); }
        .pb-side-item:hover { background: rgba(255,255,255,0.06) !important; }
        @media(max-width:767px){.pb-sid-desk{display:none!important}.pb-mob-btn{display:inline-flex!important}}
        @media(min-width:768px){.pb-sid-mob{display:none!important}.pb-sid-desk{display:block!important}.pb-mob-btn{display:none!important}}
      `}</style>

      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(2,6,23,0.6)", backdropFilter: "blur(16px) saturate(1.5)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
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
            <span style={{ fontSize: 16 }}>&larr;</span> Back
          </Link>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              <button onClick={() => setFontSize((s) => Math.max(13, s - 1))} style={{ padding: "8px 11px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "transparent", color: "#94A3B8", borderRight: "1px solid rgba(255,255,255,0.06)" }}>A&minus;</button>
              <span style={{ padding: "8px 13px", fontSize: 12, fontWeight: 700, color: theme.accent, background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.06)", minWidth: 36, textAlign: "center" }}>{fontSize}</span>
              <button onClick={() => setFontSize((s) => Math.min(26, s + 1))} style={{ padding: "8px 11px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "transparent", color: "#94A3B8" }}>A+</button>
            </div>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 1280, margin: "0 auto", padding: "32px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 14, backdropFilter: "blur(8px)" }}>
              <div style={{ width: 6, height: 6, borderRadius: 999, background: theme.accent, boxShadow: `0 0 8px ${theme.accent}80`, animation: "glowPulse 3s ease-in-out infinite" }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: theme.accent }}>Preces Catholicae</span>
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#FFFFFF", margin: 0, lineHeight: 1.15, letterSpacing: "-0.02em", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
              Catholic Prayer Book
            </h1>
            <p style={{ fontSize: 14, color: "#94A3B8", margin: "8px 0 0", lineHeight: 1.5 }}>
              {CATHOLIC_PRAYERS.length} prayers across {CATEGORIES.length} categories
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Prayers", val: CATHOLIC_PRAYERS.length, color: theme.accent },
              { label: "Categories", val: CATEGORIES.length, color: "#D97706" },
              { label: "Saved", val: bookmarks.size, color: "#FBBF24" },
            ].map((s) => (
              <div key={s.label} style={{
                textAlign: "center", padding: "12px 18px", borderRadius: 14,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(8px)", minWidth: 70,
              }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 1280, margin: "0 auto", padding: "0 24px 60px" }}>
        <div style={{ display: "flex", gap: 20 }}>
          {/* SIDEBAR */}
          <aside className="pb-sid-desk" style={{
            width: 250, flexShrink: 0, position: "sticky", top: 68, alignSelf: "flex-start",
            maxHeight: "calc(100vh - 84px)", overflowY: "auto",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: 16, backdropFilter: "blur(16px) saturate(1.3)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#64748B", marginBottom: 12, padding: "0 6px" }}>
              All Prayers
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {CATEGORIES.map((cat) => {
                const m = CATEGORY_META[cat];
                const t = CAT_THEME[cat];
                const count = categoryCounts[cat];
                const isActive = selectedCategory === cat && !searchQuery;
                return (
                  <button key={cat} className="pb-side-item" onClick={() => { setSelectedCategory(cat); setSearchQuery(""); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      width: "100%", padding: "10px 12px", borderRadius: 10,
                      border: "none", cursor: "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400,
                      textAlign: "left", position: "relative",
                      background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                      color: isActive ? "#FFFFFF" : "#94A3B8",
                    }}>
                    {isActive && (
                      <div style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, background: t.gradient, boxShadow: `0 0 8px ${t.accent}60` }} />
                    )}
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.label}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, minWidth: 22, textAlign: "center",
                      padding: "2px 0", borderRadius: 6,
                      color: isActive ? t.accent : "#475569",
                      background: isActive ? `${t.accent}15` : "transparent",
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>
            {bookmarkedPrayers.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#64748B", marginBottom: 10, padding: "0 6px" }}>
                  Favorites ({bookmarkedPrayers.length})
                </div>
                {bookmarkedPrayers.slice(0, 6).map((p) => (
                  <button key={p.id} onClick={() => setSelectedPrayer(p)}
                    style={{ display: "block", width: "100%", padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, textAlign: "left", background: "transparent", color: "#94A3B8", transition: "all 0.15s", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#E2E8F0"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94A3B8"; }}
                  >{p.title}</button>
                ))}
              </div>
            )}
          </aside>

          {/* Mobile sidebar overlay */}
          {mobileSidebar && (
            <div className="pb-overlay pb-sid-mob" style={{ position: "fixed", inset: 0, zIndex: 40 }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} onClick={() => setMobileSidebar(false)} />
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 300, background: "rgba(10,14,39,0.98)", borderRight: "1px solid rgba(255,255,255,0.06)", padding: 24, overflowY: "auto", backdropFilter: "blur(20px)", animation: "slideUp 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#64748B" }}>All Prayers</span>
                  <button onClick={() => setMobileSidebar(false)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontSize: 12, fontWeight: 600, background: "rgba(255,255,255,0.04)", color: "#94A3B8" }}>Close</button>
                </div>
                {CATEGORIES.map((cat) => {
                  const m = CATEGORY_META[cat];
                  const isActive = selectedCategory === cat && !searchQuery;
                  return (
                    <button key={cat} onClick={() => { setSelectedCategory(cat); setSearchQuery(""); setMobileSidebar(false); }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "12px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: isActive ? 600 : 400, textAlign: "left", background: isActive ? "rgba(255,255,255,0.08)" : "transparent", color: isActive ? "#FFFFFF" : "#94A3B8" }}>
                      <span>{m.label}</span>
                      <span style={{ fontSize: 12, color: "#475569" }}>{categoryCounts[cat]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RIGHT CONTENT */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
              <button onClick={() => setMobileSidebar(true)} className="pb-mob-btn" style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.04)", color: "#94A3B8", display: "none", alignItems: "center", gap: 6, backdropFilter: "blur(8px)" }}>
                &#9776; Categories
              </button>
              <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748B", fontSize: 14, pointerEvents: "none" }}>&#128269;</span>
                <input className="pb-search" type="text" placeholder="Search prayers, tags, or text..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px 12px 40px", borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.08)", fontSize: 14,
                    background: "rgba(255,255,255,0.04)", color: "#F1F5F9",
                    transition: "box-shadow 0.2s, border-color 0.2s", backdropFilter: "blur(8px)",
                  }} />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontSize: 11, fontWeight: 600, background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}>Clear</button>
                )}
              </div>
            </div>

            {!searchQuery && (
              <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${theme.accent}35` }}>
                  <span style={{ fontSize: 20, filter: "brightness(10)" }}>{meta.icon}</span>
                </div>
                <div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>{meta.label}</h2>
                  <p style={{ fontSize: 13, color: "#94A3B8", margin: "2px 0 0" }}>{meta.description} &middot; {filteredPrayers.length} prayers</p>
                </div>
              </div>
            )}
            {searchQuery && (
              <div style={{ marginBottom: 20, fontSize: 14, color: "#94A3B8" }}>
                {filteredPrayers.length} result{filteredPrayers.length !== 1 ? "s" : ""} for "<span style={{ fontWeight: 600, color: "#FFFFFF" }}>{searchQuery}</span>"
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(290px, 100%), 1fr))", gap: 14 }}>
              {filteredPrayers.map((prayer, idx) => {
                const isMarked = bookmarks.has(prayer.id);
                const t = CAT_THEME[prayer.category];
                return (
                  <div key={prayer.id} className="pb-card" onClick={() => setSelectedPrayer(prayer)}
                    style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 14, cursor: "pointer", overflow: "hidden", position: "relative",
                      backdropFilter: "blur(12px)", animationDelay: `${Math.min(idx * 0.03, 0.3)}s`,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    }}>
                    <div className="pb-card-glow" style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 0%, ${t.accent}10 0%, transparent 60%)`, opacity: 0, transition: "opacity 0.3s", pointerEvents: "none" }} />
                    <div style={{ height: 3, background: t.gradient, opacity: 0.6 }} />
                    <div style={{ padding: "16px 18px 14px", position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                        <h3 style={{ fontSize: "0.92rem", fontWeight: 600, color: "#F1F5F9", margin: 0, lineHeight: 1.4, flex: 1 }}>{prayer.title}</h3>
                        <button className="pb-fav" onClick={(e) => { e.stopPropagation(); toggleBookmark(prayer.id); }}
                          style={{ flexShrink: 0, padding: "4px", border: "none", cursor: "pointer", fontSize: 18, background: "transparent", color: isMarked ? "#FBBF24" : "#475569" }}>
                          {isMarked ? "\u2605" : "\u2606"}
                        </button>
                      </div>
                      <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {prayer.snippet}
                      </p>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}>{prayer.readTime} min</span>
                        <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: `${t.accent}15`, color: t.accent }}>{CATEGORY_META[prayer.category].label}</span>
                        {completedPrayers.has(prayer.id) && (
                          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "rgba(52,211,153,0.12)", color: "#6EE7B7" }}>&#10003; Done</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredPrayers.length === 0 && (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "#64748B" }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>&#128220;</div>
                <p style={{ fontSize: 15, margin: 0 }}>No prayers found</p>
                <p style={{ fontSize: 13, margin: "4px 0 0" }}>Try a different search or category</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* READER MODAL */}
      {selectedPrayer && (() => {
        const t = CAT_THEME[selectedPrayer.category];
        return (
          <div className="pb-overlay" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(2,6,23,0.7)", backdropFilter: "blur(10px)" }} onClick={() => setSelectedPrayer(null)} />
            <div className="pb-modal" style={{
              position: "relative", width: "100%", maxWidth: 660, maxHeight: "88vh",
              display: "flex", flexDirection: "column", borderRadius: 20, overflow: "hidden",
              background: "rgba(15,18,35,0.95)", border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 32px 80px -12px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3)",
              backdropFilter: "blur(20px) saturate(1.5)",
            }}>
              <div style={{ background: t.gradient, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)" }} />
                <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF", margin: 0, lineHeight: 1.3, textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>{selectedPrayer.title}</h2>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.2)", color: "#FFFFFF" }}>{selectedPrayer.readTime} min read</span>
                      <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.15)", color: "#FFFFFF" }}>{CATEGORY_META[selectedPrayer.category].label}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                    {[
                      { l: bookmarks.has(selectedPrayer.id) ? "\u2605" : "\u2606", a: () => toggleBookmark(selectedPrayer.id), active: bookmarks.has(selectedPrayer.id) },
                      { l: "\u25C0", a: () => { const i = filteredPrayers.findIndex((p) => p.id === selectedPrayer.id); if (i > 0) setSelectedPrayer(filteredPrayers[i - 1]); }, dis: filteredPrayers.findIndex((p) => p.id === selectedPrayer.id) === 0 },
                      { l: "\u25B6", a: () => { const i = filteredPrayers.findIndex((p) => p.id === selectedPrayer.id); if (i < filteredPrayers.length - 1) setSelectedPrayer(filteredPrayers[i + 1]); }, dis: filteredPrayers.findIndex((p) => p.id === selectedPrayer.id) === filteredPrayers.length - 1 },
                      { l: "\u2715", a: () => setSelectedPrayer(null) },
                    ].map((b, i) => (
                      <button key={i} onClick={b.a} disabled={b.dis}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", cursor: b.dis ? "default" : "pointer", fontSize: 12, fontWeight: 600, background: b.active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", color: "#FFFFFF", opacity: b.dis ? 0.4 : 1, transition: "all 0.15s" }}>
                        {b.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
                {renderPrayerText(selectedPrayer.text, fontSize, t.accent)}
              </div>
              <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {selectedPrayer.tags.slice(0, 4).map((tag) => (
                    <span key={tag} style={{ padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 500, background: "rgba(255,255,255,0.04)", color: "#64748B" }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => toggleCompleted(selectedPrayer.id)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${completedPrayers.has(selectedPrayer.id) ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.06)"}`, cursor: "pointer", fontSize: 12, fontWeight: 600, background: completedPrayers.has(selectedPrayer.id) ? "rgba(52,211,153,0.1)" : "transparent", color: completedPrayers.has(selectedPrayer.id) ? "#6EE7B7" : "#94A3B8", transition: "all 0.2s" }}>
                    {completedPrayers.has(selectedPrayer.id) ? "\u2713 Completed" : "Mark Done"}
                  </button>
                  <span style={{ fontSize: 11, color: "#475569" }}>
                    {filteredPrayers.findIndex((p) => p.id === selectedPrayer.id) + 1} / {filteredPrayers.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
