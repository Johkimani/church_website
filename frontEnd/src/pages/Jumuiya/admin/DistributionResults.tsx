import { useState, useEffect } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { Users, RefreshCw, AlertTriangle, Download, BarChart3, CheckCircle, Search, X } from "lucide-react";

interface Props {
  jumuiyaId: string;
}

const DistributionResults: React.FC<Props> = ({ jumuiyaId }) => {
  const [distributions, setDistributions] = useState<any[]>([]);
  const [selectedDist, setSelectedDist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchDistributions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await memberService.getDistributionHistory(jumuiyaId);
      setDistributions(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to fetch distribution history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDistributions(); }, [jumuiyaId]);

  const viewDistribution = async (distId: number) => {
    try {
      const res = await memberService.getDistributionDetail(jumuiyaId, distId);
      setSelectedDist(res.data);
    } catch (err: any) {
      setError("Failed to load distribution details");
    }
  };

  const runDistribution = async () => {
    setError(null);
    try {
      const res = await memberService.runGroupDistribution(jumuiyaId, { strategy: "balanced-mixed" });
      setSelectedDist(res.data);
      fetchDistributions();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Distribution failed");
    }
  };

  const exportCSV = (dist: any) => {
    if (!dist?.assignments?.length) return;
    const header = "Member Name,Group Name,Group Leader\n";
    const rows = dist.assignments.map((a: any) =>
      `"${a.member_name}","${a.group_name}","${a.group_leader || ""}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `distribution-${dist.id}-${dist.distribution_date?.slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDistributions = distributions.filter((d) =>
    d.id?.toString().includes(search) || d.strategy?.includes(search)
  );

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
        <div className="h-48 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Distribution Results</h3>
          <p className="text-xs text-slate-500">View group distribution history and run new distributions.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={runDistribution} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
            <BarChart3 size={14} /> Run Distribution
          </button>
          <button onClick={fetchDistributions} className="p-2.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors">
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

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID or strategy..."
          className="w-full border border-slate-200 rounded-xl px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
      </div>

      {/* Distribution History */}
      {filteredDistributions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Users size={32} className="text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No distributions yet.</p>
          <p className="text-slate-300 text-xs mt-1">Click "Run Distribution" to auto-assign members to groups.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Strategy</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Members</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Groups</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Balanced</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDistributions.map((dist) => (
                <tr key={dist.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">#{dist.id}</td>
                  <td className="py-3 px-4 text-slate-500">{dist.distribution_date?.slice(0, 10)}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {dist.strategy || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{dist.total_members_distributed}</td>
                  <td className="py-3 px-4 text-slate-700">{dist.total_groups}</td>
                  <td className="py-3 px-4">
                    {dist.is_balanced ? (
                      <CheckCircle size={15} className="text-emerald-500" />
                    ) : (
                      <X size={15} className="text-amber-500" />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      <button onClick={() => viewDistribution(dist.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors" title="View Details">
                        <Users size={15} />
                      </button>
                      <button onClick={() => exportCSV(dist)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors" title="Export CSV">
                        <Download size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDist && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedDist(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Distribution #{selectedDist.id} Details</h3>
              <button onClick={() => setSelectedDist(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">Strategy</p>
                <p className="font-bold text-slate-800">{selectedDist.strategy || "—"}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">Members</p>
                <p className="font-bold text-slate-800">{selectedDist.total_members_distributed}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">Groups</p>
                <p className="font-bold text-slate-800">{selectedDist.total_groups}</p>
              </div>
            </div>
            {selectedDist.assignments?.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Member</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Group</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Leader</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDist.assignments.map((a: any, i: number) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-2 px-3 text-slate-700">{a.member_name}</td>
                        <td className="py-2 px-3 text-slate-700">{a.group_name}</td>
                        <td className="py-2 px-3 text-slate-500">{a.group_leader || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">No assignment details available.</p>
            )}
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => exportCSV(selectedDist)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors">
                <Download size={14} /> Export CSV
              </button>
              <button onClick={() => setSelectedDist(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionResults;
