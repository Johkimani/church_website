import React from 'react';
import type { CartItem } from '../data';
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
    return (
        <div className="product-card fade-in">
            <div className="card-image-wrapper">
                {product.img ? (
                    <img src={product.img} alt={product.name} className="product-img" loading="lazy" />
                ) : (
                    <div className="product-img placeholder shimmer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent) 100%)' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="card-body">
                <div className="card-header">
                    <h3>{product.name}</h3>
                    <span className="price">
                        {product.price ? (isRental ? `KES ${product.price}/day` : `KES ${product.price}`) : 'Price on Request'}
                    </span>
                </div>

                {product.desc && <p className="desc">{product.desc}</p>}

                {/* Features for instruments/chairs */}
                {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                    <ul className="feature-list">
                        {product.features.map((feat: string, i: number) => (
                            <li key={i}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                {feat}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Sizes for T-Shirts */}
                {categoryType === 'tshirts' && product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && setSelectedSize && (
                    <div className="size-selector">
                        <span className="size-label">Select Size</span>
                        <div className="size-options">
                            {product.sizes.map((size: string) => (
                                <button
                                    key={size}
                                    className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="card-footer" style={{ border: 'none', padding: 0 }}>
                    <button
                        className="btn-add-cart"
                        onClick={() => {
                            if (categoryType === 'tshirts' && !selectedSize) {
                                alert("Please select a size first!");
                                return;
                            }
                            addToCart({
                                item: product,
                                price: product.price,
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
