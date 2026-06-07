import React, { useState } from 'react';
import { createTableRecord } from '../../../api/axiosInstance';

const DancersJoinForm: React.FC<{ moduleId?: string }> = ({ moduleId = 'dancers' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTableRecord('enrollments', {
        name,
        email,
        phone,
        module_id: moduleId,
        source: 'dancers-join-form',
      });
      alert('Registration submitted. Thank you!');
      setName(''); setEmail(''); setPhone('');
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <h3>Join Liturgical Dancers</h3>
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
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Join'}</button>
      </div>
    </form>
  );
};

export default DancersJoinForm;
