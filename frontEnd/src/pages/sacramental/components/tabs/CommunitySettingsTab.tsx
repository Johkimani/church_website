import React, { useState } from 'react';
import { FaKey, FaSave, FaClock, FaMapMarkerAlt, FaMoneyBillWave, FaTshirt, FaUserShield, FaExternalLinkAlt, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext';
import type { CommunityModule } from '../../context/CommunityDataContext';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  moduleId: string;
  module: CommunityModule;
  color: string;
  isAdmin?: boolean;
}

const CommunitySettingsTab: React.FC<Props> = ({ moduleId, module, color, isAdmin }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/authentication/first-login-setup', {
        currentPassword,
        newPassword,
      });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Community & Account Settings</h1>
          <p className="page-description">Operational details, member requirements, and preferences for {module.title}.</p>
        </div>
      </div>

      {/* Quick Navigation Pills */}
      <div className="flex gap-2 mb-6 border-b border-slate-200/60 pb-3">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'info' ? 'text-white shadow-md' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
          }`}
          style={activeTab === 'info' ? { background: color } : {}}
        >
          <FaInfoCircle className="inline mr-1.5" /> Community Details & Rules
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security' ? 'text-white shadow-md' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
          }`}
          style={activeTab === 'security' ? { background: color } : {}}
        >
          <FaKey className="inline mr-1.5" /> Account Security
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* Admin Control Bar (if user is admin) */}
          {isAdmin && (
            <div
              className="p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{ background: `${color}08`, borderColor: `${color}30` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: color }}>
                  <FaUserShield size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">You are an Admin for this Community</h4>
                  <p className="text-slate-500 text-xs mt-0.5">Manage activities, announcements, registered members, and content.</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/admin/community-management/${moduleId}`)}
                className="px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 shadow-md cursor-pointer shrink-0"
                style={{ background: color }}
              >
                <FaExternalLinkAlt size={12} /> Open Admin Editor
              </button>
            </div>
          )}

          {/* Guidelines & Operational Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Schedule & Location */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                <FaClock style={{ color }} /> {module.scheduleLabel || 'Schedule & Meeting Times'}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">
                {module.meetingSchedule || 'Scheduled regularly as communicated in announcements.'}
              </p>
              {module.location && (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold bg-slate-50 p-2.5 rounded-xl">
                  <FaMapMarkerAlt style={{ color }} /> Venue: {module.location}
                </div>
              )}
            </div>

            {/* Fees & Uniform Info */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                <FaMoneyBillWave style={{ color }} /> Membership Requirements & Fees
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="font-medium">Registration:</span>
                  <span className="font-bold text-slate-800">{module.fees?.registration || 'Free'}</span>
                </li>
                {module.fees?.subscription && (
                  <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="font-medium">Subscription / Dues:</span>
                    <span className="font-bold text-slate-800">{module.fees.subscription}</span>
                  </li>
                )}
                {module.fees?.uniform && (
                  <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="font-medium flex items-center gap-1.5"><FaTshirt style={{ color }} /> Uniform:</span>
                    <span className="font-bold text-slate-800">{module.fees.uniform}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Community Standards & Guidelines */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FaCheckCircle style={{ color }} /> Community Standards & Commitment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">1. Active Attendance</p>
                <p className="text-[11px] leading-relaxed text-slate-500">Regular attendance during scheduled practices, liturgical sessions, and fellowships.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">2. Mutual Support</p>
                <p className="text-[11px] leading-relaxed text-slate-500">Upholding spiritual fellowship, brotherly/sisterly love, and parish values.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">3. Ministry Growth</p>
                <p className="text-[11px] leading-relaxed text-slate-500">Dedicated participation in seminars, retreats, and parish outreach activities.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="max-w-md">
          {user ? (
            <form onSubmit={handlePasswordChange} className="settings-form bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="section-title text-base font-bold mb-4 flex items-center gap-2">
                <FaKey style={{ color }} /> Change Account Password
              </h2>

              <div className="form-group mb-4">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="form-group mb-4">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="form-group mb-5">
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.02]"
                style={{ background: color }}
                disabled={saving}
              >
                <FaSave /> {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center">
              <FaUserShield size={32} className="mx-auto text-slate-400 mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Account Login Required</h3>
              <p className="text-slate-500 text-xs mt-1 mb-4">Please log in to manage your personal credentials and security settings.</p>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md"
                style={{ background: color }}
              >
                Log In
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunitySettingsTab;
