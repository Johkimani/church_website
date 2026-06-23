import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
    TRUST_BADGES, RENTAL_PROCESS_STEPS,
    SLIDE_IMAGES, SACRAMENTAL_CATEGORIES, SACRAMENTALS_PRODUCTS
} from '../pages/data';
import type { SacramentalCategory } from '../pages/data';
import {
    FaSearch, FaStar, FaShoppingCart, FaFilter,
    FaChevronLeft, FaChevronRight, FaTrash, FaShieldAlt,
    FaGlobeAfrica, FaBoxOpen, FaCheckCircle
} from 'react-icons/fa';
import apiService from '../../Landing/services/api';

/* ───────────────────────────────────────────────
   SACRAMENTAL SUBCATEGORIES that exist in the DB
   These are the `category` column values stored
   for products that belong to the sacramentals
   section. The admin can also set category =
   "sacramentals" so we accept both.
─────────────────────────────────────────────── */
const SACRAMENTAL_SUBCATS = new Set([
    'rosaries', 'bibles', 'chains', 'crucifixes', 'statues', 'candles', 'sacramentals'
]);

/* ───────────────────────────────────────────────
   HERO SLIDER
─────────────────────────────────────────────── */
interface SliderImg { url: string; message?: string; title?: string; id?: number | string }

const HeroSlider: React.FC<{
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
                            href="#sacramentals"
                            className="mt-4 inline-block px-6 py-2.5 bg-white text-blue-700 font-bold text-sm rounded-xl shadow-lg hover:bg-blue-50 transition-colors"
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
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full p-2 sm:p-3 shadow-lg transition-all hover:scale-110"
                    >
                        <FaChevronLeft size={14} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full p-2 sm:p-3 shadow-lg transition-all hover:scale-110"
                    >
                        <FaChevronRight size={14} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-3 sm:bottom-5 right-4 sm:right-8 z-20 flex gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIdx(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/* ───────────────────────────────────────────────
   TRUST STRIP
─────────────────────────────────────────────── */
const TRUST_ICONS: Record<string, React.ReactNode> = {
    '✨': <FaStar className="text-amber-400" />,
    '🛡️': <FaShieldAlt className="text-blue-500" />,
    '🌍': <FaGlobeAfrica className="text-emerald-500" />,
    '📦': <FaBoxOpen className="text-indigo-400" />,
};

const TrustStrip: React.FC = () => {
    const badges = TRUST_BADGES['sacramentals'] || [];
    return (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 py-4">
            {badges.map((b, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-blue-100 px-3 sm:px-4 py-2 rounded-xl shadow-sm text-xs sm:text-sm font-semibold text-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <span className="text-base">{TRUST_ICONS[b.icon] || b.icon}</span>
                    {b.text}
                </div>
            ))}
        </div>
    );
};

/* ───────────────────────────────────────────────
   CATEGORY FILTER BAR
─────────────────────────────────────────────── */
const CategoryFilterBar: React.FC<{
    selected: SacramentalCategory;
    onChange: (c: SacramentalCategory) => void;
    counts: Record<string, number>;
}> = ({ selected, onChange, counts }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SACRAMENTAL_CATEGORIES.map(cat => {
                const count = cat.id === 'all' ? total : (counts[cat.id] || 0);
                const active = selected === cat.id;
                return (
                    <button
                        key={cat.id}
                        id={`filter-cat-${cat.id}`}
                        onClick={() => onChange(cat.id)}
                        className={`
                            flex items-center gap-1.5 whitespace-nowrap px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex-shrink-0
                            ${active
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                            }
                        `}
                    >
                        <span>{cat.icon}</span>
                        <span className="hidden sm:inline">{cat.label}</span>
                        <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

/* ───────────────────────────────────────────────
   PREMIUM PRODUCT CARD
─────────────────────────────────────────────── */
interface Product {
    id?: any;
    name: string;
    price: number | string;
    description?: string;
    desc?: string;
    image_url?: string;
    img?: string;
    category?: string;
    subcategory?: string;
    stock?: number;
}

const ProductCard: React.FC<{ product: Product; onAdd: () => void }> = ({ product, onAdd }) => {
    const navigate = useNavigate();
    const [adding, setAdding] = React.useState(false);
    const image = product.image_url || product.img;
    const desc = product.description || product.desc || '';
    const inStock = product.stock == null || Number(product.stock) > 0;

    const handleAdd = () => {
        if (!inStock) return;
        setAdding(true);
        onAdd();
        setTimeout(() => setAdding(false), 1300);
    };

    return (
        <div className="group bg-white rounded-2xl border border-slate-100 shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer"
            onClick={() => { if (product.id) navigate(`/product/${product.id}`); }}
        >
            {/* Image */}
            <div className="relative h-40 sm:h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden flex-shrink-0">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl sm:text-6xl select-none">✝️</div>
                )}
                {/* Subcategory badge */}
                {product.subcategory && product.subcategory !== 'sacramentals' && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-blue-700 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                        {product.subcategory}
                    </span>
                )}
                {/* Out of stock */}
                {!inStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-rose-600 font-black text-xs sm:text-sm bg-white px-3 py-1 rounded-full shadow-md border border-rose-100">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-3 sm:p-4 gap-1.5">
                <h3 className="font-black text-slate-800 text-sm leading-tight line-clamp-2">
                    {product.name}
                </h3>
                {desc && (
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {desc}
                    </p>
                )}

                {/* Stars */}
                <div className="flex gap-0.5 mt-1">
                    {[1,2,3,4,5].map(s => <FaStar key={s} size={9} className="text-amber-400" />)}
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-base sm:text-lg font-black text-blue-700">
                        KES {Number(product.price).toLocaleString()}
                    </span>
                    {product.stock != null && Number(product.stock) > 0 && Number(product.stock) <= 5 && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                            Only {product.stock} left!
                        </span>
                    )}
                </div>

                <button
                    id={`add-cart-${product.id || product.name}`}
                    onClick={(e) => { e.stopPropagation(); handleAdd(); }}
                    disabled={adding || !inStock}
                    className={`
                        w-full mt-1 py-2.5 flex items-center justify-center gap-2
                        text-xs sm:text-sm font-black rounded-xl transition-all duration-300 select-none
                        ${adding
                            ? 'bg-emerald-500 text-white scale-95 shadow-lg shadow-emerald-200'
                            : inStock
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 active:scale-95'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }
                    `}
                >
                    {adding ? (
                        <><FaCheckCircle size={12} /> Added!</>
                    ) : (
                        <><FaShoppingCart size={12} /> Add to Cart</>
                    )}
                </button>
            </div>
        </div>
    );
};

/* ───────────────────────────────────────────────
   PROCESS GUIDE
─────────────────────────────────────────────── */
const STEP_ICONS: Record<string, string> = { '🔍': '🔍', '💬': '💬', '📍': '📍' };

const ProcessGuide: React.FC = () => (
    <div className="py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10">
            <span className="inline-block text-[10px] sm:text-xs font-black text-blue-600 bg-blue-100 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">
                Simple Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">How to Order</h2>
            <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">
                Getting your sacred items is quick and easy.
            </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
            {RENTAL_PROCESS_STEPS.map((step, i) => (
                <div
                    key={step.step}
                    className="relative bg-white rounded-2xl p-5 sm:p-6 text-center shadow hover:shadow-lg transition-all duration-300 border border-blue-50 hover:-translate-y-1 group"
                >
                    {i < RENTAL_PROCESS_STEPS.length - 1 && (
                        <div className="hidden sm:block absolute top-10 -right-3 w-6 h-0.5 bg-blue-200 z-10" />
                    )}
                    <div className="flex items-center justify-center mb-4 mx-auto w-fit relative">
                        <div className="w-14 sm:w-16 h-14 sm:h-16 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl text-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                            {STEP_ICONS[step.icon] || step.icon}
                        </div>
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full shadow-md">
                            {step.step}
                        </div>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800 mb-1">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
            ))}
        </div>
    </div>
);

/* ───────────────────────────────────────────────
   TESTIMONIALS SECTION
─────────────────────────────────────────────── */
const TESTIMONIALS = [
    {
        id: 1,
        name: 'Grace Wanjiku',
        role: 'Parishioner',
        text: 'The communion set I ordered was beautiful and arrived quickly. Thank you for making it easy to get quality sacramentals!',
        rating: 5,
    },
    {
        id: 2,
        name: 'Peter Mwangi',
        role: 'Church Administrator',
        text: 'We ordered baptismal candles for our Easter service. The quality was excellent and the process was smooth.',
        rating: 5,
    },
    {
        id: 3,
        name: 'Mary Njeri',
        role: 'Mother of Bride',
        text: 'The wedding candles were exactly what we needed. Highly recommend their services!',
        rating: 4,
    },
];

const TestimonialsSection: React.FC = () => (
    <div className="py-10 sm:py-14 px-4">
        <div className="max-w-5xl mx-auto text-center mb-8 sm:mb-10">
            <span className="inline-block text-[10px] sm:text-xs font-black text-blue-600 bg-blue-100 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">
                What Our Customers Say
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">Trusted by Our Community</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3 max-w-5xl mx-auto">
            {TESTIMONIALS.map(t => (
                <div
                    key={t.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 shadow hover:shadow-lg transition-all duration-300 border border-blue-50 hover:-translate-y-1 text-center"
                >
                    <div className="flex justify-center gap-0.5 mb-3">
                        {Array.from({ length: t.rating }).map((_, i) => (
                            <FaStar key={i} size={12} className="text-amber-400" />
                        ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 italic">
                        "{t.text}"
                    </p>
                    <div>
                        <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                        <p className="text-xs text-slate-400">{t.role}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/* ───────────────────────────────────────────────
   SKELETON LOADER
─────────────────────────────────────────────── */
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow overflow-hidden animate-pulse">
        <div className="h-40 sm:h-48 bg-slate-200" />
        <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
            <div className="h-8 bg-slate-200 rounded-xl mt-2" />
        </div>
    </div>
);

/* ───────────────────────────────────────────────
   MAIN SACRAMENTALS PAGE
─────────────────────────────────────────────── */
export const Sacramentals = () => {
    const { products, addToCart, sacCategory, setSacCategory, setIsCartOpen, isAdmin, isLoading } = useApp();
    const navigate = useNavigate();
    const [search, setSearch] = React.useState('');
    const [sliderImgs, setSliderImgs] = React.useState<SliderImg[]>([]);
    const [sliderLoading, setSliderLoading] = React.useState(true);

    /* ── Load admin-uploaded slider images from API ── */
    React.useEffect(() => {
        let mounted = true;
        setSliderLoading(true);
        apiService.getSacramentalsSliderImages('sacramentals')
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
                    // Fallback to built-in images
                    setSliderImgs(SLIDE_IMAGES);
                }
            })
            .catch(() => { if (mounted) setSliderImgs(SLIDE_IMAGES); })
            .finally(() => { if (mounted) setSliderLoading(false); });
        return () => { mounted = false; };
    }, []);

    /* ── Delete slider image (admin only) ── */
    const handleDeleteSliderImage = async (id: number | string) => {
        if (!window.confirm('Delete this slide image?')) return;
        await apiService.deleteSacramentalsSliderImage(id);
        setSliderImgs(prev => prev.filter(img => img.id !== id));
    };

    /* ── Filter products: sacramentals = all sub-cats + explicit "sacramentals" ── */
    const sourceProducts = React.useMemo(() => {
        const dbFiltered = products.filter(p =>
            SACRAMENTAL_SUBCATS.has((p.category || '').toLowerCase())
        );
        if (dbFiltered.length > 0) {
            return dbFiltered.map(p => ({
                ...p,
                subcategory: p.category,
            }));
        }
        // Fallback: static data
        return SACRAMENTALS_PRODUCTS.map((p, i) => ({
            id: `static-${i}`,
            name: p.name,
            price: p.price,
            description: p.desc,
            image_url: p.img,
            subcategory: p.category,
            category: p.category,
            stock: 50,
        }));
    }, [products]);

    /* ── Category counts ── */
    const categoryCounts = React.useMemo(() => {
        const c: Record<string, number> = {};
        SACRAMENTAL_CATEGORIES.forEach(cat => { if (cat.id !== 'all') c[cat.id] = 0; });
        sourceProducts.forEach(p => {
            const sub = (p.subcategory || p.category || '').toLowerCase();
            if (sub && sub in c) c[sub]++;
        });
        return c;
    }, [sourceProducts]);

    /* ── Final filtered list ── */
    const filtered = React.useMemo(() => {
        return sourceProducts.filter(p => {
            const sub = (p.subcategory || p.category || '').toLowerCase();
            const matchCat = sacCategory === 'all' || sub === sacCategory;
            const term = search.toLowerCase();
            const matchSearch = !term
                || (p.name || '').toLowerCase().includes(term)
                || (p.description || p.desc || '').toLowerCase().includes(term);
            return matchCat && matchSearch;
        });
    }, [sourceProducts, sacCategory, search]);

    /* ── Add to cart ── */
    const handleAddToCart = (product: typeof sourceProducts[0]) => {
        addToCart({
            item: { ...product, img: product.image_url },
            price: Number(product.price) || 0,
            category: 'sacramentals',
        });
    };

    const hasFilters = sacCategory !== 'all' || search.trim();
    const activeCategoryLabel = SACRAMENTAL_CATEGORIES.find(c => c.id === sacCategory)?.label || '';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/20 to-white">

            {/* ── HERO SLIDER ── */}
            <div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                {sliderLoading ? (
                    <div className="w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] rounded-2xl md:rounded-3xl bg-slate-200 animate-pulse" />
                ) : (
                    <HeroSlider
                        images={sliderImgs}
                        isAdmin={isAdmin}
                        onDelete={handleDeleteSliderImage}
                    />
                )}
            </div>

            {/* ── PAGE HEADER ── */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-2 text-center">
                <span className="inline-block px-3 sm:px-5 py-1.5 text-[10px] sm:text-xs font-black text-blue-700 bg-blue-100 rounded-full uppercase tracking-widest mb-3">
                    ✦ Holy Items ✦
                </span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-800 leading-tight">
                    Sacramentals &amp;{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                        Devotionals
                    </span>
                </h1>
                <p className="mt-2 sm:mt-3 text-slate-500 max-w-md mx-auto text-xs sm:text-sm">
                    Sacred items handpicked to aid your spiritual journey and daily devotion.
                </p>
            </div>

            {/* ── TRUST STRIP ── */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
                <TrustStrip />
            </div>

            {/* ── SEARCH + FILTER PANEL ── */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-blue-50 p-3 sm:p-4 space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm" />
                        <input
                            id="sacramentals-search"
                            type="text"
                            placeholder="Search items…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-9 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition font-semibold text-slate-700 placeholder:text-slate-400"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
                            >×</button>
                        )}
                    </div>

                    {/* Category Filters */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <FaFilter className="text-blue-500 flex-shrink-0 text-xs sm:text-sm" />
                        <CategoryFilterBar
                            selected={sacCategory}
                            onChange={setSacCategory}
                            counts={categoryCounts}
                        />
                    </div>
                </div>
            </div>

            {/* ── PRODUCT SECTION ── */}
            <section id="sacramentals" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-6 sm:pb-10">

                {/* Results bar */}
                <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
                    <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                        {isLoading
                            ? 'Loading items…'
                            : filtered.length > 0
                                ? `${filtered.length} item${filtered.length > 1 ? 's' : ''}${sacCategory !== 'all' ? ` in "${activeCategoryLabel}"` : ''}`
                                : 'No items found'
                        }
                    </p>
                    {hasFilters && !isLoading && (
                        <button
                            onClick={() => { setSacCategory('all'); setSearch(''); }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filtered.map(product => (
                            <ProductCard
                                key={product.id || product.name}
                                product={product}
                                onAdd={() => handleAddToCart(product)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                        <div className="w-16 sm:w-20 h-16 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center text-3xl sm:text-4xl mb-4 shadow-inner">
                            🔍
                        </div>
                        <p className="text-slate-700 font-black text-base sm:text-lg mb-1">No items found</p>
                        <p className="text-slate-400 text-xs sm:text-sm max-w-xs">
                            Try adjusting your search or selecting a different category.
                        </p>
                        <button
                            onClick={() => { setSacCategory('all'); setSearch(''); }}
                            className="mt-4 sm:mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition"
                        >
                            Show All Items
                        </button>
                    </div>
                )}
            </section>

            {/* ── VIEW CART LINK ── */}
            <div className="flex justify-center pb-4 px-4">
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition underline underline-offset-2"
                >
                    <FaShoppingCart size={12} /> View your cart
                </button>
            </div>

            {/* ── TESTIMONIALS ── */}
            <TestimonialsSection />

            {/* ── PROCESS GUIDE ── */}
            <ProcessGuide />
        </div>
    );
};

// Re-export legacy components used by other pages
export const CategoryHero: React.FC<{
    category: 'sacramentals' | 'tshirts' | 'chairs' | 'instruments' | 'other';
    overrideBanner?: { img: string; title: string; subtitle: string };
}> = ({ category, overrideBanner }) => {
    const banner = overrideBanner;
    if (!banner?.img) return null;
    return (
        <div
            className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-cover bg-center shadow-lg mb-6"
            style={{ backgroundImage: `url(${banner.img})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-xl sm:text-3xl font-black">{banner.title}</h2>
                <p className="text-sm text-white/80 mt-1">{banner.subtitle}</p>
            </div>
        </div>
    );
};

export const TrustBar: React.FC<{
    category: 'sacramentals' | 'tshirts' | 'chairs' | 'instruments' | 'other';
}> = ({ category }) => {
    const badges = TRUST_BADGES[category];
    if (!badges) return null;
    return (
        <div className="flex flex-wrap gap-3 justify-center py-3">
            {badges.map((b, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-blue-100 px-3 py-2 rounded-xl shadow-sm text-sm font-semibold text-slate-700">
                    <span>{b.icon}</span>{b.text}
                </div>
            ))}
        </div>
    );
};



export interface SliderImage { url: string; message?: string; }
export const ImageSlider: React.FC<{ images: (string | SliderImage)[] }> = ({ images }) => {
    const imgs: SliderImg[] = images.map(i => typeof i === 'string' ? { url: i } : { url: i.url, message: i.message });
    return <HeroSlider images={imgs} />;
};