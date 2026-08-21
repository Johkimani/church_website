import React, { useState, useEffect } from 'react';
import type { CommunityModule } from '../../context/CommunityDataContext';
import { apiClient } from '../../../../api/axiosInstance';
import { FaPhoneAlt, FaWhatsapp, FaEnvelope, FaHistory, FaFilter } from 'react-icons/fa';
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

  const filteredHistory = formerOfficials.filter(f => {
    if (historyFilter === 'all') return true;
    return f.category === historyFilter;
  });

  const historyTerms = [...new Set(filteredHistory.map(f => f.term_name || (f.term_year ? `${f.term_year}` : 'Previous Term')))].sort().reverse();

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Leadership Team</h1>
          <p className="page-description">Meet the dedicated leaders who guide and serve the {module.title} community.</p>
        </div>
      </div>

      {officials.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {officials.map((official: any) => {
            const initials = (official.name || '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <article
                key={official.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.35rem)] xl:w-[calc(25%-1.5rem)] max-w-[320px] border border-gray-100"
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

      {/* Leadership History — always shown */}
      <div className="mt-20">
        <div className="flex items-center gap-4 mb-8 opacity-60">
          <FaHistory />
          <span className="text-xs font-black uppercase tracking-widest">Leadership History</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {loadingHistory ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
              Loading history...
            </div>
          </div>
        ) : formerOfficials.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: `${color}04`, border: `1px dashed ${color}15` }}>
            <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}08` }}>
              <FaHistory style={{ color: `${color}30` }} size={20} />
            </div>
            <p className="text-gray-400 text-sm font-medium">No past leadership records yet.</p>
            <p className="text-gray-300 text-xs mt-1">When a leadership term ends, past officials will appear here.</p>
          </div>
        ) : (
          <>
            {/* History filter */}
            {formerOfficials.length > 0 && (
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
                    All Groups
                  </button>
                  {[...new Set(formerOfficials.map(f => f.category))].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setHistoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        historyFilter === cat
                          ? 'bg-[var(--jumuiya-color)] text-white border-[var(--jumuiya-color)]'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-10">
              {historyTerms.map(term => (
                <div key={term} className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-32 flex-shrink-0">
                    <span className="px-4 py-1.5 bg-[var(--jumuiya-color)]/10 text-[var(--jumuiya-color)] font-bold rounded-lg text-sm sticky top-24">
                      {term}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 flex-1">
                    {filteredHistory.filter(f => (f.term_name || (f.term_year ? `${f.term_year}` : 'Previous Term')) === term).map(f => (
                      <div key={f.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow min-w-[200px]">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Avatar name={f.name} image={f.photo || undefined} size="sm" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{f.name}</h4>
                          <p className="text-xs text-gray-500">{f.position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityOfficialsTab;
