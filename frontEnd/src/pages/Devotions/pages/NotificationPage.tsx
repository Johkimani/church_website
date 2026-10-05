import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaInbox, FaUsers, FaChurch, FaRegClock } from "react-icons/fa";
import { MdHistory } from "react-icons/md";
import { useNotifications } from "../../../context/NotificationContext";
import { timeAgo } from "../../../utils";
import type { fileUpload, Event as BaseEvent } from "../../../interface/api";

// Extend the base Event with fields the card actually uses
type NotificationEvent = BaseEvent & {
  status?: string;
  posted_by?: string;
  message?: string;
  images?: (string | fileUpload)[];
};

// images from backend can be a URL string OR a full fileUpload object
type NotificationImage = string | fileUpload;

// Helper: normalise any image variant to a URL string
const resolveImageUrl = (img: NotificationImage): string =>
  typeof img === "string" ? img : img.url;

// --- Components ---

const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}> = ({ icon, title, description, gradient }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in zoom-in duration-700">
    <div className={`w-20 h-20 rounded-2xl ${gradient} flex items-center justify-center text-white text-3xl shadow-xl mb-6 relative border-2 border-amber-400/40 backdrop-blur-sm group`}>
      <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-xl group-hover:blur-2xl transition-all" />
      <div className="relative z-10 transition-transform group-hover:scale-110">
        {icon}
      </div>
    </div>
    <h3 className="text-2xl font-black text-stone-900 mb-2 tracking-tight">{title}</h3>
    <p className="text-stone-500 max-w-xs font-bold text-xs leading-relaxed">{description}</p>
  </div>
);

const NotificationCard: React.FC<{ event: NotificationEvent }> = ({ event }) => {
  const isJumuiya = event.category === "jumuiya";
  const avatarBg = isJumuiya ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-amber-500/10 text-amber-700 border-amber-500/30";
  const Icon = isJumuiya ? FaUsers : FaChurch;

  return (
    <div className="group relative bg-white rounded-[32px] p-6 border border-stone-200 shadow-sm hover:shadow-2xl hover:shadow-amber-900/5 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
       {/* New Badge */}
       {!event.read && (
         <div className="absolute top-6 right-6 px-3 py-1 bg-amber-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-amber-500/10 animate-pulse">
            New
         </div>
       )}

       <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar Area */}
          <div className="relative shrink-0 flex items-start justify-center">
             <div className={`w-14 h-14 rounded-3xl ${avatarBg} border-2 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <Icon />
             </div>
             {/* Dynamic Status Glow */}
             {!event.read && (
               <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isJumuiya ? 'bg-emerald-500' : 'bg-amber-500'}`} />
             )}
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
             <div className="flex items-center flex-wrap gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isJumuiya ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-700'}`}>
                   {event.category}
                </span>
                {event?.status === 'urgent' && (
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-600 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                     Urgent
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 ml-auto">
                   <FaRegClock className="text-[10px]" />
                   {timeAgo(event.createdAt)}
                </span>
             </div>

             <h4 className="text-lg font-black text-stone-900 leading-tight mb-2 pr-12 group-hover:text-amber-700 transition-colors">
                {event.text}
             </h4>

             <p className="text-xs text-stone-500 font-black uppercase tracking-widest mb-3">
                Posted by {event.posted_by || "Admin"}
             </p>

             {event.message && (
               <p className="text-sm text-stone-600 font-medium mb-5 leading-relaxed whitespace-pre-line">
                  {event.message}
               </p>
             )}


             {Array.isArray(event.images) && event.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {event.images.slice(0, 3).map((img: string, i: number) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 group/img shadow-sm">
                         <img
                           src={resolveImageUrl(img)}
                           alt={`attachment-${i + 1}`}
                           className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                         />
                         <div className="absolute inset-0 bg-black/5 group-hover/img:bg-transparent transition-colors" />
                      </div>
                   ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

const Notifications: React.FC = () => {
  const { notifications, markAllAsRead, isConnected } = useNotifications();

  const [activeCategory, setActiveCategory] = useState<"csa" | "jumuiya" | null>(null);

  useEffect(() => {
    if (activeCategory) {
      const hasUnread = notifications.some(n => n.category === activeCategory && !n.read);
      if (hasUnread) markAllAsRead(activeCategory);
    }
  }, [activeCategory, markAllAsRead, notifications]);

  const unreadCSA = notifications.filter(e => e.category === "csa" && !e.read).length;
  const unreadJumuiya = notifications.filter(e => e.category === "jumuiya" && !e.read).length;
  const totalUnread = unreadCSA + unreadJumuiya;

  const filteredEvents = activeCategory
    ? notifications.filter((e) => e.category === activeCategory)
    : [];

  return (
    <div className="min-h-screen bg-transparent pb-32">
       {/* Background Decoration */}
       <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
       </div>

       <div className="max-w-3xl mx-auto px-6 pt-4 sm:pt-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-top-6 duration-700">
             <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight mb-2">
                Updates
             </h1>
             <div className="flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? (totalUnread > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500') : 'bg-stone-400'}`} />
                <p className={`font-black uppercase tracking-widest text-[10px] sm:text-xs transition-colors duration-500 ${totalUnread === 0 ? 'text-red-600' : 'text-stone-500'}`}>
                   {totalUnread > 0 ? `You have ${totalUnread} new messages` : '0 Unread Notifications'}
                </p>
             </div>
          </div>

          {/* Switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-stone-100 backdrop-blur-md rounded-2xl border border-stone-200 gap-1.5 w-full max-w-md">
               <button
                  id="notif-csa-tab"
                  onClick={() => setActiveCategory("csa")}
                  className={`flex-1 py-2 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                     activeCategory === "csa"
                     ? "bg-amber-600 text-white shadow-lg shadow-amber-900/10 scale-[1.02]"
                     : "text-stone-500 hover:bg-stone-200"
                  }`}
               >
                   CSA {unreadCSA > 0 && <span className={`ml-1 ${activeCategory === "csa" ? "text-amber-300" : "text-amber-600"}`}>({unreadCSA})</span>}
               </button>
               <button
                  id="notif-jumuiya-tab"
                  onClick={() => setActiveCategory("jumuiya")}
                  className={`flex-1 py-2 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                     activeCategory === "jumuiya"
                     ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/10 scale-[1.02]"
                     : "text-stone-500 hover:bg-stone-200"
                  }`}
               >
                   Jumuiya {unreadJumuiya > 0 && <span className={`ml-1 ${activeCategory === "jumuiya" ? "text-emerald-300" : "text-emerald-600"}`}>({unreadJumuiya})</span>}
               </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-4 min-h-[400px]">
             {!activeCategory ? (
                <EmptyState
                   icon={<FaInbox />}
                   title="Select a Channel"
                   description="Choose between CSA or your Jumuiya to see the latest announcements and events."
                   gradient="bg-gradient-to-br from-amber-500 to-amber-700"
                />
             ) : filteredEvents.length === 0 ? (
                <EmptyState
                   icon={<FaCheckCircle />}
                   title="All caught up!"
                   description={`There are no new notifications for ${activeCategory.toUpperCase()} right now.`}
                   gradient={activeCategory === 'csa' ? "bg-gradient-to-br from-amber-500 to-amber-700" : "bg-gradient-to-br from-emerald-500 to-teal-600"}
                />
             ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                   <div className="flex items-center gap-2 mb-6 px-1">
                      <MdHistory className="text-stone-500 text-lg" />
                      <span className="text-[10px] uppercase font-black tracking-widest text-stone-500">Recent Notifications</span>
                   </div>
                   {filteredEvents.map((event) => (
                      <NotificationCard key={event.id} event={event} />
                   ))}
                </div>
             )}
          </div>

        </div>
     </div>
  );
};

export default Notifications;
