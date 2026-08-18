import React, { useState } from 'react';
import { FaKey, FaSave } from 'react-icons/fa';
import { apiClient } from '../../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  color: string;
}

const CommunitySettingsTab: React.FC<Props> = ({ color }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
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
      toast.success('Password updated!');
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
          <h1 className="page-title">Settings</h1>
          <p className="page-description">Manage your account settings.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        <h2 className="section-title"><FaKey /> Change Password</h2>

        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>

        <button type="submit" className="btn-premium primary" disabled={saving}>
          <FaSave /> {saving ? 'Saving...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default CommunitySettingsTab;
