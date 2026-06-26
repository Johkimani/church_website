import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaTrash } from 'react-icons/fa';

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
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
    images,
    isAdmin,
    onDelete,
    section = 'sacramentals',
    fallbackImages = [],
    shopAnchor = '#products',
}) => {
    const [idx, setIdx] = useState(0);
    const len = images.length;

    const next = useCallback(() => setIdx(p => (p + 1) % len), [len]);
    const prev = useCallback(() => setIdx(p => (p - 1 + len) % len), [len]);

    useEffect(() => {
        if (len <= 1) return;
        const t = setInterval(next, 5500);
        return () => clearInterval(t);
    }, [len, next]);

    if (!len) {
        return (
            <div className="relative w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl bg-gradient-to-br from-slate-800 to-indigo-900 flex items-center justify-center">
                <div className="text-center text-white px-6">
                    <p className="text-lg font-bold mb-2 opacity-80">No slider images yet</p>
                    <p className="text-sm opacity-60 mb-6">Upload images to display here</p>
                    {isAdmin && (
                        <a
                            href="/admin/projects"
                            className="px-6 py-2.5 bg-white text-indigo-600 font-bold text-sm rounded-xl shadow-lg hover:bg-blue-50 transition-colors"
                        >
                            Manage Slider Images
                        </a>
                    )}
                </div>
            </div>
        );
    }


    return (
        <div className="relative w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl">
            {images.map((img, i) => (
                <div
                    key={i}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <img
                        src={img.url}
                        alt={img.title || img.message || 'slide'}
                        className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />

                    {/* Text */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12">
                        {img.title && (
                            <p className="text-white/70 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-1">
                                {img.title}
                            </p>
                        )}
                        {img.message && (
                            <h2 className="text-white text-lg sm:text-2xl md:text-4xl font-black leading-tight drop-shadow-lg max-w-2xl">
                                {img.message}
                            </h2>
                        )}
                        <div className="mt-4 h-1 w-10 sm:w-16 bg-blue-400 rounded-full" />
                        <a
                            href={shopAnchor}
                            className="mt-4 inline-block px-6 py-3 bg-white text-blue-700 font-bold text-sm rounded-xl shadow-lg hover:bg-blue-50 transition-colors"
                        >
                            Shop Now
                        </a>
                    </div>

                    {/* Admin delete */}
                    {isAdmin && img.id && onDelete && (
                        <button
                            onClick={() => onDelete(img.id!)}
                            className="absolute top-3 right-3 z-20 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-lg transition"
                        >
                            <FaTrash size={10} /> Delete Image
                        </button>
                    )}
                </div>
            ))}

            {/* Nav Arrows */}
            {len > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full shadow-lg transition-all hover:scale-110"
                    >
                        <FaChevronLeft size={16} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full shadow-lg transition-all hover:scale-110"
                    >
                        <FaChevronRight size={16} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-3 sm:bottom-5 right-4 sm:right-8 z-20 flex gap-2">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIdx(i)}
                                className={`h-2.5 rounded-full transition-all duration-300 ${i === idx ? 'w-7 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
                            />
                        ))}
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

        // Check admin status
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
