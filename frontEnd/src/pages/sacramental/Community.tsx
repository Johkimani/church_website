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
  Sparkles,
  Clock,
  Heart,
} from 'lucide-react';

// Icon mapping per module (intentional, not generic stock)
const ICON_MAP: Record<string, React.ElementType> = {
  choir: Music,
  dancers: Compass,
  charismatic: Flame,
  'st-francis': HeartHandshake,
  youth: Users,
  mentorship: BookOpen,
};

const DEFAULT_ICON: React.ElementType = Users;

const iconFor = (id: string): React.ElementType => ICON_MAP[id] || DEFAULT_ICON;

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf8f5]">
        <div className="w-12 h-12 border-[3px] border-stone-200 border-t-amber-700 rounded-full animate-spin mb-5" />
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
          Gathering the family…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#faf8f5] min-h-screen pb-28 text-stone-800 font-sans">
      {/* ══════════ Hero ══════════ */}
      <div className="relative bg-[#0d0906] text-white overflow-hidden">
        {/* Layered warm glows */}
        <div className="absolute -top-32 -right-32 w-[34rem] h-[34rem] rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-40 w-[30rem] h-[30rem] rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 left-1/2 w-[36rem] h-[36rem] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        {/* Subtle cross grid */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8v44M8 30h44' stroke='%23ffffff' stroke-width='1' fill='none' opacity='0.5'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 md:px-12 pt-28 pb-32 md:pt-36 md:pb-40 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-200"
          >
            <Sparkles size={12} className="text-amber-300" />
            CSA Groups & Communities
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-6 font-serif text-4xl md:text-6xl font-bold tracking-tight text-balance"
          >
            Our Ministries
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mx-auto mt-5 max-w-2xl text-stone-300 text-base md:text-lg leading-relaxed"
          >
            Find your place in the parish family. Each ministry is a community of
            faith, service, and friendship — explore one and get involved.
          </motion.p>

          {activeModules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="mt-9 flex flex-wrap justify-center gap-2.5"
            >
              {activeModules.map((mod) => {
                const Icon = iconFor(mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => navigate(`/community/${mod.id}`)}
                    className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-2 text-xs font-semibold text-stone-200 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-300/90 group-hover:text-amber-200 transition-colors" />
                    <span>{mod.title}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Smooth bleed into the page */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#faf8f5] to-transparent pointer-events-none" />
      </div>

      {/* ══════════ Section Heading ══════════ */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 -mt-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-12"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400/70" />
            <Heart size={13} className="text-amber-600" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400/70" />
          </div>
          <h2 className="mt-4 font-serif text-2xl md:text-3xl font-bold text-stone-900">
            Choose your community
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600 leading-relaxed">
            Every ministry is open to all — no experience required. Tap a card to
            learn more and get involved.
          </p>
        </motion.div>

        {/* ══════════ Cards Grid ══════════ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {activeModules.map((mod) => {
            const accent = mod.color || '#b45309';
            const Icon = iconFor(mod.id);
            const image = mod.saint_image_url || mod.image_url;

            return (
              <motion.article
                key={mod.id}
                variants={cardVariants}
                onClick={() => navigate(`/community/${mod.id}`)}
                className="group relative flex flex-col bg-white rounded-[1.75rem] border border-stone-100 shadow-[0_1px_3px_rgba(28,25,23,0.06)] hover:shadow-[0_28px_50px_-28px_rgba(28,25,23,0.45)] transition-all duration-300 ease-out overflow-hidden cursor-pointer hover:-translate-y-1.5"
              >
                {/* Media / fallback */}
                <div className="aspect-video relative overflow-hidden bg-stone-100 shrink-0">
                  {image ? (
                    <>
                      <img
                        src={image}
                        alt={mod.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: accent }}>
                      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
                      <div className="absolute -bottom-14 -left-6 w-44 h-44 rounded-full bg-black/20 blur-2xl" />
                      <Icon className="absolute -right-3 -bottom-5 w-24 h-24 text-white/20" />
                    </div>
                  )}

                  {/* Accent signature strip */}
                  <div className="absolute top-0 inset-x-0 h-1.5 z-10" style={{ backgroundColor: accent }} />
                </div>

                {/* Body */}
                <div className="p-6 pt-4 flex flex-col flex-grow">
                  {/* Overlapping icon tile */}
                  <div
                    className="-mt-10 mb-4 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ring-4 ring-white relative z-10 shrink-0"
                    style={{ backgroundColor: accent }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: accent }}
                  >
                    {mod.scheduleLabel || 'Ministry'}
                  </span>

                  <h3 className="mt-2 font-serif text-xl font-bold text-stone-900 leading-snug">
                    {mod.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600 line-clamp-3 flex-grow">
                    {mod.description}
                  </p>

                  {mod.meetingSchedule && (
                    <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Clock size={13} className="shrink-0" style={{ color: accent }} />
                      <span className="truncate">{mod.meetingSchedule}</span>
                    </p>
                  )}

                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-stone-100">
                    <span className="text-sm font-bold text-stone-800">Explore ministry</span>
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:translate-x-1 group-hover:bg-stone-900"
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
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-slate-500 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">No ministries found</h3>
            <p className="text-slate-500">
              We couldn't find any active ministry modules at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Quiet closing line */}
      <div className="max-w-xl mx-auto px-6 mt-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="h-px w-10 bg-stone-300" />
          <Sparkles size={12} className="text-amber-500" />
          <span className="h-px w-10 bg-stone-300" />
        </div>
        <p className="text-slate-500 font-serif italic text-lg leading-relaxed">
          "For where two or three gather in my name, there am I with them."
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">
          Matthew 18:20
        </p>
      </div>
    </div>
  );
};

export default Community;
