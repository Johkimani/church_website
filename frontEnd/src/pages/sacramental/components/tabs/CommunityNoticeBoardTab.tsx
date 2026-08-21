import React from 'react';
import type { CommunityModule } from '../../context/CommunityDataContext';
import { FaBullhorn, FaExclamationCircle, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaThumbtack } from 'react-icons/fa';

interface Props {
  module: CommunityModule;
  color: string;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  urgent: { icon: <FaExclamationCircle size={14} />, color: '#ef4444', bg: '#fef2f2', label: 'Urgent' },
  warning: { icon: <FaExclamationTriangle size={14} />, color: '#f59e0b', bg: '#fffbeb', label: 'Notice' },
  success: { icon: <FaCheckCircle size={14} />, color: '#10b981', bg: '#ecfdf5', label: 'Update' },
  info: { icon: <FaInfoCircle size={14} />, color: '#3b82f6', bg: '#eff6ff', label: 'Info' },
};

const CommunityNoticeBoardTab: React.FC<Props> = ({ module, color }) => {
  const raw = ((module as any).announcements || []) as any[];

  const notices = raw.map((n) => ({
    ...n,
    type: n.type || 'info',
    date: n.date || n.announcement_date,
  }));

  const urgent = notices.filter((n) => n.type === 'urgent');
  const rest = notices.filter((n) => n.type !== 'urgent');
  const ordered = [...urgent, ...rest];

  if (ordered.length === 0) {
    return (
      <div className="text-center py-20 rounded-3xl" style={{ background: `${color}06`, border: `1px dashed ${color}25` }}>
        <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5" style={{ background: `${color}10` }}>
          <FaBullhorn style={{ color: `${color}40` }} size={32} />
        </div>
        <h3 className="font-bold text-slate-500 text-base mb-1">The notice board is empty</h3>
        <p className="text-slate-400 text-sm">Announcements and urgent updates from officials will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header strip */}
      <div
        className="rounded-2xl px-6 py-4 mb-6 flex items-center gap-4"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 8px 24px ${color}30` }}
      >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: 'rgba(255,255,255,0.18)' }}>
          <FaBullhorn size={20} />
        </div>
        <div>
          <h2 className="text-white font-extrabold text-lg leading-tight">Notice Board &amp; Urgent Updates</h2>
          <p className="text-white/75 text-xs mt-0.5">
            {urgent.length > 0 ? `${urgent.length} urgent update${urgent.length > 1 ? 's' : ''} · ` : ''}
            {ordered.length} total posting{ordered.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {ordered.map((n) => {
          const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
          const isUrgent = n.type === 'urgent';
          return (
            <div
              key={n.id}
              className="rounded-2xl p-5 bg-white border transition-all hover:shadow-lg duration-300"
              style={{
                borderLeftWidth: isUrgent ? '5px' : '3px',
                borderLeftColor: config.color,
                borderColor: isUrgent ? `${config.color}55` : undefined,
                boxShadow: isUrgent ? `0 4px 18px ${config.color}22` : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: config.bg, color: config.color }}>
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-[15px]">{n.title || n.announcement_title}</h4>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md" style={{ background: config.bg, color: config.color }}>
                        {isUrgent && <FaThumbtack size={8} />} {config.label}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mt-2">{n.content || n.announcement_content}</p>
                    {(n.date || n.announcement_date) && (
                      <p className="text-[11px] font-semibold text-slate-400 mt-3">{formatDate(n.date || n.announcement_date)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityNoticeBoardTab;
