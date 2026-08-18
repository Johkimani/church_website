import React from 'react';
import type { CommunityModule } from '../../context/CommunityDataContext';
import { FaCalendarCheck, FaPhoneAlt, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  module: CommunityModule;
  color: string;
  isAdmin?: boolean;
}

const CommunityOfficialsTab: React.FC<Props> = ({ module, color, isAdmin }) => {
  const officials = module.officials || [];

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Leadership Team</h1>
          <p className="page-description">Meet the dedicated leaders who guide and serve the {module.title} community.</p>
        </div>
      </div>

      {officials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {officials.map((official: any) => {
            const initials = official.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div
                key={official.id}
                className="group relative rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl overflow-hidden"
                style={{
                  background: 'white',
                  border: `1px solid ${color}15`,
                  boxShadow: `0 2px 12px ${color}08`,
                }}
              >
                {/* Subtle gradient accent at top */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                />

                <div className="flex items-start gap-4 mt-1">
                  <div
                    className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-lg transition-transform group-hover:scale-105"
                    style={{ border: `3px solid ${color}20` }}
                  >
                    {(official.photoUrl || official.photo_url) ? (
                      <img src={official.photoUrl || official.photo_url} alt={official.name} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center font-black text-xl text-white"
                        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                      >
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-800 text-base group-hover:text-slate-900 transition truncate">{official.name}</h3>
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg mt-1"
                      style={{ background: `${color}12`, color }}
                    >
                      {official.position}
                    </span>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {(official.phoneNumber || official.phone) && (
                        <a
                          href={`tel:${official.phoneNumber || official.phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
                          style={{ background: `${color}10`, color }}
                        >
                          <FaPhoneAlt size={10} /> Call
                        </a>
                      )}
                      {(official.phoneNumber || official.phone) && (
                        <a
                          href={`https://wa.me/${(official.phoneNumber || official.phone).replace(/\D/g, '').replace(/^0/, '254')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-emerald-600 bg-emerald-50 transition-all hover:scale-105"
                        >
                          <FaWhatsapp size={10} /> WhatsApp
                        </a>
                      )}
                      {official.email && (
                        <a
                          href={`mailto:${official.email}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-blue-600 bg-blue-50 transition-all hover:scale-105"
                        >
                          <FaEnvelope size={10} /> Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl" style={{ background: `${color}06`, border: `1px dashed ${color}25` }}>
          <FaCalendarCheck style={{ color: `${color}40` }} className="mx-auto mb-3" size={40} />
          <p className="font-semibold text-slate-400 text-sm">Leadership team information coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default CommunityOfficialsTab;
