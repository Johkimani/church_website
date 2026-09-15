
import React, { useState, useEffect } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
  Heart,
  Smile,
  Send,
  Calendar,
  Search,
  Play,
  Loader2,
} from 'lucide-react';
import { useCachedData } from '../../../../../hooks/useCachedData';
import { apiClient } from '../../../../../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '../../../../../assets/Layouts/PageLoader';

interface GalleryItem {
  id: number;
  image_url: string;
  description: string;
  event_name: string;
  upload_date: string;
  module_id: string;
  is_anniversary?: boolean;
}

interface GalleryVideo {
  id: number;
  title: string;
  description: string;
  video_url: string | null;
  video_file_url: string | null;
  video_type: 'link' | 'upload';
  platform: string;
  thumbnail_url: string | null;
  created_at: string;
  posted_by: string;
}

interface GalleryResponse {
  items: GalleryItem[];
  theme: string;
  userContext: { jumuiyaId: string } | null;
}

function getEmbedUrl(platform: string, url: string): string | null {
  if (!url) return null;
  if (platform === 'youtube') {
    const match = url.match(/(?:watch\?v=|youtu\.be\/|embed\/)([^&?#]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }
  if (platform === 'tiktok') return null;
  return null;
}

const forceH264 = (url: string): string => {
  if (!url) return url;
  return url.replace('/video/upload/', '/video/upload/vc_h264,f_mp4/');
};

const GallerySection: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [activeView, setActiveView] = useState<'photos' | 'videos'>('photos');
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<GalleryVideo | null>(null);

  // Toggle Like Logic
  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { data: galleryData, loading } = useCachedData<GalleryResponse>(
    'csa_cache_public_gallery',
    async () => {
      const { data } = await apiClient.get<GalleryResponse>('/hub-gallery');
      return data;
    },
    { items: [], theme: 'default', userContext: null }
  );

  const items = galleryData.items || [];
  const theme = galleryData.theme || 'default';

  useEffect(() => {
    if (activeView !== 'videos') return;
    let active = true;
    setVideosLoading(true);
    apiClient.get('/community-videos/csa_main/videos')
      .then(({ data }) => {
        if (active) setVideos(data?.videos || []);
      })
      .catch(() => { if (active) setVideos([]); })
      .finally(() => { if (active) setVideosLoading(false); });
    return () => { active = false; };
  }, [activeView]);

  const filteredVideos = filterCategory === 'All'
    ? videos
    : videos.filter(v => (v.category || 'general') === filterCategory);

  const selectedVideoIndex = selectedVideo ? filteredVideos.findIndex(v => v.id === selectedVideo.id) : -1;

  const goToNextVideo = useCallback(() => {
    if (selectedVideoIndex < 0 || filteredVideos.length === 0) return;
    setSelectedVideo(filteredVideos[(selectedVideoIndex + 1) % filteredVideos.length]);
  }, [selectedVideoIndex, filteredVideos]);

  const goToPrevVideo = useCallback(() => {
    if (selectedVideoIndex < 0 || filteredVideos.length === 0) return;
    setSelectedVideo(filteredVideos[(selectedVideoIndex - 1 + filteredVideos.length) % filteredVideos.length]);
  }, [selectedVideoIndex, filteredVideos]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedVideo) {
        if (e.key === 'Escape') setSelectedVideo(null);
        if (e.key === 'ArrowRight') goToNextVideo();
        if (e.key === 'ArrowLeft') goToPrevVideo();
      } else if (selectedIdx !== null) {
        if (e.key === 'Escape') setSelectedIdx(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedVideo, selectedIdx, goToNextVideo, goToPrevVideo]);

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.module_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const nextImage = () => {
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx + 1) % filteredItems.length);
    }
  };

  const prevImage = () => {
    if (selectedIdx !== null) {
      setSelectedIdx((selectedIdx - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  if (loading) {
    return <PageLoader message="Loading gallery" fullScreen />;
  }

  return (
    <div className={`min-h-screen pt-16 pb-32 transition-colors duration-1000 ${theme === 'Christmas' ? 'bg-slate-50' : 'bg-white'}`}>
      <div className="container mx-auto px-6">
        {/* Gallery Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Parish Archives</span>
            <span className="w-12 h-px bg-amber-400" />
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-stone-900 mb-3 tracking-tight leading-[1.1]">
            The Living <span className="text-amber-700">Heritage</span>
          </h1>
          <p className="text-stone-400 font-semibold text-sm max-w-md mx-auto">Moments from our life together, preserved in faith</p>

          {/* Search + Filters */}
          <div className="mt-8 relative z-20 max-w-4xl mx-auto flex flex-col items-center gap-6">
            {/* Search */}
            <div className="w-full max-w-xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-2xl border border-stone-200/80 flex items-center p-1.5 focus-within:border-amber-400 focus-within:shadow-[0_2px_20px_rgba(180,120,20,0.08)] transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${searchTerm ? 'bg-amber-600 text-white shadow-sm' : 'bg-stone-50 text-stone-300'}`}>
                <Search size={16} strokeWidth={2.5} />
              </div>

              <input 
                type="text" 
                placeholder="Search our gallery..."
                className="flex-1 self-stretch bg-transparent border-none outline-none px-4 text-stone-700 font-semibold placeholder:text-stone-300 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <AnimatePresence>
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={() => setSearchTerm('')}
                    className="w-10 h-10 bg-stone-50 rounded-xl text-stone-400 hover:text-stone-700 transition-all flex items-center justify-center shrink-0 mr-0.5 cursor-pointer"
                  >
                    <X size={14} strokeWidth={3} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Photos / Videos Toggle */}
            <div className="flex p-1 bg-stone-100 rounded-full">
              {(['photos', 'videos'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    activeView === view
                      ? 'bg-stone-900 text-white shadow-md'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {['All', 'general', 'choir', 'dancers', 'charismatic', 'jumuiya', 'communities'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                    filterCategory === cat 
                    ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
                    : 'bg-white text-stone-400 border-stone-200/80 hover:border-stone-300 hover:text-stone-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content based on active view */}
        {activeView === 'photos' ? (
          /* Improved Masonry Grid - High-End Feed Style */
          <div className="flex flex-col md:grid md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10 max-w-[1400px] mx-auto">
          {filteredItems.map((item, index) => (
            <motion.div 
              layout
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex flex-col bg-white md:rounded-[3.5rem] rounded-[2.5rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] border border-slate-50 transition-all duration-700 md:cursor-zoom-in"
              onClick={() => {
                setSelectedIdx(index);
              }}
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 md:hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary">
                    <Camera size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Memory from</p>
                    <h4 className="text-xs font-black text-slate-900">{item.module_id === 'general' ? 'Parish Archives' : `${item.module_id} Group`}</h4>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter italic">
                   {item.upload_date ? new Date(item.upload_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Heritage'}
                </div>
              </div>

              {/* Visual Component */}
              <div className="relative overflow-hidden mx-4 md:mx-0 rounded-[2rem] md:rounded-none border border-slate-100/50 md:border-none shadow-sm md:shadow-none">
                <img
                  src={item.image_url}
                  alt={item.event_name}
                  className="w-full h-64 md:h-72 object-cover transition-transform duration-[2500ms] group-hover:scale-105"
                />
                
                {item.is_anniversary && (
                  <div className="absolute top-6 left-6 px-4 py-2 bg-primary/95 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg flex items-center gap-2 backdrop-blur-md z-10">
                    <Smile size={12} />
                    Anniversary
                  </div>
                )}

                {/* Desktop-only Hover Overlay */}
                <div className="absolute inset-0 bg-slate-900/0 md:group-hover:bg-slate-900/60 md:backdrop-blur-[2px] transition-all duration-500 opacity-0 md:group-hover:opacity-100 hidden md:flex flex-col justify-end p-10">
                  <div className="flex items-center gap-3 text-white/60 text-[9px] font-black uppercase tracking-widest mb-3">
                    <Calendar size={12} />
                    {item.upload_date ? new Date(item.upload_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Heritage'}
                  </div>
                  <h3 className="text-3xl font-black text-white leading-tight mb-4">{item.event_name}</h3>
                  <p className="text-white/80 text-sm font-medium leading-relaxed line-clamp-3 mb-6">
                    {item.description}
                  </p>
                  <div className="w-12 h-1 bg-primary/80 rounded-full"></div>
                </div>
              </div>

              {/* Mobile Footer */}
              <div className="p-7 md:hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{item.event_name}</h3>
                  <button 
                    onClick={(e) => toggleLike(e, item.id)}
                    className={`transition-all duration-300 p-3 -m-3 active:scale-90 ${likedItems.has(item.id) ? 'text-primary scale-110' : 'text-slate-300 hover:text-primary'}`}
                  >
                    <Heart size={22} fill={likedItems.has(item.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-6">
                  {item.description}
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                   <div className="flex-1 h-12 bg-slate-50 rounded-2xl flex items-center px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                     Join the reflection...
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                      <MessageSquare size={18} />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        ) : (
          /* Videos Grid */
          <div className="max-w-[1400px] mx-auto">
            {videosLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={32} className="text-stone-300 animate-spin mb-3" />
                <p className="text-stone-400 text-sm font-semibold">Loading videos...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-stone-300">
                <Play size={48} strokeWidth={1} className="mb-4" />
                <p className="text-stone-400 text-sm font-semibold">No videos uploaded yet</p>
              </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-stone-300">
                      <Play size={40} strokeWidth={1} className="mb-3" />
                      <p className="text-stone-400 text-sm font-semibold">No videos in this category</p>
                    </div>
                  ) : filteredVideos.map(video => {
                      const embedUrl = video.video_type === 'link' ? getEmbedUrl(video.platform, video.video_url || '') : null;
                      return (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] border border-slate-50 transition-all duration-700 cursor-pointer"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="relative overflow-hidden mx-4 md:mx-0 rounded-[1.5rem] md:rounded-none border border-slate-100/50 md:border-none shadow-sm md:shadow-none aspect-video bg-stone-100">
                        {embedUrl ? (
                          <img
                            src={video.thumbnail_url || `https://img.youtube.com/vi/${(video.video_url || '').match(/(?:watch\?v=|youtu\.be\/|embed\/)([^&?#]+)/)?.[1] || ''}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-[2500ms] group-hover:scale-105"
                          />
                        ) : video.video_type === 'upload' && video.video_file_url ? (
                          <video
                            src={video.video_file_url}
                            className="w-full h-full object-cover transition-transform duration-[2500ms] group-hover:scale-105"
                            preload="metadata"
                            muted
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-100">
                            <Play size={48} className="text-stone-300" />
                          </div>
                        )}
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/60 group-hover:scale-110 transition-all duration-300">
                            <Play size={24} className="text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight truncate">{video.title || 'Untitled Video'}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-stone-100 rounded-md text-[9px] font-black uppercase tracking-widest text-stone-500">
                            {video.video_type === 'upload' ? 'Uploaded' : video.platform}
                          </span>
                          <span className="text-[10px] text-stone-300 font-medium">
                            {video.created_at ? new Date(video.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                </div>
            )}
          </div>
        )}
      </div>

        {/* Video Modal */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col"
              onClick={() => setSelectedVideo(null)}
            >
              <div className="shrink-0 flex items-center justify-between px-4 md:px-8 py-3 bg-white/5 backdrop-blur-xl border-b border-white/10 z-[110]">
                {/* Prev */}
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrevVideo(); }}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-all group shrink-0"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <ChevronLeft size={18} />
                  </div>
                  <span className="hidden lg:inline text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white/70 transition-colors">Prev</span>
                </button>

                {/* Title + Counter */}
                <div className="flex-1 min-w-0 text-center">
                  <h2 className="text-sm md:text-base font-bold text-white truncate">{selectedVideo.title || 'Untitled Video'}</h2>
                  <div className="flex items-center justify-center gap-3 mt-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2.5 py-0.5 rounded-full">
                      {selectedVideo.video_type === 'upload' ? 'Uploaded' : selectedVideo.platform}
                    </span>
                    <span className="text-[9px] font-medium text-white/30">
                      {selectedVideoIndex + 1}/{filteredVideos.length}
                    </span>
                  </div>
                </div>

                {/* Close + Next */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white/60 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToNextVideo(); }}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-all group"
                  >
                    <span className="hidden lg:inline text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white/70 transition-colors">Next</span>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 flex items-center justify-center px-3 md:px-10 py-4">
                <div className="w-full h-full max-w-5xl max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  {(() => {
                    const embedUrl = selectedVideo.video_type === 'link' ? getEmbedUrl(selectedVideo.platform, selectedVideo.video_url || '') : null;
                    if (embedUrl) {
                      return <iframe src={embedUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />;
                    }
                    if (selectedVideo.video_type === 'upload' && selectedVideo.video_file_url) {
                       return <video src={forceH264(selectedVideo.video_file_url)} controls autoPlay playsInline type="video/mp4" className="w-full h-full" />;
                    }
                    return <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">No video source available</div>;
                  })()}
                </div>
              </div>
              <div className="shrink-0 bg-white/5 backdrop-blur-xl border-t border-white/10 px-8 py-3 flex items-center justify-center gap-4">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/50">
                  {selectedVideo.video_type === 'upload' ? 'Uploaded Video' : selectedVideo.platform}
                </span>
                {selectedVideo.description && (
                  <p className="text-xs text-white/40 text-center max-w-lg">{selectedVideo.description}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chronicle Explorer - Clean Three-Zone Layout */}
        <AnimatePresence>
          {selectedIdx !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col"
            >
              {/* ── Header Bar ───────────────────────────── */}
              <div className="shrink-0 flex items-center justify-between gap-4 px-4 md:px-8 py-3 bg-white/5 backdrop-blur-xl border-b border-white/10 z-[110]">
                {/* Prev */}
                <button
                  onClick={prevImage}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-all group shrink-0"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <ChevronLeft size={18} />
                  </div>
                  <span className="hidden lg:inline text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white/70 transition-colors">Prev</span>
                </button>

                {/* Title + Badge */}
                <div className="flex-1 min-w-0 text-center">
                  <motion.h2
                    key={filteredItems[selectedIdx].id}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-sm md:text-base font-bold text-white truncate"
                  >
                    {filteredItems[selectedIdx].event_name}
                  </motion.h2>
                  <div className="flex items-center justify-center gap-3 mt-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2.5 py-0.5 rounded-full">
                      {filteredItems[selectedIdx].module_id} Group
                    </span>
                    <span className="text-[9px] font-medium text-white/30">
                      {new Date(filteredItems[selectedIdx].upload_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Close + Next */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedIdx(null)}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white/60 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-all group"
                  >
                    <span className="hidden lg:inline text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white/70 transition-colors">Next</span>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </button>
                </div>
              </div>

              {/* ── Image Canvas (2-3 images at once) ────── */}
              <div className="flex-1 min-h-0 flex items-center justify-center px-3 md:px-10 py-4 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center gap-3 md:gap-5">
                  {/* Prev image (visible on md+) */}
                  {filteredItems.length > 2 && (
                    <motion.button
                      onClick={prevImage}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 0.4, x: 0 }}
                      className="hidden md:flex shrink-0 w-[18%] h-[70%] rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 hover:opacity-70 transition-all cursor-pointer group"
                    >
                      <img
                        src={filteredItems[(selectedIdx - 1 + filteredItems.length) % filteredItems.length].image_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </motion.button>
                  )}

                  {/* Current image (main) */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={filteredItems[selectedIdx].id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 150, damping: 22 }}
                      className="shrink-0 w-full md:w-[60%] h-full max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                    >
                      <img
                        src={filteredItems[selectedIdx].image_url}
                        alt={filteredItems[selectedIdx].event_name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Next image (visible on md+) */}
                  {filteredItems.length > 1 && (
                    <motion.button
                      onClick={nextImage}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 0.4, x: 0 }}
                      className="hidden md:flex shrink-0 w-[18%] h-[70%] rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 hover:opacity-70 transition-all cursor-pointer group"
                    >
                      <img
                        src={filteredItems[(selectedIdx + 1) % filteredItems.length].image_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* ── Footer Bar ──────────────────────────── */}
              <div className="shrink-0 bg-white/5 backdrop-blur-xl border-t border-white/10 z-[110]">
                {/* Quote / Reflection */}
                <div className="hidden md:flex items-center justify-center gap-4 px-8 py-3 border-b border-white/5">
                  <MessageSquare size={14} className="text-blue-400/60 shrink-0" />
                  <p className="text-xs text-white/40 italic text-center max-w-lg">
                    "This day remains etched in our hearts as a testament of our collective faith and spirit."
                  </p>
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 shrink-0">Elder Witness</span>
                </div>

                {/* Actions + Thumbnails */}
                <div className="flex items-center gap-4 px-4 md:px-8 py-3">
                  {/* Acknowledge */}
                  <button
                    onClick={(e) => toggleLike(e, filteredItems[selectedIdx].id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 ${
                      likedItems.has(filteredItems[selectedIdx].id)
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/10 text-white/50 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    <Heart size={14} fill={likedItems.has(filteredItems[selectedIdx].id) ? 'currentColor' : 'none'} />
                    <span className="hidden sm:inline">Acknowledge</span>
                  </button>

                  {/* Share */}
                  <button className="w-10 h-10 rounded-xl bg-white/10 text-white/50 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all shrink-0">
                    <Send size={16} />
                  </button>

                  {/* Thumbnail Strip */}
                  <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto hide-scrollbar px-2">
                    {filteredItems.slice(0, 12).map((thum, idx) => (
                      <button
                        key={thum.id}
                        onClick={() => setSelectedIdx(idx)}
                        className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedIdx === idx
                            ? 'border-blue-400 w-14 h-10 md:w-20 md:h-14 opacity-100'
                            : 'border-white/10 w-10 h-8 md:w-14 md:h-10 opacity-40 hover:opacity-70'
                        }`}
                      >
                        <img src={thum.image_url} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  {/* Counter */}
                  <span className="text-[10px] font-bold text-white/30 shrink-0 tabular-nums">
                    {selectedIdx + 1}/{filteredItems.length}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default GallerySection;
