import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import {
  FaSearch,
  FaMusic,
  FaFileAlt,
  FaImage,
  FaStar,
  FaRegStar,
  FaTimes,
  FaExpand,
  FaCompress,
  FaSearchPlus,
  FaSearchMinus,
  FaAdjust,
  FaCopy,
  FaCheck,
  FaPlay,
  FaPause,
  FaShareAlt,
  FaBookOpen,
  FaFilter,
  FaSlidersH,
  FaLayerGroup,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaPrint
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export interface ChoirSong {
  id: number;
  module_id: string;
  title: string;
  category: string;
  composer?: string;
  key_signature?: string;
  time_signature?: string;
  tempo?: string;
  solfa_notation?: string;
  lyrics_text?: string;
  image_url: string;
  additional_images?: string[];
  audio_url?: string;
  language?: string;
  tags?: string[];
  views_count?: number;
  created_at?: string;
}

interface Props {
  moduleId: string;
  color: string;
}

export const SONG_CATEGORIES = [
  { id: 'all', label: 'All Songs', swahili: 'Nyimbo Zote', icon: '🎵', accent: '#2563eb' },
  { id: 'marian', label: 'Marian', swahili: 'Bikira Maria', icon: '🌹', accent: '#0284c7' },
  { id: 'mwanzo', label: 'Entrance', swahili: 'Mwanzo', icon: '🚪', accent: '#059669' },
  { id: 'utukufu', label: 'Kyrie / Gloria', swahili: 'Utukufu & Huruma', icon: '✨', accent: '#7c3aed' },
  { id: 'sadaka', label: 'Offertory', swahili: 'Sadaka / Matoleo', icon: '🍞', accent: '#d97706' },
  { id: 'komunyo', label: 'Communion', swahili: 'Komunyo / Ekaristi', icon: '🍷', accent: '#dc2626' },
  { id: 'shukrani', label: 'Thanksgiving', swahili: 'Shukrani', icon: '🙏', accent: '#16a34a' },
  { id: 'kutoka', label: 'Recessional', swahili: 'Kutoka', icon: '🚶‍♂️', accent: '#4f46e5' },
  { id: 'kwaresma', label: 'Lent', swahili: 'Kwaresma / Mateso', icon: '✝️', accent: '#6b21a8' },
  { id: 'pasaka', label: 'Easter', swahili: 'Pasaka / Ufufuko', icon: '🌅', accent: '#ea580c' },
  { id: 'noeli', label: 'Christmas', swahili: 'Noeli / Krismasi', icon: '⭐', accent: '#0891b2' },
  { id: 'pentecost', label: 'Pentecost', swahili: 'Roho Mtakatifu', icon: '🔥', accent: '#b91c1c' },
  { id: 'patron', label: 'St. Thomas Aquinas', swahili: 'Msimamizi Wetu', icon: '📖', accent: '#1e3a8a' },
  { id: 'general', label: 'General', swahili: 'Mbalimbali', icon: '🎼', accent: '#475569' },
];

export default function CommunitySongsTab({ moduleId, color }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [selectedKey, setSelectedKey] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [activeMainTab, setActiveMainTab] = useState<'library' | 'bookmarked'>('library');

  // Selected song viewer state
  const [selectedSong, setSelectedSong] = useState<ChoirSong | null>(null);
  const [viewMode, setViewMode] = useState<'sheet' | 'lyrics'>('sheet');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [invertContrast, setInvertContrast] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(18);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Local storage for "My Sunday Setlist / Bookmarks"
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('csa_choir_bookmarked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('csa_choir_bookmarked_songs', JSON.stringify(next));
      } catch {}
      if (!prev.includes(id)) {
        toast.success('Added to your Sunday Songbook');
      } else {
        toast('Removed from your Songbook', { icon: '🗑️' });
      }
      return next;
    });
  };

  // Fetch song stats & category counts
  const { data: statsData } = useQuery({
    queryKey: ['choir-songs-stats', moduleId],
    queryFn: async () => {
      const res = await apiClient.get('/choir-songs/stats', { params: { module_id: moduleId } });
      return res.data;
    },
    staleTime: 60000,
  });

  // Fetch songs list
  const { data: songsData, isLoading } = useQuery({
    queryKey: ['choir-songs', moduleId, activeCategory, languageFilter, selectedKey, searchQuery, sortBy],
    queryFn: async () => {
      const res = await apiClient.get('/choir-songs', {
        params: {
          module_id: moduleId,
          category: activeCategory !== 'all' ? activeCategory : undefined,
          language: languageFilter !== 'all' ? languageFilter : undefined,
          key_signature: selectedKey !== 'all' ? selectedKey : undefined,
          search: searchQuery.trim() || undefined,
          sortBy,
          limit: 100,
        },
      });
      return res.data;
    },
    staleTime: 30000,
  });

  const allSongs: ChoirSong[] = songsData?.data || [];

  // Filtered by bookmarked if user is on bookmarked tab
  const displayedSongs = useMemo(() => {
    if (activeMainTab === 'bookmarked') {
      return allSongs.filter((s) => bookmarkedIds.includes(s.id));
    }
    return allSongs;
  }, [allSongs, activeMainTab, bookmarkedIds]);

  // Dynamic category counts map
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    if (statsData?.categories) {
      statsData.categories.forEach((c: { category: string; count: string | number }) => {
        map[c.category.toLowerCase()] = Number(c.count);
      });
    }
    return map;
  }, [statsData]);

  // Copy lyrics to clipboard
  const handleCopyLyrics = () => {
    if (!selectedSong?.lyrics_text) return;
    navigator.clipboard.writeText(selectedSong.lyrics_text);
    setCopied(true);
    toast.success('Lyrics copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Format lyrics with bold callouts for chorus / verses
  const formattedLyrics = useMemo(() => {
    if (!selectedSong?.lyrics_text) return null;
    const paragraphs = selectedSong.lyrics_text.split(/\n\s*\n/);
    return paragraphs.map((para, pIdx) => {
      const lines = para.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const firstLine = lines[0] || '';
      const isChorus = /^(chorus|kwaya|mwitikio|kiitikio|refrain)/i.test(firstLine);

      return (
        <div
          key={pIdx}
          className={`p-4 rounded-2xl transition-all ${
            isChorus
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 shadow-sm'
              : 'bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800'
          }`}
        >
          {lines.map((line, lIdx) => {
            const isMarker = /^(chorus|kwaya|mwitikio|kiitikio|refrain|verse|ubeti|beti|\d+[\.:\)])/i.test(line);
            return (
              <p
                key={lIdx}
                className={`${
                  isMarker || isChorus
                    ? 'font-bold text-blue-900 dark:text-blue-200'
                    : 'text-slate-800 dark:text-slate-200 font-medium'
                } leading-relaxed tracking-wide`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {line}
              </p>
            );
          })}
        </div>
      );
    });
  }, [selectedSong?.lyrics_text, fontSize]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="p-2 rounded-xl text-white shadow-md flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${color}, #1e3a8a)` }}
            >
              <FaMusic size={18} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Choir Repertoire &amp; Sheet Library
              </h1>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                Nyimbo za Misa &middot; Karatasi za Noti &middot; Mkusanyiko wa Kwaya
              </p>
            </div>
          </div>
        </div>

        {/* Library vs. Setlist Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveMainTab('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMainTab === 'library'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FaLayerGroup size={12} />
            All Repertoire ({statsData?.total || 0})
          </button>
          <button
            onClick={() => setActiveMainTab('bookmarked')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMainTab === 'bookmarked'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FaStar size={12} className={bookmarkedIds.length > 0 ? 'text-amber-200' : ''} />
            Sunday Setlist ({bookmarkedIds.length})
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search by song title, composer, lyrics keyword (e.g., 'Bwana Unirehemu', 'Mzalendo')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Language filter */}
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-3 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Languages</option>
              <option value="Swahili">Swahili</option>
              <option value="English">English</option>
              <option value="Latin">Latin</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="newest">Recently Added</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="views">Most Viewed</option>
              <option value="composer">Composer (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Liturgical Category Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {SONG_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const count = cat.id === 'all' ? (statsData?.total || 0) : (categoryCounts[cat.id] || 0);

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  isSelected
                    ? 'text-white shadow-md scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                style={{
                  backgroundColor: isSelected ? cat.accent : undefined,
                }}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Songs Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading song library...</p>
        </div>
      ) : displayedSongs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FaMusic size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
            {activeMainTab === 'bookmarked' ? 'No Songs in Your Setlist' : 'No Songs Found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            {activeMainTab === 'bookmarked'
              ? 'Star your favorite hymns or this Sunday’s mass songs to access them quickly here during practice or mass.'
              : 'Try adjusting your search keywords or switching category filters.'}
          </p>
          {activeMainTab === 'bookmarked' && (
            <button
              onClick={() => setActiveMainTab('library')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all"
            >
              Browse Full Songbook
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedSongs.map((song) => {
            const isBookmarked = bookmarkedIds.includes(song.id);
            const categoryMeta = SONG_CATEGORIES.find((c) => c.id === song.category.toLowerCase()) || SONG_CATEGORIES[0];

            return (
              <div
                key={song.id}
                onClick={() => {
                  setSelectedSong(song);
                  setViewMode(song.lyrics_text ? 'lyrics' : 'sheet');
                  setZoomLevel(1);
                }}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
              >
                {/* Image Banner / Sheet Preview */}
                <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={song.image_url}
                    alt={song.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 filter group-hover:brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-white shadow-sm">
                    <span>{categoryMeta.icon}</span>
                    <span>{categoryMeta.label}</span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => toggleBookmark(song.id, e)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur transition-all ${
                      isBookmarked
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
                    }`}
                    title={isBookmarked ? 'Remove from Sunday Setlist' : 'Add to Sunday Setlist'}
                  >
                    <FaStar size={13} className={isBookmarked ? 'fill-current' : ''} />
                  </button>

                  {/* Key & Solfa indicator */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    {song.key_signature && (
                      <span className="bg-blue-600/90 backdrop-blur text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wide">
                        Key {song.key_signature}
                      </span>
                    )}
                    {song.time_signature && (
                      <span className="bg-white/20 backdrop-blur text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
                        {song.time_signature}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                      {song.title}
                    </h3>
                    {song.composer ? (
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        By {song.composer}
                      </p>
                    ) : (
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        Traditional / Liturgical
                      </p>
                    )}
                  </div>

                  {/* Lyrics excerpt preview */}
                  {song.lyrics_text ? (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 leading-relaxed">
                        "{song.lyrics_text.slice(0, 100)}..."
                      </p>
                    </div>
                  ) : (
                    <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                      <FaImage size={11} /> Sheet music photo available
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                      {song.lyrics_text ? 'Read Lyrics / Sheet' : 'Open Sheet Music'} →
                    </span>
                    {song.views_count ? (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <FaEye size={11} /> {song.views_count}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Interactive Song Modal / Fullscreen Dual-Mode Reader */}
      {/* ========================================================================= */}
      {selectedSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div
            className={`relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ${
              isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl max-h-[92vh]'
            }`}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => toggleBookmark(selectedSong.id)}
                  className={`p-2 rounded-full transition-all ${
                    bookmarkedIds.includes(selectedSong.id)
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                  title={bookmarkedIds.includes(selectedSong.id) ? 'In your Sunday Setlist' : 'Add to Setlist'}
                >
                  <FaStar size={14} className={bookmarkedIds.includes(selectedSong.id) ? 'fill-current' : ''} />
                </button>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                    {selectedSong.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {selectedSong.composer && <span>{selectedSong.composer}</span>}
                    {selectedSong.key_signature && <span>• Key {selectedSong.key_signature}</span>}
                    {selectedSong.time_signature && <span>• {selectedSong.time_signature}</span>}
                  </div>
                </div>
              </div>

              {/* Top View Toggle: Sheet vs Lyrics */}
              <div className="flex items-center gap-2">
                <div className="bg-slate-200 dark:bg-slate-700 p-1 rounded-2xl flex items-center">
                  <button
                    onClick={() => setViewMode('lyrics')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      viewMode === 'lyrics'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <FaFileAlt size={12} />
                    <span className="hidden sm:inline">Lyrics & Text</span>
                  </button>
                  <button
                    onClick={() => setViewMode('sheet')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      viewMode === 'sheet'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <FaImage size={12} />
                    <span className="hidden sm:inline">Sheet Photo</span>
                  </button>
                </div>

                {/* Fullscreen toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors hidden sm:flex"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
                </button>

                {/* Close modal */}
                <button
                  onClick={() => setSelectedSong(null)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative bg-slate-50/50 dark:bg-slate-950/50">
              {viewMode === 'sheet' ? (
                /* ========================================================================= */
                /* Sheet Music Photo Viewer with Zoom, Pan, Invert Contrast */
                /* ========================================================================= */
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                  {/* Toolbar */}
                  <div className="sticky top-0 z-20 mb-4 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.25))}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                      title="Zoom Out"
                    >
                      <FaSearchMinus size={14} />
                    </button>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                      title="Zoom In"
                    >
                      <FaSearchPlus size={14} />
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                    >
                      Reset
                    </button>

                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                    {/* Invert contrast for dim church stalls */}
                    <button
                      onClick={() => setInvertContrast(!invertContrast)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        invertContrast
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                      }`}
                      title="Dark Sheet Mode (inverts contrast for rehearsal lighting)"
                    >
                      <FaAdjust size={12} />
                      <span className="hidden sm:inline">Dark Sheet Mode</span>
                    </button>

                    <a
                      href={selectedSong.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                      title="Open Original Image"
                    >
                      <FaPrint size={13} />
                    </a>
                  </div>

                  {/* Zoomable Image Container */}
                  <div className="w-full flex items-center justify-center overflow-auto p-2">
                    <img
                      src={selectedSong.image_url}
                      alt={selectedSong.title}
                      className="rounded-2xl shadow-xl transition-all duration-200 max-w-full"
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top center',
                        filter: invertContrast ? 'invert(1) hue-rotate(180deg) contrast(1.2)' : 'none',
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* ========================================================================= */
                /* Clean Extracted Lyrics View with Stanzas, High Readability & Font Controls */
                /* ========================================================================= */
                <div className="max-w-2xl mx-auto">
                  {/* Lyrics Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Font Size Adjuster */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Text Size:</span>
                      <button
                        onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        A-
                      </button>
                      <span className="text-xs font-black text-blue-600">{fontSize}px</span>
                      <button
                        onClick={() => setFontSize((s) => Math.min(32, s + 2))}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        A+
                      </button>
                    </div>

                    {/* Copy Lyrics */}
                    <button
                      onClick={handleCopyLyrics}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
                    >
                      {copied ? <FaCheck size={12} className="text-green-500" /> : <FaCopy size={12} />}
                      {copied ? 'Copied' : 'Copy Lyrics'}
                    </button>
                  </div>

                  {/* Sol-fa Notation (if provided) */}
                  {selectedSong.solfa_notation && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                      <div className="flex items-center gap-2 mb-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
                        <FaMusic size={13} /> Tonic Sol-fa Notation
                      </div>
                      <pre className="font-mono text-xs text-amber-950 dark:text-amber-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                        {selectedSong.solfa_notation}
                      </pre>
                    </div>
                  )}

                  {/* Extracted Lyrics Stanzas */}
                  {formattedLyrics ? (
                    <div className="space-y-4">{formattedLyrics}</div>
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-500">
                        No extracted lyrics text available for this song yet.
                      </p>
                      <button
                        onClick={() => setViewMode('sheet')}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                      >
                        View Sheet Music Photo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">
                Category: <strong className="text-slate-800 dark:text-white capitalize">{selectedSong.category}</strong>
              </span>
              <button
                onClick={() => setSelectedSong(null)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
