import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaGraduationCap, FaMusic, FaCheck, FaArrowLeft, FaSpinner, FaExclamationCircle, FaHeart } from 'react-icons/fa';
import { useCommunityData } from './context/CommunityDataContext';
import { useAuth } from '../../context/AuthContext';
import type { CommunityModule } from './context/CommunityDataContext';

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  course: string;
  yearOfStudy: string;
  voiceType: string;
  musicLevel: string;
}

const INITIAL_FORM: FormState = {
  fullName: '', phone: '', email: '', gender: '', course: '', yearOfStudy: '', voiceType: '', musicLevel: '',
};

const VOICE_TYPES = ['Soprano', 'Alto', 'Tenor', 'Bass', 'None'];
const MUSIC_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'None'];
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate'];
const COURSE_OPTIONS = ['Computer Science', 'Engineering', 'Business', 'Education', 'Medicine', 'Arts', 'Science', 'Law', 'Nursing', 'Agriculture', 'Other'];
const GENDER_OPTIONS = ['Male', 'Female'];

const MINISTRY_COLORS: Record<string, string> = {
  choir: '#1e3a5f',
  dancers: '#db2777',
  charismatic: '#7c3aed',
  'st-francis': '#047857',
  youth: '#8e44ad',
  mentorship: '#6d28d9',
};

const CommunityJoinPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { getModuleById } = useCommunityData();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'duplicate' | 'error' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [checking, setChecking] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  const moduleIdClean = moduleId ? moduleId.toLowerCase().replace(/[^a-z0-9-]/g, '-') : '';

  // Fetch user profile to pre-fill form
  const { data: profile } = useQuery({
    queryKey: ['profile-me'],
    queryFn: async () => {
      const res = await apiClient.get('/profile/me');
      return res.data;
    },
    enabled: !!user,
    staleTime: 300000,
  });

  // Pre-fill form with profile data
  useEffect(() => {
    if (profile && !prefilled) {
      const name = [profile.firstName || profile.first_name, profile.lastName || profile.last_name].filter(Boolean).join(' ');
      setForm(prev => ({
        ...prev,
        fullName: name || prev.fullName,
        phone: profile.phone || prev.phone,
        email: profile.email || prev.email,
        gender: profile.gender || prev.gender,
        course: profile.course || prev.course,
        yearOfStudy: profile.yearOfStudy || profile.year_of_study || prev.yearOfStudy,
      }));
      setPrefilled(true);
    }
  }, [profile, prefilled]);

  const contextFallback = moduleIdClean ? getModuleById(moduleIdClean) : undefined;

  const { data: serverModuleData } = useQuery({
    queryKey: ['community', moduleIdClean],
    queryFn: async () => {
      const res = await apiClient.get(`/community-view/${moduleIdClean}`);
      if (res.data?.isMissing || res.data?.isServerError) throw new Error('Not available');
      return res.data;
    },
    retry: 1,
    staleTime: 300000,
  });

  const moduleData: CommunityModule | undefined = serverModuleData || contextFallback;
  const color = MINISTRY_COLORS[moduleIdClean || ''] || moduleData?.color || '#1e3a5f';
  const isChoir = moduleIdClean === 'choir';

  const checkDuplicatePhone = useCallback(async (phone: string) => {
    if (!phone || phone.length < 10) return;
    setChecking(true);
    try {
      const res = await apiClient.get(`/community-enrollment/${moduleIdClean}/check-duplicate`, { params: { phone } });
      if (res.data.exists) {
        setResult('duplicate');
        setErrorMsg(`This number is already enrolled (${res.data.enrollment?.status || 'enrolled'})`);
      }
    } catch { /* silent */ }
    setChecking(false);
  }, [moduleIdClean]);

  useEffect(() => {
    if (form.phone.length >= 10) {
      const timer = setTimeout(() => checkDuplicatePhone(form.phone), 500);
      return () => clearTimeout(timer);
    }
  }, [form.phone, checkDuplicatePhone]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (result) setResult(null);
  };

  const steps = isChoir
    ? [
        { title: 'Personal Details', fields: ['fullName', 'phone', 'gender'] },
        { title: 'Academic Info', fields: ['course', 'yearOfStudy', 'email'] },
        { title: 'Voice & Music', fields: ['voiceType', 'musicLevel'] },
      ]
    : [
        { title: 'Personal Details', fields: ['fullName', 'phone', 'gender'] },
        { title: 'Academic Info', fields: ['course', 'yearOfStudy', 'email'] },
      ];

  const canProceed = () => {
    const currentFields = steps[step].fields;
    if (currentFields.includes('fullName') && !form.fullName.trim()) return false;
    if (currentFields.includes('phone') && form.phone.length < 10) return false;
    if (currentFields.includes('voiceType') && !form.voiceType) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.phone.trim()) {
      setResult('error');
      setErrorMsg('Name and phone are required');
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      await apiClient.post(`/community-enrollment/${moduleIdClean}`, {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        gender: form.gender,
        course: form.course,
        yearOfStudy: form.yearOfStudy,
        voiceType: form.voiceType || undefined,
        musicLevel: form.musicLevel || undefined,
      });
      setResult('success');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to submit';
      if (err.response?.status === 409) {
        setResult('duplicate');
      } else {
        setResult('error');
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!moduleData && !moduleIdClean) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <p className="text-slate-500">Community not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-28">
      {/* Hero Header */}
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 50%, ${color}99 100%)` }}
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-black/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-lg mx-auto px-6 pt-12 pb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 text-xs font-bold mb-6 hover:text-white transition-colors cursor-pointer"
          >
            <FaArrowLeft size={12} /> Back
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-2xl mb-4 ring-2 ring-white/20">
            {moduleData?.title?.charAt(0) || 'C'}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
            Join {moduleData?.title || 'Community'}
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            {moduleData?.description || 'Fill in your details to become a member.'}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-6 relative z-20">
        {/* Success State */}
        <AnimatePresence mode="wait">
          {result === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl p-8 bg-white shadow-xl text-center"
            >
              <div
                className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: `${color}15` }}
              >
                <FaCheck style={{ color }} size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Application Submitted!</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Your enrollment request has been received. You will be notified once your application is reviewed by the {moduleData?.title} admin.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/community/${moduleIdClean}`)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02] shadow-lg cursor-pointer"
                  style={{ background: color }}
                >
                  View Community
                </button>
                <button
                  onClick={() => navigate('/community')}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  All Ministries
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-white shadow-xl overflow-hidden"
            >
              {/* Progress */}
              <div className="px-6 pt-6">
                <div className="flex items-center justify-between mb-2">
                  {steps.map((s, i) => (
                    <React.Fragment key={i}>
                      <div className="flex flex-col items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
                          style={{
                            background: i <= step ? color : '#e5e7eb',
                            color: i <= step ? 'white' : '#9ca3af',
                          }}
                        >
                          {i < step ? <FaCheck size={12} /> : i + 1}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 mt-1 hidden sm:block">{s.title}</span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className="flex-1 h-0.5 mx-2 rounded-full mb-5" style={{ background: i < step ? color : '#e5e7eb' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6">
                <h3 className="text-lg font-black text-slate-800 mb-5">{steps[step].title}</h3>

                {/* Error/Duplicate Banner */}
                {(result === 'error' || result === 'duplicate') && (
                  <div className="flex items-start gap-3 p-4 rounded-2xl mb-5" style={{ background: result === 'duplicate' ? '#fef3c7' : '#fef2f2' }}>
                    <FaExclamationCircle className="shrink-0 mt-0.5" style={{ color: result === 'duplicate' ? '#f59e0b' : '#ef4444' }} size={16} />
                    <span className="text-sm font-semibold" style={{ color: result === 'duplicate' ? '#92400e' : '#991b1b' }}>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Step 0: Personal Details */}
                  {step === 0 && (
                    <>
                      <FieldInput
                        icon={<FaUser size={14} />}
                        label="Full Name"
                        placeholder="e.g. John Mwangi"
                        value={form.fullName}
                        onChange={(v) => handleChange('fullName', v)}
                        color={color}
                        required
                      />
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
                        <div className="relative">
                          <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                            placeholder="0712 345 678"
                          />
                          {checking && <FaSpinner className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" size={14} />}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Gender *</label>
                        <div className="flex gap-2">
                          {GENDER_OPTIONS.map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => handleChange('gender', g)}
                              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                                form.gender === g ? 'text-white shadow-md' : 'text-slate-500 bg-slate-50 border border-slate-200 hover:border-slate-300'
                              }`}
                              style={form.gender === g ? { background: color } : {}}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 1: Academic Info */}
                  {step === 1 && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Course *</label>
                        <div className="relative">
                          <FaGraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <select
                            value={form.course}
                            onChange={(e) => handleChange('course', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none appearance-none bg-white"
                          >
                            <option value="">Select course</option>
                            {COURSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Year of Study *</label>
                        <div className="grid grid-cols-3 gap-2">
                          {YEAR_OPTIONS.map((y) => (
                            <button
                              key={y}
                              type="button"
                              onClick={() => handleChange('yearOfStudy', y)}
                              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                form.yearOfStudy === y ? 'text-white shadow-md' : 'text-slate-500 bg-slate-50 border border-slate-200 hover:border-slate-300'
                              }`}
                              style={form.yearOfStudy === y ? { background: color } : {}}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>
                      <FieldInput
                        icon={<FaEnvelope size={14} />}
                        label="Email (optional)"
                        placeholder="you@email.com"
                        value={form.email}
                        onChange={(v) => handleChange('email', v)}
                        color={color}
                        type="email"
                      />
                    </>
                  )}

                  {/* Step 2: Voice & Music (Choir only) */}
                  {step === 2 && isChoir && (
                    <>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Voice Type *</label>
                        <div className="grid grid-cols-3 gap-2">
                          {VOICE_TYPES.map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => handleChange('voiceType', v)}
                              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                form.voiceType === v ? 'text-white shadow-md' : 'text-slate-500 bg-slate-50 border border-slate-200 hover:border-slate-300'
                              }`}
                              style={form.voiceType === v ? { background: color } : {}}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Music Level</label>
                        <div className="grid grid-cols-2 gap-2">
                          {MUSIC_LEVELS.map((l) => (
                            <button
                              key={l}
                              type="button"
                              onClick={() => handleChange('musicLevel', l)}
                              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                form.musicLevel === l ? 'text-white shadow-md' : 'text-slate-500 bg-slate-50 border border-slate-200 hover:border-slate-300'
                              }`}
                              style={form.musicLevel === l ? { background: color } : {}}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 mt-8">
                  {step > 0 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-5 py-3 rounded-2xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  {step < steps.length - 1 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={!canProceed()}
                      className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                      style={{ background: color }}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !canProceed()}
                      className="flex-1 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg flex items-center justify-center gap-2"
                      style={{ background: color }}
                    >
                      {submitting ? (
                        <><FaSpinner className="animate-spin" size={14} /> Submitting…</>
                      ) : (
                        <><FaHeart size={14} /> Submit Application</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FieldInput: React.FC<{
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
  type?: string;
  required?: boolean;
}> = ({ icon, label, placeholder, value, onChange, type = 'text', required }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{label}{required && ' *'}</label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
        placeholder={placeholder}
      />
    </div>
  </div>
);

export default CommunityJoinPage;
