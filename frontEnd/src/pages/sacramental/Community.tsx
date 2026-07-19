import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityData } from './context/CommunityDataContext';
import { motion } from 'framer-motion';
import { Music, Users, Compass, Flame, HeartHandshake, BookOpen, ArrowUpRight } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  choir: <Music className="w-5 h-5" />,
  dancers: <Compass className="w-5 h-5" />,
  charismatic: <Flame className="w-5 h-5" />,
  'st-francis': <HeartHandshake className="w-5 h-5" />,
  youth: <Users className="w-5 h-5" />,
  mentorship: <BookOpen className="w-5 h-5" />,
};
const DEFAULT_ICON = <Users className="w-5 h-5" />;

// Per-ministry character so the layout feels composed, not generated
const MOOD: Record<string, { tint: string; kicker: string }> = {
  choir: { tint: '#7c2d12', kicker: 'Voices raised in praise' },
  dancers: { tint: '#9a3412', kicker: 'Bodies that pray' },
  charismatic: { tint: '#b45309', kicker: 'Spirit-led prayer' },
  'st-francis': { tint: '#92400e', kicker: 'Simplicity & mercy' },
  youth: { tint: '#a16207', kicker: 'Walk alongside the young' },
  mentorship: { tint: '#854d0e', kicker: 'One life at a time' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
} as const;

const item = {
  hidden: { y: 24, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 90, damping: 18 } },
} as const;

const Community: React.FC = () => {
  const navigate = useNavigate();
  const { modules, isLoading } = useCommunityData();

  const allowedIds = ['choir', 'dancers', 'st-francis', 'charismatic', 'youth', 'mentorship'];
  const activeModules = modules.filter((mod) => allowedIds.includes(mod.id));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf8f5]">
        <div className="w-10 h-10 border-4 border-amber-700/15 border-t-amber-700 rounded-full animate-spin mb-4" />
        <p className="text-stone-500 font-medium">Gathering our ministries…</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#faf8f5] min-h-screen pb-28 text-stone-800 font-sans">
      {/* Hand-torn paper edge at top */}
      <div className="h-2 bg-[repeating-linear-gradient(135deg,#7c2d12_0_14px,#9a3412_14px_28px)] opacity-90" />

      {/* Editorial header */}
      <header className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-amber-700 text-[11px] font-bold uppercase tracking-[0.32em] mb-5"
        >
          St. Thomas Aquinas · CSA
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="font-serif text-5xl md:text-6xl font-bold text-stone-900 leading-[1.05] tracking-tight"
        >
          Ministries that make
          <br />
          <span className="italic text-amber-800">this parish a home.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14 }}
          className="mt-6 text-stone-600 text-base md:text-lg leading-relaxed max-w-xl mx-auto"
        >
          We are more than a Sunday crowd. These are the small, faithful communities
          where students become family — singing, serving, praying, and growing together.
        </motion.p>
        <div className="mt-8 flex items-center justify-center gap-3 text-stone-400">
          <span className="h-px w-12 bg-stone-300" />
          <span className="text-xs italic font-serif">{activeModules.length} living communities</span>
          <span className="h-px w-12 bg-stone-300" />
        </div>
      </header>

      {/* Composed masonry-ish list */}
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          {activeModules.map((mod, i) => {
            const accent = MOOD[mod.id]?.tint || mod.color || '#7c2d12';
            const kicker = MOOD[mod.id]?.kicker || 'Parish community';
            const icon = ICON_MAP[mod.id] || DEFAULT_ICON;
            const image = mod.saint_image_url || mod.image_url;
            const flip = i % 2 === 1;

            return (
              <motion.article
                key={mod.id}
                variants={item}
                onClick={() => navigate(`/community/${mod.id}`)}
                className="group relative bg-white rounded-sm border border-stone-200/70 shadow-[0_10px_40px_-18px_rgba(60,40,20,0.25)] overflow-hidden cursor-pointer hover:shadow-[0_24px_60px_-22px_rgba(60,40,20,0.4)] transition-shadow duration-500"
              >
                {/* taped corner */}
                <span
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-200/40 border border-amber-200/30 rotate-1 z-10 pointer-events-none"
                  aria-hidden
                />
                <div className={`flex flex-col ${flip ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
                  {/* Image / colour block */}
                  <div className="relative sm:w-2/5 h-52 sm:h-auto min-h-[14rem] shrink-0 overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={mod.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: `linear-gradient(140deg, ${accent}, ${accent}cc)` }}
                      >
                        <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
                          {icon}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 p-7 sm:p-9 flex flex-col">
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.22em] mb-3"
                      style={{ color: accent }}
                    >
                      {kicker}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                      {mod.title}
                    </h3>
                    <p className="mt-3 text-stone-600 text-[15px] leading-relaxed flex-grow">
                      {mod.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-stone-500 text-sm font-medium">
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: accent }}
                        >
                          {icon}
                        </span>
                        {mod.scheduleLabel || 'Meet with us'}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-transform duration-300 group-hover:translate-x-0.5"
                        style={{ color: accent }}
                      >
                        Visit
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {activeModules.length === 0 && (
          <div className="text-center py-20 border border-dashed border-stone-300 rounded-sm bg-white/60">
            <p className="text-stone-500 font-serif italic text-lg">No ministries to show just yet.</p>
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
