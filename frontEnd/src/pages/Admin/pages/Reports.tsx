import { useEffect, useState } from "react";
import apiService from "../../Landing/services/api";
import { BarChart3, RefreshCcw, Loader2, Download, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

export default function Reports() {
  const [data, setData] = useState<any>({ orders: [], products: [], members: [] });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">("month");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orders, products, members] = await Promise.all([
        apiService.fetchTableData("orders", true),
        apiService.fetchTableData("products", true),
        apiService.fetchTableData("members", true),
      ]);
      setData({
        orders: Array.isArray(orders) ? orders : [],
        products: Array.isArray(products) ? products : [],
        members: Array.isArray(members) ? members : [],
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const now = new Date();
  const periodStart = new Date(now);
  if (period === "today") periodStart.setHours(0, 0, 0, 0);
  else if (period === "week") periodStart.setDate(now.getDate() - 7);
  else if (period === "month") periodStart.setMonth(now.getMonth() - 1);
  else periodStart.setFullYear(now.getFullYear() - 1);

  const filteredOrders = data.orders.filter((o: any) => {
    if (!o.created_at) return false;
    return new Date(o.created_at) >= periodStart;
  });

  const paidOrders = filteredOrders.filter((o: any) => o.status === "paid");
  const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + Number(o.amount || 0), 0);
  const totalOrders = filteredOrders.length;

  const exportCSV = () => {
    const headers = ["ID", "Amount", "Phone", "Status", "Date", "Receipt"];
    const rows = data.orders.map((o: any) => [o.id, o.amount, o.phone, o.status, o.created_at, o.mpesa_receipt]);
    const csv = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${period}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const topProducts = data.products
    .sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <BarChart3 size={22} className="text-blue-600" /> Reports & Analytics
          </h2>
          <p className="text-slate-500 text-sm mt-1">Sales performance and business insights</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-md">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={loadData} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <RefreshCcw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(["today", "week", "month", "year"] as const).map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${period === p ? "bg-blue-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"}`}>
            {p === "today" ? "Today" : p === "week" ? "This Week" : p === "month" ? "This Month" : "This Year"}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: `KES ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-emerald-500" },
          { label: "Total Orders", value: String(totalOrders), icon: ShoppingCart, color: "bg-blue-500" },
          { label: "Paid Orders", value: String(paidOrders.length), icon: TrendingUp, color: "bg-purple-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className={`${s.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}><s.icon size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tables */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={32} className="animate-spin mr-3" /> Loading reports...
        </div>
      ) : (
        <div className="grid xl:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Recent Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["#", "Amount", "Phone", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredOrders.slice(0, 10).map((o: any) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-400">#{o.id}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-800">KES {Number(o.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-slate-600">{o.phone || "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${o.status === "paid" ? "bg-emerald-100 text-emerald-700" : o.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-slate-400">No orders in this period</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Top Products by Stock</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Name", "Category", "Price", "Stock"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topProducts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{p.name}</td>
                      <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{p.category}</span></td>
                      <td className="px-4 py-2.5 font-bold text-slate-800">KES {Number(p.price || 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${Number(p.stock) <= 5 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{p.stock || 0}</span>
                      </td>
                    </tr>
                  ))}
                  {topProducts.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-slate-400">No products found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
