import { useEffect, useState } from "react";
import apiService from "../../Landing/services/api";
import { CalendarDays, RefreshCcw, Loader2, CheckCircle, Clock, XCircle, RotateCcw } from "lucide-react";

const STATUS_TABS = ["all", "pending", "approved", "rejected", "returned"] as const;
type HireTab = typeof STATUS_TABS[number];

const statusStyle: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  returned: "bg-blue-100 text-blue-700",
};

export default function HireRequestsManager() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<HireTab>("all");
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await apiService.fetchTableData("hire_requests");
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load hire requests", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await apiService.updateRecord("hire_requests", id, { status });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdating(null);
    }
  };

  const visible = tab === "all" ? requests : requests.filter(r => r.status === tab);
  const counts: Record<string, number> = {
    pending:  requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
    returned: requests.filter(r => r.status === "returned").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <CalendarDays size={22} className="text-blue-600" /> Hire Requests
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage chair and instrument hire requests</p>
        </div>
        <button
          onClick={loadRequests}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCcw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending",  count: counts.pending,  colour: "bg-amber-500" },
          { label: "Approved", count: counts.approved, colour: "bg-emerald-500" },
          { label: "Rejected", count: counts.rejected, colour: "bg-red-500" },
          { label: "Returned", count: counts.returned, colour: "bg-blue-500" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`${c.colour} w-9 h-9 rounded-xl flex items-center justify-center text-white font-black`}>
              {c.count}
            </div>
            <span className="text-slate-600 font-semibold text-sm">{c.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {STATUS_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-bold rounded-t-lg capitalize transition-all ${
              tab === t
                ? "bg-white border border-b-white border-slate-200 text-blue-700 -mb-px"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t} {t !== "all" && <span className="ml-1 text-xs opacity-70">({counts[t] ?? 0})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={32} className="animate-spin mr-3" /> Loading requests...
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No {tab === "all" ? "" : tab} hire requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Customer", "Phone", "Item", "Qty", "Start", "End", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800">{r.customer_name}</td>
                    <td className="px-5 py-4 text-slate-600">{r.phone_number}</td>
                    <td className="px-5 py-4 text-slate-700">{r.item_name}</td>
                    <td className="px-5 py-4 text-slate-600 text-center">{r.quantity ?? 1}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {r.start_date ? new Date(r.start_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {r.end_date ? new Date(r.end_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle[r.status] || "bg-slate-100 text-slate-600"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {updating === r.id ? (
                        <Loader2 size={16} className="animate-spin text-blue-500" />
                      ) : (
                        <div className="flex gap-2">
                          {r.status === "pending" && (
                            <>
                              <button
                                onClick={() => updateStatus(r.id, "approved")}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition-colors"
                              >
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button
                                onClick={() => updateStatus(r.id, "rejected")}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors"
                              >
                                <XCircle size={12} /> Reject
                              </button>
                            </>
                          )}
                          {r.status === "approved" && (
                            <button
                              onClick={() => updateStatus(r.id, "returned")}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              <RotateCcw size={12} /> Returned
                            </button>
                          )}
                          {(r.status === "rejected" || r.status === "returned") && (
                            <span className="text-slate-400 text-xs italic">No actions</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}