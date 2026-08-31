import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CommunityModule } from "../../context/CommunityDataContext";
import {
  FaCalendarDay,
  FaClock,
  FaMapMarkerAlt,
  FaArrowRight,
  FaUserFriends,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaMusic,
  FaHeart,
  FaImages,
  FaCalendarAlt,
  FaVideo,
} from "react-icons/fa";

const COMMUNITY_IMAGES: Record<string, string> = {
  choir: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
  dancers: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
  charismatic: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800',
  'st-francis': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800',
  youth: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
  mentorship: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800',
};

interface Props {
  module: CommunityModule;
  color: string;
  onNavigateBack: () => void;
  onQuickLink?: (tab: 'songs' | 'officials' | 'activities' | 'channels' | 'tshirts' | 'members' | 'suggestions') => void;
}

const STATUS_STYLE: Record<string, { bg: string; dot: string }> = {
  Upcoming: { bg: '#eef2ff', dot: '#4f46e5' },
  Ongoing: { bg: '#ecfdf5', dot: '#059669' },
  Completed: { bg: '#f1f5f9', dot: '#64748b' },
};

export default function CommunityAboutTab({ module, color, onNavigateBack, onQuickLink }: Props) {
  const navigate = useNavigate();

  const image = module.saint_image_url || module.image_url || COMMUNITY_IMAGES[module.id] || COMMUNITY_IMAGES.choir;

  const story = (module.story || module.about || "").trim();
  const tagline = (module.description || "").trim();
  const schedules = (module.practiceSchedules || []).slice(0, 4);
  const leaders = (module.officials || []).slice(0, 6);
  const gallery = (module.gallery || []).slice(0, 8);

  // ——— Activities swap / carousel ———
  const activities = useMemo(() => (module.activities || []).slice(0, 10), [module.activities]);
  const [actIndex, setActIndex] = useState(0);
  useEffect(() => {
    if (activities.length <= 1) return;
    const id = setInterval(() => setActIndex((i) => (i + 1) % activities.length), 6000);
    return () => clearInterval(id);
  }, [activities.length]);
  useEffect(() => setActIndex(0), [activities.length]);
  const act = activities[actIndex % Math.max(activities.length, 1)];

  const fmtDate = (d?: string) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  };

  const shortName = module.title.replace(/^(St\.?\s+)+/i, "").trim() || module.title;
  const joinLabel = `Join ${shortName}`;

  const statusStyle = act ? STATUS_STYLE[act.status!] || STATUS_STYLE.Upcoming : undefined;

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16">
      {/* Back */}
      <button
        onClick={onNavigateBack}
        className="mt-4 mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <FaArrowRight className="rotate-180" size={11} /> All communities
      </button>

      {/* ——— Hero ——— */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-slate-900/10">
        <img src={image} alt={module.title} className="w-full h-52 sm:h-72 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
            style={{ background: color }}
          >
            <FaHeart size={10} /> Our Community
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-sm">
            {module.title}
          </h1>
          {tagline && <p className="mt-1.5 text-sm sm:text-base text-white/85 max-w-xl line-clamp-2 leading-relaxed">{tagline}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {leaders.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white">
                <FaUsers size={11} /> {leaders.length} Official{leaders.length > 1 ? "s" : ""}
              </span>
            )}
            {schedules.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-semibold text-white">
                <FaClock size={11} /> {schedules.length} Practice{module.scheduleLabel ? ` · ${module.scheduleLabel}` : ""}
              </span>
            )}
            <button
              onClick={() => navigate(`/community/${module.id}/join`)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold shadow hover:shadow-lg transition-shadow"
              style={{ color }}
            >
              <FaUserFriends size={12} /> {joinLabel}
            </button>
          </div>
        </div>
      </div>

      {/* ——— Our Story ——— */}
      {story && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <span className="h-4 w-1 rounded-full" style={{ background: color }} />
            Our story
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{story}</p>
        </section>
      )}

      {/* ——— Choir Songbook Highlight Banner (Choir Only) ——— */}
      {module.id === 'choir' && (
        <section className="mt-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider text-blue-200">
                <FaMusic size={10} /> Mass Repertoire & Sheet Music
              </span>
              <h3 className="text-lg font-black text-white">Choir Digital Songbook</h3>
              <p className="text-xs text-blue-200/85 max-w-md">
                Browse Sunday hymns, Marian songs, offertory & communion pieces with zoomable sheet music & extracted lyrics.
              </p>
            </div>
            <button
              onClick={() => onQuickLink?.('songs')}
              className="px-5 py-2.5 rounded-xl bg-white text-blue-950 font-black text-xs shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2 flex-shrink-0"
            >
              Open Songbook <FaArrowRight size={11} />
            </button>
          </div>
        </section>
      )}

      {/* ——— Activities swap card ——— */}
      {activities.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full" style={{ background: color }} />
              Activities
            </h2>
            <button
              onClick={() => onQuickLink?.("activities")}
              className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
              style={{ color }}
            >
              See all <FaArrowRight size={10} />
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
            {act ? (
              <div key={act.id} className="p-5 animate-fade">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: statusStyle!.bg, color: statusStyle!.dot }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusStyle!.dot }} />
                    {act.status || "Upcoming"}
                  </span>
                  {act.date && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <FaCalendarAlt size={11} /> {fmtDate(act.date)}
                    </span>
                  )}
                </div>
                <h3 className="mt-2.5 text-lg font-bold text-slate-800 leading-snug">{act.title}</h3>
                {act.description && <p className="mt-1 text-sm text-slate-600 leading-relaxed line-clamp-3">{act.description}</p>}
              </div>
            ) : (
              <p className="p-5 text-sm text-slate-500">No activities listed yet.</p>
            )}

            {activities.length > 1 && (
              <>
                <button
                  onClick={() => setActIndex((i) => (i - 1 + activities.length) % activities.length)}
                  className="absolute top-1/2 -translate-y-1/2 left-2 grid place-items-center h-8 w-8 rounded-full bg-white/90 shadow ring-1 ring-slate-200 text-slate-700 hover:bg-white"
                  aria-label="Previous activity"
                >
                  <FaChevronLeft size={12} />
                </button>
                <button
                  onClick={() => setActIndex((i) => (i + 1) % activities.length)}
                  className="absolute top-1/2 -translate-y-1/2 right-2 grid place-items-center h-8 w-8 rounded-full bg-white/90 shadow ring-1 ring-slate-200 text-slate-700 hover:bg-white"
                  aria-label="Next activity"
                >
                  <FaChevronRight size={12} />
                </button>
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {activities.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActIndex(i)}
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: i === actIndex ? 16 : 6, background: i === actIndex ? color : "#cbd5e1" }}
                      aria-label={`Activity ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ——— When we meet ——— */}
      {schedules.length > 0 && (
        <section className="mt-6">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-2">
            <span className="h-4 w-1 rounded-full" style={{ background: color }} />
            {module.scheduleLabel || "When we meet"}
          </h2>
          <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden shadow-sm">
            {schedules.map((s) => (
              <div key={s.id} className="px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
                <span className="font-bold text-slate-800 min-w-[84px] inline-flex items-center gap-1.5">
                  <FaCalendarDay size={12} style={{ color }} />
                  {s.day}
                </span>
                <span className="text-slate-500 inline-flex items-center gap-1.5">
                  <FaClock size={12} className="text-slate-400" />
                  {s.startTime}–{s.endTime}
                </span>
                {s.location && (
                  <span className="text-slate-500 inline-flex items-center gap-1.5 text-xs">
                    <FaMapMarkerAlt size={12} className="text-slate-400" />
                    {s.location}
                  </span>
                )}
              </div>
            ))}
          </div>
          {module.meetingSchedule && schedules.length === 0 && (
            <p className="mt-2 text-sm text-slate-600">{module.meetingSchedule}</p>
          )}
        </section>
      )}

      {/* ——— Gallery strip ——— */}
      {gallery.length > 0 && (
        <section className="mt-6">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-2">
            <span className="h-4 w-1 rounded-full" style={{ background: color }} />
            <FaImages size={14} style={{ color }} /> Moments
          </h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {gallery.map((g, i) => (
              <div key={i} className="relative shrink-0 h-28 w-36 rounded-xl overflow-hidden shadow-sm group">
                <img src={g.url} alt={g.caption || ""} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {g.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent px-2 pb-1 pt-5">
                    <p className="text-[10px] font-semibold text-white line-clamp-1">{g.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ——— Join CTA ——— */}
      <section
        className="mt-6 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      >
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="absolute right-16 bottom-0 h-16 w-16 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <FaMusic size={16} />
            <FaHeart size={16} className="text-white/80" />
          </div>
          <h2 className="mt-2 text-lg font-extrabold">Become part of {shortName}</h2>
          <p className="mt-1 text-sm text-white/90 leading-relaxed">
            New members are always welcome — no experience needed, just come as you are.
          </p>
          <button
            onClick={() => navigate(`/community/${module.id}/join`)}
            className="mt-4 inline-flex items-center gap-2 bg-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg transition-transform active:scale-[0.98] hover:-translate-y-0.5"
            style={{ color }}
          >
            <FaUserFriends size={15} /> {joinLabel}
            <FaArrowRight size={12} />
          </button>
        </div>
      </section>

      <p className="text-center text-xs text-slate-400 mt-8">
        Questions? Talk to any of our members after Sunday Mass. ·{" "}
        <button
          onClick={() => onQuickLink?.("suggestions")}
          className="inline-flex items-center gap-1 font-semibold hover:underline"
          style={{ color }}
        >
          <FaVideo size={10} /> Share a suggestion
        </button>
      </p>
    </div>
  );
}
