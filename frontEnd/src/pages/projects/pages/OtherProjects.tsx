import { useState } from 'react';
import { Search, Sprout } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import ProjectHero from '../components/ProjectHero';
import ProjectPageHeader from '../components/ProjectPageHeader';

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
        <div className="w-full bg-slate-50 min-h-screen pb-20 text-slate-800 font-sans">

            <ProjectHero>
                <ProjectPageHeader
                    badge="Expansion & Community"
                    title="Other Projects"
                    subtitle="Explore initiatives that extend our mission — serving communities, supporting growth, and sharing faith through meaningful projects."
                />
            </ProjectHero>

            <div className="max-w-2xl mx-auto px-3 sm:px-6 -mt-6 relative z-20">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search other projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 shadow-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-300 text-slate-700 placeholder:text-slate-400"
                    />
                </div>
            </div>

            <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6">
                {/* Results bar */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                        {visibleProducts.length > 0
                            ? `${visibleProducts.length} project${visibleProducts.length > 1 ? 's' : ''}`
                            : 'No projects found'}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition"
                        >
                            Clear search
                        </button>
                    )}
                </div>

                {visibleProducts.length > 0 ? (
                    <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                        {visibleProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                categoryType="other"
                                addToCart={addToCart}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                        <div className="w-16 sm:w-20 h-16 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <Sprout size={26} className="text-blue-500" />
                        </div>
                        <p className="text-slate-700 font-bold text-base sm:text-lg mb-1">New initiatives coming soon</p>
                        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                            We are prayerfully working on new projects to serve the community. Stay tuned for updates from CSA.
                        </p>
                    </div>
                )}
            </section>

            {/* Faith Footer */}
            <div className="text-center pt-8 text-sm text-blue-700 italic px-4">
                “Let your light shine before others, that they may see your good deeds.”
                <br className="hidden sm:block" />
                – Matthew 5:16
            </div>
        </div>
    );
};
