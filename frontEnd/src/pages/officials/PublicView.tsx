import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaPhoneAlt, FaWhatsapp } from 'react-icons/fa'
import { useSocket } from '../../context/SocketContext'

import apiService from '../../pages/Landing/services/api'
import { UPLOAD_BASE } from '../../api/config'
import { getAvatarForCategory } from './constants/positionInfo'
import OfficialsCardsBackground from '../../components/OfficialsCardsBackground'

const CATEGORY_ORDER = [
  'Executive','Jumuiya Coordinators','Bible Coordinators','Rosary',
  'Pamphlet Managers','Project Managers','Liturgist','Instrument Managers',
  'Choir Officials','Liturgical Dancers','Catechist'
]

const CATEGORY_COLORS: Record<string, string> = {
  'Executive': 'from-purple-600 to-purple-700',
  'Jumuiya Coordinators': 'from-blue-600 to-blue-700',
  'Bible Coordinators': 'from-green-600 to-green-700',
  'Rosary': 'from-pink-600 to-pink-700',
  'Pamphlet Managers': 'from-orange-600 to-orange-700',
  'Project Managers': 'from-indigo-600 to-indigo-700',
  'Liturgist': 'from-cyan-600 to-cyan-700',
  'Choir Officials': 'from-red-600 to-red-700',
  'Instrument Managers': 'from-blue-600 to-blue-700',
  'Liturgical Dancers': 'from-violet-600 to-violet-700',
  'Catechist': 'from-yellow-600 to-yellow-700',
}



export default function PublicView() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const { socket } = useSocket()
  const [data, setData]             = React.useState<any[]>([])
  const [loading, setLoading]       = React.useState(true)
  const [fetchError, setFetchError] = React.useState('')

  React.useEffect(() => { fetchOfficials() }, [])

  React.useEffect(() => {
    if (!socket) {
      // Fallback: poll every 15s for unauthorized/guest viewers
      const interval = setInterval(() => {
        fetchOfficials()
      }, 15000)
      return () => clearInterval(interval)
    }

    const handleUpdate = () => {
      fetchOfficials()
    }

    socket.on('officialsUpdated', handleUpdate)
    return () => {
      socket.off('officialsUpdated', handleUpdate)
    }
  }, [socket])

  async function fetchOfficials() {
    const cached = localStorage.getItem('csa_cache_officials');
    if (cached) {
      try {
        setData(JSON.parse(cached));
        setLoading(false);
      } catch (e) {
        setLoading(true);
      }
    } else {
      setLoading(true);
    }
    setFetchError('')

    try {
      const officials = await apiService.getOfficials();
      setData(officials || [])
    } catch (e) {
      if (!cached) {
        setFetchError((e as Error).message || 'Failed to load officials')
      }
    } finally { setLoading(false) }
  }

  const getPositionRank = (pos: string) => {
    const p = (pos || '').toLowerCase();
    if (p.includes('chairperson') || p.includes('chairman')) return p.includes('vice') ? 2 : 1;
    if (p.includes('secretary')) {
      if (p.includes('organizing') || p.includes('organising')) return 3;
      if (p.includes('assistant') || p.includes('vice')) return 5;
      return 4;
    }
    if (p.includes('treasurer')) return 6;
    if (p.includes('coordinator') || p.includes('manager') || p.includes('liturgist') || p.includes('catechist')) {
       return p.includes('assistant') || p.includes('vice') ? 12 : 11;
    }
    return 100;
  };

  const grouped = React.useMemo(() => {
    const map: Record<string, any[]> = {}
    data
      .filter(d => d.status !== 'archived')
      .forEach(d => { const c = d.category || 'Other'; (map[c] ||= []).push(d) })
    
    Object.keys(map).forEach(c => {
      map[c].sort((a, b) => getPositionRank(a.position) - getPositionRank(b.position));
    });

    return map
  }, [data])

  const EXECUTIVE_TOP_ROW_TITLES = ['chairperson', 'vice chairperson', 'organizing secretary', 'organising secretary', 'treasurer'];

  const getExecutiveTopRow = (officials: any[]) => {
    const selectedIds = new Set<any>();
    const topRow: any[] = [];

    EXECUTIVE_TOP_ROW_TITLES.forEach((title) => {
      const match = officials.find(
        (off: any) =>
          !selectedIds.has(off.id) &&
          (off.position || '').toLowerCase().includes(title)
      );

      if (match) {
        selectedIds.add(match.id);
        topRow.push(match);
      }
    });

    return topRow;
  };

  const renderOfficialCard = (off: any, cat: string) => (
    <article
      key={off.id}
      onClick={() => navigate(`/officials/${off.id}`)}
      className="group bg-white border border-slate-200 rounded-[1.75rem] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
      style={{ width: 'calc(50% - 0.5rem)', maxWidth: '220px' }}
      title={`View ${off.name}'s profile`}
    >
      <div className="relative h-36 sm:h-44 md:h-52 bg-slate-100 overflow-hidden">
        <img
          src={off.photo ? `${UPLOAD_BASE}${off.photo}` : getAvatarForCategory(cat)}
          alt={off.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${CATEGORY_COLORS[cat] || 'from-gray-600 to-gray-700'} opacity-0 group-hover:opacity-25 transition-opacity duration-300`}></div>
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="mx-auto max-w-fit rounded-full bg-slate-950/80 px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.05em] text-white shadow-lg backdrop-blur-md">
            View profile
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 text-center">
        <h3 className="font-bold text-slate-950 text-base sm:text-lg group-hover:text-slate-950 transition-colors truncate">
          {off.name}
        </h3>
        <p className="text-sm font-semibold text-slate-700 mt-2">
          {off.position || off.category}
        </p>

        {off.contact && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex justify-center gap-3">
            <a
              href={`tel:${off.contact.replace(/[^+0-9]/g,'')}`}
              onClick={e => e.stopPropagation()}
              className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 hover:text-white relative overflow-hidden group flex items-center justify-center transition-all shadow-sm"
              title="Call Official"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${CATEGORY_COLORS[cat] || 'from-gray-600 to-gray-700'} opacity-0 group-hover:opacity-100 transition-opacity z-0`}></div>
              <FaPhoneAlt size={14} className="z-10 relative" />
            </a>
            <a
              href={`https://wa.me/${off.contact.replace(/[^+0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="w-10 h-10 rounded-xl bg-gray-50 text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all shadow-sm z-10"
              title="WhatsApp"
            >
              <FaWhatsapp size={18} />
            </a>
          </div>
        )}
      </div>
    </article>
  );

  const renderOfficialsSection = (cat: string, list: any[]) => {
    if (list.length === 0) {
      return (
        <div className="w-full flex justify-center py-8">
          <p className="text-gray-400 text-lg">No members in this category yet.</p>
        </div>
      );
    }

    const renderRow = (items: any[]) => (
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {items.map((off) => renderOfficialCard(off, cat))}
      </div>
    );

    if (cat === 'Executive') {
      const topRow = getExecutiveTopRow(list);
      const remaining = list.filter((off) => !topRow.some((top) => top.id === off.id));

      return (
        <>
          {renderRow(topRow)}
          {remaining.length > 0 && <div className="mt-4">{renderRow(remaining)}</div>}
        </>
      );
    }

    return renderRow(list);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-16">
      {/* Hero Header Section */}
      <div className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-900/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] mb-12">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-72 hero-wave hero-wave-1" />
          <div className="absolute inset-x-0 bottom-8 h-80 hero-wave hero-wave-2" />
          <div className="absolute inset-x-0 bottom-16 h-88 hero-wave hero-wave-3" />
          <div className="absolute inset-x-0 bottom-24 h-96 hero-wave hero-wave-4" />
          <div className="absolute inset-0 bg-slate-950/70" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
          <div className="absolute top-12 -left-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-20 text-center">
          
          <h1
            className="font-bold mb-4 relative z-10 text-white"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.1,
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '-0.03em'
            }}
          >
            Our CSA Officials
          </h1>
          <p className="text-slate-200 text-lg max-w-2xl mx-auto relative z-10">
            Discover the dedicated leaders guiding our Catholic Students Association through faith, service, and spiritual growth.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-2 relative z-10 max-w-4xl mx-auto">
             {CATEGORY_ORDER.map(cat => (
               <button 
                  key={`nav-${cat}`}
                  onClick={() => {
                     const el = document.getElementById(`category-${cat.replace(/\s+/g, '-')}`);
                     if(el) {
                       const y = el.getBoundingClientRect().top + window.pageYOffset - 100;
                       window.scrollTo({top: y, behavior: 'smooth'});
                     }
                  }}
                  className="px-4 py-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 text-white text-sm font-semibold rounded-full hover:border-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-lg"
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="relative max-w-7xl mx-auto px-6 text-slate-800">

          {fetchError ? (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center gap-4">
            <div className="text-sm text-red-700">Unable to load officials: {fetchError}</div>
            <button onClick={fetchOfficials} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-bold">Retry</button>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          CATEGORY_ORDER.map(cat => (
            <section key={cat} id={`category-${cat.replace(/\s+/g, '-')}`} className="mb-16 scroll-mt-24">
              {/* Category Header */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className={`h-1 w-12 bg-gradient-to-r ${CATEGORY_COLORS[cat] || 'from-gray-600 to-gray-700'} rounded`}></div>
                  <h2 className="text-2xl font-bold text-slate-950">{cat}</h2>
                  <div className={`h-1 w-12 bg-gradient-to-l ${CATEGORY_COLORS[cat] || 'from-gray-600 to-gray-700'} rounded`}></div>
                </div>
                <div className="flex justify-center">
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${CATEGORY_COLORS[cat] || 'from-gray-600 to-gray-700'}`}>
                    {(grouped[cat] || []).length} member{(grouped[cat] || []).length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Cards */}
              {renderOfficialsSection(cat, grouped[cat] || [])}
            </section>
          ))
        )}

        {/* View Past Officials */}
        <div className="mt-20 mb-12 flex flex-col items-center">
          <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8"></div>
          <p className="text-slate-400 text-sm font-medium mb-6">Want to see our leadership history?</p>
          <button
            onClick={() => navigate('/officials/history')}
            className="group flex items-center gap-3 px-8 py-4 bg-slate-950 text-white border border-slate-900/40 rounded-2xl shadow-lg hover:shadow-2xl hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 font-bold"
          >
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span>View Past Officials History</span>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
  )
}
