import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SACRAMENTAL_CATEGORIES } from '../pages/data';
import type { SacramentalCategory } from '../pages/data';
import {
    FaSearch, FaShoppingCart, FaFilter, FaCheckCircle, FaHeart
} from 'react-icons/fa';
import { toggleWishlist, isInWishlist } from './Wishlist';
import { HeroSlider, useSliderImages, type SliderImg } from '../components/HeroSlider';
import TestimonialsSection from '../components/TestimonialsSection';
import ProjectHero from '../components/ProjectHero';
import ProjectPageHeader from '../components/ProjectPageHeader';

const SACRAMENTAL_SUBCATS = new Set([
    'rosaries', 'bibles', 'chains', 'crucifixes', 'statues', 'candles', 'sacramentals'
]);

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
                            flex items-center gap-1.5 whitespace-nowrap px-4 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex-shrink-0 min-h-[44px]
                            ${active
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                            }
                        `}
                    >
                        {cat.icon && <span>{cat.icon}</span>}
                        <span className="hidden sm:inline">{cat.label}</span>
                        <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

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
    const [wishlisted, setWishlisted] = React.useState(isInWishlist(String(product.id || product.name)));
    const image = product.image_url || product.img;
    const inStock = product.stock == null || Number(product.stock) > 0;

    const handleAdd = () => {
        if (!inStock) return;
        setAdding(true);
        onAdd();
        setTimeout(() => setAdding(false), 1300);
    };

    return (
        <div
            className="group bg-white rounded-xl border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col cursor-pointer"
            onClick={() => { if (product.id) navigate(`/product/${product.id}`); }}
        >
            {/* Image */}
            <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-slate-50 overflow-hidden">
                {image && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const added = toggleWishlist({
                                id: String(product.id || product.name),
                                name: product.name,
                                price: Number(product.price),
                                image: image || '',
                                category: product.category || 'sacramentals',
                            });
                            setWishlisted(added);
                        }}
                        className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                            wishlisted ? 'bg-rose-500 text-white' : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-500'
                        }`}
                    >
                        <FaHeart size={12} className={wishlisted ? 'fill-current' : ''} />
                    </button>
                )}
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                )}
                {/* Subcategory badge */}
                {product.subcategory && product.subcategory !== 'sacramentals' && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                        {product.subcategory}
                    </span>
                )}
                {/* Out of stock overlay */}
                {!inStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-rose-600 font-bold text-xs bg-white px-2.5 py-1 rounded-full shadow-md border border-rose-100">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-3 sm:p-3.5 gap-1.5">
                <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 min-h-[40px]">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="mt-auto pt-1">
                    <span className="block text-sm sm:text-base font-bold text-slate-900 truncate">
                        KSh {Number(product.price).toLocaleString()}
                    </span>
                </div>

                {/* Add to Cart */}
                <button
                    id={`add-cart-${product.id || product.name}`}
                    onClick={(e) => { e.stopPropagation(); handleAdd(); }}
                    disabled={adding || !inStock}
                    className={`
                        w-full mt-1 py-2.5 flex items-center justify-center gap-1.5 min-h-[40px]
                        text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 select-none
                        ${adding
                            ? 'bg-emerald-500 text-white scale-95'
                            : inStock
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-95'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }
                    `}
                >
                    {adding ? (
                        <><FaCheckCircle size={12} /> Added!</>
                    ) : (
                        <>Add to Cart</>
                    )}
                </button>
            </div>
        </div>
    );
};

const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
        <div className="aspect-square bg-slate-200" />
        <div className="p-2.5 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-3/4" />
            <div className="h-2 bg-slate-100 rounded w-1/2" />
            <div className="h-4 bg-slate-200 rounded w-1/3 mt-1" />
            <div className="h-7 bg-slate-200 rounded-lg mt-1" />
        </div>
    </div>
);

export const Sacramentals = () => {
    const { products: dbProducts, addToCart, sacCategory, setSacCategory, setIsCartOpen, isAdmin, isLoading } = useApp();
    const [search, setSearch] = React.useState('');
    const [debouncedSearch, setDebouncedSearch] = React.useState('');
    const [sortBy, setSortBy] = React.useState<'none' | 'price-asc' | 'price-desc' | 'name'>('none');
    const [page, setPage] = React.useState(1);
    const PAGE_SIZE = 12;
    const productsRef = React.useRef<HTMLDivElement>(null);

    // Debounce search (300ms)
    React.useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    // Auto-scroll to products when filtering
    React.useEffect(() => {
        setPage(1);
        if ((debouncedSearch || sacCategory !== 'all' || sortBy !== 'none') && productsRef.current) {
            productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [debouncedSearch, sacCategory, sortBy]);

    const { sliderImgs, sliderLoading, deleteSlide } = useSliderImages('sacramentals');

    const handleDeleteSliderImage = async (id: number | string) => {
        if (!window.confirm('Delete this slide image?')) return;
        await deleteSlide(id);
    };

    const sourceProducts = React.useMemo(() => {
        return (dbProducts || [])
            .filter(p => {
                const cat = (p.category || '').toLowerCase();
                return cat === 'sacramentals' || SACRAMENTAL_SUBCATS.has(cat) || SACRAMENTAL_SUBCATS.has(p.subcategory?.toLowerCase());
            })
            .map(p => ({
                id: p.id || `db-${p.name}`,
                name: p.name,
                price: Number(p.price) || 0,
                description: p.description || p.desc || '',
                image_url: p.image_url || p.img || '',
                subcategory: (p.subcategory || p.category || 'sacramentals').toLowerCase(),
                category: (p.category || 'sacramentals').toLowerCase(),
                stock: p.stock ?? 50,
            }));
    }, [dbProducts]);

    const categoryCounts = React.useMemo(() => {
        const c: Record<string, number> = {};
        SACRAMENTAL_CATEGORIES.forEach(cat => { if (cat.id !== 'all') c[cat.id] = 0; });
        sourceProducts.forEach(p => {
            const sub = (p.subcategory || p.category || '').toLowerCase();
            if (sub && sub in c) c[sub]++;
        });
        return c;
    }, [sourceProducts]);

    const filtered = React.useMemo(() => {
        let result = sourceProducts.filter(p => {
            const sub = p.subcategory || p.category || '';
            const matchCat = sacCategory === 'all' || sub === sacCategory;
            const term = debouncedSearch.toLowerCase();
            const matchSearch = !term
                || (p.name || '').toLowerCase().includes(term)
                || (p.description || '').toLowerCase().includes(term);
            return matchCat && matchSearch;
        });

        // Sort
        if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
        else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

        return result;
    }, [sourceProducts, sacCategory, debouncedSearch, sortBy]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginatedProducts = React.useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    const handleAddToCart = (product: typeof sourceProducts[0]) => {
        addToCart({
            item: { ...product, img: product.image_url },
            price: Number(product.price) || 0,
            category: 'sacramentals',
        });
    };

    const hasFilters = sacCategory !== 'all' || debouncedSearch.trim() || sortBy !== 'none';
    const activeCategoryLabel = SACRAMENTAL_CATEGORIES.find(c => c.id === sacCategory)?.label || '';

    return (
        <div className="w-full bg-slate-50 min-h-screen pb-20 text-slate-800 font-sans">

            <ProjectHero>
                <div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                    {sliderLoading ? (
                        <div className="w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] rounded-2xl md:rounded-3xl bg-slate-200 animate-pulse" />
                    ) : (
                        <HeroSlider
                            images={sliderImgs}
                            isAdmin={isAdmin}
                            onDelete={handleDeleteSliderImage}
                            shopAnchor="#sacramentals"
                            buttonLabel="Shop Now"
                        />
                    )}
                </div>

                <ProjectPageHeader
                    badge="Holy Items"
                    title="Sacramentals & Devotionals"
                    subtitle="Sacred items handpicked to aid your spiritual journey and daily devotion."
                />
            </ProjectHero>

            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-6 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-slate-100 p-3 sm:p-4 space-y-3"
                >
                    {/* Search + Sort row */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm" />
                            <input
                                id="sacramentals-search"
                                type="text"
                                placeholder="Search by name or description…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-9 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition font-semibold text-slate-700 placeholder:text-slate-400"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg text-lg leading-none transition-colors"
                                >×</button>
                            )}
                        </div>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as typeof sortBy)}
                            className="w-full sm:w-auto px-3 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition cursor-pointer"
                        >
                            <option value="none">Sort</option>
                            <option value="price-asc">Price: Low → High</option>
                            <option value="price-desc">Price: High → Low</option>
                            <option value="name">Name: A → Z</option>
                        </select>
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
                </motion.div>
            </div>

            <motion.section
                ref={productsRef}
                id="sacramentals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6 sm:pb-10"
            >
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
                            onClick={() => { setSacCategory('all'); setSearch(''); setDebouncedSearch(''); setSortBy('none'); }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filtered.length > 0 ? (
                    <>
                        <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {paginatedProducts.map(product => (
                                <ProductCard
                                    key={product.id || product.name}
                                    product={product}
                                    onAdd={() => handleAddToCart(product)}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                    Prev
                                </button>
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 7) pageNum = i + 1;
                                    else if (page <= 4) pageNum = i + 1;
                                    else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
                                    else pageNum = page - 3 + i;
                                    return (
                                        <button key={pageNum} onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${
                                                page === pageNum ? 'bg-blue-600 text-white shadow-md' : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                                            }`}>
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                        <div className="w-16 sm:w-20 h-16 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <FaSearch size={26} className="text-blue-500" />
                        </div>
                        <p className="text-slate-700 font-bold text-base sm:text-lg mb-1">No items found</p>
                        <p className="text-slate-400 text-xs sm:text-sm max-w-xs">
                            {debouncedSearch
                                ? `No results for "${debouncedSearch}"`
                                : 'Try adjusting your search or selecting a different category.'
                            }
                        </p>
                        <button
                            onClick={() => { setSacCategory('all'); setSearch(''); setDebouncedSearch(''); setSortBy('none'); }}
                            className="mt-4 sm:mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition"
                        >
                            Show All Items
                        </button>
                    </div>
                )}
            </motion.section>

            <div className="flex justify-center pb-4 px-4">
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition underline underline-offset-2"
                >
                    <FaShoppingCart size={12} /> View your cart
                </button>
            </div>

            <TestimonialsSection variant="blue" />

        </div>
    );
};

// Re-export legacy components used by other pages
export const CategoryHero: React.FC<{
    category: 'sacramentals' | 'tshirts' | 'chairs' | 'instruments' | 'other';
    overrideBanner?: { img: string; title: string; subtitle: string };
}> = ({ overrideBanner }) => {
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
}> = () => null;



export interface SliderImage { url: string; message?: string; }
export const ImageSlider: React.FC<{ images: (string | SliderImage)[] }> = ({ images }) => {
    const imgs: SliderImg[] = images.map(i => typeof i === 'string' ? { url: i } : { url: i.url, message: i.message });
    return <HeroSlider images={imgs} />;
};