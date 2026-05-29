

import React from 'react';
import { SECTION_BANNERS, TRUST_BADGES, RENTAL_PROCESS_STEPS ,SLIDE_IMAGES } from '../pages/data';
import { FaChair, FaMapPin, FaMusic, FaOtter, FaSearch, FaStar, FaTshirt } from 'react-icons/fa';
import { FaMessage, FaShield } from 'react-icons/fa6';


/* ---------------- ICON HELPERS ---------------- */

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'tshirts': return <FaTshirt />;
        case 'chairs': return <FaChair />;
        case 'instruments': return <FaMusic />;
        case 'other': return <FaOtter />;
        default: return null;
    }
};

const getGeneralIcon = (iconName: string) => {
    switch (iconName) {
        case '🔍': return <FaSearch />;
        case '💬': return <FaMessage />;
        case '📍': return <FaMapPin />;
        case '🛡️': return <FaShield />;
        case '✨': return <FaStar />;
        case '🧵': return <FaTshirt />;
        case '🪑': return <FaChair />;
        case '🎵': return <FaMusic />;
        default: return <span>{iconName}</span>;
    }
};

/* ---------------- CATEGORY HERO ---------------- */

export const CategoryHero: React.FC<{
    category: 'sacramentals' | 'tshirts' | 'chairs' | 'instruments' | 'other'
}> = ({ category }) => {
    const banner = SECTION_BANNERS[category];
    if (!banner) return null;

    return (
        <div
            className="category-hero"
            style={{ backgroundImage: `url(${banner.img})` }}
        >
            <div className="category-hero-overlay"></div>
            <div className="category-hero-content">
                <div className="hero-svg-icon">{getCategoryIcon(category)}</div>
                <h1>{banner.title}</h1>
                <p>{banner.subtitle}</p>
            </div>
        </div>
    );
};

/* ---------------- TRUST BAR ---------------- */
export const TrustBar: React.FC<{
    category: 'sacramentals' | 'tshirts' | 'chairs' | 'instruments' | 'other'
}> = ({ category }) => {
    const badges = TRUST_BADGES[category];
    if (!badges) return null;

    return (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl shadow-sm py-4 px-3 flex flex-wrap justify-center gap-4 sm:gap-6">

            {badges.map((badge, i) => (
                <div
                    key={i}
                    className="flex items-center gap-2 sm:gap-3 bg-white px-3 py-2 rounded-xl shadow-sm hover:shadow-md transition"
                >
                    {/* ICON */}
                    <span className="text-blue-600 text-lg sm:text-xl">
                        {getGeneralIcon(badge.icon)}
                    </span>

                    {/* TEXT */}
                    <span className="text-sm sm:text-base text-gray-700 font-medium">
                        {badge.text}
                    </span>
                </div>
            ))}

        </div>
    );
};
/* ---------------- PROCESS GUIDE ---------------- */

export const ProcessGuide: React.FC = () => {
    return (
        <div className="w-full py-10 px-4 sm:px-6 lg:px-10 bg-gray-50">

            <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-md p-6 sm:p-8 lg:p-10">

                {/* HEADER */}
                <div className="text-center mb-10">
                    <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full mb-3">
                        Easy Process
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        How it Works
                    </h2>
                </div>

                {/* STEPS */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

                    {RENTAL_PROCESS_STEPS.map((step) => (
                        <div
                            key={step.step}
                            className="relative bg-gray-50 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition"
                        >

                            {/* ICON + NUMBER */}
                            <div className="flex items-center justify-center mb-4 relative">

                                <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xl">
                                    {getGeneralIcon(step.icon)}
                                </div>

                                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow">
                                    {step.step}
                                </div>
                            </div>

                            {/* TITLE */}
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {step.title}
                            </h3>

                            {/* DESCRIPTION */}
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {step.desc}
                            </p>

                        </div>
                    ))}

                </div>

            </div>
        </div>
    );
};
/* ---------------- IMAGE SLIDER ---------------- */

export interface SliderImage {
    url: string;
    message?: string;
}

export const ImageSlider: React.FC<{
    images: (string | SliderImage)[];
}> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const length = images?.length || 0;

    const nextSlide = React.useCallback(() => {
        if (length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % length);
    }, [length]);

    const prevSlide = React.useCallback(() => {
        if (length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + length) % length);
    }, [length]);

    /* AUTO SLIDE (FIXED) */
    React.useEffect(() => {
        if (length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % length);
        }, 5000);

        return () => clearInterval(timer);
    }, [length]);

    if (!images || length === 0) return null;

    return (
        <div className="relative w-full h-[220px] sm:h-[260px] md:h-[320px] lg:h-[380px] rounded-3xl overflow-hidden shadow-lg">

            {/* SLIDES */}
            {images.map((img, i) => {
                const url = typeof img === 'string' ? img : img.url;
                const message = typeof img === 'string' ? '' : img.message;

                return (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                            i === currentIndex
                                ? 'opacity-100 scale-100 z-10'
                                : 'opacity-0 scale-105'
                        }`}
                    >
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${url})` }}
                        />

                        {/* OVERLAY */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-transparent to-transparent" />

                        {/* MESSAGE */}
                        {message && (
                            <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-6 text-white">
                                <p className="text-base sm:text-lg md:text-xl font-semibold">
                                    {message}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* LEFT BUTTON */}
            <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-blue-700 rounded-full p-2 shadow-md transition"
            >
                ◀
            </button>

            {/* RIGHT BUTTON */}
            <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-blue-700 rounded-full p-2 shadow-md transition"
            >
                ▶
            </button>

            {/* DOTS */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                            i === currentIndex
                                ? 'w-6 bg-white'
                                : 'w-2.5 bg-white/50 hover:bg-white'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};        






export const Sacramentals = () => {

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 px-4 py-6">

            <ImageSlider images={SLIDE_IMAGES} />
            <TrustBar category="sacramentals" />
            <ProcessGuide />
        </div>

    );
} 