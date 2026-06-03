import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { CategoryHero, TrustBar, ProcessGuide } from '../components/PageAddons';

export const OtherProjects = () => {
    const { products, addToCart } = useApp();
    const [searchQuery, setSearchQuery] = useState('');

    const otherProducts = products.filter(
        p => p.category?.toLowerCase() === 'other'
    );

    const visibleProducts = otherProducts.filter(p =>
        !searchQuery ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-6">

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-8">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search other projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-5 py-3 pl-12 rounded-2xl border border-blue-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-300 bg-white text-gray-700 placeholder-gray-400"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                        🌍
                    </span>
                </div>
            </div>

            {/* Page Add-ons */}
            <div className="space-y-6 mb-12">
                <CategoryHero category="other" />
                <TrustBar category="other" />
                <ProcessGuide />
            </div>

            {/* Product Section */}
            <section className="max-w-7xl mx-auto bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6 md:p-10 border border-blue-100">

                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-3 shadow-sm">
                        Expansion & Community
                    </span>

                    <h2 className="text-3xl md:text-4xl font-extrabold text-blue-800">
                        Other Projects
                    </h2>

                    <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                        Explore initiatives that extend our mission—serving communities,
                        supporting growth, and sharing faith through meaningful projects.
                    </p>
                </div>

                {/* Content */}
                {visibleProducts.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {visibleProducts.map(product => (
                            <div
                                key={product.id}
                                className="group transform transition duration-300 hover:scale-105"
                            >
                                <div className="rounded-2xl overflow-hidden group-hover:shadow-xl transition duration-300">
                                    <ProductCard
                                        product={product}
                                        categoryType="other"
                                        addToCart={addToCart}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-14">
                        <div className="text-4xl mb-4">🌱</div>
                        <p className="text-gray-600 text-lg">
                            New initiatives coming soon!
                        </p>
                        <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
                            We are prayerfully working on new projects to serve the community.
                            Stay tuned for updates from CSA.
                        </p>
                    </div>
                )}
            </section>

            {/* Faith Footer */}
            <div className="text-center mt-12 text-sm text-blue-700 italic px-4">
                “Let your light shine before others, that they may see your good deeds.”
                <br className="hidden sm:block" />
                – Matthew 5:16
            </div>
        </div>
    );
};