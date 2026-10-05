import { useState, useEffect, useCallback } from 'react';
import type { Novena } from '../data/novenas';

interface NovenaTrackerProps {
  novena: Novena;
  onClose: () => void;
  className?: string;
}

interface TrackerState {
  completedDays: number[];
  notes: Record<number, string>;
  startedAt: string;
  lastPrayedAt: string;
}

function getStorageKey(novenaId: string): string {
  return `novena-tracker-${novenaId}`;
}

function loadState(novenaId: string): TrackerState | null {
  try {
    const raw = localStorage.getItem(getStorageKey(novenaId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(novenaId: string, state: TrackerState): void {
  try {
    localStorage.setItem(getStorageKey(novenaId), JSON.stringify(state));
  } catch { /* quota exceeded — silently fail */ }
}

export default function NovenaTracker({ novena, onClose, className = '' }: NovenaTrackerProps) {
  const saved = loadState(novena.id);

  const [completedDays, setCompletedDays] = useState<number[]>(saved?.completedDays || []);
  const [notes, setNotes] = useState<Record<number, string>>(saved?.notes || {});
  const [selectedDay, setSelectedDay] = useState(() => {
    if (saved?.completedDays) {
      for (let d = 1; d <= 9; d++) {
        if (!saved.completedDays.includes(d)) return d;
      }
    }
    return 1;
  });

  const isComplete = completedDays.length === 9;
  const progressPct = Math.round((completedDays.length / 9) * 100);

  // Persist state on every change
  useEffect(() => {
    saveState(novena.id, {
      completedDays,
      notes,
      startedAt: saved?.startedAt || new Date().toISOString(),
      lastPrayedAt: new Date().toISOString(),
    });
  }, [completedDays, notes, novena.id]);

  const toggleDay = useCallback((day: number) => {
    setCompletedDays((prev) => {
      const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b);
      return next;
    });
  }, []);

  const handleReset = () => {
    if (window.confirm('Reset all progress for this novena? This cannot be undone.')) {
      setCompletedDays([]);
      setNotes({});
      setSelectedDay(1);
      localStorage.removeItem(getStorageKey(novena.id));
    }
  };

  const currentPrayer = novena.days.find((d) => d.day === selectedDay);

  return (
    <div className={`bg-white rounded-2xl overflow-hidden ${className}`} style={{ boxShadow: '0 4px 24px rgba(28,25,23,0.12)' }}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${novena.color} p-6 text-white`}>
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl font-bold">{novena.title}</h2>
            <p className="text-sm text-white/80 mt-0.5">{novena.description}</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/20 rounded-full transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>Progress</span>
              <span>{completedDays.length}/9 days — {progressPct}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div
                className="bg-white h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex border-b border-stone-200 overflow-x-auto">
        {novena.days.map((d) => {
          const done = completedDays.includes(d.day);
          const active = selectedDay === d.day;
          return (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`flex-1 min-w-0 py-3 px-1 text-xs font-semibold transition-all relative ${
                active
                  ? 'text-amber-700 bg-amber-50'
                  : done
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  done ? 'bg-emerald-500 text-white' : active ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500'
                }`}>
                  {done ? '✓' : d.day}
                </span>
                <span className="truncate w-full">Day {d.day}</span>
              </div>
              {active && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500 rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Prayer content */}
      <div className="p-6">
        {isComplete ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">Novena Complete!</h3>
            <p className="text-sm text-stone-600 mb-6 max-w-md mx-auto">
              Congratulations! You have completed all 9 days of the {novena.title}. May God hear and answer your prayers.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 text-sm font-semibold text-stone-700 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : currentPrayer ? (
          <div>
            {/* Day header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">{currentPrayer.prayer.title}</h3>
                {currentPrayer.prayer.intention && (
                  <p className="text-xs text-stone-500 mt-0.5">Intention: {currentPrayer.prayer.intention}</p>
                )}
              </div>
              <button
                onClick={() => toggleDay(selectedDay)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  completedDays.includes(selectedDay)
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                {completedDays.includes(selectedDay) ? '✓ Prayed' : 'Mark as Prayed'}
              </button>
            </div>

            {/* Prayer text */}
            <div className="bg-stone-50 rounded-xl p-5 mb-5 border border-stone-200">
              {/* Opening Prayer */}
              <div className="mb-5 pb-5 border-b border-stone-200">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Opening Prayer</p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  In the name of the Father, and of the Son, and of the Holy Spirit. Amen.
                </p>
                <p className="text-sm text-stone-600 leading-relaxed mt-2">
                  Come, Holy Spirit, fill the hearts of Your faithful and enkindle in us the fire of Your love. Send forth Your Spirit and we shall be created, and You shall renew the face of the earth.
                </p>
                <p className="text-sm text-stone-600 leading-relaxed mt-2 italic">
                  O God, who by the light of the Holy Spirit did instruct the hearts of the faithful, grant that by the same Spirit we may be truly wise and ever rejoice in His consolation. Through Christ our Lord. Amen.
                </p>
              </div>

              {/* Daily Prayer */}
              <div className="mb-5 pb-5 border-b border-stone-200">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Day {selectedDay} Prayer</p>
                <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                  {currentPrayer.prayer.text}
                </p>
              </div>

              {/* Closing Prayers */}
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Closing Prayers</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-stone-500 mb-1">Our Father</p>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-500 mb-1">Hail Mary</p>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      Hail Mary, full of grace; the Lord is with thee; blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-500 mb-1">Glory Be</p>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-2">
                Personal Note for Day {selectedDay}
              </label>
              <textarea
                value={notes[selectedDay] || ''}
                onChange={(e) => setNotes((prev) => ({ ...prev, [selectedDay]: e.target.value }))}
                placeholder="Write your intentions, reflections, or gratitude..."
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none"
                rows={3}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5">
              <button
                onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
                disabled={selectedDay === 1}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Day {Math.max(1, selectedDay - 1)}
              </button>

              <button
                onClick={handleReset}
                className="text-xs text-stone-500 hover:text-stone-700 transition-colors"
              >
                Reset Progress
              </button>

              <button
                onClick={() => setSelectedDay((d) => Math.min(9, d + 1))}
                disabled={selectedDay === 9}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Day {Math.min(9, selectedDay + 1)}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
