import React, { useState, useEffect, useCallback } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaYoutube, FaEnvelope, FaGlobe, FaTiktok, FaImages, FaChevronLeft, FaChevronRight, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { apiClient } from '../../../../api/axiosInstance';
import type { CommunityModule } from '../../context/CommunityDataContext';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  moduleId: string;
  module: CommunityModule;
  color: string;
}

interface GalleryImage {
  id: number;
  image_url: string;
  event_name: string;
  category?: string;
}

const PLATFORM_STYLES: Record<string, { icon: React.ReactNode; gradient: string; hoverShadow: string }> = {
  facebook: { icon: <FaFacebook size={22} />, gradient: 'linear-gradient(135deg, #1877f2 0%, #1877f2 100%)', hoverShadow: '0 8px 24px rgba(24,119,242,0.35)' },
  twitter: { icon: <FaTwitter size={22} />, gradient: 'linear-gradient(135deg, #1da1f2 0%, #0d8ecf 100%)', hoverShadow: '0 8px 24px rgba(29,161,242,0.35)' },
  x: { icon: <FaTwitter size={22} />, gradient: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)', hoverShadow: '0 8px 24px rgba(0,0,0,0.35)' },
  instagram: { icon: <FaInstagram size={22} />, gradient: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', hoverShadow: '0 8px 24px rgba(225,48,108,0.35)' },
  whatsapp: { icon: <FaWhatsapp size={22} />, gradient: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)', hoverShadow: '0 8px 24px rgba(37,211,102,0.35)' },
  youtube: { icon: <FaYoutube size={22} />, gradient: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)', hoverShadow: '0 8px 24px rgba(255,0,0,0.35)' },
  email: { icon: <FaEnvelope size={22} />, gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', hoverShadow: '0 8px 24px rgba(59,130,246,0.35)' },
  mail: { icon: <FaEnvelope size={22} />, gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', hoverShadow: '0 8px 24px rgba(59,130,246,0.35)' },
  tiktok: { icon: <FaTiktok size={22} />, gradient: 'linear-gradient(135deg, #010101 0%, #69c9d0 100%)', hoverShadow: '0 8px 24px rgba(0,0,0,0.35)' },
  default: { icon: <FaGlobe size={22} />, gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', hoverShadow: '0 8px 24px rgba(107,114,128,0.35)' },
};

const getPlatformStyle = (platform: string) => {
  const key = platform.toLowerCase();
  return PLATFORM_STYLES[key] || PLATFORM_STYLES.default;
};

const CommunityChannelsTab: React.FC<Props> = ({ moduleId, module, color }) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await apiClient.get('/hub-gallery', { params: { module_id: moduleId } });
        if (Array.isArray(res.data)) setGalleryImages(res.data);
      } catch { /* silent */ }
    };
    fetchGallery();
  }, [moduleId]);

  const gallery = module.gallery || [];
  const socialMedia = (module as any).socialMedia || [];
  const allImages = [...gallery, ...galleryImages.map(g => ({ id: String(g.id), url: g.image_url, caption: g.event_name, category: g.category || 'All' }))];
  const categories = ['all', ...Array.from(new Set(allImages.map((g: any) => g.category || 'All')))];

  const filteredImages = filter === 'all' ? allImages : allImages.filter((g: any) => g.category === filter);

  const lightboxImages = filteredImages;
  const currentImage = selectedIdx !== null ? lightboxImages[selectedIdx] : null;

  const goNext = useCallback(() => {
    if (selectedIdx === null) return;
    setSelectedIdx((prev) => (prev! + 1) % lightboxImages.length);
  }, [selectedIdx, lightboxImages.length]);

  const goPrev = useCallback(() => {
    if (selectedIdx === null) return;
    setSelectedIdx((prev) => (prev! - 1 + lightboxImages.length) % lightboxImages.length);
  }, [selectedIdx, lightboxImages.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') setSelectedIdx(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIdx, goNext, goPrev]);

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Channels & Gallery</h1>
          <p className="page-description">Stay connected and view moments from our community.</p>
        </div>
      </div>

      {/* Social Media - Platform-colored Cards */}
      {socialMedia.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full" style={{ background: color }} />
            Social Channels
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {socialMedia.map((sm: any, i: number) => {
              const style = getPlatformStyle(sm.platform || sm.name);
              return (
                <a
                  key={i}
                  href={sm.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-2xl p-5 text-center overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                  style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: style.gradient }} />
                  <div className="relative z-10">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-white mb-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                      style={{ background: style.gradient }}
                    >
                      {style.icon}
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-white transition-colors duration-300">
                      {sm.platform || sm.name}
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaExternalLinkAlt size={10} className="text-white/70" />
                      <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Visit</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Gallery */}
      <div>
        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full" style={{ background: color }} />
          <FaImages size={16} style={{ color }} /> Photo Gallery
        </h2>

        {/* Category filters */}
        {categories.length > 2 && (
          <div className="flex gap-2 mb-5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filter === cat
                    ? 'text-white shadow-md'
                    : 'text-slate-500 bg-white border border-slate-200 hover:border-slate-300'
                }`}
                style={filter === cat ? { background: color } : {}}
              >
                {cat === 'all' ? 'All Photos' : cat}
              </button>
            ))}
          </div>
        )}

        {lightboxImages.length > 0 ? (
          <div className="columns-2 sm:columns-3 gap-3 space-y-3">
            {lightboxImages.map((img: any, i: number) => (
              <button
                key={img.id}
                onClick={() => setSelectedIdx(i)}
                className="block w-full break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer relative"
              >
                <img
                  src={img.url || img.imageUrl || img.image_url}
                  alt={img.caption}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ minHeight: '120px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {img.caption && (
                  <div className="absolute bottom-0 inset-x-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-bold truncate">{img.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl" style={{ background: `${color}06`, border: `1px dashed ${color}25` }}>
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}10` }}>
              <FaImages style={{ color: `${color}40` }} size={28} />
            </div>
            <p className="font-semibold text-slate-400 text-sm">No photos yet.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedIdx !== null && currentImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedIdx(null)}
        >
          {/* Close */}
          <button
            onClick={() => setSelectedIdx(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-50 cursor-pointer"
          >
            <FaTimes size={18} />
          </button>

          {/* Prev */}
          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-50 cursor-pointer"
            >
              <FaChevronLeft size={20} />
            </button>
          )}

          {/* Next */}
          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-50 cursor-pointer"
            >
              <FaChevronRight size={20} />
            </button>
          )}

          {/* Image */}
          <div className="max-w-4xl max-h-[80vh] relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentImage.url || (currentImage as any).imageUrl || (currentImage as any).image_url}
              alt={currentImage.caption}
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
            {currentImage.caption && (
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
                <p className="text-white text-sm font-bold text-center">{currentImage.caption}</p>
              </div>
            )}
          </div>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <span className="text-white text-xs font-bold">{selectedIdx + 1} / {lightboxImages.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityChannelsTab;
