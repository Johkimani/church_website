import { useEffect, useState } from "react";

import { bookingService } from "../api/activitiesServices";
import { RefreshCw, Clock, MapPin, Calendar, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: number;
  activity_type: string;
  activity_name: string;
  activity_time: string | null;
  fare: string;
  paid_amount: string;
  status: string;
  created_at: string;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.myBookings();
      setBookings(data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "paid": return "bg-emerald-100 text-emerald-700";
      case "pending": return "bg-amber-100 text-amber-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
              <p className="text-sm text-slate-500 mt-0.5">View your activity bookings and payment status</p>
            </div>
          </div>
          <button onClick={load} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-sm">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <Calendar size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-1">No bookings yet.</p>
            <p className="text-slate-300 text-xs">Browse paid activities and book one to see it here.</p>
            <button onClick={() => navigate("/activities")}
              className="mt-4 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-xl transition-all">
              Browse Activities
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-sm transition-all">
                <div className={`w-2 h-10 rounded-full shrink-0 ${b.status === "paid" ? "bg-emerald-400" : b.status === "cancelled" ? "bg-red-400" : "bg-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{b.activity_type}</span>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusBadge(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 truncate">{b.activity_name}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    {b.activity_time && <span className="flex items-center gap-1"><Clock size={12} /> {b.activity_time}</span>}
                    <span className="font-mono truncate">Paid: KES {Number(b.paid_amount).toLocaleString()} / {Number(b.fare).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 shrink-0">
                  {new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}