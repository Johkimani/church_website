import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaPhone, FaEnvelope, FaGraduationCap, FaMusic, FaCheck, FaArrowLeft, FaSpinner, FaExclamationCircle, FaHeart, FaClock, FaTimes, FaRedo, FaUsers } from 'react-icons/fa';
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
  wantsMusicClass: boolean;
}

const INITIAL_FORM: FormState = {
  fullName: '', phone: '', email: '', gender: '', course: '', yearOfStudy: '', voiceType: '', wantsMusicClass: false,
};

const VOICE_TYPES = ['Soprano', 'Alto', 'Tenor', 'Bass', 'None'];
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate'];
const COURSE_OPTIONS = ['Computer Science', 'Engineering', 'Business', 'Education', 'Medicine', 'Arts', 'Science', 'Law', 'Nursing', 'Agriculture', 'Other'];
const GENDER_OPTIONS = ['Male', 'Female'];

const MINISTRY_COLORS: Record<string, string> = {
  choir: '#1e40af',
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

  const isLoggedIn = !!user && !!profile;

  // Check if logged-in user already has an enrollment for this community
  const { data: existingEnrollment, isLoading: checkingExisting } = useQuery({
    queryKey: ['existing-enrollment', moduleIdClean, profile?.phone],
    queryFn: async () => {
      if (!profile?.phone) return null;
      const res = await apiClient.get(`/community-enrollment/${moduleIdClean}/check-duplicate`, {
        params: { phone: profile.phone },
      });
      return res.data?.enrollment || null;
    },
    enabled: isLoggedIn && !!profile?.phone && !!moduleIdClean,
    staleTime: 30000,
  });

  // If user already enrolled, show status card instead of form
  const existingStatus = existingEnrollment?.status as string | undefined;

  // Pre-fill form with profile data
  useEffect(() => {
    if (profile && !prefilled) {
      // /profile/me returns combined `name`; fall back to split fields for safety
      const name = profile.name
        || [profile.firstName || profile.first_name, profile.lastName || profile.last_name].filter(Boolean).join(' ')
        || user?.name
        || '';
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
    ? (isLoggedIn
        ? [{ title: 'Voice & Music', fields: ['voiceType'] }]
        : [
            { title: 'Personal Details', fields: ['fullName', 'phone', 'gender'] },
            { title: 'Academic Info', fields: ['course', 'yearOfStudy', 'email'] },
            { title: 'Voice & Music', fields: ['voiceType'] },
          ])
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
        wantsMusicClass: form.wantsMusicClass,
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
        <AnimatePresence mode="wait">
          {/* Existing enrollment status card — shown instead of form */}
          {existingEnrollment && !result ? (
            <motion.div
              key="status-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl bg-white shadow-xl overflow-hidden"
            >
              {/* Status-specific hero area */}
              <div
                className="px-8 pt-10 pb-8 text-center"
                style={{
                  background: existingStatus === 'Approved'
                    ? 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)'
                    : existingStatus === 'Rejected'
                      ? 'linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f87171 100%)'
                      : `linear-gradient(135deg, ${color} 0%, ${color}cc 50%, ${color}99 100%)`,
                }}
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
                  {existingStatus === 'Approved' ? (
                    <FaCheck size={32} className="text-white" />
                  ) : existingStatus === 'Rejected' ? (
                    <FaTimes size={32} className="text-white" />
                  ) : (
                    <FaClock size={32} className="text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-black text-white mb-1">
                  {existingStatus === 'Approved'
                    ? 'Welcome Aboard!'
                    : existingStatus === 'Rejected'
                      ? 'Application Not Approved'
                      : 'Application Under Review'}
                </h2>
                <p className="text-white/80 text-sm">
                  {moduleData?.title || 'Community'}
                </p>
              </div>

              {/* Status-specific body */}
              <div className="px-8 py-8">
                {existingStatus === 'Pending' && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mb-5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      Review in Progress
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-2">
                      Hi <span className="font-black">{existingEnrollment.full_name || 'there'}</span>, your application to join the{' '}
                      <span className="font-black">{moduleData?.title || 'community'}</span> has been received and is being reviewed by the admin team.
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      You'll be able to access full community features once your application is approved. Check back anytime — your status will update here.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6">
                      <FaClock size={11} />
                      <span>Applied {existingEnrollment.joined_at
                        ? new Date(existingEnrollment.joined_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'recently'}</span>
                    </div>
                  </div>
                )}

                {existingStatus === 'Approved' && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-5">
                      <FaCheck size={10} />
                      Active Member
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-2">
                      Congratulations <span className="font-black">{existingEnrollment.full_name || ''}</span>! You are now an active member of the{' '}
                      <span className="font-black">{moduleData?.title || 'community'}</span>.
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      Explore schedules, connect with fellow members, and stay updated with community activities.
                    </p>
                    <button
                      onClick={() => navigate(`/community/${moduleIdClean}`)}
                      className="w-full py-3.5 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] shadow-lg cursor-pointer"
                      style={{ background: '#059669' }}
                    >
                      <FaUsers className="inline mr-2" size={14} />
                      Go to Community
                    </button>
                  </div>
                )}

                {existingStatus === 'Rejected' && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-700 text-xs font-bold mb-5">
                      <FaTimes size={10} />
                      Not Approved
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-2">
                      Unfortunately, your application to join the{' '}
                      <span className="font-black">{moduleData?.title || 'community'}</span> was not approved at this time.
                    </p>
                    {existingEnrollment.rejection_reason && (
                      <p className="text-slate-500 text-xs bg-slate-50 rounded-xl p-3 mb-4">
                        <span className="font-bold text-slate-600">Reason:</span> {existingEnrollment.rejection_reason}
                      </p>
                    )}
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      You may submit a new application if you'd like to try again.
                    </p>
                    <button
                      onClick={() => setResult(null)}
                      className="w-full py-3.5 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] shadow-lg cursor-pointer flex items-center justify-center gap-2"
                      style={{ background: color }}
                    >
                      <FaRedo size={13} />
                      Apply Again
                    </button>
                  </div>
                )}
              </div>

              {/* Footer nav */}
              <div className="px-8 pb-8 flex gap-3">
                <button
                  onClick={() => navigate(`/community/${moduleIdClean}`)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
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

          ) : result === 'success' ? (
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
              <h2 className="text-xl font-black text-slate-800 mb-2">
                {isLoggedIn && (profile?.firstName || profile?.first_name)
                  ? `Welcome, ${profile.firstName || profile.first_name}!`
                  : 'Application Submitted!'}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {isLoggedIn && (profile?.firstName || profile?.first_name)
                  ? `Your place in the ${moduleData?.title || 'community'} is reserved${form.wantsMusicClass ? ', and we\u2019ve noted your interest in music classes' : ''}. Our team will reach out to you soon.`
                  : 'Your enrollment request has been received. You will be notified once your application is reviewed by the ' + (moduleData?.title || 'community') + ' admin.'}
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
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Phone Number *</label>
                        <div className="relative">
                          <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-xs"
                            placeholder="0712 345 678"
                          />
                          {checking && <FaSpinner className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" size={14} />}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Gender *</label>
                        <div className="flex gap-2">
                          {GENDER_OPTIONS.map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => handleChange('gender', g)}
                              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all cursor-pointer shadow-xs ${
                                form.gender === g ? 'text-white shadow-md' : 'text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200'
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
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Course *</label>
                        <div className="relative">
                          <FaGraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <select
                            value={form.course}
                            onChange={(e) => handleChange('course', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none appearance-none shadow-xs"
                          >
                            <option value="">Select course</option>
                            {COURSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Year of Study *</label>
                        <div className="grid grid-cols-3 gap-2">
                          {YEAR_OPTIONS.map((y) => (
                            <button
                              key={y}
                              type="button"
                              onClick={() => handleChange('yearOfStudy', y)}
                              className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                                form.yearOfStudy === y ? 'text-white shadow-md' : 'text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200'
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

                  {/* Voice & Music (Choir only — final or only step) */}
                  {isChoir && steps[step].fields.includes('voiceType') && (
                    <>
                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">Choir Voice Section *</label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { key: 'Soprano', label: 'Soprano', sub: 'High Female Voice' },
                            { key: 'Alto', label: 'Alto', sub: 'Low Female Voice' },
                            { key: 'Tenor', label: 'Tenor', sub: 'High Male Voice' },
                            { key: 'Bass', label: 'Bass', sub: 'Deep Male Voice' },
                            { key: 'Not sure yet', label: 'Not sure yet', sub: "We'll help you find it" },
                          ].map((v) => (
                            <button
                              key={v.key}
                              type="button"
                              onClick={() => handleChange('voiceType', v.key)}
                              className={`p-3 rounded-2xl text-left transition-all cursor-pointer border shadow-xs ${
                                form.voiceType === v.key ? 'text-white shadow-md border-transparent' : 'text-slate-800 bg-slate-50 border-slate-300 hover:bg-slate-100'
                              }`}
                              style={form.voiceType === v.key ? { background: color } : {}}
                            >
                              <div className="font-black text-sm">{v.label}</div>
                              <div className={`text-[10px] font-semibold mt-0.5 ${form.voiceType === v.key ? 'text-white/80' : 'text-slate-500'}`}>{v.sub}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Optional music classes */}
                      <label
                        className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          form.wantsMusicClass ? 'shadow-md border-transparent text-white' : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                        style={form.wantsMusicClass ? { background: color } : {}}
                      >
                        <input
                          type="checkbox"
                          checked={form.wantsMusicClass}
                          onChange={(e) => handleChange('wantsMusicClass', e.target.checked as any)}
                          className="mt-0.5 w-4 h-4 accent-white cursor-pointer"
                        />
                        <span>
                          <span className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wide">
                            <FaMusic size={11} /> Join Music Classes
                          </span>
                          <span className={`block text-[11px] font-semibold mt-0.5 leading-snug ${form.wantsMusicClass ? 'text-white/80' : 'text-slate-500'}`}>
                            Optional — tick if you'd like to learn solfa, sight-reading and vocal technique with our trainers.
                          </span>
                        </span>
                      </label>
                    </>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 mt-8">
                  {step > 0 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-5 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 border border-slate-300 hover:bg-slate-200 transition-all cursor-pointer shadow-xs"
                    >
                      Back
                    </button>
                  )}
                  {step < steps.length - 1 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={!canProceed()}
                      className="flex-1 py-3.5 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                      style={{ background: color }}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !canProceed()}
                      className="flex-1 py-3.5 rounded-2xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg flex items-center justify-center gap-2"
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
    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">{label}{required && ' *'}</label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-xs"
        placeholder={placeholder}
      />
    </div>
  </div>
);

export default CommunityJoinPage;
