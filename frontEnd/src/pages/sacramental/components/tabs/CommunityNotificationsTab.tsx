import React from 'react';
import type { CommunityModule } from '../../context/CommunityDataContext';
import { FaBell, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  module: CommunityModule;
  color: string;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  info: { icon: <FaInfoCircle size={14} />, color: '#3b82f6', bg: '#eff6ff', label: 'Info' },
  warning: { icon: <FaExclamationTriangle size={14} />, color: '#f59e0b', bg: '#fffbeb', label: 'Warning' },
  success: { icon: <FaCheckCircle size={14} />, color: '#10b981', bg: '#ecfdf5', label: 'Success' },
  urgent: { icon: <FaExclamationCircle size={14} />, color: '#ef4444', bg: '#fef2f2', label: 'Urgent' },
};

const CommunityNotificationsTab: React.FC<Props> = ({ module, color }) => {
  const announcements = (module as any).announcements || [];

  if (announcements.length === 0) {
    return (
      <div className="text-center py-16 rounded-3xl" style={{ background: `${color}06`, border: `1px dashed ${color}25` }}>
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}10` }}>
          <FaBell style={{ color: `${color}40` }} size={28} />
        </div>
        <p className="font-semibold text-slate-400 text-sm">No new notifications</p>
        <p className="text-slate-300 text-xs mt-1">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="relative ml-4">
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ background: `${color}20` }} />

      <div className="space-y-6">
        {announcements.map((notif: any) => {
          const type = notif.type || 'info';
          const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
          const dateStr = notif.announcement_date || notif.date || new Date().toISOString();

          return (
            <div key={notif.id} className="relative pl-8">
              {/* Timeline dot */}
              <div
                className="absolute -left-[5px] top-4 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10"
                style={{ background: config.color }}
              />

              <div
                className="rounded-2xl p-5 bg-white border transition-all hover:shadow-md duration-300"
                style={{ borderLeftWidth: '3px', borderLeftColor: config.color }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: config.bg, color: config.color }}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{notif.announcement_title || notif.title}</h4>
                      <span
                        className="inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-md mt-0.5"
                        style={{ background: config.bg, color: config.color }}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap shrink-0">
                    {timeAgo(dateStr)}
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mt-2 pl-10">
                  {notif.announcement_content || notif.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityNotificationsTab;
