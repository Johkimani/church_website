import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Save, RefreshCw, CalendarDays, Clock, MapPin, AlertTriangle, CheckCircle2, Quote,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../../api/axiosInstance";

interface Props {
  jumuiyaId: string;
  jumuiyaName: string;
}

interface ScheduleRow {
  day?: string;
  time?: string;
  venue?: string;
}

interface JumuiyaRow {
  id?: string;
  group_id?: string;
  about?: string;
  meetingSchedule?: ScheduleRow;
}

export default function JumuiyaAboutEditor({ jumuiyaId, jumuiyaName }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ story: "", day: "", time: "", venue: "" });
  const [justSaved, setJustSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const { data } = await apiClient.get("/jumuiya-data/all");
      const list: JumuiyaRow[] = data?.data || [];
      const row = list.find((j) => j.id === jumuiyaId || j.group_id === jumuiyaId);
      if (!row) {
        setNotFound(true);
        return;
      }
      setForm({
        story: row.about || "",
        day: row.meetingSchedule?.day || "",
        time: row.meetingSchedule?.time || "",
        venue: row.meetingSchedule?.venue || "",
      });
    } catch {
      toast.error("Failed to load the About content");
    } finally {
      setLoading(false);
    }
  }, [jumuiyaId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setJustSaved(false);
    try {
      await apiClient.patch(`/jumuiya-data/${encodeURIComponent(jumuiyaId)}`, {
        about: form.story,
        meetingSchedule: { day: form.day, time: form.time, venue: form.venue },
      });
      setJustSaved(true);
      toast.success("About page updated!");
    } catch {
      toast.error("Failed to save — please try again");
    } finally {
      setSaving(false);
    }
  };

  const storyParagraphs = form.story.split("\n").filter((p) => p.trim());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <BookOpen size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">About {jumuiyaName}</h2>
            <p className="text-sm text-slate-500">
              Edit the "Our Story" text and meeting schedule shown on the public Jumuiya page.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm w-fit"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-40 bg-slate-100 rounded-2xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
        </div>
      ) : notFound ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">Could not find "{jumuiyaName}"</p>
          <p className="text-sm text-slate-400 mt-1">Refresh the page or contact the admin if this persists.</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Our Story */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Quote size={17} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Our Story</h3>
                <p className="text-xs text-slate-500">Shown in the "Our Story" section of the About page.</p>
              </div>
            </div>
            <textarea
              value={form.story}
              onChange={(e) => setForm((p) => ({ ...p, story: e.target.value }))}
              rows={10}
              placeholder="Write the story of this Jumuiya... separate paragraphs with a blank line."
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-sm leading-relaxed"
            />
            <p className="text-xs text-slate-400 mt-2">
              {form.story.length} characters · {storyParagraphs.length} paragraph{storyParagraphs.length !== 1 ? "s" : ""}
            </p>

            {storyParagraphs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Preview</p>
                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                  {storyParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Meeting Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CalendarDays size={17} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Meeting Schedule</h3>
                <p className="text-xs text-slate-500">Shown in the meeting schedule card of the About page.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <CalendarDays size={13} className="inline mr-1 text-emerald-500" /> Day
                </label>
                <input
                  value={form.day}
                  onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))}
                  placeholder="e.g. Sunday"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Clock size={13} className="inline mr-1 text-emerald-500" /> Time
                </label>
                <input
                  value={form.time}
                  onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                  placeholder="e.g. 2:00 PM – 4:00 PM"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <MapPin size={13} className="inline mr-1 text-emerald-500" /> Venue
                </label>
                <input
                  value={form.venue}
                  onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
                  placeholder="e.g. St. Joseph Chapel A"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none text-sm"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {justSaved && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                <CheckCircle2 size={16} /> Saved
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}