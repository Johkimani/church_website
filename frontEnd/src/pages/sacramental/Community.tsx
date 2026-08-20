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
  X,
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

const COMMUNITY_IMAGES: Record<string, string> = {
  choir: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
  dancers: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
  charismatic: 'https://images.unsplash.com/photo-1550435041-0e521c830db3?auto=format&fit=crop&q=80&w=600',
  'st-francis': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600',
  youth: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=600',
  mentorship: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=600',
};
const DEFAULT_COMMUNITY_IMAGE = 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&q=80&w=600';

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
  const [joinModal, setJoinModal] = useState<{ id: string; title: string; color: string; description: string; saint_image_url?: string; image_url?: string } | null>(null);

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
    if (myCommunityIds.has(mod.id)) {
      navigate(`/community/${mod.id}`);
    } else {
      setJoinModal({
        id: mod.id,
        title: mod.title,
        color: mod.color || '#b45309',
        description: mod.description,
        saint_image_url: mod.saint_image_url || mod.image_url || COMMUNITY_IMAGES[mod.id] || DEFAULT_COMMUNITY_IMAGE,
      });
    }
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((mod) => {
            const image = mod.saint_image_url || mod.image_url || COMMUNITY_IMAGES[mod.id] || DEFAULT_COMMUNITY_IMAGE;
            const isJoined = myCommunityIds.has(mod.id);

            return (
              <motion.article
                key={mod.id}
                variants={cardVariants}
                onClick={() => handleCardClick(mod)}
                className="group relative bg-white rounded-2xl border border-stone-100 shadow-[0_1px_3px_rgba(28,25,23,0.06)] hover:shadow-[0_16px_40px_-16px_rgba(28,25,23,0.35)] transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1"
              >
                {/* Image */}
                <div className="aspect-[16/9] relative overflow-hidden bg-slate-100">
                  <img
                    src={image}
                    alt={mod.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />

                  {/* Joined badge */}
                  {isJoined && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-lg">
                        <Check size={8} /> Joined
                      </span>
                    </div>
                  )}

                  {/* Title on image */}
                  <div className="absolute bottom-0 inset-x-0 p-4 z-10">
                    <h3 className="text-white font-black text-lg leading-tight drop-shadow-md uppercase tracking-tight">{mod.title}</h3>
                  </div>
                </div>
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

      {/* ── Join Gate Modal ── */}
      <AnimatePresence>
        {joinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setJoinModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Image */}
              <div className="relative h-40 overflow-hidden">
                {joinModal.saint_image_url ? (
                  <img src={joinModal.saint_image_url} alt={joinModal.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${joinModal.color}, ${joinModal.color}cc)` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button
                  onClick={() => setJoinModal(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all cursor-pointer"
                >
                   <X size={14} />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-black text-xl drop-shadow-md">{joinModal.title}</h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{joinModal.description}</p>

                <p className="text-slate-700 text-sm font-semibold mb-4 text-center">
                  Would you like to join this community?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setJoinModal(null)}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Not Now
                  </button>
                  <button
                    onClick={() => {
                      setJoinModal(null);
                      navigate(`/community/${joinModal.id}/join`);
                    }}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02] shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    style={{ background: joinModal.color }}
                  >
                     <UserPlus size={13} /> Join Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Community;
