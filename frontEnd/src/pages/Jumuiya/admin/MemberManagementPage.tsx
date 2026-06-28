import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import RegistrationDashboard from "./RegistrationDashboard";
import MemberImportForm from "./MemberImportForm";
import ValidationReview from "./ValidationReview";
import OrganizationPanel from "./OrganizationPanel";
import MembersList from "./MembersList";
import { FaTachometerAlt, FaUpload, FaCheckCircle, FaLayerGroup, FaUsers } from "react-icons/fa";

type TabId = "dashboard" | "import" | "review" | "organize" | "members";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
  { id: "import", label: "Import", icon: <FaUpload /> },
  { id: "review", label: "Review", icon: <FaCheckCircle /> },
  { id: "organize", label: "Organize", icon: <FaLayerGroup /> },
  { id: "members", label: "All Members", icon: <FaUsers /> },
];

const MemberManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getJumuiyaById } = useData();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const jumuiya = id ? getJumuiyaById(id) : null;
  const jumuiyaId = id || "";
  const jumuiyaName = jumuiya?.name || jumuiyaId;
  const jumuiyaColor = jumuiya?.color || "#6366f1";

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <RegistrationDashboard jumuiyaId={jumuiyaId} jumuiyaName={jumuiyaName} jumuiyaColor={jumuiyaColor} />;
      case "import":
        return <MemberImportForm jumuiyaId={jumuiyaId} />;
      case "review":
        return <ValidationReview jumuiyaId={jumuiyaId} />;
      case "organize":
        return <OrganizationPanel jumuiyaId={jumuiyaId} />;
      case "members":
        return <MembersList jumuiyaId={jumuiyaId} jumuiyaName={jumuiyaName} />;
    }
  };

  return (
    <div className="admin-card" style={{ padding: 0 }}>
      <div style={{ borderBottom: "1px solid #e5e7eb", padding: "16px 20px", background: "#f9fafb", borderRadius: "8px 8px 0 0" }}>
        <h2 style={{ margin: 0 }}>{jumuiyaName} — Member Management</h2>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb", overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "12px 20px",
              border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 500,
              color: activeTab === tab.id ? jumuiyaColor : "#6b7280",
              borderBottom: activeTab === tab.id ? `3px solid ${jumuiyaColor}` : "3px solid transparent",
              background: activeTab === tab.id ? "white" : "transparent",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "20px" }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default MemberManagementPage;
