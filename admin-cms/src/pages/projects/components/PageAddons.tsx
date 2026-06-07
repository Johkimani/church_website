import React from 'react';
import { SECTION_BANNERS, TRUST_BADGES, RENTAL_PROCESS_STEPS } from '../pages/data';
import {
    IconTshirt, IconChair, IconMusic, IconSearch,
    IconMessage, IconMapPin, IconShield, IconStar, IconOther
} from './Icons';

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'tshirts': return <IconTshirt />;
        case 'chairs': return <IconChair />;
        case 'instruments': return <IconMusic />;
        case 'other': return <IconOther />;
        default: return null;
    }
};

const getGeneralIcon = (iconName: string) => {
    switch (iconName) {
        case '🔍': return <IconSearch />;
        case '💬': return <IconMessage />;
        case '📍': return <IconMapPin />;
        case '🛡️': return <IconShield />;
        case '✨': return <IconStar />;
        case '🧵': return <IconTshirt />;
        case '🪑': return <IconChair />;
        case '🎵': return <IconMusic />;
        default: return <span>{iconName}</span>;
    }
};

/* ================= HERO ================= */
export const CategoryHero: React.FC<{ category: 'sacramentals' | 'tshirts' | 'chairs' | 'instruments' | 'other' }> = ({ category }) => {
    const banner = SECTION_BANNERS[category];
    if (!banner) return null;

    return (
        <div className="relative w-full h-[250px] md:h-[320px] rounded-3xl overflow-hidden shadow-lg">

            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center scale-105"
                style={{ backgroundImage: `url(${banner.img})` }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/50 to-blue-600/40" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 text-white">
                <div className="mb-3 text-3xl md:text-4xl">
                    {getCategoryIcon(category)}
                </div>

                <h1 className="text-2xl md:text-4xl font-bold">
                    {banner.title}
                </h1>

                <p className="mt-2 text-sm md:text-base max-w-xl text-blue-100">
                    {banner.subtitle}
                </p>
            </div>
        </div>
    );
};

/* ================= TRUST BAR ================= */
export const TrustBar: React.FC<{ category: 'sacramentals' | 'tshirts' | 'chairs' | 'instruments' | 'other' }> = ({ category }) => {
    const badges = TRUST_BADGES[category];
    if (!badges) return null;

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">

            {badges.map((badge, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 bg-white/70 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition"
                >
                    <div className="text-blue-600 text-lg">
                        {getGeneralIcon(badge.icon)}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                        {badge.text}
                    </span>
                </div>
            ))}

        </div>
    );
};

/* ================= PROCESS GUIDE ================= */
export const ProcessGuide: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto mt-10">

            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6 md:p-10 border border-blue-100">

                {/* Header */}
                <div className="text-center mb-10">
                    <span className="inline-block px-4 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-3">
                        Easy Process
                    </span>

                    <h2 className="text-2xl md:text-3xl font-bold text-blue-800">
                        How it Works
                    </h2>
                </div>

                {/* Steps */}
                <div className="grid gap-6 md:grid-cols-3">
                    {RENTAL_PROCESS_STEPS.map((step) => (
                        <div
                            key={step.step}
                            className="text-center p-4 rounded-2xl hover:shadow-lg transition"
                        >
                            <div className="flex items-center justify-center mb-4">

                                <div className="relative">
                                    <div className="w-14 h-14 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xl">
                                        {getGeneralIcon(step.icon)}
                                    </div>

                                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
                                        {step.step}
                                    </div>
                                </div>

                            </div>

                            <h3 className="font-semibold text-blue-800">
                                {step.title}
                            </h3>

                            <p className="text-sm text-gray-600 mt-2">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

/* ================= IMAGE SLIDER ================= */
export interface SliderImage {
    url: string;
    message?: string;
}

export const ImageSlider: React.FC<{ images: (string | SliderImage)[] }> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [images.length]);

    if (!images || images.length === 0) return null;

    return (
        <div className="relative w-full h-[220px] md:h-[320px] rounded-3xl overflow-hidden shadow-lg">

            {images.map((img, i) => {
                const url = typeof img === 'string' ? img : img.url;
                const message = typeof img === 'string' ? '' : img.message;

                return (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            i === currentIndex ? 'opacity-100 z-10' : 'opacity-0'
                        }`}
                    >
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${url})` }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-transparent to-transparent" />

                        {message && (
                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                <p className="text-lg md:text-xl font-semibold">
                                    {message}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-3 h-3 rounded-full transition ${
                            i === currentIndex
                                ? 'bg-white'
                                : 'bg-white/50 hover:bg-white'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};