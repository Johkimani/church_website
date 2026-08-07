import { useState, useMemo } from 'react';
import { getNovenaCalendar, formatNovenaDates, type NovenaEvent } from '../data/novenaCalendar';
import { downloadNovenaCalendar } from '../utils/calendarExport';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Year-round novenas that can be started anytime
const YEAR_ROUND_NOVENAS = [
  { id: 'divine-mercy', title: 'Divine Mercy Novena', intention: "God's mercy for all souls", novenaId: 'novenas-divine-mercy' },
  { id: 'holy-spirit', title: 'Holy Spirit Novena', intention: 'Outpouring of the Holy Spirit', novenaId: 'novenas-holy-spirit' },
  { id: 'holy-family', title: 'Holy Family Novena', intention: 'Family unity and harmony', novenaId: 'novenas-holy-family' },
];

interface NovenaStatus {
  event: NovenaEvent & { startDate: Date; endDate: Date };
  status: 'active' | 'upcoming' | 'past';
  currentDay?: number;
  progress?: number;
  daysUntil?: number;
  isStartingToday?: boolean;
}

interface NovenaCalendarProps {
  onStartNovena?: (novenaId: string) => void;
  className?: string;
}

export default function NovenaCalendar({ onStartNovena, className = '' }: NovenaCalendarProps) {
  const year = new Date().getFullYear();
  const calendar = useMemo(() => getNovenaCalendar(year), [year]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [showYearRound, setShowYearRound] = useState(true);

  // Compute status for each novena
  const novenaStatuses = useMemo((): NovenaStatus[] => {
    return calendar.map((event) => {
      const startMs = event.startDate.getTime();
      const endMs = event.endDate.getTime();
      const todayMs = today.getTime();

      if (todayMs >= startMs && todayMs <= endMs) {
        // ACTIVE
        const dayIndex = Math.floor((todayMs - startMs) / (24 * 60 * 60 * 1000));
        return {
          event,
          status: 'active',
          currentDay: dayIndex + 1,
          progress: ((dayIndex + 1) / 9) * 100,
        };
      } else if (todayMs < startMs) {
        // UPCOMING
        const daysUntil = Math.ceil((startMs - todayMs) / (24 * 60 * 60 * 1000));
        return {
          event,
          status: 'upcoming',
          daysUntil,
          isStartingToday: daysUntil === 0,
        };
      } else {
        // PAST
        return { event, status: 'past' };
      }
    });
  }, [calendar, today]);

  // Categorize novenas
  const activeNovenas = novenaStatuses.filter((n) => n.status === 'active');
  const upcomingNovenas = novenaStatuses
    .filter((n) => n.status === 'upcoming')
    .sort((a, b) => (a.daysUntil || 0) - (b.daysUntil || 0));
  const startingSoon = upcomingNovenas.filter((n) => (n.daysUntil || 0) <= 7);
  const monthNovenas = novenaStatuses.filter((n) => {
    return n.event.startDate.getMonth() === selectedMonth || n.event.endDate.getMonth() === selectedMonth;
  });

  const daysUntil = (start: Date) => {
    const diff = Math.ceil((start.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    if (diff < 0) return null;
    if (diff === 0) return 'Starts today';
    if (diff === 1) return 'Starts tomorrow';
    return `In ${diff} days`;
  };

  const handleAddToCalendar = (event: NovenaEvent & { startDate: Date; endDate: Date }) => {
    downloadNovenaCalendar({
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      intention: event.intention,
      feastDay: event.feastDay,
    });
  };

  return (
    <div className={className}>
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO: What's Happening Now                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        {/* Active Novenas */}
        {activeNovenas.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-lg font-bold text-white">Currently Praying</h2>
            </div>
            <div className="space-y-3">
              {activeNovenas.map(({ event, currentDay, progress }) => (
                <div
                  key={event.id}
                  className="bg-[#0a0f1c] rounded-2xl border-2 border-amber-500/30 overflow-hidden shadow-lg shadow-amber-900/20"
                >
                  <div className="flex items-stretch">
                    <div className={`w-2 bg-gradient-to-b ${event.color} flex-shrink-0`} />
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-white">{event.title}</h3>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wide">
                              Active Now
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{event.intention}</p>
                        </div>
                        <button
                          onClick={() => event.novenaId && onStartNovena?.(event.novenaId)}
                          disabled={!event.novenaId}
                          className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            event.novenaId
                              ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-md shadow-amber-900/30 hover:shadow-lg'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Pray Now
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                          <span className="font-semibold text-amber-400">Day {currentDay} of 9</span>
                          <span>{Math.round(progress || 0)}% complete</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mt-2">
                        {formatNovenaDates(event.startDate, event.endDate)}
                        {event.feastDay && (
                          <span className="text-amber-400 ml-1">({event.feastDay})</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Starting in the Next 7 Days */}
        {startingSoon.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-lg font-bold text-white">Starting Soon</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {startingSoon.map(({ event, daysUntil: days, isStartingToday }) => (
                <div
                  key={event.id}
                  className="bg-[#0a0f1c] rounded-xl border border-slate-800/50 p-4 hover:shadow-md hover:border-amber-600/50 transition-all cursor-pointer group"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                  onClick={() => event.novenaId && onStartNovena?.(event.novenaId)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${event.color} flex items-center justify-center text-white text-lg font-bold shadow-sm flex-shrink-0`}>
                      {days || 0}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">{event.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isStartingToday ? (
                          <span className="text-emerald-400 font-semibold">Starts today!</span>
                        ) : (
                          <span>Starts in {days} day{days !== 1 ? 's' : ''}</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatNovenaDates(event.startDate, event.endDate)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-semibold">
                        Read
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No active or upcoming */}
        {activeNovenas.length === 0 && startingSoon.length === 0 && (
          <div className="bg-[#0a0f1c] rounded-2xl border border-slate-800/50 p-6 text-center mb-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400 mb-1">No novenas active right now</p>
            <p className="text-xs text-slate-500">Select a month below to browse upcoming novenas</p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Year-Round Novenas                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <button
          onClick={() => setShowYearRound(!showYearRound)}
          className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-200 hover:text-amber-400 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showYearRound ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Year-Round Novenas (Start Anytime)
        </button>
        {showYearRound && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {YEAR_ROUND_NOVENAS.map((novena) => (
              <div
                key={novena.id}
                className="bg-[#0a0f1c] rounded-xl border border-slate-800/50 p-4 hover:shadow-md transition-all"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
              >
                <h3 className="text-sm font-bold text-white mb-1">{novena.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{novena.intention}</p>
                <button
                  onClick={() => onStartNovena?.(novena.novenaId)}
                  className="w-full px-3 py-2 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                >
                  Begin Novena
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Month Tabs                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
        {MONTHS.map((name, i) => {
          const count = calendar.filter((e) => e.startDate.getMonth() === i || e.endDate.getMonth() === i).length;
          const hasActive = novenaStatuses.some(
            (n) => n.status === 'active' && (n.event.startDate.getMonth() === i || n.event.endDate.getMonth() === i)
          );
          return (
            <button
              key={name}
              onClick={() => setSelectedMonth(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                selectedMonth === i
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                  : 'bg-[#0a0f1c] text-slate-300 border border-slate-700 hover:border-amber-500/50 hover:text-amber-400'
              }`}
            >
              {name.substring(0, 3)}
              {count > 0 && (
                <span className={`ml-1.5 text-[10px] ${selectedMonth === i ? 'text-amber-200' : 'text-slate-500'}`}>
                  {count}
                </span>
              )}
              {hasActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Monthly Novena List                                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {monthNovenas.length === 0 ? (
        <div className="text-center py-12 bg-[#0a0f1c] rounded-2xl border border-slate-800/50">
          <p className="text-sm text-slate-400">No novenas scheduled for {MONTHS[selectedMonth]}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {monthNovenas.map(({ event, status, currentDay, progress, daysUntil: days }) => {
            const active = status === 'active';
            const past = status === 'past';
            const countdown = daysUntil(event.startDate);

            return (
              <div
                key={event.id}
                className={`bg-[#0a0f1c] rounded-xl border overflow-hidden transition-all ${
                  active
                    ? 'border-amber-500/40 shadow-md shadow-amber-900/20'
                    : past
                      ? 'border-slate-800/50 opacity-60'
                      : 'border-slate-800/50 hover:shadow-md'
                }`}
                style={{ boxShadow: active ? undefined : '0 1px 4px rgba(0,0,0,0.3)' }}
              >
                <div className="flex items-stretch">
                  {/* Color accent */}
                  <div className={`w-1.5 bg-gradient-to-b ${event.color} flex-shrink-0`} />

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-white truncate">{event.title}</h3>
                          {active && (
                            <span className="flex-shrink-0 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold">
                              ACTIVE
                            </span>
                          )}
                          {past && (
                            <span className="flex-shrink-0 px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full text-[10px] font-bold">
                              COMPLETED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{event.intention}</p>

                        {/* Date range with feast day */}
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">
                          {formatNovenaDates(event.startDate, event.endDate)}
                          {event.feastDay && (
                            <span className="text-amber-400 ml-1">— {event.feastDay}</span>
                          )}
                        </p>

                        {/* Progress bar for active novenas */}
                        {active && currentDay && progress !== undefined && (
                          <div className="mt-2.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span className="font-semibold text-amber-400">Day {currentDay} of 9</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {active ? (
                          <button
                            onClick={() => event.novenaId && onStartNovena?.(event.novenaId)}
                            disabled={!event.novenaId}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              event.novenaId
                                ? 'bg-amber-600 text-white hover:bg-amber-700'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            Pray Now
                          </button>
                        ) : past ? (
                          <button
                            onClick={() => event.novenaId && onStartNovena?.(event.novenaId)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                          >
                            Read Again
                          </button>
                        ) : (
                          <button
                            onClick={() => event.novenaId && onStartNovena?.(event.novenaId)}
                            disabled={!event.novenaId}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              event.novenaId
                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {countdown || 'Read Prayers'}
                          </button>
                        )}

                        {/* Add to Calendar button */}
                        {!past && (
                          <button
                            onClick={() => handleAddToCalendar(event)}
                            className="px-2 py-1 rounded-lg text-[10px] font-medium text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1"
                            title="Add to calendar"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Calendar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Upcoming Novenas (Next 30 Days)                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {upcomingNovenas.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-200 mb-3">All Upcoming Novenas</h3>
          <div className="bg-[#0a0f1c] rounded-xl border border-slate-800/50 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            <div className="divide-y divide-slate-800/50">
              {upcomingNovenas.slice(0, 10).map(({ event, daysUntil: days }) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  onClick={() => event.novenaId && onStartNovena?.(event.novenaId)}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${event.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {days}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition-colors">{event.title}</p>
                    <p className="text-xs text-slate-500">
                      {formatNovenaDates(event.startDate, event.endDate)}
                      {event.feastDay && <span className="text-amber-400 ml-1">({event.feastDay})</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-500">
                      {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days}d`}
                    </span>
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-md text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Read
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
