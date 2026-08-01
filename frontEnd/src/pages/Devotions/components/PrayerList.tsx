import { useMemo } from 'react';
import type { Prayer } from '../data/prayerCategories';
import type { Novena } from '../data/novenas';
import { getNovenaCalendar, formatNovenaDates } from '../data/novenaCalendar';

interface PrayerListProps {
  prayers: Prayer[];
  novenas: Novena[];
  onPrayerClick?: (prayer: Prayer) => void;
  onStartNovena?: (novena: Novena) => void;
  className?: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  litanies: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  healing: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  daily: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

// ═══════════════════════════════════════════════════════════
// NOVENA CATEGORIZATION
// ═══════════════════════════════════════════════════════════

type NovenaType = 'marian' | 'saint' | 'devotional';

const NOVENA_TYPE_MAP: Record<string, NovenaType> = {
  'novenas-holy-spirit': 'devotional',
  'novenas-our-lady-perpetual-help': 'marian',
  'novenas-sacred-heart': 'devotional',
  'novenas-saint-jude': 'saint',
  'novenas-saint-joseph': 'saint',
  'novenas-divine-mercy': 'devotional',
  'novenas-lady-of-lourdes': 'marian',
  'novenas-holy-family': 'devotional',
  'novenas-our-lady-of-fatima': 'marian',
  'novenas-saint-teresa': 'saint',
  'novenas-saint-antonius': 'saint',
  'novenas-saint-padre-pio': 'saint',
  'novenas-immaculate-heart': 'marian',
  'novenas-saint-francis': 'saint',
  'novenas-holy-angels': 'devotional',
  'novenas-all-saints': 'devotional',
  'novenas-our-lady-of-victory': 'marian',
  'novenas-christ-the-king': 'devotional',
  'novenas-saint-cecilia': 'saint',
  'novenas-saint-michael': 'saint',
  'novenas-assumption': 'marian',
  'novenas-pentecost': 'devotional',
  'novenas-holy-name-jesus': 'devotional',
  'novenas-annunciation': 'marian',
  'novenas-lady-mount-carmel': 'marian',
  'novenas-mary-magdalene': 'saint',
  'novenas-saint-monica': 'saint',
  'novenas-saint-therese': 'saint',
  'novenas-rosary': 'marian',
  'novenas-holy-souls': 'devotional',
  'novenas-saint-martin': 'saint',
  'novenas-advent': 'devotional',
  'novenas-holy-infant': 'devotional',
  'novenas-christian-unity': 'devotional',
  'novenas-lady-sorrows': 'marian',
};

const NOVENA_INTENTIONS: Record<string, string> = {
  'novenas-holy-spirit': 'Seven Gifts of the Holy Spirit',
  'novenas-our-lady-perpetual-help': 'Marian intercession in all needs',
  'novenas-sacred-heart': 'Consecration to Sacred Heart',
  'novenas-saint-jude': 'Desperate and hopeless causes',
  'novenas-saint-joseph': 'Family protection and work',
  'novenas-divine-mercy': "God's mercy for all souls",
  'novenas-lady-of-lourdes': 'Healing through Mary',
  'novenas-holy-family': 'Family unity and harmony',
  'novenas-our-lady-of-fatima': 'Peace, conversion, and the Rosary',
  'novenas-saint-teresa': 'Prayer and contemplation',
  'novenas-saint-antonius': 'Lost items and special needs',
  'novenas-saint-padre-pio': 'Healing and spiritual warfare',
  'novenas-immaculate-heart': 'Purity and Marian consecration',
  'novenas-saint-francis': 'Peace, poverty, and care for creation',
  'novenas-holy-angels': 'Angel protection and guidance',
  'novenas-all-saints': 'Intercession of all the saints',
  'novenas-our-lady-of-victory': 'Victory over evil',
  'novenas-christ-the-king': "Christ's sovereignty over all",
  'novenas-saint-cecilia': 'Musicians and sacred music',
  'novenas-saint-michael': 'Protection from evil',
  'novenas-assumption': 'Marian devotion and resurrection hope',
  'novenas-pentecost': 'Outpouring of the Holy Spirit',
  'novenas-holy-name-jesus': 'Reverence for the Name of Jesus',
  'novenas-annunciation': "Mary's yes to God",
  'novenas-lady-mount-carmel': 'Scapular devotion and protection',
  'novenas-mary-magdalene': 'Conversion and repentance',
  'novenas-saint-monica': 'Conversion of family members',
  'novenas-saint-therese': 'The Little Way of spiritual childhood',
  'novenas-rosary': 'Marian devotion through the Rosary',
  'novenas-holy-souls': 'Prayers for the faithful departed',
  'novenas-saint-martin': 'Racial justice and healing',
  'novenas-advent': 'Preparation for Christmas',
  'novenas-holy-infant': 'Childlike trust in God',
  'novenas-christian-unity': 'Unity among all Christians',
  'novenas-lady-sorrows': "Compassion through Mary's sorrows",
};

const TYPE_META: Record<NovenaType, { label: string; description: string; icon: string; color: string }> = {
  marian: { label: 'Marian Novenas', description: 'Through the intercession of Our Lady', icon: '\u2766', color: 'text-pink-600' },
  saint: { label: 'Saint Novenas', description: 'With the saints who intercede for us', icon: '\u2720', color: 'text-blue-600' },
  devotional: { label: 'Devotional Novenas', description: 'For special devotions and liturgical seasons', icon: '\u271D', color: 'text-purple-600' },
};

// ═══════════════════════════════════════════════════════════
// DATE STATUS
// ═══════════════════════════════════════════════════════════

type CalendarEvent = ReturnType<typeof getNovenaCalendar>[number];

function getNovenaStatus(novenaId: string, calendar: CalendarEvent[], today: Date) {
  const entry = calendar.find((e) => e.novenaId === novenaId);
  if (!entry) return null;
  const startMs = entry.startDate.getTime();
  const endMs = entry.endDate.getTime();
  const todayMs = today.getTime();
  if (todayMs >= startMs && todayMs <= endMs) {
    const dayIndex = Math.floor((todayMs - startMs) / (24 * 60 * 60 * 1000));
    return { status: 'active' as const, currentDay: dayIndex + 1, progress: ((dayIndex + 1) / 9) * 100, entry };
  }
  if (todayMs < startMs) {
    const daysUntil = Math.ceil((startMs - todayMs) / (24 * 60 * 60 * 1000));
    return { status: 'upcoming' as const, daysUntil, entry };
  }
  return { status: 'past' as const, entry };
}

type NovenaStatus = ReturnType<typeof getNovenaStatus>;

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════

function HeroSpotlight({ novena, status, onStart }: { novena: Novena; status: NonNullable<NovenaStatus>; onStart: () => void }) {
  const active = status.status === 'active';
  const upcoming = status.status === 'upcoming';
  const intention = NOVENA_INTENTIONS[novena.id] || '';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 ${
        active ? 'border-indigo-300 shadow-xl shadow-indigo-100/50' : 'border-amber-200 shadow-lg shadow-amber-100/50'
      }`}
      onClick={onStart}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${novena.color} opacity-[0.07]`} />
      <div className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {active ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Praying Now
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide">
                  Starting {status.daysUntil === 0 ? 'Today' : status.daysUntil === 1 ? 'Tomorrow' : `in ${status.daysUntil} days`}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">{novena.title}</h2>
            {intention && <p className="text-sm text-indigo-600 font-medium">{intention}</p>}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onStart(); }}
            className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              active
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-200'
            }`}
          >
            {active ? 'Pray Now' : 'Begin Novena'}
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-2xl">{novena.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {formatNovenaDates(status.entry.startDate, status.entry.endDate)}
          </span>
          {status.entry.feastDay && (
            <span className="flex items-center gap-1.5 text-indigo-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              {status.entry.feastDay}
            </span>
          )}
          {active && (
            <span className="flex items-center gap-1.5 text-green-600 font-semibold">
              Day {status.currentDay} of 9 — {Math.round(status.progress)}%
            </span>
          )}
        </div>

        {active && (
          <div className="mt-4">
            <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NovenaCard({ novena, onStart, calendarStatus }: { novena: Novena; onStart: () => void; calendarStatus: NovenaStatus }) {
  const intention = NOVENA_INTENTIONS[novena.id] || '';
  const active = calendarStatus?.status === 'active';
  const upcoming = calendarStatus?.status === 'upcoming';
  const past = calendarStatus?.status === 'past';

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 group cursor-pointer ${
        active
          ? 'border-2 border-indigo-300 shadow-lg shadow-indigo-100/60'
          : past
            ? 'border border-slate-100 opacity-60 hover:opacity-80'
            : 'border border-slate-100 hover:shadow-lg hover:border-indigo-200'
      }`}
      style={active ? undefined : { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      onClick={onStart}
    >
      <div className={`h-1.5 bg-gradient-to-r ${novena.color}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
            {novena.title}
          </h3>
          {active && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wide animate-pulse">
              Active
            </span>
          )}
          {upcoming && calendarStatus && 'daysUntil' in calendarStatus && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">
              {calendarStatus.daysUntil === 0 ? 'Today' : calendarStatus.daysUntil === 1 ? 'Tomorrow' : `In ${calendarStatus.daysUntil}d`}
            </span>
          )}
          {past && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">
              Done
            </span>
          )}
        </div>

        {intention && <p className="text-xs text-indigo-500 font-medium mb-1.5">{intention}</p>}

        {calendarStatus?.entry && (
          <p className="text-xs text-slate-400 mb-2">
            {formatNovenaDates(calendarStatus.entry.startDate, calendarStatus.entry.endDate)}
            {calendarStatus.entry.feastDay && <span className="text-indigo-400 ml-1">— {calendarStatus.entry.feastDay}</span>}
          </p>
        )}

        <p className="text-sm text-slate-600 line-clamp-2 mb-4">{novena.description}</p>

        {active && calendarStatus && 'currentDay' in calendarStatus && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <span className="font-semibold text-indigo-700">Day {calendarStatus.currentDay} of 9</span>
              <span>{Math.round(calendarStatus.progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${calendarStatus.progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {!active && (
            <div className="flex gap-1">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-slate-200" />
              ))}
            </div>
          )}
          {active && <div />}
          <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
            {active ? 'Pray Now' : past ? 'Read Again' : 'Start'}
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

function MonthTimeline({ novenaStatuses }: { novenaStatuses: { novena: Novena; status: NovenaStatus }[] }) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  const monthData = useMemo(() => {
    return MONTHS.map((name, i) => {
      const novenasInMonth = novenaStatuses.filter((n) => {
        if (!n.status?.entry) return false;
        const sm = n.status.entry.startDate.getMonth();
        const em = n.status.entry.endDate.getMonth();
        return sm === i || em === i;
      });
      return { name, index: i, novenas: novenasInMonth, hasActive: novenasInMonth.some((n) => n.status?.status === 'active') };
    });
  }, [novenaStatuses]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
      <h3 className="text-sm font-bold text-slate-700 mb-4">Liturgical Year Overview</h3>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {monthData.map((m) => (
          <div
            key={m.name}
            className={`flex-1 min-w-[52px] rounded-lg p-2 text-center transition-all cursor-default ${
              m.index === currentMonth
                ? 'bg-indigo-100 border border-indigo-200'
                : m.novenas.length > 0
                  ? 'bg-slate-50 hover:bg-slate-100'
                  : 'bg-transparent'
            }`}
          >
            <p className={`text-[10px] font-bold mb-1.5 ${m.index === currentMonth ? 'text-indigo-700' : 'text-slate-500'}`}>
              {m.name}
            </p>
            <div className="flex flex-col items-center gap-0.5">
              {m.novenas.slice(0, 3).map((n) => (
                <div
                  key={n.novena.id}
                  className="w-full h-1 rounded-full"
                  style={{ background: n.status?.status === 'active' ? '#22c55e' : '#cbd5e1' }}
                />
              ))}
              {m.novenas.length > 3 && (
                <span className="text-[8px] text-slate-400">+{m.novenas.length - 3}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LITANY + PRAYER CARDS (unchanged)
// ═══════════════════════════════════════════════════════════

function LitanyPreview({ prayer }: { prayer: Prayer }) {
  const sentences = prayer.text.split(/\.\s+/).filter(Boolean);
  const invocations: { name: string; response: string }[] = [];
  const RESPONSES = ['pray for us', 'have mercy on us', 'graciously hear us', 'spare us, O Lord'];

  for (const s of sentences.slice(0, 4)) {
    for (const resp of RESPONSES) {
      const idx = s.toLowerCase().lastIndexOf(resp);
      if (idx > 0) {
        invocations.push({ name: s.substring(0, idx).replace(/,\s*$/, '').trim(), response: s.substring(idx).trim() });
        break;
      }
    }
  }

  const totalCount = sentences.filter((s) => RESPONSES.some((r) => s.toLowerCase().includes(r))).length;
  const wordCount = prayer.text.split(/\s+/).length;
  const readMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          {totalCount} invocations
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[10px] font-medium">
          ~{readMin} min read
        </span>
      </div>
      <div className="space-y-0 bg-slate-50/50 rounded-lg p-3">
        {invocations.map((inv, i) => (
          <div key={i} className="flex items-center gap-2 py-1">
            <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
            <span className="text-xs text-slate-700 font-medium flex-1 truncate">{inv.name}</span>
            <span className="text-[11px] text-emerald-600 italic whitespace-nowrap">{inv.response}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrayerCard({ prayer, onClick, compact = false }: { prayer: Prayer; onClick?: (p: Prayer) => void; compact?: boolean }) {
  const style = CATEGORY_STYLES[prayer.category] || CATEGORY_STYLES.daily;
  const isLitany = prayer.category === 'litanies';
  const isHealing = prayer.category === 'healing';
  const isDaily = prayer.category === 'daily';
  const wordCount = prayer.text.split(/\s+/).length;
  const readMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      className="bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
      onClick={() => onClick?.(prayer)}
    >
      {/* Subtle top accent for healing/daily */}
      {(isHealing || isDaily) && (
        <div className={`h-1 ${isHealing ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} />
      )}
      <div className={compact ? 'p-4' : 'p-5'}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className={`font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors ${compact ? 'text-sm' : ''}`}>
            {prayer.title}
          </h3>
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}>
            {isLitany ? 'Litany' : prayer.category.charAt(0).toUpperCase() + prayer.category.slice(1)}
          </span>
        </div>
        {prayer.intention && <p className="text-xs text-slate-400 mb-2">{prayer.intention}</p>}
        {isLitany && !compact ? (
          <LitanyPreview prayer={prayer} />
        ) : (
          <>
            <p className={`text-sm text-slate-600 leading-relaxed ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
              {prayer.text.substring(0, compact ? 120 : 200)}{prayer.text.length > (compact ? 120 : 200) ? '...' : ''}
            </p>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ~{readMin} min
              </span>
              <span className="text-slate-200">|</span>
              <span className="text-[10px] text-slate-400 font-medium">{wordCount} words</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════

export default function PrayerList({ prayers, novenas, onPrayerClick, onStartNovena, className = '' }: PrayerListProps) {
  const litanyPrayers = prayers.filter((p) => p.category === 'litanies');
  const healingPrayers = prayers.filter((p) => p.category === 'healing');
  const dailyPrayers = prayers.filter((p) => p.category === 'daily');
  const hasResults = novenas.length > 0 || litanyPrayers.length > 0 || healingPrayers.length > 0 || dailyPrayers.length > 0;

  const year = new Date().getFullYear();
  const calendar = useMemo(() => getNovenaCalendar(year), [year]);
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  // Compute status for all novenas
  const allStatuses = useMemo(() => {
    return novenas.map((n) => ({ novena: n, status: getNovenaStatus(n.id, calendar, today) }));
  }, [novenas, calendar, today]);

  // Find hero novena (active first, then nearest upcoming)
  const heroNovena = useMemo(() => {
    const active = allStatuses.find((n) => n.status?.status === 'active');
    if (active) return active;
    const upcoming = allStatuses
      .filter((n) => n.status?.status === 'upcoming')
      .sort((a, b) => {
        const aD = a.status && 'daysUntil' in a.status ? a.status.daysUntil : 999;
        const bD = b.status && 'daysUntil' in b.status ? b.status.daysUntil : 999;
        return aD - bD;
      });
    return upcoming[0] || null;
  }, [allStatuses]);

  // Group by category, sorted: active > upcoming > past within each group
  const grouped = useMemo(() => {
    const STATUS_ORDER = { active: 0, upcoming: 1, past: 2 };
    const sortFn = (a: typeof allStatuses[0], b: typeof allStatuses[0]) => {
      const oa = a.status ? STATUS_ORDER[a.status.status] : 2;
      const ob = b.status ? STATUS_ORDER[b.status.status] : 2;
      if (oa !== ob) return oa - ob;
      if (a.status?.entry && b.status?.entry) return a.status.entry.startDate.getTime() - b.status.entry.startDate.getTime();
      return 0;
    };
    return {
      marian: allStatuses.filter((n) => NOVENA_TYPE_MAP[n.novena.id] === 'marian').sort(sortFn),
      saint: allStatuses.filter((n) => NOVENA_TYPE_MAP[n.novena.id] === 'saint').sort(sortFn),
      devotional: allStatuses.filter((n) => NOVENA_TYPE_MAP[n.novena.id] === 'devotional').sort(sortFn),
    };
  }, [allStatuses]);

  if (!hasResults) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-100" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No prayers found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">Try adjusting your search or category filter.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-10 ${className}`}>
      {/* ═══════════════════════════════════════════════════════ */}
      {/* WHAT IS A NOVENA?                                      */}
      {/* ═══════════════════════════════════════════════════════ */}
      {novenas.length > 0 && (
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm text-slate-500 hover:text-indigo-600 transition-colors select-none">
            <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            What is a Novena?
          </summary>
          <div className="mt-3 bg-white rounded-xl border border-slate-100 p-5 text-sm text-slate-600 leading-relaxed" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
            <p className="mb-2">
              A <strong className="text-slate-800">novena</strong> is a nine-day period of prayer rooted in Catholic tradition, 
              modeled after the Apostles' nine days of prayer between Ascension and Pentecost. The word comes from the 
              Latin <em className="text-indigo-600">novem</em>, meaning nine.
            </p>
            <p className="mb-2">
              Each day carries a specific prayer and intention, building toward a spiritual goal — healing, conversion, 
              deeper devotion, or intercession for a particular need. Many novenas are tied to feast days, beginning 
              nine days before the celebration.
            </p>
            <p>
              You can begin a novena at any time, even outside its liturgical season. Track your progress daily, and 
              return each day for the next prayer in the series.
            </p>
          </div>
        </details>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO SPOTLIGHT                                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      {novenas.length > 0 && heroNovena && heroNovena.status && (
        <HeroSpotlight novena={heroNovena.novena} status={heroNovena.status} onStart={() => onStartNovena?.(heroNovena.novena)} />
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* NOVENA CATEGORIES                                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      {novenas.length > 0 && (
        <>
          {(['marian', 'saint', 'devotional'] as const).map((type) => {
            const items = grouped[type];
            if (items.length === 0) return null;
            const meta = TYPE_META[type];
            const activeInGroup = items.filter((n) => n.status?.status === 'active').length;
            const upcomingInGroup = items.filter((n) => n.status?.status === 'upcoming').length;
            return (
              <section key={type}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xl ${meta.color}`}>{meta.icon}</span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{meta.label}</h2>
                    <p className="text-xs text-slate-500">
                      {meta.description}
                      {activeInGroup > 0 && <span className="ml-2 text-green-600 font-semibold">{activeInGroup} active</span>}
                      {upcomingInGroup > 0 && <span className="ml-2 text-amber-600 font-semibold">{upcomingInGroup} soon</span>}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map(({ novena, status }) => (
                    <NovenaCard key={novena.id} novena={novena} calendarStatus={status} onStart={() => onStartNovena?.(novena)} />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Month Timeline */}
          <MonthTimeline novenaStatuses={allStatuses} />
        </>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* LITANIES                                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      {litanyPrayers.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4 p-4 bg-blue-50/60 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              L
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-800">Litanies</h2>
              <p className="text-xs text-slate-500">Solemn prayers of invocation and response — {litanyPrayers.length} litanies available</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {litanyPrayers.map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} onClick={onPrayerClick} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HEALING PRAYERS                                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      {healingPrayers.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4 p-4 bg-emerald-50/60 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              +
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-800">Healing Prayers</h2>
              <p className="text-xs text-slate-500">Prayers for body, mind, and spirit — {healingPrayers.length} prayers available</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {healingPrayers.map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} onClick={onPrayerClick} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* DAILY PRAYERS                                         */}
      {/* ═══════════════════════════════════════════════════════ */}
      {dailyPrayers.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4 p-4 bg-amber-50/60 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">
              /
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-800">Daily Catholic Prayers</h2>
              <p className="text-xs text-slate-500">Essential prayers for every day — {dailyPrayers.length} prayers available</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dailyPrayers.map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} onClick={onPrayerClick} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
