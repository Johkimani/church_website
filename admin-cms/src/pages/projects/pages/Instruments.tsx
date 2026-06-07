import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { CategoryHero, TrustBar, ProcessGuide } from '../components/PageAddons';

export const Instruments = () => {
    const { products, addToCart } = useApp();
    const [searchInstruments, setSearchInstruments] = useState('');

    const instrumentsProducts = products.filter(
        p => p.category?.toLowerCase() === 'instruments'
    );

    const visibleInstruments = instrumentsProducts.filter(p =>
        !searchInstruments ||
        p.name?.toLowerCase().includes(searchInstruments.toLowerCase()) ||
        p.desc?.toLowerCase().includes(searchInstruments.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 px-4 py-6">

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-6">
                <input
                    type="text"
                    placeholder="Search instruments..."
                    value={searchInstruments}
                    onChange={(e) => setSearchInstruments(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-blue-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-300 bg-white text-gray-700 placeholder-gray-400"
                />
            </div>

            {/* Page Add-ons */}
            <div className="space-y-6 mb-10">
                <CategoryHero category="instruments" />
                <TrustBar category="instruments" />
                <ProcessGuide />
            </div>

            {/* Product Section */}
            <section
                id="instruments"
                className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 md:p-10 transition-all duration-500"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="inline-block px-4 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-3">
                        Rental Services
                    </span>

                    <h2 className="text-3xl md:text-4xl font-bold text-blue-800">
                        Music Instruments
                    </h2>

                    <p className="mt-2 text-gray-600 max-w-xl mx-auto">
                        Enhance your worship and events with quality instruments that inspire praise,
                        harmony, and joyful expression.
                    </p>
                </div>

                {/* Grid */}
                {visibleInstruments.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {visibleInstruments.map(product => (
                            <div
                                key={product.id}
                                className="transform hover:scale-105 transition duration-300"
                            >
                                <ProductCard
                                    product={product}
                                    categoryType="instruments"
                                    addToCart={addToCart}
                                    isRental={true}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-lg">
                            No instruments found. Try a different search.
                        </p>
                    </div>
                )}
            </section>

            {/* Faith Footer */}
            <div className="text-center mt-10 text-sm text-blue-700 italic">
                “Praise Him with the sound of the trumpet.” – Psalm 150:3
            </div>
        </div>
    );
};