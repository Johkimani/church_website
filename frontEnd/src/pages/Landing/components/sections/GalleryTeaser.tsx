import React, { useEffect, useState } from 'react';
import { Camera, ArrowRight, Expand } from 'lucide-react';
import { fetchGalleryTeaser } from '../../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UPLOAD_BASE } from '../../../../api/config';

interface GalleryItem {
  id: number;
  image_url: string;
  description: string;
  event_name: string;
  category?: string;
  created_at?: string;
}

const rotations = [-2, 3, -1.5, 2.5, -3, 1.8];
const offsets = [
  { x: 0, y: 0 },
  { x: 8, y: 12 },
  { x: -6, y: 4 },
  { x: 4, y: -8 },
  { x: -4, y: 6 },
  { x: 10, y: -4 },
];

const GalleryTeaser: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTeaser = async () => {
      try {
        const { data } = await fetchGalleryTeaser();
        const galleryItems = Array.isArray(data) ? data : (data?.items || data?.data || []);
        setItems(galleryItems);
      } catch (error) {
        console.error("Failed to load gallery teaser:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadTeaser();
  }, []);

  if (loading || items.length === 0) return null;

  const resolveSrc = (url: string) =>
    url?.startsWith('http') ? url : `${UPLOAD_BASE}${url}`;

  const displayItems = items.slice(0, 6);

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden" id="gallery">
      {/* Warm paper-like background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#faf8f5,white_70%)] pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-50/30 rounded-full blur-[200px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
            },
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50/60 text-amber-600 text-[10px] font-black tracking-[0.3em] uppercase mb-8">
            <Camera size={12} className="text-amber-400" />
            Living Memories
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-tight">
            Our{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500 font-serif italic">
              Storyboard
            </span>
          </h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl mx-auto">
            Every moment pinned like a cherished photograph on the wall of our
            community memory.
          </p>
        </motion.div>

        {/* Scrapbook Grid */}
        <div className="relative max-w-6xl mx-auto px-4 md:px-8">
          {/* Tape strip decoration */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-8 bg-amber-200/40 rounded-sm -rotate-2 border border-amber-200/30 pointer-events-none" />
          <div className="absolute -bottom-4 right-12 w-16 h-6 bg-amber-200/30 rounded-sm rotate-3 border border-amber-200/20 pointer-events-none" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayItems.map((item, index) => {
              const isFeatured = index === 0;
              const isWide = index === 3;
              const rotation = rotations[index % rotations.length];
              const offset = offsets[index % offsets.length];

              return (
                <motion.div
                  key={item.id}
                  className={`group relative cursor-pointer select-none ${
                    isFeatured
                      ? 'col-span-2 row-span-2'
                      : isWide
                      ? 'col-span-2'
                      : ''
                  }`}
                  initial={{ opacity: 0, y: 40, rotate: rotation * 0.5 }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    rotate: rotation,
                    x: offset.x,
                  }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  onClick={() => navigate('/gallery')}
                  whileHover={{
                    rotate: 0,
                    scale: 1.03,
                    y: -8,
                    transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
                  }}
                >
                  {/* Polaroid card */}
                  <div
                    className="relative bg-white rounded-[2px] shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12),0_1px_4px_-1px_rgba(0,0,0,0.06)] overflow-hidden"
                    style={{
                      padding: isFeatured ? '8px' : '6px',
                      paddingBottom: isFeatured ? '48px' : '36px',
                    }}
                  >
                    {/* Photo area */}
                    <div
                      className={`relative overflow-hidden ${
                        isFeatured ? 'rounded-[1px]' : 'rounded-[1px]'
                      }`}
                      style={{ minHeight: isFeatured ? '320px' : '160px' }}
                    >
                      <img
                        src={resolveSrc(item.image_url)}
                        alt={item.event_name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                        draggable={false}
                      />

                      {/* Subtle overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Info on hover */}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <h3 className="text-white font-black text-sm md:text-base tracking-tight leading-tight">
                          {item.event_name}
                        </h3>
                        {item.category && (
                          <span className="text-white/60 text-[9px] font-bold tracking-widest uppercase mt-1 block">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Polaroid "caption" area */}
                    <div className="flex items-center justify-between mt-2 px-1">
                      <span className="text-[10px] md:text-xs font-bold text-slate-600 truncate leading-tight tracking-tight">
                        {item.event_name}
                      </span>
                      <Expand
                        size={isFeatured ? 14 : 11}
                        className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 ml-2"
                      />
                    </div>

                    {/* Pin shadow effect on top edge */}
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-200/50 shadow-[0_2px_4px_rgba(0,0,0,0.06)] pointer-events-none" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Decorative scattered tape pieces */}
          <div className="absolute -top-2 left-[15%] w-14 h-3 bg-amber-200/30 -rotate-6 rounded-sm border border-amber-200/20 pointer-events-none hidden md:block" />
          <div className="absolute top-[40%] -right-3 w-12 h-3 bg-amber-200/25 rotate-12 rounded-sm border border-amber-200/15 pointer-events-none hidden md:block" />
          <div className="absolute bottom-[20%] -left-4 w-10 h-2.5 bg-amber-200/30 -rotate-12 rounded-sm border border-amber-200/20 pointer-events-none hidden md:block" />
        </div>

        {/* CTA */}
        <motion.div
          className="mt-16 md:mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={() => navigate('/gallery')}
            className="group inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-full font-black text-xs tracking-widest uppercase transition-all duration-500 hover:bg-primary hover:shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.3)]"
          >
            Browse Full Gallery
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default GalleryTeaser;
