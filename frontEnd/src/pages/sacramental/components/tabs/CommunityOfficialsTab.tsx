import React, { useState } from 'react';
import type { CommunityModule } from '../../context/CommunityDataContext';
import { FaPhoneAlt, FaWhatsapp, FaEnvelope, FaUserTie, FaIdBadge } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  module: CommunityModule;
  color: string;
  isAdmin?: boolean;
}

const LEADER_KEYWORDS = ['chair', 'leader', 'president', 'head', 'coordinator', 'chaplain'];

const CommunityOfficialsTab: React.FC<Props> = ({ module, color }) => {
  const officials = module.officials || [];
  const [flippedId, setFlippedId] = useState<string | null>(null);

  const leader = officials.find((o: any) =>
    LEADER_KEYWORDS.some((k) => (o.role || o.position || '').toLowerCase().includes(k))
  );
  const others = officials.filter((o: any) => o !== leader);

  const formatPhone = (phone: string) => phone.replace(/\D/g, '').replace(/^0/, '254');

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Leadership Team</h1>
          <p className="page-description">Meet the dedicated leaders who guide and serve the {module.title} community.</p>
        </div>
      </div>

      {officials.length > 0 ? (
        <>
          {/* Leader spotlight */}
          {leader && (
            <div
              className="relative rounded-3xl p-8 mb-8 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 50%, ${color}bb 100%)`,
                boxShadow: `0 20px 50px ${color}30`,
              }}
            >
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-black/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div
                  className="w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden shrink-0 shadow-2xl ring-4 ring-white/20"
                >
                  {(leader.photoUrl || leader.photo_url) ? (
                    <img src={leader.photoUrl || leader.photo_url} alt={leader.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/15 text-white text-3xl font-black">
                      {(leader.name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                    <FaUserTie size={10} /> {leader.role || leader.position || 'Leader'}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{leader.name}</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                    {(leader.phoneNumber || leader.phone) && (
                      <a href={`tel:${leader.phoneNumber || leader.phone}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/20 text-white hover:bg-white/30 transition-all backdrop-blur-sm">
                        <FaPhoneAlt size={11} /> Call
                      </a>
                    )}
                    {(leader.phoneNumber || leader.phone) && (
                      <a href={`https://wa.me/${formatPhone(leader.phoneNumber || leader.phone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/80 text-white hover:bg-emerald-500 transition-all backdrop-blur-sm">
                        <FaWhatsapp size={11} /> WhatsApp
                      </a>
                    )}
                    {leader.email && (
                      <a href={`mailto:${leader.email}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-500/80 text-white hover:bg-blue-500 transition-all backdrop-blur-sm">
                        <FaEnvelope size={11} /> Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other officials grid */}
          {others.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {others.map((official: any) => {
                const initials = (official.name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                const isFlipped = flippedId === official.id;
                return (
                  <div
                    key={official.id}
                    className="relative group"
                    style={{ perspective: '1000px', minHeight: '200px' }}
                  >
                    <div
                      className="relative w-full h-full transition-transform duration-500"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      }}
                    >
                      {/* Front */}
                      <div
                        className="absolute inset-0 rounded-2xl p-6 overflow-hidden cursor-pointer"
                        style={{
                          backfaceVisibility: 'hidden',
                          background: 'white',
                          border: `1px solid ${color}15`,
                          boxShadow: `0 2px 12px ${color}08`,
                        }}
                        onClick={() => setFlippedId(isFlipped ? null : official.id)}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                        <div className="flex items-start gap-4 mt-1">
                          <div
                            className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-lg transition-transform group-hover:scale-105"
                            style={{ border: `3px solid ${color}20` }}
                          >
                            {(official.photoUrl || official.photo_url) ? (
                              <img src={official.photoUrl || official.photo_url} alt={official.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-xl text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                                {initials}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-slate-800 text-base truncate">{official.name}</h3>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg mt-1" style={{ background: `${color}12`, color }}>
                              {official.role || official.position}
                            </span>
                            <p className="text-[10px] text-slate-400 font-semibold mt-2">Tap to reveal contact →</p>
                          </div>
                        </div>
                      </div>

                      {/* Back - Contact strip */}
                      <div
                        className="absolute inset-0 rounded-2xl p-6 overflow-hidden cursor-pointer"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          background: `linear-gradient(135deg, ${color}08 0%, white 100%)`,
                          border: `1px solid ${color}20`,
                          boxShadow: `0 2px 12px ${color}08`,
                        }}
                        onClick={() => setFlippedId(null)}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${color}15` }}>
                            <FaIdBadge size={24} style={{ color }} />
                          </div>
                          <h3 className="font-black text-slate-800 text-base">{official.name}</h3>
                          <div className="flex gap-2 flex-wrap justify-center">
                            {(official.phoneNumber || official.phone) && (
                              <a href={`tel:${official.phoneNumber || official.phone}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105" style={{ background: `${color}15`, color }}>
                                <FaPhoneAlt size={11} /> Call
                              </a>
                            )}
                            {(official.phoneNumber || official.phone) && (
                              <a href={`https://wa.me/${formatPhone(official.phoneNumber || official.phone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 transition-all hover:scale-105">
                                <FaWhatsapp size={11} /> WhatsApp
                              </a>
                            )}
                            {official.email && (
                              <a href={`mailto:${official.email}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 transition-all hover:scale-105">
                                <FaEnvelope size={11} /> Email
                              </a>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold">← Tap to flip back</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{ background: `${color}06`, border: `1px dashed ${color}25` }}>
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}10` }}>
            <FaUserTie style={{ color: `${color}40` }} size={28} />
          </div>
          <p className="font-semibold text-slate-400 text-sm">Leadership team information coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default CommunityOfficialsTab;
