import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient, uploadFile } from "../../api/axiosInstance";
import {
  X,
  Save,
  Loader2,
  Camera,
  Mail,
  Phone,
  CheckCircle2,
  Church,
} from "lucide-react";

interface ProfileData {
  member_id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  course: string;
  yearOfStudy: string;
  jumuiyaName: string;
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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Editable fields
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");

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
        setProfileImage(data.profileImage || "");
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [open]);

  const hasChanges =
    profile &&
    (phone !== (profile.phone || "") ||
      email !== (profile.email || "") ||
      profileImage !== (profile.profileImage || ""));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const { data } = await uploadFile(file);
      const url = data?.files?.[0]?.url || data?.url || "";
      if (url) {
        setProfileImage(url);
      } else {
        setError("Upload failed — no URL returned");
      }
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, string> = {};
      if (phone !== (profile.phone || "")) payload.phone = phone;
      if (email !== (profile.email || "")) payload.email = email;
      if (profileImage !== (profile.profileImage || "")) payload.profileImage = profileImage;

      if (Object.keys(payload).length === 0) {
        setSaving(false);
        return;
      }

      const { data } = await apiClient.put("/profile/me", payload);
      setProfile((p) =>
        p
          ? {
              ...p,
              phone: data.profile.phone,
              email: data.profile.email,
              profileImage: data.profile.profileImage,
            }
          : p
      );
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

  const initials = profile?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

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
        className={`fixed top-0 right-0 z-[9999] h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col ${
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
          <>
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Profile</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="relative group w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg shadow-slate-200/50 cursor-pointer hover:shadow-xl transition-all"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                      {initials}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploading ? (
                      <Loader2 size={22} className="text-white animate-spin" />
                    ) : (
                      <Camera size={22} className="text-white" />
                    )}
                  </div>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  {uploading ? "Uploading..." : "Change photo"}
                </button>

                {/* Name + Details */}
                <div className="text-center">
                  <h3 className="text-base font-bold text-slate-900">{profile.name}</h3>
                  <div className="flex items-center justify-center gap-1.5 mt-1 flex-wrap">
                    {profile.course && (
                      <span className="text-[11px] font-medium text-slate-400">
                        {profile.course}
                      </span>
                    )}
                    {profile.course && profile.yearOfStudy && (
                      <span className="text-slate-300">·</span>
                    )}
                    {profile.yearOfStudy && (
                      <span className="text-[11px] font-medium text-slate-400">
                        Year {profile.yearOfStudy}
                      </span>
                    )}
                    {(profile.course || profile.yearOfStudy) && profile.jumuiyaName && (
                      <span className="text-slate-300">·</span>
                    )}
                    {profile.jumuiyaName && (
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Church size={10} />
                        {profile.jumuiyaName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <Mail size={12} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-medium placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <Phone size={12} />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-medium placeholder:text-slate-300"
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
            <div className="shrink-0 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              {saved ? (
                <div className="flex items-center justify-center gap-2 text-emerald-600 py-2">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-bold">Saved</span>
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving || uploading || !hasChanges}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-sm transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
