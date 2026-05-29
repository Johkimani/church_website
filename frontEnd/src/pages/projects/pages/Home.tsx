import { useApp } from '../../../context/AppContext';
import { NavLink } from 'react-router-dom';

export const Home = () => {
    const { apiMessages } = useApp();

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 flex items-center justify-center px-4">

            {/* Hero Section */}
            <section className="w-full max-w-5xl text-center py-10 md:py-16">

                <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-3xl px-6 py-10 md:px-10 md:py-14 transition-all duration-500">

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-800 leading-tight">
                        Elevate Your Style
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                        {apiMessages.general?.[0] || 
                        'Discover our premium collection of products curated with care for your lifestyle, events, and faith journey.'}
                    </p>

                    {/* Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center">

                        <NavLink
                            to="/t-shirts"
                            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-blue-300 text-blue-700 font-medium shadow-sm hover:bg-blue-50 transition duration-300 text-center"
                        >
                            T-Shirts
                        </NavLink>

                        <NavLink
                            to="/chairs"
                            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-blue-300 text-blue-700 font-medium shadow-sm hover:bg-blue-50 transition duration-300 text-center"
                        >
                            Chairs
                        </NavLink>

                        <NavLink
                            to="/instruments"
                            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-blue-300 text-blue-700 font-medium shadow-sm hover:bg-blue-50 transition duration-300 text-center"
                        >
                            Instruments
                        </NavLink>

                    </div>

                    {/* Faith Touch */}
                    <p className="mt-10 text-sm text-blue-700 italic">
                        “Whatever you do, do it all for the glory of God.” – 1 Corinthians 10:31
                    </p>

                </div>
            </section>
        </div>
    );
};