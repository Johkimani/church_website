import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroSlider } from '../components/HeroSlider';
import ProjectHero from '../components/ProjectHero';
import { ArrowUpRight, ShoppingBag, Shirt, ArmchairIcon, Guitar, BookHeart, GraduationCap, Church } from 'lucide-react';
import PageLoader from '../../../assets/Layouts/PageLoader';
import apiService from '../../../services/api';
import { useProjectsData } from '../context/ProjectsProvider';

const CATEGORIES = [
  { id: 'sacramentals', label: 'Sacramentals', path: '/sacramentals', tag: 'Sacred Items', icon: <ShoppingBag size={18} />, desc: 'Sacred items for your spiritual journey and daily devotion.' },
  { id: 'tshirts', label: 'T-Shirts', path: '/t-shirts', tag: 'New Arrival', icon: <Shirt size={18} />, desc: 'Show your faith with our premium CSA merchandise.' },
  { id: 'chairs', label: 'Chairs', path: '/chairs', tag: 'Rentals', icon: <ArmchairIcon size={18} />, desc: 'Quality seating for your events and gatherings.' },
  { id: 'instruments', label: 'Instruments', path: '/instruments', tag: 'For Hire', icon: <Guitar size={18} />, desc: 'Professional musical instruments for hire.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { y: 40, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 70, damping: 15 } },
};

const FaithFooter: React.FC = () => (
  <section className="bg-slate-50 py-10 border-t border-slate-100">
    <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
      <p className="text-xs text-slate-400">
        Kirinyaga University Catholic Student Association — St. Thomas of Aquinas
      </p>
    </div>
  </section>
);

export const Home = () => {
  const ctx = useProjectsData();
  const [sliderImgs, setSliderImgs] = useState<any[]>([]);
  const [sliderLoading, setSliderLoading] = useState(true);
  const [cardImages, setCardImages] = useState<Record<string, string>>({});
  const [cardTags, setCardTags] = useState<Record<string, string>>({});
  const [cardsLoading, setCardsLoading] = useState(true);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    if (ctx.sliderImages.length > 0) {
      setSliderImgs(ctx.sliderImages);
      setSliderLoading(false);
    } else {
      apiService.getSacramentalsSliderImages().then(data => {
        if (Array.isArray(data)) setSliderImgs(data);
      }).finally(() => setSliderLoading(false));
    }

    if (ctx.categoryCards.length > 0) {
      const imgs: Record<string, string> = {};
      const tags: Record<string, string> = {};
      ctx.categoryCards.forEach((c: any) => {
        if (c.image_url) imgs[c.category] = c.image_url;
        if (c.tag) tags[c.category] = c.tag;
      });
      setCardImages(imgs);
      setCardTags(tags);
      setCardsLoading(false);
    } else {
      apiService.getCategoryCards().then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const imgs: Record<string, string> = {};
          const tags: Record<string, string> = {};
          data.forEach((c: any) => {
            if (c.image_url) imgs[c.category] = c.image_url;
            if (c.tag) tags[c.category] = c.tag;
          });
          setCardImages(imgs);
          setCardTags(tags);
        }
      }).catch(() => {}).finally(() => setCardsLoading(false));
    }
  }, [ctx.sliderImages, ctx.categoryCards]);

  const getImg = (id: string) => cardImages[id] || '';
  const getTag = (id: string) => cardTags[id] || CATEGORIES.find(c => c.id === id)?.tag || '';

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24 text-slate-800 font-sans">

      <ProjectHero>
        <div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          {sliderLoading ? (
            <div className="w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] rounded-2xl md:rounded-3xl bg-slate-200 animate-pulse" />
          ) : (
            <HeroSlider images={sliderImgs} isAdmin={false} section="sacramentals" shopAnchor="#categories" />
          )}
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-8 text-center relative z-10">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />

          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full"
          >
            KYU CSA Catholic Store
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight"
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Catholic Store
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-4 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Sacred items, CSA merchandise, event rentals and worship equipment — everything the community needs, in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <NavLink
              to="#categories"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              <ShoppingBag size={16} />
              Explore Collections
            </NavLink>
            <NavLink
              to="/sacramentals"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              View Featured
            </NavLink>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto"
          >
            {[
              { id: 'kyu', label: 'Kirinyaga University', sub: 'KYU', icon: <GraduationCap size={18} />, tone: 'bg-blue-50 text-blue-600 ring-blue-100', hover: 'hover:shadow-blue-100 hover:border-blue-200' },
              { id: 'csa', label: 'Catholic Student Association', sub: 'CSA', icon: <Church size={18} />, tone: 'bg-indigo-50 text-indigo-600 ring-indigo-100', hover: 'hover:shadow-indigo-100 hover:border-indigo-200' },
              { id: 'patron', label: 'St. Thomas of Aquinas', sub: 'Patron Saint', image: '/images/st-thomas-icon.jpg', tone: 'bg-amber-50 ring-amber-100', hover: 'hover:shadow-amber-100 hover:border-amber-200' },
            ].map((brand, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-2.5 bg-white border border-slate-200 rounded-2xl px-3 py-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-default ${brand.hover}`}
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-offset-1 ring-transparent">
                  {brand.image ? (
                    <img src={brand.image} alt={brand.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full ${brand.tone} flex items-center justify-center rounded-xl`}>
                      {brand.icon}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{brand.sub}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{brand.label}</p>
                </div>
              </div>
            ))}
            <NavLink
              to="/devotions"
              className="flex flex-col items-center gap-2.5 bg-white border border-slate-200 rounded-2xl px-3 py-4 shadow-sm hover:shadow-amber-100 hover:border-amber-300 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ring-2 ring-offset-1 ring-transparent group-hover:ring-amber-100">
                <BookHeart size={18} className="text-amber-500" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors leading-tight">Spiritual Life</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Prayer & Reflection</p>
              </div>
            </NavLink>
          </motion.div>
        </div>
      </ProjectHero>

      <div id="categories" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-12 sm:pt-14">
        <motion.div className="text-center mb-8 sm:mb-10">
          <span className="inline-block text-[11px] sm:text-xs font-bold text-blue-600 bg-blue-100 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">
            Our Collections
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">Browse by Category</h2>
        </motion.div>

        {cardsLoading ? (
          <div className="flex justify-center py-8">
            <PageLoader message="Loading categories..." />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          >
            {CATEGORIES.map(cat => (
              <motion.div key={cat.id} variants={cardVariants}>
                <NavLink
                  to={cat.path}
                  className="group relative flex flex-col h-full w-full bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out overflow-hidden hover:-translate-y-2"
                >
                  <div className="h-52 relative overflow-hidden shrink-0">
                    <img
                      src={getImg(cat.id)}
                      alt={cat.label}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    {getTag(cat.id) && (
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                        {getTag(cat.id)}
                      </span>
                    )}

                    <div className="absolute bottom-4 left-6 right-6">
                      <h3 className="text-xl font-bold text-white leading-tight tracking-tight group-hover:text-blue-300 transition-colors">
                        {cat.label}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-grow font-medium">
                      {cat.desc}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-end text-blue-600 group-hover:text-blue-700 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 flex items-center justify-center text-blue-600">
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </NavLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-slate-900"
        >
          <img
            src="/images/st-thomas-aquinas.jpg"
            alt="St. Thomas Aquinas"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-slate-900/30" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 sm:gap-12 p-8 sm:p-14">
            <div className="shrink-0">
              <div className="rounded-full overflow-hidden p-1.5" style={{
                background: "linear-gradient(135deg, #FBBF24, #D97706)",
                boxShadow: "0 18px 40px rgba(217,119,6,0.4)",
              }}>
                <img
                  src="/images/st-thomas-aquinas.jpg"
                  alt="St. Thomas Aquinas"
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white/20"
                />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <span className="inline-block text-[11px] sm:text-xs font-bold text-amber-300 bg-amber-300/10 border border-amber-300/30 px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
                Our Patron Saint
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                St. Thomas Aquinas
              </h2>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Doctor of the Church and patron of students, theologians, and universities. His
                brilliant mind was matched by a profound devotion to the Eucharist — he reminds us
                that all knowledge finds its beginning and end in God.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <FaithFooter />

    </div>
  );
};
