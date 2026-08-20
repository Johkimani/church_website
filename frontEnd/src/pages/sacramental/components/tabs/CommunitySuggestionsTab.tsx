import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { apiClient } from '../../../../api/axiosInstance';
import type { CommunityModule } from '../../context/CommunityDataContext';
import { 
  FaLightbulb, 
  FaPaperPlane, 
  FaUserSecret, 
  FaUser, 
  FaEnvelope, 
  FaCheckCircle, 
  FaCommentDots, 
  FaHeart,
  FaShieldAlt,
  FaTag
} from 'react-icons/fa';
import '../../../Jumuiya/components/TabsSystem.css';

interface Props {
  moduleId: string;
  moduleName: string;
  color: string;
  module: CommunityModule;
}

const CATEGORIES = [
  'General Feedback',
  'Practices & Activities',
  'Leadership & Coordination',
  'Events & Outreaches',
  'Community Welfare & Care',
  'Other Suggestions'
];

const CommunitySuggestionsTab: React.FC<Props> = ({ moduleId, moduleName, color }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: 'General Feedback',
    suggestion: '',
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.suggestion.trim()) return;

    setStatus('submitting');
    setErrorMessage('');

    const submissionData: Record<string, any> = {
      suggestion: formData.suggestion.trim(),
      category: `${moduleName} - ${formData.category}`,
      scope: 'community',
      jumuiya_id: moduleId,
    };

    if (!isAnonymous) {
      if (formData.name.trim()) submissionData.name = formData.name.trim();
      if (formData.email.trim()) submissionData.email = formData.email.trim();
    }

    try {
      await apiClient.post('/suggestions', submissionData).catch(async () => {
        // Fallback to table API if direct route requires special role
        await apiClient.post('/table/suggestions', submissionData);
      });

      setStatus('success');
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        category: 'General Feedback',
        suggestion: '',
      });
      setIsAnonymous(false);
    } catch (err: any) {
      console.error('Error submitting community suggestion:', err);
      setStatus('error');
      setErrorMessage(err.response?.data?.error || 'Failed to submit suggestion. Please try again.');
    }
  };

  return (
    <div className="tab-system-content" style={{ '--jumuiya-color': color } as React.CSSProperties}>
      <div className="tab-header-wrap">
        <div className="header-text">
          <h1 className="page-title">Community Suggestion Box</h1>
          <p className="page-description">
            Help build and strengthen the {moduleName} community. Your ideas, questions, and feedback are valued.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Left Side: Suggestion Form */}
        <div className="lg:col-span-7">
          <div
            className="rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-white shadow-xl"
            style={{ border: `1px solid ${color}20` }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ background: color }}
              >
                <FaLightbulb size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Share Your Thoughts</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Submit confidential or named recommendations directly to group leadership.
                </p>
              </div>
            </div>

            {status === 'success' ? (
              <div className="text-center py-10 px-4">
                <div
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-emerald-500 mb-4 bg-emerald-50"
                  style={{ border: '2px solid #10b98130' }}
                >
                  <FaCheckCircle size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">Thank You!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                  Your suggestion has been submitted successfully to the {moduleName} leadership team.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="px-6 py-2.5 rounded-xl text-white text-xs font-bold transition hover:scale-105"
                  style={{ background: color }}
                >
                  Send Another Suggestion
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {status === 'error' && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    <span className={`p-2 rounded-xl text-sm ${isAnonymous ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {isAnonymous ? <FaUserSecret /> : <FaUser />}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {isAnonymous ? 'Anonymous Submission' : 'Submit as Myself'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isAnonymous ? 'Your identity will be kept completely hidden' : 'Your name & email will be visible to officials'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl transition"
                    style={{
                      background: isAnonymous ? color : '#f1f5f9',
                      color: isAnonymous ? 'white' : '#475569',
                    }}
                  >
                    {isAnonymous ? 'Make Named' : 'Make Anonymous'}
                  </button>
                </div>

                {/* Name & Email inputs if not anonymous */}
                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                      <div className="relative">
                        <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. john@example.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Category</label>
                  <div className="relative">
                    <FaTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Suggestion Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Suggestion or Idea</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.suggestion}
                    onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                    placeholder={`What would you like to share with the ${moduleName} leadership? Please be constructive and detailed...`}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 transition hover:scale-[1.01] shadow-lg cursor-pointer disabled:opacity-50"
                  style={{ background: color }}
                >
                  {status === 'submitting' ? (
                    'Submitting...'
                  ) : (
                    <>
                      <FaPaperPlane size={12} /> Submit to {moduleName}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Guidelines & Transparency Card */}
        <div className="lg:col-span-5 space-y-5">
          <div
            className="rounded-3xl p-6 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${color}12 0%, ${color}05 100%)`,
              border: `1px solid ${color}20`,
            }}
          >
            <div className="flex items-center gap-2.5 mb-3" style={{ color }}>
              <FaShieldAlt size={18} />
              <h3 className="text-sm font-extrabold">Privacy & Confidentiality</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              When submitting anonymously, no personal details, email addresses, or names are transmitted or stored with the suggestion.
            </p>
            <div className="space-y-2 text-[11px] text-slate-500">
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Reviewed regularly by the executive leaders.</span>
              </div>
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Helps improve liturgical and community life.</span>
              </div>
              <div className="flex items-start gap-2">
                <FaCheckCircle className="text-emerald-500 shrink-0 mt-0.5" />
                <span>Constructive ideas can shape upcoming activities.</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-6 bg-white border border-slate-200/80 shadow-md">
            <div className="flex items-center gap-2 mb-3 text-slate-800">
              <FaCommentDots className="text-slate-500" />
              <h3 className="text-sm font-bold">Frequently Asked Topics</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { title: 'Rehearsal Venues & Times', desc: 'Suggestions on schedule changes or acoustics.' },
                { title: 'New Member Welcoming', desc: 'Ideas on onboarding and voice/dance training.' },
                { title: 'Community Outreach', desc: 'Proposing charity visits and parish collaborations.' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySuggestionsTab;
