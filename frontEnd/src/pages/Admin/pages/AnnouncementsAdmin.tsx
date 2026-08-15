import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  apiClient,
  createNotificationEventApi,
  fetchNotifications,
  updateNotificationEventApi,
} from "../../../api/axiosInstance";
import NotificationModal from "../../Devotions/components/NotificationModal";
import { useAuth } from "../../../context/AuthContext";
import { timeAgo } from "../../../utils";
import type { NotificationPayload, Event as BaseEvent } from "../../../interface/api";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiLock,
  FiAlertCircle,
  FiBell,
} from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationAdminEvent = BaseEvent & {
  posted_to?: string;
  status?: string;
  title?: string;
  message?: string;
  created_at?: string;
  createdAt?: string;
  id: string | number;
};

type ActiveTab = "csa" | "jumuiya";

// ─── Role helpers ─────────────────────────────────────────────────────────────

const detectCapabilities = (roles: string[]) => {
  const normalised = roles.map((r) => String(r).toLowerCase().trim());
  const isCSAOs    = normalised.some((r) => r === "os" || r === "csa_chair");
  const isJumuiyaOs = normalised.some((r) => r === "jumuiya_os" || r === "os" || r === "csa_chair");
  return { isCSAOs, isJumuiyaOs };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const EmptyState: React.FC<{ channel: ActiveTab }> = ({ channel }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mb-5 shadow-lg ${channel === 'csa' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
      <FiBell />
    </div>
    <h3 className="text-lg font-black text-slate-800 mb-1">No notifications yet</h3>
    <p className="text-sm text-slate-400 font-medium max-w-xs">
      {channel === 'csa'
        ? 'No CSA-wide announcements have been created.'
        : 'No Jumuiya announcements have been created.'}
    </p>
  </div>
);

const ReadOnlyBanner: React.FC<{ channel: ActiveTab }> = ({ channel }) => (
  <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border mb-6 text-sm font-semibold ${channel === 'csa' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
    <FiLock className="shrink-0 text-base" />
    <span>
      You have <strong>read-only</strong> access to {channel === 'csa' ? 'CSA' : 'Jumuiya'} notifications. Only the designated OS can manage this channel.
    </span>
  </div>
);

interface NotificationRowProps {
  n: NotificationAdminEvent;
  canManage: boolean;
  onDelete: (id: string | number) => void;
  onEdit: (n: NotificationAdminEvent) => void;
}

const NotificationRow: React.FC<NotificationRowProps> = ({ n, canManage, onDelete, onEdit }) => {
  const priority = n.status ?? "normal";
  const title    = n.title ?? n.text ?? "";
  const message  = n.message ?? "";
  const createdAt = n.created_at ?? n.createdAt;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {priority === "urgent" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
              <FiAlertCircle className="text-[11px]" /> Urgent
            </span>
          )}
          {priority !== "urgent" && (
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
        <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{message}</p>
      </div>

      {canManage && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            id={`edit-notif-${n.id}`}
            onClick={() => onEdit(n)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 text-xs font-black transition-colors"
          >
            <FiEdit2 className="text-sm" />
            Edit
          </button>
          <button
            id={`delete-notif-${n.id}`}
            onClick={() => onDelete(n.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors"
          >
            <FiTrash2 className="text-sm" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnnouncementsAdmin() {
  const { user } = useAuth();

  const roles = useMemo(() => {
    const r = user?.role;
    return Array.isArray(r) ? r : r ? [r] : [];
  }, [user?.role]);
  const { isCSAOs } = useMemo(() => detectCapabilities(roles), [roles]);

  // Access gate — CSA OS role needed for CSA announcements page
  const canAccessPage = isCSAOs;


  const [showModal, setShowModal] = useState(false);
  const [editingNotif, setEditingNotif] = useState<NotificationAdminEvent | null>(null);
  const [notifications, setNotifications] = useState<NotificationAdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchNotifications();
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setNotifications(data);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || "Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canAccessPage) load();
  }, [canAccessPage, load]);

  // ── Filtered list for CSA announcements ─────────────────────────────────
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const cat = (n.category ?? n.posted_to ?? "").toLowerCase();
      return cat === "csa";
    });
  }, [notifications]);

  // ── Create ───────────────────────────────────────────────────────────────
  const handleCreate = useCallback(
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

  // ── Edit / Update ─────────────────────────────────────────────────────────
  const handleUpdate = useCallback(
    async (data: NotificationPayload & { _editId?: string | number }) => {
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
        await load();
      } catch (e: any) {
        toast.error(e?.response?.data?.error || e?.message || "Failed to update announcement");
      }
    },
    [editingNotif, load]
  );

  const openEdit = (n: NotificationAdminEvent) => {
    setEditingNotif(n);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (id: string | number) => {
      if (!window.confirm("Delete this announcement? This cannot be undone.")) return;
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

  // ── Access denied ─────────────────────────────────────────────────────────
  if (!canAccessPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 text-2xl">
          <FiLock />
        </div>
        <h2 className="text-xl font-black text-slate-800">Access Denied</h2>
        <p className="text-sm text-slate-500 font-medium text-center max-w-sm">
          You need a CSA OS role to manage CSA announcements. Contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Announcements Management (CSA)</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Create and manage general CSA-wide announcements.
          </p>
        </div>

        {isCSAOs && (
          <button
            id="create-announcement-btn"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white px-5 py-3 rounded-xl text-sm font-black transition-all shadow-md shadow-blue-200"
          >
            <FiPlus className="text-base" />
            New CSA Announcement
          </button>
        )}
      </div>

      {!isCSAOs && <ReadOnlyBanner channel="csa" />}


      {/* ── List ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
              <div className="h-3 bg-slate-100 rounded-full w-24 mb-3" />
              <div className="h-4 bg-slate-100 rounded-full w-1/2 mb-2" />
              <div className="h-3 bg-slate-100 rounded-full w-3/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState channel="csa" />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <NotificationRow
              key={n.id}
              n={n}
              canManage={isCSAOs}
              onDelete={handleDelete}
              onEdit={openEdit}
            />
          ))}
        </div>
      )}

      {/* ── Create Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <NotificationModal
          roles={roles}
          lockedTo="csa"
          createNotification={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      {editingNotif && (
        <NotificationModal
          roles={roles}
          lockedTo="csa"
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
