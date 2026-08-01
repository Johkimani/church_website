import { useState, useMemo } from 'react';
import type { Prayer } from '../data/prayerCategories';
import { PRAYERS } from '../data/prayerCategories';
import { NOVENAS, type Novena } from '../data/novenas';
import { getNovenaCalendar } from '../data/novenaCalendar';
import { usePrayerFilter } from '../hooks/usePrayerFilter';
import PrayerFilter from '../components/PrayerFilter';
import PrayerList from '../components/PrayerList';
import PrayerReader from '../components/PrayerReader';
import NovenaTracker from '../components/NovenaTracker';
import NovenaCalendar from '../components/NovenaCalendar';

const CATEGORIES = {
  novenas: { label: 'Novenas', icon: '9', color: 'bg-purple-100 text-purple-800' },
  litanies: { label: 'Litanies', icon: 'L', color: 'bg-blue-100 text-blue-800' },
  healing: { label: 'Healing', icon: '+', color: 'bg-emerald-100 text-emerald-800' },
  daily: { label: 'Daily', icon: '/', color: 'bg-amber-100 text-amber-800' },
};

type TabKey = 'prayers' | 'calendar';

export default function PrayerModule() {
  const [activeTab, setActiveTab] = useState<TabKey>('prayers');
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [activeNovena, setActiveNovena] = useState<Novena | null>(null);

  const {
    filters,
    updateFilter,
    clearFilters,
    filteredItems,
    categoryCounts,
    uniqueIntentions,
    hasActiveFilters,
  } = usePrayerFilter(PRAYERS);

  // Filter novenas based on search/category
  const filteredNovenas = useMemo(() => {
    return NOVENAS.filter((n) => {
      if (filters.selectedCategory !== 'all' && filters.selectedCategory !== 'novenas') return false;
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        if (
          !n.title.toLowerCase().includes(q) &&
          !n.description.toLowerCase().includes(q) &&
          !n.days.some((d) => d.prayer.text.toLowerCase().includes(q) || d.prayer.intention?.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [filters]);

  const nonNovenaPrayers = filteredItems.filter((p) => p.category !== 'novenas');

  // Count prayers matching each intention
  const intentionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const prayer of PRAYERS) {
      if (prayer.intention) {
        counts[prayer.intention] = (counts[prayer.intention] || 0) + 1;
      }
    }
    // Also count from novena days
    for (const novena of NOVENAS) {
      for (const day of novena.days) {
        if (day.prayer.intention) {
          counts[day.prayer.intention] = (counts[day.prayer.intention] || 0) + 1;
        }
      }
    }
    return counts;
  }, []);

  const handleStartNovenaFromCalendar = (novenaId: string) => {
    const novena = NOVENAS.find((n) => n.id === novenaId);
    if (novena) {
      setActiveNovena(novena);
      setActiveTab('prayers');
    }
  };

  // Compute current/next novena for CTA banner
  const currentNovena = useMemo(() => {
    const year = new Date().getFullYear();
    const calendar = getNovenaCalendar(year);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find active novena first
    const active = calendar.find((e) => {
      const startMs = e.startDate.getTime();
      const endMs = e.endDate.getTime();
      return today.getTime() >= startMs && today.getTime() <= endMs;
    });
    if (active) {
      const novena = NOVENAS.find((n) => n.id === active.novenaId);
      if (novena) return { novena, status: 'active' as const, event: active };
    }

    // Find next upcoming novena
    const upcoming = calendar
      .filter((e) => e.startDate.getTime() > today.getTime())
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];
    if (upcoming) {
      const novena = NOVENAS.find((n) => n.id === upcoming.novenaId);
      if (novena) return { novena, status: 'upcoming' as const, event: upcoming };
    }

    // Fallback to first novena
    return { novena: NOVENAS[0], status: 'fallback' as const, event: null };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pb-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Novenas &amp; Litanies</h1>
          <p className="text-sm text-slate-500 mt-1">Catholic prayers, devotions, and spiritual practices</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-100 mb-8 w-fit" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {([
            { key: 'prayers' as TabKey, label: 'Prayers' },
            { key: 'calendar' as TabKey, label: 'Novenas by Date' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'prayers' ? (
          <>
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Novenas', count: NOVENAS.length, letter: 'N', gradient: 'from-purple-500 to-indigo-500' },
                { label: 'Litanies', count: PRAYERS.filter((p) => p.category === 'litanies').length, letter: 'L', gradient: 'from-blue-500 to-indigo-500' },
                { label: 'Healing', count: PRAYERS.filter((p) => p.category === 'healing').length, letter: 'H', gradient: 'from-emerald-500 to-teal-500' },
                { label: 'Daily', count: PRAYERS.filter((p) => p.category === 'daily').length, letter: 'D', gradient: 'from-amber-500 to-orange-500' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                      {s.letter}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-slate-800">{s.count}</p>
                      <p className="text-xs text-slate-400">{s.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <PrayerFilter
              filters={filters}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
              categories={CATEGORIES}
              categoryCounts={categoryCounts}
              intentions={uniqueIntentions}
              intentionCounts={intentionCounts}
              className="mb-8"
            />

            {/* Prayer list */}
            <PrayerList
              prayers={nonNovenaPrayers}
              novenas={filteredNovenas}
              onPrayerClick={setSelectedPrayer}
              onStartNovena={setActiveNovena}
            />

            {/* CTA banner */}
            {!hasActiveFilters && (
              <div className="mt-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white text-center">
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-3">
                    {currentNovena.status === 'active' 
                      ? 'Pray Today\'s Novena' 
                      : currentNovena.status === 'upcoming'
                        ? 'Coming Soon'
                        : 'Begin Your Prayer Journey'}
                  </h2>
                  <p className="text-indigo-100 mb-6 max-w-xl mx-auto text-sm">
                    {currentNovena.status === 'active' ? (
                      <>The <strong>{currentNovena.event?.title}</strong> is currently active. Join thousands of faithful praying together.</>
                    ) : currentNovena.status === 'upcoming' ? (
                      <>The <strong>{currentNovena.event?.title}</strong> starts soon. Prepare your heart for nine days of focused prayer.</>
                    ) : (
                      <>Start a novena to grow closer to God through nine days of focused prayer, or explore our collection of traditional Catholic litanies and daily prayers.</>
                    )}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => setActiveNovena(currentNovena.novena)}
                      className="bg-white text-indigo-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                      {currentNovena.status === 'active' 
                        ? 'Pray Now' 
                        : currentNovena.status === 'upcoming'
                          ? `Start ${currentNovena.event?.title.replace('Novena to ', '').replace('Novena for ', '')}`
                          : `Start the ${currentNovena.novena.title}`}
                    </button>
                    <button
                      onClick={() => {
                        updateFilter('selectedCategory', 'litanies');
                      }}
                      className="bg-white/15 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/25 transition-colors border border-white/20"
                    >
                      Browse Litanies
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Calendar tab */
          <NovenaCalendar onStartNovena={handleStartNovenaFromCalendar} />
        )}
      </div>

      {/* Novena Tracker Modal */}
      {activeNovena && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl max-h-[95vh] overflow-auto rounded-2xl">
            <NovenaTracker novena={activeNovena} onClose={() => setActiveNovena(null)} />
          </div>
        </div>
      )}

      {/* Prayer Reader Modal */}
      {selectedPrayer && (
        <PrayerReader prayer={selectedPrayer} onClose={() => setSelectedPrayer(null)} />
      )}
    </div>
  );
}
