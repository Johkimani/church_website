import React from 'react';
import { useApp } from '../../../context/AppContext';
import { motion } from 'framer-motion';
import { HireModal } from '../components/HireModal';
import { HeroSlider, useSliderImages } from '../components/HeroSlider';

import { Music } from 'lucide-react';
import TestimonialsSection from '../components/TestimonialsSection';
import ProjectHero from '../components/ProjectHero';
import ProjectPageHeader from '../components/ProjectPageHeader';

const InstrumentCard: React.FC<{
    instrument: any;
    onHire: (item: { id: number; name: string; category: string; price: number; quantity: number }) => void;
}> = ({ instrument, onHire }) => {
    const [qty, setQty] = React.useState(1);
    const image = instrument.image_url || instrument.img;
    const stock = instrument.stock != null ? Number(instrument.stock) : null;
    const inStock = stock == null || stock > 0;
    const price = Number(instrument.price) || 0;

    const handleHire = () => {
        if (!inStock || qty < 1) return;
        onHire({ id: instrument.id, name: instrument.name, category: 'instruments', price, quantity: qty });
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            {/* Image */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden">
                {image ? (
                    <img src={image} alt={instrument.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                            <Music size={32} className="text-blue-300" />
                        </div>
                    </div>
                )}
                {stock != null && (
                    <span className={`absolute top-3 left-3 px-3 py-1.5 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg ${
                        stock > 5 ? 'bg-emerald-500' : stock > 0 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}>
                        {stock > 0 ? `${stock} Available` : 'Unavailable'}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{instrument.name}</h3>

                <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
                    {instrument.description || instrument.desc || 'Professional-grade equipment for your worship events.'}
                </p>

                {/* Features */}
                {(instrument.features || instrument.feature_list) && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {(instrument.features || instrument.feature_list || []).slice(0, 4).map((feat: string, i: number) => (
                            <span key={i} className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                                {feat}
                            </span>
                        ))}
                    </div>
                )}

                {/* Price */}
                <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Daily rate</p>
                            <p className="text-2xl font-bold text-slate-900">
                                KES {price.toLocaleString()}
                                <span className="text-xs font-bold text-slate-400"> /day</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 font-semibold">Hourly rate</p>
                            <p className="text-lg font-bold text-blue-600">
                                KES {Math.round(price / 8).toLocaleString()}
                                <span className="text-xs font-bold text-slate-400"> /hr</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quantity + Hire */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setQty(q => Math.max(1, q - 1))}
                            className="w-9 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-colors"
                        >-</button>
                        <input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-12 h-10 text-center text-sm font-bold border-x border-slate-200 focus:outline-none"
                        />
                        <button
                            onClick={() => setQty(q => Math.min(stock || 999, q + 1))}
                            className="w-9 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-colors"
                        >+</button>
                    </div>
                    <button
                        onClick={handleHire}
                        disabled={!inStock}
                        className={`flex-1 h-10 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                            inStock
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl active:scale-95'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        Hire
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Instruments = () => {
    const { products, addToHire, isHireModalOpen, setHireModalOpen } = useApp();
    const { sliderImgs, sliderLoading, isAdmin, deleteSlide } = useSliderImages('instruments');

    const instruments = React.useMemo(() => {
        return products.filter(p => p.category?.toLowerCase() === 'instruments');
    }, [products]);

    return (
        <div className="w-full bg-slate-50 min-h-screen pb-20 text-slate-800 font-sans">

            {isHireModalOpen && <HireModal onClose={() => setHireModalOpen(false)} />}

            <ProjectHero>
                <div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                    {sliderLoading ? (
                        <div className="w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] rounded-2xl md:rounded-3xl bg-slate-200 animate-pulse" />
                    ) : (
                        <HeroSlider
                            images={sliderImgs}
                            isAdmin={isAdmin}
                            onDelete={deleteSlide}
                            shopAnchor="#instruments"
                            buttonLabel="View Available"
                        />
                    )}
                </div>

                <ProjectPageHeader
                    badge="Worship Equipment"
                    title="Musical Instruments"
                    subtitle="Professional-grade organs, pianos, speakers and microphones — elevate your worship experience. Daily and hourly rental available."
                />
            </ProjectHero>

            <motion.section
                id="instruments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 -mt-6 relative z-20 pb-10 sm:pb-16"
            >
                {instruments.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {instruments.map(inst => (
                            <InstrumentCard
                                key={inst.id || inst.name}
                                instrument={inst}
                                onHire={(item) => {
                                    addToHire(item);
                                    setHireModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-3xl shadow-xl border border-slate-100">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Music size={32} className="text-blue-300" />
                        </div>
                        <p className="text-slate-700 font-bold text-lg mb-1">Instruments Coming Soon</p>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">We're expanding our collection. Check back soon for professional worship equipment available for hire.</p>
                    </div>
                )}
            </motion.section>

            {/* Pricing Summary */}
            {instruments.length > 0 && (
                <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pb-10">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 sm:p-8 text-white">
                        <h3 className="text-xl font-bold mb-4">Rental Pricing</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {instruments.map(inst => (
                                <div key={inst.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                    <p className="font-bold text-sm">{inst.name}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <div>
                                            <p className="text-2xl font-bold">KES {Number(inst.price).toLocaleString()}<span className="text-sm font-bold text-white/60"> /day</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold">KES {Math.round(Number(inst.price) / 8).toLocaleString()}<span className="text-sm font-bold text-white/60"> /hr</span></p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Testimonials */}
            <TestimonialsSection />

            {/* Faith Footer */}
            <div className="text-center py-10 text-sm text-blue-700 italic px-4">
                "Praise Him with sounding cymbals; praise Him with loud clashing cymbals!" — Psalm 150:5
            </div>

        </div>
    );
};
