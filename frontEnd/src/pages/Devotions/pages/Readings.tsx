import { useState, useMemo, useEffect, useCallback } from "react";
import {
  CATHOLIC_PRAYERS,
  CATEGORY_META,
  type CatholicPrayer,
  type PrayerCategory,
} from "../data/catholicPrayers";

const CATEGORIES = Object.keys(CATEGORY_META) as PrayerCategory[];

const SECTION_ICONS: Record<PrayerCategory, string> = {
  morning: "M",
  daytime: "D",
  evening: "V",
  night: "N",
  mass: "MA",
  rosary: "R",
  essential: "CE",
  acts: "AV",
  litanies: "L",
  saints: "S",
  devotions: "DE",
  fasting: "J",
  special: "E",
};

export default function Readings() {
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory>("morning");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrayer, setSelectedPrayer] = useState<CatholicPrayer | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("catholic-prayer-bookmarks") || "[]"));
    } catch { return new Set(); }
  });
  const [fontSize, setFontSize] = useState(() => {
    try { return parseInt(localStorage.getItem("prayer-font-size") || "18"); } catch { return 18; }
  });

  useEffect(() => {
    localStorage.setItem("prayer-font-size", String(fontSize));
  }, [fontSize]);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("catholic-prayer-bookmarks", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const filteredPrayers = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return CATHOLIC_PRAYERS.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.text.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }
    return CATHOLIC_PRAYERS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, searchQuery]);

  const bookmarkedPrayers = useMemo(
    () => CATHOLIC_PRAYERS.filter((p) => bookmarks.has(p.id)),
    [bookmarks]
  );

  const totalPrayers = CATHOLIC_PRAYERS.length;
  const meta = CATEGORY_META[selectedCategory];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      counts[cat] = CATHOLIC_PRAYERS.filter((p) => p.category === cat).length;
    });
    return counts;
  }, []);

  // Keyboard nav in reader
  useEffect(() => {
    if (!selectedPrayer) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPrayer(null);
      const idx = filteredPrayers.findIndex((p) => p.id === selectedPrayer.id);
      if (idx === -1) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        if (idx < filteredPrayers.length - 1) setSelectedPrayer(filteredPrayers[idx + 1]);
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        if (idx > 0) setSelectedPrayer(filteredPrayers[idx - 1]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedPrayer, filteredPrayers]);

  const renderPrayerText = (text: string, size: number) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-3" />;

      // V./R. responses
      if (/^[VR]\.\s/.test(trimmed)) {
        return (
          <div key={i} className="flex gap-2 my-2">
            <span className="font-bold text-amber-700 flex-shrink-0" style={{ fontSize: size }}>
              {trimmed.substring(0, 2)}
            </span>
            <span className="italic text-slate-700" style={{ fontSize: size }}>
              {trimmed.substring(3)}
            </span>
          </div>
        );
      }

      // Let us pray
      if (/^Let us pray/i.test(trimmed)) {
        return (
          <p key={i} className="mt-4 mb-2 italic text-slate-600" style={{ fontSize: size }}>
            {trimmed}
          </p>
        );
      }

      // Heading lines (ALL CAPS section titles — at least 8 chars to avoid false positives)
      if (/^[A-Z\s]{8,}$/.test(trimmed)) {
        return (
          <h3 key={i} className="text-center font-bold text-slate-800 mt-6 mb-3 tracking-wider text-sm uppercase">
            {trimmed}
          </h3>
        );
      }

      // Glory Be / Amen lines
      if (/^Glory be/i.test(trimmed) || trimmed === "Amen.") {
        return (
          <p key={i} className="text-center italic text-slate-500 my-2" style={{ fontSize: size - 1 }}>
            {trimmed}
          </p>
        );
      }

      // Standard paragraph
      return (
        <p key={i} className="text-slate-700 leading-[1.9] mb-3" style={{ fontSize: size }}>
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/20 to-stone-50">
      {/* ═══════════════════════════════════════════════════ */}
      {/* BOOK COVER HERO                                   */}
      {/* ═══════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-stone-800 via-stone-900 to-slate-900">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)`
        }} />
        <div className="relative max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-amber-300/80 mb-4 tracking-widest uppercase border border-white/10">
            <span>{'\u271D'}</span>
            <span>Preces Catholicae</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white mb-3 font-bold tracking-wide">
            Catholic Prayer Book
          </h1>
          <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed font-serif italic">
            A collection of traditional prayers for every moment of the Christian life
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-[10px] text-stone-500 font-bold tracking-widest uppercase">
            <span>{totalPrayers} Prayers</span>
            <span className="text-stone-700">{'\u2022'}</span>
            <span>13 Categories</span>
            <span className="text-stone-700">{'\u2022'}</span>
            <span>USCCB & Vatican Sources</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* ═══════════════════════════════════════════════════ */}
        {/* SEARCH + FONT SIZE                                */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="flex items-center gap-3 -mt-5 mb-6 relative z-10">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search prayers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 bg-white rounded-xl border border-stone-200 px-2 py-1.5 shadow-sm">
            <button onClick={() => setFontSize((s) => Math.max(14, s - 1))} aria-label="Decrease font size" className="p-1 text-stone-400 hover:text-stone-600 text-xs font-bold">A-</button>
            <span className="text-[10px] text-stone-400 font-bold w-5 text-center">{fontSize}</span>
            <button onClick={() => setFontSize((s) => Math.min(24, s + 1))} aria-label="Increase font size" className="p-1 text-stone-400 hover:text-stone-600 text-xs font-bold">A+</button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* BOOKMARKS BAR                                     */}
        {/* ═══════════════════════════════════════════════════ */}
        {bookmarkedPrayers.length > 0 && !searchQuery && (
          <div className="mb-6 p-4 bg-amber-50/80 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">My Favorites ({bookmarkedPrayers.length})</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {bookmarkedPrayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPrayer(p)}
                  className="flex-shrink-0 px-2.5 py-1 bg-white text-amber-700 rounded-lg text-[11px] font-medium border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* CHAPTER-STYLE CATEGORY NAVIGATION                  */}
        {/* ═══════════════════════════════════════════════════ */}
        {!searchQuery && (
          <div className="mb-8">
            <h2 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-3">Table of Contents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {CATEGORIES.map((cat) => {
                const m = CATEGORY_META[cat];
                const count = categoryCounts[cat];
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      isActive
                        ? "bg-stone-800 text-white shadow-md"
                        : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-100"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                    }`}>
                      {SECTION_ICONS[cat]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-stone-800"}`}>
                        {m.label}
                      </div>
                      <div className={`text-[10px] ${isActive ? "text-stone-300" : "text-stone-400"}`}>
                        {count} prayer{count !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <svg className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white/50" : "text-stone-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* SEARCH RESULTS HEADER                              */}
        {/* ═══════════════════════════════════════════════════ */}
        {searchQuery && (
          <div className="mb-4 flex items-center gap-2">
            <p className="text-sm text-stone-500">
              {filteredPrayers.length} result{filteredPrayers.length !== 1 ? "s" : ""} for
            </p>
            <span className="font-serif italic text-stone-800">"{searchQuery}"</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* PRAYER LIST — BOOK STYLE                          */}
        {/* ═══════════════════════════════════════════════════ */}
        {!searchQuery && (
          <div className="mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-stone-800 flex items-center justify-center text-[10px] font-bold text-white">
              {SECTION_ICONS[selectedCategory]}
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-800">{meta.label}</h2>
              <p className="text-[11px] text-stone-500">{meta.description}</p>
            </div>
          </div>
        )}

        {filteredPrayers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-base font-serif font-bold text-stone-600 mb-1">No prayers found</h3>
            <p className="text-sm text-stone-400">Try a different search term or browse another chapter</p>
          </div>
        ) : (
          <div className="space-y-1 mb-12">
            {filteredPrayers.map((prayer, idx) => {
              const isBookmarked = bookmarks.has(prayer.id);
              return (
                <button
                  key={prayer.id}
                  onClick={() => setSelectedPrayer(prayer)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left hover:bg-white hover:shadow-sm border border-transparent hover:border-stone-100 transition-all group"
                >
                  <span className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-stone-800 group-hover:text-white flex items-center justify-center text-[10px] font-bold text-stone-400 flex-shrink-0 transition-colors">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-serif font-bold text-stone-800 group-hover:text-amber-700 transition-colors truncate">
                      {prayer.title}
                    </h3>
                    <p className="text-[11px] text-stone-400 truncate mt-0.5">
                      {prayer.text.substring(0, 80)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-stone-400 font-medium">{prayer.readTime} min</span>
                    {isBookmarked && (
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                    <svg className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* FOOTER                                             */}
        {/* ═══════════════════════════════════════════════════ */}
        {!searchQuery && (
          <div className="text-center py-8 border-t border-stone-100 mb-8">
            <p className="text-[10px] text-stone-400 font-serif italic">
              All prayers sourced from USCCB, Vatican, EWTN, and traditional Catholic prayer books
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* FULL PRAYER READER MODAL — BOOK PAGE STYLE        */}
      {/* ═══════════════════════════════════════════════════ */}
      {selectedPrayer && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby="prayer-title">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"
            onClick={() => setSelectedPrayer(null)}
          />

          {/* Book page */}
          <div className="relative mx-auto my-4 sm:my-8 w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] bg-[#FFFEF8] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200/50">
            {/* Page header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/60 bg-[#FFFEF8]">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-md bg-stone-800 flex items-center justify-center text-[10px] font-bold text-white">
                  {SECTION_ICONS[selectedPrayer.category]}
                </span>
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                    {CATEGORY_META[selectedPrayer.category].label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleBookmark(selectedPrayer.id)}
                  aria-label={bookmarks.has(selectedPrayer.id) ? "Remove bookmark" : "Add bookmark"}
                  className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <svg className={`w-4 h-4 ${bookmarks.has(selectedPrayer.id) ? "text-amber-500" : "text-stone-300"}`} fill={bookmarks.has(selectedPrayer.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedPrayer(null)}
                  aria-label="Close prayer"
                  className="p-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Title page */}
            <div className="px-6 sm:px-10 pt-8 pb-4 text-center border-b border-stone-100">
              <h2 id="prayer-title" className="text-2xl sm:text-3xl font-serif font-bold text-stone-800 mb-2">
                {selectedPrayer.title}
              </h2>
              <div className="flex items-center justify-center gap-3 text-[10px] text-stone-400 font-medium">
                <span>{selectedPrayer.readTime} min read</span>
                <span className="text-stone-200">|</span>
                <span>{selectedPrayer.text.split(/\s+/).length} words</span>
              </div>
            </div>

            {/* Prayer text — book page */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8">
              <div className="max-w-lg mx-auto font-serif">
                {renderPrayerText(selectedPrayer.text, fontSize)}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-stone-100 bg-[#FFFEF8]">
              <div className="flex flex-wrap gap-1">
                {selectedPrayer.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded text-[9px] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const idx = filteredPrayers.findIndex((p) => p.id === selectedPrayer.id);
                    if (idx > 0) setSelectedPrayer(filteredPrayers[idx - 1]);
                  }}
                  disabled={filteredPrayers.findIndex((p) => p.id === selectedPrayer.id) === 0}
                  aria-label="Previous prayer"
                  className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed text-stone-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const idx = filteredPrayers.findIndex((p) => p.id === selectedPrayer.id);
                    if (idx < filteredPrayers.length - 1) setSelectedPrayer(filteredPrayers[idx + 1]);
                  }}
                  disabled={filteredPrayers.findIndex((p) => p.id === selectedPrayer.id) === filteredPrayers.length - 1}
                  aria-label="Next prayer"
                  className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed text-stone-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
