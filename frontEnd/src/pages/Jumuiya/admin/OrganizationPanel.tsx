import { useState, useEffect } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { FaPlus, FaTrash, FaUsers, FaRandom, FaRedo } from "react-icons/fa";
import toast from "react-hot-toast";

interface Props {
  jumuiyaId: string;
}

const OrganizationPanel: React.FC<Props> = ({ jumuiyaId }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroups, setNewGroups] = useState([{ group_name: "", capacity: 20, group_type: "mixed", description: "" }]);
  const [distributing, setDistributing] = useState(false);
  const [distributionResult, setDistributionResult] = useState<any>(null);
  const [strategy, setStrategy] = useState("balanced-mixed");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupsRes, seasonsRes] = await Promise.all([
        memberService.getGroups(jumuiyaId, { season_id: selectedSeason }),
        memberService.getSeasons(jumuiyaId),
      ]);
      setGroups(groupsRes.data || []);
      setSeasons(seasonsRes.data || []);
    } catch (err) {
      console.error("Failed to load organization data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [jumuiyaId, selectedSeason]);

  const handleCreateGroups = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await memberService.createGroups(jumuiyaId, {
        groups: newGroups.filter(g => g.group_name.trim()),
        season_id: selectedSeason,
      });
      setShowCreateModal(false);
      setNewGroups([{ group_name: "", capacity: 20, group_type: "mixed", description: "" }]);
      toast.success("Groups created successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to create groups");
    }
  };

  const handleAutoDistribute = async () => {
    setDistributing(true);
    setDistributionResult(null);
    try {
      const res = await memberService.autoDistribute(jumuiyaId, {
        season_id: selectedSeason,
        strategy,
      });
      setDistributionResult(res.data);
      toast.success("Distribution complete!");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Distribution failed");
    } finally {
      setDistributing(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("Delete this group? This will remove all assignments.")) return;
    try {
      await memberService.deleteGroup(jumuiyaId, groupId);
      toast.success("Group deleted");
      fetchData();
    } catch (err: any) {
      toast.error("Failed to delete group");
    }
  };

  const addGroupRow = () => {
    setNewGroups([...newGroups, { group_name: "", capacity: 20, group_type: "mixed", description: "" }]);
  };

  if (loading) {
    return <div className="admin-card"><p style={{ textAlign: "center", padding: "40px" }}>Loading...</p></div>;
  }

  return (
    <div className="admin-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Organization & Groups</h2>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select value={selectedSeason || ""} onChange={e => setSelectedSeason(e.target.value ? Number(e.target.value) : undefined)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}>
            <option value="">All Seasons</option>
            {seasons.map(s => <option key={s.id} value={s.id}>{s.season_name}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Create Groups
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          <FaUsers size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
          <p>No groups created yet. Create groups to organize members.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            {groups.map((g) => (
              <div key={g.id} style={{
                padding: "20px", borderRadius: "12px", background: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0 }}>{g.group_name}</h3>
                  <button onClick={() => handleDeleteGroup(g.id)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
                    <FaTrash size={14} />
                  </button>
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "0.9rem" }}>
                  <span>Type: <strong>{g.group_type}</strong></span>
                  <span>Capacity: <strong>{g.capacity || "Unlimited"}</strong></span>
                </div>
                <div style={{ marginTop: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                    <span>Members: <strong>{g.member_count || 0}</strong></span>
                    {g.capacity > 0 && <span>{Math.round(((g.member_count || 0) / g.capacity) * 100)}% full</span>}
                  </div>
                  {g.capacity > 0 && (
                    <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: "3px", transition: "width 0.3s",
                        background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                        width: `${Math.min(((g.member_count || 0) / g.capacity) * 100, 100)}%`,
                      }} />
                    </div>
                  )}
                </div>
                {g.description && <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "8px" }}>{g.description}</p>}
              </div>
            ))}
          </div>

          <div style={{ padding: "20px", background: "#f3f4f6", borderRadius: "8px", marginTop: "16px" }}>
            <h3><FaRandom /> Auto-Distribution</h3>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px", flexWrap: "wrap" }}>
              <select value={strategy} onChange={e => setStrategy(e.target.value)} style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}>
                <option value="balanced-mixed">Balanced Mixed Teams</option>
                <option value="gender-separate">Gender-Separate Teams</option>
              </select>
              <button className="btn-primary" onClick={handleAutoDistribute} disabled={distributing || groups.length === 0}>
                {distributing ? "Distributing..." : "Auto-Distribute Members"}
              </button>
            </div>

            {distributionResult && (
              <div style={{ marginTop: "16px", padding: "16px", background: "#f0fdf4", borderRadius: "8px" }}>
                <h4 style={{ color: "#22c55e" }}>Distribution Complete</h4>
                <p>Total members assigned: {distributionResult.stats?.totalMembers || 0}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px", marginTop: "8px" }}>
                  {distributionResult.stats?.assignmentsByGroup?.map((a: any) => (
                    <div key={a.groupId} style={{ padding: "8px", background: "white", borderRadius: "6px" }}>
                      <strong>{a.groupName}</strong>: {a.count} members
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <h3>Create Groups</h3>
            <form onSubmit={handleCreateGroups}>
              {newGroups.map((g, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                  <input required placeholder="Group name" value={g.group_name} onChange={e => {
                    const updated = [...newGroups];
                    updated[i].group_name = e.target.value;
                    setNewGroups(updated);
                  }} style={{ flex: 1 }} />
                  <input type="number" placeholder="Capacity" value={g.capacity} onChange={e => {
                    const updated = [...newGroups];
                    updated[i].capacity = Number(e.target.value);
                    setNewGroups(updated);
                  }} style={{ width: "80px" }} />
                  <select value={g.group_type} onChange={e => {
                    const updated = [...newGroups];
                    updated[i].group_type = e.target.value;
                    setNewGroups(updated);
                  }} style={{ width: "100px" }}>
                    <option value="mixed">Mixed</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={addGroupRow} style={{ marginTop: "8px" }}>
                <FaPlus /> Add Group
              </button>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Groups</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationPanel;
