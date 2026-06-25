import React from 'react';
import { useApp } from '../../../context/AppContext';
import { HireModal } from '../components/HireModal';
import { HeroSlider, useSliderImages } from '../components/HeroSlider';
import { SLIDE_IMAGES, TRUST_BADGES, RENTAL_PROCESS_STEPS } from './data';
import { FaStar, FaCalendarCheck, FaChevronLeft, FaChevronRight, FaTrash, FaCheckCircle, FaChair } from 'react-icons/fa';

interface SliderImg { url: string; message?: string; title?: string; id?: number | string }

const HeroSliderComponent: React.FC<{
    images: SliderImg[];
    isAdmin?: boolean;
    onDelete?: (id: number | string) => void;
}> = ({ images, isAdmin, onDelete }) => {
    const [idx, setIdx] = React.useState(0);
    const len = images.length;
    const next = React.useCallback(() => setIdx(p => (p + 1) % len), [len]);
    const prev = React.useCallback(() => setIdx(p => (p - 1 + len) % len), [len]);

    React.useEffect(() => {
        if (len <= 1) return;
        const t = setInterval(next, 5500);
        return () => clearInterval(t);
    }, [len, next]);

    if (!len) return null;

    return (
        <div className="relative w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl">
            {images.map((img, i) => (
                <div key={i} className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <img src={img.url} alt={img.title || img.message || 'slide'} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12">
                        {img.title && <p className="text-white/70 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-1">{img.title}</p>}
                        {img.message && <h2 className="text-white text-lg sm:text-2xl md:text-4xl font-black leading-tight drop-shadow-lg max-w-2xl">{img.message}</h2>}
                        <div className="mt-4 h-1 w-10 sm:w-16 bg-amber-400 rounded-full" />
                        <a href="#chairs" className="mt-4 inline-block px-6 py-2.5 bg-white text-amber-700 font-bold text-sm rounded-xl shadow-lg hover:bg-amber-50 transition-colors">View Available</a>
                    </div>
                    {isAdmin && img.id && onDelete && (
                        <button onClick={() => onDelete(img.id!)} className="absolute top-3 right-3 z-20 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-lg transition">
                            <FaTrash size={10} /> Delete
                        </button>
                    )}
                </div>
            ))}
            {len > 1 && (
                <>
                    <button onClick={prev} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full p-2 sm:p-3 shadow-lg transition-all hover:scale-110"><FaChevronLeft size={14} /></button>
                    <button onClick={next} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full p-2 sm:p-3 shadow-lg transition-all hover:scale-110"><FaChevronRight size={14} /></button>
                    <div className="absolute bottom-3 sm:bottom-5 right-4 sm:right-8 z-20 flex gap-1.5">
                        {images.map((_, i) => (
                            <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const TrustStrip: React.FC = () => {
    const badges = TRUST_BADGES['chairs'] || [];
    return (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 py-4">
            {badges.map((b, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-amber-100 px-3 sm:px-4 py-2 rounded-xl shadow-sm text-xs sm:text-sm font-semibold text-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    {b.text}
                </div>
            ))}
        </div>
    );
};

const TestimonialsSection: React.FC = () => {
    const testimonials = [
        { id: 1, name: 'John Kamau', role: 'Event Organizer', text: 'Rented 200 chairs for a wedding reception. They were clean, sturdy, and exactly what we needed. The booking process was smooth!', rating: 5 },
        { id: 2, name: 'Mary Wambui', role: 'Parish Coordinator', text: 'We use these chairs for every church gathering. Great quality and very reasonable pricing. Highly recommend!', rating: 5 },
        { id: 3, name: 'Peter Njoroge', role: 'Community Leader', text: 'Excellent service. The chairs arrived on time and in perfect condition. Will definitely rent again.', rating: 4 },
    ];
    return (
        <div className="py-10 sm:py-14 px-4">
            <div className="max-w-5xl mx-auto text-center mb-8 sm:mb-10">
                <span className="inline-block text-[10px] sm:text-xs font-black text-amber-600 bg-amber-100 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">What Our Customers Say</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Trusted by Event Organizers</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-3 max-w-5xl mx-auto">
                {testimonials.map(t => (
                    <div key={t.id} className="bg-white rounded-2xl p-5 sm:p-6 shadow hover:shadow-lg transition-all duration-300 border border-amber-50 hover:-translate-y-1 text-center">
                        <div className="flex justify-center gap-0.5 mb-3">
                            {Array.from({ length: t.rating }).map((_, i) => <FaStar key={i} size={12} className="text-amber-400" />)}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 italic">"{t.text}"</p>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                            <p className="text-xs text-slate-400">{t.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProcessGuide: React.FC = () => (
    <div className="py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10">
            <span className="inline-block text-[10px] sm:text-xs font-black text-amber-600 bg-amber-100 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">Simple Process</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">How to Rent</h2>
            <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">Getting chairs for your event is quick and easy.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
            {RENTAL_PROCESS_STEPS.map((step, i) => (
                <div key={step.step} className="relative bg-white rounded-2xl p-5 sm:p-6 text-center shadow hover:shadow-lg transition-all duration-300 border border-amber-50 hover:-translate-y-1 group">
                    {i < RENTAL_PROCESS_STEPS.length - 1 && <div className="hidden sm:block absolute top-10 -right-3 w-6 h-0.5 bg-amber-200 z-10" />}
                    <div className="flex items-center justify-center mb-4 mx-auto w-fit relative">
                        <div className="w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl text-2xl font-bold text-amber-600 group-hover:scale-110 transition-transform duration-300 shadow-inner">{step.step}</div>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800 mb-1">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
            ))}
        </div>
    </div>
);

export const Chairs = () => {
    const { products, isLoading } = useApp();
    const [hireItem, setHireItem] = React.useState<{ id: number; name: string; category?: string; price?: number } | null>(null);
    const { sliderImgs, sliderLoading, isAdmin, deleteSlide } = useSliderImages('chairs');

    const product = React.useMemo(() => {
        return products.find(p => p.category?.toLowerCase() === 'chairs');
    }, [products]);

    const image = product?.image_url || product?.img;
    const stock = product?.stock != null ? Number(product.stock) : 0;
    const price = product?.price || 10;
    const name = product?.name || 'Event Chairs';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-amber-50/20 to-white">

            {hireItem && <HireModal item={hireItem} onClose={() => setHireItem(null)} />}

            {/* Hero Slider */}
            <div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                {sliderLoading ? (
                    <div className="w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] rounded-2xl md:rounded-3xl bg-slate-200 animate-pulse" />
                ) : (
                    <HeroSliderComponent images={sliderImgs} isAdmin={isAdmin} onDelete={deleteSlide} />
                )}
            </div>

            {/* Page Header */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-2 text-center">
                <span className="inline-block px-3 sm:px-5 py-1.5 text-[10px] sm:text-xs font-black text-amber-700 bg-amber-100 rounded-full uppercase tracking-widest mb-3">Event Rentals</span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-800 leading-tight">
                    Premium{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">Event Chairs</span>
                </h1>
                <p className="mt-2 sm:mt-3 text-slate-500 max-w-lg mx-auto text-xs sm:text-sm">
                    Durable, clean plastic chairs for weddings, celebrations, and community gatherings — pickup at KYU campus.
                </p>
            </div>

            {/* Trust Strip */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
                <TrustStrip />
            </div>

            {/* ── SHOWCASE SECTION ── */}
            <section id="chairs" className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pb-10 sm:pb-16">

                {/* Main showcase card */}
                <div className="bg-white rounded-3xl shadow-xl border border-amber-50 overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">

                        {/* Left: Product Image */}
                        <div className="relative bg-gradient-to-br from-amber-50 to-slate-100 aspect-square md:aspect-auto md:min-h-[480px] flex items-center justify-center overflow-hidden">
                            {image ? (
                                <img src={image} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-48 h-48 bg-amber-100 rounded-full flex items-center justify-center">
                                    <FaChair size={64} className="text-amber-300" />
                                </div>
                            )}
                            {stock > 0 && (
                                <span className="absolute top-4 left-4 px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                                    {stock} Available
                                </span>
                            )}
                        </div>

                        {/* Right: Details */}
                        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                            <div className="space-y-5">
                                <div>
                                    <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-widest">Hire Service</span>
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-3">{name}</h2>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {[1,2,3,4,5].map(s => <FaStar key={s} size={14} className="text-amber-400" />)}
                                    </div>
                                    <span className="text-sm text-slate-400 font-medium">(64 reviews)</span>
                                </div>

                                <p className="text-slate-500 text-sm leading-relaxed">
                                    High-quality, durable plastic chairs perfect for any event. Clean, sturdy, and available in bulk. Whether it's a wedding, church gathering, or community celebration — we have you covered.
                                </p>

                                {/* Features */}
                                <div className="grid grid-cols-2 gap-2">
                                    {['Spotlessly Cleaned', 'Stackable Design', 'Weather Resistant', 'Bulk Available'].map((feat, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                            <FaCheckCircle size={10} className="text-amber-500 shrink-0" />
                                            {feat}
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing Box */}
                                <div className="bg-amber-50 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold">Rental rate</p>
                                            <p className="text-3xl font-black text-slate-900">
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

                                {/* CTA */}
                                <button
                                    onClick={() => setHireItem({ id: product?.id || 0, name, category: 'chairs', price: Number(price) })}
                                    className="w-full py-4 rounded-2xl font-black text-base bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <FaCalendarCheck size={16} /> Request Booking
                                </button>

                                <p className="text-[10px] text-slate-400 text-center">You'll be redirected to WhatsApp to confirm your booking</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <TestimonialsSection />

            {/* Process Guide */}
            <ProcessGuide />

            {/* Faith Footer */}
            <div className="text-center py-10 text-sm text-amber-700 italic px-4">
                "Let all things be done decently and in order." — 1 Corinthians 14:40
            </div>
        </div>
    );
};
