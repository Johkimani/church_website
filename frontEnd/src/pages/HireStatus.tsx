import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "../api/axiosInstance";
import { Search, Loader2, CheckCircle2, XCircle, CalendarDays, Armchair, Music, Smartphone, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import RatingModal from "./projects/components/RatingModal";

interface HireGroup {
  reference: string;
  customer_name: string;
  phone_number: string;
  email: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  mpesa_receipt: string | null;
  paid_at: string | null;
  items: any[];
  pickup_location: string;
  pickup_instructions: string;
  admin_phone: string;
  total_cost: number;
  event_date: string;
  pickup_date: string;
  return_date: string;
  notes: string | null;
}

const statusLabels: Record<string, string> = {
  pending: "Pending Approval",
  approved: "Approved — Awaiting Payment",
  paid: "Paid — Ready for Pickup",
  ready_for_pickup: "Ready for Pickup",
  collected: "Collected",
  returned: "Returned",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  ready_for_pickup: "bg-indigo-100 text-indigo-700",
  collected: "bg-purple-100 text-purple-700",
  returned: "bg-teal-100 text-teal-700",
  cancelled: "bg-slate-100 text-slate-600",
  rejected: "bg-red-100 text-red-700",
};

export default function HireStatus() {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get("ref") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<HireGroup | null>(null);

  // Payment states
  const [payMethod, setPayMethod] = useState<"mpesa" | "cash" | null>(null);
  const [paying, setPaying] = useState(false);
  const [payResult, setPayResult] = useState<{ success: boolean; message: string; receipt?: string } | null>(null);
  const [showRating, setShowRating] = useState(false);

  // Auto-search if ref query param is present
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) lookupRef(ref);
  }, []);

  const lookupRef = async (ref: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    setPayMethod(null);
    setPayResult(null);
    try {
      const res = await apiClient.get(`/hire/group/${ref.trim()}`);
      const group = res.data;
      setData({
        reference: group.reference,
        customer_name: group.customer_name,
        phone_number: group.phone_number,
        email: group.email,
        status: group.status,
        payment_status: group.payment_status,
        payment_method: group.payment_method,
        mpesa_receipt: group.mpesa_receipt,
        paid_at: group.paid_at,
        pickup_location: group.pickup_location || '',
        pickup_instructions: group.pickup_instructions || '',
        admin_phone: group.admin_phone || '',
        items: group.items,
        total_cost: group.items.reduce((sum: number, i: any) => sum + Number(i.total_cost || 0), 0),
        event_date: group.items[0]?.event_date || "",
        pickup_date: group.items[0]?.pickup_date || "",
        return_date: group.items[0]?.return_date || "",
        notes: group.items[0]?.notes || null,
      });
    } catch (err: any) {
      setError(err?.response?.status === 404 ? "Hire request not found. Check your reference number." : "Failed to load request. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    await lookupRef(reference);
  };

  const payWithMpesa = async () => {
    if (!data) return;
    setPaying(true);
    setPayResult(null);
    try {
      await apiClient.post(`/hire/pay/${data.reference}`, {
        phone_number: data.phone_number,
      });
      setPayResult({ success: true, message: "STK Push sent! Check your phone to enter M-Pesa PIN." });

      // Poll for payment status
      const interval = setInterval(async () => {
        try {
          const statusRes = await apiClient.get(`/hire/payment-status/${data.reference}`);
          const s = statusRes.data;
          if (s.payment_status === "paid" || s.mpesa_status === "paid") {
            clearInterval(interval);
            setPayResult({
              success: true,
              message: `Payment Successful! Receipt: ${s.mpesa_receipt || s.mpesa_receipt_from_provider || "N/A"}`,
              receipt: s.mpesa_receipt || s.mpesa_receipt_from_provider,
            });
            setData(prev => prev ? { ...prev, payment_status: "paid", mpesa_receipt: s.mpesa_receipt || s.mpesa_receipt_from_provider, paid_at: new Date().toISOString(), status: "paid" } : prev);
            setTimeout(() => setShowRating(true), 1500);
          } else if (s.mpesa_status === "failed") {
            clearInterval(interval);
            setPayResult({ success: false, message: "Payment failed. Please try again." });
          }
        } catch { toast.error('Failed to check payment status'); }
      }, 3000);
      setTimeout(() => clearInterval(interval), 120000);
    } catch (err: any) {
      setPayResult({ success: false, message: err?.response?.data?.error || "Failed to initiate payment." });
    } finally {
      setPaying(false);
    }
  };

  const getIcon = (cat?: string) => {
    switch ((cat || "").toLowerCase()) {
      case "chairs": return <Armchair size={20} />;
      case "instruments": return <Music size={20} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Track Your Hire Request</h1>
          <p className="text-slate-500 text-sm mt-2">Enter your reference number to view status and make payment.</p>
        </div>

        {/* Search form */}
        <form onSubmit={lookup} className="flex gap-3 mb-6">
          <input
            type="text"
            value={reference}
            onChange={e => setReference(e.target.value.toUpperCase())}
            placeholder="e.g. HIR-2026-00125"
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 transition uppercase"
          />
          <button
            type="submit"
            disabled={loading || !reference.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-xl transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Search
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium mb-6">
            {error}
          </div>
        )}

        {/* Result */}
        {data && (
          <div className="space-y-4">
            {/* Status card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Reference</p>
                  <p className="text-lg font-black text-blue-600">{data.reference}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusColors[data.status] || "bg-slate-100 text-slate-600"}`}>
                  {statusLabels[data.status] || data.status}
                </span>
              </div>

              {/* Payment status badge */}
              {data.payment_status === "paid" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Payment Confirmed</p>
                    {data.mpesa_receipt && <p className="text-xs text-emerald-600">Receipt: {data.mpesa_receipt}</p>}
                    {data.paid_at && <p className="text-xs text-emerald-600">Paid: {new Date(data.paid_at).toLocaleString()}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Customer info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Customer Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-semibold text-slate-800">{data.customer_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-semibold text-slate-800">{data.phone_number}</span></div>
                {data.email && <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-semibold text-slate-800">{data.email}</span></div>}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Items to Hire</h3>
              {data.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{getIcon(item.item_category)}</span>
                    <span className="font-semibold text-slate-700">{item.item_name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 text-sm">x{item.quantity}</span>
                    <span className="font-bold text-slate-800">KES {Number(item.total_cost || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-2 border-t border-slate-200">
                <span className="font-black text-slate-700">Total Cost</span>
                <span className="font-black text-lg text-blue-600">KES {data.total_cost.toLocaleString()}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Dates</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 rounded-xl p-3">
                  <CalendarDays size={16} className="mx-auto mb-1 text-blue-500" />
                  <p className="text-[10px] text-slate-500">Event</p>
                  <p className="text-xs font-bold text-slate-800">{data.event_date ? new Date(data.event_date).toLocaleDateString() : "—"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <CalendarDays size={16} className="mx-auto mb-1 text-emerald-500" />
                  <p className="text-[10px] text-slate-500">Pickup</p>
                  <p className="text-xs font-bold text-slate-800">{data.pickup_date ? new Date(data.pickup_date).toLocaleDateString() : "—"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <CalendarDays size={16} className="mx-auto mb-1 text-amber-500" />
                  <p className="text-[10px] text-slate-500">Return</p>
                  <p className="text-xs font-bold text-slate-800">{data.return_date ? new Date(data.return_date).toLocaleDateString() : "—"}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {data.notes && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs text-slate-500"><span className="font-bold">Notes:</span> {data.notes}</p>
              </div>
            )}

            {/* Payment section — only when approved */}
            {data.status === "approved" && data.payment_status !== "paid" && (
              <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={28} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-black text-slate-800 text-center">Congratulations!</h3>
                <p className="text-sm text-slate-500 text-center mt-1">Your request has been approved. Please proceed with payment.</p>
                <div className="bg-slate-50 rounded-xl p-4 my-4 text-center">
                  <p className="text-xs text-slate-500">Amount Due</p>
                  <p className="text-2xl font-black text-blue-600">KES {data.total_cost.toLocaleString()}</p>
                </div>

                {/* Payment method selection */}
                {!payMethod && !payResult && (
                  <div className="space-y-3">
                    <button
                      onClick={() => setPayMethod("mpesa")}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-3"
                    >
                      <Smartphone size={20} /> Pay with M-Pesa
                    </button>
                    <button
                      onClick={() => setPayMethod("cash")}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-3"
                    >
                      <DollarSign size={20} /> Pay with Cash
                    </button>
                  </div>
                )}

                {/* M-Pesa flow */}
                {payMethod === "mpesa" && !payResult && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                      An M-Pesa STK Push will be sent to <strong>{data.phone_number}</strong> for KES {data.total_cost.toLocaleString()}.
                    </div>
                    <button
                      onClick={payWithMpesa}
                      disabled={paying}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {paying ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><Smartphone size={18} /> Pay KES {data.total_cost.toLocaleString()}</>}
                    </button>
                    <button onClick={() => setPayMethod(null)} className="w-full py-2 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
                  </div>
                )}

                {/* Cash flow */}
                {payMethod === "cash" && !payResult && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-amber-800">Cash Payment Selected</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Your request has been approved. Please visit the church office to make payment.
                      Your reservation has been placed on hold.
                    </p>
                    <p className="text-xs text-amber-600 mt-2 font-bold">Reference: {data.reference}</p>
                    <button onClick={() => setPayMethod(null)} className="mt-3 text-xs text-slate-500 hover:text-slate-700 underline">Change payment method</button>
                  </div>
                )}

                {/* Payment result */}
                {payResult && (
                  <div className={`rounded-xl p-4 mt-3 ${payResult.success ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {payResult.success ? (
                        <CheckCircle2 size={20} className="text-emerald-600" />
                      ) : (
                        <XCircle size={20} className="text-red-600" />
                      )}
                      <span className={`text-sm font-bold ${payResult.success ? "text-emerald-800" : "text-red-800"}`}>
                        {payResult.success ? "Payment Successful" : "Payment Failed"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{payResult.message}</p>
                    {payResult.receipt && (
                      <p className="text-xs text-slate-500 mt-1">Receipt: {payResult.receipt}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Paid confirmation */}
            {data.status === "paid" && data.payment_status === "paid" && (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-xl font-black text-center">Payment Confirmed</h3>
                <p className="text-white/80 text-sm text-center mt-2">Thank you! Please collect your items from:</p>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 mt-4 space-y-2 text-sm">
                  <p className="font-bold">{data.pickup_location || "CSA Church Store"}</p>
                  {data.pickup_date && <p>Pickup Date: {new Date(data.pickup_date).toLocaleDateString()}</p>}
                  {data.pickup_instructions && <p className="text-white/70 text-xs mt-1">{data.pickup_instructions}</p>}
                  {data.admin_phone && <p className="text-white/80 text-xs mt-2">Call for assistance: {data.admin_phone}</p>}
                </div>
                <p className="text-xs text-white/60 text-center mt-4">Reference: {data.reference}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showRating && data && (
        <RatingModal
          orderRef={data.reference}
          customerName={data.customer_name}
          onClose={() => setShowRating(false)}
          onSubmitted={() => setShowRating(false)}
        />
      )}
    </div>
  );
}
