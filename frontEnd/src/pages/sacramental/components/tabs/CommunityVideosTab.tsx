import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaShareAlt,
  FaTimes,
  FaPlay,
  FaExternalLinkAlt,
  FaVideo,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
} from 'react-icons/fa';
import { apiClient } from '../../../../api/axiosInstance';

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
  video_url: string | null;
  video_file_url: string | null;
  video_type: 'link' | 'upload';
  cloudinary_public_id: string | null;
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
  upload: {
    name: 'Uploaded',
    icon: <FaVideo size={18} />,
    brandColor: '#7c3aed',
  },
};

const getPlatformDetails = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('tiktok')) return PLATFORM_CONFIG.tiktok;
  if (p.includes('youtube')) return PLATFORM_CONFIG.youtube;
  if (p.includes('facebook')) return PLATFORM_CONFIG.facebook;
  if (p.includes('upload')) return PLATFORM_CONFIG.upload;
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

  return null;
};

/** Force H.264 MP4 encoding via Cloudinary delivery transformation */
const forceH264 = (url: string): string => {
  if (!url) return url;
  return url.replace('/video/upload/', '/video/upload/video_codec_h264,format_mp4/');
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

  const platforms = ['all', ...Array.from(new Set(videos.map(v => v.video_type === 'upload' ? 'upload' : v.platform.toLowerCase())))];

  const filteredVideos = filter === 'all' ? videos : videos.filter(v => {
    if (filter === 'upload') return v.video_type === 'upload';
    return v.platform.toLowerCase() === filter;
  });

  const closeModal = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  const selectedVideoIndex = selectedVideo ? filteredVideos.findIndex(v => v.id === selectedVideo.id) : -1;

  const goToNext = useCallback(() => {
    if (selectedVideoIndex < 0 || filteredVideos.length === 0) return;
    const nextIdx = (selectedVideoIndex + 1) % filteredVideos.length;
    setSelectedVideo(filteredVideos[nextIdx]);
  }, [selectedVideoIndex, filteredVideos]);

  const goToPrev = useCallback(() => {
    if (selectedVideoIndex < 0 || filteredVideos.length === 0) return;
    const prevIdx = (selectedVideoIndex - 1 + filteredVideos.length) % filteredVideos.length;
    setSelectedVideo(filteredVideos[prevIdx]);
  }, [selectedVideoIndex, filteredVideos]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedVideo) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedVideo, closeModal, goToNext, goToPrev]);

  return (
    <div
      className="tab-system-content"
      style={{ '--jumuiya-color': color } as React.CSSProperties}
    >
      {selectedVideo ? ReactDOM.createPortal(
        /* Video Player Modal — Fullscreen overlay */
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50">
          {/* Controls bar */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-3 md:px-6 py-3 bg-white border-b border-slate-200">
            <button
              type="button"
              onClick={closeModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition text-xs font-bold cursor-pointer"
            >
              <FaArrowLeft size={12} />
              <span className="hidden sm:inline">Back to videos</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPrev}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition text-xs font-bold cursor-pointer"
                title="Previous video"
              >
                <FaChevronLeft size={12} />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <span className="text-xs font-bold text-slate-500 px-1">
                {selectedVideoIndex + 1} / {filteredVideos.length}
              </span>

              <button
                type="button"
                onClick={goToNext}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition text-xs font-bold cursor-pointer"
                title="Next video"
              >
                <span className="hidden sm:inline">Next</span>
                <FaChevronRight size={12} />
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-red-500 hover:border-red-500 hover:text-white text-slate-500 shadow-sm transition flex items-center justify-center cursor-pointer"
                title="Close player"
              >
                <FaTimes size={13} />
              </button>
            </div>
          </div>

          {/* Video — fills all remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden bg-slate-50">
            {selectedVideo.video_type === 'upload' && selectedVideo.video_file_url ? (
              <video
                key={selectedVideo.id}
                src={forceH264(selectedVideo.video_file_url)}
                controls
                autoPlay
                playsInline
                crossOrigin="anonymous"
                type="video/mp4"
                className="w-full h-full block object-contain"
              />
            ) : getEmbedUrl(selectedVideo.platform, selectedVideo.video_url || '') ? (
              <iframe
                key={selectedVideo.id}
                src={getEmbedUrl(selectedVideo.platform, selectedVideo.video_url || '')!}
                className="w-full h-full block border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                title={selectedVideo.title || 'Video'}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white">
                <a
                  href={selectedVideo.video_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800 text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                >
                  <FaExternalLinkAlt size={16} />
                  <span>Watch on {getPlatformDetails(selectedVideo.platform).name}</span>
                </a>
              </div>
            )}
          </div>
        </div>,
        document.getElementById('modal-root')!
      ) : (
        /* Video List & Grid View — shown when no video is playing */
        <>
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
                const info = getPlatformDetails(video.video_type === 'upload' ? 'upload' : video.platform);
                const videoSrc = video.video_type === 'upload' ? video.video_file_url : null;
                return (
                  <div
                    key={video.id}
                    className="group rounded-2xl overflow-hidden bg-white border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-lg cursor-pointer relative"
                    onClick={() => setSelectedVideo(video)}
                  >
                    {/* Thumbnail / Preview */}
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      {videoSrc ? (
                        // Use Cloudinary's thumbnail generation: replace /upload/ with /upload/so_0/
                        // and swap the extension to .jpg for a still-frame poster image.
                        // Falls back to a video icon if the URL can't be transformed.
                        (() => {
                          const poster = videoSrc
                            .replace('/video/upload/', '/video/upload/so_0,w_640/')
                            .replace(/\.(mp4|webm|mov|avi)$/i, '.jpg');
                          return (
                            <img
                              src={poster}
                              alt={video.title || 'Video thumbnail'}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                              onError={(e) => {
                                // If poster generation fails, show the video icon placeholder
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          );
                        })()
                      ) : video.thumbnail_url ? (
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
                        {videoSrc ? (
                          <FaVideo className="text-slate-300" size={12} />
                        ) : (
                          <FaExternalLinkAlt className="text-slate-300 group-hover:text-slate-500 transition-colors" size={12} />
                        )}
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
                Videos from TikTok, YouTube, or uploaded files will appear here.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
            </div>
          )}
        </>
      )}

     </div>
   );
 };

export default CommunityVideosTab;
