import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityData } from './context/CommunityDataContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { motion, useInView } from 'framer-motion';
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
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  FaUserPlus,
} from 'lucide-react';

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

const CATEGORY_MAP: Record<string, string> = {
  choir: 'music',
  dancers: 'music',
  charismatic: 'prayer',
  'st-francis': 'outreach',
  youth: 'outreach',
  mentorship: 'prayer',
};

const MINISTRY_FACTS = [
  { fact: 'Active ministries', value: 6 },
  { fact: 'Weekly gatherings', value: 6 },
  { fact: 'Parish members', value: 200 },
];

const TESTIMONIALS = [
  { name: 'Sr. Alice', role: 'Choir Leader', text: 'Singing together has strengthened my faith in ways I never imagined.' },
  { name: 'Br. Kevin', role: 'Youth Chair', text: 'Our youth community is where friendships and faith grow side by side.' },
  { name: 'Sr. Grace', role: 'Charismatic Lead', text: 'The prayer sessions have transformed my spiritual journey completely.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
} as const;

const cardVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.96 },
  show: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 70, damping: 14 },
  },
} as const;

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);
  return { count, ref };
}

const AnimatedCounter: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center px-6">
      <div className="text-4xl md:text-5xl font-black text-white tracking-tight">
        {count}
        {value >= 100 ? '+' : ''}
      </div>
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200/80 mt-2">
        {label}
      </div>
    </div>
  );
};

const Community: React.FC = () => {
  const navigate = useNavigate();
  const { modules, isLoading } = useCommunityData();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'music' | 'prayer' | 'outreach'>('all');
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const { data: myCommunitiesData } = useQuery({
    queryKey: ['my-communities'],
    queryFn: async () => {
      const res = await apiClient.get('/community-enrollment/my-communities');
      return res.data?.communities || [];
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const myCommunities = myCommunitiesData || [];

  const allowedIds = ['choir', 'dancers', 'st-francis', 'charismatic', 'youth', 'mentorship'];
  const activeModules = modules.filter((mod) => allowedIds.includes(mod.id));
  const filtered = filter === 'all' ? activeModules : activeModules.filter((m) => CATEGORY_MAP[m.id] === filter);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#faf8f5]">
        <div className="w-14 h-14 border-[3px] border-stone-200 border-t-amber-700 rounded-full animate-spin mb-5" />
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
          Gathering the family…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#faf8f5] min-h-screen pb-28 text-stone-800 font-sans">
      {/* ── Premium Hero ── */}
      <div className="relative bg-[#0d0906] text-white overflow-hidden">
        {/* Layered warm glows */}
        <div className="absolute -top-32 -right-32 w-[34rem] h-[34rem] rounded-full bg-amber-500/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-1/3 -left-40 w-[30rem] h-[30rem] rounded-full bg-rose-600/15 blur-3xl pointer-events-none" style={{ animation: 'pulse 6s ease-in-out infinite 1s' }} />
        <div className="absolute -bottom-40 left-1/2 w-[36rem] h-[36rem] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" style={{ animation: 'pulse 8s ease-in-out infinite 2s' }} />

        {/* Cross grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8v44M8 30h44' stroke='%23ffffff' stroke-width='1' fill='none' opacity='0.5'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Floating ministry icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[Music, Users, Flame, HeartHandshake, BookOpen, Compass].map((Icon, i) => (
            <div
              key={i}
              className="absolute text-white/5"
              style={{
                left: `${10 + i * 15}%`,
                top: `${15 + (i % 3) * 25}%`,
                animation: `float ${4 + i}s ease-in-out infinite ${i * 0.5}s`,
              }}
            >
              <Icon size={40 + i * 8} />
            </div>
          ))}
        </div>

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

          {/* Quick nav pills */}
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
                    className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-2 text-xs font-semibold text-stone-200 hover:bg-white/15 hover:text-white transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-white/5"
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-300/90 group-hover:text-amber-200 transition-colors" />
                    <span>{mod.title}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#faf8f5] to-transparent pointer-events-none" />
      </div>

      {/* ── Animated Stats Bar ── */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-3xl p-8 flex flex-col md:flex-row items-center justify-around gap-8"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            boxShadow: '0 20px 60px rgba(15,52,96,0.3), 0 0 0 1px rgba(255,255,255,0.05) inset',
          }}
        >
          {MINISTRY_FACTS.map((item, i) => (
            <React.Fragment key={i}>
              <AnimatedCounter value={item.value} label={item.fact} />
              {i < MINISTRY_FACTS.length - 1 && (
                <div className="hidden md:block w-px h-16 bg-white/10" />
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* ── My Communities (logged-in users) ── */}
      {myCommunities.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 md:px-12 mt-12 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-3xl p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', boxShadow: '0 12px 40px rgba(15,52,96,0.2)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <FaUserPlus className="text-amber-300" size={16} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">My Communities</h3>
                  <p className="text-white/50 text-xs">Communities you've joined</p>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {myCommunities.map((c: any) => {
                  const accent = c.theme_color || '#b45309';
                  return (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/community/${c.module_id}`)}
                      className="flex-shrink-0 rounded-2xl p-4 bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all cursor-pointer text-left min-w-[180px]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: accent }}>
                          {c.module_title?.charAt(0) || '?'}
                        </div>
                        <span className="text-white text-sm font-bold truncate">{c.module_title}</span>
                      </div>
                      <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        c.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                        c.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {c.status || 'Pending'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Section Header with Filters ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-16 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-10"
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

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex justify-center gap-2 mb-10 flex-wrap"
        >
          {[
            { key: 'all' as const, label: 'All Ministries', icon: <Sparkles size={13} /> },
            { key: 'music' as const, label: 'Music & Dance', icon: <Music size={13} /> },
            { key: 'prayer' as const, label: 'Prayer & Spirit', icon: <Flame size={13} /> },
            { key: 'outreach' as const, label: 'Service & Outreach', icon: <HeartHandshake size={13} /> },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                filter === cat.key
                  ? 'bg-amber-800 text-white shadow-lg shadow-amber-800/20 scale-105'
                  : 'bg-white text-slate-600 border border-stone-200 hover:border-amber-300 hover:text-amber-800 hover:shadow-md'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* ── Ministry Cards ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={filter}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {filtered.map((mod) => {
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
                {/* Media */}
                <div className="aspect-video relative overflow-hidden bg-stone-100 shrink-0">
                  {image ? (
                    <>
                      <img
                        src={image}
                        alt={mod.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    </>
                  ) : (
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
                      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-2xl" />
                      <div className="absolute -bottom-14 -left-6 w-44 h-44 rounded-full bg-black/20 blur-2xl" />
                      <Icon className="absolute right-4 bottom-4 w-20 h-20 text-white/15" />
                    </div>
                  )}

                  {/* Category badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-slate-700 shadow-lg">
                      <Icon size={10} style={{ color: accent }} />
                      {CATEGORY_MAP[mod.id] || 'ministry'}
                    </span>
                  </div>

                  {/* Accent strip */}
                  <div className="absolute top-0 inset-x-0 h-1.5 z-10" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
                </div>

                {/* Body */}
                <div className="p-6 pt-4 flex flex-col flex-grow">
                  <div
                    className="-mt-10 mb-4 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ring-4 ring-white relative z-10 shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: accent }}
                  >
                    {mod.scheduleLabel || 'Ministry'}
                  </span>

                  <h3 className="mt-2 font-serif text-xl font-bold text-stone-900 leading-snug group-hover:text-stone-950 transition-colors">
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

                  <div className="mt-auto pt-5 border-t border-stone-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-stone-800">Explore ministry</span>
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:translate-x-1 group-hover:bg-stone-900 group-hover:shadow-lg"
                        style={{ background: accent }}
                      >
                        <ArrowRight size={15} />
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/community/${mod.id}/join`); }}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] cursor-pointer"
                      style={{ background: accent }}
                    >
                      Join Now
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-stone-300">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-slate-500 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">No ministries in this category</h3>
            <p className="text-slate-500">Try selecting a different filter above.</p>
          </div>
        )}
      </div>

      {/* ── Testimonial Carousel ── */}
      <div className="max-w-3xl mx-auto px-6 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl p-8 md:p-12 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            boxShadow: '0 20px 60px rgba(15,52,96,0.25)',
          }}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <Star className="text-amber-400 mx-auto mb-4" size={24} />
            <div className="min-h-[120px] flex flex-col items-center justify-center">
              <motion.p
                key={testimonialIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-white/90 font-serif italic text-lg md:text-xl leading-relaxed max-w-lg"
              >
                "{TESTIMONIALS[testimonialIdx].text}"
              </motion.p>
              <motion.div
                key={`author-${testimonialIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mt-4"
              >
                <p className="text-white font-bold text-sm">{TESTIMONIALS[testimonialIdx].name}</p>
                <p className="text-amber-200/70 text-xs font-semibold">{TESTIMONIALS[testimonialIdx].role}</p>
              </motion.div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === testimonialIdx ? 'bg-amber-400 w-6' : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Nav arrows */}
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setTestimonialIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Scripture Footer ── */}
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

      {/* Keyframe animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default Community;
