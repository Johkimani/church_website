import React, { useState, useEffect, useCallback } from 'react';
import {
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaShareAlt,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { apiClient } from '../../../../api/axiosInstance';
import type { CommunityModule } from '../../context/CommunityDataContext';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  moduleId: string;
  module: CommunityModule;
  color: string;
  isMember?: boolean;
}

interface Video {
  id: number;
  module_id: string;
  platform: string;
  video_url: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  posted_by: string;
  created_at: string;
}

const PLATFORM_CONFIG: Record<
  string,
  {
    name: string;
    icon: React.ReactNode;
    brandColor: string;
  }
> = {
  tiktok: {
    name: 'TikTok',
    icon: <FaTiktok size={18} />,
    brandColor: '#000000',
  },
  youtube: {
    name: 'YouTube',
    icon: <FaYoutube size={18} />,
    brandColor: '#FF0000',
  },
  facebook: {
    name: 'Facebook',
    icon: <FaFacebook size={18} />,
    brandColor: '#1877F2',
  },
};

const getPlatformDetails = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('tiktok')) return PLATFORM_CONFIG.tiktok;
  if (p.includes('youtube')) return PLATFORM_CONFIG.youtube;
  if (p.includes('facebook')) return PLATFORM_CONFIG.facebook;
  return {
    name: platform.charAt(0).toUpperCase() + platform.slice(1),
    icon: <FaShareAlt size={18} />,
    brandColor: '#4B5563',
  };
};

const getEmbedUrl = (platform: string, url: string): string | null => {
  const p = platform.toLowerCase();

  if (p.includes('youtube')) {
    let videoId = '';
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/) || url.match(/youtube\.com\/embed\/([^?]+)/);
    if (match) videoId = match[1];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  if (p.includes('tiktok')) {
    return null;
  }

  return null;
};

const CommunityVideosTab: React.FC<Props> = ({
  moduleId,
  module,
  color,
  isMember = false,
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/community-videos/${moduleId}/videos`);
        setVideos(res.data?.videos || []);
      } catch {
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, [moduleId]);

  const platforms = ['all', ...Array.from(new Set(videos.map(v => v.platform.toLowerCase())))];

  const filteredVideos = filter === 'all' ? videos : videos.filter(v => v.platform.toLowerCase() === filter);

  const closeModal = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedVideo && e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedVideo, closeModal]);

  return (
    <div
      className="tab-system-content"
      style={{ '--jumuiya-color': color } as React.CSSProperties}
    >
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Videos</h1>
          <p className="page-description">
            Watch our latest performances and ministrations from TikTok and YouTube.
          </p>
        </div>
      </div>

      {/* Platform Filter */}
      {platforms.length > 2 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {platforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilter(p)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === p
                  ? 'text-white shadow-md'
                  : 'text-slate-600 bg-white border border-slate-200 hover:border-slate-300'
              }`}
              style={filter === p ? { background: color } : {}}
            >
              {p === 'all' ? 'All Videos' : getPlatformDetails(p).name}
            </button>
          ))}
        </div>
      )}

      {/* Videos Grid */}
      {!isLoading && filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => {
            const info = getPlatformDetails(video.platform);
            return (
              <div
                key={video.id}
                className="group rounded-2xl overflow-hidden bg-white border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-lg cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title || 'Video thumbnail'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: `${info.brandColor}10` }}
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: `${info.brandColor}20`, color: info.brandColor }}
                      >
                        {info.icon}
                      </div>
                    </div>
                  )}
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <FaPlay className="text-slate-800 ml-1" size={20} />
                    </div>
                  </div>
                  {/* Platform badge */}
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-white text-[10px] font-bold flex items-center gap-1.5 shadow-sm"
                    style={{ background: info.brandColor }}
                  >
                    {info.icon}
                    <span>{info.name}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-2 mb-1">
                    {video.title || 'Untitled Video'}
                  </h3>
                  {video.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {new Date(video.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <FaExternalLinkAlt className="text-slate-300 group-hover:text-slate-500 transition-colors" size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !isLoading ? (
        <div
          className="text-center py-16 rounded-3xl"
          style={{
            background: `${color}06`,
            border: `1px dashed ${color}25`,
          }}
        >
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ background: `${color}10` }}
          >
            <FaPlay style={{ color: `${color}60` }} size={28} />
          </div>
          <p className="font-bold text-slate-500 text-sm">No videos posted yet</p>
          <p className="text-slate-400 text-xs mt-1">
            Videos from TikTok and YouTube will appear here.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <button
            type="button"
            onClick={closeModal}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-50 cursor-pointer"
            aria-label="Close video"
          >
            <FaTimes size={18} />
          </button>

          <div
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Player or Link */}
            {getEmbedUrl(selectedVideo.platform, selectedVideo.video_url) ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={getEmbedUrl(selectedVideo.platform, selectedVideo.video_url)!}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedVideo.title || 'Video'}
                />
              </div>
            ) : (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                {selectedVideo.thumbnail_url ? (
                  <img
                    src={selectedVideo.thumbnail_url}
                    alt={selectedVideo.title || 'Video thumbnail'}
                    className="w-full h-full object-cover opacity-60"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                      {getPlatformDetails(selectedVideo.platform).icon}
                    </div>
                    <p className="text-white/60 text-sm mb-4">Video preview not available</p>
                  </div>
                )}
                <a
                  href={selectedVideo.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                >
                  <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white text-slate-800 font-bold text-sm shadow-lg hover:scale-105 transition-transform">
                    <FaExternalLinkAlt size={16} />
                    <span>Watch on {getPlatformDetails(selectedVideo.platform).name}</span>
                  </div>
                </a>
              </div>
            )}

            {/* Video Info */}
            <div className="mt-4 text-center">
              <h2 className="text-white font-bold text-lg mb-1">
                {selectedVideo.title || 'Untitled Video'}
              </h2>
              {selectedVideo.description && (
                <p className="text-white/60 text-sm mb-2">{selectedVideo.description}</p>
              )}
              <div className="flex items-center justify-center gap-4 text-white/40 text-xs">
                <span className="flex items-center gap-1.5">
                  {getPlatformDetails(selectedVideo.platform).icon}
                  {getPlatformDetails(selectedVideo.platform).name}
                </span>
                <span>
                  {new Date(selectedVideo.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityVideosTab;
