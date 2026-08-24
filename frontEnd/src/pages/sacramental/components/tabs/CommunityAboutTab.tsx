import React from "react";
import { useNavigate } from "react-router-dom";
import type { CommunityModule } from "../../context/CommunityDataContext";
import {
  FaCalendarDay,
  FaClock,
  FaMapMarkerAlt,
  FaArrowRight,
  FaUserFriends,
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
  onQuickLink?: (tab: 'officials' | 'activities' | 'channels' | 'tshirts' | 'members' | 'suggestions') => void;
}

export default function CommunityAboutTab({ module, color, onNavigateBack, onQuickLink }: Props) {
  const navigate = useNavigate();

  const image = module.image_url || COMMUNITY_IMAGES[module.id] || COMMUNITY_IMAGES.choir;

  // Keep the intro short — two sentences is plenty on a phone.
  const intro = (module.about || module.description || "").trim();

  const schedules = (module.practiceSchedules || []).slice(0, 4);

  // A couple of leaders is enough here; the Officials tab has the full list.
  const leaders = (module.officials || []).slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16">
      {/* Back */}
      <button
        onClick={onNavigateBack}
        className="mt-4 mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <FaArrowRight className="rotate-180" size={11} /> All communities
      </button>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden shadow-md">
        <img src={image} alt={module.title} className="w-full h-36 sm:h-48 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">{module.title}</h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1 line-clamp-2">{module.description}</p>
        </div>
      </div>

      {/* Who we are */}
      {intro && (
        <section className="mt-5">
          <h2 className="text-base font-bold text-slate-800 mb-1.5">Who we are</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{intro}</p>
        </section>
      )}

      {/* When we meet */}
      {schedules.length > 0 && (
        <section className="mt-5">
          <h2 className="text-base font-bold text-slate-800 mb-2">When we meet</h2>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden">
            {schedules.map((s) => (
              <div key={s.id} className="px-3.5 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
                <span className="font-semibold text-slate-800 min-w-[84px] inline-flex items-center gap-1.5">
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
          {!schedules.length && module.meetingSchedule && (
            <p className="text-sm text-slate-600">{module.meetingSchedule}</p>
          )}
        </section>
      )}

      {/* Leaders */}
      {leaders.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-800">Our leaders</h2>
            <button
              onClick={() => onQuickLink?.("officials")}
              className="text-xs font-semibold hover:underline"
              style={{ color }}
            >
              See all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {leaders.map((o) => (
              <div key={o.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <p className="text-sm font-semibold text-slate-800 truncate">{o.name}</p>
                <p className="text-xs text-slate-500 mt-0.5" style={{ color }}>{o.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Join */}
      <section className="mt-6 rounded-2xl p-5 text-white" style={{ background: color }}>
        <h2 className="text-base font-bold">Want to join us?</h2>
        <p className="text-sm text-white/90 mt-1 leading-relaxed">
          New members are always welcome — no experience needed, just come as you are.
        </p>
        <button
          onClick={() => navigate(`/community/${module.id}/join`)}
          className="mt-3 inline-flex items-center gap-2 bg-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-transform active:scale-[0.98]"
          style={{ color }}
        >
          <FaUserFriends size={14} /> Join {module.title.replace(/^St\.?\s*/i, "")}
          <FaArrowRight size={12} />
        </button>
      </section>

      <p className="text-center text-xs text-slate-400 mt-8">
        Questions? Talk to any of our members after Sunday Mass.
      </p>
    </div>
  );
}
