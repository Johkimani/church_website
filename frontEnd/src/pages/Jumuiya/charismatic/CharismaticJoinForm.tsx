import React, { useState } from 'react';
import { createTableRecord } from '../../../api/axiosInstance';
import Turnstile, { isCaptchaEnabled } from '../../../components/Turnstile';

const CharismaticJoinForm: React.FC<{ moduleId?: string }> = ({ moduleId = 'charismatic' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCaptchaEnabled() && !captchaToken) {
      alert('Please complete the human verification before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await createTableRecord('enrollments', {
        name,
        email,
        phone,
        module_id: moduleId,
        source: 'charismatic-join-form',
        captchaToken,
      });
      alert('Registration submitted. Thank you!');
      setName(''); setEmail(''); setPhone('');
      setCaptchaToken(null);
      setCaptchaResetSignal((s) => s + 1);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to submit.');
      setCaptchaResetSignal((s) => s + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <h3>Join Charismatic Prayer Group</h3>
      <div className="form-group">
        <label>Full name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      {isCaptchaEnabled() && (
        <Turnstile onToken={setCaptchaToken} resetSignal={captchaResetSignal} className="form-group" />
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Join'}</button>
      </div>
    </form>
  );
};

export default CharismaticJoinForm;
