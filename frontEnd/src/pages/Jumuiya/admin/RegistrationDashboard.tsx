import { useState, useEffect } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { FaPlus, FaCalendarAlt, FaUsers, FaCheckCircle, FaExclamationTriangle, FaDownload } from "react-icons/fa";

interface Props {
  jumuiyaId: string;
  jumuiyaName: string;
  jumuiyaColor: string;
}

const RegistrationDashboard: React.FC<Props> = ({ jumuiyaId, jumuiyaName, jumuiyaColor }) => {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [seasonForm, setSeasonForm] = useState({ season_name: "", start_date: "", end_date: "", status: "planning" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [seasonsRes, statsRes] = await Promise.all([
        memberService.getSeasons(jumuiyaId),
        memberService.getStatistics(jumuiyaId),
      ]);
      setSeasons(seasonsRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [jumuiyaId]);

  const handleCreateSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await memberService.createSeason(jumuiyaId, seasonForm);
      setShowSeasonModal(false);
      setSeasonForm({ season_name: "", start_date: "", end_date: "", status: "planning" });
      fetchData();
    } catch (err) {
      console.error("Failed to create season", err);
    }
  };

  const handleActivateSeason = async (id: number) => {
    try {
      await memberService.updateSeason(jumuiyaId, id, { status: "active" });
      fetchData();
    } catch (err) {
      console.error("Failed to activate season", err);
    }
  };

  const handleExportMembers = async () => {
    try {
      const res = await memberService.exportMembers(jumuiyaId);
      const dataStr = JSON.stringify(res.data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${jumuiyaName}-members.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  if (loading) {
    return <div className="admin-card"><p style={{ textAlign: "center", padding: "40px" }}>Loading dashboard...</p></div>;
  }

  return (
    <div className="admin-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2>{jumuiyaName} — Registration Dashboard</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-primary" onClick={() => setShowSeasonModal(true)}>
            <FaPlus /> New Season
          </button>
          <button className="btn-secondary" onClick={handleExportMembers}>
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div className="stat-card" style={{ background: "#eef2ff", padding: "16px", borderRadius: "8px" }}>
            <FaUsers style={{ color: "#6366f1" }} />
            <h3>{stats.imports?.total || 0}</h3>
            <p>Total Imports</p>
          </div>
          <div className="stat-card" style={{ background: "#f0fdf4", padding: "16px", borderRadius: "8px" }}>
            <FaCheckCircle style={{ color: "#22c55e" }} />
            <h3>{stats.imports?.valid || 0}</h3>
            <p>Valid Records</p>
          </div>
          <div className="stat-card" style={{ background: "#fef2f2", padding: "16px", borderRadius: "8px" }}>
            <FaExclamationTriangle style={{ color: "#ef4444" }} />
            <h3>{stats.imports?.errors || 0}</h3>
            <p>Error Records</p>
          </div>
          <div className="stat-card" style={{ background: "#fff7ed", padding: "16px", borderRadius: "8px" }}>
            <FaCalendarAlt style={{ color: "#f97316" }} />
            <h3>{stats.groups?.length || 0}</h3>
            <p>Groups Created</p>
          </div>
        </div>
      )}

      {stats?.activeSeason && (
        <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", padding: "16px 20px", borderRadius: "8px", marginBottom: "24px" }}>
          <strong>Active Season:</strong> {stats.activeSeason.season_name} ({stats.activeSeason.start_date} — {stats.activeSeason.end_date})
        </div>
      )}

      {stats?.genderBreakdown && stats.genderBreakdown.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h3>Gender Breakdown</h3>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {stats.genderBreakdown.map((g: any) => (
              <span key={g.gender} style={{ padding: "8px 16px", background: "#f3f4f6", borderRadius: "6px" }}>
                {g.gender}: <strong>{g.count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      <h3>Registration Seasons</h3>
      {seasons.length === 0 ? (
        <p style={{ color: "#6b7280", padding: "20px 0" }}>No seasons created yet. Create your first registration season above.</p>
      ) : (
        <table className="premium-table">
          <thead>
            <tr>
              <th>Season Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.season_name}</strong></td>
                <td>{s.start_date?.slice(0, 10)}</td>
                <td>{s.end_date?.slice(0, 10)}</td>
                <td>
                  <span className={`badge ${s.status === "active" ? "success" : s.status === "closed" ? "error" : "info"}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  {s.status === "planning" && (
                    <button className="btn-sm" onClick={() => handleActivateSeason(s.id)}>
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showSeasonModal && (
        <div className="modal-overlay" onClick={() => setShowSeasonModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Create Registration Season</h3>
            <form onSubmit={handleCreateSeason}>
              <div className="form-group">
                <label>Season Name</label>
                <input required value={seasonForm.season_name} onChange={e => setSeasonForm({ ...seasonForm, season_name: e.target.value })} placeholder='e.g., "2026 A"' />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" required value={seasonForm.start_date} onChange={e => setSeasonForm({ ...seasonForm, start_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" required value={seasonForm.end_date} onChange={e => setSeasonForm({ ...seasonForm, end_date: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowSeasonModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Season</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationDashboard;
