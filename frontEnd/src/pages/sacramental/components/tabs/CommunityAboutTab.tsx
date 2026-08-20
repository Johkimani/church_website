import React, { useState } from "react";
import type { CommunityModule } from "../../context/CommunityDataContext";
import { FaCalendarDay, FaClock, FaChurch, FaHeart, FaUsers, FaDownload, FaStar, FaPrayingHands } from "react-icons/fa";
import '../../../Jumuiya/components/TabsSystem.css';

const COMMUNITY_IMAGES: Record<string, string> = {
  choir: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
  dancers: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800',
  charismatic: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=800',
  'st-francis': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800',
  youth: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
  mentorship: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800',
};
const DEFAULT_COMMUNITY_IMAGE = 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&q=80&w=800';

interface Props {
  module: CommunityModule;
  color: string;
  onNavigateBack: () => void;
  onQuickLink?: (tab: 'officials' | 'activities' | 'channels' | 'tshirts') => void;
}

const CommunityAboutTab: React.FC<Props> = ({ module, color, onQuickLink }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  const gradient = `linear-gradient(135deg, ${color} 0%, ${color}cc 50%, ${color}99 100%)`;
  const darkGradient = `linear-gradient(135deg, ${color} 0%, ${color}ee 40%, ${color}bb 100%)`;
  const lightBg = `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`;

  return (
    <div className="tab-system-content" style={{ "--jumuiya-color": color } as React.CSSProperties}>
      {/* Premium Hero */}
      <div
        className="relative rounded-3xl overflow-hidden mb-8"
        style={{ background: gradient, minHeight: '280px' }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${color}44 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)`,
          }}
        />
        {(module.saint_image_url || module.image_url || COMMUNITY_IMAGES[module.id] || DEFAULT_COMMUNITY_IMAGE) && (
          <div className="absolute inset-0">
            <img
              src={module.saint_image_url || module.image_url || COMMUNITY_IMAGES[module.id] || DEFAULT_COMMUNITY_IMAGE}
              alt={module.title}
              className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded ? 'opacity-30 scale-100' : 'opacity-0 scale-105'}`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        )}
        <div className="relative z-10 px-8 py-14 md:px-14 md:py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white/90 text-xs font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <FaChurch style={{ fontSize: '0.7rem' }} />
            {module.description || "Community Ministry"}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-4 drop-shadow-lg">
            {module.title}
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-xl leading-relaxed font-medium">
            {module.story || module.about || module.description}
          </p>
        </div>
      </div>

      {/* Premium Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: <FaUsers />, label: 'Meetings', value: 'Weekly' },
          { icon: <FaPrayingHands />, label: 'Fellowship', value: 'Prayer' },
          { icon: <FaStar />, label: 'Community', value: module.title.split(' ').slice(0, 2).join(' ') },
        ].map((stat, i) => (
          <div
            key={i}
            className="relative rounded-2xl p-5 text-center overflow-hidden group hover:scale-[1.03] transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${color}10 0%, white 100%)`,
              border: `1px solid ${color}20`,
              boxShadow: `0 4px 20px ${color}08`,
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
              style={{ background: `linear-gradient(135deg, ${color}20, ${color}10)`, color }}
            >
              {stat.icon}
            </div>
            <p className="font-extrabold text-slate-800 text-sm">{stat.value}</p>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Our Story */}
      <div
        className="rounded-2xl p-7 md:p-9 mb-8"
        style={{ background: lightBg, border: `1px solid ${color}15` }}
      >
        <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full" style={{ background: color }} />
          Our Story
        </h2>
        <p className="text-slate-600 leading-relaxed text-[15px] font-medium whitespace-pre-line">
          {module.story || module.about || module.description}
        </p>
        {(module.history_pdf_url || (module as any).pdf_url) && (
          <a
            href={module.history_pdf_url || (module as any).pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.03]"
            style={{ background: color, color: 'white', boxShadow: `0 4px 14px ${color}40` }}
          >
            <FaDownload size={14} /> Download History (PDF)
          </a>
        )}
      </div>

      {/* Mission & Objectives */}
      {module.agenda && module.agenda.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full" style={{ background: color }} />
            Our Mission & Objectives
          </h2>
          <div className="space-y-3">
            {module.agenda.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-2xl transition-all hover:translate-x-1 duration-300"
                style={{
                  background: `linear-gradient(90deg, ${color}08 0%, white 100%)`,
                  border: `1px solid ${color}12`,
                }}
              >
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: 'white' }}
                >
                  {i + 1}
                </span>
                <span className="text-slate-700 font-semibold text-sm leading-relaxed pt-1">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meeting Schedule */}
      <div
        className="rounded-2xl p-7 mb-8"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          boxShadow: `0 8px 30px ${color}30`,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <FaClock className="text-white" size={18} />
          </div>
          <h3 className="text-lg font-black text-white">Meeting Schedule</h3>
        </div>
        <p className="text-white/90 font-semibold text-sm leading-relaxed flex items-center gap-2">
          <FaCalendarDay size={14} className="text-white/70" />
          {module.meetingSchedule || 'Contact parish office for schedule'}
        </p>
      </div>

      {/* Quick Links */}
      {onQuickLink && (
        <div>
          <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full" style={{ background: color }} />
            Quick Links
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { tab: 'officials' as const, icon: <FaUsers />, label: 'Officials' },
              { tab: 'activities' as const, icon: <FaCalendarDay />, label: 'Activities' },
              { tab: 'channels' as const, icon: <FaChurch />, label: 'Channels' },
            ].map(link => (
              <button
                key={link.tab}
                onClick={() => onQuickLink(link.tab)}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl transition-all hover:scale-[1.05] hover:shadow-lg duration-300 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, white 0%, ${color}08 100%)`,
                  border: `1px solid ${color}18`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)`, color }}
                >
                  {link.icon}
                </div>
                <span className="text-xs font-bold text-slate-600">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityAboutTab;
