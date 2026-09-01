import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { FaStar, FaShoppingCart, FaChevronLeft, FaCheckCircle, FaMinus, FaPlus, FaHeart } from 'react-icons/fa';
import { ReviewsList, ReviewForm } from '../components/ProductReviews';
import { apiClient } from '../../../api/axiosInstance';
import { toggleWishlist, isInWishlist } from './Wishlist';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { products, addToCart, setIsCartOpen } = useApp();

    const product = useMemo(() => products.find((p: any) => String(p.id) === String(id)), [products, id]);

    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [reviewStats, setReviewStats] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });
    const [wishlisted, setWishlisted] = useState(false);

    useEffect(() => {
        if (product?.id) setWishlisted(isInWishlist(String(product.id)));
    }, [product?.id]);

    useEffect(() => {
        if (!product?.id) return;
        apiClient.get(`/product-reviews/stats?product_id=${product.id}`)
            .then(res => setReviewStats(res.data || { avg: 0, count: 0 }))
            .catch(() => {});
    }, [product?.id]);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-slate-500 text-lg mb-4">Product not found.</p>
                    <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const isTshirt = product.category?.toLowerCase() === 'tshirts';
    const isHireable = product.is_hireable || product.category === 'chairs' || product.category === 'instruments';
    const inStock = product.stock == null || Number(product.stock) > 0;
    const image = product.image_url || product.img;
    const desc = product.description || product.desc || '';
    const productColors = product.colors || product.color_options || null;
    const colors = Array.isArray(productColors) ? productColors : null;
    const rating = product.rating || product.avg_rating || null;
    const reviewCount = product.review_count || product.reviews_count || 0;

    const relatedProducts = products
        .filter((p: any) => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    const handleAddToCart = () => {
        if (isTshirt && !selectedSize) {
            alert('Please select a size!');
            return;
        }
        addToCart({
            item: { ...product, img: image },
            price: Number(product.price) || 0,
            category: product.category,
            size: isTshirt ? selectedSize : undefined,
            quantity,
        });
        setAdded(true);
        setTimeout(() => {
            setAdded(false);
            setIsCartOpen(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            <div className="max-w-6xl mx-auto px-4 pt-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition py-2 px-3 -ml-3 rounded-xl hover:bg-slate-100 min-h-[44px]"
                >
                    <FaChevronLeft size={12} /> Back
                </button>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                        {image ? (
                            <img src={image} alt={product.name} className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover" />
                        ) : (
                            <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                                <FaShoppingCart size={48} className="text-blue-200" />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-5">
                        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 rounded-full w-fit">
                            {product.category || 'General'}
                        </span>

                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">{product.name}</h1>

                        <div className="flex items-center gap-2">
                            {reviewStats.count > 0 ? (
                                <>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <FaStar key={s} size={16} className={s <= Math.round(reviewStats.avg) ? 'text-amber-400' : 'text-slate-200'} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{reviewStats.avg}</span>
                                    <span className="text-xs text-slate-400">({reviewStats.count} review{reviewStats.count !== 1 ? 's' : ''})</span>
                                </>
                            ) : rating != null ? (
                                <>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <FaStar key={s} size={16} className={s <= Math.round(Number(rating)) ? 'text-amber-400' : 'text-slate-200'} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-500">{Number(rating).toFixed(1)}</span>
                                </>
                            ) : null}
                            <button onClick={() => {
                                const added = toggleWishlist({ id: String(product.id), name: product.name, price: Number(product.price), image: image || '', category: product.category || '' });
                                setWishlisted(added);
                            }} className={`ml-2 w-9 h-9 rounded-full flex items-center justify-center transition-all ${wishlisted ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400 hover:text-rose-400'}`}>
                                <FaHeart size={14} className={wishlisted ? 'fill-current' : ''} />
                            </button>
                        </div>

                        <div className="text-3xl font-black text-blue-700">
                            KES {Number(product.price).toLocaleString()}
                            {isHireable && <span className="text-sm font-bold text-slate-400 ml-1">/day</span>}
                        </div>

                        {product.stock != null && (
                            <div className={`text-sm font-bold ${Number(product.stock) > 5 ? 'text-emerald-600' : Number(product.stock) > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                {Number(product.stock) > 5
                                    ? 'In Stock'
                                    : Number(product.stock) > 0
                                        ? `Only ${product.stock} left!`
                                        : 'Out of Stock'}
                            </div>
                        )}

                        {desc && (
                            <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
                        )}

                        {isTshirt && (
                            <>
                                {colors && colors.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Color</p>
                                        <div className="flex gap-3">
                                            {colors.map((c: any) => {
                                                const name = typeof c === 'string' ? c : c.name;
                                                const hex = typeof c === 'string' ? null : c.hex;
                                                return (
                                                    <div key={name} className="flex items-center gap-2">
                                                        {hex && <div className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: hex }} />}
                                                        <span className="text-sm text-slate-700">{name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                        Size {selectedSize && `- ${selectedSize}`}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(product.sizes || SIZES).map((sz: string) => (
                                            <button
                                                key={sz}
                                                onClick={() => setSelectedSize(sz)}
                                                className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${
                                                    selectedSize === sz
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                            >
                                                {sz}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Quantity</p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
                                >
                                    <FaMinus size={12} />
                                </button>
                                <span className="text-lg font-bold text-slate-800 min-w-[30px] text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
                                >
                                    <FaPlus size={12} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!inStock || added}
                            className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
                                added
                                    ? 'bg-emerald-500 text-white'
                                    : inStock
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200 active:scale-[0.98]'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                        >
                            {added ? (
                                <><FaCheckCircle size={16} /> Added!</>
                            ) : (
                                <><FaShoppingCart size={16} /> {isHireable ? 'Request Booking' : 'Add to Cart'}</>
                            )}
                        </button>

                        <div className="flex flex-wrap gap-4 pt-2">
                            {['Secure Payment', 'Quality Guaranteed', 'Pickup Available'].map(badge => (
                                <div key={badge} className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <FaCheckCircle size={10} className="text-emerald-500" />
                                    {badge}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <h2 className="text-xl font-black text-slate-800 mb-6">Related Products</h2>
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                        {relatedProducts.map((p: any) => {
                            const img = p.image_url || p.img;
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); }}
                                    className="bg-white rounded-2xl border border-slate-100 shadow hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                                >
                                    <div className="h-36 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                                        {img ? (
                                            <img src={img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl" />
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{p.name}</h3>
                                        <p className="text-blue-700 font-black text-sm mt-1">KES {Number(p.price).toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {product?.id && (
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 mb-6">Customer Reviews</h2>
                            <ReviewsList productId={Number(product.id)} />
                        </div>
                        <div>
                            <ReviewForm productId={Number(product.id)} onSubmit={() => {
                                apiClient.get(`/product-reviews/stats?product_id=${product.id}`)
                                    .then(res => setReviewStats(res.data || { avg: 0, count: 0 }))
                                    .catch(() => {});
                            }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
