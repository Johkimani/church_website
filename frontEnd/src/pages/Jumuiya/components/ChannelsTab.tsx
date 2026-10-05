import React, { useState, useEffect } from 'react';
import type { SocialMedia } from '../data/jumuiyaData';
import { FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaYoutube, FaEnvelope, FaGlobe, FaTiktok, FaImages, FaArrowLeft, FaArrowRight, FaTimes, FaShareAlt } from "react-icons/fa";
import { apiClient } from '../../../api/axiosInstance';
import PageLoader from '../../../assets/Layouts/PageLoader';
import './TabsSystem.css';

interface ChannelsTabProps {
    socialMedia: SocialMedia[];
    jumuiyaId?: string; // group_id from the jumuiya record
    isMember?: boolean; // whether the viewer belongs to this jumuiya
}

// The 3 fixed categories for every Jumuiya gallery
const JUMUIYA_CATEGORIES = ['Family Prayer Meeting', 'Events', 'Trips'] as const;
type JumuiyaCategory = typeof JUMUIYA_CATEGORIES[number];

interface LiveGalleryImage {
    id: number;
    image_url: string;
    event_name: string;
    category?: string;
    description?: string;
    upload_date?: string;
}

interface AlbumView {
    caption: JumuiyaCategory;
    images: LiveGalleryImage[];
    coverUrl: string;
}

const CATEGORY_ICONS: Record<JumuiyaCategory, string> = {
    'Family Prayer Meeting': '',
    'Events': '',
    'Trips': '',
};

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

const ChannelsTab: React.FC<ChannelsTabProps> = ({ socialMedia, jumuiyaId, isMember }) => {
    const [albums, setAlbums] = useState<AlbumView[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState<AlbumView | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // WhatsApp group links are only shown to members of the jumuiya so that
    // non-members cannot crowd the groups. Other channels (Facebook, TikTok)
    // remain public.
    const visibleSocial = isMember
        ? socialMedia
        : socialMedia.filter((c) => {
              const p = (c.platform || '').toLowerCase();
              return !(p.includes('whatsapp') || p.includes('whats app'));
          });

    useEffect(() => {
        if (!jumuiyaId) return;
        fetchGallery();
    }, [jumuiyaId]);

    const fetchGallery = async () => {
        if (!jumuiyaId) return;
        setLoading(true);
        try {
            const { data } = await apiClient.get('/hub-gallery', {
                params: { module_id: jumuiyaId },
            });
            const items: LiveGalleryImage[] = data?.items || [];

            // Group by the 3 fixed Jumuiya categories
            const grouped: Record<JumuiyaCategory, LiveGalleryImage[]> = {
                'Family Prayer Meeting': [],
                'Events': [],
                'Trips': [],
            };

            items.forEach(img => {
                const cat = (img.category || '') as JumuiyaCategory;
                if (grouped[cat]) {
                    grouped[cat].push(img);
                }
            });

            const built: AlbumView[] = JUMUIYA_CATEGORIES
                .filter(cat => grouped[cat].length > 0)
                .map(cat => ({
                    caption: cat,
                    images: grouped[cat],
                    coverUrl: grouped[cat][0].image_url,
                }));

            setAlbums(built);
        } catch (err) {
            console.error('Failed to load Jumuiya gallery:', err);
            setAlbums([]);
        } finally {
            setLoading(false);
        }
    };

    const openAlbum = (album: AlbumView) => setSelectedAlbum(album);
    const closeAlbum = () => { setSelectedAlbum(null); setLightboxIndex(null); };
    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedAlbum && lightboxIndex !== null) {
            setLightboxIndex(prev =>
                prev !== null && prev < selectedAlbum.images.length - 1 ? prev + 1 : 0
            );
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedAlbum && lightboxIndex !== null) {
            setLightboxIndex(prev =>
                prev !== null && prev > 0 ? prev - 1 : selectedAlbum.images.length - 1
            );
        }
    };

    return (
        <div className="tab-system-content">
            <div className="tab-header-wrap">
                <div className="header-text">
                    <h1 className="page-title">Connect &amp; Explore</h1>
                    <p className="page-description">
                        Follow our official channels and dive into our community's shared memories and celebrations.
                    </p>
                </div>
            </div>

            {/* Social Media Section */}
            <div className="animate-fade" style={{ marginBottom: 'var(--space-3xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', opacity: 0.6 }}>
                    <FaShareAlt />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Social Channels</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                </div>
                <div className="tab-grid">
                    {visibleSocial.map((channel, index) => (
                        <a
                            key={index}
                            href={channel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tab-card animate-fade"
                            style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="notif-icon-wrap" style={{ marginBottom: 0, background: 'var(--bg-soft)', color: 'var(--jumuiya-color)' }}>
                                {getPlatformIcon(channel.platform)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{channel.platform}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Follow our updates</div>
                            </div>
                            <FaArrowRight style={{ color: 'var(--jumuiya-color)', opacity: 0.5 }} />
                        </a>
                    ))}
                </div>
            </div>

            {/* Gallery Section */}
            <div className="animate-fade">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', opacity: 0.6 }}>
                    <FaImages />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Community Gallery</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                </div>

                {loading ? (
                    <PageLoader message="Loading gallery" />
                ) : albums.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', opacity: 0.4 }}>
                        <FaImages style={{ fontSize: '2.5rem', marginBottom: '12px' }} />
                        <p style={{ fontWeight: 700 }}>No photos uploaded yet</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Your Jumuiya OS will add photos here soon.</p>
                    </div>
                ) : (
                    <div className="gallery-grid-premium">
                        {albums.map(album => (
                            <div
                                key={album.caption}
                                className="gallery-item-premium tab-card"
                                onClick={() => openAlbum(album)}
                                style={{ padding: 0 }}
                            >
                                <img
                                    src={album.coverUrl}
                                    alt={album.caption}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div className="gallery-overlay-premium">
                                    <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>
                                        {CATEGORY_ICONS[album.caption]}
                                    </div>
                                    <div style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>
                                        {album.caption}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaImages /> {album.images.length} {album.images.length === 1 ? 'Photo' : 'Photos'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Album Modal */}
            {selectedAlbum && (
                <div className="lightbox-overlay" onClick={closeAlbum}>
                    <div
                        className="tab-card glass-card"
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}
                    >
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                                {CATEGORY_ICONS[selectedAlbum.caption]} {selectedAlbum.caption}
                            </h2>
                            <button className="btn-premium" onClick={closeAlbum} style={{ padding: '8px', background: 'var(--bg-soft)', borderRadius: '50%' }}>
                                <FaTimes />
                            </button>
                        </div>
                        <div style={{ padding: '24px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                            {selectedAlbum.images.map((img, index) => (
                                <div
                                    key={img.id}
                                    className="gallery-item-premium"
                                    onClick={() => openLightbox(index)}
                                    style={{ height: '150px' }}
                                >
                                    <img
                                        src={img.image_url}
                                        alt={img.event_name || `${selectedAlbum.caption} ${index + 1}`}
                                        loading="lazy"
                                    />
                                    {img.event_name && (
                                        <div className="gallery-overlay-premium" style={{ fontSize: '0.7rem', padding: '8px' }}>
                                            <span style={{ color: 'white', fontWeight: 700 }}>{img.event_name}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxIndex !== null && selectedAlbum && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <button className="btn-premium" onClick={prevImage} style={{ position: 'absolute', left: '20px', zIndex: 2001, background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                        <FaArrowLeft />
                    </button>
                    <div className="lightbox-img-wrap" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                        <img
                            src={selectedAlbum.images[lightboxIndex].image_url}
                            alt={`${selectedAlbum.caption} ${lightboxIndex + 1}`}
                        />
                        <div style={{ position: 'absolute', bottom: '-40px', width: '100%', textAlign: 'center', color: 'white', fontWeight: 600 }}>
                            {selectedAlbum.caption} ({lightboxIndex + 1} / {selectedAlbum.images.length})
                        </div>
                    </div>
                    <button className="btn-premium" onClick={nextImage} style={{ position: 'absolute', right: '20px', zIndex: 2001, background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                        <FaArrowRight />
                    </button>
                    <button className="btn-premium" onClick={closeLightbox} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 2001, background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                        <FaTimes />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChannelsTab;
