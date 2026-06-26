import { useApp } from '../../../context/AppContext';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, Armchair, Music, ArrowRight, ArrowUpRight } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'sacramentals',
    label: 'Sacramentals',
    path: '/sacramentals',
    description: 'Rosaries, bibles, crucifixes, candles & sacred items for your spiritual journey.',
    gradient: 'from-indigo-900/80 via-purple-800/60 to-transparent',
    image: '/images/sacramentals_home.avif',
    tag: 'Faith Essentials',
    iconBg: 'bg-indigo-500/80',
  },
  {
    id: 'tshirts',
    label: 'T-Shirts',
    path: '/t-shirts',
    description: 'Premium grey polo T-shirts with KYU, CSA & St. Thomas of Aquinas branding.',
    gradient: 'from-slate-900/80 via-slate-700/60 to-transparent',
    image: 'https://images.unsplash.com/photo-1625910513413-5fc42c1c2a28?w=600&h=400&fit=crop',
    tag: 'Custom Branded',
    iconBg: 'bg-slate-600/80',
  },
  {
    id: 'chairs',
    label: 'Chairs',
    path: '/chairs',
    description: 'Durable plastic event chairs for rent — perfect for celebrations & community gatherings.',
    gradient: 'from-amber-900/80 via-orange-800/60 to-transparent',
    image: '/images/chairs_home.webp',
    tag: 'Event Rentals',
    iconBg: 'bg-amber-500/80',
  },
  {
    id: 'instruments',
    label: 'Instruments',
    path: '/instruments',
    description: 'Quality musical instruments — organs, pianos, speakers & drums for worship.',
    gradient: 'from-emerald-900/80 via-teal-800/60 to-transparent',
    image: 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=600&h=400&fit=crop',
    tag: 'Worship Gear',
    iconBg: 'bg-emerald-500/80',
  },
];

export const Home = () => {
  const { apiMessages } = useApp();

  return (
    <div className="min-h-screen bg-white">

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 md:pt-28 pb-14 sm:pb-20 md:pb-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full mb-6">
              <span className="text-xs font-black text-white tracking-wider">KYU</span>
              <span className="text-white/30">|</span>
              <span className="text-xs font-black text-blue-400 tracking-wider">CSA</span>
              <span className="text-white/30">|</span>
              <span className="text-xs font-bold text-white/70 tracking-wider">St. Thomas of Aquinas</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
              Kirinyaga University
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Catholic Store
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
              {apiMessages.general?.[0] ||
              'Premium sacramentals, custom-branded KYU CSA T-shirts, and quality event equipment — all curated for your faith community.'}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <NavLink
                to="/sacramentals"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-base rounded-2xl shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                <ShoppingCart size={20} />
                Shop Now
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </NavLink>
              <NavLink
                to="/chairs"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white font-bold text-base rounded-2xl hover:bg-white/15 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Armchair size={20} />
                Rent Equipment
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </NavLink>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 36.7 768 43.3 864 45C960 46.7 1056 43.3 1152 40C1248 36.7 1344 33.3 1392 31.7L1440 30V60H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ═══ BRAND STRIP ═══ */}
      <section className="bg-white py-6 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
            {[
              { label: 'Kirinyaga University', sub: 'KYU' },
              { label: 'Catholic Student Association', sub: 'CSA' },
              { label: 'St. Thomas of Aquinas', sub: 'Patron Saint' },
            ].map((brand, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-black text-blue-600">+</span>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">{brand.sub}</p>
                  <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{brand.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORY CARDS ═══ */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
              Our Collections
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Browse by Category
            </h2>
            <p className="mt-3 text-slate-500 max-w-md mx-auto text-sm sm:text-base">
              Everything you need for your faith, events, and community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {CATEGORIES.map((cat) => (
              <NavLink
                key={cat.id}
                to={cat.path}
                className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-400 overflow-hidden hover:-translate-y-2"
              >
                <div className="relative h-52 sm:h-56 overflow-hidden rounded-t-3xl">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient}`} />

                  {/* Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider text-slate-700 px-2.5 py-1 rounded-full">
                      {cat.tag}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="absolute top-3 right-3">
                    <div className={`w-8 h-8 ${cat.iconBg} backdrop-blur-sm rounded-full flex items-center justify-center`}>
                      <span className="text-white text-xs">+</span>
                    </div>
                  </div>

                  {/* Bottom arrow */}
                  <div className="absolute bottom-3 right-3">
                    <div className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                      <ArrowRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-black text-slate-800 group-hover:text-blue-700 transition-colors">
                    {cat.label}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ QUICK LINKS ═══ */}
      <section className="bg-slate-50 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NavLink
              to="/chairs"
              className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <Armchair size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-800 text-sm group-hover:text-amber-700 transition-colors">Rent Chairs</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">Plastic chairs for events</p>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-amber-500 flex-shrink-0 transition-colors" />
            </NavLink>

            <NavLink
              to="/t-shirts"
              className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <span className="text-white text-xs font-black">KYU</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-800 text-sm group-hover:text-slate-700 transition-colors">Custom T-Shirts</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">KYU CSA branded grey polos</p>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
            </NavLink>

            <NavLink
              to="/instruments"
              className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                <Music size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">Rent Instruments</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">Organ, piano, speakers & drums</p>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-emerald-500 flex-shrink-0 transition-colors" />
            </NavLink>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
            Ready to Get Started?
          </h2>
          <p className="mt-3 text-base sm:text-lg text-white/80 max-w-md mx-auto">
            Join hundreds of KYU Catholic students who shop with us.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <NavLink
              to="/sacramentals"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-blue-700 font-bold text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <ShoppingCart size={18} />
              Browse Store
            </NavLink>
            <NavLink
              to="/t-shirts"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 border border-white/30 text-white font-bold text-sm rounded-2xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get KYU CSA Polo
            </NavLink>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <section className="bg-white py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-sm text-slate-500 italic max-w-md mx-auto">
            "Whatever you do, do it all for the glory of God." — 1 Corinthians 10:31
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Kirinyaga University Catholic Student Association — St. Thomas of Aquinas
          </p>
        </div>
      </section>
    </div>
  );
};
