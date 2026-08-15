import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaArrowRight,
  FaSearch,
  FaCopy,
  FaTimes,
  FaCheck,
  FaChevronDown,
  FaRegBookmark,
  FaBookmark as FaBookmarkSolid,
  FaBars,
} from "react-icons/fa";
import { getStaticChapter, getStaticBooks, getStaticVersions } from "../data/bibleData";
import { apiClient } from "../../../api/axiosInstance";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BibleVersionInfo {
  id: string;
  name: string;
  subtitle: string;
  source?: string;
  testaments: string[];
}

interface BookInfo {
  code: string;
  name: string;
  testament: string;
  chapters: number;
}

interface Verse {
  verse: number;
  text: string;
}

interface Bookmark {
  version: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
  timestamp: number;
}

interface LastRead {
  bookCode: string;
  bookName: string;
  chapter: number;
  version: string;
  timestamp: number;
}

interface RecentBook {
  code: string;
  name: string;
  timestamp: number;
}

// ─── Verse of the Day ────────────────────────────────────────────────────────
const VERSE_OF_THE_DAY: { text: string; ref: string }[] = [
  { text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", ref: "John 3:16" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.", ref: "Proverbs 3:5" },
  { text: "I can do all things through Christ which strengtheneth me.", ref: "Philippians 4:13" },
  { text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.", ref: "Joshua 1:9" },
  { text: "And we know that all things work together for good to them that love God.", ref: "Romans 8:28" },
  { text: "The Lord is my light and my salvation; whom shall I fear?", ref: "Psalm 27:1" },
  { text: "Cast thy burden upon the Lord, and he shall sustain thee.", ref: "Psalm 55:22" },
  { text: "But they that wait upon the Lord shall renew their strength.", ref: "Isaiah 40:31" },
  { text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", ref: "Matthew 11:28" },
  { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { text: "The Lord will fight for you; you need only to be still.", ref: "Exodus 14:14" },
  { text: "I am the way, the truth, and the life: no man cometh unto the Father, but by me.", ref: "John 14:6" },
  { text: "Love is patient, love is kind. It does not envy, it does not boast.", ref: "1 Corinthians 13:4" },
  { text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", ref: "Psalm 34:18" },
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.", ref: "Jeremiah 29:11" },
  { text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God.", ref: "Isaiah 41:10" },
  { text: "Delight thyself also in the Lord; and he shall give thee the desires of thine heart.", ref: "Psalm 37:4" },
  { text: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.", ref: "Psalm 23:3" },
  { text: "What shall we then say to these things? If God be for us, who can be against us?", ref: "Romans 8:31" },
  { text: "Thy word is a lamp unto my feet, and a light unto my path.", ref: "Psalm 119:105" },
  { text: "The joy of the Lord is your strength.", ref: "Nehemiah 8:10" },
  { text: "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.", ref: "Psalm 91:1" },
  { text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally.", ref: "James 1:5" },
  { text: "We love him, because he first loved us.", ref: "1 John 4:19" },
  { text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!", ref: "2 Corinthians 5:17" },
  { text: "No weapon that is formed against thee shall prosper.", ref: "Isaiah 54:17" },
  { text: "The Lord bless thee, and keep thee: the Lord make his face shine upon thee.", ref: "Numbers 6:24-25" },
  { text: "Hear, O Israel: The Lord our God is one Lord.", ref: "Deuteronomy 6:4" },
  { text: "In the beginning was the Word, and the Word was with God, and the Word was God.", ref: "John 1:1" },
];

function getVerseOfTheDay() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return VERSE_OF_THE_DAY[seed % VERSE_OF_THE_DAY.length];
}

// ─── Section headings ────────────────────────────────────────────────────────

const SECTION_HEADINGS: Record<string, string[]> = {
  "GEN.1": ["The Creation", "The Fall", "The Curse"],
  "GEN.2": ["The Garden of Eden"],
  "GEN.3": ["The Fall of Man"],
  "GEN.12": ["The Call of Abram"],
  "GEN.22": ["The Sacrifice of Isaac"],
  "EXO.14": ["Crossing the Red Sea"],
  "EXO.20": ["The Ten Commandments"],
  "PSA.23": ["The Lord Is My Shepherd"],
  "PSA.51": ["Create in Me a Clean Heart"],
  "PSA.91": ["The Secret Place"],
  "ISA.40": ["Comfort for God's People"],
  "ISA.53": ["The Suffering Servant"],
  "ISA.61": ["Good News to the Poor"],
  "MAT.5": ["The Sermon on the Mount", "The Beatitudes"],
  "MAT.6": ["Treasures in Heaven"],
  "MAT.11": ["Come to Me"],
  "MAT.28": ["The Great Commission"],
  "MRK.1": ["The Calling of the First Disciples"],
  "LUK.2": ["The Birth of Jesus"],
  "LUK.10": ["The Good Samaritan"],
  "LUK.15": ["The Prodigal Son"],
  "LUK.24": ["The Resurrection"],
  "JHN.1": ["The Word Became Flesh"],
  "JHN.3": ["Nicodemus"],
  "JHN.4": ["Jesus and the Samaritan Woman"],
  "JHN.10": ["The Good Shepherd"],
  "JHN.14": ["Jesus the Way to the Father"],
  "JHN.15": ["The Vine and the Branches"],
  "JHN.20": ["The Resurrection"],
  "ACT.2": ["The Day of Pentecost"],
  "ROM.5": ["Peace with God Through Faith"],
  "ROM.8": ["Life in the Spirit"],
  "ROM.12": ["A Living Sacrifice"],
  "1CO.13": ["The Way of Love"],
  "EPH.6": ["The Armor of God"],
  "PHP.4": ["Rejoice Always"],
  "HEB.11": ["By Faith"],
  "JAS.1": ["Trials and Temptations"],
  "1JN.4": ["God Is Love"],
  "REV.21": ["A New Heaven and a New Earth"],
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Bible() {
  const [versions, setVersions] = useState<BibleVersionInfo[]>(() => getStaticVersions());
  const [version, setVersion] = useState<string>(() => localStorage.getItem("bible-reader-version") || "dra");
  const [allBooks, setAllBooks] = useState<BookInfo[]>(() => getStaticBooks().map(b => ({ code: b.code, name: b.name, testament: b.testament, chapters: b.chapters })));
  const [selectedBook, setSelectedBook] = useState<BookInfo | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showBookNav, setShowBookNav] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem("bible-font-size") || "18", 10));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("bible-dark-mode") === "true");
  const [paragraphMode, setParagraphMode] = useState(() => localStorage.getItem("bible-paragraph-mode") === "true");
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [recentBooks, setRecentBooks] = useState<RecentBook[]>([]);
  const [readChapters, setReadChapters] = useState<Record<string, Set<number>>>({});

  const searchRef = useRef<HTMLInputElement>(null);
  const verseRefs = useRef<Record<number, HTMLSpanElement | null>>({});
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const verseOfDay = useMemo(() => getVerseOfTheDay(), []);

  // ── Load versions & books from backend API (static fallback) ──
  useEffect(() => {
    let mounted = true;
    const loadVersions = async () => {
      try {
        const res = await apiClient.get("/bible/versions");
        if (mounted && res.data?.versions?.length > 0) setVersions(res.data.versions);
      } catch {}
    };
    loadVersions();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadBooks = async () => {
      try {
        const res = await apiClient.get("/bible/books", { params: { version } });
        if (mounted && res.data?.books?.length > 0) {
          setAllBooks(res.data.books.map((b: any) => ({ code: b.code, name: b.name, testament: b.testament, chapters: b.chapters })));
        }
      } catch {}
    };
    loadBooks();
    return () => { mounted = false; };
  }, [version]);

  // ── Load persisted data ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem("bible-bookmarks");
      if (stored) setBookmarks(JSON.parse(stored));
      const lr = localStorage.getItem("bible-last-read");
      if (lr) setLastRead(JSON.parse(lr));
      const rb = localStorage.getItem("bible-recent-books");
      if (rb) setRecentBooks(JSON.parse(rb));
      const rc = localStorage.getItem("bible-read-chapters");
      if (rc) {
        const parsed = JSON.parse(rc);
        const restored: Record<string, Set<number>> = {};
        for (const [k, v] of Object.entries(parsed)) restored[k] = new Set(v as number[]);
        setReadChapters(restored);
      }
    } catch {}
  }, []);

  const saveBookmarks = (bms: Bookmark[]) => {
    setBookmarks(bms);
    localStorage.setItem("bible-bookmarks", JSON.stringify(bms));
  };

  const saveReadChapters = (rc: Record<string, Set<number>>) => {
    setReadChapters(rc);
    const serializable: Record<string, number[]> = {};
    for (const [k, v] of Object.entries(rc)) serializable[k] = Array.from(v);
    localStorage.setItem("bible-read-chapters", JSON.stringify(serializable));
  };

  const saveRecentBook = (book: BookInfo) => {
    const updated = [{ code: book.code, name: book.name, timestamp: Date.now() }, ...recentBooks.filter((b) => b.code !== book.code)].slice(0, 6);
    setRecentBooks(updated);
    localStorage.setItem("bible-recent-books", JSON.stringify(updated));
  };

  // ── Section headings ──
  const sectionHeadings = useMemo(() => {
    if (!selectedBook) return {};
    const key = `${selectedBook.code}.${selectedChapter}`;
    const headings = SECTION_HEADINGS[key] || [];
    const map: Record<number, string> = {};
    if (headings.length === 1) {
      map[1] = headings[0];
    } else if (headings.length > 1 && verses.length > 0) {
      const interval = Math.floor(verses.length / headings.length);
      headings.forEach((h, i) => { map[i * interval + 1] = h; });
    }
    return map;
  }, [selectedBook, selectedChapter, verses]);

  // ── Load chapter ──
  const loadChapter = useCallback(async (bookCode: string, chapter: number) => {
    setLoading(true);
    setError(null);
    setSelectedVerseNum(null);
    try {
      let verses: Verse[] | null = null;
      try {
        const res = await apiClient.get("/bible/chapter", { params: { book: bookCode, chapter, version } });
        if (res.data?.verses?.length > 0) verses = res.data.verses;
      } catch {}
      if (!verses) verses = getStaticChapter(bookCode, chapter) || [];
      setVerses(verses);
      const book = allBooks.find((b) => b.code === bookCode) || null;
      setSelectedBook(book);
      setSelectedChapter(chapter);
      setShowBookNav(false);

      // Save last read
      if (book) {
        const lr: LastRead = { bookCode, bookName: book.name, chapter, version, timestamp: Date.now() };
        setLastRead(lr);
        localStorage.setItem("bible-last-read", JSON.stringify(lr));
        saveRecentBook(book);
      }

      // Mark as read
      if (book) {
        const updated = { ...readChapters };
        if (!updated[bookCode]) updated[bookCode] = new Set();
        updated[bookCode].add(chapter);
        saveReadChapters(updated);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load chapter");
      setVerses([]);
    } finally {
      setLoading(false);
    }
  }, [allBooks, readChapters, recentBooks, version]);

  // ── Book selection ──
  const handleBookSelect = (book: BookInfo) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setShowBookNav(false);
    loadChapter(book.code, 1);
  };

  // ── Chapter nav ──
  const goToPrev = useCallback(() => {
    if (!selectedBook || selectedChapter <= 1) return;
    loadChapter(selectedBook.code, selectedChapter - 1);
  }, [selectedBook, selectedChapter, loadChapter]);

  const goToNext = useCallback(() => {
    if (!selectedBook || selectedChapter >= selectedBook.chapters) return;
    loadChapter(selectedBook.code, selectedChapter + 1);
  }, [selectedBook, selectedChapter, loadChapter]);

  // ── Keyboard ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goToPrev, goToNext]);

  // ── Swipe gestures ──
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) goToPrev();
      else goToNext();
    }
  };

  // ── Version change ──
  const handleVersionChange = (newVer: string) => {
    setVersion(newVer);
    localStorage.setItem("bible-reader-version", newVer);
    if (selectedBook) loadChapter(selectedBook.code, selectedChapter);
  };

  // ── Font size ──
  const changeFontSize = (delta: number) => {
    const next = Math.max(14, Math.min(28, fontSize + delta));
    setFontSize(next);
    localStorage.setItem("bible-font-size", String(next));
  };

  // ── Dark mode toggle ──
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("bible-dark-mode", String(next));
  };

  // ── Paragraph mode toggle ──
  const toggleParagraphMode = () => {
    const next = !paragraphMode;
    setParagraphMode(next);
    localStorage.setItem("bible-paragraph-mode", String(next));
  };

  // ── Copy with reference ──
  const handleCopy = (verse: Verse) => {
    const ref = selectedBook ? `${selectedBook.name} ${selectedChapter}:${verse.verse}` : "";
    const verName = currentVersion?.name || version.toUpperCase();
    navigator.clipboard.writeText(`${verse.text} — ${ref} (${verName})`);
    setCopiedVerse(verse.verse);
    toast.success("Copied!");
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  // ── Bookmark ──
  const handleBookmark = (verse: Verse) => {
    const ref = selectedBook ? `${selectedBook.name} ${selectedChapter}:${verse.verse}` : "";
    const exists = bookmarks.find(
      (b) => b.version === version && b.book === selectedBook?.code && b.chapter === selectedChapter && b.verse === verse.verse
    );
    if (exists) {
      saveBookmarks(bookmarks.filter((b) => b !== exists));
      toast.success("Removed");
    } else {
      saveBookmarks([
        { version, book: selectedBook?.code || "", chapter: selectedChapter, verse: verse.verse, text: verse.text, reference: ref, timestamp: Date.now() },
        ...bookmarks,
      ]);
      toast.success("Bookmarked!");
    }
  };

  const isBookmarked = (v: number) =>
    bookmarks.some((b) => b.version === version && b.book === selectedBook?.code && b.chapter === selectedChapter && b.verse === v);

  // ── Search ──
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const refMatch = searchQuery.match(/^(\d?\s*\w+)\s+(\d+):(\d+)$/i);
    if (refMatch) {
      const bookName = refMatch[1].trim();
      const ch = parseInt(refMatch[2], 10);
      const found = allBooks.find((b) => b.name.toLowerCase() === bookName.toLowerCase() || b.code.toLowerCase() === bookName.toLowerCase());
      if (found) { handleBookSelect(found); loadChapter(found.code, ch); }
      else toast.error(`"${bookName}" not found`);
      return;
    }
    const chMatch = searchQuery.match(/^(\d?\s*\w+)\s+(\d+)$/i);
    if (chMatch) {
      const bookName = chMatch[1].trim();
      const ch = parseInt(chMatch[2], 10);
      const found = allBooks.find((b) => b.name.toLowerCase() === bookName.toLowerCase() || b.code.toLowerCase() === bookName.toLowerCase());
      if (found) { handleBookSelect(found); loadChapter(found.code, ch); }
      else toast.error(`"${bookName}" not found`);
      return;
    }
    toast("Type a reference like \"John 3:16\" or \"Genesis 1\"", { icon: "📖" });
  };

  const currentVersion = versions.find((v) => v.id === version) || versions[0];
  const OT = allBooks.filter((b) => b.testament === "OT");
  const DC = allBooks.filter((b) => b.testament === "DC");
  const NT = allBooks.filter((b) => b.testament === "NT");

  // ── Check if a book has read chapters ──
  const getReadCount = (bookCode: string) => readChapters[bookCode]?.size || 0;

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-[#1a1a1a]" : "bg-[#faf8f5]"}`}
      onTouchStart={selectedBook ? handleTouchStart : undefined}
      onTouchEnd={selectedBook ? handleTouchEnd : undefined}
    >
      {/* ── Top Bar ── */}
      <div className={`sticky top-16 lg:top-20 z-30 transition-colors duration-300 ${darkMode ? "bg-[#222] border-b border-[#333]" : "bg-white/80 backdrop-blur-md border-b border-stone-200/60"}`}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          {selectedBook ? (
            <button
              onClick={() => { setSelectedBook(null); setVerses([]); setShowBookNav(false); setImmersiveMode(false); }}
              className={`flex items-center gap-2 text-sm font-medium ${darkMode ? "text-stone-200 hover:text-white" : "text-stone-700 hover:text-stone-900"}`}
            >
              <span className="text-lg font-serif font-bold max-w-[38vw] truncate">{selectedBook.name}</span>
              <span className={`${darkMode ? "text-amber-400" : "text-amber-600"} font-serif`}>{selectedChapter}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowBookNav(!showBookNav)}
              className={`flex items-center gap-2 text-sm font-medium ${darkMode ? "text-stone-200" : "text-stone-700"}`}
            >
              <FaBars className="text-base" />
              <span className="font-semibold">Books</span>
            </button>
          )}

          {!immersiveMode && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setTimeout(() => searchRef.current?.focus(), 100); }}
                className={`p-2 rounded-lg transition-colors ${darkMode ? "text-stone-300 hover:bg-[#333]" : "text-stone-500 hover:bg-stone-100"}`}
              >
                <FaSearch className="text-sm" />
              </button>

              {selectedBook && (
                <>
                  <button
                    onClick={toggleParagraphMode}
                    className={`hidden sm:flex px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors ${
                      paragraphMode
                        ? "bg-amber-500 text-white"
                        : darkMode ? "text-stone-400 hover:bg-[#333] border border-[#444]" : "text-stone-500 hover:bg-stone-100 border border-stone-200"
                    }`}
                    title={paragraphMode ? "Paragraph mode on" : "Verse-by-verse mode"}
                  >
                    ¶
                  </button>

                  <div className={`hidden sm:flex items-center gap-0.5 rounded-lg border ${darkMode ? "border-[#444]" : "border-stone-200"}`}>
                    <button onClick={() => changeFontSize(-2)} className={`px-2 py-1.5 text-xs font-bold ${darkMode ? "text-stone-400 hover:text-white" : "text-stone-500 hover:text-stone-800"}`}>A-</button>
                    <button onClick={() => changeFontSize(2)} className={`px-2 py-1.5 text-xs font-bold ${darkMode ? "text-stone-400 hover:text-white" : "text-stone-500 hover:text-stone-800"}`}>A+</button>
                  </div>
                </>
              )}

              <button onClick={toggleDarkMode} className={`p-2 rounded-lg transition-colors ${darkMode ? "text-yellow-400 hover:bg-[#333]" : "text-stone-500 hover:bg-stone-100"}`}>
                {darkMode ? "☀️" : "🌙"}
              </button>

              {selectedBook && (
                <button
                  onClick={() => setImmersiveMode(!immersiveMode)}
                  className={`hidden sm:flex p-2 rounded-lg transition-colors ${darkMode ? "text-stone-300 hover:bg-[#333]" : "text-stone-500 hover:bg-stone-100"}`}
                  title={immersiveMode ? "Exit immersive mode" : "Immersive mode"}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </button>
              )}

              <div className="relative">
                <select
                  value={version}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  className={`appearance-none text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-2 pr-6 sm:pr-7 rounded-lg cursor-pointer transition-colors border focus:outline-none ${
                    darkMode ? "bg-[#333] border-[#444] text-stone-200 hover:bg-[#444]" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.id} className="text-slate-900 bg-white">{v.name}</option>
                  ))}
                </select>
                <FaChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${darkMode ? "text-stone-500" : "text-stone-400"}`} />
              </div>

              <button
                onClick={() => setShowBookmarks(!showBookmarks)}
                className={`p-2 rounded-lg transition-colors relative ${darkMode ? "text-stone-300 hover:bg-[#333]" : "text-stone-500 hover:bg-stone-100"}`}
              >
                {showBookmarks ? <FaBookmarkSolid className="text-amber-500" /> : <FaRegBookmark />}
                {bookmarks.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {bookmarks.length > 9 ? "9+" : bookmarks.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {immersiveMode && selectedBook && (
            <button
              onClick={() => setImmersiveMode(false)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? "text-stone-300 hover:bg-[#333]" : "text-stone-500 hover:bg-stone-100"}`}
              title="Exit immersive mode"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>

        {searchOpen && (
          <div className="max-w-3xl mx-auto px-4 pb-3">
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${darkMode ? "text-stone-500" : "text-stone-400"}`} />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder='Type "John 3:16" or "Genesis 1"'
                className={`w-full pl-9 pr-8 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50 ${
                  darkMode ? "bg-[#333] text-white placeholder:text-stone-500 border border-[#444]" : "bg-stone-50 text-stone-800 placeholder:text-stone-400 border border-stone-200"
                }`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? "text-stone-500" : "text-stone-400"}`}>
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Book Navigation Panel ── */}
      {showBookNav && (
        <div className={`max-w-3xl mx-auto px-4 py-4 ${darkMode ? "text-stone-200" : ""}`}>
          <div className={`rounded-2xl border p-4 ${darkMode ? "bg-[#222] border-[#333]" : "bg-white border-stone-200 shadow-sm"}`}>
            {[
              { label: "Old Testament", books: OT, color: "amber" },
              ...(DC.length > 0 ? [{ label: "Deuterocanonical", books: DC, color: "rose" }] : []),
              { label: "New Testament", books: NT, color: "emerald" },
            ].map((section) => (
              <div key={section.label} className="mb-4 last:mb-0">
                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-stone-500" : "text-stone-400"}`}>
                  {section.label}
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1">
                  {section.books.map((book) => {
                    const readCount = getReadCount(book.code);
                    const hasProgress = readCount > 0;
                    const progress = (readCount / book.chapters) * 100;
                    const colorMap: Record<string, string> = { amber: "bg-amber-500", rose: "bg-rose-500", emerald: "bg-emerald-500" };
                    return (
                      <button
                        key={book.code}
                        onClick={() => handleBookSelect(book)}
                        className={`relative py-2 px-1 rounded-lg text-center text-xs font-medium transition-all ${
                          selectedBook?.code === book.code
                            ? `${colorMap[section.color]} text-white shadow-sm`
                            : darkMode ? "text-stone-300 hover:bg-[#333]" : `text-stone-600 hover:bg-${section.color}-50 hover:text-${section.color}-700`
                        }`}
                      >
                        {book.name}
                        {hasProgress && (
                          <>
                            <span className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${
                              readCount >= book.chapters ? "bg-green-500" : colorMap[section.color]
                            }`} title={`${readCount}/${book.chapters} chapters read`} />
                            <div className={`absolute bottom-0.5 left-1 right-1 h-0.5 rounded-full ${darkMode ? "bg-[#333]" : "bg-stone-200"}`}>
                              <div className={`h-full rounded-full ${colorMap[section.color]} transition-all`} style={{ width: `${progress}%` }} />
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bookmarks Panel ── */}
      {showBookmarks && (
        <div className={`max-w-3xl mx-auto px-4 py-4`}>
          <div className={`rounded-2xl border p-5 ${darkMode ? "bg-[#222] border-[#333]" : "bg-white border-stone-200 shadow-sm"}`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-3 ${darkMode ? "text-stone-400" : "text-stone-500"}`}>Bookmarks</h2>
            {bookmarks.length === 0 ? (
              <p className={`text-center py-10 text-sm ${darkMode ? "text-stone-600" : "text-stone-400"}`}>
                Tap the bookmark icon on any verse to save it here.
              </p>
            ) : (
              <div className="space-y-1.5">
                {bookmarks.map((bm, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setShowBookmarks(false);
                      const book = allBooks.find((b) => b.code === bm.book);
                      if (book) { setSelectedBook(book); loadChapter(bm.book, bm.chapter); }
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${darkMode ? "hover:bg-[#333]" : "hover:bg-amber-50"}`}
                  >
                    <p className={`text-xs font-semibold mb-0.5 ${darkMode ? "text-amber-400" : "text-amber-600"}`}>{bm.reference}</p>
                    <p className={`text-sm leading-relaxed line-clamp-2 ${darkMode ? "text-stone-300" : "text-stone-600"}`}>{bm.text}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

       {/* ── Main Area ── */}
       <div className={`max-w-3xl mx-auto px-4 ${immersiveMode ? "py-8" : "py-6"}`}>
         {/* Total Reading Progress */}
         {Object.keys(readChapters).length > 0 && (
           <div className={`mb-6 rounded-xl border px-4 py-3 ${darkMode ? "bg-[#222] border-[#333]" : "bg-white border-stone-200 shadow-sm"}`}>
             <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${darkMode ? "text-stone-500" : "text-stone-400"}`}>
                  Reading Progress
                </span>
               <span className="text-[11px] font-bold text-amber-600">
                 {Object.values(readChapters).reduce((a, b) => a + b.size, 0)} chapters read
               </span>
             </div>
             <div className={`h-1.5 rounded-full ${darkMode ? "bg-[#333]" : "bg-stone-100"}`}>
               <div
                 className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                 style={{
                   width: `${Math.min(100, (Object.values(readChapters).reduce((a, b) => a + b.size, 0) / Math.max(1, allBooks.reduce((a, b) => a + b.chapters, 0))) * 100)}%`,
                 }}
               />
             </div>
           </div>
         )}

         {!selectedBook && !showBookNav && !showBookmarks && (
          /* ── Landing ── */
          <div className="py-10 space-y-8">
            {/* Verse of the Day */}
            <div className={`rounded-2xl border p-6 text-center ${darkMode ? "bg-[#222] border-[#333]" : "bg-gradient-to-b from-amber-50/80 to-white border-amber-100/60 shadow-sm"}`}>
              <p className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-4 ${darkMode ? "text-amber-400" : "text-amber-600"}`}>
                Verse of the Day
              </p>
              <p className={`font-serif text-lg leading-relaxed mb-3 italic ${darkMode ? "text-stone-200" : "text-stone-800"}`}>
                "{verseOfDay.text}"
              </p>
              <p className={`text-sm font-semibold ${darkMode ? "text-amber-400" : "text-amber-700"}`}>
                — {verseOfDay.ref}
              </p>
            </div>

            {/* Continue Reading */}
            {lastRead && (
              <div>
                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${darkMode ? "text-stone-500" : "text-stone-400"}`}>
                  Continue Reading
                </h3>
                <button
                  onClick={() => {
                    const book = allBooks.find((b) => b.code === lastRead.bookCode);
                    if (book) { setSelectedBook(book); loadChapter(lastRead.bookCode, lastRead.chapter); }
                    else { toast.error("Book not available in this version"); }
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${
                    darkMode ? "bg-[#222] border-[#333] hover:border-amber-700" : "bg-white border-stone-200 hover:border-amber-300"
                  }`}
                >
                  <p className={`font-serif text-base font-bold ${darkMode ? "text-stone-200" : "text-stone-800"}`}>
                    {lastRead.bookName} <span className={darkMode ? "text-amber-400" : "text-amber-600"}>{lastRead.chapter}</span>
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? "text-stone-500" : "text-stone-400"}`}>
                    {Math.floor((Date.now() - lastRead.timestamp) / 60000)} min ago
                  </p>
                </button>
              </div>
            )}

            {/* Recent Books */}
            {recentBooks.length > 0 && (
              <div>
                <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${darkMode ? "text-stone-500" : "text-stone-400"}`}>
                  Recent
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {recentBooks.map((rb) => (
                    <button
                      key={rb.code}
                      onClick={() => {
                        const book = allBooks.find((b) => b.code === rb.code);
                        if (book) handleBookSelect(book);
                      }}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        darkMode ? "bg-[#222] border-[#333] text-stone-300 hover:border-amber-700" : "bg-white border-stone-200 text-stone-600 hover:border-amber-300"
                      }`}
                    >
                      {rb.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Start Reading */}
            <div className="text-center pt-8 pb-12">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${darkMode ? "bg-amber-900/30 border border-amber-800/30" : "bg-amber-50 border border-amber-100"}`}>
                <span className={`text-3xl ${darkMode ? "text-amber-400" : "text-amber-600"}`}>✝</span>
              </div>
              <h1 className={`text-2xl font-serif font-bold mb-1 ${darkMode ? "text-stone-200" : "text-stone-800"}`}>
                {currentVersion?.name || "Holy Bible"}
              </h1>
              <p className={`text-sm mb-2 ${darkMode ? "text-stone-500" : "text-stone-400"}`}>
                {currentVersion?.subtitle || ""}
              </p>
              <p className={`text-xs mb-6 ${darkMode ? "text-stone-600" : "text-stone-500"}`}>
                {versions.length} versions available · {allBooks.length} books
              </p>
              <button
                onClick={() => setShowBookNav(true)}
                className="px-7 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-amber-600/20"
              >
                Start Reading
              </button>
            </div>
          </div>
        )}

         {/* ── Chapter Content ── */}
         {selectedBook && (
           <div className="py-6">
             {/* Book Progress */}
             <div className="flex items-center gap-3 mb-4">
               <span className={`text-xs font-semibold ${darkMode ? "text-stone-400" : "text-stone-500"}`}>
                 {selectedBook.name} {selectedChapter}
               </span>
               <div className={`flex-1 h-1.5 rounded-full ${darkMode ? "bg-[#333]" : "bg-stone-100"}`}>
                 <div
                   className="h-full rounded-full bg-amber-500 transition-all duration-300"
                   style={{ width: `${(selectedChapter / selectedBook.chapters) * 100}%` }}
                 />
               </div>
               <span className={`text-[10px] font-bold ${darkMode ? "text-stone-500" : "text-stone-400"}`}>
                 {selectedChapter}/{selectedBook.chapters}
               </span>
             </div>

             {loading && (
              <div className="py-20 text-center">
                <div className={`inline-flex items-center gap-2.5 ${darkMode ? "text-amber-400" : "text-amber-600"}`}>
                  <div className="w-5 h-5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                  <span className="text-sm font-medium">Loading…</span>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="py-20 text-center">
                <p className={`text-sm mb-4 ${darkMode ? "text-red-400" : "text-red-500"}`}>{error}</p>
                <button onClick={() => loadChapter(selectedBook.code, selectedChapter)} className="text-sm text-amber-600 hover:text-amber-700 font-semibold underline underline-offset-2">
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && verses.length > 0 && (
              <div
                className="font-serif leading-[1.95] text-justify sm:text-left"
                style={{ fontSize: `${fontSize}px`, color: darkMode ? "#d4d0c8" : "#2c2c2c" }}
              >
                {paragraphMode ? (
                  /* ── Paragraph Mode ── */
                  <div className="space-y-4">
                    {/* Section headings in paragraph mode */}
                    {(() => {
                      const sections: { heading?: string; verseStart: number; verseEnd: number }[] = [];
                      const headingVerses = Object.entries(sectionHeadings).map(([v, h]) => ({ verse: parseInt(v), heading: h[0] }));
                      if (headingVerses.length > 0) {
                        sections.length = 0;
                        let prev = 1;
                        for (const hv of headingVerses) {
                          if (hv.verse > prev) sections.push({ verseStart: prev, verseEnd: hv.verse - 1 });
                          sections.push({ heading: hv.heading, verseStart: hv.verse, verseEnd: hv.verse });
                          prev = hv.verse + 1;
                        }
                        sections.push({ verseStart: prev, verseEnd: verses.length });
                      }
                      return sections.filter((s) => s.verseStart <= s.verseEnd).map((section, idx) => (
                        <div key={idx}>
                          {section.heading && (
                            <p className={`text-center my-6 font-sans font-bold text-[0.65em] uppercase tracking-[0.15em] ${darkMode ? "text-stone-500" : "text-stone-400"}`}>
                              {section.heading}
                            </p>
                          )}
                          <p className="indent-8">
                            {verses.slice(section.verseStart - 1, section.verseEnd).map((v) => (
                              <span
                                key={v.verse}
                                ref={(el) => { verseRefs.current[v.verse] = el; }}
                                className={`cursor-pointer transition-colors duration-200 ${
                                  selectedVerseNum === v.verse
                                    ? darkMode ? "bg-amber-900/40" : "bg-amber-100"
                                    : darkMode ? "hover:bg-white/5" : "hover:bg-amber-50/60"
                                } rounded px-0.5 -mx-0.5`}
                                onClick={() => setSelectedVerseNum(selectedVerseNum === v.verse ? null : v.verse)}
                              >
                                <sup
                                  className={`font-sans align-top relative -top-[0.15em] mr-0.5 transition-colors ${
                                    selectedVerseNum === v.verse ? "text-amber-500 font-bold" : darkMode ? "text-stone-600" : "text-stone-400"
                                  }`}
                                  style={{ fontSize: "0.55em" }}
                                >
                                  {v.verse}
                                </sup>
                                {v.text}{" "}
                              </span>
                            ))}
                          </p>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  /* ── Verse-by-Verse Mode ── */
                  verses.map((v) => {
                    const heading = sectionHeadings[v.verse];
                    return (
                      <span key={v.verse} className="block">
                        {heading && (
                          <span className={`block text-center my-6 font-sans font-bold text-[0.65em] uppercase tracking-[0.15em] ${darkMode ? "text-stone-500" : "text-stone-400"}`}>
                            {heading}
                          </span>
                        )}
                        <span
                          ref={(el) => { verseRefs.current[v.verse] = el; }}
                          className={`cursor-pointer transition-colors duration-200 ${
                            selectedVerseNum === v.verse
                              ? darkMode ? "bg-amber-900/40" : "bg-amber-100"
                              : darkMode ? "hover:bg-white/5" : "hover:bg-amber-50/60"
                          } rounded px-0.5 -mx-0.5`}
                          onClick={() => setSelectedVerseNum(selectedVerseNum === v.verse ? null : v.verse)}
                        >
                          <sup
                            className={`font-sans align-top relative -top-[0.15em] mr-0.5 transition-colors ${
                              selectedVerseNum === v.verse ? "text-amber-500 font-bold" : darkMode ? "text-stone-600" : "text-stone-400"
                            }`}
                            style={{ fontSize: "0.55em" }}
                          >
                            {v.verse}
                          </sup>
                          {v.text}{" "}
                        </span>
                      </span>
                    );
                  })
                )}
              </div>
            )}

            {/* Verse action bar */}
            {selectedVerseNum !== null && (
              <div className={`sticky bottom-16 md:bottom-0 mt-4 rounded-xl border px-4 py-2.5 flex items-center gap-2 ${
                darkMode ? "bg-[#222] border-[#333]" : "bg-white/90 backdrop-blur-sm border-stone-200 shadow-lg"
              }`}>
                <span className={`text-xs font-semibold mr-1 ${darkMode ? "text-stone-400" : "text-stone-500"}`}>
                  {selectedBook.name} {selectedChapter}:{selectedVerseNum}
                </span>
                <button
                  onClick={() => { const v = verses.find((x) => x.verse === selectedVerseNum); if (v) handleCopy(v); }}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    darkMode ? "border-[#444] text-stone-300 hover:bg-[#333]" : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {copiedVerse === selectedVerseNum ? <FaCheck className="text-green-500 text-[10px]" /> : <FaCopy className="text-[10px]" />}
                  {copiedVerse === selectedVerseNum ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => { const v = verses.find((x) => x.verse === selectedVerseNum); if (v) handleBookmark(v); }}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    darkMode ? "border-[#444] text-stone-300 hover:bg-[#333]" : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {isBookmarked(selectedVerseNum) ? <FaBookmarkSolid className="text-amber-500 text-[10px]" /> : <FaRegBookmark className="text-[10px]" />}
                  {isBookmarked(selectedVerseNum) ? "Saved" : "Save"}
                </button>
                <button onClick={() => setSelectedVerseNum(null)} className={`ml-auto p-2.5 ${darkMode ? "text-stone-600" : "text-stone-400"}`}>
                  <FaTimes className="text-xs" />
                </button>
              </div>
            )}

            {/* Bottom nav */}
            {!loading && verses.length > 0 && (
              <div className={`flex flex-wrap items-center justify-between gap-3 py-6 mt-4 border-t ${darkMode ? "border-[#333]" : "border-stone-100"}`}>
                <button
                  onClick={goToPrev}
                  disabled={selectedChapter <= 1}
                  className={`flex items-center gap-2 text-sm font-medium min-w-0 disabled:opacity-25 disabled:cursor-not-allowed transition-colors ${
                    darkMode ? "text-stone-400 hover:text-amber-400" : "text-stone-500 hover:text-amber-700"
                  }`}
                >
                  <FaArrowLeft className="text-xs flex-shrink-0" />
                  <span className="truncate">{selectedChapter > 1 ? `${selectedBook.name} ${selectedChapter - 1}` : ""}</span>
                </button>
                <div className="relative">
                  <select
                    value={selectedChapter}
                    onChange={(e) => loadChapter(selectedBook.code, parseInt(e.target.value, 10))}
                    className={`appearance-none text-xs font-semibold px-3 py-2 pr-7 rounded-lg cursor-pointer border focus:outline-none ${
                      darkMode ? "bg-[#333] border-[#444] text-stone-300" : "bg-white border-stone-200 text-stone-600"
                    }`}
                  >
                    {Array.from({ length: selectedBook.chapters }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Chapter {i + 1}</option>
                    ))}
                  </select>
                  <FaChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${darkMode ? "text-stone-600" : "text-stone-400"}`} />
                </div>
                <button
                  onClick={goToNext}
                  disabled={selectedChapter >= selectedBook.chapters}
                  className={`flex items-center gap-2 text-sm font-medium min-w-0 disabled:opacity-25 disabled:cursor-not-allowed transition-colors ${
                    darkMode ? "text-stone-400 hover:text-amber-400" : "text-stone-500 hover:text-amber-700"
                  }`}
                >
                  <span className="truncate">{selectedChapter < selectedBook.chapters ? `${selectedBook.name} ${selectedChapter + 1}` : ""}</span>
                  <FaArrowRight className="text-xs flex-shrink-0" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
