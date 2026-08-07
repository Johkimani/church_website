import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiClient } from "../../../api/axiosInstance";
import { Eye, EyeOff, KeyRound, Loader2, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
  jumuiyaColor: string;
}

export default function SettingsTab({ jumuiyaColor }: Props) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/authentication/first-login-setup", {
        member_id: user?.member_id,
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const _c = (s) => jumuiyaColor.length > 7 ? jumuiyaColor.slice(0, 7) + s : jumuiyaColor + s;

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ backgroundColor: `${_c('20')}` }}>
          <KeyRound className="w-7 h-7" style={{ color: jumuiyaColor }} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
        <p className="text-sm text-slate-500">Update your password</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-slate-50 rounded-xl px-4 py-3 pr-11 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
            />
            <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-0 bottom-0 text-slate-400 hover:text-black">
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-slate-50 rounded-xl px-4 py-3 pr-11 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
            />
            <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-0 bottom-0 text-slate-400 hover:text-black">
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-black text-white font-bold text-sm py-3.5 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-40"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Updating...</>
          ) : (
            <><CheckCircle size={18} /> Update Password</>
          )}
        </button>
      </div>
    </div>
  );
}
