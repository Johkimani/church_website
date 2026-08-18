import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaTrash,
  FaPlus,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaEdit,
} from "react-icons/fa";
import jumuiyaNotificationsService, {
  type BackendNotification,
} from "../../../api/jumuiyaNotificationsService";

const TYPE_OPTIONS = [
  { value: "info", label: "Info", color: "#3b82f6", bg: "#eff6ff" },
  { value: "success", label: "Success", color: "#10b981", bg: "#f0fdf4" },
  { value: "warning", label: "Warning", color: "#f59e0b", bg: "#fffbeb" },
  { value: "urgent", label: "Urgent", color: "#ef4444", bg: "#fef2f2" },
];

const typeMeta = (type: string) =>
  TYPE_OPTIONS.find((t) => t.value === type) ?? TYPE_OPTIONS[0];

const typeIcon = (type: string) => {
  switch (type) {
    case "success":
      return <FaCheckCircle />;
    case "warning":
      return <FaExclamationTriangle />;
    case "urgent":
      return <FaExclamationCircle />;
    default:
      return <FaInfoCircle />;
  }
};

export default function JumuiyaNotificationsAdmin() {
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editType, setEditType] = useState("info");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await jumuiyaNotificationsService.list();
      setNotifications(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await jumuiyaNotificationsService.create({ title, message, status: type });
      setTitle("");
      setMessage("");
      setType("info");
      await fetchNotifications();
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await jumuiyaNotificationsService.remove(id);
      await fetchNotifications();
    } catch {
      // silent
    }
  };

  const startEdit = (n: BackendNotification) => {
    setEditingId(n.id);
    setEditTitle(n.title);
    setEditMessage(n.message);
    setEditType(n.status || "info");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditMessage("");
    setEditType("info");
  };

  const saveEdit = async (id: number) => {
    if (!editTitle.trim() || !editMessage.trim()) return;
    try {
      await jumuiyaNotificationsService.update(id, {
        title: editTitle,
        message: editMessage,
        status: editType,
      });
      cancelEdit();
      await fetchNotifications();
    } catch {
      // silent
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <FaBell style={{ color: "var(--primary)" }} />
          Community Updates
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Post announcements visible to all members of your jumuiya
        </p>
      </div>

      <form
        onSubmit={handlePost}
        style={{
          marginBottom: 40,
          padding: 24,
          background: "var(--bg-secondary, #f8f9fa)",
          borderRadius: 16,
          border: "1px solid var(--border-color, #e2e8f0)",
        }}
      >
        <h3 style={{ marginBottom: 20, fontSize: "1.1rem" }}>
          Post New Announcement
        </h3>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title..."
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid var(--border-color, #e2e8f0)",
              boxSizing: "border-box",
              fontSize: "1rem",
            }}
            required
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification details..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid var(--border-color, #e2e8f0)",
                resize: "vertical",
                fontFamily: "inherit",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
              required
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid var(--border-color, #e2e8f0)",
                background: "white",
                height: 46,
                fontSize: "1rem",
              }}
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
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 32px",
            borderRadius: 12,
            background: "var(--primary, #6366f1)",
            color: "white",
            border: "none",
            fontWeight: 600,
            cursor: sending ? "not-allowed" : "pointer",
            fontSize: "1rem",
            opacity: sending ? 0.7 : 1,
          }}
        >
          {sending ? <FaSpinner className="spin" /> : <FaPlus />}
          Post Announcement
        </button>
      </form>

      <h3
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <FaBell /> Your Notifications ({notifications.length})
      </h3>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48 }}>
          <FaSpinner className="spin" style={{ fontSize: "2rem", opacity: 0.4 }} />
        </div>
      ) : notifications.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 32px",
            color: "var(--text-secondary)",
            background: "var(--bg-secondary, #f8f9fa)",
            borderRadius: 16,
            border: "2px dashed var(--border-color, #e2e8f0)",
          }}
        >
          <FaBell style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 8px 0" }}>
            No notifications posted yet
          </p>
          <p style={{ fontSize: "0.9rem", margin: 0 }}>
            Create your first announcement using the form above
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {notifications.map((n) => {
            const meta = typeMeta(n.status || "info");
            const isEditing = editingId === n.id;

            return (
              <div
                key={n.id}
                style={{
                  padding: 20,
                  background: "white",
                  borderRadius: 16,
                  border: "1px solid var(--border-color, #e2e8f0)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  borderLeft: `4px solid ${meta.color}`,
                }}
              >
                {isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid var(--border-color, #e2e8f0)",
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    />
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      rows={3}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid var(--border-color, #e2e8f0)",
                        fontFamily: "inherit",
                        fontSize: "0.95rem",
                        resize: "vertical",
                      }}
                    />
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1px solid var(--border-color, #e2e8f0)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {TYPE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <div style={{ flex: 1 }} />
                      <button
                        onClick={cancelEdit}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          border: "1px solid var(--border-color, #e2e8f0)",
                          background: "white",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(n.id)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          border: "none",
                          background: "var(--primary, #6366f1)",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 12px",
                            borderRadius: 20,
                            background: meta.bg,
                            color: meta.color,
                            fontSize: "0.7rem",
                            fontWeight: 700,
                          }}
                        >
                          {typeIcon(n.status || "info")}{" "}
                          {(n.status || "info").toUpperCase()}
                        </span>
                        <span
                          style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}
                        >
                          {formatDate(n.created_at)}
                        </span>
                        {n.posted_by && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-secondary)",
                              fontStyle: "italic",
                            }}
                          >
                            by {n.posted_by}
                          </span>
                        )}
                      </div>
                      <h4
                        style={{
                          margin: "0 0 6px 0",
                          fontSize: "1.05rem",
                          fontWeight: 700,
                        }}
                      >
                        {n.title}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-primary)",
                          fontSize: "0.95rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {n.message}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => startEdit(n)}
                        style={{
                          background: "rgba(99,102,241,0.1)",
                          color: "#6366f1",
                          border: "none",
                          padding: 10,
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                        title="Edit notification"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          color: "#ef4444",
                          border: "none",
                          padding: 10,
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                        title="Delete notification"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
