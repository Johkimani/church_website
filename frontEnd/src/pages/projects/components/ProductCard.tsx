import React from 'react';
import type { CartItem } from '../pages/data';
import { IconCalendar } from './Icons';

interface ProductCardProps {
    product: any;
    categoryType: 'sacramentals' | 'tshirts' | 'chairs' | 'instruments' | 'other';
    selectedSize?: string;
    setSelectedSize?: (size: string) => void;
    addToCart: (item: CartItem) => void;
    isRental?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    categoryType,
    selectedSize,
    setSelectedSize,
    addToCart,
    isRental = false
}) => {
    const image = product.image_url || product.img;
    const [sizeError, setSizeError] = React.useState(false);

    const price = Number(product.price);

    return (
        <div className="group flex flex-col overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-0.5 fade-in">
            <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-slate-50 overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f1f5f9 100%)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 p-3 gap-1.5">
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 min-h-[40px]">
                        {product.name}
                    </h3>
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                        {product.price ? (isRental ? `KES ${price.toLocaleString()}/day` : `KES ${price.toLocaleString()}`) : 'Price on Request'}
                    </span>
                </div>

                {product.desc && <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">{product.desc}</p>}

                {/* Features for instruments/chairs */}
                {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                    <ul className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                        {product.features.slice(0, 3).map((feat: string, i: number) => (
                            <li key={i} className="flex items-center gap-1 text-xs text-slate-600">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span className="truncate">{feat}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Sizes for T-Shirts */}
                {categoryType === 'tshirts' && product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && setSelectedSize && (
                    <div className="flex flex-col gap-1.5 mt-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Select Size</span>
                        <div className="flex flex-wrap gap-1.5">
                            {product.sizes.map((size: string) => (
                                <button
                                    key={size}
                                    className={`min-h-[32px] min-w-[36px] px-2 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${selectedSize === size
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700'
                                    }`}
                                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        {sizeError && (
                            <p className="text-xs text-rose-600 font-semibold">Please select a size first.</p>
                        )}
                    </div>
                )}

                <div className="mt-auto pt-2">
                    <button
                        className="w-full min-h-[40px] py-2 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all duration-300 select-none active:scale-95"
                        onClick={() => {
                            if (categoryType === 'tshirts' && !selectedSize) {
                                setSizeError(true);
                                return;
                            }
                            addToCart({
                                item: product,
                                price: price,
                                rentalDays: isRental ? 1 : undefined,
                                size: categoryType === 'tshirts' ? selectedSize : undefined
                            });
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {isRental && <IconCalendar />}
                        {isRental ? 'Rent Now' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};
