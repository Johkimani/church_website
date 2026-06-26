import { useState, useEffect } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { FaHistory, FaDownload, FaUsers, FaMale, FaFemale } from "react-icons/fa";
import toast from "react-hot-toast";

interface Props {
  jumuiyaId: string;
  jumuiyaName: string;
}

const DistributionResults: React.FC<Props> = ({ jumuiyaId, jumuiyaName }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDist, setSelectedDist] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, statsRes] = await Promise.all([
        memberService.getDistributionHistory(jumuiyaId),
        memberService.getStatistics(jumuiyaId),
      ]);
      setHistory(historyRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error("Failed to load distribution data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [jumuiyaId]);

  const handleExportAssignments = async () => {
    try {
      const res = await memberService.exportAssignments(jumuiyaId);
      const dataStr = JSON.stringify(res.data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${jumuiyaName}-assignments.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Assignments exported");
    } catch {
      toast.error("Export failed");
    }
  };

  if (loading) {
    return <div className="admin-card"><p style={{ textAlign: "center", padding: "40px" }}>Loading...</p></div>;
  }

  return (
    <div className="admin-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2><FaHistory /> Distribution Results</h2>
        <button className="btn-secondary" onClick={handleExportAssignments}>
          <FaDownload /> Export Assignments
        </button>
      </div>

      {stats?.groups && stats.groups.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h3>Current Group Composition</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "12px", marginTop: "12px" }}>
            {stats.groups.map((g: any) => (
              <div key={g.id} style={{
                padding: "16px", borderRadius: "8px", background: "white",
                border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0 }}>{g.group_name}</h4>
                  <span style={{
                    padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem",
                    background: g.group_type === "male" ? "#dbeafe" : g.group_type === "female" ? "#fce7f3" : "#f3f4f6",
                    color: g.group_type === "male" ? "#2563eb" : g.group_type === "female" ? "#db2777" : "#374151",
                  }}>
                    {g.group_type}
                  </span>
                </div>
                <div style={{ marginTop: "8px", display: "flex", gap: "12px", fontSize: "0.9rem" }}>
                  <span><FaUsers /> {g.assigned_count || 0} / {g.capacity || "∞"}</span>
                </div>
                {g.capacity > 0 && (
                  <div style={{ height: "4px", background: "#e5e7eb", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "2px",
                      width: `${Math.min(((g.assigned_count || 0) / g.capacity) * 100, 100)}%`,
                      background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.genderBreakdown && stats.genderBreakdown.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h3>Gender Distribution</h3>
          <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
            {stats.genderBreakdown.map((g: any) => (
              <div key={g.gender} style={{
                padding: "12px 20px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px",
                background: g.gender === "Male" ? "#dbeafe" : g.gender === "Female" ? "#fce7f3" : "#f3f4f6",
              }}>
                {g.gender === "Male" ? <FaMale style={{ color: "#2563eb" }} /> : <FaFemale style={{ color: "#db2777" }} />}
                <span><strong>{g.gender}</strong>: {g.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3>Distribution History</h3>
      {history.length === 0 ? (
        <p style={{ padding: "20px 0", color: "#6b7280" }}>No distributions have been run yet.</p>
      ) : (
        <table className="premium-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Algorithm</th>
              <th>Members</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id}>
                <td>{h.distribution_date?.slice(0, 10)}</td>
                <td><code>{h.algorithm_used}</code></td>
                <td>{h.stats?.totalMembers || "—"}</td>
                <td>
                  <button className="btn-sm" onClick={() => setSelectedDist(selectedDist?.id === h.id ? null : h)}>
                    {selectedDist?.id === h.id ? "Hide Stats" : "View Stats"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedDist && selectedDist.stats?.assignmentsByGroup && (
        <div style={{ marginTop: "16px", padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
          <h4>Distribution Stats (ID: #{selectedDist.id})</h4>
          <p>Total: {selectedDist.stats.totalMembers} members | {selectedDist.stats.totalGroups} groups</p>
          <p>Male: {selectedDist.stats.maleCount} | Female: {selectedDist.stats.femaleCount}</p>
          <div style={{ marginTop: "8px" }}>
            {selectedDist.stats.assignmentsByGroup.map((a: any) => (
              <div key={a.groupId} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #e5e7eb" }}>
                <span>{a.groupName}</span>
                <strong>{a.count} members</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionResults;
