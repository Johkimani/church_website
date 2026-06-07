import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { CategoryHero, TrustBar, ProcessGuide } from '../components/PageAddons';

export const Tshirts = () => {
    const { products, addToCart } = useApp();
    const [searchTshirts, setSearchTshirts] = useState('');
    const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

    const tshirtsProducts = products.filter(
        p => p.category?.toLowerCase() === 'tshirts'
    );

    const visibleTshirts = tshirtsProducts.filter(p =>
        !searchTshirts ||
        p.name?.toLowerCase().includes(searchTshirts.toLowerCase()) ||
        p.desc?.toLowerCase().includes(searchTshirts.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-6">

            {/* Search */}
            <div className="max-w-3xl mx-auto mb-8">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search t-shirts..."
                        value={searchTshirts}
                        onChange={(e) => setSearchTshirts(e.target.value)}
                        className="w-full px-5 py-3 pl-12 rounded-2xl border border-blue-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-300 bg-white text-gray-700 placeholder-gray-400"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                        👕
                    </span>
                </div>
            </div>

            {/* Page Add-ons */}
            <div className="space-y-6 mb-12">
                <CategoryHero category="tshirts" />
                <TrustBar category="tshirts" />
                <ProcessGuide />
            </div>

            {/* Section */}
            <section className="max-w-7xl mx-auto bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl p-6 md:p-10 border border-blue-100">

                {/* Header */}
                <div className="text-center mb-10">
                    <span className="inline-block px-4 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-3">
                        Fashion
                    </span>

                    <h2 className="text-3xl md:text-4xl font-extrabold text-blue-800">
                        Premium T-Shirts
                    </h2>

                    <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                        Express your faith and style with comfortable, high-quality T-shirts
                        designed for everyday wear and meaningful moments.
                    </p>
                </div>

                {/* Spotlight */}
                {visibleTshirts.length === 1 && !searchTshirts ? (
                    <div className="grid md:grid-cols-2 gap-8 items-center">

                        {/* Image */}
                        <div className="rounded-3xl overflow-hidden shadow-lg">
                            <img
                                src={visibleTshirts[0].img}
                                alt={visibleTshirts[0].name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div>
                            <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-full mb-3">
                                Featured Item
                            </span>

                            <h2 className="text-2xl md:text-3xl font-bold text-blue-800">
                                {visibleTshirts[0].name}
                            </h2>

                            <p className="mt-3 text-gray-600">
                                {visibleTshirts[0].desc}
                            </p>

                            <div className="mt-5">
                                <ProductCard
                                    product={visibleTshirts[0]}
                                    categoryType="tshirts"
                                    selectedSize={selectedSizes[visibleTshirts[0].id]}
                                    setSelectedSize={(sz) =>
                                        setSelectedSizes(prev => ({
                                            ...prev,
                                            [visibleTshirts[0].id]: sz
                                        }))
                                    }
                                    addToCart={addToCart}
                                />
                            </div>
                        </div>
                    </div>
                ) : visibleTshirts.length > 0 ? (

                    /* Grid */
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {visibleTshirts.map(product => (
                            <div
                                key={product.id}
                                className="group transform transition duration-300 hover:scale-105"
                            >
                                <div className="rounded-2xl overflow-hidden group-hover:shadow-xl transition duration-300">
                                    <ProductCard
                                        product={product}
                                        categoryType="tshirts"
                                        selectedSize={selectedSizes[product.id]}
                                        setSelectedSize={(sz) =>
                                            setSelectedSizes(prev => ({
                                                ...prev,
                                                [product.id]: sz
                                            }))
                                        }
                                        addToCart={addToCart}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                ) : (
                    /* Empty State */
                    <div className="text-center py-12">
                        <div className="text-4xl mb-3">👕</div>
                        <p className="text-gray-500 text-lg">
                            No T-shirts found
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            Try a different search
                        </p>
                    </div>
                )}
            </section>

            {/* Faith Footer */}
            <div className="text-center mt-12 text-sm text-blue-700 italic px-4">
                “Clothe yourselves with compassion, kindness, humility.”
                <br className="hidden sm:block" />
                – Colossians 3:12
            </div>
        </div>
    );
};