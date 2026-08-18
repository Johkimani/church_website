import { useEffect, useState, useRef } from "react";
import activitiesService from "../../../api/activitiesServices";
import { Plus, Pencil, Trash2, Eye, EyeOff, RefreshCw, CalendarDays, CheckCircle2, Ban, Image, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_INDEX = Object.fromEntries(DAYS.map((d, i) => [d, i]));

interface Activity {
  id: number;
  day: string;
  time: string;
  activity: string;
  venue: string;
  fare: number | null;
  is_active: boolean;
  sort_order: number;
  image_url: string | null;
}

const emptyForm = { day: "Monday", time: "", activity: "", venue: "", fare: "", image_url: "" };

// Mirrors the public page fallback so the admin sees exactly what members see
const FALLBACK_IMAGES: Record<string, string> = {
  Monday: "/images/rosary_prayers.jpg",
  Tuesday: "/images/choir.png",
  Wednesday: "/images/biblestudy.webp",
  Thursday: "/images/rosary_prayers.jpg",
  Friday: "/images/mass.webp",
  Saturday: "/images/sta choir.png",
  Sunday: "/images/church.jpg",
};

function getEffectiveImage(a: { activity: string; day: string; image_url?: string | null }): string {
  if (a.image_url) return a.image_url;
  const title = (a.activity || "").trim();
  if (title === "Saturday Choir Practice") return "/images/sta choir.png";
  if (title === "Tuesday Choir Practice") return "/images/choir.png";
  if (title === "Monday Rosary Prayers") return "/images/rosary_prayers.jpg";
  if (title === "Thursday Rosary Prayers") return "/images/rosary_prayers.jpg";
  if (title === "Wednesday Bible Study") return "/images/biblestudy.webp";
  if (title === "Friday Mass") return "/images/mass.webp";
  return FALLBACK_IMAGES[a.day] || "/images/church.jpg";
}

function ActivityImage({ activity, onReplace, onRemove }: {
  activity: Activity;
  onReplace: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const imgSrc = getEffectiveImage(activity);

  return (
    <div className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group/img">
      {imgSrc ? (
        <img src={imgSrc} alt={activity.activity} className="w-full h-full object-cover" loading="lazy" />
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
        {activity.image_url && (
          <button type="button" onClick={onRemove} title="Remove image"
            className="p-1.5 rounded-full bg-white/90 hover:bg-red-500 hover:text-white text-slate-700 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

const GLOBAL_ROLES = ['csa_chair', 'jumuiya_coordinator', 'admin'];

export default function WeeklyActivitiesAdmin() {
  const { user } = useAuth();
  const userRoles = Array.isArray(user?.role) ? user.role : user?.role ? [user.role] : [];
  const isScoped = !!user?.jumuiya_id && !userRoles.some(r => GLOBAL_ROLES.includes(r));
  const jumuiyaId = user?.jumuiya_id || '';

  const [activities, setActivities] = useState<Activity[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formPreview, setFormPreview] = useState<string | null>(null);
  const [uploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        ? await activitiesService.getJumuiyaWeekly(jumuiyaId, true)
        : await activitiesService.getWeekly();
      setActivities(data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to load activities";
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
    if (!form.day || !form.time || !form.activity || !form.venue) return;
    setSaving(true);
    setError(null);
    let id = editingId;
    try {
      if (id) {
        await activitiesService.updateJumuiyaWeekly(id, form);
      } else {
        const created = isScoped
          ? await activitiesService.createJumuiyaWeekly(jumuiyaId, form)
          : await activitiesService.createWeekly(form);
        id = created?.id;
      }
      if (id && formFile) {
        await activitiesService.uploadWeeklyImage(id, formFile);
      }
      resetForm();
      load();
      toast.success(editingId ? "Activity updated" : "Activity added");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to save activity";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(a: Activity) {
    setForm({ day: a.day, time: a.time, activity: a.activity, venue: a.venue, fare: a.fare ? String(a.fare) : "", image_url: a.image_url || "" });
    setEditingId(a.id);
    setFormFile(null);
    setFormPreview(null);
  }

  function cancelEdit() {
    resetForm();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this activity?")) return;
    setError(null);
    try {
      await activitiesService.deleteJumuiyaWeekly(id);
      load();
      toast.success("Activity deleted");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to delete";
      setError(msg);
      toast.error(msg);
    }
  }

  async function toggleActive(a: Activity) {
    setError(null);
    try {
      if (a.is_active) {
        await activitiesService.deactivateWeekly(a.id);
      } else {
        await activitiesService.activateWeekly(a.id);
      }
      load();
      toast.success(a.is_active ? "Activity deactivated" : "Activity activated");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to toggle";
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleReplaceImage(a: Activity, file: File) {
    setError(null);
    try {
      await activitiesService.uploadWeeklyImage(a.id, file);
      load();
      toast.success("Image updated");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to update image";
      setError(msg);
      toast.error(msg);
    }
  }

  async function handleRemoveImage(a: Activity) {
    if (!confirm(`Remove the custom image for "${a.activity}"? The default image will be shown again.`)) return;
    setError(null);
    try {
      await activitiesService.removeWeeklyImage(a.id);
      load();
      toast.success("Image removed");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to remove image";
      setError(msg);
      toast.error(msg);
    }
  }

  const totalCount = activities.length;
  const activeCount = activities.filter((a) => a.is_active).length;
  const inactiveCount = totalCount - activeCount;
  const sortedActivities = [...activities].sort((a, b) =>
    (DAY_INDEX[a.day] ?? 99) - (DAY_INDEX[b.day] ?? 99) || a.time.localeCompare(b.time)
  );

  const formImageSrc = formPreview || getEffectiveImage({ activity: form.activity || " ", day: form.day, image_url: form.image_url || null });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Weekly Activities</h2>
          <p className="text-sm text-slate-500 mt-1">Manage the recurring weekly schedule shown on the public activities page.</p>
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
            <p className="text-2xl font-black text-slate-800 leading-none">{totalCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Total Activities</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">{activeCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Active</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white shadow-md shadow-slate-500/30 shrink-0">
            <Ban size={18} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800 leading-none">{inactiveCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Inactive</p>
          </div>
        </div>
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
              {editingId ? "Edit Activity" : "Add New Activity"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Activity Image</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    {formImageSrc ? (
                      <img src={formImageSrc} alt="Activity preview" className="w-full h-full object-cover" />
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
                <p className="text-[10px] text-slate-400 mt-1.5">Optional. Leave empty to keep the default picture shown to members.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Day</label>
                <select
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  required
                >
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Activity Name</label>
                <input
                  value={form.activity}
                  onChange={(e) => setForm({ ...form, activity: e.target.value })}
                  placeholder='e.g. "Rosary Prayers", "Choir Practice"'
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Time</label>
                <input
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder='e.g. "6:00 PM" or "18:00"'
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Venue</label>
                <input
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder='e.g. "Parish Hall"'
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  required
                />
              </div>
              {!isScoped && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Fare (KES) — optional</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.fare}
                  onChange={(e) => setForm({ ...form, fare: e.target.value })}
                  placeholder='e.g. "650" for paid activities'
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving || uploading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors">
                  {saving || uploading ? "Saving..." : editingId ? "Update" : "Add Activity"}
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
          ) : activities.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <p className="text-slate-400 text-sm mb-2">No weekly activities yet.</p>
              <p className="text-slate-300 text-xs">Use the form to add your first activity — it will appear on the public page immediately.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedActivities.map((a) => (
                <div key={a.id} className={`bg-white rounded-xl border ${a.is_active ? "border-slate-200" : "border-slate-100 bg-slate-50/50"} p-4 flex items-center gap-4 transition-all hover:shadow-sm`}>
                  <div className={`w-2 h-10 rounded-full shrink-0 ${a.is_active ? "bg-emerald-400" : "bg-slate-200"}`} />

                  <ActivityImage activity={a} onReplace={(f) => handleReplaceImage(a, f)} onRemove={() => handleRemoveImage(a)} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{a.day}</span>
                      {a.image_url && <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Custom image</span>}
                      {!a.is_active && <span className="text-[10px] font-semibold text-slate-300 bg-slate-100 px-2 py-0.5 rounded">Inactive</span>}
                    </div>
                    <h4 className="font-semibold text-slate-800">{a.activity}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span>{a.time}</span>
                      <span>{a.venue}</span>
                      {!isScoped && a.fare ? <span className="font-semibold text-emerald-600">KES {Number(a.fare).toLocaleString()}</span> : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleActive(a)} title={a.is_active ? "Deactivate" : "Activate"}
                      className={`p-2 rounded-lg transition-colors ${a.is_active ? "text-slate-400 hover:text-amber-500 hover:bg-amber-50" : "text-slate-300 hover:text-emerald-500 hover:bg-emerald-50"}`}>
                      {a.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={() => startEdit(a)} title="Edit"
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(a.id)} title="Delete"
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
