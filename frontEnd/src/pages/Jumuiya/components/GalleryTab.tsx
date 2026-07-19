import React, { useState } from 'react';
import type { GalleryImage } from '../data/jumuiyaData';
import { FaImages, FaArrowLeft, FaArrowRight, FaTimes, FaCamera } from "react-icons/fa";
import './TabsSystem.css';

interface GalleryTabProps {
    gallery: GalleryImage[];
}

const GalleryTab: React.FC<GalleryTabProps> = ({ gallery }) => {
    const [selectedAlbum, setSelectedAlbum] = useState<GalleryImage | null>(null);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const openAlbum = (album: GalleryImage) => {
        setSelectedAlbum(album);
    };

    const closeAlbum = () => {
        setSelectedAlbum(null);
    };

    const openLightbox = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setLightboxIndex(index);
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedAlbum?.images && lightboxIndex !== null) {
            setLightboxIndex((prev) =>
                prev !== null && prev < selectedAlbum.images!.length - 1 ? prev + 1 : 0
            );
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedAlbum?.images && lightboxIndex !== null) {
            setLightboxIndex((prev) =>
                prev !== null && prev > 0 ? prev - 1 : selectedAlbum.images!.length - 1
            );
        }
    };

    const hasGallery = gallery && gallery.length > 0;

    return (
        <div className="tab-system-content">
            <div className="tab-header-wrap">
                <div className="header-text">
                    <h1 className="page-title">Community Gallery</h1>
                    <p className="page-description">
                        Browse through our cherished moments — celebrations, outreach, and fellowship captured in photos.
                    </p>
                </div>
            </div>

            {!hasGallery ? (
                <div className="empty-state animate-fade" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px 20px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'var(--bg-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        fontSize: '2.5rem',
                        color: 'var(--jumuiya-color)',
                        opacity: 0.5,
                    }}>
                        <FaCamera />
                    </div>
                    <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 700 }}>
                        No Albums Yet
                    </h3>
                    <p style={{ maxWidth: '400px', margin: 0, fontSize: '0.9rem' }}>
                        This Jumuiya hasn't uploaded any gallery albums yet. Check back soon for photos from our community events!
                    </p>
                </div>
            ) : (
                <div className="animate-fade">
                    {/* Gallery Albums Grid */}
                    <div className="gallery-grid-premium" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {gallery.map(album => (
                            <div
                                key={album.id}
                                className="gallery-item-premium tab-card"
                                onClick={() => openAlbum(album)}
                                style={{
                                    padding: 0,
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '';
                                }}
                            >
                                <div style={{ position: 'relative', height: '200px', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
                                    <img
                                        src={album.url}
                                        alt={album.caption}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.4s ease',
                                        }}
                                    />
                                    <div
                                        className="gallery-overlay-premium"
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '40px 16px 16px',
                                            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                        }}
                                    >
                                        <div style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', marginBottom: '4px' }}>
                                            {album.caption}
                                        </div>
                                        <div style={{
                                            color: 'rgba(255,255,255,0.8)',
                                            fontSize: '0.8rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <FaImages size={14} /> {album.images?.length || 0} Photos
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Album View Modal */}
            {selectedAlbum && (
                <div className="lightbox-overlay" onClick={closeAlbum} style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '20px',
                }}>
                    <div
                        className="tab-card glass-card animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '90%',
                            maxWidth: '1000px',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 0,
                            borderRadius: '20px',
                            background: 'white',
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid var(--border-light)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0,
                        }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>{selectedAlbum.caption}</h2>
                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {selectedAlbum.images?.length || 0} photos
                                </p>
                            </div>
                            <button
                                className="btn-premium"
                                onClick={closeAlbum}
                                style={{
                                    padding: '8px',
                                    background: 'var(--bg-soft)',
                                    borderRadius: '50%',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '40px',
                                    height: '40px',
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body - Image Grid */}
                        <div style={{
                            padding: '24px',
                            overflowY: 'auto',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '12px',
                            flex: 1,
                        }}>
                            {selectedAlbum.images?.map((img, index) => (
                                <div
                                    key={index}
                                    className="gallery-item-premium"
                                    onClick={(e) => openLightbox(index, e)}
                                    style={{
                                        height: '140px',
                                        cursor: 'pointer',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.03)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                >
                                    <img
                                        src={img}
                                        alt={`${selectedAlbum.caption} ${index + 1}`}
                                        loading="lazy"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Full-Screen Lightbox */}
            {lightboxIndex !== null && selectedAlbum?.images && (
                <div className="lightbox-overlay" onClick={closeLightbox} style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3000,
                }}>
                    {/* Previous Button */}
                    <button
                        onClick={prevImage}
                        style={{
                            position: 'absolute',
                            left: '20px',
                            zIndex: 3001,
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(4px)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                        }}
                    >
                        <FaArrowLeft />
                    </button>

                    {/* Image */}
                    <div
                        className="lightbox-img-wrap"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '85vw',
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <img
                            src={selectedAlbum.images[lightboxIndex]}
                            alt={`${selectedAlbum.caption} ${lightboxIndex + 1}`}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                                borderRadius: '8px',
                            }}
                        />
                        <div style={{
                            marginTop: '16px',
                            color: 'rgba(255,255,255,0.8)',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            textAlign: 'center',
                        }}>
                            {selectedAlbum.caption} ({lightboxIndex + 1} / {selectedAlbum.images.length})
                        </div>
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={nextImage}
                        style={{
                            position: 'absolute',
                            right: '20px',
                            zIndex: 3001,
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(4px)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                        }}
                    >
                        <FaArrowRight />
                    </button>

                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            zIndex: 3001,
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(4px)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>
            )}
        </div>
    );
};

export default GalleryTab;
