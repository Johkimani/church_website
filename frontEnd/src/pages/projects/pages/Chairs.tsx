import React from 'react';
import { useApp } from '../../../context/AppContext';
import { motion } from 'framer-motion';
import { HireModal } from '../components/HireModal';
import { HeroSlider, useSliderImages } from '../components/HeroSlider';

import { FaCheckCircle, FaChair } from 'react-icons/fa';
import TestimonialsSection from '../components/TestimonialsSection';
import ProjectHero from '../components/ProjectHero';
import ProjectPageHeader from '../components/ProjectPageHeader';

const CHAIR_PRICE = 10;

export const Chairs = () => {
    const { products, addToHire, isHireModalOpen, setHireModalOpen } = useApp();
    const [chairQty, setChairQty] = React.useState(1);
    const { sliderImgs, sliderLoading, isAdmin, deleteSlide } = useSliderImages('chairs');

    const product = React.useMemo(() => {
        return products.find(p => p.category?.toLowerCase() === 'chairs');
    }, [products]);

    const image = product?.image_url || product?.img;
    const stock = product?.stock != null ? Number(product.stock) : 0;
    const price = Number(product?.price) || CHAIR_PRICE;
    const name = product?.name || 'Event Chairs';

    const handleHire = () => {
        if (chairQty < 1) return;
        addToHire({ id: product?.id || 0, name, category: 'chairs', price, quantity: chairQty });
        setHireModalOpen(true);
    };

    return (
        <div className="w-full bg-slate-50 min-h-screen pb-20 text-slate-800 font-sans">

            {isHireModalOpen && <HireModal onClose={() => setHireModalOpen(false)} showEventDate={false} />}

            {/* ══════════ HERO ══════════ */}
            <ProjectHero>
                <div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                    {sliderLoading ? (
                        <div className="w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] rounded-2xl md:rounded-3xl bg-slate-200 animate-pulse" />
                    ) : (
                        <HeroSlider
                            images={sliderImgs}
                            isAdmin={isAdmin}
                            onDelete={deleteSlide}
                            shopAnchor="#chairs"
                            buttonLabel="View Available"
                        />
                    )}
                </div>

                <ProjectPageHeader
                    badge="Event Rentals"
                    title="Premium Event Chairs"
                    subtitle="Durable, clean plastic chairs for weddings, celebrations, and community gatherings — pickup at KYU campus."
                />
            </ProjectHero>

            {/* ══════════ SHOWCASE SECTION ══════════ */}
            <motion.section
                id="chairs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 -mt-6 relative z-20 pb-10 sm:pb-16"
            >
                {/* Main showcase card */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">

                        {/* Left: Product Image */}
                        <div className="relative bg-gradient-to-br from-blue-50 to-slate-100 aspect-square md:aspect-auto md:min-h-[480px] flex items-center justify-center overflow-hidden">
                            {image ? (
                                <img src={image} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-48 h-48 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FaChair size={64} className="text-blue-300" />
                                </div>
                            )}
                            {stock > 0 && (
                                <span className="absolute top-4 left-4 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg">
                                    {stock} Available
                                </span>
                            )}
                        </div>

                        {/* Right: Details */}
                        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                            <div className="space-y-5">
                                <div>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-widest">Hire Service</span>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-3">{name}</h2>
                                </div>

                                <p className="text-slate-500 text-sm leading-relaxed">
                                    High-quality, durable plastic chairs perfect for any event. Clean, sturdy, and available in bulk. Whether it's a wedding, church gathering, or community celebration — we have you covered.
                                </p>

                                {/* Features */}
                                <div className="grid grid-cols-2 gap-2">
                                    {['Spotlessly Cleaned', 'Stackable Design', 'Weather Resistant', 'Bulk Available'].map((feat, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                            <FaCheckCircle size={12} className="text-blue-500 shrink-0" />
                                            {feat}
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing Box */}
                                <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold">Rental rate</p>
                                            <p className="text-3xl font-bold text-slate-900">
                                                KES {Number(price).toLocaleString()}
                                                <span className="text-sm font-bold text-slate-400"> /chair/day</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold">
                                        <span>{stock > 0 ? `${stock} chairs in stock` : 'Checking availability...'}</span>
                                        <span>Pickup only</span>
                                    </div>
                                </div>

                                {/* Quantity + Hire Button */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Number of chairs needed
                                    </label>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex-1">
                                            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                                                <button
                                                    type="button"
                                                    onClick={() => setChairQty(q => Math.max(1, q - 10))}
                                                    className="w-11 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-lg transition-colors"
                                                >-</button>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={chairQty}
                                                    onChange={e => setChairQty(Math.max(1, parseInt(e.target.value) || 1))}
                                                    placeholder="e.g. 50"
                                                    className="flex-1 h-12 text-center text-base font-bold text-slate-800 border-x border-slate-200 outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setChairQty(q => Math.min(999, q + 10))}
                                                    className="w-11 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-lg transition-colors"
                                                >+</button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleHire}
                                            className="h-12 px-8 rounded-xl font-bold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                                        >
                                            Hire
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 text-center">Pickup at KYU campus. No delivery.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Testimonials */}
            <TestimonialsSection variant="blue" />

            {/* Faith Footer */}
            <div className="text-center py-10 text-sm text-amber-700 italic px-4">
                "Let all things be done decently and in order." — 1 Corinthians 14:40
            </div>

        </div>
    );
};
