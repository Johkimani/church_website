import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import Turnstile, { isCaptchaEnabled } from '../../../../components/Turnstile';
import { FaUserPlus, FaCheck } from 'react-icons/fa';
import type { CommunityModule } from '../../context/CommunityDataContext';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  moduleId: string;
  moduleName: string;
  color: string;
  module: CommunityModule;
}

const CommunityRegistrationTab: React.FC<Props> = ({ moduleId, moduleName, color, module }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', voiceType: '', musicLevel: 'Beginner', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  const isChoir = moduleId === 'choir';

  const enrollMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isCaptchaEnabled() && !captchaToken) {
        throw new Error('Please complete the human verification before submitting.');
      }
      const payload = {
        full_name: data.name,
        class_id: moduleId,
        module_id: moduleId,
        voice_type: data.voiceType || '',
        music_level: data.musicLevel || 'Beginner',
        phone: data.phone || '',
        email: data.email || '',
        status: 'Pending',
        captchaToken,
      };
      return await apiClient.post(module.registrationEndpoint || '/enrollments', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', moduleId] });
      toast.success('Registration submitted!');
      setSubmitted(true);
    },
    onError: () => {
      toast.error('Failed to submit. Please try again.');
      setCaptchaResetSignal((s) => s + 1);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enrollMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
        <div className="success-screen">
          <div className="success-icon"><FaCheck /></div>
          <h2>Welcome to {moduleName}!</h2>
          <p>Your registration has been submitted. You will be contacted shortly.</p>
          <button className="btn-premium primary" onClick={() => { setSubmitted(false); setFormData({ name: '', phone: '', email: '', voiceType: '', musicLevel: 'Beginner', notes: '' }); }}>
            Register Another Member
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Join {moduleName}</h1>
          <p className="page-description">Fill out the form below to register as a member.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="registration-form">
        {enrollMutation.isPending && (
          <div className="form-overlay">
            <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full" />
          </div>
        )}

        <div className="form-group">
          <label>Full Name *</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            required
            type="tel"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0712 345 678"
          />
        </div>

        <div className="form-group">
          <label>Email (Optional)</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>

        {isChoir && (
          <>
            <div className="form-group">
              <label>Voice Type</label>
              <select value={formData.voiceType} onChange={e => setFormData({ ...formData, voiceType: e.target.value })}>
                <option value="">Select Voice</option>
                <option>Soprano</option>
                <option>Alto</option>
                <option>Tenor</option>
                <option>Bass</option>
              </select>
            </div>
            <div className="form-group">
              <label>Skill Level</label>
              <select value={formData.musicLevel} onChange={e => setFormData({ ...formData, musicLevel: e.target.value })}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </>
        )}

        <div className="form-group">
          <label>Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="Why do you want to join?"
          />
        </div>

        {isCaptchaEnabled() && (
          <div className="form-group">
            <Turnstile onToken={setCaptchaToken} resetSignal={captchaResetSignal} />
          </div>
        )}

        <button type="submit" className="btn-premium primary full-width">
          <FaUserPlus /> Submit Registration
        </button>
      </form>
    </div>
  );
};

export default CommunityRegistrationTab;
