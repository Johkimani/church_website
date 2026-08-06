import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CATHOLIC_PRAYERS,
  CATEGORY_META,
  type CatholicPrayer,
  type PrayerCategory,
} from "../data/catholicPrayers";
import { useParchmentTheme } from "../parchmentTheme";
import "../parchment.css";

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
  confession: "CO",
  litanies: "L",
  saints: "S",
  devotions: "DE",
  meals: "ME",
  fasting: "J",
  special: "E",
};

const ROMAN = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX",
  "X", "XI", "XII", "XIII", "XIV", "XV", "XVI",
];

const toRoman = (n: number) => ROMAN[n - 1] ?? String(n);

const FAVORITES_TAB = "__favorites__";
type ChapterTab = PrayerCategory | typeof FAVORITES_TAB;

const FAVORITES_META = {
  label: "My Favorites",
  description: "Prayers you have bookmarked for quick access",
};

const TAB_SHORT: Record<PrayerCategory, string> = {
  morning: "Morning",
  daytime: "Daytime",
  evening: "Evening",
  night: "Night",
  mass: "Mass",
  rosary: "Rosary",
  essential: "Essential",
  acts: "Acts",
  confession: "Confession",
  litanies: "Litanies",
  saints: "Saints",
  devotions: "Devotions",
  meals: "Meals",
  fasting: "Fasting",
  special: "Special",
};

export default function Readings() {
  const { theme, isDark, toggleTheme } = useParchmentTheme();
  const [selectedCategory, setSelectedCategory] = useState<ChapterTab>("morning");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPrayer, setSelectedPrayer] = useState<CatholicPrayer | null>(() => {
    const pid = searchParams.get("prayer");
    return pid ? CATHOLIC_PRAYERS.find((x) => x.id === pid) ?? null : null;
  });
  const [copied, setCopied] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("catholic-prayer-bookmarks") || "[]"));
    } catch { return new Set(); }
  });
  const [fontSize, setFontSize] = useState(() => {
    try {
      const n = parseInt(localStorage.getItem("prayer-font-size") || "18");
      return Math.min(24, Math.max(14, Number.isFinite(n) ? n : 18));
    } catch { return 18; }
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

  const openPrayer = useCallback((prayer: CatholicPrayer) => {
    setSelectedPrayer(prayer);
    setCopied(false);
    setSearchParams({ prayer: prayer.id }, { replace: true });
  }, [setSearchParams]);

  const closePrayer = useCallback(() => {
    setSelectedPrayer(null);
    setCopied(false);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("prayer");
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const copyPrayerLink = useCallback(async (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}?prayer=${encodeURIComponent(id)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); } catch { /* ignore */ }
      document.body.removeChild(ta);
      setTimeout(() => setCopied(false), 1500);
    }
  }, []);

  // If the last bookmark is removed while on the Favorites tab, fall back to Morning
  // so the user is never stranded on an empty favorites view with no visible tab.
  const effectiveTab: ChapterTab =
    selectedCategory === FAVORITES_TAB && bookmarks.size === 0 ? "morning" : selectedCategory;

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
    if (effectiveTab === FAVORITES_TAB) {
      return CATHOLIC_PRAYERS.filter((p) => bookmarks.has(p.id));
    }
    return CATHOLIC_PRAYERS.filter((p) => p.category === effectiveTab);
  }, [effectiveTab, searchQuery, bookmarks]);

  const selectedIndex = CATEGORIES.indexOf(effectiveTab);

  const activeIsFav = effectiveTab === FAVORITES_TAB;
  const activeMeta = activeIsFav ? FAVORITES_META : CATEGORY_META[effectiveTab];
  const activeIcon = activeIsFav ? "\u2726" : SECTION_ICONS[effectiveTab];
  const activeNumeral = activeIsFav ? "\u2726" : toRoman(selectedIndex + 1);

  const contentRef = useRef<HTMLDivElement>(null);

  const selectTab = useCallback((tab: ChapterTab) => {
    setSelectedCategory(tab);
    setSearchQuery("");
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      counts[cat] = CATHOLIC_PRAYERS.filter((p) => p.category === cat).length;
    });
    return counts;
  }, []);

  const ribbonTabs = useMemo(() => {
    const list: { key: ChapterTab; icon: string; label: string; count: number }[] = [];
    if (bookmarks.size > 0) {
      list.push({ key: FAVORITES_TAB, icon: "\u2726", label: "Favorites", count: bookmarks.size });
    }
    CATEGORIES.forEach((cat, i) => {
      list.push({
        key: cat,
        icon: toRoman(i + 1),
        label: TAB_SHORT[cat],
        count: categoryCounts[cat],
      });
    });
    return list;
  }, [bookmarks.size, categoryCounts]);

  // Keyboard nav in reader (left/right only so up/down can scroll freely)
  useEffect(() => {
    if (!selectedPrayer) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePrayer();
        return;
      }
      const idx = filteredPrayers.findIndex((p) => p.id === selectedPrayer.id);
      if (idx === -1) return;
      if (e.key === "ArrowRight" && idx < filteredPrayers.length - 1) {
        openPrayer(filteredPrayers[idx + 1]);
      } else if (e.key === "ArrowLeft" && idx > 0) {
        openPrayer(filteredPrayers[idx - 1]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedPrayer, filteredPrayers, openPrayer, closePrayer]);

  const renderPrayerText = (text: string, size: number) => {
    const lines = text.split("\n");
    const firstIdx = lines.findIndex((l) => l.trim().length > 0);
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-3" />;

      // V./R. responses
      if (/^[VR]\.\s/.test(trimmed)) {
        return (
          <div key={i} className="flex gap-2 my-2">
            <span className="gold font-bold flex-shrink-0" style={{ fontSize: size }}>
              {trimmed.substring(0, 2)}
            </span>
            <span className="muted italic" style={{ fontSize: size }}>
              {trimmed.substring(3)}
            </span>
          </div>
        );
      }

      // Let us pray
      if (/^Let us pray/i.test(trimmed)) {
        return (
          <p key={i} className="mt-4 mb-2 italic gold-deep" style={{ fontSize: size - 1 }}>
            {trimmed}
          </p>
        );
      }

      // Heading lines (ALL CAPS section titles — at least 8 chars to avoid false positives)
      if (/^[A-Z\s]{8,}$/.test(trimmed)) {
        return (
          <h3 key={i} className="font-caps-book small-caps ink text-center mt-6 mb-3">
            {trimmed}
          </h3>
        );
      }

      // Glory Be / Amen lines
      if (/^Glory be/i.test(trimmed) || trimmed === "Amen.") {
        return (
          <p key={i} className="text-center italic faint my-2" style={{ fontSize: size - 1 }}>
            {trimmed}
          </p>
        );
      }

      // Standard paragraph (drop cap on the opening line)
      return (
        <p
          key={i}
          className={`ink leading-[1.9] mb-3 ${i === firstIdx ? "dropcap" : ""}`}
          style={{ fontSize: size }}
        >
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="parchment parchment-bg min-h-screen" data-theme={theme}>
      {/* ═══════════════════════════════════════════════════ */}
      {/* FRONTISPIECE                                       */}
      {/* ═══════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(620px 280px at 50% 0%, var(--p-gold-soft), transparent 72%)" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="gold-rule-fill h-px w-12 sm:w-20" />
            <span className="gold text-lg leading-none">{'\u2720'}</span>
            <span className="gold-rule-fill h-px w-12 sm:w-20" />
          </div>
          <p className="small-caps gold mb-4">Preces Catholicae</p>
          <h1 className="font-serif-book text-4xl sm:text-5xl ink font-semibold leading-[1.05]">
            The Catholic<br />Prayer Book
          </h1>
          <div className="mx-auto mt-5 flex items-center justify-center gap-3 max-w-xs">
            <span className="gold-rule-fill h-px flex-1" />
            <span className="gold text-base leading-none">{'\u2766'}</span>
            <span className="gold-rule-fill h-px flex-1" />
          </div>
          <p className="muted italic font-body-book mt-4 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            A collection of traditional prayers for every moment of the Christian life
          </p>
        </div>
        <div className="h-px w-full" style={{ backgroundColor: "var(--p-gold-line)" }} />
      </header>

      {/* ═══════════════════════════════════════════════════ */}
      {/* TOOLBAR — search, font size, theme                 */}
      {/* ═══════════════════════════════════════════════════ */}
      <div
        className="sticky top-16 lg:top-20 z-30"
        style={{ backgroundColor: "var(--p-bg)", borderBottom: "1px solid var(--p-rule)" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search prayers..."
              aria-label="Search prayers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-field focus-gold w-full pl-10 pr-9 py-2.5 rounded-xl text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 faint hover-gold"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => setFontSize((s) => Math.max(14, s - 1))}
              aria-label="Decrease font size"
              className="btn-ghost p-2 rounded-lg font-serif-book font-semibold text-base"
            >
              {"A\u2212"}
            </button>
            <span className="faint text-xs w-5 text-center font-body-book">{fontSize}</span>
            <button
              onClick={() => setFontSize((s) => Math.min(24, s + 1))}
              aria-label="Increase font size"
              className="btn-ghost p-2 rounded-lg font-serif-book font-semibold text-base"
            >
              A+
            </button>
          </div>

          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="btn-ghost p-2 rounded-lg flex-shrink-0"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36l-1.42 1.42M7.04 16.95l-1.41 1.41m12.73 0l-1.42-1.42M7.04 7.05L5.63 5.63M12 17a5 5 0 100-10 5 5 0 000 10z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.35 15.5A8.5 8.5 0 0110.5 3.65 8.5 8.5 0 1020.35 15.5z" />
              </svg>
            )}
          </button>
        </div>

        {/* CHAPTER TABS — instantly switch the list right below */}
        <nav aria-label="Prayer chapters" className="max-w-3xl mx-auto px-4 pb-3">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
            {ribbonTabs.map((t) => {
              const active = effectiveTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => selectTab(t.key)}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 flex-shrink-0 pl-3 pr-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                    active
                      ? "gold-soft gold-rule ink font-semibold"
                      : "border-[color:var(--p-rule)] muted hover-rule hover-soft"
                  }`}
                >
                  <span className={`font-serif-book text-sm leading-none ${active ? "gold" : "faint"}`}>
                    {t.icon}
                  </span>
                  <span className="font-body-book whitespace-nowrap">{t.label}</span>
                  <span className={`text-[10px] leading-none ${active ? "gold" : "faint"}`}>{t.count}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <div ref={contentRef} className="max-w-3xl mx-auto px-4 scroll-mt-28">
        {/* ═══════════════════════════════════════════════════ */}
        {/* CHAPTER HEADER                                     */}
        {/* ═══════════════════════════════════════════════════ */}
        {!searchQuery && (
          <div className="text-center mt-8 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <span className="gold-rule-fill h-px w-10 sm:w-14" />
              <span className="small-caps gold">
                {activeNumeral} · {activeIcon}
              </span>
              <span className="gold-rule-fill h-px w-10 sm:w-14" />
            </div>
            <h2 className="font-serif-book text-3xl sm:text-4xl ink font-semibold leading-tight">{activeMeta.label}</h2>
            <p className="muted italic font-body-book mt-2 text-sm">{activeMeta.description}</p>
          </div>
        )}

        {searchQuery && (
          <div className="mt-6 mb-4 flex items-center gap-2">
            <p className="text-sm muted">
              {filteredPrayers.length} result{filteredPrayers.length !== 1 ? "s" : ""} for
            </p>
            <span className="font-serif-book italic ink text-base">"{searchQuery}"</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* PRAYER INDEX — BOOK LIST                           */}
        {/* ═══════════════════════════════════════════════════ */}
        {filteredPrayers.length === 0 ? (
          <div className="text-center py-20">
            <div className="gold text-2xl mb-4">{'\u2766'}</div>
            <h3 className="font-serif-book text-2xl ink mb-1">No prayers found</h3>
            <p className="muted text-sm">Try a different search term or browse another chapter</p>
          </div>
        ) : (
          <div className="paper rounded-2xl mb-12 overflow-hidden">
            {filteredPrayers.map((prayer, idx) => {
              const isBookmarked = bookmarks.has(prayer.id);
              return (
                <button
                  key={prayer.id}
                  onClick={() => openPrayer(prayer)}
                  className="prayer-row w-full flex items-center gap-4 px-4 py-3.5 text-left border-b rule last:border-b-0 transition-colors"
                >
                  <span className="font-serif-book text-lg gold w-8 text-right flex-shrink-0">
                    {idx + 1}.
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="prayer-title block font-body-book font-medium ink truncate">
                      {prayer.title}
                    </span>
                    <span className="block text-xs faint truncate mt-0.5">
                      {prayer.text.substring(0, 90)}...
                    </span>
                  </span>
                  <span className="flex items-center gap-2.5 flex-shrink-0">
                    {isBookmarked && (
                      <span className="gold text-sm leading-none">{'\u2726'}</span>
                    )}
                    <span className="row-arrow faint text-sm leading-none transition-colors">
                      {'\u2192'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* FOOTER                                             */}
        {/* ═══════════════════════════════════════════════════ */}
        {!searchQuery && (
          <div className="text-center pt-8 pb-10">
            <div className="gold text-sm mb-3">{'\u2720'}</div>
            <p className="small-caps faint">
              Sources — USCCB · Vatican · EWTN · Traditional Catholic Prayer Books
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* READER — OPEN BOOK PAGE                            */}
      {/* ═══════════════════════════════════════════════════ */}
      {selectedPrayer && (
        <div
          className="fixed inset-0 z-[60] flex"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prayer-title"
          style={{ backgroundColor: "var(--p-overlay)", backdropFilter: "blur(6px)" }}
          onClick={closePrayer}
        >
          <div
            className="page-sheen paper relative mx-auto my-4 sm:my-8 w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] rounded-2xl flex flex-col overflow-hidden"
            style={{ boxShadow: "0 30px 80px var(--p-shadow)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Page header */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b rule">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full border gold-rule flex items-center justify-center font-serif-book text-sm gold">
                  {SECTION_ICONS[selectedPrayer.category]}
                </span>
                <span className="small-caps muted">{CATEGORY_META[selectedPrayer.category].label}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => copyPrayerLink(selectedPrayer.id)}
                  aria-label={copied ? "Prayer link copied" : "Copy prayer link"}
                  title="Copy link"
                  className="btn-ghost p-2 rounded-lg"
                >
                  {copied ? (
                    <svg className="w-5 h-5" style={{ color: "var(--p-gold)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => toggleBookmark(selectedPrayer.id)}
                  aria-label={bookmarks.has(selectedPrayer.id) ? "Remove bookmark" : "Add bookmark"}
                  className="btn-ghost p-2 rounded-lg"
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: bookmarks.has(selectedPrayer.id) ? "var(--p-gold)" : undefined }}
                    fill={bookmarks.has(selectedPrayer.id) ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <button
                  onClick={closePrayer}
                  aria-label="Close prayer"
                  className="btn-ghost p-2 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Title page */}
            <div className="px-6 sm:px-10 pt-7 pb-5 text-center border-b rule">
              <div className="flex items-center justify-center gap-3 mb-3 max-w-xs mx-auto">
                <span className="gold-rule-fill h-px flex-1" />
                <span className="gold text-base leading-none">{'\u2766'}</span>
                <span className="gold-rule-fill h-px flex-1" />
              </div>
              <h2 id="prayer-title" className="font-serif-book text-3xl sm:text-4xl ink font-semibold leading-tight">
                {selectedPrayer.title}
              </h2>
            </div>

            {/* Prayer text — book page */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8">
              <div className="max-w-xl mx-auto font-body-book">
                {renderPrayerText(selectedPrayer.text, fontSize)}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between gap-2 px-6 py-3 border-t rule">
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                {selectedPrayer.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full border rule-strong muted text-[10px] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-0.5 mr-1">
                  <button
                    onClick={() => setFontSize((s) => Math.max(14, s - 1))}
                    aria-label="Decrease font size"
                    className="btn-ghost p-1.5 rounded-lg font-serif-book font-semibold text-sm"
                  >
                    {"A\u2212"}
                  </button>
                  <button
                    onClick={() => setFontSize((s) => Math.min(24, s + 1))}
                    aria-label="Increase font size"
                    className="btn-ghost p-1.5 rounded-lg font-serif-book font-semibold text-sm"
                  >
                    A+
                  </button>
                </div>
                <button
                  onClick={() => {
                    const idx = filteredPrayers.findIndex((p) => p.id === selectedPrayer.id);
                    if (idx > 0) openPrayer(filteredPrayers[idx - 1]);
                  }}
                  disabled={filteredPrayers.findIndex((p) => p.id === selectedPrayer.id) === 0}
                  aria-label="Previous prayer"
                  className="btn-ghost p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const idx = filteredPrayers.findIndex((p) => p.id === selectedPrayer.id);
                    if (idx < filteredPrayers.length - 1) openPrayer(filteredPrayers[idx + 1]);
                  }}
                  disabled={filteredPrayers.findIndex((p) => p.id === selectedPrayer.id) === filteredPrayers.length - 1}
                  aria-label="Next prayer"
                  className="btn-ghost p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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
