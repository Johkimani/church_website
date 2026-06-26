import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

interface AdminMembersProps {
  jumuiyaId?: string;
}

const AdminMembers: React.FC<AdminMembersProps> = ({ jumuiyaId }) => {
  return (
    <div className="admin-card">
      <h2>Manage Members</h2>
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        <p>Member management is now handled from the global admin panel.</p>
        <p style={{ marginTop: "16px" }}>
          <a
            href={`/admin/jumuiya-members${jumuiyaId ? `/${jumuiyaId}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", background: "#6366f1", color: "white",
              borderRadius: "8px", textDecoration: "none", fontWeight: 600,
            }}
          >
            Open Member Management <FaExternalLinkAlt size={12} />
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminMembers;
