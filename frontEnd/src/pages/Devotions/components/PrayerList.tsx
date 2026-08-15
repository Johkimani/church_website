import { useMemo, useState } from 'react';
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
  saints: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  healing: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  daily: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

// ═══════════════════════════════════════════════════════════
// JUMUIYA (PARISH GROUPS)
// ═══════════════════════════════════════════════════════════

interface Jumuiya {
  id: string;
  name: string;
  shortName: string;
  patron: string;
  novenaId: string;
  color: string;
}

const JUMUIYAS: Jumuiya[] = [
  { id: 'anthony', name: 'St. Anthony', shortName: 'Anthony', patron: 'novenas-saint-antonius', novenaId: 'novenas-saint-antonius', color: 'from-amber-500 to-yellow-600' },
  { id: 'augustine', name: 'St. Augustine', shortName: 'Augustine', patron: 'novenas-saint-augustine', novenaId: 'novenas-saint-augustine', color: 'from-yellow-500 to-amber-600' },
  { id: 'catherine', name: 'St. Catherine', shortName: 'Catherine', patron: 'novenas-saint-catherine-siena', novenaId: 'novenas-saint-catherine-siena', color: 'from-red-500 to-rose-600' },
  { id: 'dominic', name: 'St. Dominic', shortName: 'Dominic', patron: 'novenas-saint-dominic', novenaId: 'novenas-saint-dominic', color: 'from-blue-500 to-indigo-600' },
  { id: 'elizabeth', name: 'St. Elizabeth', shortName: 'Elizabeth', patron: 'novenas-saint-elizabeth', novenaId: 'novenas-saint-elizabeth', color: 'from-emerald-500 to-teal-600' },
  { id: 'monica', name: 'St. Monica', shortName: 'Monica', patron: 'novenas-saint-monica', novenaId: 'novenas-saint-monica', color: 'from-purple-500 to-violet-600' },
  { id: 'mary-goretti', name: 'St. Mary Goretti', shortName: 'Mary Goretti', patron: 'novenas-saint-mary-goretti', novenaId: 'novenas-saint-mary-goretti', color: 'from-pink-500 to-rose-600' },
];

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
  'novenas-saint-augustine': 'saint',
  'novenas-saint-catherine-siena': 'saint',
  'novenas-saint-dominic': 'saint',
  'novenas-saint-elizabeth': 'saint',
  'novenas-saint-mary-goretti': 'saint',
  'novenas-our-lady-of-guadalupe': 'marian',
  'novenas-holy-cross': 'devotional',
  'novenas-saint-patrick': 'saint',
  'novenas-saint-raphael': 'saint',
  'novenas-saint-clare': 'saint',
  'novenas-immaculate-conception': 'marian',
  'novenas-precious-blood': 'devotional',
  'novenas-saint-michael-archangel': 'saint',
  'novenas-saint-gabriel': 'saint',
  'novenas-saint-ursula': 'saint',
  'novenas-saint-anthony-patron': 'saint',
  'novenas-saint-clement': 'saint',
  'novenas-saint-lucy': 'saint',
  'novenas-saint-barbara': 'saint',
  'novenas-saint-ambrose': 'saint',
  'novenas-saint-nicholas': 'saint',
  'novenas-saint-elizabeth-ann-seton': 'saint',
  'novenas-saint-benedict': 'saint',
  'novenas-saint-hildegard': 'saint',
  'novenas-all-angels': 'saint',
  'novenas-saint-mary-of-egypt': 'saint',
  'novenas-jesus-christ': 'devotional',
  'novenas-holy-rosary': 'marian',
  'novenas-saint-rita': 'saint',
  'novenas-saint-charles-borromeo': 'saint',
  'novenas-saint-cyril-alexandria': 'saint',
  'novenas-saint-bonaventure': 'saint',
  'novenas-saint-francis-xavier': 'saint',
  'novenas-saint-ignatius-loyola': 'saint',
  'novenas-saint-teresa-avila': 'saint',
  'novenas-saint-john-cross': 'saint',
  'novenas-holy-martyrs': 'saint',
  'novenas-saint-helen': 'saint',
  'novenas-saint-joachim-anne': 'saint',
  'novenas-saint-matthew': 'saint',
  'novenas-saint-thomas-apostle': 'saint',
  'novenas-saint-luke': 'saint',
  'novenas-saint-peter-apostle': 'saint',
  'novenas-saint-paul-apostle': 'saint',
  'novenas-saint-james-apostle': 'saint',
  'novenas-saint-andrew-apostle': 'saint',
  'novenas-saint-philip-apostle': 'saint',
  'novenas-saint-simon-apostle': 'saint',
  'novenas-saint-jude-apostle': 'saint',
  'novenas-our-lady-star-evangelization': 'marian',
  'novenas-saint-rose-lima': 'saint',
  'novenas-saint-martin-de-porres': 'saint',
  'novenas-saint-anne': 'saint',
  'novenas-saint-celestine': 'saint',
  'novenas-saint-brendan': 'saint',
  'novenas-saint-kateri': 'saint',
  'novenas-saint-oscar-romero': 'saint',
  'novenas-all-saints-africa': 'saint',
  'novenas-jesus-nazareth': 'devotional',
  'novenas-sacrament-reconciliation': 'devotional',
  'novenas-sacrament-eucharist': 'devotional',
  'novenas-holy-cross-passion': 'devotional',
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
  'novenas-saint-augustine': 'Conversion and wisdom',
  'novenas-saint-catherine-siena': 'Courage and dialogue',
  'novenas-saint-dominic': 'Preaching and truth',
  'novenas-saint-elizabeth': 'Charity and service to the poor',
  'novenas-saint-mary-goretti': 'Purity, forgiveness, and youth',
  'novenas-our-lady-of-guadalupe': 'Conversion and intercession of Our Lady',
  'novenas-holy-cross': 'Faith, courage, and reverence for the Cross',
  'novenas-saint-patrick': 'Faith, evangelization, and protection',
  'novenas-saint-raphael': 'Healing and safe travels',
  'novenas-saint-clare': 'Poverty, purity, and Eucharistic devotion',
  'novenas-immaculate-conception': 'Purity and Marian devotion',
  'novenas-precious-blood': 'Remission of sins and spiritual healing',
  'novenas-saint-michael-archangel': 'Protection from evil and spiritual warfare',
  'novenas-saint-gabriel': 'Communication and God\'s messages',
  'novenas-saint-ursula': 'Patronage of young women and students',
  'novenas-saint-anthony-patron': 'Patron of lost causes and patronage',
  'novenas-saint-clement': 'Patronage of mariners and unity',
  'novenas-saint-lucy': 'Patronage of the blind and eye ailments',
  'novenas-saint-barbara': 'Patronage of miners and protection from storms',
  'novenas-saint-ambrose': 'Patronage of learning and eloquence',
  'novenas-saint-nicholas': 'Patronage of children and generosity',
  'novenas-saint-elizabeth-ann-seton': 'Patronage of Catholic schools and converts',
  'novenas-saint-benedict': 'Patronage of monks and protection from evil',
  'novenas-saint-hildegard': 'Patronage of musicians and healing',
  'novenas-all-angels': 'Angelic protection and intercession',
  'novenas-saint-mary-of-egypt': 'Patronage of penitent sinners',
  'novenas-jesus-christ': 'Deepening Faith',
  'novenas-holy-rosary': 'Marian Consecration',
  'novenas-saint-rita': 'Patronage of impossible causes and abused women',
  'novenas-saint-charles-borromeo': 'Patronage of catechists and seminarians',
  'novenas-saint-cyril-alexandria': 'Patronage of theologians and defense of orthodoxy',
  'novenas-saint-bonaventure': 'Patronage of theologians and Franciscan learning',
  'novenas-saint-francis-xavier': 'Patronage of missionaries and evangelization',
  'novenas-saint-ignatius-loyola': 'Patronage of spiritual exercises and discernment',
  'novenas-saint-teresa-avila': 'Patronage of prayer and contemplation',
  'novenas-saint-john-cross': 'Patronage of mystics and dark nights of the soul',
  'novenas-holy-martyrs': 'Intercession of the martyrs',
  'novenas-saint-helen': 'Patronage of archaeologists and the True Cross',
  'novenas-saint-joachim-anne': 'Patronage of married couples and grandparents',
  'novenas-saint-matthew': 'Patronage of accountants and tax collectors',
  'novenas-saint-thomas-apostle': 'Patronage of builders and doubt turned to faith',
  'novenas-saint-luke': 'Patronage of physicians and artists',
  'novenas-saint-peter-apostle': 'Patronage of the papacy and keys to the kingdom',
  'novenas-saint-paul-apostle': 'Patronage of missionaries and converts',
  'novenas-saint-james-apostle': 'Patronage of pilgrims and Spain',
  'novenas-saint-andrew-apostle': 'Patronage of fishermen and Scotland',
  'novenas-saint-philip-apostle': 'Patronage of evangelization',
  'novenas-saint-simon-apostle': 'Patronage of the poor and tanners',
  'novenas-saint-jude-apostle': 'Patronage of desperate and hopeless causes',
  'novenas-our-lady-star-evangelization': 'Her Intercession',
  'novenas-saint-rose-lima': 'Patronage of Latin America and floral piety',
  'novenas-saint-martin-de-porres': 'Patronage of social justice and the poor',
  'novenas-saint-anne': 'Patronage of grandmothers and married couples',
  'novenas-saint-celestine': 'Patronage of peace and resignation',
  'novenas-saint-brendan': 'Patronage of sailors and travelers',
  'novenas-saint-kateri': 'Patronage of Native Americans and environment',
  'novenas-saint-oscar-romero': 'Patronage of social justice and human rights',
  'novenas-all-saints-africa': 'Intercession of African saints',
  'novenas-jesus-nazareth': 'Spiritual Growth',
  'novenas-sacrament-reconciliation': 'Deepening Faith',
  'novenas-sacrament-eucharist': 'Spiritual Growth',
  'novenas-holy-cross-passion': 'Deepening Faith',
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
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-stone-100 border border-amber-200 cursor-pointer group"
      onClick={onStart}
    >
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(217,119,6,0.15), transparent 60%), radial-gradient(circle at 70% 50%, rgba(217,119,6,0.08), transparent 60%)'
      }} />
      <div className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {active ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Praying Now
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide border border-amber-200">
                  Starting {status.daysUntil === 0 ? 'Today' : status.daysUntil === 1 ? 'Tomorrow' : `in ${status.daysUntil} days`}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-1">{novena.title}</h2>
            {intention && <p className="text-sm text-amber-700/80 font-medium">{intention}</p>}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onStart(); }}
            className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              active
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-600/20'
                : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/20'
            }`}
          >
            {active ? 'Pray Now' : 'Begin Novena'}
          </button>
        </div>

        <p className="text-sm text-stone-500 leading-relaxed mb-5 max-w-2xl">{novena.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className={`flex items-center gap-1.5 font-bold ${
            active ? 'text-emerald-700' : 'text-amber-700'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {formatNovenaDates(status.entry.startDate, status.entry.endDate)}
          </span>
          {status.entry.feastDay && (
            <span className="flex items-center gap-1.5 text-amber-700 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              {status.entry.feastDay}
            </span>
          )}
          {active && (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              Day {status.currentDay} of 9 — {Math.round(status.progress)}%
            </span>
          )}
          {!active && upcoming && 'daysUntil' in status && (
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              Starts {status.daysUntil === 0 ? 'today' : status.daysUntil === 1 ? 'tomorrow' : `in ${status.daysUntil} days`}
            </span>
          )}
        </div>

        {active && (
          <div className="mt-4">
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JumuiyaCard({ jumuiya, novena, status, onStart }: { jumuiya: Jumuiya; novena: Novena; status: NovenaStatus; onStart: () => void }) {
  const active = status?.status === 'active';
  const upcoming = status?.status === 'upcoming';
  const past = status?.status === 'past';
  const intention = NOVENA_INTENTIONS[novena.id] || '';

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatFullDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-stone-200 bg-white hover:border-amber-500/40 transition-all duration-300 cursor-pointer group"
      onClick={onStart}
    >
      <div className={`h-1 bg-gradient-to-r ${jumuiya.color}`} />
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${jumuiya.color} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
            {jumuiya.shortName.split(' ').map(w => w[0]).join('').substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-stone-900 truncate group-hover:text-amber-700 transition-colors">{jumuiya.name}</h3>
            <p className="text-[10px] text-stone-500 truncate">{novena.title.replace('Novena to ', '')}</p>
          </div>
          {active && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200 animate-pulse">
              Active
            </span>
          )}
          {upcoming && status && 'daysUntil' in status && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-200">
              {status.daysUntil === 0 ? 'Today' : `In ${status.daysUntil}d`}
            </span>
          )}
          {past && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold border border-stone-200">
              Completed
            </span>
          )}
        </div>

        {/* Date banner — prominent */}
        {status?.entry && (
          <div className={`rounded-lg p-3 mb-3 border ${
            active ? 'bg-emerald-50 border-emerald-200' :
            upcoming ? 'bg-amber-50 border-amber-200' :
            'bg-stone-100 border-stone-200'
          }`}>
            <div className="flex items-center gap-2">
              <svg className={`w-3.5 h-3.5 flex-shrink-0 ${
                active ? 'text-emerald-700' : upcoming ? 'text-amber-700' : 'text-stone-500'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className={`text-[11px] font-bold ${
                active ? 'text-emerald-700' : upcoming ? 'text-amber-700' : 'text-stone-600'
              }`}>
                {formatDate(status.entry.startDate)} — {formatDate(status.entry.endDate)}
              </span>
            </div>
            {status.entry.feastDay && (
              <p className="text-[10px] text-amber-700/60 mt-1.5 ml-5.5">{status.entry.feastDay}</p>
            )}
          </div>
        )}

        {intention && <p className="text-[11px] text-amber-700/60 mb-2">{intention}</p>}

        {/* Progress for active */}
        {active && status && 'currentDay' in status && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1">
              <span className="font-semibold text-emerald-700">Day {status.currentDay} of 9</span>
              <span>{Math.round(status.progress)}%</span>
            </div>
            <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${status.progress}%` }} />
            </div>
          </div>
        )}

        {/* Countdown for upcoming */}
        {upcoming && status && 'daysUntil' in status && (
          <p className="text-[11px] text-amber-700/70 mb-3">
            Starts {status.daysUntil === 0 ? 'today' : status.daysUntil === 1 ? 'tomorrow' : `in ${status.daysUntil} days`} — {formatFullDate(status.entry.startDate)}
          </p>
        )}

        {/* Days completed for past */}
        {past && (
          <p className="text-[11px] text-stone-500 mb-3">
            Novena completed — {formatFullDate(status.entry.startDate)}
          </p>
        )}

        <div className="flex items-center justify-between">
          {!active && !upcoming && (
            <div className="flex gap-1">
              {Array.from({ length: 9 }, (_, i) => {
                const dayNum = i + 1;
                const completed = past;
                return (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${completed ? 'bg-emerald-500/40' : 'bg-stone-300'}`}
                    title={`Day ${dayNum}${completed ? ' — completed' : ''}`}
                  />
                );
              })}
            </div>
          )}
          {(active || upcoming) && <div />}
          <span className="text-[11px] font-semibold text-amber-700 group-hover:text-amber-600 flex items-center gap-1">
            {active ? 'Pray Now' : past ? 'Read Again' : 'Start'}
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

function NovenaCard({ novena, onStart, calendarStatus }: { novena: Novena; onStart: () => void; calendarStatus: NovenaStatus }) {
  const intention = NOVENA_INTENTIONS[novena.id] || '';
  const active = calendarStatus?.status === 'active';
  const upcoming = calendarStatus?.status === 'upcoming';
  const past = calendarStatus?.status === 'past';

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatFullDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="bg-white rounded-xl overflow-hidden border border-stone-200 hover:shadow-lg hover:border-amber-600/50 transition-all duration-300 group cursor-pointer"
      style={{ boxShadow: '0 2px 8px rgba(28,25,23,0.08)' }}
      onClick={onStart}
    >
      <div className={`h-1 bg-gradient-to-r ${novena.color}`} />
      <div className="p-5">
        {/* Title + Status */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-tight text-sm">
            {novena.title}
          </h3>
          {active && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wide animate-pulse">
              Active
            </span>
          )}
          {upcoming && calendarStatus && 'daysUntil' in calendarStatus && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold">
              {calendarStatus.daysUntil === 0 ? 'Today' : calendarStatus.daysUntil === 1 ? 'Tomorrow' : `In ${calendarStatus.daysUntil}d`}
            </span>
          )}
          {past && (
            <span className="flex-shrink-0 px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold">
              Completed
            </span>
          )}
        </div>

        {/* Date banner — prominent */}
        {calendarStatus?.entry && (
          <div className={`rounded-lg p-3 mb-3 border ${
            active ? 'bg-emerald-50 border-emerald-200' :
            upcoming ? 'bg-amber-50 border-amber-200' :
            'bg-stone-100 border-stone-200'
          }`}>
            <div className="flex items-center gap-2">
              <svg className={`w-3.5 h-3.5 flex-shrink-0 ${
                active ? 'text-emerald-700' : upcoming ? 'text-amber-700' : 'text-stone-600'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className={`text-[11px] font-bold ${
                active ? 'text-emerald-700' : upcoming ? 'text-amber-700' : 'text-stone-600'
              }`}>
                {formatDate(calendarStatus.entry.startDate)} — {formatDate(calendarStatus.entry.endDate)}
              </span>
            </div>
            {calendarStatus.entry.feastDay && (
              <p className="text-[10px] text-amber-700/60 mt-1.5 ml-5.5">{calendarStatus.entry.feastDay}</p>
            )}
          </div>
        )}

        {intention && <p className="text-xs text-amber-700 font-medium mb-1.5">{intention}</p>}

        <p className="text-sm text-stone-600 line-clamp-2 mb-3" title={novena.description}>{novena.description}</p>

        {/* Progress for active */}
        {active && calendarStatus && 'currentDay' in calendarStatus && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1">
              <span className="font-semibold text-emerald-700">Day {calendarStatus.currentDay} of 9</span>
              <span>{Math.round(calendarStatus.progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${calendarStatus.progress}%` }} />
            </div>
          </div>
        )}

        {/* Countdown for upcoming */}
        {upcoming && calendarStatus && 'daysUntil' in calendarStatus && (
          <p className="text-[11px] text-amber-700 mb-3">
            Starts {calendarStatus.daysUntil === 0 ? 'today' : calendarStatus.daysUntil === 1 ? 'tomorrow' : `in ${calendarStatus.daysUntil} days`} — {formatFullDate(calendarStatus.entry.startDate)}
          </p>
        )}

        {/* Completed note for past */}
        {past && (
          <p className="text-[11px] text-stone-500 mb-3">
            Novena completed — {formatFullDate(calendarStatus.entry.startDate)}
          </p>
        )}

        <div className="flex items-center justify-between">
          {!active && (
            <div className="flex gap-1">
              {Array.from({ length: 9 }, (_, i) => {
                const dayNum = i + 1;
                const completed = calendarStatus?.status === 'past';
                return (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${completed ? 'bg-emerald-500' : 'bg-stone-300'}`}
                    title={`Day ${dayNum}${completed ? ' — completed' : ''}`}
                  />
                );
              })}
            </div>
          )}
          {active && <div />}
          <span className="text-xs font-semibold text-amber-700 group-hover:text-amber-600 flex items-center gap-1">
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

// ═══════════════════════════════════════════════════════════
// LITANY + PRAYER CARDS
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[10px] font-bold">
          {totalCount} invocations
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-500 rounded-md text-[10px] font-medium">
          ~{readMin} min read
        </span>
      </div>
      <div className="space-y-0 bg-stone-50 rounded-lg p-3 border border-stone-200">
        {invocations.map((inv, i) => (
          <div key={i} className="flex items-center gap-2 py-1">
            <span className="w-1 h-1 rounded-full bg-stone-300 flex-shrink-0" />
            <span className="text-xs text-stone-700 font-medium flex-1 truncate">{inv.name}</span>
            <span className="text-[11px] text-emerald-700 italic whitespace-nowrap">{inv.response}</span>
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
      className="bg-white rounded-xl border border-stone-200 hover:shadow-md hover:border-amber-600/40 transition-all duration-200 cursor-pointer group overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(28,25,23,0.06)' }}
      onClick={() => onClick?.(prayer)}
    >
      {(isHealing || isDaily) && (
        <div className={`h-1 ${isHealing ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`} />
      )}
      <div className={compact ? 'p-4' : 'p-5'}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className={`font-semibold text-stone-900 group-hover:text-amber-700 transition-colors ${compact ? 'text-sm' : ''}`}>
            {prayer.title}
          </h3>
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}>
            {isLitany ? 'Litany' : prayer.category.charAt(0).toUpperCase() + prayer.category.slice(1)}
          </span>
        </div>
        {prayer.intention && <p className="text-xs text-stone-500 mb-2">{prayer.intention}</p>}
        {isLitany && !compact ? (
          <LitanyPreview prayer={prayer} />
        ) : (
          <>
            <p className={`text-sm text-stone-600 leading-relaxed ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
              {prayer.text.substring(0, compact ? 120 : 200)}{prayer.text.length > (compact ? 120 : 200) ? '...' : ''}
            </p>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-200">
              <span className="inline-flex items-center gap-1 text-[10px] text-stone-500 font-medium">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ~{readMin} min
              </span>
              <span className="text-stone-400">|</span>
              <span className="text-[10px] text-stone-500 font-medium">{wordCount} words</span>
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
  const [activeJumuiya, setActiveJumuiya] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'past'>('all');

  const litanyPrayers = prayers.filter((p) => p.category === 'litanies');
  const saintsPrayers = prayers.filter((p) => p.category === 'saints');
  const healingPrayers = prayers.filter((p) => p.category === 'healing');
  const dailyPrayers = prayers.filter((p) => p.category === 'daily');
  const hasResults = novenas.length > 0 || litanyPrayers.length > 0 || saintsPrayers.length > 0 || healingPrayers.length > 0 || dailyPrayers.length > 0;

  const year = new Date().getFullYear();
  const calendar = useMemo(() => getNovenaCalendar(year), [year]);
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const allStatuses = useMemo(() => {
    return novenas.map((n) => ({ novena: n, status: getNovenaStatus(n.id, calendar, today) }));
  }, [novenas, calendar, today]);

  const statusCounts = useMemo(() => {
    const counts = { active: 0, upcoming: 0, past: 0 };
    for (const n of allStatuses) {
      if (n.status?.status === 'active') counts.active++;
      else if (n.status?.status === 'upcoming') counts.upcoming++;
      else if (n.status?.status === 'past') counts.past++;
    }
    return counts;
  }, [allStatuses]);

  const filteredByStatus = useMemo(() => {
    if (statusFilter === 'all') return allStatuses;
    return allStatuses.filter((n) => n.status?.status === statusFilter);
  }, [allStatuses, statusFilter]);

  const heroNovena = useMemo(() => {
    const active = allStatuses.find((n) => n.status?.status === 'active');
    if (active) return active;
    const upcoming = allStatuses
      .filter((n) => n.status?.status === 'upcoming')
      .sort((a, b) => {
        const aD = a.status && 'daysUntil' in a.status ? (a.status.daysUntil ?? 999) : 999;
        const bD = b.status && 'daysUntil' in b.status ? (b.status.daysUntil ?? 999) : 999;
        return aD - bD;
      });
    return upcoming[0] || null;
  }, [allStatuses]);

  // Jumuiya-specific novenas
  const jumuiyaData = useMemo(() => {
    return JUMUIYAS.map((j) => {
      const novena = novenas.find((n) => n.id === j.novenaId);
      const status = novena ? getNovenaStatus(novena.id, calendar, today) : null;
      return { jumuiya: j, novena, status };
    }).filter((d) => d.novena);
  }, [novenas, calendar, today]);

  // Filtered novenas excluding jumuiya patron novenas
  const otherNovenas = useMemo(() => {
    const jumuiyaIds = new Set(JUMUIYAS.map((j) => j.novenaId));
    return filteredByStatus.filter((n) => !jumuiyaIds.has(n.novena.id));
  }, [filteredByStatus]);

  const grouped = useMemo(() => {
    const STATUS_ORDER = { active: 0, upcoming: 1, past: 2 };
    const sortFn = (a: typeof otherNovenas[0], b: typeof otherNovenas[0]) => {
      const oa = a.status ? STATUS_ORDER[a.status.status] : 2;
      const ob = b.status ? STATUS_ORDER[b.status.status] : 2;
      if (oa !== ob) return oa - ob;
      if (a.status?.entry && b.status?.entry) return a.status.entry.startDate.getTime() - b.status.entry.startDate.getTime();
      return 0;
    };
    return {
      marian: otherNovenas.filter((n) => NOVENA_TYPE_MAP[n.novena.id] === 'marian').sort(sortFn),
      saint: otherNovenas.filter((n) => NOVENA_TYPE_MAP[n.novena.id] === 'saint').sort(sortFn),
      devotional: otherNovenas.filter((n) => NOVENA_TYPE_MAP[n.novena.id] === 'devotional').sort(sortFn),
    };
  }, [otherNovenas]);

  if (!hasResults) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-stone-200" style={{ boxShadow: '0 1px 3px rgba(28,25,23,0.06)' }}>
        <h3 className="text-lg font-semibold text-stone-900 mb-2">No prayers found</h3>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">Try adjusting your search or category filter.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-12 ${className}`}>
      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO                                                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-stone-100 border border-amber-200">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(217,119,6,0.08) 40px, rgba(217,119,6,0.08) 41px)'
        }} />
        <div className="relative px-6 sm:px-8 py-8 text-center">
          <p className="text-[10px] font-bold text-amber-700/70 uppercase tracking-[0.3em] mb-3">Devotiones Ecclesiae</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">Novenas &amp; Litanies</h1>
          <p className="text-sm text-stone-500 max-w-lg mx-auto">
            Nine-day prayers of faith and intercession, with solemn litanies and daily devotions
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* JUMUIYA (PARISH GROUPS) — DARK SECTION                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      {jumuiyaData.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-stone-100 border border-stone-200 p-6 sm:p-8">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(217,119,6,0.15), transparent 50%), radial-gradient(circle at 80% 50%, rgba(217,119,6,0.08), transparent 50%)'
          }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-200">
                <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Our Jumuiyas</h2>
                <p className="text-[11px] text-stone-500">Seven parish groups with their patron saints</p>
              </div>
            </div>

            {/* Jumuiya filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-1 px-1">
              <button
                onClick={() => setActiveJumuiya('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  activeJumuiya === 'all'
                    ? 'bg-amber-500/10 text-amber-700 border-amber-300'
                    : 'bg-transparent text-stone-500 border-stone-200 hover:border-amber-500/40'
                }`}
              >
                All Groups
              </button>
              {JUMUIYAS.map((j) => {
                const data = jumuiyaData.find((d) => d.jumuiya.id === j.id);
                const isActive = data?.status?.status === 'active';
                return (
                  <button
                    key={j.id}
                    onClick={() => setActiveJumuiya(j.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                      activeJumuiya === j.id
                        ? 'bg-amber-500/10 text-amber-700 border-amber-300'
                        : 'bg-transparent text-stone-500 border-stone-200 hover:border-amber-500/40'
                    }`}
                  >
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    {j.shortName}
                  </button>
                );
              })}
            </div>

            {/* Jumuiya cards grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jumuiyaData
                .filter((d) => activeJumuiya === 'all' || d.jumuiya.id === activeJumuiya)
                .map(({ jumuiya, novena, status }) => (
                  <JumuiyaCard
                    key={jumuiya.id}
                    jumuiya={jumuiya}
                    novena={novena!}
                    status={status}
                    onStart={() => onStartNovena?.(novena!)}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* WHAT IS A NOVENA?                                      */}
      {/* ═══════════════════════════════════════════════════════ */}
      {novenas.length > 0 && (
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm text-stone-500 hover:text-amber-700 transition-colors select-none">
            <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            What is a Novena?
          </summary>
          <div className="mt-3 bg-white rounded-xl border border-stone-200 p-5 text-sm text-stone-600 leading-relaxed" style={{ boxShadow: '0 1px 4px rgba(28,25,23,0.06)' }}>
            <p className="mb-2">
              A <strong className="text-stone-900">novena</strong> is a nine-day period of prayer rooted in Catholic tradition,
              modeled after the Apostles' nine days of prayer between Ascension and Pentecost. The word comes from the
              Latin <em className="text-amber-700">novem</em>, meaning nine.
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
      {/* STATUS FILTER PILLS                                    */}
      {/* ═══════════════════════════════════════════════════════ */}
      {novenas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'all' as const, label: 'All Novenas', count: novenas.length },
            { key: 'active' as const, label: 'Active Now', count: statusCounts.active },
            { key: 'upcoming' as const, label: 'Upcoming', count: statusCounts.upcoming },
            { key: 'past' as const, label: 'Completed', count: statusCounts.past },
          ]).map((pill) => (
            <button
              key={pill.key}
              onClick={() => setStatusFilter(pill.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                statusFilter === pill.key
                  ? pill.key === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                    : pill.key === 'upcoming'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
                      : pill.key === 'past'
                        ? 'bg-stone-100 text-stone-700 border-stone-200 shadow-sm'
                        : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-amber-500/40 hover:text-amber-700'
              }`}
            >
              {pill.key === 'active' && pill.count > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {pill.label}
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                statusFilter === pill.key
                  ? 'bg-white/50 text-inherit'
                  : 'bg-stone-100 text-stone-500'
              }`}>{pill.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ALL NOVENAS BY CATEGORY                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      {novenas.length > 0 && (
        <>
          {(['marian', 'saint', 'devotional'] as const).map((type) => {
            const items = grouped[type];
            if (items.length === 0) return null;
            const labels = { marian: 'Marian Novenas', saint: 'Saint Novenas', devotional: 'Devotional Novenas' };
            const desc = { marian: 'Through the intercession of Our Lady', saint: 'With the saints who intercede for us', devotional: 'For special devotions and liturgical seasons' };
            const activeInGroup = items.filter((n) => n.status?.status === 'active').length;
            return (
              <section key={type}>
                <div className="mb-4">
                  <h2 className="text-base font-bold text-stone-900">{labels[type]}</h2>
                  <p className="text-xs text-stone-500">
                    {desc[type]}
                    {activeInGroup > 0 && <span className="ml-2 text-emerald-700 font-semibold">{activeInGroup} active</span>}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map(({ novena, status }) => (
                    <NovenaCard key={novena.id} novena={novena} calendarStatus={status} onStart={() => onStartNovena?.(novena)} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* LITANIES                                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      {litanyPrayers.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-base font-bold text-stone-900">Litanies</h2>
            <p className="text-xs text-stone-500">Solemn prayers of invocation and response — {litanyPrayers.length} litanies</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {litanyPrayers.map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} onClick={onPrayerClick} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* PRAYERS TO SAINTS                                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      {saintsPrayers.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-base font-bold text-stone-900">Prayers to Saints</h2>
            <p className="text-xs text-stone-500">Ask the saints to intercede for us — {saintsPrayers.length} prayers</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {saintsPrayers.map((prayer) => (
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
          <div className="mb-4">
            <h2 className="text-base font-bold text-stone-900">Healing Prayers</h2>
            <p className="text-xs text-stone-500">Prayers for body, mind, and spirit — {healingPrayers.length} prayers</p>
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
          <div className="mb-4">
            <h2 className="text-base font-bold text-stone-900">Daily Catholic Prayers</h2>
            <p className="text-xs text-stone-500">Essential prayers for every day — {dailyPrayers.length} prayers</p>
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
