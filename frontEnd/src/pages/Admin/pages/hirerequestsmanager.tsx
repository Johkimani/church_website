import { useEffect, useState } from "react";
import apiService from "../../Landing/services/api";
import { CalendarDays, RefreshCcw, Loader2, CheckCircle, XCircle, RotateCcw, MessageCircle, X, MapPin, Clock3, Phone, Copy, Check } from "lucide-react";

const STATUS_TABS = ["all", "pending", "approved", "rejected", "returned"] as const;
type HireTab = typeof STATUS_TABS[number];

const statusStyle: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  returned: "bg-blue-100 text-blue-700",
};

/* ── Normalize Kenyan phone to WhatsApp format (254...) ── */
function normalizePhone(raw: string): string {
  let digits = (raw || "").replace(/[^0-9]/g, "");
  // Strip leading + or 00
  if (digits.startsWith("00")) digits = digits.substring(2);
  // 07XX / 01XX → 254...
  if (digits.startsWith("0") && digits.length >= 10) {
    digits = "254" + digits.substring(1);
  }
  // Already 254...
  if (digits.startsWith("254") && digits.length >= 12) return digits;
  // 12-digit number without prefix
  if (digits.length === 12 && !digits.startsWith("254")) return "254" + digits;
  return digits;
}

interface NotifyModal {
  open: boolean;
  type: "approved" | "rejected" | null;
  request: any | null;
  pickupLocation: string;
  pickupTime: string;
  adminNotes: string;
  rejectReason: string;
  sentConfirm: boolean;
}

export default function HireRequestsManager() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<HireTab>("all");
  const [updating, setUpdating] = useState<number | null>(null);
  const [notify, setNotify] = useState<NotifyModal>({
    open: false, type: null, request: null,
    pickupLocation: "", pickupTime: "", adminNotes: "", rejectReason: "",
    sentConfirm: false,
  });

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

  const openApproveModal = (request: any) => {
    setNotify({
      open: true,
      type: "approved",
      request,
      pickupLocation: request.location || "",
      pickupTime: "",
      adminNotes: "",
      rejectReason: "",
      sentConfirm: false,
    });
  };

  const openRejectModal = (request: any) => {
    setNotify({
      open: true,
      type: "rejected",
      request,
      pickupLocation: "",
      pickupTime: "",
      adminNotes: "",
      rejectReason: "",
      sentConfirm: false,
    });
  };

  const closeNotifyModal = () => {
    setNotify({ open: false, type: null, request: null, pickupLocation: "", pickupTime: "", adminNotes: "", rejectReason: "", sentConfirm: false });
  };

  const confirmAction = async () => {
    if (!notify.request || !notify.type) return;
    const { request, type, pickupLocation, pickupTime, adminNotes, rejectReason } = notify;
    setUpdating(request.id);

    try {
      // Build admin_notes with pickup details
      let notes = adminNotes;
      if (type === "approved" && pickupLocation) {
        notes = `Pickup: ${pickupLocation}${pickupTime ? ` at ${pickupTime}` : ''}${notes ? ` | ${notes}` : ''}`;
      }
      if (type === "rejected" && rejectReason) {
        notes = `Reason: ${rejectReason}${notes ? ` | ${notes}` : ''}`;
      }

      await apiService.updateRecord("hire_requests", request.id, {
        status: type,
        admin_notes: notes || null,
      });

      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: type, admin_notes: notes } : r));

      // Normalize phone number for WhatsApp (07XX → 254XX)
      const phone = normalizePhone(request.phone_number || "");

      // Build WhatsApp message
      let message = "";
      if (type === "approved") {
        message = `Hello ${request.customer_name},\n\nYour hire request for *${request.item_name}* has been *APPROVED*.\n\n`;
        if (pickupLocation) {
          message += `*Pickup Location:* ${pickupLocation}\n`;
        }
        if (pickupTime) {
          message += `*Pickup Time:* ${pickupTime}\n`;
        }
        if (request.total_cost) {
          message += `*Total Cost:* KES ${Number(request.total_cost).toLocaleString()}\n`;
        }
        message += `\nPlease carry your ID when collecting. Thank you for choosing CSA!`;
      } else {
        message = `Hello ${request.customer_name},\n\nYour hire request for *${request.item_name}* has been *REJECTED*.\n\n`;
        if (rejectReason) {
          message += `*Reason:* ${rejectReason}\n`;
        }
        message += `\nFeel free to contact us for any questions.`;
      }

      // Open WhatsApp with pre-filled message
      if (phone) {
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank");
      }

      // Show sent confirmation step
      setNotify(p => ({ ...p, sentConfirm: true }));
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdating(null);
    }
  };

  const copyMessage = () => {
    const { request, type, pickupLocation, pickupTime, rejectReason } = notify;
    if (!request || !type) return;
    let message = "";
    if (type === "approved") {
      message = `Hello ${request.customer_name},\n\nYour hire request for *${request.item_name}* has been *APPROVED*.\n\n`;
      if (pickupLocation) message += `*Pickup Location:* ${pickupLocation}\n`;
      if (pickupTime) message += `*Pickup Time:* ${pickupTime}\n`;
      if (request.total_cost) message += `*Total Cost:* KES ${Number(request.total_cost).toLocaleString()}\n`;
      message += `\nPlease carry your ID when collecting. Thank you for choosing CSA!`;
    } else {
      message = `Hello ${request.customer_name},\n\nYour hire request for *${request.item_name}* has been *REJECTED*.\n\n`;
      if (notify.rejectReason) message += `*Reason:* ${notify.rejectReason}\n`;
      message += `\nFeel free to contact us for any questions.`;
    }
    navigator.clipboard.writeText(message).then(() => alert("Message copied! Paste it in WhatsApp."));
  };

  const markReturned = async (id: number) => {
    setUpdating(id);
    try {
      await apiService.updateRecord("hire_requests", id, { status: "returned" });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "returned" } : r));
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
                  {["Customer", "Phone", "Item", "Qty", "Start", "End", "Cost", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{r.customer_name}</td>
                    <td className="px-4 py-3 text-slate-600">{r.phone_number}</td>
                    <td className="px-4 py-3 text-slate-700">{r.item_name}</td>
                    <td className="px-4 py-3 text-slate-600 text-center">{r.quantity ?? 1}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {r.start_date ? new Date(r.start_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {r.end_date ? new Date(r.end_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-bold text-xs whitespace-nowrap">
                      {r.total_cost ? `KES ${Number(r.total_cost).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle[r.status] || "bg-slate-100 text-slate-600"}`}>
                        {r.status}
                      </span>
                      {r.admin_notes && (
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[150px] truncate" title={r.admin_notes}>
                          {r.admin_notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {updating === r.id ? (
                        <Loader2 size={16} className="animate-spin text-blue-500" />
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          {r.status === "pending" && (
                            <>
                              <button
                                onClick={() => openApproveModal(r)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition-colors"
                              >
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(r)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors"
                              >
                                <XCircle size={12} /> Reject
                              </button>
                            </>
                          )}
                          {r.status === "approved" && (
                            <button
                              onClick={() => markReturned(r.id)}
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

      {/* Approve / Reject Modal */}
      {notify.open && notify.type && notify.request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-5 flex items-center justify-between ${
              notify.type === "approved"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : "bg-gradient-to-r from-red-500 to-red-600"
            }`}>
              <div>
                <h2 className="text-white font-black text-lg">
                  {notify.sentConfirm
                    ? (notify.type === "approved" ? "Approval Sent" : "Rejection Sent")
                    : (notify.type === "approved" ? "Approve Request" : "Reject Request")}
                </h2>
                <p className="text-white/70 text-sm mt-0.5">
                  {notify.request.customer_name} — {notify.request.item_name}
                </p>
              </div>
              <button onClick={closeNotifyModal} className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            {/* ── SENT CONFIRMATION VIEW ── */}
            {notify.sentConfirm ? (
              <div className="p-6 text-center space-y-5">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                  notify.type === "approved" ? "bg-emerald-100" : "bg-red-100"
                }`}>
                  <Check size={32} className={notify.type === "approved" ? "text-emerald-600" : "text-red-600"} />
                </div>

                <div>
                  <h3 className="text-slate-800 font-black text-lg">
                    {notify.type === "approved" ? "Request Approved!" : "Request Rejected"}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Status updated in the system. WhatsApp was opened with the message.
                  </p>
                </div>

                {/* Phone number shown */}
                <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                  <p className="text-xs text-slate-500">
                    <strong>Customer phone:</strong> {notify.request.phone_number}
                  </p>
                  <p className="text-xs text-slate-500">
                    <strong>WhatsApp format:</strong> {normalizePhone(notify.request.phone_number || "")}
                  </p>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {notify.type === "approved"
                    ? "A WhatsApp chat should have opened with the approval message. Tap Send to notify the customer."
                    : "A WhatsApp chat should have opened with the rejection message. Tap Send to notify the customer."}
                </p>

                {/* Action buttons */}
                <div className="space-y-2">
                  {/* Re-open WhatsApp */}
                  <button
                    onClick={() => {
                      const phone = normalizePhone(notify.request.phone_number || "");
                      let msg = "";
                      if (notify.type === "approved") {
                        msg = `Hello ${notify.request.customer_name},\n\nYour hire request for *${notify.request.item_name}* has been *APPROVED*.\n\n`;
                        if (notify.pickupLocation) msg += `*Pickup Location:* ${notify.pickupLocation}\n`;
                        if (notify.pickupTime) msg += `*Pickup Time:* ${notify.pickupTime}\n`;
                        if (notify.request.total_cost) msg += `*Total Cost:* KES ${Number(notify.request.total_cost).toLocaleString()}\n`;
                        msg += `\nPlease carry your ID when collecting. Thank you for choosing CSA!`;
                      } else {
                        msg = `Hello ${notify.request.customer_name},\n\nYour hire request for *${notify.request.item_name}* has been *REJECTED*.\n\n`;
                        if (notify.rejectReason) msg += `*Reason:* ${notify.rejectReason}\n`;
                        msg += `\nFeel free to contact us for any questions.`;
                      }
                      if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                    }}
                    className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 text-white ${
                      notify.type === "approved"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    <MessageCircle size={16} /> Re-open WhatsApp
                  </button>

                  {/* Copy message */}
                  <button
                    onClick={copyMessage}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <Copy size={14} /> Copy Message
                  </button>

                  {/* Done */}
                  <button
                    onClick={closeNotifyModal}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
            /* ── FORM VIEW ── */
            <>
              <div className="p-6 space-y-4">
                {/* Customer info */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-slate-500"><strong>Phone:</strong> {notify.request.phone_number}</p>
                  <p className="text-xs text-slate-500"><strong>WhatsApp:</strong> {normalizePhone(notify.request.phone_number || "")}</p>
                  <p className="text-xs text-slate-500"><strong>Item:</strong> {notify.request.item_name} x{notify.request.quantity}</p>
                  {notify.request.total_cost && (
                    <p className="text-xs text-slate-500"><strong>Cost:</strong> KES {Number(notify.request.total_cost).toLocaleString()}</p>
                  )}
                </div>

                {notify.type === "approved" && (
                  <>
                    {/* Pickup Location */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5">
                        <MapPin size={12} /> Pickup Location *
                      </label>
                      <input
                        type="text"
                        value={notify.pickupLocation}
                        onChange={e => setNotify(p => ({ ...p, pickupLocation: e.target.value }))}
                        placeholder="e.g. KYU Main Campus, CSA Office"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    {/* Pickup Time */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5">
                        <Clock3 size={12} /> Pickup Time
                      </label>
                      <input
                        type="text"
                        value={notify.pickupTime}
                        onChange={e => setNotify(p => ({ ...p, pickupTime: e.target.value }))}
                        placeholder="e.g. Monday 9AM - 12PM"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                      />
                    </div>

                    {/* Admin Notes */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1.5 block">Additional Notes (optional)</label>
                      <textarea
                        value={notify.adminNotes}
                        onChange={e => setNotify(p => ({ ...p, adminNotes: e.target.value }))}
                        placeholder="Any extra instructions for the customer..."
                        rows={2}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition resize-none"
                      />
                    </div>
                  </>
                )}

                {notify.type === "rejected" && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">Rejection Reason *</label>
                    <textarea
                      value={notify.rejectReason}
                      onChange={e => setNotify(p => ({ ...p, rejectReason: e.target.value }))}
                      placeholder="Why is this request being rejected?"
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition resize-none"
                    />
                  </div>
                )}

                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MessageCircle size={10} /> WhatsApp will open with a pre-filled message after saving
                </p>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={closeNotifyModal}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={
                    updating !== null ||
                    (notify.type === "approved" && !notify.pickupLocation.trim()) ||
                    (notify.type === "rejected" && !notify.rejectReason.trim())
                  }
                  className={`flex-1 py-3 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    notify.type === "approved"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {updating !== null ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    <><MessageCircle size={16} /> {notify.type === "approved" ? "Approve & Notify" : "Reject & Notify"}</>
                  )}
                </button>
              </div>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
