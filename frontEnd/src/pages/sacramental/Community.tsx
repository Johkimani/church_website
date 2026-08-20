import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityData } from './context/CommunityDataContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Music,
  Users,
  Compass,
  Flame,
  HeartHandshake,
  BookOpen,
  Sparkles,
  Heart,
  Star,
  UserPlus,
  Check,
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

const MINISTRY_COLORS: Record<string, string> = {
  choir: '#1e3a5f',
  dancers: '#db2777',
  charismatic: '#7c3aed',
  'st-francis': '#047857',
  youth: '#8e44ad',
  mentorship: '#6d28d9',
};

const COMMUNITY_IMAGES: Record<string, string> = {
  choir: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
  dancers: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
  charismatic: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800',
  'st-francis': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800',
  youth: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
  mentorship: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800',
};
const DEFAULT_COMMUNITY_IMAGE = 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&q=80&w=800';

const CATEGORY_MAP: Record<string, string> = {
  choir: 'music',
  dancers: 'music',
  charismatic: 'prayer',
  'st-francis': 'outreach',
  youth: 'outreach',
  mentorship: 'prayer',
};

const TESTIMONIALS = [
  { role: 'Choir Leader', text: 'Singing together has strengthened my faith in ways I never imagined. The choir\'s harmonies lift our prayers to heaven.' },
  { role: 'Youth Chair', text: 'Our youth community is where friendships and faith grow side by side. It\'s a place where young people discover their purpose and build lifelong relationships in Christ.' },
  { role: 'Charismatic Prayer Group Leader', text: 'The prayer sessions have transformed my spiritual journey completely. Experiencing the Holy Spirit in daily life has brought renewal and hope to my walk with God.' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
} as const;

const cardVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.97 },
  show: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 80, damping: 16 } },
} as const;

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
  const myCommunityIds = new Set(myCommunities.map((c: any) => c.module_id));

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
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">Gathering the family…</p>
      </div>
    );
  }

  const handleCardClick = (mod: any) => {
    navigate(`/community/${mod.id}`);
  };

  return (
    <div className="w-full bg-[#faf8f5] min-h-screen pb-28 text-stone-800 font-sans">
      {/* ── Hero ── */}
      <div className="relative bg-[#0d0906] text-white overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[34rem] h-[34rem] rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-40 w-[30rem] h-[30rem] rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 left-1/2 w-[36rem] h-[36rem] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8v44M8 30h44' stroke='%23ffffff' stroke-width='1' fill='none' opacity='0.5'/%3E%3C/svg%3E\")",
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
            faith, service, and friendship.
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
                    onClick={() => handleCardClick(mod)}
                    className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-2 text-xs font-semibold text-stone-200 hover:bg-white/15 hover:text-white transition-all duration-300 cursor-pointer hover:scale-105"
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-300/90 group-hover:text-amber-200 transition-colors" />
                    <span>{mod.title}</span>
                    {myCommunityIds.has(mod.id) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Joined" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#faf8f5] to-transparent pointer-events-none" />
      </div>

      {/* ── My Communities ── */}
      {myCommunities.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 md:px-12 mt-12 relative z-20">
          <div className="rounded-3xl p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', boxShadow: '0 12px 40px rgba(15,52,96,0.2)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <UserPlus className="text-amber-300" size={16} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">My Communities</h3>
                <p className="text-white/50 text-xs">Communities you've joined</p>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {myCommunities.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/community/${c.module_id}`)}
                  className="flex-shrink-0 rounded-2xl p-4 bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all cursor-pointer text-left min-w-[180px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: c.theme_color || '#b45309' }}>
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
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Section Header + Filters ── */}
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
          <h2 className="mt-4 font-serif text-2xl md:text-3xl font-bold text-stone-900">Choose your community</h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600 leading-relaxed">
            Tap a card to join and become part of the family.
          </p>
        </motion.div>

        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {[
            { key: 'all' as const, label: 'All', icon: <Sparkles size={13} /> },
            { key: 'music' as const, label: 'Music & Dance', icon: <Music size={13} /> },
            { key: 'prayer' as const, label: 'Prayer', icon: <Flame size={13} /> },
            { key: 'outreach' as const, label: 'Outreach', icon: <HeartHandshake size={13} /> },
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
        </div>

        {/* ── Cards ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={filter}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-2 sm:px-4"
        >
          {filtered.map((mod, idx) => {
            const image = mod.saint_image_url || mod.image_url || COMMUNITY_IMAGES[mod.id] || DEFAULT_COMMUNITY_IMAGE;
            const isJoined = myCommunityIds.has(mod.id);
            const modColor = MINISTRY_COLORS[mod.id] || '#7c2d12';
            const Icon = iconFor(mod.id);

            // Meaningful sub-descriptions & schedules for hanging plaques
            const subtitleMap: Record<string, { tagline: string; schedule: string; categoryLabel: string }> = {
              choir: {
                tagline: 'Leading sacred worship and mass through sublime hymns & vocal praise.',
                schedule: 'Tues 6PM & Sat 1PM @ Church Hall',
                categoryLabel: 'Liturgical Music & Praise',
              },
              dancers: {
                tagline: 'Expressing joyful faith and reverent prayer through sacred choreography.',
                schedule: 'Every Saturday, 4:00 PM @ School Compound',
                categoryLabel: 'Sacred Liturgical Dance',
              },
              charismatic: {
                tagline: 'Experiencing the transformative power of the Holy Spirit, praise & healing prayer.',
                schedule: 'Every Saturday, 5:00 PM @ Parish Hall',
                categoryLabel: 'Holy Spirit Prayer & Adoration',
              },
              'st-francis': {
                tagline: 'Living Christ\'s compassion through simplicity, peace & community outreach.',
                schedule: 'Every Sunday, 5:00 PM @ LH 21',
                categoryLabel: 'Charity, Peace & Outreach',
              },
              youth: {
                tagline: 'Empowering Catholic young adults in friendship, faith & spiritual purpose.',
                schedule: 'Every Sunday after Youth Mass',
                categoryLabel: 'Youth & Fellowship',
              },
              mentorship: {
                tagline: 'Walking together in academic, career, and spiritual discipleship.',
                schedule: 'Bi-weekly Fellowship & Guidance',
                categoryLabel: 'Faith & Mentorship',
              },
            };

            const info = subtitleMap[mod.id] || {
              tagline: mod.description || 'A vibrant community of faith and fellowship.',
              schedule: mod.meetingSchedule || 'Contact leadership for schedules',
              categoryLabel: 'Parish Ministry',
            };

            const tiltAngle = idx % 2 === 0 ? '-1.5deg' : '1.5deg';

            return (
              <motion.article
                key={mod.id}
                variants={cardVariants}
                onClick={() => handleCardClick(mod)}
                className="group relative cursor-pointer pt-6 pb-2"
                style={{ perspective: '1200px' }}
              >
                {/* ── Realistic Suspension Mechanism ── */}
                <div className="absolute top-0 inset-x-0 flex justify-center items-start pointer-events-none z-30">
                  {/* Brass wall mount peg / hook */}
                  <div
                    className="w-5 h-5 rounded-full shadow-lg flex items-center justify-center -mt-1 border border-amber-200/60"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #ffd700 0%, #b8860b 60%, #8b6508 100%)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,0.7)',
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-900/50 shadow-inner" />
                  </div>

                  {/* Left & Right suspension wires */}
                  <div
                    className="absolute top-2 left-1/2 -translate-x-[75px] w-[80px] h-[30px] border-t-2 border-r-2 rounded-tr-3xl -rotate-[22deg] origin-right pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ borderColor: `${modColor}88` }}
                  />
                  <div
                    className="absolute top-2 right-1/2 translate-x-[75px] w-[80px] h-[30px] border-t-2 border-l-2 rounded-tl-3xl rotate-[22deg] origin-left pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ borderColor: `${modColor}88` }}
                  />
                </div>

                {/* ── Main Hanging Plaque Body ── */}
                <div
                  className="relative rounded-3xl overflow-hidden bg-white transition-all duration-500 group-hover:-translate-y-3 group-hover:scale-[1.02]"
                  style={{
                    boxShadow: `0 20px 45px -10px ${modColor}30, 0 8px 20px -6px rgba(0,0,0,0.12), 0 0 0 1px ${modColor}25`,
                    transformOrigin: 'top center',
                  }}
                >
                  {/* Top Brass Eyelets on Card Frame */}
                  <div className="absolute top-2 inset-x-8 flex justify-between z-30 pointer-events-none">
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-white/80 shadow-md"
                      style={{ background: 'radial-gradient(circle, #ffd700 0%, #b8860b 100%)' }}
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border-2 border-white/80 shadow-md"
                      style={{ background: 'radial-gradient(circle, #ffd700 0%, #b8860b 100%)' }}
                    />
                  </div>

                  {/* Image Container with Cinematic Height */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-900">
                    <img
                      src={image}
                      alt={mod.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />

                    {/* Rich multi-layer atmospheric overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(ellipse at bottom, ${modColor}50 0%, transparent 75%)` }}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-4 inset-x-4 flex justify-between items-start z-20">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xl backdrop-blur-md"
                        style={{
                          background: `linear-gradient(135deg, ${modColor}ee 0%, ${modColor}bb 100%)`,
                          border: '1px solid rgba(255,255,255,0.3)',
                        }}
                      >
                        <Icon size={11} className="text-white" />
                        {info.categoryLabel}
                      </span>

                      {isJoined && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black text-white bg-emerald-600/90 shadow-xl backdrop-blur-md border border-white/30">
                          <Check size={10} /> Joined
                        </span>
                      )}
                    </div>

                    {/* Title overlay on photo base */}
                    <div className="absolute bottom-3 inset-x-5 z-20">
                      <h3 className="text-white font-black text-xl sm:text-2xl leading-snug drop-shadow-md tracking-tight">
                        {mod.title}
                      </h3>
                    </div>
                  </div>

                  {/* Information & Action Content Section */}
                  <div className="p-6 bg-white space-y-4">
                    {/* Meaningful Spiritual Motto / Tagline */}
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-medium line-clamp-2">
                      {info.tagline}
                    </p>

                    {/* Gathering / Practice Schedule Pill */}
                    <div
                      className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-stone-700"
                      style={{ background: `${modColor}0c`, border: `1px solid ${modColor}18` }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: modColor }} />
                      <span className="truncate">{info.schedule}</span>
                    </div>

                    {/* Bottom CTA Row */}
                    <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                      <span
                        className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                        style={{ color: modColor }}
                      >
                        Explore Ministry <ArrowRight size={13} className="transition-transform group-hover:translate-x-1.5" />
                      </span>
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs transition-transform duration-300 group-hover:scale-110 shadow-md"
                        style={{ background: modColor }}
                      >
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Realistic Hanging Ambient Ground Shadow ── */}
                <div
                  className="mx-auto mt-3 h-3 rounded-full opacity-25 group-hover:opacity-45 group-hover:scale-x-110 transition-all duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse, ${modColor}80 0%, transparent 70%)`,
                    width: '75%',
                    filter: 'blur(4px)',
                  }}
                />
              </motion.article>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-stone-300">
            <Users className="w-6 h-6 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-600 mb-1">No ministries found</h3>
            <p className="text-slate-500 text-sm">Try a different filter.</p>
          </div>
        )}
      </div>

      {/* ── Testimonial Carousel ── */}
      <div className="max-w-3xl mx-auto px-6 mt-20">
        <div
          className="relative rounded-3xl p-8 md:p-12 text-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', boxShadow: '0 20px 60px rgba(15,52,96,0.25)' }}
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <Star className="text-amber-400 mx-auto mb-4" size={24} />
            <div className="min-h-[100px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={testimonialIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/90 font-serif italic text-base md:text-lg leading-relaxed max-w-lg"
                >
                  "{TESTIMONIALS[testimonialIdx].text}"
                </motion.p>
              </AnimatePresence>
              <p className="text-white font-bold text-sm mt-3">{TESTIMONIALS[testimonialIdx].role}</p>
            </div>
            <div className="flex justify-center gap-2 mt-5">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${i === testimonialIdx ? 'bg-amber-400 w-6' : 'bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scripture ── */}
      <div className="max-w-xl mx-auto px-6 mt-16 text-center">
        <p className="text-slate-500 font-serif italic text-lg leading-relaxed">
          "For where two or three gather in my name, there am I with them."
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">Matthew 18:20</p>
      </div>
    </div>
  );
};

export default Community;
