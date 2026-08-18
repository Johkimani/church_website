import React, { useState, useEffect } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaYoutube, FaEnvelope, FaGlobe, FaTiktok, FaImages } from 'react-icons/fa';
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

const getPlatformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('facebook')) return <FaFacebook />;
  if (p.includes('twitter') || p.includes('x')) return <FaTwitter />;
  if (p.includes('instagram')) return <FaInstagram />;
  if (p.includes('whatsapp')) return <FaWhatsapp />;
  if (p.includes('youtube')) return <FaYoutube />;
  if (p.includes('email') || p.includes('mail')) return <FaEnvelope />;
  if (p.includes('tiktok')) return <FaTiktok />;
  return <FaGlobe />;
};

const CommunityChannelsTab: React.FC<Props> = ({ moduleId, module, color }) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

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

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Channels & Gallery</h1>
          <p className="page-description">Stay connected and view moments from our community.</p>
        </div>
      </div>

      {/* Social Media */}
      {socialMedia.length > 0 && (
        <div className="channels-section">
          <h2 className="section-title">Social Channels</h2>
          <div className="social-grid">
            {socialMedia.map((sm: any, i: number) => (
              <a
                key={i}
                href={sm.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="social-card"
              >
                <div className="social-icon" style={{ color }}>{getPlatformIcon(sm.platform || sm.name)}</div>
                <span className="social-name">{sm.platform || sm.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      <div className="channels-section">
        <h2 className="section-title"><FaImages /> Photo Gallery</h2>
        {(gallery.length > 0 || galleryImages.length > 0) ? (
          <div className="gallery-grid">
            {[...gallery, ...galleryImages.map(g => ({ id: String(g.id), url: g.image_url, caption: g.event_name }))].map((img: any) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="gallery-item"
              >
                <img src={img.url || img.imageUrl || img.image_url} alt={img.caption} loading="lazy" />
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaImages className="empty-icon" />
            <p>No photos yet.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>&times;</button>
            <img src={selectedImage.url || (selectedImage as any).imageUrl || (selectedImage as any).image_url} alt={selectedImage.caption} />
            {selectedImage.caption && <p className="lightbox-caption">{selectedImage.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityChannelsTab;
