// src/pages/Landing/components/sections/activities/index.jsx
// Mirrors repo's ActivitiesSection structure: loadActivities, groupedActivities,
// same loading/error states, same card design system (white bg, slate text, blue accents)
import { useState, useEffect } from "react";
import { Clock, MapPin, Calendar, Plus, Trash2, RefreshCw, Activity, Zap } from "lucide-react";
import apiService from "../../../services/api";
import toast from "react-hot-toast";

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

// ── Weekly Activity Card ───────────────────────────────────────────
function WeeklyCard({ activity, onDelete }) {
  const colorClass = DAY_COLORS[activity.day] || "border-l-gray-300 bg-gray-50/40";
  const icon = ACTIVITY_ICONS[activity.activity] || "✝";

  return (
    <div
      className={`bg-white rounded-2xl border-l-4 ${colorClass} border border-slate-100 p-5
        hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] transition-all duration-500
        hover:-translate-y-0.5 cursor-default group`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase mb-1">
            {activity.day}
          </p>
          <h4 className="text-base font-black text-slate-800 group-hover:text-primary transition-colors duration-300">
            {icon} {activity.activity}
          </h4>
        </div>
        <button
          onClick={() => onDelete(activity.id)}
          className="text-slate-200 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="space-y-1.5 text-xs font-medium text-slate-500">
        <p className="flex items-center gap-2">
          <Clock size={12} className="text-primary/60" />{activity.time}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={12} className="text-primary/60" />{activity.venue}
        </p>
      </div>
    </div>
  );
}

// ── Semester Event Card ────────────────────────────────────────────
function SemesterCard({ event, onDelete }) {
  const dt = new Date(event.date_time);
  const isPast = dt < new Date();

  return (
    <div
      className={`group bg-white rounded-[1.5rem] border border-slate-100
        hover:border-slate-200 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)]
        transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] p-6 cursor-default
        ${isPast ? "opacity-60" : ""}`}
    >
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
        <button
          onClick={() => onDelete(event.id)}
          className="text-slate-200 hover:text-red-400 transition-colors flex-shrink-0 p-1 opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Divider */}
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
        <p className="flex items-center gap-2">
          <MapPin size={12} className="text-primary/60" />
          {event.venue}
        </p>
      </div>
    </div>
  );
}

// ── Add Weekly Form ────────────────────────────────────────────────
function AddWeeklyForm({ onAdd, onClose }) {
  const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const [form, setForm] = useState({ day: "Monday", time: "", activity: "", venue: "Church" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.time || !form.activity) return toast.error("Fill in all fields");
    setSaving(true);
    try { await onAdd(form); onClose(); }
    catch { /* handled in hook */ }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit}
      className="bg-white rounded-[1.5rem] border border-slate-100 p-6 mt-4 shadow-sm space-y-4">
      <h3 className="text-base font-black text-slate-800">Add Weekly Activity</h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Day", field: "day", type: "select" },
          { label: "Time",     field: "time",     placeholder: "e.g. 7:30 PM – 8:00 PM" },
          { label: "Activity", field: "activity", placeholder: "e.g. Rosary" },
          { label: "Venue",    field: "venue",    placeholder: "e.g. Church" },
        ].map(({ label, field, type, placeholder }) => (
          <div key={field}>
            <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1 block">{label}</label>
            {type === "select" ? (
              <select value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full border-2 border-slate-200 focus:border-primary/40 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-all">
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            ) : (
              <input type="text" placeholder={placeholder} value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full border-2 border-slate-200 focus:border-primary/40 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-all placeholder:text-slate-300" />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 justify-end pt-1">
        <button type="button" onClick={onClose}
          className="text-slate-400 hover:text-slate-700 text-sm font-bold px-4 py-2 transition-colors">Cancel</button>
        <button type="submit" disabled={saving}
          className="bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white font-black text-xs tracking-widest px-5 py-2.5 rounded-xl transition-colors">
          {saving ? "Saving..." : "ADD ACTIVITY"}
        </button>
      </div>
    </form>
  );
}

// ── Add Semester Form ──────────────────────────────────────────────
function AddSemesterForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ title: "", date_time: "", venue: "", description: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date_time || !form.venue) return toast.error("Fill in required fields");
    setSaving(true);
    try { await onAdd(form); onClose(); }
    catch { /* handled in hook */ }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit}
      className="bg-white rounded-[1.5rem] border border-slate-100 p-6 mt-4 shadow-sm space-y-4">
      <h3 className="text-base font-black text-slate-800">Add Semester Event</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1 block">Title *</label>
          <input type="text" placeholder="e.g. Recollection Day" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border-2 border-slate-200 focus:border-primary/40 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-all placeholder:text-slate-300" />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1 block">Date & Time *</label>
          <input type="datetime-local" value={form.date_time}
            onChange={(e) => setForm({ ...form, date_time: e.target.value })}
            className="w-full border-2 border-slate-200 focus:border-primary/40 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-all" />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1 block">Venue *</label>
          <input type="text" placeholder="e.g. Church Hall" value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            className="w-full border-2 border-slate-200 focus:border-primary/40 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-all placeholder:text-slate-300" />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1 block">Description</label>
          <textarea rows={3} placeholder="Brief description..." value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border-2 border-slate-200 focus:border-primary/40 text-slate-900 rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition-all placeholder:text-slate-300 resize-none" />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-1">
        <button type="button" onClick={onClose}
          className="text-slate-400 hover:text-slate-700 text-sm font-bold px-4 py-2 transition-colors">Cancel</button>
        <button type="submit" disabled={saving}
          className="bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white font-black text-xs tracking-widest px-5 py-2.5 rounded-xl transition-colors">
          {saving ? "Saving..." : "ADD EVENT"}
        </button>
      </div>
    </form>
  );
}

// ── Main Section ───────────────────────────────────────────────────
// Mirrors repo's ActivitiesSection: loadActivities() in useEffect,
// grouped rendering, same loading/error patterns
const ActivitiesSection = () => {
  const [weekly,   setWeekly]   = useState([]);
  const [semester, setSemester] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [showAddWeekly,   setShowAddWeekly]   = useState(false);
  const [showAddSemester, setShowAddSemester] = useState(false);

  // Mirrors repo's loadActivities pattern exactly
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const [weeklyData, semesterData] = await Promise.all([
        apiService.getWeeklyActivities(),
        apiService.getSemesterActivities(),
      ]);
      setWeekly(weeklyData);
      setSemester(semesterData);
    } catch (err) {
      console.error("Error loading activities:", err);
      setError("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeekly = async (data) => {
    const id = toast.loading("Adding activity...");
    try {
      const res = await apiService.createRecord("activities/weekly", data);
      const created = res?.data ?? res;
      setWeekly((prev) => [...prev, created]);
      toast.success("Weekly activity added!", { id });
    } catch {
      toast.error("Failed to add", { id });
      throw new Error("failed");
    }
  };

  const handleDeleteWeekly = async (itemId) => {
    const id = toast.loading("Deleting...");
    try {
      await apiService.deleteRecord("activities/weekly", itemId);
      setWeekly((prev) => prev.filter((a) => a.id !== itemId));
      toast.success("Deleted!", { id });
    } catch {
      toast.error("Failed to delete", { id });
    }
  };

  const handleAddSemester = async (data) => {
    const id = toast.loading("Adding event...");
    try {
      const res = await apiService.createRecord("activities/semester", data);
      const created = res?.data ?? res;
      setSemester((prev) => [...prev, created]);
      toast.success("Semester event added!", { id });
    } catch {
      toast.error("Failed to add", { id });
      throw new Error("failed");
    }
  };

  const handleDeleteSemester = async (itemId) => {
    const id = toast.loading("Deleting...");
    try {
      await apiService.deleteRecord("activities/semester", itemId);
      setSemester((prev) => prev.filter((a) => a.id !== itemId));
      toast.success("Deleted!", { id });
    } catch {
      toast.error("Failed to delete", { id });
    }
  };

  // ── Loading — mirrors repo's loading state pattern ───────────────
  if (loading) {
    return (
      <div id="activities" className="py-8 md:py-16 bg-gray-50">
        <div className="container mx-auto px-3 md:px-4 text-center">
          <p className="text-gray-500">Loading activities...</p>
        </div>
      </div>
    );
  }

  // ── Error — mirrors repo's error state pattern ───────────────────
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
    <div id="activities" className="py-12 md:py-20 bg-slate-50 relative">
      {/* Background ambient — mirrors repo's section accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48 opacity-60 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* ── Section Header — mirrors repo's CommunitySection header ── */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase mb-8 shadow-sm border border-slate-100">
            <Zap size={12} className="text-primary/40" />
            Our Schedule
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            CSA <span className="text-primary/80">Activities</span>
          </h2>
          <p className="text-slate-500 font-medium text-base leading-relaxed max-w-xl mx-auto">
            Join us throughout the week and semester for prayer, worship, fellowship, and service.
          </p>
        </div>

        {/* ── Weekly Schedule ──────────────────────────────────────── */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase mb-1">Every Week</p>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Weekly Schedule</h3>
            </div>
            <button onClick={() => setShowAddWeekly(!showAddWeekly)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary font-black text-[10px] tracking-widest uppercase transition-all">
              <Plus size={14} /> Add
            </button>
          </div>

          {showAddWeekly && (
            <AddWeeklyForm onAdd={handleAddWeekly} onClose={() => setShowAddWeekly(false)} />
          )}

          {weekly.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <Activity size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-sm">No weekly activities yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {weekly.map((a) => (
                <WeeklyCard key={a.id} activity={a} onDelete={handleDeleteWeekly} />
              ))}
            </div>
          )}
        </div>

        {/* ── Semester Events ──────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase mb-1">This Semester</p>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Semester Events</h3>
            </div>
            <button onClick={() => setShowAddSemester(!showAddSemester)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary font-black text-[10px] tracking-widest uppercase transition-all">
              <Plus size={14} /> Add
            </button>
          </div>

          {showAddSemester && (
            <AddSemesterForm onAdd={handleAddSemester} onClose={() => setShowAddSemester(false)} />
          )}

          {semester.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <Calendar size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium text-sm">No semester events yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {semester.map((e) => (
                <SemesterCard key={e.id} event={e} onDelete={handleDeleteSemester} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesSection;