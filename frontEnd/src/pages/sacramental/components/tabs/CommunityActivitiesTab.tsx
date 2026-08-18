import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapPin, FaCalendarDay, FaHourglassHalf } from 'react-icons/fa';
import type { CommunityModule } from '../../context/CommunityDataContext';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  moduleId: string;
  color: string;
  module: CommunityModule;
}

const DAY_COLORS: Record<string, string> = {
  Monday: '#3b82f6',
  Tuesday: '#10b981',
  Wednesday: '#f59e0b',
  Thursday: '#8b5cf6',
  Friday: '#ef4444',
  Saturday: '#ec4899',
  Sunday: '#06b6d4',
};

const DAY_ABBR: Record<string, string> = {
  Monday: 'MON',
  Tuesday: 'TUE',
  Wednesday: 'WED',
  Thursday: 'THU',
  Friday: 'FRI',
  Saturday: 'SAT',
  Sunday: 'SUN',
};

function useCountdown(targetDate: Date | null) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return remaining;
}

const CommunityActivitiesTab: React.FC<Props> = ({ moduleId, color, module }) => {
  const activities = module.activities || [];
  const practiceSchedules = module.practiceSchedules || [];

  const nextPractice = practiceSchedules.length > 0
    ? (() => {
        const now = new Date();
        const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = dayOrder[now.getDay()];
        const todayIdx = dayOrder.indexOf(today);
        const sorted = [...practiceSchedules].sort((a, b) => {
          const aIdx = dayOrder.indexOf(a.day);
          const bIdx = dayOrder.indexOf(b.day);
          let aDiff = (aIdx - todayIdx + 7) % 7;
          let bDiff = (bIdx - todayIdx + 7) % 7;
          return aDiff - bDiff;
        });
        const next = sorted[0];
        if (!next) return null;
        const target = new Date(now);
        const diffDays = (dayOrder.indexOf(next.day) - todayIdx + 7) % 7;
        target.setDate(target.getDate() + diffDays);
        const [h, m] = (next.startTime || '00:00').split(':').map(Number);
        target.setHours(h || 9, m || 0, 0, 0);
        return { ...next, targetDate: target };
      })()
    : null;

  const countdown = useCountdown(nextPractice?.targetDate || null);

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Activities</h1>
          <p className="page-description">Our schedule and upcoming events.</p>
        </div>
      </div>

      {/* Live Countdown Banner */}
      {nextPractice && !countdown.expired && (
        <div
          className="rounded-3xl p-6 mb-8 overflow-hidden relative"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 50%, ${color}bb 100%)`,
            boxShadow: `0 12px 40px ${color}30`,
          }}
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <FaHourglassHalf className="text-white/80" size={14} />
              <span className="text-white/80 text-xs font-bold uppercase tracking-[0.2em]">Next Practice</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white text-xl font-black">{nextPractice.day}</span>
              <span className="text-white/60 text-sm">•</span>
              <span className="text-white/80 text-sm font-semibold">{nextPractice.startTime} – {nextPractice.endTime}</span>
            </div>
            <div className="flex gap-3">
              {[
                { value: countdown.days, label: 'Days' },
                { value: countdown.hours, label: 'Hrs' },
                { value: countdown.minutes, label: 'Min' },
                { value: countdown.seconds, label: 'Sec' },
              ].map((item, i) => (
                <div key={i} className="bg-white/15 backdrop-blur-sm rounded-xl px-3.5 py-2.5 text-center min-w-[56px]">
                  <div className="text-white text-2xl font-black tabular-nums">{String(item.value).padStart(2, '0')}</div>
                  <div className="text-white/60 text-[9px] font-bold uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>
            {nextPractice.location && (
              <p className="text-white/70 text-xs font-semibold mt-3 flex items-center gap-1.5">
                <FaMapPin size={10} /> {nextPractice.location}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Practice Schedule - Calendar Day Cards */}
      {practiceSchedules.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full" style={{ background: color }} />
            <FaClock size={16} style={{ color }} /> Weekly Practice
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {practiceSchedules.map((ps) => {
              const dayColor = DAY_COLORS[ps.day] || color;
              return (
                <div
                  key={ps.id}
                  className="relative rounded-2xl overflow-hidden group hover:scale-[1.03] transition-all duration-300"
                  style={{ boxShadow: `0 4px 15px ${dayColor}15` }}
                >
                  <div className="h-10 flex items-center justify-center" style={{ background: dayColor }}>
                    <span className="text-white text-xs font-black tracking-wider">{DAY_ABBR[ps.day] || ps.day?.slice(0, 3).toUpperCase()}</span>
                  </div>
                  <div className="bg-white p-4">
                    <div className="text-sm font-bold text-slate-800 mb-1">{ps.startTime} – {ps.endTime}</div>
                    {ps.location && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                        <FaMapPin size={9} /> {ps.location}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activities Timeline */}
      {activities.length > 0 ? (
        <div>
          <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full" style={{ background: color }} />
            <FaCalendarAlt size={16} style={{ color }} /> Upcoming Activities
          </h2>
          <div className="relative ml-4">
            {/* Timeline line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ background: `${color}20` }} />

            <div className="space-y-6">
              {activities.map((activity: any, idx: number) => {
                const date = new Date(activity.date || Date.now());
                const month = date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
                const dayNum = date.getDate();
                const status = (activity.status || 'Upcoming').toLowerCase();
                return (
                  <div key={activity.id} className="relative pl-8">
                    {/* Timeline dot */}
                    <div
                      className="absolute -left-[5px] top-4 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10"
                      style={{ background: status === 'completed' ? '#10b981' : status === 'cancelled' ? '#ef4444' : color }}
                    />

                    <div
                      className="rounded-2xl p-5 bg-white border border-slate-100 hover:shadow-lg transition-all duration-300 group"
                      style={{ borderLeftWidth: '3px', borderLeftColor: status === 'completed' ? '#10b981' : status === 'cancelled' ? '#ef4444' : color }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105"
                          style={{ background: `${color}10` }}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color }}>{month}</span>
                          <span className="text-lg font-black text-slate-800 leading-none">{dayNum}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-sm group-hover:text-slate-900 transition">{activity.title}</h3>
                          {activity.description && (
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{activity.description}</p>
                          )}
                          <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md mt-2 ${
                            status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                            status === 'cancelled' ? 'bg-red-50 text-red-700' :
                            status === 'ongoing' ? 'bg-blue-50 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {activity.status || 'Upcoming'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl" style={{ background: `${color}06`, border: `1px dashed ${color}25` }}>
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}10` }}>
            <FaCalendarAlt style={{ color: `${color}40` }} size={28} />
          </div>
          <p className="font-semibold text-slate-400 text-sm">No activities scheduled yet.</p>
        </div>
      )}
    </div>
  );
};

export default CommunityActivitiesTab;
