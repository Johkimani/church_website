/**
 * NotificationContext — application-wide notification state.
 *
 * Data sources:
 *   1. REST  GET /notifications  on mount and manual refresh  (history)
 *   2. SSE events  notification_new / notification_updated / notification_deleted
 *      (real-time delivery via SSEContext — no Socket.IO dependency here)
 *
 * Socket.IO (SocketContext) is left untouched; it serves the officials page.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSSE }        from "./SSEContext";
import { useAuth }       from "./AuthContext";
import { fetchNotifications } from "../api/axiosInstance";
import type { Event }    from "../interface/api";

// ── Context shape ─────────────────────────────────────────────────────────────

interface NotificationContextType {
  notifications: Event[];
  unreadCount:   number;
  markAllAsRead: (category: "csa" | "jumuiya") => void;
  loading:       boolean;
  refreshNotifications: () => Promise<void>;
  isConnected:   boolean;
  socketError:   any;          // kept for backward-compat (always null with SSE)
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// ── Provider ──────────────────────────────────────────────────────────────────

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { subscribe, isConnected } = useSSE();
  const { user }                    = useAuth();

  const [notifications, setNotifications] = useState<Event[]>([]);
  const [loading, setLoading]             = useState(false);

  // ── Initial REST fetch (notification history) ────────────────────────────
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchNotifications();
      const data = res.data;
      if (Array.isArray(data)) {
        setNotifications(data as Event[]);
      }
    } catch (err) {
      console.warn("[Notifications] Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // ── SSE real-time subscriptions ──────────────────────────────────────────
  useEffect(() => {
    /**
     * notification_new  → prepend to the list (unread by default).
     * Deduplication: if the same id already exists (e.g. REST and SSE race),
     * the SSE version wins (it's fresher).
     */
    const unsubNew = subscribe<any>("notification_new", (data) => {
      const notif: Event = {
        id:        data.id,
        text:      data.title  ?? data.text ?? "New notification",
        category:  data.category ?? (data.posted_to === "csa" ? "csa" : "jumuiya"),
        posted_by: data.posted_by ?? "",
        createdAt: data.createdAt ?? data.created_at ?? new Date().toISOString(),
        read:      false,
        images:    Array.isArray(data.images) ? data.images : [],
        // pass everything through so extra fields are preserved
        ...data,
      };
      setNotifications((prev) => [
        notif,
        ...prev.filter((n) => n.id !== notif.id),
      ]);
    });

    /**
     * notification_updated  → merge changes into the existing entry.
     */
    const unsubUpdated = subscribe<any>("notification_updated", (data) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === data.id
            ? {
                ...n,
                ...data,
                text: data.title ?? data.text ?? n.text,
                read: n.read,     // preserve local read state on edit
              }
            : n
        )
      );
    });

    /**
     * notification_deleted  → remove by id instantly.
     */
    const unsubDeleted = subscribe<{ id: string }>("notification_deleted", ({ id }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    });

    return () => {
      unsubNew();
      unsubUpdated();
      unsubDeleted();
    };
  }, [subscribe]);

  // ── Badge count (from SSE individual channel) ────────────────────────────
  // The server sends the authoritative unread count on connect and after each
  // CRUD operation — we also derive it locally from state for instant UI.
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Mark all read for a category (local only) ────────────────────────────
  const markAllAsRead = useCallback((category: "csa" | "jumuiya") => {
    setNotifications((prev) => {
      const hasUnread = prev.some((n) => n.category === category && !n.read);
      if (!hasUnread) return prev;
      return prev.map((n) =>
        n.category === category ? { ...n, read: true } : n
      );
    });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        loading,
        refreshNotifications,
        isConnected,
        socketError: null,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
};
