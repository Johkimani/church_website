import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchNotifications,
  createNotificationEventApi,
  updateNotificationEventApi,
  apiClient,
} from "../../../api/axiosInstance";
import NotificationModal from "../../Devotions/components/NotificationModal";
import { timeAgo } from "../../../utils";
import toast from "react-hot-toast";
import { Bell, Plus, Edit2, Trash2, AlertCircle, Megaphone } from "lucide-react";
import type { NotificationPayload } from "../../../interface/api";

interface JumuiyaAnnouncementsProps {
  jumuiyaId: string;
  jumuiyaName: string;
  jumuiyaColor?: string;
}

export default function JumuiyaAnnouncementsRegister({
  jumuiyaId,
  jumuiyaName,
  jumuiyaColor = "#10b981",
}: JumuiyaAnnouncementsProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotif, setEditingNotif] = useState<any | null>(null);

  const roles = useMemo(() => {
    const r = user?.role;
    return Array.isArray(r) ? r : r ? [r] : [];
  }, [user?.role]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications();
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      // Filter for this specific jumuiya (or matching jumuiya_id/slug)
      const jumuiyaNotifs = data.filter((n: any) => {
        const posted = String(n.posted_to || n.category || "").toLowerCase();
        const jId = String(jumuiyaId || "").toLowerCase();
        return posted !== "csa" && (posted === jId || posted === "jumuia" || posted === "jumuiya");
      });
      setNotifications(jumuiyaNotifs);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [jumuiyaId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleCreate = async (data: NotificationPayload) => {
    try {
      await createNotificationEventApi({
        ...data,
        posted_To: jumuiyaId,
      });
      toast.success("Jumuiya announcement published successfully!");
      setShowModal(false);
      await loadNotifications();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to publish announcement");
    }
  };

  const handleUpdate = async (data: NotificationPayload & { _editId?: string | number }) => {
    const id = (data as any)._editId ?? editingNotif?.id;
    if (!id) return;
    try {
      await updateNotificationEventApi(id, {
        title: data.title,
        message: data.message,
        status: data.status,
      });
      toast.success("Announcement updated");
      setEditingNotif(null);
      await loadNotifications();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to update announcement");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await apiClient.delete(`/notifications/${id}`);
      toast.success("Announcement deleted");
      await loadNotifications();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.message || "Failed to delete announcement");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: jumuiyaColor }}
          >
            <Megaphone size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{jumuiyaName} Announcements</h2>
            <p className="text-xs text-slate-500 font-medium">
              Manage updates and notices specifically for members of {jumuiyaName}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200"
        >
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded-full w-24 mb-3" />
              <div className="h-5 bg-slate-100 rounded-full w-1/2 mb-2" />
              <div className="h-4 bg-slate-100 rounded-full w-3/4" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 text-2xl shadow-inner">
            <Bell size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Jumuiya Announcements</h3>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            You haven't posted any announcements for {jumuiyaName} yet. Click below to create your first announcement.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-100"
          >
            <Plus size={16} />
            Post First Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n: any) => {
            const priority = n.status ?? "normal";
            const title = n.title ?? n.text ?? "";
            const message = n.message ?? "";
            const createdAt = n.created_at ?? n.createdAt;

            return (
              <div
                key={n.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {priority === "urgent" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Urgent
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">
                        Normal
                      </span>
                    )}
                    {createdAt && (
                      <span className="ml-auto text-[10px] font-bold text-slate-400">
                        {timeAgo(createdAt)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-1">{title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">
                    {message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingNotif(n)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 text-xs font-bold transition-colors"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <NotificationModal
          roles={roles}
          lockedTo="jumuiya"
          createNotification={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingNotif && (
        <NotificationModal
          roles={roles}
          lockedTo="jumuiya"
          initialData={{
            id: editingNotif.id,
            title: editingNotif.title ?? editingNotif.text ?? "",
            message: editingNotif.message ?? "",
            status: editingNotif.status ?? "normal",
          }}
          createNotification={handleUpdate as any}
          onClose={() => setEditingNotif(null)}
        />
      )}
    </div>
  );
}
