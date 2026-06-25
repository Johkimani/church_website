import { useState, useMemo } from "react";
import { X, CalendarDays, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { apiClient } from "../../../api/axiosInstance";

interface HireModalProps {
  item: { id: number; name: string; category?: string; price?: number };
  onClose: () => void;
}

const PRICE_PER_CHAIR_PER_DAY = 10;
const HOURS_PER_DAY = 8;

export const HireModal = ({ item, onClose }: HireModalProps) => {
  const today = new Date().toISOString().split("T")[0];
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();

  const isInstrument = (item.category || "").toLowerCase() === "instruments";

  const [form, setForm] = useState({
    customer_name: "",
    phone_number:  "",
    email:         "",
    quantity:      1,
    start_date:    today,
    end_month:     "",
    end_day:       "",
    rentalType:    "daily" as "daily" | "hourly",
    hours:         4,
    location:      "",
    notes:         "",
  });
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const dailyRate = item.price || PRICE_PER_CHAIR_PER_DAY;
  const hourlyRate = Math.round(dailyRate / HOURS_PER_DAY);

  // Compute full end_date from month + day + auto year
  const computedEndDate = useMemo(() => {
    if (!form.end_month || !form.end_day) return "";
    const month = parseInt(form.end_month);
    const day = parseInt(form.end_day);
    const year = (month < currentMonth) ? currentYear + 1 : currentYear;
    const maxDay = new Date(year, month, 0).getDate();
    const clampedDay = Math.min(day, maxDay);
    return `${year}-${String(month).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
  }, [form.end_month, form.end_day, currentMonth, currentYear]);

  // Days count
  const daysCount = useMemo(() => {
    if (!form.start_date || !computedEndDate) return 0;
    const start = new Date(form.start_date);
    const end = new Date(computedEndDate);
    const diffMs = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }, [form.start_date, computedEndDate]);

  // Hours count (for hourly: 24h * days + extra hours)
  const totalHours = useMemo(() => {
    if (form.rentalType === "hourly") {
      return Math.max(1, Number(form.hours) || 1);
    }
    return daysCount * HOURS_PER_DAY;
  }, [form.rentalType, form.hours, daysCount]);

  // Total cost
  const totalCost = useMemo(() => {
    const qty = Number(form.quantity) || 1;
    if (form.rentalType === "hourly") {
      return totalHours * qty * hourlyRate;
    }
    return daysCount * qty * dailyRate;
  }, [form.rentalType, totalHours, daysCount, form.quantity, hourlyRate, dailyRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.customer_name.trim() || !form.phone_number.trim()) {
      setError("Name and phone number are required.");
      return;
    }
    if (form.rentalType === "daily" && !computedEndDate) {
      setError("Please select a return date.");
      return;
    }
    if (form.rentalType === "hourly" && (!form.hours || Number(form.hours) < 1)) {
      setError("Please enter the number of hours needed.");
      return;
    }

    setLoading(true);
    try {
      const durationLabel = form.rentalType === "hourly"
        ? `${form.hours} hour(s)`
        : `${daysCount} day(s)`;

      await apiClient.post("/hire_requests", {
        customer_name: form.customer_name,
        phone_number:  form.phone_number,
        email:         form.email || null,
        item_name:     item.name,
        item_category: item.category || null,
        quantity:      Number(form.quantity) || 1,
        start_date:    form.start_date,
        end_date:      form.rentalType === "daily" ? computedEndDate : today,
        location:      form.location || null,
        notes:         `[${form.rentalType === "hourly" ? "Hourly" : "Daily"} Rental] ${form.notes || ""}`.trim(),
        total_cost:    totalCost,
        status:        "pending",
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to submit request. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = async () => {
    let adminNumber = "254112051739";
    try {
      const response = await apiClient.get('/settings');
      const settings = response.data;
      const category = (item.category || "").toLowerCase();
      if (category === "chairs") {
        adminNumber = settings.chairs_handler_phone || adminNumber;
      } else if (category === "instruments") {
        adminNumber = settings.instruments_handler_phone || adminNumber;
      } else {
        adminNumber = settings.hire_admin_phone || adminNumber;
      }
    } catch {
      const category = (item.category || "").toLowerCase();
      if (category === "chairs") {
        adminNumber = localStorage.getItem("csa_chairs_handler_phone") || adminNumber;
      } else if (category === "instruments") {
        adminNumber = localStorage.getItem("csa_instruments_handler_phone") || adminNumber;
      } else {
        adminNumber = localStorage.getItem("csa_hire_admin_phone") || adminNumber;
      }
    }

    const durationLabel = form.rentalType === "hourly"
      ? `${form.hours} hour(s)`
      : `${daysCount} day(s)`;
    const rateUsed = form.rentalType === "hourly" ? hourlyRate : dailyRate;
    const rateLabel = form.rentalType === "hourly" ? "hour" : "day";

    const message = `Hello, I have submitted a hire request:\n\n*Name:* ${form.customer_name}\n*Phone:* ${form.phone_number}\n*Email:* ${form.email || 'N/A'}\n*Item:* ${item.name}\n*Quantity:* ${form.quantity}\n*Duration:* ${durationLabel}\n*Rate:* KES ${rateUsed.toLocaleString()}/${rateLabel}\n*Total Cost:* KES ${totalCost.toLocaleString()}\n*Location:* ${form.location || 'N/A'}\n*Notes:* ${form.notes || 'None'}`;
    window.open(`https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-white font-black text-lg">Request Hire</h2>
            <p className="text-blue-200 text-sm mt-0.5">{item.name}</p>
            <div className="flex gap-3 mt-1">
              <span className="text-blue-300 text-xs font-bold">KES {dailyRate.toLocaleString()}/day</span>
              {isInstrument && (
                <span className="text-blue-300 text-xs font-bold">KES {hourlyRate.toLocaleString()}/hr</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-slate-800 font-black text-lg">Request Submitted!</h3>
            <p className="text-slate-500 mt-2 text-sm">
              We'll contact you on <strong>{form.phone_number}</strong> to confirm your hire of <strong>{item.name}</strong>.
            </p>
            {totalCost > 0 && (
              <p className="mt-2 text-blue-600 font-black text-lg">
                Total: KES {totalCost.toLocaleString()}
              </p>
            )}
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
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Quantity *</label>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              {/* Rental Type Toggle — only for instruments */}
              {isInstrument && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Rental Type *</label>
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, rentalType: "daily" }))}
                      className={`flex-1 py-2.5 text-xs font-bold transition-all ${
                        form.rentalType === "daily"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <CalendarDays size={12} className="inline mr-1" />
                      Daily
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, rentalType: "hourly" }))}
                      className={`flex-1 py-2.5 text-xs font-bold transition-all ${
                        form.rentalType === "hourly"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <Clock size={12} className="inline mr-1" />
                      Hourly
                    </button>
                  </div>
                </div>
              )}

              {/* Daily: show start date + return date picker */}
              {form.rentalType === "daily" && (
                <>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      <CalendarDays size={12} className="inline mr-1" />Starting From
                    </label>
                    <input
                      type="text"
                      value={new Date(form.start_date).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      readOnly
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 text-slate-600 font-semibold cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Starts from today</p>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      <CalendarDays size={12} className="inline mr-1" />Return By *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        name="end_month"
                        value={form.end_month}
                        onChange={handleChange}
                        required
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white"
                      >
                        <option value="">Month</option>
                        {[
                          { val: 1, label: 'January' }, { val: 2, label: 'February' },
                          { val: 3, label: 'March' }, { val: 4, label: 'April' },
                          { val: 5, label: 'May' }, { val: 6, label: 'June' },
                          { val: 7, label: 'July' }, { val: 8, label: 'August' },
                          { val: 9, label: 'September' }, { val: 10, label: 'October' },
                          { val: 11, label: 'November' }, { val: 12, label: 'December' },
                        ].map(m => (
                          <option key={m.val} value={m.val} disabled={m.val < currentMonth}>
                            {m.label}{m.val < currentMonth ? ' (past)' : ''}
                          </option>
                        ))}
                      </select>
                      <select
                        name="end_day"
                        value={form.end_day}
                        onChange={handleChange}
                        required
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white"
                      >
                        <option value="">Day</option>
                        {Array.from({ length: 31 }, (_, i) => {
                          const dayNum = i + 1;
                          const isCurrentMonth = form.end_month && parseInt(form.end_month) === currentMonth;
                          const isPastDay = isCurrentMonth && dayNum < currentDay;
                          return (
                            <option key={dayNum} value={dayNum} disabled={isPastDay}>
                              {dayNum}{isPastDay ? ' (past)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {computedEndDate
                        ? new Date(computedEndDate + 'T00:00:00').toLocaleDateString('en-KE', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
                        : 'Select month and day'}
                    </p>
                  </div>
                </>
              )}

              {/* Hourly: show hours picker */}
              {form.rentalType === "hourly" && (
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    <Clock size={12} className="inline mr-1" />How Many Hours? *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      name="hours"
                      type="number"
                      min={1}
                      max={24}
                      value={form.hours}
                      onChange={handleChange}
                      required
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                    <span className="text-xs text-slate-500 font-semibold">hours</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[2, 4, 6, 8].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, hours: h }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          Number(form.hours) === h
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    KES {hourlyRate.toLocaleString()} x {form.hours} hour(s) = KES {(hourlyRate * Number(form.hours)).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Event Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Event venue / pickup location"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Additional Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Event name, pickup preference, etc."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none"
                />
              </div>
            </div>

            {/* Cost Breakdown */}
            {((form.rentalType === "daily" && computedEndDate && daysCount > 0) ||
              (form.rentalType === "hourly" && Number(form.hours) > 0)) && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
                <h4 className="text-sm font-black text-blue-800">Cost Breakdown</h4>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Item</span>
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity</span>
                    <span className="font-semibold">{form.quantity} x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="font-semibold">
                      {form.rentalType === "hourly"
                        ? `${form.hours} hour(s)`
                        : `${daysCount} day(s) (${daysCount * HOURS_PER_DAY}h)`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate</span>
                    <span className="font-semibold">
                      KES {(form.rentalType === "hourly" ? hourlyRate : dailyRate).toLocaleString()}/{form.rentalType === "hourly" ? "hr" : "day"}
                    </span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between text-sm">
                    <span className="font-black text-blue-800">Total Amount</span>
                    <span className="font-black text-blue-800 text-lg">KES {totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Submitting...</>
              ) : (
                `Submit Hire Request — KES ${totalCost.toLocaleString()}`
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
