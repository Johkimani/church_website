import { useState, useRef, useEffect } from "react";
import { Code2, Plus, Trash2, Save, RotateCcw, Phone, ShieldCheck, Users } from "lucide-react";
import PanelHeader from "../components/PanelHeader";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { uploadFile } from "../../../api/axiosInstance";
import {
  type Developer,
  type ChairpersonContact,
  loadDeveloperSettings,
  saveDeveloperSettings,
  resetDeveloperSettings,
  DEFAULT_SETTINGS,
  loadDeveloperSettingsFromServer,
  saveDeveloperSettingsToServer,
  resetDeveloperSettingsOnServer,
} from "../../../layOuts/developerTeamStore";

const GRADIENT_PALETTE = [
  "linear-gradient(135deg, #2563EB, #7C3AED)",
  "linear-gradient(135deg, #0EA5E9, #2563EB)",
  "linear-gradient(135deg, #059669, #0EA5E9)",
  "linear-gradient(135deg, #F59E0B, #EF4444)",
];

function PhotoField({
  value,
  onChange,
  label = "Photo",
  placeholder = "Paste an image link...",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile(file, { compress: true });
      const url = res.data?.data?.url;
      if (url) {
        onChange(url);
        toast.success("Photo uploaded");
      } else {
        toast.error("Upload did not return a URL");
      }
    } catch {
      toast.error("Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {uploading ? "Uploading..." : "From device"}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function AvatarPreview({ name, avatar, gradient }: { name: string; avatar?: string; gradient: string }) {
  if (avatar && avatar.trim()) {
    return (
      <img
        src={avatar.trim()}
        alt={`${name} preview`}
        className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold ring-2 ring-white shadow-sm"
      style={{ background: gradient }}
    >
      {initials || "?"}
    </div>
  );
}

export default function DeveloperTeamManager() {
  const { user } = useAuth();
  const [developers, setDevelopers] = useState<Developer[]>(() => loadDeveloperSettings().developers);
  const [chair, setChair] = useState<ChairpersonContact>(() => loadDeveloperSettings().chairperson);
  const [teamPhoto, setTeamPhoto] = useState<string>(() => loadDeveloperSettings().teamPhoto ?? "");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadDeveloperSettingsFromServer().then((settings) => {
      if (cancelled || !settings) return;
      setDevelopers(settings.developers);
      setChair(settings.chairperson);
      setTeamPhoto(settings.teamPhoto ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const userRoles = Array.isArray(user?.role) ? user.role : user?.role ? [user.role] : [];
  const isChair = userRoles.some((r: string) => String(r).toUpperCase().trim() === "CSA_CHAIR");

  if (!isChair) {
    return (
      <div className="max-w-3xl mx-auto">
        <PanelHeader title="Developer Team" subtitle="Chairperson only" icon={Code2} />
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="inline-flex p-6 bg-slate-50 rounded-full mb-4">
            <ShieldCheck className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Restricted</h3>
          <p className="text-slate-500 mt-2">
            Only the CSA Chairperson can manage the development team details shown in the footer.
          </p>
        </div>
      </div>
    );
  }

  const updateDeveloper = (index: number, patch: Partial<Developer>) => {
    setDevelopers((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const addDeveloper = () => {
    setDevelopers((prev) => [
      ...prev,
      {
        name: "New Developer",
        role: "Role",
        avatar: "",
        gradient: GRADIENT_PALETTE[prev.length % GRADIENT_PALETTE.length],
      },
    ]);
  };

  const removeDeveloper = (index: number) => {
    setDevelopers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const settings = { developers, chairperson: chair, teamPhoto };
    saveDeveloperSettings(settings);
    setSaving(true);
    try {
      await saveDeveloperSettingsToServer(settings);
      toast.success("Development team details saved and published");
    } catch {
      toast.error("Saved on this device, but failed to publish to the site");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    resetDeveloperSettings();
    setDevelopers(DEFAULT_SETTINGS.developers);
    setChair(DEFAULT_SETTINGS.chairperson);
    setTeamPhoto("");
    setResetting(true);
    try {
      await resetDeveloperSettingsOnServer();
      toast.success("Restored default details");
    } catch {
      toast.error("Defaults restored on this device, but failed to publish to the site");
    } finally {
      setResetting(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PanelHeader
        title="Developer Team"
        subtitle="Chairperson only — details shown in the footer's Development Team dialog"
        icon={Code2}
        actions={
          <>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={14} />
              {resetting ? "Resetting..." : "Reset Defaults"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {saving ? "Publishing..." : "Save Changes"}
            </button>
          </>
        }
      />

      {/* Developers */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Developers</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Add each developer's name, role, and photo. Leave the photo blank to show their initials.
            </p>
          </div>
          <button
            onClick={addDeveloper}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all"
          >
            <Plus size={14} />
            Add Developer
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {developers.map((dev, index) => (
            <div key={index} className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="shrink-0">
                <AvatarPreview name={dev.name} avatar={dev.avatar} gradient={dev.gradient} />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Name
                  </label>
                  <input
                    value={dev.name}
                    onChange={(e) => updateDeveloper(index, { name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Role
                  </label>
                  <input
                    value={dev.role}
                    onChange={(e) => updateDeveloper(index, { role: e.target.value })}
                    placeholder="e.g. Full-Stack Developer"
                    className={inputCls}
                  />
                </div>
                <div>
                  <PhotoField
                    label="Photo"
                    value={dev.avatar ?? ""}
                    onChange={(url) => updateDeveloper(index, { avatar: url })}
                    placeholder="Paste image link or upload from device"
                  />
                </div>
              </div>
              <button
                onClick={() => removeDeveloper(index)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Remove developer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {developers.length === 0 && (
            <div className="p-10 text-center text-slate-500 text-sm">
              No developers yet. Click "Add Developer" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Team photo */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Team Photo
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            One group photo of the whole team together. Shown at the top of the Development Team dialog.
          </p>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div>
            {teamPhoto ? (
              <img
                src={teamPhoto}
                alt="Team photo preview"
                className="w-full max-h-44 object-cover rounded-2xl ring-2 ring-slate-100 shadow-sm"
              />
            ) : (
              <div className="w-full min-h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
                No team photo yet
              </div>
            )}
          </div>
          <PhotoField
            label="Team photo"
            value={teamPhoto}
            onChange={setTeamPhoto}
            placeholder="Paste a group photo link or upload from device"
          />
        </div>
      </div>

      {/* Chairperson */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-amber-500" />
            Chairperson Contact
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Shown at the bottom of the Development Team dialog with a tap-to-call button.
          </p>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Name
            </label>
            <input
              value={chair.name}
              onChange={(e) => setChair({ ...chair, name: e.target.value })}
              placeholder="e.g. John Mwangi"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Role
            </label>
            <input
              value={chair.role}
              onChange={(e) => setChair({ ...chair, role: e.target.value })}
              placeholder="e.g. Chairperson — St. Thomas Aquinas CSA"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Phone Number
            </label>
            <input
              value={chair.phone}
              onChange={(e) => setChair({ ...chair, phone: e.target.value })}
              placeholder="e.g. +254700000000"
              type="tel"
              className={inputCls}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
