import type { Prayer } from '../data/prayerCategories';

interface PrayerFilterProps {
  filters: { searchQuery: string; selectedCategory: Prayer['category'] | 'all'; selectedIntention?: string };
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  categories: Record<Prayer['category'], { label: string; icon: string; color: string }>;
  categoryCounts: Record<string, number>;
  intentions?: string[];
  intentionCounts?: Record<string, number>;
  className?: string;
}

export default function PrayerFilter({
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  categoryCounts,
  intentions = [],
  intentionCounts = {},
  className = '',
}: PrayerFilterProps) {
  const catEntries = Object.entries(categories) as [Prayer['category'], { label: string; icon: string; color: string }][];

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search prayers, litanies, intentions..."
          value={filters.searchQuery}
          onChange={(e) => onFilterChange('searchQuery', e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        />
        {filters.searchQuery && (
          <button
            onClick={() => onFilterChange('searchQuery', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onFilterChange('selectedCategory', 'all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
            filters.selectedCategory === 'all'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          All ({categoryCounts.all || 0})
        </button>
        {catEntries.map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => onFilterChange('selectedCategory', key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
              filters.selectedCategory === key
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {cfg.label} ({categoryCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Intention filter */}
      {intentions.length > 0 && (
        <select
          value={filters.selectedIntention || ''}
          onChange={(e) => onFilterChange('selectedIntention', e.target.value || undefined)}
          className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
        >
          <option value="">All Intentions</option>
          {intentions.map((int) => (
            <option key={int} value={int}>{int} ({intentionCounts[int] || 0})</option>
          ))}
        </select>
      )}

      {/* Active filters */}
      {filters.searchQuery || filters.selectedCategory !== 'all' || filters.selectedIntention ? (
        <div className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-2.5">
          <div className="flex flex-wrap gap-2">
            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                "{filters.searchQuery}"
                <button onClick={() => onFilterChange('searchQuery', '')} className="hover:text-indigo-900">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {categories[filters.selectedCategory as Prayer['category']]?.label}
                <button onClick={() => onFilterChange('selectedCategory', 'all')} className="hover:text-purple-900">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {filters.selectedIntention && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                {filters.selectedIntention}
                <button onClick={() => onFilterChange('selectedIntention', undefined)} className="hover:text-amber-900">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
          <button onClick={onClearFilters} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap">
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}
