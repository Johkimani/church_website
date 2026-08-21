import React, { useState, useEffect } from 'react';
import type { CommunityModule } from '../../context/CommunityDataContext';
import { apiClient } from '../../../../api/axiosInstance';
import { FaPhoneAlt, FaWhatsapp, FaEnvelope, FaHistory, FaFilter, FaChevronDown } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  module: CommunityModule;
  color: string;
  isAdmin?: boolean;
}

interface ArchivedOfficial {
  id: string;
  name: string;
  position: string;
  photo: string | null;
  contact: string | null;
  category: string;
  term_name: string | null;
  term_year: number | null;
}

const MODULE_TO_CATEGORY: Record<string, string> = {
  choir: 'Choir',
  dancers: 'Dancers',
  charismatic: 'Charismatic',
  'st-francis': 'St. Francis',
  youth: 'Mentorship',
};

const Avatar: React.FC<{ name: string; image?: string; size?: 'xs' | 'sm' | 'md' | 'lg' }> = ({ name, image, size = 'md' }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const fontSize = size === 'xs' ? '0.65rem' : size === 'sm' ? '0.85rem' : '1.2rem';

  if (image) {
    return (
      <div className="w-full h-full">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
    );
  }
  return (
    <div
      className="w-full h-full flex items-center justify-center font-bold"
      style={{
        background: 'var(--jumuiya-color)',
        color: 'white',
        fontSize: size === 'lg' ? '2.5rem' : fontSize
      }}
    >
      {initials}
    </div>
  );
};

const CommunityOfficialsTab: React.FC<Props> = ({ module, color }) => {
  const officials = module.officials || [];
  const moduleId = module.id || '';
  const [formerOfficials, setFormerOfficials] = useState<ArchivedOfficial[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [lightboxOfficial, setLightboxOfficial] = useState<ArchivedOfficial | null>(null);

  const _c = (s: string) => color.length > 7 ? color.slice(0, 7) + s : color + s;

  const formatPhone = (phone: string) => phone.replace(/\D/g, '').replace(/^0/, '254');

  useEffect(() => {
    const category = MODULE_TO_CATEGORY[moduleId];
    if (!category) return;

    setLoadingHistory(true);
    apiClient.get('/group-officials/term', {
      params: { only_archived: 'true', category, limit: 100 }
    })
      .then((res) => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setFormerOfficials(data);
      })
      .catch(() => setFormerOfficials([]))
      .finally(() => setLoadingHistory(false));
  }, [moduleId]);

  const filteredHistory = formerOfficials;

  const historyTerms = [...new Set(filteredHistory.map(f => f.term_name || (f.term_year ? `${f.term_year}` : 'Previous Term')))].sort().reverse();

  const allFilteredOfficials = React.useMemo(() => {
    const result: ArchivedOfficial[] = [];
    const terms = historyFilter === 'all' ? historyTerms : [historyFilter];
    for (const term of terms) {
      for (const f of filteredHistory) {
        const t = f.term_name || (f.term_year ? `${f.term_year}` : 'Previous Term');
        if (t === term) result.push(f);
      }
    }
    return result;
  }, [filteredHistory, historyFilter, historyTerms]);

  const lightboxIndex = lightboxOfficial ? allFilteredOfficials.findIndex(f => f.id === lightboxOfficial.id) : -1;

  const navigateLightbox = (dir: number) => {
    if (lightboxIndex < 0) return;
    const next = (lightboxIndex + dir + allFilteredOfficials.length) % allFilteredOfficials.length;
    const nextOff = allFilteredOfficials[next];
    if (nextOff.photo) setLightboxOfficial(nextOff);
  };

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Leadership Team</h1>
          <p className="page-description">Meet the dedicated leaders who guide and serve the {module.title} community.</p>
        </div>
      </div>

      {officials.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
          {officials.map((official: any) => {
            const initials = (official.name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <article
                key={official.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Photo Container */}
                <div className="relative h-48 sm:h-56 bg-gray-100 overflow-hidden">
                  <Avatar name={official.name} image={official.photoUrl || official.photo_url} size="lg" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-5 text-center">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-[var(--jumuiya-color)] transition-colors truncate">
                    {official.name}
                  </h3>
                  <p className="text-sm font-semibold mt-2 px-3 py-1 bg-[var(--jumuiya-color)]/10 text-[var(--jumuiya-color)] rounded-full inline-block">
                    {official.role || official.position}
                  </p>

                  {/* Contact Actions */}
                  <div className="mt-5 pt-4 border-t border-gray-50 flex justify-center gap-3">
                    {(official.phoneNumber || official.phone) && (
                      <>
                        <a
                          href={`tel:${(official.phoneNumber || official.phone).replace(/[^+0-9]/g, '')}`}
                          className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 hover:bg-[var(--jumuiya-color)] hover:text-white flex items-center justify-center transition-all shadow-sm"
                          title="Call Official"
                        >
                          <FaPhoneAlt size={14} />
                        </a>
                        <a
                          href={`https://wa.me/${formatPhone(official.phoneNumber || official.phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-gray-50 text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all shadow-sm"
                          title="WhatsApp"
                        >
                          <FaWhatsapp size={18} />
                        </a>
                      </>
                    )}
                    {official.email && (
                      <a
                        href={`mailto:${official.email}`}
                        className="w-10 h-10 rounded-xl bg-gray-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                        title="Email Official"
                      >
                        <FaEnvelope size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{ background: `${color}06`, border: `1px dashed ${color}25` }}>
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}10` }}>
            <FaHistory style={{ color: `${color}40` }} size={28} />
          </div>
          <p className="font-semibold text-slate-400 text-sm">Leadership team information coming soon.</p>
        </div>
      )}

      {/* Leadership History — collapsible */}
      <div className="mt-20">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="flex items-center gap-3 w-full group cursor-pointer"
        >
          <FaHistory className="opacity-60" />
          <span className="text-xs font-black uppercase tracking-widest">Leadership History</span>
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors ${historyOpen ? 'text-gray-600' : ''}`}>
            {loadingHistory ? 'Loading...' : formerOfficials.length > 0 ? `${formerOfficials.length} past official${formerOfficials.length !== 1 ? 's' : ''}` : 'No records'}
            <FaChevronDown
              size={10}
              className="transition-transform duration-300"
              style={{ transform: historyOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>
        </button>

        <div
          className="overflow-hidden transition-all duration-500"
          style={{
            maxHeight: historyOpen ? '2000px' : '0px',
            opacity: historyOpen ? 1 : 0,
          }}
        >

        {loadingHistory ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
              Loading history...
            </div>
          </div>
        ) : formerOfficials.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed" style={{ background: `${color}08`, borderColor: `${color}20` }}>
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}12` }}>
              <FaHistory style={{ color: `${color}50` }} size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-500 mb-1">No Past Leadership Records</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">When a leadership term ends and officials are archived, their records will appear here for future reference.</p>
          </div>
        ) : (
          <>
            {/* History term filter */}
            {historyTerms.length > 1 && (
              <div className="flex items-center gap-2 mb-6">
                <FaFilter size={12} className="text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setHistoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      historyFilter === 'all'
                        ? 'bg-[var(--jumuiya-color)] text-white border-[var(--jumuiya-color)]'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    All Terms
                  </button>
                  {historyTerms.map(term => (
                    <button
                      key={term}
                      onClick={() => setHistoryFilter(term)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        historyFilter === term
                          ? 'bg-[var(--jumuiya-color)] text-white border-[var(--jumuiya-color)]'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-10">
              {(historyFilter === 'all' ? historyTerms : [historyFilter]).filter(Boolean).map(term => {
                const termOfficials = filteredHistory.filter(f => (f.term_name || (f.term_year ? `${f.term_year}` : 'Previous Term')) === term);
                if (termOfficials.length === 0) return null;
                return (
                  <div key={term} className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-32 flex-shrink-0">
                      <span className="px-4 py-1.5 bg-[var(--jumuiya-color)]/10 text-[var(--jumuiya-color)] font-bold rounded-lg text-sm sticky top-24">
                        {term}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-0 sm:flex sm:flex-wrap sm:gap-4 flex-1">
                      {termOfficials.map(f => (
                        <div
                          key={f.id}
                          onClick={() => f.photo && setLightboxOfficial(f)}
                          className={`bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow ${f.photo ? 'cursor-pointer' : ''}`}
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <Avatar name={f.name} image={f.photo || undefined} size="sm" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{f.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{f.position}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxOfficial && lightboxOfficial.photo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setLightboxOfficial(null)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') navigateLightbox(1);
            else if (e.key === 'ArrowLeft') navigateLightbox(-1);
            else if (e.key === 'Escape') setLightboxOfficial(null);
          }}
          tabIndex={0}
          ref={(el) => el?.focus()}
        >
          <div
            className="relative max-w-sm w-full mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-shrink-0">
              <img
                src={lightboxOfficial.photo}
                alt={lightboxOfficial.name}
                className="w-full aspect-[3/4] object-cover"
              />
              <button
                onClick={() => setLightboxOfficial(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors text-lg font-bold"
              >
                ×
              </button>
              {allFilteredOfficials.length > 1 && (
                <>
                  <button
                    onClick={() => navigateLightbox(-1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors text-lg"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => navigateLightbox(1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors text-lg"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            <div className="p-4 text-center overflow-y-auto">
              <h3 className="font-bold text-gray-900">{lightboxOfficial.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{lightboxOfficial.position}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityOfficialsTab;
