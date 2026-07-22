import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityData } from './context/CommunityDataContext';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Music,
  Users,
  Compass,
  Flame,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';

// Icon mapping per module (intentional, not generic stock)

const ICON_MAP: Record<string, React.ReactNode> = {
  choir: <Music className="w-5 h-5" />,
  dancers: <Compass className="w-5 h-5" />,
  charismatic: <Flame className="w-5 h-5" />,
  'st-francis': <HeartHandshake className="w-5 h-5" />,
  youth: <Users className="w-5 h-5" />,
  mentorship: <BookOpen className="w-5 h-5" />,
};

const DEFAULT_ICON = <Users className="w-5 h-5" />;

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
} as const;

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 80, damping: 16 },
  },
} as const;

const Community: React.FC = () => {
  const navigate = useNavigate();
  const { modules, isLoading } = useCommunityData();

  const allowedIds = ['choir', 'dancers', 'st-francis', 'charismatic', 'youth', 'mentorship'];
  const activeModules = modules.filter((mod) => allowedIds.includes(mod.id));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
        <p className="text-stone-500 font-semibold tracking-wide">Loading ministries...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-stone-50 min-h-screen pb-28 text-stone-800 font-sans">
      {/* ══════════ Header ══════════ */}
      <div className="relative bg-gradient-to-b from-stone-900 to-stone-800 text-white pt-24 pb-20 px-6 md:px-12 overflow-hidden">
        {/* Soft warm accent */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300/90 bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20 inline-block"
          >
            CSA Groups & Communities
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl md:text-5xl font-extrabold mt-5 mb-4 tracking-tight"
          >
            Our Ministries
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-stone-300 max-w-2xl text-base leading-relaxed"
          >
            Find your place in the parish family. Each ministry is a community of faith,
            service, and friendship — explore one and get involved.
          </motion.p>
        </div>
      </div>

      {/* ══════════ Cards Grid ══════════ */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 -mt-12 relative z-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {activeModules.map((mod) => {
            const accent = mod.color || '#b45309';
            const icon = ICON_MAP[mod.id] || DEFAULT_ICON;
            const image = mod.saint_image_url || mod.image_url;

            return (
              <motion.article
                key={mod.id}
                variants={item}
                onClick={() => navigate(`/community/${mod.id}`)}
                className="group relative flex flex-col bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-400 ease-out overflow-hidden cursor-pointer hover:-translate-y-1.5"
              >
                {/* Image / fallback */}
                <div className="h-48 relative overflow-hidden shrink-0">
                  {image ? (
                    <img
                      src={image}
                      alt={mod.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${accent}26, ${accent}0d)`,
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                        style={{ backgroundColor: accent }}
                      >
                        {icon}
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/10 to-transparent" />

                  {/* Icon chip */}
                  <div
                    className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: accent }}
                  >
                    {icon}
                  </div>

                  <div className="absolute bottom-3 left-5 right-5">
                    <h3 className="text-lg font-bold text-white leading-snug drop-shadow">
                      {mod.title}
                    </h3>
                    <p className="mt-3 text-stone-600 text-[15px] leading-relaxed flex-grow">
                      {mod.description}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-stone-500 text-sm leading-relaxed mb-5 flex-grow">
                    {mod.description}
                  </p>

                  <div
                    className="mt-auto flex items-center justify-between pt-4 border-t border-stone-100"
                  >
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: accent }}
                    >
                      {mod.scheduleLabel || 'Ministry'}
                    </span>
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform duration-300 group-hover:translate-x-1"
                      style={{ backgroundColor: accent }}
                    >
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {activeModules.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-stone-300">
            <h3 className="text-xl font-bold text-stone-500 mb-2">No ministries found</h3>
            <p className="text-stone-400">We couldn't find any active ministry modules at the moment.</p>
          </div>
        )}
      </div>

      {/* Quiet closing line */}
      <p className="max-w-xl mx-auto px-6 mt-16 text-center text-stone-400 font-serif italic text-sm">
        “For where two or three gather in my name, there am I with them.” — Matthew 18:20
      </p>
    </div>
  );
};

export default Community;
