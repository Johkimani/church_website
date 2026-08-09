// src/pages/Landing/components/sections/activities/index.jsx
// Mirrors repo's ActivitiesSection structure: loadActivities, groupedActivities,
// same loading/error states, same card design system (white bg, slate text, blue accents)
import { useState, useEffect, useRef } from "react";
import { useCachedData } from "../../../../../hooks/useCachedData";
import { Clock, MapPin, Calendar, Plus, Trash2, RefreshCw, Activity, X, Smartphone, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import apiService from "../../../services/api";
import toast from "react-hot-toast";
import useCountdown from "../../../../../hooks/useCountdown";
import { useAuth } from "../../../../../context/AuthContext";
import { bookingService } from "../../../../../api/activitiesServices";
import { useNavigate } from "react-router-dom";

// ── Activity icons — matches repo's emoji/icon style ──────────────
const ACTIVITY_ICONS = {
  "Rosary":         "📿",
  "Choir Practice": "🎵",
  "Bible Study":    "📖",
  "Mass":           "⛪",
};

// ── Day accent colours — slate palette matching repo's design system ─
const DAY_COLORS = {
  Monday:    "border-l-blue-400   bg-blue-50/40",
  Tuesday:   "border-l-purple-400 bg-purple-50/40",
  Wednesday: "border-l-emerald-400 bg-emerald-50/40",
  Thursday:  "border-l-amber-400  bg-amber-50/40",
  Friday:    "border-l-rose-400   bg-rose-50/40",
  Saturday:  "border-l-indigo-400 bg-indigo-50/40",
  Sunday:    "border-l-slate-400  bg-slate-50/40",
};
const ACTIVITY_IMAGES = {
  Monday: "/images/rosary_prayers.jpg",
  Tuesday: "/images/choir.png",
  Wednesday: "/images/biblestudy.webp",
  Thursday: "/images/rosary_prayers.jpg",
  Friday: "/images/mass.webp",
  Saturday: "/images/sta-choir.png",
};

// ── Image mapping for Weekly Activities ───────────────────────────
const DEFAULT_ACTIVITY_IMAGE = "/images/church.jpg";

const getWeeklyActivityImage = (activity) => {
  const title = String(activity?.activity || "").trim();
  const day = String(activity?.day || "").trim();

  // Admin-uploaded image takes priority over the default mapping
  if (activity?.image_url) return activity.image_url;

  // Requirements mapping
  if (title === "Saturday Choir Practice") return "/images/sta choir.png";
  if (title === "Tuesday Choir Practice") return "/images/choir.png";

  if (title === "Monday Rosary Prayers") return  "/images/rosary_prayers.jpg";
  if (title === "Thursday Rosary Prayers") return  "/images/rosary_prayers.jpg";

  if (title === "Wednesday Bible Study") return "/images/biblestudy.webp";

  if (title === "Friday Mass") return "/images/mass.webp";

  // Defensive mapping if titles don’t match exactly (based on day)
  if (day === "Saturday") return "/images/sta choir.png";
  if (day === "Tuesday") return "/images/choir.png";
  if (day === "Wednesday") return "/images/biblestudy.webp";
  if (day === "Monday" || day === "Thursday") return "/images/rosary_prayers.jpg";
  if (day === "Friday") return "/images/mass.webp";

  return null;
};

// ── Weekly Activity Card ───────────────────────────────────────────
function WeeklyCard({ activity, onBook, bookingState }) {
  const { user } = useAuth();
  const colorClass = DAY_COLORS[activity.day] || "border-l-gray-300 bg-gray-50/40";
  const icon = ACTIVITY_ICONS[activity.activity] || "✝";

  const mappedImage = getWeeklyActivityImage(activity);
  const imgSrc = mappedImage || DEFAULT_ACTIVITY_IMAGE;

  const getNextWeeklyOccurrence = () => {
    const dayToIndex = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
    };
    const targetDayIndex = dayToIndex[(activity.day || "").trim()];
    if (targetDayIndex === undefined) return null;
    const timeStr = String(activity.time || "").trim();
    const now = new Date();
    let hours = 0; let minutes = 0;
    const m24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (m24) { hours = Number(m24[1]); minutes = Number(m24[2]); } else {
      const m12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (m12) { hours = Number(m12[1]); minutes = Number(m12[2]); const ampm = m12[3].toUpperCase(); if (ampm === "PM" && hours < 12) hours += 12; if (ampm === "AM" && hours === 12) hours = 0; }
    }
    const daysUntil = (targetDayIndex - now.getDay() + 7) % 7;
    const target = new Date(now);
    target.setDate(now.getDate() + daysUntil);
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 7);
    return target;
  };

  const nextOccurrence = getNextWeeklyOccurrence();
  const { isValid, days, hours, minutes, seconds } = useCountdown(nextOccurrence ?? null);
  const timerText = !isValid ? "Starts soon" : days > 0 ? `Starts in ${days}d ${hours}h ${minutes}m` : `Starts in ${hours}h ${minutes}m ${seconds}s`;

  const renderBookButton = () => {
    if (!user) return <span className="text-[9px] text-slate-400 italic">Login to book</span>;
    if (bookingState?.id) {
      const paid = Number(bookingState.paid_amount || 0);
      const fare = Number(bookingState.fare || activity.fare || 0);
      if (paid >= fare) {
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full tracking-wider">
            <CheckCircle2 size={12} /> Paid
          </span>
        );
      }
      return (
        <button onClick={(e) => { e.stopPropagation(); onBook(activity, 'weekly', bookingState); }}
          className="text-[10px] font-black bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-full uppercase tracking-wider transition-all shadow-sm">
          Pay Now
        </button>
      );
    }
    return (
      <button onClick={(e) => { e.stopPropagation(); onBook(activity, 'weekly'); }}
        className="text-[10px] font-black bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full uppercase tracking-wider transition-all">
        Book Now
      </button>
    );
  };

  return (
    <div
      className={`bg-white rounded-2xl border-l-4 ${colorClass} border border-slate-100 p-5
        hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] transition-all duration-500
        hover:-translate-y-0.5 cursor-default group`}
    >
      <img
        src={imgSrc}
        alt={activity.activity}
        className="w-full h-56 object-cover rounded-xl mb-4"
        loading="lazy"
      />
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase mb-1">{activity.day}</p>
          <h4 className="text-base font-black text-slate-800 group-hover:text-primary transition-colors duration-300">
            {icon} {activity.activity}
          </h4>
        </div>
      </div>
      <div className="space-y-1.5 text-xs font-medium text-slate-500">
        <p className="flex items-center gap-2">
          <Clock size={12} className="text-primary/60" />{activity.time}
        </p>
        <p className="text-[11px] text-slate-600 font-semibold">⏳ {timerText}</p>
        <p className="flex items-center gap-2">
          <MapPin size={12} className="text-primary/60" />{activity.venue}
        </p>
        {activity.fare && Number(activity.fare) > 0 && (
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
            <span className="font-bold text-emerald-600">KES {Number(activity.fare).toLocaleString()}</span>
            {renderBookButton()}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Semester Event Card ────────────────────────────────────────────
function SemesterCard({ event, onBook, bookingState }) {
  const { user } = useAuth();
  const dt = new Date(event.date_time);
  const isPast = dt < new Date();

  const { isValid, days, hours, minutes, seconds } = useCountdown(event.date_time ?? null);
  const timerText = !isValid ? "No date set" : days > 0 ? `Starts in ${days}d ${hours}h ${minutes}m` : `Starts in ${hours}h ${minutes}m ${seconds}s`;

  const renderBookButton = () => {
    if (!user) return <span className="text-[9px] text-slate-400 italic">Login to book</span>;
    if (bookingState?.id) {
      const paid = Number(bookingState.paid_amount || 0);
      const fare = Number(bookingState.fare || event.fare || 0);
      if (paid >= fare) {
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full tracking-wider">
            <CheckCircle2 size={12} /> Paid
          </span>
        );
      }
      return (
        <button onClick={(e) => { e.stopPropagation(); onBook(event, 'semester', bookingState); }}
          className="text-[10px] font-black bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-full uppercase tracking-wider transition-all shadow-sm">
          Pay Now
        </button>
      );
    }
    return (
      <button onClick={(e) => { e.stopPropagation(); onBook(event, 'semester'); }}
        className="text-[10px] font-black bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full uppercase tracking-wider transition-all">
        Book Now
      </button>
    );
  };

  return (
    <div
      className={`group bg-white rounded-[1.5rem] border border-slate-100
        hover:border-slate-200 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)]
        transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] p-6 cursor-default
        ${isPast ? "opacity-60" : ""}`}
    >
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-56 object-cover rounded-xl mb-4"
          loading="lazy"
        />
      )}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          {isPast && (
            <span className="inline-block text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full tracking-widest uppercase mb-2">
              Past Event
            </span>
          )}
          <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-primary transition-colors duration-300">
            {event.title}
          </h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {event.description}
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-slate-100 mb-4" />

      <div className="space-y-2 text-xs font-medium text-slate-500">
        <p className="flex items-center gap-2">
          <Calendar size={12} className="text-primary/60" />
          {dt.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <p className="flex items-center gap-2">
          <Clock size={12} className="text-primary/60" />
          {dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="text-[11px] text-slate-600 font-semibold">⏳ {timerText}</p>
        <p className="flex items-center gap-2">
          <MapPin size={12} className="text-primary/60" />
          {event.venue}
        </p>
        {event.fare && Number(event.fare) > 0 && (
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
            <span className="font-bold text-emerald-600">KES {Number(event.fare).toLocaleString()}</span>
            {renderBookButton()}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Booking Modal ──────────────────────────────────────────────────
function BookingModal({ activity, activityType, onClose, existingBooking, onPaymentComplete }) {
  const [step, setStep] = useState(existingBooking?.id ? "paying" : "book");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [bookingId, setBookingId] = useState(existingBooking?.id || null);
  const [checkoutId, setCheckoutId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const pollRef = useRef(null);

  const fare = Number(activity?.fare || 0);
  const paidSoFar = Number(existingBooking?.paid_amount || 0);
  const remaining = fare - paidSoFar;

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function pollPaymentStatus(cId, bookingIdVal) {
    const maxAttempts = 20;
    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const status = await bookingService.checkPaymentStatus(cId);
        if (status.status === "paid") {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setStep("payment_complete");
          if (onPaymentComplete) onPaymentComplete(bookingIdVal);
        } else if (status.status === "failed") {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setMessage("Payment failed. Please try again.");
          setStep("error");
        } else if (attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    };
    pollRef.current = setInterval(poll, 3000);
  }

  async function handleBook() {
    setProcessing(true);
    setMessage("");
    try {
      const result = await bookingService.book(activity.id, activityType);
      setBookingId(result.id);
      setStep("paying");
      toast.success("Booking created! Enter amount to pay.");
    } catch (err) {
      const errMsg = err?.response?.data?.error || "";
      if (err.response?.status === 409) {
        setBookingId(err.response.data.booking_id);
        setStep("paying");
        toast.success("You already have a booking. Continue with payment.");
      } else {
        setMessage(errMsg || err?.message || "Booking failed");
        setStep("error");
      }
    } finally {
      setProcessing(false);
    }
  }

  async function handlePay() {
    if (!phone || !amount) return;
    setProcessing(true);
    setMessage("");
    try {
      const result = await bookingService.pay(bookingId, parseInt(amount), phone.startsWith("254") ? phone : `254${phone}`);
      setCheckoutId(result.checkoutId);
      setStep("success");
      toast.success("STK Push sent! Check your phone.");
      pollPaymentStatus(result.checkoutId, bookingId);
    } catch (err) {
      setMessage(err?.response?.data?.error || err?.message || "Payment failed");
      setStep("error");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900">{activity?.activity || activity?.title || "Paid Activity"}</h2>
            <p className="text-xs text-blue-600 font-bold mt-1 uppercase tracking-widest">KES {fare.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"><X size={20} /></button>
        </div>
        <div className="p-8 relative z-10">
          {step === "book" && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">Confirm your booking for <strong>{activity?.activity || activity?.title}</strong>.</p>
              {message && <div className="text-sm text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100">{message}</div>}
              <button onClick={handleBook} disabled={processing}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2">
                {processing ? <Loader2 className="animate-spin" /> : null}
                {processing ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          )}
          {step === "paying" && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">
                {existingBooking?.id ? (
                  <>You have already paid <strong>KES {paidSoFar.toLocaleString()}</strong> of <strong>KES {fare.toLocaleString()}</strong>. Pay the remaining <strong>KES {remaining.toLocaleString()}</strong> via M-Pesa.</>
                ) : (
                  <>Pay via M-Pesa. You can pay the full fare or a partial amount (lipa mdogo mdogo).</>
                )}
              </p>
              {message && <div className="text-sm text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100">{message}</div>}
              <div>
                <label htmlFor="activity-amount" className="block text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1">Amount (KES)</label>
                <input type="number" id="activity-amount" name="activity-amount" autoComplete="off" value={amount} onChange={(e) => setAmount(e.target.value)}
                  min="1" max={remaining}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all text-lg font-bold text-gray-900" />
                <p className="text-[10px] text-slate-400 mt-1 ml-1">Enter any amount between 1 and {remaining.toLocaleString()} (you can pay later)</p>
              </div>
              <div>
                <label htmlFor="activity-phone" className="block text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1">M-Pesa Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" id="activity-phone" name="activity-phone" autoComplete="tel-national" value={phone} onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.startsWith('254')) val = val.substring(3);
                    else if (val.startsWith('0')) val = val.substring(1);
                    if (val.length <= 9) setPhone(val);
                  }}
                    placeholder="712345678"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all text-gray-900 font-bold" />
                </div>
              </div>
              <button onClick={handlePay} disabled={processing || !amount || !phone}
                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2">
                {processing ? <Loader2 className="animate-spin" /> : <Smartphone size={20} />}
                {processing ? "Sending STK Push..." : `Pay KES ${Number(amount || 0).toLocaleString()}`}
              </button>
            </div>
          )}
          {step === "success" && (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Loader2 size={40} className="animate-spin" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">STK Push Sent</h3>
                <p className="text-slate-500 mt-2">Please check your phone and enter your M-Pesa PIN to complete payment. Waiting for confirmation...</p>
              </div>
              <button onClick={onClose} className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition-all">Close</button>
            </div>
          )}
          {step === "payment_complete" && (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Payment Successful</h3>
                <p className="text-slate-500 mt-2">Your payment has been confirmed. Thank you!</p>
              </div>
              <button onClick={onClose} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all">Done</button>
            </div>
          )}
          {step === "error" && (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center"><AlertCircle size={40} /></div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">Error</h3>
                <p className="text-slate-500 mt-2">{message || "Something went wrong. Please try again."}</p>
              </div>
              <button onClick={() => { setStep("book"); setMessage(""); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all">Try Again</button>
            </div>
          )}
        </div>
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 italic text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
          Secure Payment • Powered by M-Pesa Daraja
        </div>
      </div>
    </div>
  );
}

// ── Main Section ───────────────────────────────────────────────────
const ActivitiesSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookingTarget, setBookingTarget] = useState(null); // { activity, type, existingBooking }
  const [userBookings, setUserBookings] = useState([]);
  const { data: activitiesData, loading, error, refetch: loadActivities } = useCachedData(
    'csa_cache_public_activities',
    async () => {
      const [weeklyData, semesterData] = await Promise.all([
        apiService.getWeeklyActivities(),
        apiService.getSemesterActivities(),
      ]);
      return { weekly: weeklyData, semester: semesterData };
    },
    { weekly: [], semester: [] }
  );

  const weekly = activitiesData.weekly || [];
  const semester = activitiesData.semester || [];

  useEffect(() => {
    refreshBookings();
  }, [user]);

  async function refreshBookings() {
    if (user) {
      try {
        const data = await bookingService.myBookings();
        setUserBookings(data || []);
      } catch (_) {}
    } else {
      setUserBookings([]);
    }
  }

  const bookingMap = {};
  userBookings.forEach((b) => {
    if (b.status !== "cancelled") {
      bookingMap[`${b.activity_type}:${b.activity_id}`] = b;
    }
  });

  if (loading) {
    return (
      <div id="activities" className="py-8 md:py-16 bg-gray-50">
        <div className="container mx-auto px-3 md:px-4 text-center">
          <p className="text-gray-500">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="activities" className="py-8 md:py-16 bg-gray-50">
        <div className="container mx-auto px-3 md:px-4 text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <button onClick={loadActivities}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-sm font-bold transition-all hover:bg-primary-dark">
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="activities" className="py-12 md:py-20 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48 opacity-60 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[clamp(2.5rem,8vw,4.5rem)] leading-none tracking-[-0.03em] mb-6 bg-gradient-to-br from-slate-900 to-blue-800 bg-clip-text text-transparent">
            CSA Activities
          </h2>
          <p className="text-slate-600 text-xl leading-[1.6] max-w-[650px] mx-auto">
            Join us throughout the week and semester for prayer, worship, fellowship, and service.
          </p>
        </div>

        {/* Weekly Schedule */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase mb-1">Every Week</p>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Weekly Schedule</h3>
            </div>
            {user && (
              <button onClick={() => navigate("/my-bookings")}
                className="text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full uppercase tracking-wider transition-all">
                My Bookings
              </button>
            )}
          </div>

          {weekly.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <Activity size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-sm">No weekly activities yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {weekly.map((a) => (
                <WeeklyCard
                  key={a.id}
                  activity={a}
                  bookingState={bookingMap[`weekly:${a.id}`]}
                  onBook={(act, type, existing) => setBookingTarget({ activity: act, type, existingBooking: existing })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Semester Events */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase mb-1">This Semester</p>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Semester Events</h3>
            </div>
          </div>

          {semester.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <Calendar size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-sm">No semester events yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {semester.map((e) => (
                <SemesterCard
                  key={e.id}
                  event={e}
                  bookingState={bookingMap[`semester:${e.id}`]}
                  onBook={(act, type, existing) => setBookingTarget({ activity: act, type, existingBooking: existing })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {bookingTarget && (
        <BookingModal
          activity={bookingTarget.activity}
          activityType={bookingTarget.type}
          existingBooking={bookingTarget.existingBooking}
          onPaymentComplete={(id) => refreshBookings()}
          onClose={() => { setBookingTarget(null); loadActivities(); refreshBookings(); }}
        />
      )}
    </div>
  );
};

export default ActivitiesSection;