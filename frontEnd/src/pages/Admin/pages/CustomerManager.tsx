import { useEffect, useState } from "react";
import apiService from "../../Landing/services/api";
import { Users, RefreshCcw, Loader2, Phone, Mail, ShoppingBag, UserX, CheckCircle } from "lucide-react";

export default function CustomerManager() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const [orders, members, groups] = await Promise.all([
        apiService.fetchTableData("orders", false).catch(() => []),
        apiService.fetchTableData("members", false).catch(() => []),
        apiService.fetchTableData("sub_groups", false).catch(() => []),
      ]);
      const ordersArr = Array.isArray(orders) ? orders : [];
      const membersArr = Array.isArray(members) ? members : [];
      const groupsArr = Array.isArray(groups) ? groups : [];

      // Jumuiya UUID → name mapping
      const jumuiyaMap: Record<string, string> = {};
      groupsArr.forEach((g: any) => { jumuiyaMap[g.group_id] = g.name; });

      // Index members by phone + id for fast lookup
      const memberByPhone: Record<string, any> = {};
      const memberById: Record<string, any> = {};
      membersArr.forEach((m: any) => {
        const id = m.member_id || m.id;
        if (id) memberById[String(id)] = m;
        if (m.phone) memberByPhone[String(m.phone)] = m;
      });

      // Only paid/completed orders
      const paidOrders = ordersArr.filter(
        (o: any) => o.status === "paid" || o.status === "completed" || o.payment_status === "paid"
      );

      // Group by phone (or email fallback)
      const customerMap = new Map<string, any>();

      paidOrders.forEach((o: any) => {
        const key = o.phone || o.email || `order-${o.id}`;
        if (customerMap.has(key)) {
          const existing = customerMap.get(key);
          existing.orderCount += 1;
          existing.totalSpent += Number(o.amount || 0);
          return;
        }

        const member = memberByPhone[String(o.phone)] || memberById[String(o.user_id || o.member_id)];

        customerMap.set(key, {
          id: key,
          name: o.customer_name || (member ? `${member.first_name || ""} ${member.last_name || ""}`.trim() : null) || "Guest",
          phone: o.phone || "—",
          email: o.email || member?.email || "—",
          jumuiya: member ? (jumuiyaMap[member.jumuiya_id] || member.jumuiya_id || "—") : "—",
          orderCount: 1,
          totalSpent: Number(o.amount || 0),
          registered: !!member,
          lastOrder: o.created_at,
        });
      });

      setCustomers(Array.from(customerMap.values()));
    } catch (err) { console.error(err); setCustomers([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users size={22} className="text-blue-600" /> Customers
          </h2>
          <p className="text-slate-500 text-sm mt-1">{customers.length} customer{customers.length !== 1 ? "s" : ""} with paid orders</p>
        </div>
        <button onClick={loadCustomers} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50">
          <RefreshCcw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={32} className="animate-spin mr-3" /> Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No customers yet</p>
            <p className="text-sm mt-1">Customers appear after an order is paid</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Name", "Phone", "Email", "Jumuiya", "Orders", "Total Spent", "Status"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs ${c.registered ? 'bg-blue-600' : 'bg-slate-300'}`}>
                          {(c.name || "?").charAt(0).toUpperCase()}
                        </div>
                        {c.name}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Phone size={12} className="text-slate-400" /> {c.phone}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Mail size={12} className="text-slate-400" /> {c.email}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{c.jumuiya}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <ShoppingBag size={12} className="text-blue-500" /> {c.orderCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700">KES {Number(c.totalSpent).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      {c.registered ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle size={11} /> Registered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          <UserX size={11} /> Unregistered
                        </span>
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
