import { useState, useEffect } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { Plus, Users, RefreshCw, AlertTriangle, Trash2 } from "lucide-react";

interface Props {
  jumuiyaId: string;
}

const OrganizationPanel: React.FC<Props> = ({ jumuiyaId }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", capacity: 0, leader_name: "", leader_phone: "" });

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await memberService.getGroups(jumuiyaId);
      setGroups(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, [jumuiyaId]);

  const createGroup = async () => {
    if (!newGroup.name.trim()) return;
    setError(null);
    try {
      await memberService.createGroups(jumuiyaId, { groups: [newGroup] });
      setNewGroup({ name: "", capacity: 0, leader_name: "", leader_phone: "" });
      setShowCreate(false);
      fetchGroups();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Group creation failed");
    }
  };

  const deleteGroup = async (groupId: number) => {
    setError(null);
    try {
      await memberService.deleteGroup(jumuiyaId, groupId);
      fetchGroups();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-slate-100 rounded-xl" />
          <div className="h-24 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Organization</h3>
          <p className="text-xs text-slate-500">Create and manage small Christian community groups.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
            <Plus size={14} /> Create Group
          </button>
          <button onClick={fetchGroups} className="p-2.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Create Group</h3>
            <div className="space-y-3">
              <input value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} placeholder="Group name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
              <input type="number" value={newGroup.capacity || ""} onChange={(e) => setNewGroup({ ...newGroup, capacity: parseInt(e.target.value) || 0 })} placeholder="Max capacity"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
              <input value={newGroup.leader_name} onChange={(e) => setNewGroup({ ...newGroup, leader_name: e.target.value })} placeholder="Leader name"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
              <input value={newGroup.leader_phone} onChange={(e) => setNewGroup({ ...newGroup, leader_phone: e.target.value })} placeholder="Leader phone"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={createGroup} disabled={!newGroup.name.trim()}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 rounded-lg transition-colors">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Users size={32} className="text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No groups yet.</p>
          <p className="text-slate-300 text-xs mt-1">Create groups to organize members into small communities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map((g) => (
            <div key={g.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800">{g.name}</h4>
                <button onClick={() => deleteGroup(g.id)} className="text-red-300 hover:text-red-500 transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500">
                <p><span className="font-semibold text-slate-700">Capacity:</span> {g.capacity || "Unlimited"}</p>
                {g.leader_name && <p><span className="font-semibold text-slate-700">Leader:</span> {g.leader_name} {g.leader_phone && `(${g.leader_phone})`}</p>}
                <p className="text-emerald-600 font-medium">{g.member_count || 0} member{g.member_count !== 1 ? "s" : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizationPanel;
