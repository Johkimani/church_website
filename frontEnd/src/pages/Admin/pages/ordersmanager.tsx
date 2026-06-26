import { useEffect, useState } from "react";
import apiService from "../../Landing/services/api";
import { Package, RefreshCcw, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_TABS = ["all", "paid", "pending", "failed"] as const;
type StatusTab = typeof STATUS_TABS[number];

const statusStyle: Record<string, string> = {
  paid:    "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed:  "bg-red-100 text-red-700",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "paid")    return <CheckCircle size={14} className="inline mr-1 text-emerald-600" />;
  if (status === "failed")  return <XCircle    size={14} className="inline mr-1 text-red-500" />;
  return <Clock size={14} className="inline mr-1 text-amber-500" />;
};

export default function OrdersManager() {
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<StatusTab>("all");
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await apiService.fetchTableData("orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await apiService.updateRecord("orders", id, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (error) {
      console.error("Failed to update order status", error);
    } finally {
      setUpdating(null);
    }
  };

  const visible = tab === "all" ? orders : orders.filter(o => o.status === tab);

  const stats = {
    paid:    orders.filter(o => o.status === "paid").length,
    pending: orders.filter(o => o.status === "pending").length,
    failed:  orders.filter(o => o.status === "failed").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Package size={22} className="text-blue-600" /> Orders Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track and manage all customer orders</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCcw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Paid Orders",    count: stats.paid,    colour: "bg-emerald-500" },
          { label: "Pending Orders", count: stats.pending, colour: "bg-amber-500" },
          { label: "Failed Orders",  count: stats.failed,  colour: "bg-red-500" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`${card.colour} w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg`}>
              {card.count}
            </div>
            <span className="text-slate-600 font-semibold text-sm">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
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
            {t} {t !== "all" && <span className="ml-1 text-xs opacity-70">({stats[t as keyof typeof stats] ?? 0})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={32} className="animate-spin mr-3" /> Loading orders...
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No {tab === "all" ? "" : tab} orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["#", "Amount", "Phone", "M-Pesa Receipt", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((o: any) => (
                  <tr key={o.id} className={`transition-colors ${o.status === 'paid' ? 'bg-emerald-50/30 hover:bg-emerald-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">#{o.id}</td>
                    <td className="px-5 py-4 font-bold text-slate-800">KES {Number(o.amount || 0).toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-600">{o.phone || "—"}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{o.mpesa_receipt || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle[o.status] || "bg-slate-100 text-slate-600"}`}>
                        <StatusIcon status={o.status} />
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {updating === o.id ? (
                          <Loader2 size={16} className="animate-spin text-blue-500" />
                        ) : (
                          <select
                            value={o.status}
                            onChange={e => updateStatus(o.id, e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                          </select>
                        )}
                        {o.status === 'paid' && o.phone && (
                           <button
                             title="Message Customer"
                             onClick={() => {
                               const msg = `Hello! We have received your payment of KES ${Number(o.amount).toLocaleString()} (Receipt: ${o.mpesa_receipt || 'N/A'}). Please let us know when you would like to collect your items.`;
                               window.open(`https://wa.me/${o.phone.replace('+', '')}?text=${encodeURIComponent(msg)}`, '_blank');
                             }}
                             className="ml-2 p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                           >
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                           </button>
                        )}
                      </div>
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