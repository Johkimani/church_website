import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../api/axiosInstance";
import {
  X,
  Save,
  Loader2,
  Lock,
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Church,
  Calendar,
  Shield,
  CheckCircle2,
} from "lucide-react";

interface ProfileData {
  member_id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  course: string;
  yearOfStudy: string;
  joinDate: string;
  status: string;
  jumuiyaName: string;
  jumuiyaSlug: string;
  roles: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileDrawer({ open, onClose }: Props) {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Editable fields
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    setSaved(false);
    apiClient
      .get("/profile/me")
      .then(({ data }) => {
        setProfile(data);
        setPhone(data.phone || "");
        setEmail(data.email || "");
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [open]);

  const hasChanges =
    profile && (phone !== (profile.phone || "") || email !== (profile.email || ""));

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await apiClient.put("/profile/me", { phone, email });
      // Update local profile state
      setProfile((p) =>
        p ? { ...p, phone: data.profile.phone, email: data.profile.email } : p
      );
      // Sync auth context so navbar reflects updated name/email
      if (user) {
        login({ ...user, email: data.profile.email });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setProfile(null);
    setError("");
    setSaved(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[9999] h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : !profile ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
            <p className="text-slate-500 text-sm">{error || "No profile data"}</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">My Profile</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20 shrink-0">
                  {profile.firstName?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{profile.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {profile.roles.length > 0 ? profile.roles.join(", ") : "Member"}
                  </p>
                </div>
              </div>

              {/* ── Locked Fields ─────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={14} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Institutional Info
                  </span>
                </div>
                <div className="space-y-2.5">
                  <LockedField
                    icon={<User size={16} />}
                    label="Full Name"
                    value={profile.name}
                  />
                  <LockedField
                    icon={<GraduationCap size={16} />}
                    label="Registration Number"
                    value={profile.member_id}
                  />
                  <LockedField
                    icon={<BookOpen size={16} />}
                    label="Course"
                    value={profile.course || "—"}
                  />
                  <LockedField
                    icon={<Calendar size={16} />}
                    label="Year of Study"
                    value={profile.yearOfStudy || "—"}
                  />
                  <LockedField
                    icon={<Church size={16} />}
                    label="Jumuiya"
                    value={profile.jumuiyaName || "—"}
                  />
                  {profile.gender && (
                    <LockedField
                      icon={<Shield size={16} />}
                      label="Gender"
                      value={profile.gender}
                    />
                  )}
                </div>
              </div>

              {/* ── Editable Fields ───────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={14} className="text-blue-500" />
                  <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
                    Contact Info
                  </span>
                </div>
                <div className="space-y-3">
                  <EditableField
                    icon={<Mail size={16} />}
                    label="Email Address"
                    value={email}
                    onChange={setEmail}
                    type="email"
                    placeholder="your@email.com"
                  />
                  <EditableField
                    icon={<Phone size={16} />}
                    label="Phone Number"
                    value={phone}
                    onChange={setPhone}
                    type="tel"
                    placeholder="0712345678"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-600 font-medium">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              {saved ? (
                <div className="flex items-center justify-center gap-2 text-emerald-600 py-2.5">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-bold">Saved successfully</span>
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-sm transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Locked (read-only) field ─────────────────────────────── */
function LockedField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="text-slate-400 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
      </div>
      <Lock size={12} className="text-slate-300 shrink-0" />
    </div>
  );
}

/* ── Editable field ──────────────────────────────────────── */
function EditableField({
  icon,
  label,
  value,
  onChange,
  type,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {icon}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 text-sm rounded-xl border-2 border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-medium placeholder:text-slate-300"
      />
    </div>
  );
}
