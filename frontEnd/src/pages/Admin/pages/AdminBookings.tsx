import { useEffect, useState } from "react";
import { bookingService } from "../../../api/activitiesServices";
import { RefreshCw, Download, Search, CalendarCheck2, Wallet, TrendingUp, Users } from "lucide-react";
import toast from "react-hot-toast";

interface Booking {
  id: number;
  member_id: string;
  member_name: string;
  year_of_study: string;
  jumuiya_id: string;
  jumuiya_name: string | null;
  phone: string;
  activity_type: string;
  activity_name: string;
  activity_day: string | null;
  activity_time: string | null;
  fare: string;
  paid_amount: string;

  created_at: string;
  updated_at: string;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [payFilter, setPayFilter] = useState<"all" | "paid" | "partial" | "unpaid">("all");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getBookings();
      setBookings(data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Failed to load bookings";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      const blob = await bookingService.exportBookingsCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "activity_bookings.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Bookings exported to CSV");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "Export failed";
      setError(msg);
      toast.error(msg);
    }
  }

  const payStatus = (b: Booking): "paid" | "partial" | "unpaid" => {
    const paid = Number(b.paid_amount || 0);
    const fare = Number(b.fare || 0);
    if (paid >= fare) return "paid";
    if (paid > 0) return "partial";
    return "unpaid";
  };

  const filtered = bookings.filter((b) => {
    if (!search) {
      const termOk = true;
      if (!termOk) return false;
    } else if (!b.member_name?.toLowerCase().includes(search.toLowerCase())
      && !b.member_id?.toLowerCase().includes(search.toLowerCase())
      && !(b.jumuiya_name || "").toLowerCase().includes(search.toLowerCase())
      && !b.activity_name?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (typeFilter !== "all" && b.activity_type !== typeFilter) return false;
    if (payFilter !== "all" && payStatus(b) !== payFilter) return false;
    return true;
  });

  // Group bookings by activity for better organization
  const groupedBookings = filtered.reduce((acc, booking) => {
    const key = `${booking.activity_type}:${booking.activity_name}`;
    if (!acc[key]) {
      acc[key] = {
        activity_type: booking.activity_type,
        activity_name: booking.activity_name,
        bookings: [] as any[]
      };
    }
    acc[key].bookings.push({
      id: booking.id,
      member_id: booking.member_id || "-",
      member_name: booking.member_name,
      year_of_study: booking.year_of_study || "-",
      jumuiya_id: booking.jumuiya_id || "-",
      jumuiya_name: booking.jumuiya_name || null,
      phone: booking.phone || "-",
      activity_type: booking.activity_type,
      activity_name: booking.activity_name,
      fare: booking.fare,
      paid_amount: booking.paid_amount,
      created_at: booking.created_at
    });
    return acc;
  }, {} as Record<string, { activity_type: string; activity_name: string; bookings: any[] }>);

  const activityTypes = Array.from(new Set(bookings.map((b) => b.activity_type)));

  const totalBookings = bookings.length;
  const totalCollected = bookings.reduce((sum, b) => sum + Number(b.paid_amount || 0), 0);
  const totalExpected = bookings.reduce((sum, b) => sum + Number(b.fare || 0), 0);
  const outstanding = totalExpected - totalCollected;
  const fullyPaid = bookings.filter((b) => payStatus(b) === "paid").length;

  const paidBadge = (paid: string, fare: string) => {
    const numPaid = Number(paid || 0);
    const numFare = Number(fare || 0);
    if (numPaid === numFare) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
    } else if (numPaid > 0) {
      return "bg-amber-50 text-amber-700 border-amber-200 font-medium";
    }
    return "bg-rose-50 text-rose-600 border-rose-200 font-medium";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Activity Bookings</h2>
          <p className="text-sm text-slate-500 mt-1">View all member bookings and payments for paid activities.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport}
            className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={load}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 shrink-0">
            <CalendarCheck2 size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">{totalBookings}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Total Bookings</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 shrink-0">
            <Wallet size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">KES {totalCollected.toLocaleString()}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Collected</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30 shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">KES {outstanding.toLocaleString()}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Outstanding</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-violet-500/30 shrink-0">
            <Users size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">{fullyPaid}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Fully Paid</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or activity..."
            className="w-full max-w-xs border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        >
          <option value="all">All types</option>
          {activityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
          {([["all", "All"], ["paid", "Paid"], ["partial", "Partial"], ["unpaid", "Unpaid"]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPayFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                payFilter === val ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-400 text-sm mb-2">No bookings yet.</p>
          <p className="text-slate-300 text-xs">Bookings will appear here when members book paid activities.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedBookings).map(([key, group]) => (
            <div key={key} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-800 mb-1">{group.activity_name}</h3>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Type:</span> {group.activity_type} |
                  <span className="font-medium ml-2">Fare @</span> KES {Number(group.bookings[0]?.fare || 0).toLocaleString()} |
                  <span className="font-medium ml-2">Total Bookings:</span> {group.bookings.length}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Member</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Registration</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Year of Study</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Jumuiya</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Phone No</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600">Paid Amount</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.bookings.map((booking: any, i: number) => (
                      <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{booking.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{booking.member_name}</div>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-600">{booking.member_id}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{booking.year_of_study}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{booking.jumuiya_name || booking.jumuiya_id}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">{booking.phone}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">
                          <span className={`inline-block px-2 py-1 rounded-lg border text-xs ${paidBadge(booking.paid_amount, booking.fare)}`}>
                            KES {Number(booking.paid_amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {new Date(booking.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <div className="px-1 text-xs text-slate-400">
            Showing {filtered.length} of {bookings.length} bookings across {Object.keys(groupedBookings).length} activities
          </div>
        </div>
      )}
    </div>
  );
}
