import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../api/axiosInstance';
import { useAuth } from '../../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserPlus, FaCheck, FaSpinner, FaExclamationCircle, FaUser, FaPhone, FaEnvelope, FaGraduationCap, FaMusic, FaHeart, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import type { CommunityModule } from '../../context/CommunityDataContext';

interface Props {
  moduleId: string;
  moduleName: string;
  color: string;
  module: CommunityModule;
}

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

const CommunityRequestTab: React.FC<Props> = ({ moduleId, moduleName, color, module }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<'success' | 'duplicate' | 'error' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [prefilled, setPrefilled] = useState(false);

  const isChoir = moduleId === 'choir';

  const steps = isChoir
    ? [
        { title: 'Personal Details', icon: <FaUser size={14} />, fields: ['fullName', 'phone', 'gender'] },
        { title: 'Academic Info', icon: <FaGraduationCap size={14} />, fields: ['course', 'yearOfStudy', 'email'] },
        { title: 'Voice & Music', icon: <FaMusic size={14} />, fields: ['voiceType', 'musicLevel'] },
      ]
    : [
        { title: 'Personal Details', icon: <FaUser size={14} />, fields: ['fullName', 'phone', 'gender'] },
        { title: 'Academic Info', icon: <FaGraduationCap size={14} />, fields: ['course', 'yearOfStudy', 'email'] },
      ];

  // Fetch user profile to pre-fill
  const { data: profile } = useQuery({
    queryKey: ['profile-me'],
    queryFn: async () => {
      const res = await apiClient.get('/profile/me');
      return res.data;
    },
    enabled: !!user,
    staleTime: 300000,
  });

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

  const submitMutation = useMutation({
    mutationFn: async (data: FormState) => {
      return await apiClient.post(`/community-enrollment/${moduleId}`, {
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        gender: data.gender,
        course: data.course,
        yearOfStudy: data.yearOfStudy,
        voiceType: data.voiceType || undefined,
        musicLevel: data.musicLevel || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', moduleId] });
      setResult('success');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || 'Failed to submit';
      if (err.response?.status === 409) {
        setResult('duplicate');
      } else {
        setResult('error');
      }
      setErrorMsg(msg);
    },
  });

  const canProceed = () => {
    const currentFields = steps[step].fields;
    if (currentFields.includes('fullName') && !form.fullName.trim()) return false;
    if (currentFields.includes('phone') && form.phone.length < 10) return false;
    if (currentFields.includes('voiceType') && !form.voiceType) return false;
    return true;
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!form.fullName.trim() || !form.phone.trim()) {
      setResult('error');
      setErrorMsg('Name and phone are required');
      return;
    }
    submitMutation.mutate(form);
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (result) setResult(null);
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setStep(0);
    setResult(null);
    setErrorMsg('');
    setPrefilled(false);
  };

  // Success state
  if (result === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: `${color}30` }}
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: color }}>
            <FaCheck className="text-white" size={24} />
          </div>
        </motion.div>
        <h3 className="text-white font-bold text-xl mb-2">Request Submitted!</h3>
        <p className="text-white/60 text-sm text-center max-w-xs mb-6">
          Your request to join <strong className="text-white/80">{moduleName}</strong> has been received. The coordinator will review and follow up with you.
        </p>
        <button
          onClick={resetForm}
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
          style={{ background: `${color}30`, color: 'white', border: `1px solid ${color}50` }}
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  // Duplicate / Error state
  if (result === 'duplicate' || result === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: result === 'duplicate' ? '#f59e0b30' : '#ef444430' }}
        >
          <FaExclamationCircle size={32} className={result === 'duplicate' ? 'text-amber-400' : 'text-red-400'} />
        </motion.div>
        <h3 className="text-white font-bold text-xl mb-2">
          {result === 'duplicate' ? 'Already Enrolled' : 'Submission Failed'}
        </h3>
        <p className="text-white/60 text-sm text-center max-w-xs mb-6">
          {result === 'duplicate'
            ? 'You are already enrolled in this community. Contact the coordinator for more info.'
            : errorMsg || 'Something went wrong. Please try again.'}
        </p>
        <button
          onClick={() => setResult(null)}
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
          style={{ background: `${color}30`, color: 'white', border: `1px solid ${color}50` }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="py-5 px-4 sm:px-6 bg-white rounded-3xl border border-slate-200/90 shadow-xl text-slate-800 my-2">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <button
              onClick={() => i < step && setStep(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all cursor-pointer shadow-xs"
              style={{
                background: i === step ? color : i < step ? '#dbeafe' : '#f1f5f9',
                color: i === step ? 'white' : i < step ? '#1e40af' : '#64748b',
                border: `1px solid ${i === step ? color : i < step ? '#bfdbfe' : '#cbd5e1'}`,
              }}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.title}</span>
            </button>
            {i < steps.length - 1 && (
              <div className="w-6 h-[2px] rounded-full" style={{ background: i < step ? color : '#e2e8f0' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h4 className="text-slate-900 font-black text-lg mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            {steps[step].icon}
            {steps[step].title}
          </h4>

          <div className="space-y-4">
            {/* Full Name */}
            {steps[step].fields.includes('fullName') && (
              <div>
                <label className="text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5 block">Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => handleChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-xs"
                />
              </div>
            )}

            {/* Phone */}
            {steps[step].fields.includes('phone') && (
              <div>
                <label className="text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5 block">Phone Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="0712 345 678"
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-xs"
                />
                {form.phone.length >= 10 && (
                  <p className="text-slate-500 text-[11px] font-bold mt-1">WhatsApp preferred</p>
                )}
              </div>
            )}

            {/* Gender */}
            {steps[step].fields.includes('gender') && (
              <div>
                <label className="text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5 block">Gender</label>
                <div className="flex gap-2.5">
                  {GENDER_OPTIONS.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleChange('gender', g)}
                      className={`flex-1 py-3 rounded-xl text-sm font-black transition-all cursor-pointer shadow-xs ${
                        form.gender === g ? 'text-white shadow-md' : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                      }`}
                      style={form.gender === g ? { background: color } : {}}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Email */}
            {steps[step].fields.includes('email') && (
              <div>
                <label className="text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5 block">Email (Optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-xs"
                />
              </div>
            )}

            {/* Course */}
            {steps[step].fields.includes('course') && (
              <div>
                <label className="text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5 block">Course / Programme</label>
                <select
                  value={form.course}
                  onChange={e => handleChange('course', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer shadow-xs"
                >
                  <option value="" className="bg-white text-slate-700">Select course</option>
                  {COURSE_OPTIONS.map(c => (
                    <option key={c} value={c} className="bg-white text-slate-900">{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Year of Study */}
            {steps[step].fields.includes('yearOfStudy') && (
              <div>
                <label className="text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5 block">Year of Study</label>
                <div className="grid grid-cols-3 gap-2">
                  {YEAR_OPTIONS.map(y => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleChange('yearOfStudy', y)}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                        form.yearOfStudy === y ? 'text-white shadow-md' : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                      }`}
                      style={form.yearOfStudy === y ? { background: color } : {}}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Type (Choir only) */}
            {steps[step].fields.includes('voiceType') && (
              <div>
                <label className="text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5 block">Voice Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {VOICE_TYPES.map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleChange('voiceType', v)}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                        form.voiceType === v ? 'text-white shadow-md' : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                      }`}
                      style={form.voiceType === v ? { background: color } : {}}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Music Level (Choir only) */}
            {steps[step].fields.includes('musicLevel') && (
              <div>
                <label className="text-slate-700 text-xs font-black uppercase tracking-wider mb-1.5 block">Skill Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {MUSIC_LEVELS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleChange('musicLevel', m)}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
                        form.musicLevel === m ? 'text-white shadow-md' : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                      }`}
                      style={form.musicLevel === m ? { background: color } : {}}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3 mt-8 pt-4 border-t border-slate-100">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition-all cursor-pointer shadow-xs"
          >
            <FaArrowLeft size={12} /> Back
          </button>
        )}

        {step < steps.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white transition-all cursor-pointer shadow-lg hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: color }}
          >
            Next <FaArrowRight size={12} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || submitMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-black text-white transition-all cursor-pointer shadow-lg hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: color }}
          >
            {submitMutation.isPending ? (
              <>
                <FaSpinner className="animate-spin" size={14} /> Submitting...
              </>
            ) : (
              <>
                <FaUserPlus size={14} /> Request to Join
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer note */}
      <p className="text-slate-500 text-xs font-bold text-center mt-5">
        By submitting, you agree to be contacted by the {moduleName} coordinator.
      </p>
    </div>
  );

};

export default CommunityRequestTab;
