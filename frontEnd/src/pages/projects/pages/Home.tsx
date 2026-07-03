import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { HeroSlider, useSliderImages } from '../components/HeroSlider';
import { SLIDE_IMAGES } from '../pages/data';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import apiService from '../../Landing/services/api';

const DEFAULT_IMAGES: Record<string, string> = {
  sacramentals: 'https://images.unsplash.com/photo-1584446549557-ca5e7baf3cc1?w=800&fit=crop',
  tshirts: 'https://images.unsplash.com/photo-1594938298603-c8148f4c3c0c?w=800&fit=crop',
  chairs: 'https://images.unsplash.com/photo-1549615555-5dc63920dcbc?w=800&fit=crop',
  instruments: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&fit=crop',
};

const CATEGORIES = [
  { id: 'sacramentals', label: 'Sacramentals', path: '/sacramentals', tag: '15 items' },
  { id: 'tshirts', label: 'T-Shirts', path: '/t-shirts', tag: 'New Arrival' },
  { id: 'chairs', label: 'Chairs', path: '/chairs', tag: 'Rent Now' },
  { id: 'instruments', label: 'Instruments', path: '/instruments', tag: 'Book Now' },
];

const CategoryCard: React.FC<{ cat: typeof CATEGORIES[0] }> = ({ cat }) => {
  return (
    <NavLink
      to={cat.path}
      className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-400 overflow-hidden hover:-translate-y-1"
    >
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <img
          src={cat.img}
          alt={cat.label}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute top-3 right-3 bg-white/80 text-slate-800 text-[10px] font-semibold px-2.5 py-1 rounded-md">
          {cat.tag}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
          <h3 className="text-lg font-bold text-white">{cat.label}</h3>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:bg-white/40 transition-all duration-400">
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>
    </NavLink>
  );
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
  const { sliderImgs, sliderLoading, isAdmin, deleteSlide } = useSliderImages('sacramentals', SLIDE_IMAGES);
  const [cardImages, setCardImages] = useState<Record<string, string>>({});
  const [cardTags, setCardTags] = useState<Record<string, string>>({});
  const [cardsLoading, setCardsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setCardsLoading(true);
    apiService.getCategoryCards().then(data => {
      if (!mounted) return;
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
    }).catch(() => {}).finally(() => { if (mounted) setCardsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const getImg = (id: string) => cardImages[id] || DEFAULT_IMAGES[id] || '';
  const getTag = (id: string) => cardTags[id] || CATEGORIES.find(c => c.id === id)?.tag || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/20 to-white">

      <div className="px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {sliderLoading ? (
          <div className="w-full h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px] rounded-2xl md:rounded-3xl bg-slate-200 animate-pulse" />
        ) : (
          <HeroSlider
            images={sliderImgs}
            isAdmin={isAdmin}
            onDelete={deleteSlide}
            section="sacramentals"
            shopAnchor="#categories"
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-2 text-center">
        <span className="inline-block px-3 sm:px-5 py-1.5 text-[10px] sm:text-xs font-black text-blue-700 bg-blue-100 rounded-full uppercase tracking-widest mb-3">
          KYU CSA Store
        </span>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-800 leading-tight">
          Welcome to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            Catholic Store
          </span>
        </h1>
      </div>

      <section className="bg-white py-6 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-3 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
            {[
              { label: 'Kirinyaga University', sub: 'KYU', icon: '🎓' },
              { label: 'Catholic Student Association', sub: 'CSA', icon: '✝️' },
              { label: 'St. Thomas of Aquinas', sub: 'Patron Saint', icon: '📖' },
            ].map((brand, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-black text-blue-600">{brand.icon}</span>
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

      <section id="categories" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-6 sm:pb-10">
        <div className="text-center mb-8 sm:mb-10">
          <span className="inline-block text-[10px] sm:text-xs font-black text-blue-600 bg-blue-100 px-4 py-1.5 rounded-full uppercase tracking-widest mb-3">
            Our Collections
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800">Browse by Category</h2>
        </div>
        {cardsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {CATEGORIES.slice(0, 3).map(cat => (
                <CategoryCard key={cat.id} cat={{ ...cat, img: getImg(cat.id), tag: getTag(cat.id) }} />
              ))}
            </div>
            <div className="mt-4 sm:mt-5 max-w-md mx-auto">
              <CategoryCard cat={{ ...CATEGORIES[3], img: getImg(CATEGORIES[3].id), tag: getTag(CATEGORIES[3].id) }} />
            </div>
          </>
        )}
      </section>

      <FaithFooter />

    </div>
  );
};
