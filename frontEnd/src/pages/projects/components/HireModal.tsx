import { useState } from "react";
import { X, CalendarDays, Loader2, CheckCircle2 } from "lucide-react";
import { apiClient } from "../../../api/axiosInstance";

interface HireModalProps {
  item: { id: number; name: string; category?: string };
  onClose: () => void;
}

export const HireModal = ({ item, onClose }: HireModalProps) => {
  const [form, setForm] = useState({
    customer_name: "",
    phone_number:  "",
    email:         "",
    quantity:      1,
    start_date:    "",
    end_date:      "",
    location:      "",
    notes:         "",
  });
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.customer_name.trim() || !form.phone_number.trim()) {
      setError("Name and phone number are required.");
      return;
    }
    if (!form.start_date || !form.end_date) {
      setError("Please select both hire and return dates.");
      return;
    }
    if (form.end_date < form.start_date) {
      setError("Return date must be after hire date.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/hire_requests", {
        customer_name: form.customer_name,
        phone_number:  form.phone_number,
        email:         form.email || null,
        item_name:     item.name,
        item_category: item.category || null,
        quantity:      Number(form.quantity) || 1,
        start_date:    form.start_date,
        end_date:      form.end_date,
        location:      form.location || null,
        notes:         form.notes || null,
        status:        "pending",
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to submit request. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    // Get custom admin number from localStorage, or default
    const adminNumber = localStorage.getItem("csa_hire_admin_phone") || "254112051739";
    const message = `Hello, I have submitted a hire request:\n\n*Name:* ${form.customer_name}\n*Phone:* ${form.phone_number}\n*Item:* ${item.name}\n*Quantity:* ${form.quantity}\n*From:* ${form.start_date} *To:* ${form.end_date}\n*Notes:* ${form.notes || 'None'}`;
    window.open(`https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-lg">Request Hire</h2>
            <p className="text-blue-200 text-sm mt-0.5">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl p-2 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-slate-800 font-black text-lg">Request Submitted!</h3>
            <p className="text-slate-500 mt-2 text-sm">
              We'll contact you on <strong>{form.phone_number}</strong> to confirm your hire of <strong>{item.name}</strong>.
            </p>
            <button
              onClick={handleWhatsAppRedirect}
              className="mt-6 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
            >
               Message Admin on WhatsApp
            </button>
            <button
               onClick={onClose}
               className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
               Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name *</label>
                <input
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Phone *</label>
                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="0712 345 678"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  <CalendarDays size={12} className="inline mr-1" />Hire Date *
                </label>
                <input
                  name="start_date"
                  type="date"
                  min={today}
                  value={form.start_date}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  <CalendarDays size={12} className="inline mr-1" />Return Date *
                </label>
                <input
                  name="end_date"
                  type="date"
                  min={form.start_date || today}
                  value={form.end_date}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Event Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Event venue / delivery address"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Additional Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Event name, delivery preference, etc."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Submitting...</>
              ) : (
                "Submit Hire Request"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
