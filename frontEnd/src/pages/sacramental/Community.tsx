import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Quote,
  Calendar,
  Shield,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */

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

const MINISTRY_META: Record<string, { tagline: string; schedule: string; categoryLabel: string; memberCount: string }> = {
  choir: {
    tagline: 'Leading sacred worship through sublime hymns & vocal praise.',
    schedule: 'Tues 6PM & Sat 1PM · Church Hall',
    categoryLabel: 'Liturgical Music & Praise',
    memberCount: '40+',
  },
  dancers: {
    tagline: 'Expressing joyful faith and reverent prayer through sacred choreography.',
    schedule: 'Every Saturday, 4:00 PM · School Compound',
    categoryLabel: 'Sacred Liturgical Dance',
    memberCount: '25+',
  },
  charismatic: {
    tagline: 'Experiencing the transformative power of the Holy Spirit, praise & healing prayer.',
    schedule: 'Every Saturday, 5:00 PM · Parish Hall',
    categoryLabel: 'Holy Spirit Prayer & Adoration',
    memberCount: '60+',
  },
  'st-francis': {
    tagline: "Living Christ's compassion through simplicity, peace & community outreach.",
    schedule: 'Every Sunday, 5:00 PM · LH 21',
    categoryLabel: 'Charity, Peace & Outreach',
    memberCount: '35+',
  },
  youth: {
    tagline: 'Empowering Catholic young adults in friendship, faith & spiritual purpose.',
    schedule: 'Every Sunday after Youth Mass',
    categoryLabel: 'Youth & Fellowship',
    memberCount: '80+',
  },
  mentorship: {
    tagline: 'Walking together in academic, career, and spiritual discipleship.',
    schedule: 'Bi-weekly Fellowship & Guidance',
    categoryLabel: 'Faith & Mentorship',
    memberCount: '30+',
  },
};

const TESTIMONIALS = [
  {
    role: 'Choir Leader',
    initial: 'C',
    color: '#1e3a5f',
    text: "Singing together has strengthened my faith in ways I never imagined. The choir's harmonies lift our prayers to heaven.",
  },
  {
    role: 'Youth Chairperson',
    initial: 'Y',
    color: '#8e44ad',
    text: "Our youth community is where friendships and faith grow side by side. Young people discover their purpose and build lifelong relationships in Christ.",
  },
  {
    role: 'Charismatic Prayer Leader',
    initial: 'P',
    color: '#7c3aed',
    text: "The prayer sessions have transformed my spiritual journey. Experiencing the Holy Spirit in daily life has brought renewal and hope to my walk with God.",
  },
];

const STATS = [
  { icon: Shield, value: '6', label: 'Active Ministries' },
  { icon: Users, value: '270+', label: 'Parish Members' },
  { icon: Calendar, value: '20+', label: 'Events Per Month' },
  { icon: Heart, value: '15+', label: 'Years of Service' },
];

/* ─────────────────────────────────────────────
   Animation Variants
───────────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
} as const;

const cardVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.96 },
  show: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 70, damping: 16 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
} as const;

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */

const Community: React.FC = () => {
  const navigate = useNavigate();
  const { modules, isLoading } = useCommunityData();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'music' | 'prayer' | 'outreach'>('all');
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const ministriesRef = useRef<HTMLDivElement>(null);

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

  const scrollToMinistries = () => {
    ministriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0906]">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/20 animate-ping" />
          <div className="w-16 h-16 border-[3px] border-stone-700 border-t-amber-500 rounded-full animate-spin" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400/70">Gathering the family…</p>
      </div>
    );
  }

  const handleCardClick = (mod: any) => navigate(`/community/${mod.id}`);

  return (
    <div className="w-full bg-[#faf8f5] min-h-screen text-stone-800 font-sans overflow-x-hidden">

      {/* ═══════════════════════════════════════
          HERO — Cinematic full-bleed
      ═══════════════════════════════════════ */}
      <div className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden">

        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&q=80&w=1600')",
          }}
        />

        {/* Layered overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-[#0d0906]" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-violet-900/20" />

        {/* Animated floating light particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-amber-300/30"
              style={{
                width: `${2 + (i % 4)}px`,
                height: `${2 + (i % 4)}px`,
                left: `${(i * 17 + 5) % 95}%`,
                top: `${(i * 23 + 10) % 85}%`,
                animation: `float-particle ${4 + (i % 5)}s ease-in-out ${i * 0.4}s infinite alternate`,
              }}
            />
          ))}
        </div>

        {/* Cross grid subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 8v44M8 30h44' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center flex flex-col items-center">

          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 backdrop-blur-md px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-amber-200 mb-8 shadow-lg shadow-amber-900/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <Sparkles size={11} className="text-amber-300" />
            CSA Groups & Communities
          </motion.span>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] text-balance mb-6"
          >
            <span className="text-white">One Parish,</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 40%, #d97706 100%)' }}
            >
              Many Vocations
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl text-stone-300/90 text-base md:text-xl leading-relaxed mb-10"
          >
            Find your place in the parish family. Each ministry is a living community
            of faith, service, and lifelong friendship — rooted in the love of Christ.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <button
              onClick={scrollToMinistries}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm text-stone-900 shadow-2xl shadow-amber-600/30 transition-all duration-300 hover:shadow-amber-500/40 hover:scale-105 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 60%, #d97706 100%)' }}
            >
              Explore Ministries
              <ChevronDown size={16} className="transition-transform group-hover:translate-y-1" />
            </button>

            {user && myCommunities.length > 0 && (
              <button
                onClick={() => document.getElementById('my-communities-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-bold text-sm text-white border border-white/20 bg-white/8 backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:border-white/35 cursor-pointer"
              >
                <UserPlus size={15} className="text-amber-300" />
                My Communities
              </button>
            )}
          </motion.div>

          {/* Quick ministry pill links */}
          {activeModules.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.42 }}
              className="mt-12 flex flex-wrap justify-center gap-2"
            >
              {activeModules.map((mod) => {
                const Icon = iconFor(mod.id);
                const col = MINISTRY_COLORS[mod.id] || '#b45309';
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleCardClick(mod)}
                    className="group inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 backdrop-blur-sm px-4 py-1.5 text-[11px] font-semibold text-stone-200 hover:bg-white/18 hover:text-white transition-all duration-300 cursor-pointer"
                  >
                    <Icon className="w-3 h-3 transition-colors" style={{ color: col }} />
                    <span>{mod.title}</span>
                    {myCommunityIds.has(mod.id) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10"
          onClick={scrollToMinistries}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">Scroll</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-amber-400/70 animate-bounce" />
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════
          STATS STRIP
      ═══════════════════════════════════════ */}
      <div className="bg-[#0d0906] border-y border-amber-900/20">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-amber-900/25">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  className="flex flex-col items-center text-center gap-2 px-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center mb-1">
                    <Icon size={16} className="text-amber-400" />
                  </div>
                  <span className="text-2xl md:text-3xl font-black text-white tracking-tight">{stat.value}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{stat.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MY COMMUNITIES (if logged in)
      ═══════════════════════════════════════ */}
      {myCommunities.length > 0 && (
        <div id="my-communities-section" className="max-w-6xl mx-auto px-6 md:px-12 pt-14">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f0c08 0%, #1a1007 50%, #0d1a2e 100%)',
              boxShadow: '0 0 0 1px rgba(245,158,11,0.15), 0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* decorative glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />

            <div className="relative z-10 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <UserPlus className="text-amber-400" size={18} />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">My Communities</h3>
                  <p className="text-stone-400 text-xs mt-0.5">Ministries you're part of</p>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
                {myCommunities.map((c: any) => {
                  const col = MINISTRY_COLORS[c.module_id] || '#b45309';
                  return (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/community/${c.module_id}`)}
                      className="group flex-shrink-0 rounded-2xl p-4 bg-white/6 border border-white/8 hover:border-white/20 hover:bg-white/12 transition-all cursor-pointer text-left min-w-[200px]"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md"
                          style={{ background: col }}
                        >
                          {c.module_title?.charAt(0) || '?'}
                        </div>
                        <span className="text-white text-sm font-bold truncate flex-1">{c.module_title}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`inline-block text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${
                          c.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                          c.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {c.status || 'Pending'}
                        </span>
                        <ArrowRight size={13} className="text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          TESTIMONIALS — Above cards
      ═══════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-16 pb-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          variants={fadeUp}
          className="relative rounded-3xl overflow-hidden p-8 md:p-12"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 55%, #0f3460 100%)',
            boxShadow: '0 24px 64px rgba(15,52,96,0.28)',
          }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

          {/* Large decorative quote mark */}
          <div
            className="absolute top-4 left-6 text-9xl font-serif leading-none pointer-events-none select-none opacity-10"
            style={{ color: '#fcd34d' }}
          >
            "
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
              ))}
            </div>

            {/* Quote */}
            <div className="min-h-[90px] flex flex-col items-center justify-center max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.p
                  key={testimonialIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="text-white/90 font-serif italic text-lg md:text-xl leading-relaxed"
                >
                  "{TESTIMONIALS[testimonialIdx].text}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Author */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`author-${testimonialIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 mt-6"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black shadow-md"
                  style={{ background: TESTIMONIALS[testimonialIdx].color }}
                >
                  {TESTIMONIALS[testimonialIdx].initial}
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">{TESTIMONIALS[testimonialIdx].role}</p>
                  <p className="text-white/40 text-xs">Parish Member</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation dots */}
            <div className="flex items-center gap-2 mt-6">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className="transition-all duration-300 rounded-full cursor-pointer"
                  style={{
                    width: i === testimonialIdx ? '24px' : '8px',
                    height: '8px',
                    background: i === testimonialIdx ? t.color : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════
          SECTION DIVIDER + FILTER
      ═══════════════════════════════════════ */}
      <div ref={ministriesRef} className="max-w-6xl mx-auto px-6 md:px-12 pt-16">

        {/* Ornate section header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          variants={fadeUp}
          className="flex flex-col items-center text-center mb-12"
        >
          {/* Decorative divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(to right, transparent, #d97706)' }} />
            <div className="flex items-center gap-2">
              <div className="w-px h-5 bg-amber-500/40" />
              <Heart size={14} className="text-amber-600" />
              <div className="w-px h-5 bg-amber-500/40" />
            </div>
            <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(to left, transparent, #d97706)' }} />
          </div>

          <h2
            className="font-serif text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #92400e 100%)' }}
          >
            Join a Ministry
          </h2>
          <p className="max-w-lg text-slate-500 text-sm md:text-base leading-relaxed">
            Each group is a family within the parish family — open arms, open hearts.
          </p>
          <p className="mt-2 text-[11px] font-semibold tracking-wider text-amber-700/70 uppercase">
            "Let us not give up meeting together" — Hebrews 10:25
          </p>
        </motion.div>

        {/* Premium Filter Bar */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-white shadow-lg shadow-stone-200/80 border border-stone-100">
            {[
              { key: 'all' as const, label: 'All Ministries', icon: <Sparkles size={13} /> },
              { key: 'music' as const, label: 'Music & Dance', icon: <Music size={13} /> },
              { key: 'prayer' as const, label: 'Prayer', icon: <Flame size={13} /> },
              { key: 'outreach' as const, label: 'Outreach', icon: <HeartHandshake size={13} /> },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  filter === cat.key
                    ? 'text-white shadow-md scale-105'
                    : 'text-slate-500 hover:text-stone-800 hover:bg-stone-50'
                }`}
                style={
                  filter === cat.key
                    ? { background: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)', boxShadow: '0 4px 16px rgba(180,83,9,0.35)' }
                    : {}
                }
              >
                <span className={filter === cat.key ? 'text-amber-200' : 'text-amber-600'}>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════
            CARDS — Hanging Plaque Design
        ═══════════════════════════════════════ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={filter}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-2 sm:px-4 pb-16"
        >
          {filtered.map((mod, idx) => {
            const image = mod.saint_image_url || mod.image_url || COMMUNITY_IMAGES[mod.id] || DEFAULT_COMMUNITY_IMAGE;
            const isJoined = myCommunityIds.has(mod.id);
            const modColor = MINISTRY_COLORS[mod.id] || '#7c2d12';
            const Icon = iconFor(mod.id);
            const meta = MINISTRY_META[mod.id] || {
              tagline: mod.description || 'A vibrant community of faith and fellowship.',
              schedule: 'Contact leadership for schedules',
              categoryLabel: 'Parish Ministry',
              memberCount: '10+',
            };

            return (
              <motion.article
                key={mod.id}
                variants={cardVariants}
                onClick={() => handleCardClick(mod)}
                className="group relative cursor-pointer pt-7 pb-2"
                style={{ perspective: '1200px' }}
              >
                {/* ── Realistic Suspension Mechanism ── */}
                <div className="absolute top-0 inset-x-0 flex justify-center items-start pointer-events-none z-30">
                  {/* Center brass peg */}
                  <div
                    className="w-6 h-6 rounded-full shadow-lg flex items-center justify-center border border-amber-200/60"
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #ffd700 0%, #b8860b 60%, #8b6508 100%)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.7)',
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-stone-900/50 shadow-inner" />
                  </div>
                  {/* Left wire */}
                  <div
                    className="absolute top-3 left-1/2 -translate-x-[85px] w-[90px] h-[32px] border-t-2 border-r-2 rounded-tr-3xl -rotate-[22deg] origin-right opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ borderColor: `${modColor}99` }}
                  />
                  {/* Right wire */}
                  <div
                    className="absolute top-3 right-1/2 translate-x-[85px] w-[90px] h-[32px] border-t-2 border-l-2 rounded-tl-3xl rotate-[22deg] origin-left opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ borderColor: `${modColor}99` }}
                  />
                </div>

                {/* ── Main Plaque Body ── */}
                <div
                  className="relative rounded-3xl overflow-hidden bg-white transition-all duration-500 group-hover:-translate-y-4 group-hover:scale-[1.02]"
                  style={{
                    boxShadow: `0 24px 50px -10px ${modColor}28, 0 8px 24px -6px rgba(0,0,0,0.10), 0 0 0 1px ${modColor}20`,
                    transformOrigin: 'top center',
                  }}
                >
                  {/* Top Brass Eyelets */}
                  <div className="absolute top-3 inset-x-8 flex justify-between z-30 pointer-events-none">
                    {[0, 1].map((j) => (
                      <div
                        key={j}
                        className="w-4 h-4 rounded-full border-2 border-white/90 shadow-md"
                        style={{ background: 'radial-gradient(circle at 35% 35%, #ffd700 0%, #b8860b 100%)' }}
                      />
                    ))}
                  </div>

                  {/* Photo */}
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-900">
                    <img
                      src={image}
                      alt={mod.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-transparent" />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `radial-gradient(ellipse at bottom, ${modColor}55 0%, transparent 70%)` }}
                    />

                    {/* Top row badges */}
                    <div className="absolute top-5 inset-x-5 flex justify-between items-start z-20">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xl backdrop-blur-md"
                        style={{
                          background: `linear-gradient(135deg, ${modColor}ee 0%, ${modColor}aa 100%)`,
                          border: '1px solid rgba(255,255,255,0.25)',
                        }}
                      >
                        <Icon size={10} className="text-white" />
                        {meta.categoryLabel}
                      </span>
                      {isJoined && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black text-white bg-emerald-600/90 shadow-xl backdrop-blur-md border border-white/25">
                          <Check size={10} /> Member
                        </span>
                      )}
                    </div>

                    {/* Bottom title area */}
                    <div className="absolute bottom-4 inset-x-5 z-20">
                      <h3 className="text-white font-black text-xl sm:text-2xl leading-tight drop-shadow-md tracking-tight">
                        {mod.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content panel */}
                  <div className="p-6 bg-white space-y-3.5">
                    <p className="text-stone-500 text-xs sm:text-sm leading-relaxed font-medium line-clamp-2">
                      {meta.tagline}
                    </p>

                    {/* Schedule */}
                    <div
                      className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-stone-700"
                      style={{ background: `${modColor}0a`, border: `1px solid ${modColor}18` }}
                    >
                      <Calendar size={12} style={{ color: modColor }} className="shrink-0" />
                      <span className="truncate">{meta.schedule}</span>
                    </div>

                    {/* Footer row */}
                    <div className="pt-1 flex items-center justify-between border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        <Users size={11} className="text-stone-400" />
                        <span className="text-[11px] font-bold text-stone-400">{meta.memberCount} members</span>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider transition-all group-hover:gap-2"
                        style={{ color: modColor }}
                      >
                        Explore <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ground shadow */}
                <div
                  className="mx-auto mt-4 h-3 rounded-full opacity-20 group-hover:opacity-40 transition-all duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse, ${modColor}80 0%, transparent 70%)`,
                    width: '70%',
                    filter: 'blur(5px)',
                  }}
                />
              </motion.article>
            );
          })}
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white rounded-3xl shadow-sm border border-dashed border-stone-200 mb-16"
          >
            <Users className="w-8 h-8 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-500 mb-1">No ministries in this category</h3>
            <p className="text-slate-400 text-sm">Try selecting a different filter above.</p>
          </motion.div>
        )}
      </div>

      {/* ═══════════════════════════════════════
          SCRIPTURE DEVOTIONAL FOOTER
      ═══════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5f0e8 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23b45309'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            {/* Decorative cross ornament */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #d97706)' }} />
              <div className="flex flex-col items-center">
                <div className="w-px h-6 bg-amber-600/50" />
                <div className="w-4 h-px bg-amber-600/50 -mt-3.5" />
              </div>
              <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, #d97706)' }} />
            </div>

            <Quote size={28} className="text-amber-700/40 mx-auto mb-5" />

            <blockquote
              className="font-serif text-xl md:text-2xl leading-relaxed text-stone-700 italic mb-6"
              style={{ borderLeft: '3px solid #d97706', paddingLeft: '1.5rem', textAlign: 'left', maxWidth: '600px', margin: '0 auto 1.5rem' }}
            >
              "For where two or three gather in my name, there am I with them."
            </blockquote>

            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-amber-700/60">
              Matthew 18 : 20
            </p>

            {!user && (
              <motion.div className="mt-10">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-sm text-white shadow-xl shadow-amber-800/20 transition-all duration-300 hover:scale-105 hover:shadow-amber-800/30 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)' }}
                >
                  <UserPlus size={16} />
                  Sign in to Join a Ministry
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Particle animation keyframes */}
      <style>{`
        @keyframes float-particle {
          0%   { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          50%  { opacity: 0.5; }
          100% { transform: translateY(-20px) translateX(8px); opacity: 0.15; }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Community;
