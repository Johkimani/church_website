import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaTiktok,
  FaYoutube,
  FaFacebook,
  FaShareAlt,
  FaTimes,
  FaPlay,
  FaExternalLinkAlt,
  FaUpload,
  FaVideo,
  FaCloudUploadAlt,
  FaTrash,
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

const MAX_VIDEOS = 7;

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
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [maxVideos, setMaxVideos] = useState(MAX_VIDEOS);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/community-videos/${moduleId}/videos`);
        setVideos(res.data?.videos || []);
        if (res.data?.maxVideos) setMaxVideos(res.data.maxVideos);
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

  const isAtMax = videos.length >= maxVideos;

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setUploadFile(file);
      setShowUploadForm(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setShowUploadForm(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Requesting upload signature...');

    try {
      // Step 1: Get signed upload params from backend
      const sigRes = await apiClient.get(`/community-videos/${moduleId}/videos/signature`);
      const { signature, timestamp, folder, public_id, api_key, cloud_name } = sigRes.data;

      // Step 2: Upload directly to Cloudinary from browser
      setUploadStatus('Uploading to Cloudinary...');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('api_key', api_key);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('folder', folder);
      formData.append('public_id', public_id);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`;

      const xhr = new XMLHttpRequest();
      const cloudinaryResult = await new Promise<any>((resolve, reject) => {
        xhr.open('POST', cloudinaryUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            let errMsg = `Cloudinary upload failed: ${xhr.statusText}`;
            try { errMsg = JSON.parse(xhr.responseText)?.error?.message || errMsg; } catch {}
            reject(new Error(errMsg));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      // Step 3: Save metadata to backend
      setUploadStatus('Saving video details...');
      setUploadProgress(100);
      await apiClient.post(`/community-videos/${moduleId}/videos/save-upload`, {
        title: uploadTitle || uploadFile.name.replace(/\.[^/.]+$/, ''),
        description: uploadDescription,
        video_file_url: cloudinaryResult.secure_url,
        cloudinary_public_id: cloudinaryResult.public_id,
      });

      const res = await apiClient.get(`/community-videos/${moduleId}/videos`);
      setVideos(res.data?.videos || []);
      setShowUploadForm(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadProgress(0);
      setUploadStatus('');
    } catch (e: any) {
      alert(e?.response?.data?.error || e?.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (video: Video) => {
    if (!confirm(`Delete "${video.title || 'this video'}"?`)) return;
    try {
      await apiClient.delete(`/community-videos/${moduleId}/videos/${video.id}`);
      setVideos(videos.filter(v => v.id !== video.id));
    } catch {
      alert('Failed to delete video');
    }
  };

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

      {/* Upload Zone (drag-and-drop) */}
      {isMember && !isAtMax && (
        <div
          className={`mb-5 p-6 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-purple-400 bg-purple-50'
              : 'border-slate-300 hover:border-purple-300 hover:bg-slate-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileSelect}
            className="hidden"
          />
          <FaCloudUploadAlt className={`mx-auto mb-2 ${isDragging ? 'text-purple-500' : 'text-slate-400'}`} size={28} />
          <p className="text-sm font-bold text-slate-600">
            {isDragging ? 'Drop video here' : 'Drag & drop a video or click to upload'}
          </p>
          <p className="text-xs text-slate-400 mt-1">MP4, WebM, MOV — Max 50 MB</p>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && uploadFile && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !isUploading && setShowUploadForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-800">Upload Video</h3>
              {!isUploading && (
                <button onClick={() => setShowUploadForm(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                  <FaTimes size={16} />
                </button>
              )}
            </div>

            <div className="mb-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-700 truncate">{uploadFile.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{(uploadFile.size / (1024 * 1024)).toFixed(1)} MB</p>
            </div>

            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Video title (optional)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500"
                disabled={isUploading}
              />
              <input
                type="text"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Short description (optional)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500"
                disabled={isUploading}
              />
            </div>

            {isUploading && (
              <div className="mb-4">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 text-center">
                  {uploadStatus} {uploadProgress > 0 && `${uploadProgress}%`}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                disabled={isUploading}
                className="px-4 py-2 text-slate-500 text-xs font-bold hover:text-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-purple-500 text-white rounded-xl text-xs font-black hover:bg-purple-600 transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaUpload size={12} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <video
                      src={videoSrc}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                    />
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
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(video); }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600"
                  >
                    <FaTrash size={10} />
                  </button>
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
            {selectedVideo.video_type === 'upload' && selectedVideo.video_file_url ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <video
                  src={selectedVideo.video_file_url}
                  controls
                  className="w-full h-full"
                  autoPlay
                />
              </div>
            ) : getEmbedUrl(selectedVideo.platform, selectedVideo.video_url || '') ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={getEmbedUrl(selectedVideo.platform, selectedVideo.video_url || '')!}
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
                  href={selectedVideo.video_url || '#'}
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
                  {getPlatformDetails(selectedVideo.video_type === 'upload' ? 'upload' : selectedVideo.platform).icon}
                  {getPlatformDetails(selectedVideo.video_type === 'upload' ? 'upload' : selectedVideo.platform).name}
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
