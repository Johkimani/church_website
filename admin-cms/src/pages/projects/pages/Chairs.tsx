import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { CategoryHero, TrustBar, ProcessGuide } from '../components/PageAddons';

export const Chairs = () => {
    const { products, addToCart } = useApp();
    const [searchChairs, setSearchChairs] = useState('');

    const chairsProducts = products.filter(
        p => p.category?.toLowerCase() === 'chairs'
    );

    const visibleChairs = chairsProducts.filter(p =>
        !searchChairs ||
        p.name?.toLowerCase().includes(searchChairs.toLowerCase()) ||
        p.desc?.toLowerCase().includes(searchChairs.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 px-4 py-6">

            {/* Top Search Bar */}
            <div className="max-w-4xl mx-auto mb-6">
                <input
                    type="text"
                    placeholder="Search chairs..."
                    value={searchChairs}
                    onChange={(e) => setSearchChairs(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-blue-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-300 bg-white text-gray-700 placeholder-gray-400"
                />
            </div>

            {/* Page Add-ons */}
            <div className="space-y-6 mb-10">
                <CategoryHero category="chairs" />
                <TrustBar category="chairs" />
                <ProcessGuide />
            </div>

            {/* Product Section */}
            <section
                id="chairs"
                className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 md:p-10 transition-all duration-500"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <span className="inline-block px-4 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-3">
                        Rental Services
                    </span>

                    <h2 className="text-3xl md:text-4xl font-bold text-blue-800">
                        Event Chairs
                    </h2>

                    <p className="mt-2 text-gray-600 max-w-xl mx-auto">
                        Comfortable and elegant seating prepared with care to serve your gatherings,
                        celebrations, and faith-based events.
                    </p>
                </div>

                {/* Grid */}
                {visibleChairs.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {visibleChairs.map(product => (
                            <div
                                key={product.id}
                                className="transform hover:scale-105 transition duration-300"
                            >
                                <ProductCard
                                    product={product}
                                    categoryType="chairs"
                                    addToCart={addToCart}
                                    isRental={true}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-lg">
                            No chairs found. Try a different search.
                        </p>
                    </div>
                )}
            </section>

            {/* Footer Note (Faith touch) */}
            <div className="text-center mt-10 text-sm text-blue-700 italic">
                “Let all things be done decently and in order.” – 1 Corinthians 14:40
            </div>
        </div>
    );
};