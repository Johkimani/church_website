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

const ChairCard: React.FC<{
    chair: any;
    onHire: (item: { id: number; name: string; category: string; price: number; quantity: number }) => void;
}> = ({ chair, onHire }) => {
    const [qty, setQty] = React.useState(1);
    const image = chair.image_url || chair.img;
    const stock = chair.stock != null ? Number(chair.stock) : 0;
    const price = Number(chair.price) || CHAIR_PRICE;
    const name = chair.name || 'Event Chairs';
    const inStock = stock > 0;

    const handleHire = () => {
        if (qty < 1 || !inStock) return;
        onHire({ id: chair.id, name, category: 'chairs', price, quantity: qty });
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden">
                {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaChair size={40} className="text-blue-300" />
                        </div>
                    </div>
                )}
                {stock > 0 && (
                    <span className="absolute top-3 left-3 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg">
                        {stock} Available
                    </span>
                )}
                {!inStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-rose-600 font-bold text-sm bg-white px-4 py-2 rounded-full shadow-lg border border-rose-100">Unavailable</span>
                    </div>
                )}
            </div>

            <div className="p-5 sm:p-6 flex flex-col flex-1">
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-widest w-fit mb-3">Hire Service</span>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{name}</h3>

                <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
                    {chair.description || chair.desc || 'High-quality, durable plastic chairs perfect for any event. Clean, sturdy, and available in bulk.'}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    {['Spotlessly Cleaned', 'Stackable Design', 'Weather Resistant', 'Bulk Available'].map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <FaCheckCircle size={12} className="text-blue-500 shrink-0" />
                            {feat}
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 font-semibold">Daily rate</p>
                            <p className="text-2xl font-bold text-slate-900">
                                KES {price.toLocaleString()}
                                <span className="text-xs font-bold text-slate-400"> /chair/day</span>
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

                <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setQty(q => Math.max(1, q - 10))}
                            className="w-9 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-colors"
                        >-</button>
                        <input
                            type="number"
                            min={1}
                            value={qty}
                            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-14 h-10 text-center text-sm font-bold border-x border-slate-200 focus:outline-none"
                        />
                        <button
                            onClick={() => setQty(q => Math.min(stock || 999, q + 10))}
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

export const Chairs = () => {
    const { products, addToHire, isHireModalOpen, setHireModalOpen } = useApp();
    const { sliderImgs, sliderLoading, isAdmin, deleteSlide } = useSliderImages('chairs');

    const chairs = React.useMemo(() => {
        return products.filter(p => p.category?.toLowerCase() === 'chairs');
    }, [products]);

    return (
        <div className="w-full bg-slate-50 min-h-screen pb-20 text-slate-800 font-sans">

            {isHireModalOpen && <HireModal onClose={() => setHireModalOpen(false)} showEventDate={false} />}

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

            <motion.section
                id="chairs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 -mt-6 relative z-20 pb-10 sm:pb-16"
            >
                {chairs.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {chairs.map(chair => (
                            <ChairCard
                                key={chair.id || chair.name}
                                chair={chair}
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
                            <FaChair size={40} className="text-blue-300" />
                        </div>
                        <p className="text-slate-700 font-bold text-lg mb-1">Chairs Coming Soon</p>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">We're preparing our chair inventory. Check back soon for event seating rentals.</p>
                    </div>
                )}
            </motion.section>

            {chairs.length > 0 && (
                <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pb-10">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 sm:p-8 text-white">
                        <h3 className="text-xl font-bold mb-4">Rental Pricing</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {chairs.map(chair => (
                                <div key={chair.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                    <p className="font-bold text-sm">{chair.name}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <div>
                                            <p className="text-2xl font-bold">KES {Number(chair.price || CHAIR_PRICE).toLocaleString()}<span className="text-sm font-bold text-white/60"> /day</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold">KES {Math.round(Number(chair.price || CHAIR_PRICE) / 8).toLocaleString()}<span className="text-sm font-bold text-white/60"> /hr</span></p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <TestimonialsSection variant="blue" />

            <div className="text-center py-10 text-sm text-amber-700 italic px-4">
                "Let all things be done decently and in order." — 1 Corinthians 14:40
            </div>

        </div>
    );
};
