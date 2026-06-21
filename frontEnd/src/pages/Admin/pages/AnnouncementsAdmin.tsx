import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { apiClient, createNotificationEventApi, fetchNotifications } from "../../../api/axiosInstance";
import NotificationModal from "../../Devotions/components/NotificationModal";
import { useAuth } from "../../../context/AuthContext";
import { timeAgo } from "../../../utils";
import type { NotificationPayload, fileUpload, Event as BaseEvent } from "../../../interface/api";

type NotificationAdminEvent = BaseEvent & {
  posted_to?: string;
  status?: string;
  title?: string;
  message?: string;
  created_at?: string;
  createdAt?: string;
  id: string | number;
};

const NotificationsRow: React.FC<{ n: NotificationAdminEvent; onDelete: (id: string | number) => void }> = ({ n, onDelete }) => {
  const postedTo = n.posted_to ?? "";
  const priority = n.status ?? "normal";
  const title = n.title ?? "";
  const message = n.message ?? "";
  const createdAt = n.created_at ?? n.createdAt;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border border-slate-200 px-2 py-1 rounded-full">
            Posted to: {postedTo}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border border-slate-200 px-2 py-1 rounded-full">
            Priority: {priority}
          </span>
          {createdAt && (
            <span className="ml-auto text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {timeAgo(createdAt)}
            </span>
          )}
        </div>
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600 font-medium leading-relaxed">{message}</p>
      </div>

      <button
        onClick={() => onDelete(n.id)}
        className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-black"
      >
        Delete
      </button>
    </div>
  );
};

export default function AnnouncementsAdmin() {
  const { user } = useAuth();

  const roles = useMemo(() => (Array.isArray(user?.role) ? user.role : []), [user?.role]);
  const isAdmin = roles.some((r) => String(r).toLowerCase().includes("admin"));

  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationAdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications();
      // backend returns an array directly (see events/index getNotification -> res.json(result.rows))
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setNotifications(data);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || "Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const createNotification = useCallback(
    async (data: NotificationPayload) => {
      try {
        await createNotificationEventApi(data);
        toast.success("Announcement created");
        setShowModal(false);
        await load();
      } catch (e: any) {
        toast.error(e?.response?.data?.error || e?.message || "Failed to create announcement");
      }
    },
    [load]
  );

  const deleteAnnouncement = useCallback(
    async (id: string | number) => {
      if (!window.confirm("Delete this announcement?")) return;
      try {
        await apiClient.delete(`/notifications/${id}`);
        toast.success("Announcement deleted");
        await load();
      } catch (e: any) {
        toast.error(e?.response?.data?.error || e?.message || "Failed to delete announcement");
      }
    },
    [load]
  );

  const rolesForModal = roles;

  if (!isAdmin) {
    return <div className="p-6">Access denied.</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Announcements Management</h2>
          <p className="text-slate-500 font-medium mt-1">Create and delete announcements visible to members.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-black"
        >
          Create Announcement
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-slate-500 font-medium">No announcements yet.</div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <NotificationsRow key={n.id} n={n} onDelete={deleteAnnouncement} />
          ))}
        </div>
      )}

      {showModal && (
        <NotificationModal
          roles={rolesForModal}
          createNotification={createNotification}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

