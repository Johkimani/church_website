import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUsers, FaMale, FaFemale, FaArrowLeft, FaChurch, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { memberService } from "../../../api/jumuiyaMemberService";
import RegistrationDashboard from "../../Jumuiya/admin/RegistrationDashboard";
import MemberImportForm from "../../Jumuiya/admin/MemberImportForm";
import ValidationReview from "../../Jumuiya/admin/ValidationReview";
import OrganizationPanel from "../../Jumuiya/admin/OrganizationPanel";
import DistributionResults from "../../Jumuiya/admin/DistributionResults";

const JUMUIYAS = [
  { id: "st-anthony", name: "St. Anthony of Padua", color: "#dc2626" },
  { id: "st-augustine", name: "St. Augustine of Hippo", color: "#2563eb" },
  { id: "st-catherine", name: "St. Catherine of Alexandria", color: "#9333ea" },
  { id: "st-dominic", name: "St. Dominic", color: "#ca8a04" },
  { id: "st-elizabeth", name: "St. Elizabeth of Hungary", color: "#0891b2" },
  { id: "st-maria-goretti", name: "St. Maria Goretti", color: "#db2777" },
  { id: "st-monica", name: "St. Monica", color: "#059669" },
];

type Tab = "dashboard" | "import" | "review" | "organize" | "results";

const MemberManagementView: React.FC<{ jumuiyaId: string; jumuiyaName: string; jumuiyaColor: string }> = ({ jumuiyaId, jumuiyaName, jumuiyaColor }) => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "import", label: "Import" },
    { id: "review", label: "Review" },
    { id: "organize", label: "Organize" },
    { id: "results", label: "Results" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb", marginBottom: "20px" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 500,
              color: activeTab === tab.id ? jumuiyaColor : "#6b7280",
              borderBottom: activeTab === tab.id ? `3px solid ${jumuiyaColor}` : "3px solid transparent",
              background: "transparent", transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && <RegistrationDashboard jumuiyaId={jumuiyaId} jumuiyaName={jumuiyaName} jumuiyaColor={jumuiyaColor} />}
      {activeTab === "import" && <MemberImportForm jumuiyaId={jumuiyaId} />}
      {activeTab === "review" && <ValidationReview jumuiyaId={jumuiyaId} />}
      {activeTab === "organize" && <OrganizationPanel jumuiyaId={jumuiyaId} />}
      {activeTab === "results" && <DistributionResults jumuiyaId={jumuiyaId} jumuiyaName={jumuiyaName} />}
    </div>
  );
};

const JumuiyaMembersAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) return;
    const fetchAllStats = async () => {
      setLoading(true);
      const results: Record<string, any> = {};
      for (const j of JUMUIYAS) {
        try {
          const res = await memberService.getStatistics(j.id);
          results[j.id] = res.data;
        } catch {
          results[j.id] = null;
        }
      }
      setStats(results);
      setLoading(false);
    };
    fetchAllStats();
  }, [id]);

  if (id) {
    const jumuiya = JUMUIYAS.find(j => j.id === id);
    if (!jumuiya) return <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>Jumuiya not found</div>;
    return (
      <div>
        <button onClick={() => navigate("/admin/jumuiya-members")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 0", border: "none", background: "none", cursor: "pointer", color: "#6366f1", marginBottom: "16px" }}>
          <FaArrowLeft /> Back to all Jumuiyas
        </button>
        <MemberManagementView jumuiyaId={id} jumuiyaName={jumuiya.name} jumuiyaColor={jumuiya.color} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}><FaChurch /> Jumuiya Members Management</h2>
        <p style={{ color: "#6b7280" }}>Select a Jumuiya to manage its member registration, validation, organization, and distribution.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading statistics...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {JUMUIYAS.map((j) => {
            const s = stats[j.id];
            return (
              <button
                key={j.id}
                onClick={() => navigate(`/admin/jumuiya-members/${j.id}`)}
                style={{
                  padding: "24px", borderRadius: "12px", border: `1px solid ${j.color}20`,
                  background: "white", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "12px",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 12px ${j.color}30`; e.currentTarget.style.borderColor = j.color; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = `${j.color}20`; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: j.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.2rem" }}>
                    <FaUsers />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{j.name}</h3>
                  </div>
                </div>

                {s ? (
                  <div style={{ display: "flex", gap: "16px", fontSize: "0.85rem", color: "#6b7280" }}>
                    <span><FaCheckCircle style={{ color: "#22c55e" }} /> {s.imports?.valid || 0} valid</span>
                    <span><FaExclamationTriangle style={{ color: "#ef4444" }} /> {s.imports?.errors || 0} errors</span>
                    <span><FaUsers /> {s.groups?.length || 0} groups</span>
                  </div>
                ) : (
                  <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>No data yet — click to get started</div>
                )}

                {s?.genderBreakdown && s.genderBreakdown.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", fontSize: "0.8rem" }}>
                    {s.genderBreakdown.map((g: any) => (
                      <span key={g.gender} style={{ padding: "2px 8px", borderRadius: "6px", background: g.gender === "Male" ? "#dbeafe" : "#fce7f3", color: g.gender === "Male" ? "#2563eb" : "#db2777" }}>
                        {g.gender === "Male" ? <FaMale /> : <FaFemale />} {g.count}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JumuiyaMembersAdmin;
