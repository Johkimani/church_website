import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiClient } from "../../../api/axiosInstance";
import jumuiyaNotificationsService from "../../../api/jumuiyaNotificationsService";
import { timeAgo } from "../../../utils";
import { SkeletonCardGrid } from "../../../components/Skeleton";
import toast from "react-hot-toast";
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Save,
  Loader2,
} from "lucide-react";

const TYPE_OPTIONS = [
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "urgent", label: "Urgent" },
];

const typeBadge = (type: string) => {
  switch (type) {
    case "success":
      return "text-emerald-700 bg-emerald-50 border-emerald-100";
    case "warning":
      return "text-amber-700 bg-amber-50 border-amber-100";
    case "urgent":
      return "text-rose-700 bg-rose-50 border-rose-100";
    default:
      return "text-blue-700 bg-blue-50 border-blue-100";
  }
};

const typeIcon = (type: string) => {
  switch (type) {
    case "success":
      return <CheckCircle2 className="w-3 h-3" />;
    case "warning":
      return <AlertTriangle className="w-3 h-3" />;
    case "urgent":
      return <AlertCircle className="w-3 h-3" />;
    default:
      return <Info className="w-3 h-3" />;
  }
};

interface LocalNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  date: string;
  postedBy: string;
}

interface JumuiyaInfo {
  id: string;
  name: string;
  notifications: LocalNotification[];
}

export default function JumuiyaNotificationsAdmin() {
  const { user } = useAuth();
  const jumuiyaId = user?.jumuiya_id || "";

  const [jumuiya, setJumuiya] = useState<JumuiyaInfo | null>(null);
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editType, setEditType] = useState("info");

  const loadJumuiyaData = useCallback(async () => {
    if (!jumuiyaId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get("/jumuiya-data/all");
      if (response.data?.success) {
        const backendList = response.data.data;
        const found = backendList.find(
          (b: any) => String(b.group_id) === String(jumuiyaId)
        );
        if (found) {
          const notifs: LocalNotification[] = (found.notifications || []).map(
            (n: any) => ({
              id: n.id ?? String(Math.random()),
              title: n.title,
              message: n.message,
              type: n.type || "info",
              date: n.date || n.posted_at || new Date().toISOString(),
              postedBy: n.postedBy || n.posted_by || "",
            })
          );
          setJumuiya({ id: found.id, name: found.name, notifications: notifs });
          setNotifications(notifs);
        }
      }
    } catch {
      toast.error("Failed to load your notifications");
    } finally {
      setLoading(false);
    }
  }, [jumuiyaId]);

  useEffect(() => {
    loadJumuiyaData();
  }, [loadJumuiyaData]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await jumuiyaNotificationsService.create({ title, message, status: type });
      setTitle("");
      setMessage("");
      setType("info");
      toast.success("Announcement posted successfully!");
      await loadJumuiyaData();
    } catch {
      toast.error("Failed to post announcement");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      const numId = parseInt(id.replace(/\D/g, ""), 10);
      if (!isNaN(numId)) {
        await jumuiyaNotificationsService.remove(numId);
      }
      toast.success("Notification deleted");
      await loadJumuiyaData();
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const startEdit = (n: LocalNotification) => {
    setEditingId(n.id);
    setEditTitle(n.title);
    setEditMessage(n.message);
    setEditType(n.type || "info");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditMessage("");
    setEditType("info");
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim() || !editMessage.trim()) return;
    try {
      const numId = parseInt(id.replace(/\D/g, ""), 10);
      if (!isNaN(numId)) {
        await jumuiyaNotificationsService.update(numId, {
          title: editTitle,
          message: editMessage,
          status: editType,
        });
      }
      toast.success("Notification updated");
      cancelEdit();
      await loadJumuiyaData();
    } catch {
      toast.error("Failed to update notification");
    }
  };

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <Megaphone size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Community Updates</h2>
            <p className="text-xs text-slate-500 font-medium">
              {jumuiya ? `${jumuiya.name} — post announcements visible to all members` : "Post announcements visible to all members"}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <SkeletonCardGrid count={3} />
      ) : !jumuiya ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 text-2xl shadow-inner">
            <Bell size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Jumuiya not found</h3>
          <p className="text-sm text-slate-400 max-w-sm">Your account is not linked to a jumuiya.</p>
        </div>
      ) : (
        <>
          {/* Post New Announcement form */}
          <form
            onSubmit={handlePost}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Plus size={18} />
              </div>
              <h3 className="text-base font-black text-slate-800">Post New Announcement</h3>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Notification details..."
                  rows={3}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all resize-y"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-[46px] px-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Post Announcement
            </button>
          </form>

          {/* Your Notifications */}
          <div className="flex items-center gap-2 pt-2">
            <Bell size={18} className="text-emerald-600" />
            <h3 className="text-base font-black text-slate-800">
              Your Notifications ({notifications.length})
            </h3>
          </div>

          {sorted.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 text-2xl shadow-inner">
                <Bell size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No notifications posted yet</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Create your first announcement using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((n) => (
                <div
                  key={n.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow duration-200"
                >
                  {editingId === n.id ? (
                    <div className="flex-1 min-w-0 space-y-3">
                      <div
                        className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"
                        title="Editing"
                      >
                        <Edit2 size={16} />
                      </div>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                      />
                      <textarea
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        rows={3}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all resize-y"
                      />
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all"
                      >
                        {TYPE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => saveEdit(n.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                        >
                          <Save size={14} />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] border px-2.5 py-1 rounded-full ${typeBadge(n.type || "info")}`}
                          >
                            {typeIcon(n.type || "info")} {(n.type || "info").toUpperCase()}
                          </span>
                          {n.postedBy && (
                            <span className="text-[10px] font-bold text-slate-400 italic">
                              by {n.postedBy}
                            </span>
                          )}
                          <span className="ml-auto text-[10px] font-bold text-slate-400">
                            {timeAgo(n.date)}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 mb-1">{n.title}</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                          {n.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => startEdit(n)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 text-xs font-bold transition-colors"
                          title="Edit notification"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
