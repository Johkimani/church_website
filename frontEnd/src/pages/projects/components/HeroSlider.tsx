import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaArrowLeft, FaArrowRight, FaTrash } from 'react-icons/fa';
import apiService from '../../../services/api';

export interface SliderImg {
    id?: number | string;
    url: string;
    title?: string;
    message?: string;
}

interface HeroSliderProps {
    images: SliderImg[];
    isAdmin?: boolean;
    onDelete?: (id: number | string) => void;
    section?: string;
    fallbackImages?: SliderImg[];
    shopAnchor?: string;
    buttonLabel?: string;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
    images,
    isAdmin,
    onDelete,
    shopAnchor = '#products',
    buttonLabel = 'Shop Now',
}) => {
    const [idx, setIdx] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [loadedImages, setLoadedImages] = useState<Record<string | number, boolean>>({});
    const len = images.length;
    const timeoutRef = useRef<number | null>(null);
    const progressRef = useRef<number | null>(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);

    const goTo = useCallback((newIdx: number) => {
        if (newIdx === idx || isTransitioning || len <= 1) return;
        setIsTransitioning(true);
        setProgress(0);
        setIdx(newIdx);
        setTimeout(() => setIsTransitioning(false), 800);
    }, [idx, isTransitioning, len]);

    const next = useCallback(() => goTo((idx + 1) % len), [goTo, idx, len]);
    const prev = useCallback(() => goTo((idx - 1 + len) % len), [goTo, idx, len]);

    // Auto-play timer
    useEffect(() => {
        if (len <= 1 || isPaused) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(next, 5500);
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [len, next, idx, isPaused]);

    // Progress bar animation
    useEffect(() => {
        if (len <= 1 || isPaused) { setProgress(0); return; }
        setProgress(0);
        const start = Date.now();
        const duration = 5500;
        const tick = () => {
            const elapsed = Date.now() - start;
            const pct = Math.min((elapsed / duration) * 100, 100);
            setProgress(pct);
            if (pct < 100) progressRef.current = window.requestAnimationFrame(tick);
        };
        progressRef.current = window.requestAnimationFrame(tick);
        return () => { if (progressRef.current) cancelAnimationFrame(progressRef.current); };
    }, [idx, len, isPaused]);

    // Touch/swipe handlers
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: React.TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) next();
            else prev();
        }
    };

    if (!len) {
        return (
            <div className="relative w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-slate-100 to-blue-50 border border-slate-200 flex items-center justify-center">
                <div className="text-center px-6">
                    <p className="text-lg font-bold mb-2 text-slate-700">No slider images yet</p>
                    <p className="text-sm text-slate-400 mb-6">Upload images to display here</p>
                    {isAdmin && (
                        <a href="/admin/projects" className="px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl shadow-lg hover:bg-blue-700 transition-colors">
                            Manage Slider Images
                        </a>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden rounded-2xl md:rounded-3xl shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* Progress bar */}
            {len > 1 && (
                <div className="absolute top-0 left-0 right-0 z-30 h-[3px] bg-white/10">
                    <div
                        className="h-full bg-white/70 transition-none"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Slides */}
            {images.map((img, i) => {
                const isActive = i === idx;
                const isLoaded = loadedImages[img.id || i];
                return (
                    <div
                        key={i}
                        className={`absolute inset-0 ${isActive && isLoaded ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}
                        style={{ transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    >
                        <img
                            src={img.url}
                            alt={img.title || img.message || 'slide'}
                            className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                            style={{ transform: 'scale(1)', transition: 'transform 6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            onLoad={() => setLoadedImages(prev => ({ ...prev, [img.id || i]: true }))}
                        />
                        {!isLoaded && (
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                        <div
                            className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12"
                            style={{
                                transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                                opacity: isActive ? 1 : 0,
                                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
                            }}
                        >
                            {img.title && (
                                <p className="text-white/75 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-1.5">
                                    {img.title}
                                </p>
                            )}
                            {img.message && (
                                <h2 className="text-white text-lg sm:text-2xl md:text-4xl font-bold leading-tight drop-shadow-lg max-w-2xl">
                                    {img.message}
                                </h2>
                            )}
                            <div className="mt-4 h-1 w-10 sm:w-16 bg-blue-400 rounded-full" />
                            <a
                                href={shopAnchor}
                                className="mt-5 inline-block px-6 py-3 bg-blue-600 text-white font-semibold text-sm rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
                            >
                                {buttonLabel}
                            </a>
                        </div>

                        {isAdmin && img.id && onDelete && (
                            <button
                                onClick={() => onDelete(img.id!)}
                                className="absolute top-3 right-3 z-20 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-lg transition"
                            >
                                <FaTrash size={10} /> Delete Image
                            </button>
                        )}
                    </div>
                );
            })}

            {/* Arrows */}
                {len > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                            className="absolute left-0 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center justify-center gap-1
                                h-20 md:h-24 w-10 md:w-12
                                bg-white/10 hover:bg-white/20 text-white
                                backdrop-blur-md border-r-0 border border-white/15
                                rounded-r-none rounded-l-none rounded-tr-3xl rounded-br-3xl
                                transition-all duration-300 ease-out
                                opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-0
                                z-40 active:scale-95 cursor-pointer shadow-[4px_0_20px_rgba(0,0,0,0.2)]"
                            aria-label="Previous slide"
                        >
                            <FaArrowLeft className="text-sm md:text-base" />
                            <span className="text-[8px] font-bold tracking-[0.2em] uppercase opacity-70">Prev</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); next(); }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center justify-center gap-1
                                h-20 md:h-24 w-10 md:w-12
                                bg-white/10 hover:bg-white/20 text-white
                                backdrop-blur-md border-l-0 border border-white/15
                                rounded-l-none rounded-r-none rounded-tl-3xl rounded-bl-3xl
                                transition-all duration-300 ease-out
                                opacity-0 group-hover:opacity-100 translate-x-full group-hover:translate-x-0
                                z-40 active:scale-95 cursor-pointer shadow-[-4px_0_20px_rgba(0,0,0,0.2)]"
                            aria-label="Next slide"
                        >
                            <FaArrowRight className="text-sm md:text-base" />
                            <span className="text-[8px] font-bold tracking-[0.2em] uppercase opacity-70">Next</span>
                        </button>

                    {/* Dots + counter */}
                    <div className="absolute bottom-3 sm:bottom-5 right-4 sm:right-8 z-20 flex items-center gap-3">
                        <span className="text-white/50 text-xs font-mono tabular-nums hidden sm:inline">
                            {idx + 1}/{len}
                        </span>
                        <div className="flex gap-1.5">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    className="relative h-2 rounded-full transition-all duration-400 overflow-hidden"
                                    style={{
                                        width: i === idx ? '28px' : '8px',
                                        backgroundColor: i === idx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                                    }}
                                    aria-label={`Go to slide ${i + 1}`}
                                >
                                    {i === idx && (
                                        <div
                                            className="absolute inset-y-0 left-0 bg-white/50 rounded-full"
                                            style={{ width: `${progress}%` }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

/** Hook to load slider images from API */
export const useSliderImages = (section: string, fallback: SliderImg[] = []) => {
    const [sliderImgs, setSliderImgs] = useState<SliderImg[]>([]);
    const [sliderLoading, setSliderLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let mounted = true;
        setSliderLoading(true);

        const admin = localStorage.getItem("csa_is_admin") === "true" ||
            sessionStorage.getItem("csa_is_admin") === "true";
        if (mounted) setIsAdmin(admin);

        apiService.getSacramentalsSliderImages(section)
            .then(data => {
                if (!mounted) return;
                if (Array.isArray(data) && data.length > 0) {
                    setSliderImgs(data.map(d => ({
                        id: d.id,
                        url: d.url || d.image_url,
                        title: d.title,
                        message: d.message,
                    })));
                } else {
                    setSliderImgs(fallback);
                }
            })
            .catch(() => { if (mounted) setSliderImgs(fallback); })
            .finally(() => { if (mounted) setSliderLoading(false); });

        return () => { mounted = false; };
    }, [section]);

    const deleteSlide = async (id: number | string) => {
        await apiService.deleteSacramentalsSliderImage(id);
        setSliderImgs(prev => prev.filter(img => img.id !== id));
    };

    return { sliderImgs, sliderLoading, isAdmin, deleteSlide, setSliderImgs };
};
