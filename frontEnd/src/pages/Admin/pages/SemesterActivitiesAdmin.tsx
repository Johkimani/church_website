import { useEffect, useState, useRef } from "react";
import activitiesService from "../../../api/activitiesServices";
import { Plus, Pencil, Trash2, Eye, EyeOff, RefreshCw, CalendarDays, CalendarClock, History, Image, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

interface Event {
  id: number;
  title: string;
  description: string;
  date_time: string;
  venue: string;
  fare: number | null;
  is_active: boolean;
  image_url: string | null;
}

const emptyForm = { title: "", description: "", date_time: "", venue: "", fare: "", image_url: "" };

function EventImage({ event, onReplace, onRemove }: {
  event: Event;
  onReplace: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group/img">
      {event.image_url ? (
        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-300">
          <Image size={18} />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onReplace(f);
          e.target.value = "";
        }}
      />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1">
        <button type="button" onClick={() => inputRef.current?.click()} title="Change image"
          className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 transition-colors">
          <Upload size={14} />
        </button>
        {event.image_url && (
          <button type="button" onClick={onRemove} title="Remove image"
            className="p-1.5 rounded-full bg-white/90 hover:bg-red-500 hover:text-white text-slate-700 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function formatDateForInput(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso.slice(0, 16);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return iso.slice(0, 16); }
}

function relativeChip(dt: Date) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
  const diffDays = Math.round((startDay - startToday) / 86400000);
  if (diffDays === 0) return { text: "Today", cls: "bg-indigo-100 text-indigo-700" };
  if (diffDays === 1) return { text: "Tomorrow", cls: "bg-indigo-100 text-indigo-700" };
  if (diffDays > 1 && diffDays <= 7) return { text: `in ${diffDays} days`, cls: "bg-indigo-50 text-indigo-600" };
  if (diffDays > 7) return { text: `in ${diffDays} days`, cls: "bg-slate-100 text-slate-500" };
  return null;
}

const GLOBAL_ROLES = ['csa_chair', 'jumuiya_coordinator', 'admin'];

export default function SemesterActivitiesAdmin() {
  const { user } = useAuth();
  const isScoped = user?.jumuiya_id && !GLOBAL_ROLES.includes(user?.role || '');
  const jumuiyaId = user?.jumuiya_id || '';

  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formPreview, setFormPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => { load(); }, []);

  // Revoke object URL previews when they change or the component unmounts
  useEffect(() => {
    const url = formPreview;
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [formPreview]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = isScoped
        ? await activitiesService.getJumuiyaSemester(jumuiyaId, true)
        : await activitiesService.getSemester();
      setEvents(data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to load events";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFormFile(f);
    setFormPreview(URL.createObjectURL(f));
    e.target.value = "";
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFormFile(null);
    setFormPreview(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date_time || !form.venue) return;
    setSaving(true);
    setError(null);
    let id = editingId;
    try {
      const payload = {
        ...form,
        date_time: new Date(form.date_time).toISOString(),
      };
      if (id) {
        await activitiesService.updateJumuiyaSemester(id, payload);
      } else {
        const created = isScoped
          ? await activitiesService.createJumuiyaSemester(jumuiyaId, payload)
          : await activitiesService.createSemester(payload);
        id = created?.id;
      }
      if (id && formFile) {
        await activitiesService.uploadSemesterImage(id, formFile);
      }
      resetForm();
      load();
      toast.success(editingId ? "Event updated" : "Event added");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to save event";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(e: Event) {
    setForm({
      title: e.title,
      description: e.description || "",
      date_time: formatDateForInput(e.date_time),
      venue: e.venue,
      fare: e.fare ? String(e.fare) : "",
      image_url: e.image_url || "",
    });
    setEditingId(e.id);
    setFormFile(null);
    setFormPreview(null);
  }

  function cancelEdit() {
    resetForm();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this event?")) return;
    setError(null);
    try {
      await activitiesService.deleteJumuiyaSemester(id);
      load();
      toast.success("Event deleted");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to delete";
      setError(msg);
      toast.error(msg);
    }
  }

  async function toggleActive(e: Event) {
    setError(null);
    try {
      if (e.is_active) {
        await activitiesService.deactivateSemester(e.id);
      } else {
        await activitiesService.activateSemester(e.id);
      }
      load();
      toast.success(e.is_active ? "Event deactivated" : "Event activated");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to toggle";
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleReplaceImage(e: Event, file: File) {
    setError(null);
    try {
      await activitiesService.uploadSemesterImage(e.id, file);
      load();
      toast.success("Image updated");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to update image";
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleRemoveImage(e: Event) {
    if (!confirm(`Remove the image for "${e.title}"?`)) return;
    setError(null);
    try {
      await activitiesService.removeSemesterImage(e.id);
      load();
      toast.success("Image removed");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to remove image";
      setError(msg);
      toast.error(msg);
    }
  }

  const now = Date.now();
  const upcomingCount = events.filter((e) => new Date(e.date_time).getTime() >= now).length;
  const pastCount = events.length - upcomingCount;

  const sortedEvents = [...events].sort((a, b) => {
    const da = new Date(a.date_time).getTime();
    const db = new Date(b.date_time).getTime();
    const aPast = da < now;
    const bPast = db < now;
    if (aPast !== bPast) return aPast ? 1 : -1;
    return aPast ? db - da : da - db;
  });

  const filteredEvents = sortedEvents.filter((e) => {
    const t = new Date(e.date_time).getTime();
    if (filter === "upcoming") return t >= now;
    if (filter === "past") return t < now;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Semester Events</h2>
          <p className="text-sm text-slate-500 mt-1">Manage one-off semester events shown on the public activities page.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 shrink-0">
            <CalendarDays size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">{events.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Total Events</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 shrink-0">
            <CalendarClock size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">{upcomingCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Upcoming</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white shadow-md shadow-slate-500/30 shrink-0">
            <History size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">{pastCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Past</p>
          </div>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 w-fit mb-6">
        {(["all", "upcoming", "past"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f === "all" ? `All (${events.length})` : f === "upcoming" ? `Upcoming (${upcomingCount})` : `Past (${pastCount})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-4">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              {editingId ? <Pencil size={16} /> : <Plus size={16} />}
              {editingId ? "Edit Event" : "Add New Event"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Event Image</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    {formPreview || form.image_url ? (
                      <img src={formPreview || form.image_url || ""} alt="Event preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Image size={20} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg cursor-pointer transition-colors">
                      <Upload size={14} />
                      {formFile ? "Change Image" : "Choose Image"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
                    </label>
                    {formFile && (
                      <button type="button" onClick={() => { setFormFile(null); setFormPreview(null); }}
                        className="block text-xs font-semibold text-red-600 hover:text-red-700 transition-colors">
                        Clear selection
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Optional. Shown as the event cover photo on the public page.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder='e.g. "Youth Retreat"'
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.date_time}
                  onChange={(e) => setForm({ ...form, date_time: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Venue</label>
                <input
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder='e.g. "Retreat Center"'
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Fare (KES) — optional</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.fare}
                  onChange={(e) => setForm({ ...form, fare: e.target.value })}
                  placeholder='e.g. "2000" for paid events'
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional event description..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors">
                  {saving ? "Saving..." : editingId ? "Update" : "Add Event"}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="xl:col-span-2">
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-sm">Loading...</div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <p className="text-slate-400 text-sm mb-2">No semester events yet.</p>
              <p className="text-slate-300 text-xs">Use the form to add your first event — it will appear on the public page immediately.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((e) => {
                const dt = new Date(e.date_time);
                const isPast = dt < new Date();
                const rel = !isPast ? relativeChip(dt) : null;
                return (
                  <div key={e.id} className={`bg-white rounded-xl border ${e.is_active ? "border-slate-200" : "border-slate-100 bg-slate-50/50"} p-4 flex items-center gap-4 transition-all hover:shadow-sm`}>
                    <div className={`w-2 h-10 rounded-full shrink-0 ${isPast ? "bg-slate-200" : e.is_active ? "bg-indigo-400" : "bg-slate-200"}`} />

                    <EventImage event={e} onReplace={(f) => handleReplaceImage(e, f)} onRemove={() => handleRemoveImage(e)} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                        {rel && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${rel.cls}`}>{rel.text}</span>}
                        {isPast && <span className="text-[10px] font-semibold text-slate-300 bg-slate-100 px-2 py-0.5 rounded">Past</span>}
                        {e.image_url && <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Custom image</span>}
                        {!e.is_active && <span className="text-[10px] font-semibold text-slate-300 bg-slate-100 px-2 py-0.5 rounded">Inactive</span>}
                      </div>
                      <h4 className="font-semibold text-slate-800">{e.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span>{dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span>{e.venue}</span>
                        {e.fare ? <span className="font-semibold text-emerald-600">KES {Number(e.fare).toLocaleString()}</span> : null}
                      </div>
                      {e.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{e.description}</p>}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleActive(e)} title={e.is_active ? "Deactivate" : "Activate"}
                        className={`p-2 rounded-lg transition-colors ${e.is_active ? "text-slate-400 hover:text-amber-500 hover:bg-amber-50" : "text-slate-300 hover:text-emerald-500 hover:bg-emerald-50"}`}>
                        {e.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => startEdit(e)} title="Edit"
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(e.id)} title="Delete"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
