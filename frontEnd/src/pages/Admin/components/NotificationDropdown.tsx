import { Bell, MessageSquare, Heart, Check, X } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'suggestion' | 'donation' | 'system';
  title: string;
  message: string;
  time: string;
  rawDate: string;
  isRead: boolean;
  link?: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationDropdown({ 
  notifications, 
  onClose, 
  onMarkAsRead, 
  onClearAll 
}: NotificationDropdownProps) {
  return (
    <div className="absolute right-0 mt-4 w-[90vw] max-w-[28rem] sm:w-96 bg-slate-950 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
        <div>
          <h3 className="text-lg font-black text-white">Notifications</h3>
          <p className="text-xs text-slate-400 font-medium">{notifications.filter(n => !n.isRead).length} unread</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            className="p-2 rounded-2xl bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white transition-all duration-200"
            title="Clear All"
          >
            <Check size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white transition-all duration-200"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="max-h-[450px] overflow-y-auto bg-slate-950">
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-5 transition-all cursor-pointer relative group ${!notification.isRead ? 'bg-blue-950/70' : 'hover:bg-slate-900'}`}
                onClick={() => onMarkAsRead(notification.id)}
              >
                {!notification.isRead && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 rounded-tr-xl rounded-br-xl bg-blue-500"></span>
                )}

                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 rounded-3xl flex items-center justify-center shrink-0 shadow-lg ${
                      notification.type === 'suggestion' ? 'bg-blue-500/15 text-blue-300' :
                      notification.type === 'donation' ? 'bg-rose-500/15 text-rose-300' :
                      'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {notification.type === 'suggestion' ? <MessageSquare size={20} /> :
                     notification.type === 'donation' ? <Heart size={20} fill="currentColor" /> :
                     <Bell size={20} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-3">
                      <p className="text-sm font-semibold text-white truncate">{notification.title}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.24em] shrink-0">{notification.time}</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{notification.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 px-8 text-center bg-slate-950">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-blue-300" />
            </div>
            <p className="text-slate-300 font-semibold">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">No new notifications at the moment.</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 border-t border-slate-800 text-center bg-slate-950/95">
          <button
            className="text-xs font-black text-blue-400 hover:text-blue-200 uppercase tracking-widest transition-colors"
            onClick={onClose}
          >
            Close Panel
          </button>
        </div>
      )}
    </div>
  );
}
