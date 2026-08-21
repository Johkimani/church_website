import React from 'react';
import type { CommunityModule } from '../../context/CommunityDataContext';
import { FaClock, FaMapMarkerAlt, FaCalendarWeek, FaRegCalendarCheck } from 'react-icons/fa';

interface Props {
  module: CommunityModule;
  color: string;
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function formatTime(t?: string): string {
  if (!t) return '';
  const m = String(t).match(/^(\d{1,2}):(\d{2})/);
  if (!m) return t;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${min} ${ampm}`;
}

const CommunityScheduleTab: React.FC<Props> = ({ module, color }) => {
  const mod = module as any;
  const schedules: any[] = mod.practiceSchedules || [];

  const sorted = [...schedules].sort((a, b) => {
    const ai = DAY_ORDER.indexOf(String(a.day).toLowerCase());
    const bi = DAY_ORDER.indexOf(String(b.day).toLowerCase());
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  if (sorted.length === 0) {
    return (
      <div className="text-center py-20 rounded-3xl" style={{ background: `${color}06`, border: `1px dashed ${color}25` }}>
        <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5" style={{ background: `${color}10` }}>
          <FaCalendarWeek style={{ color: `${color}40` }} size={32} />
        </div>
        <h3 className="font-bold text-slate-500 text-base mb-1">No weekly schedule published yet</h3>
        <p className="text-slate-400 text-sm">
          {mod.meetingSchedule
            ? `For now, the general meeting time is: ${mod.meetingSchedule}`
            : 'Practice and meeting times will appear here once officials publish them.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary strip */}
      <div
        className="rounded-2xl px-6 py-4 mb-6 flex items-center gap-4"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 8px 24px ${color}30` }}
      >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: 'rgba(255,255,255,0.18)' }}>
          <FaCalendarWeek size={20} />
        </div>
        <div>
          <h2 className="text-white font-extrabold text-lg leading-tight">{mod.scheduleLabel || 'Weekly Schedule Breakdown'}</h2>
          {mod.meetingSchedule && <p className="text-white/75 text-xs mt-0.5">Main meeting: {mod.meetingSchedule}</p>}
        </div>
      </div>

      {/* Day-by-day breakdown */}
      <div className="grid gap-4 sm:grid-cols-2">
        {sorted.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl p-5 bg-white border transition-all hover:shadow-lg hover:-translate-y-0.5 duration-300"
            style={{ borderLeftWidth: '4px', borderLeftColor: color, borderColor: `${color}22` }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-extrabold text-slate-800 text-base capitalize">{s.day}</h4>
              <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, color }}>
                <FaRegCalendarCheck size={16} />
              </span>
            </div>
            <div className="space-y-2">
              {(s.startTime || s.endTime) && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FaClock size={12} style={{ color }} />
                  <span className="font-semibold">
                    {formatTime(s.startTime)}{s.endTime ? ` – ${formatTime(s.endTime)}` : ''}
                  </span>
                </div>
              )}
              {s.location && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FaMapMarkerAlt size={12} style={{ color }} />
                  <span>{s.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityScheduleTab;
