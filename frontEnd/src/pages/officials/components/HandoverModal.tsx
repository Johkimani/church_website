import { useState } from 'react';
import { ArrowRightLeft, Loader2, AlertTriangle, CheckCircle2, ChevronDown, Crown, Music, Heart, ArrowLeft } from 'lucide-react';
import { apiClient } from '../../../api/axiosInstance';
import { showSuccessToast, showErrorToast } from '../../../utils/customToast';
import type { ElectionTerm } from '../../../hooks/useTerms';
import { useAuth } from '../../../context/AuthContext';

interface HandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  currentTerm: ElectionTerm | null;
  csaCount: number;
  jumuiyaCount: number;
  groupCount: number;
}

export function HandoverModal({ isOpen, onClose, onComplete, currentTerm, csaCount, jumuiyaCount, groupCount }: HandoverModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'preview' | 'form' | 'done'>('preview');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  const total = csaCount + jumuiyaCount + groupCount;

  const resetAndClose = () => {
    setStep('preview');
    setName(''); setYear(''); setStartDate(''); setEndDate(''); setDescription('');
    setResult(null);
    onClose();
  };

  const handleHandover = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/officials/handover', {
        name, year, start_date: startDate, end_date: endDate || undefined, description: description || undefined
      }, { headers: { Authorization: `Bearer ${user?.accessToken}` } });
      setResult(res.data?.data);
      setStep('done');
      showSuccessToast('Handover Complete', res.data?.message || 'All officials archived under the new term.');
      onComplete();
    } catch (err: any) {
      showErrorToast('Handover Failed', err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const isValid = name.trim() && year.trim() && startDate;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Term Handover</h3>
                <p className="text-white/70 text-xs mt-0.5">Archive all officials & start a new term</p>
              </div>
            </div>
            <button onClick={resetAndClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-xl font-bold">&#215;</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {step === 'preview' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-800">This will archive ALL current officials</p>
                  <p className="text-xs text-amber-600 mt-1">CSA, Jumuiya and Group officials will all be archived under a new election term.</p>
                </div>
              </div>

              {currentTerm && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Term: {currentTerm.name || currentTerm.year}</p>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-700">Officials to be archived:</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                    <Crown className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-black text-blue-700">{csaCount}</p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase">CSA</p>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-3 text-center border border-violet-100">
                    <Heart className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                    <p className="text-2xl font-black text-violet-700">{jumuiyaCount}</p>
                    <p className="text-[10px] font-bold text-violet-500 uppercase">Jumuiya</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
                    <Music className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-2xl font-black text-emerald-700">{groupCount}</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase">Groups</p>
                  </div>
                </div>
                {total === 0 && <p className="text-xs text-gray-400 italic text-center">No active officials to archive</p>}
              </div>

              <button onClick={() => setStep('form')} disabled={total === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                Continue to New Term Setup
                <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
              </button>
            </div>
          )}

          {step === 'form' && (
            <div className="space-y-5">
              <button onClick={() => setStep('preview')} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-700">New Term Details</p>
                <p className="text-[11px] text-indigo-500 mt-0.5">This will become the active election term after handover.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Term Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. 2025/2026 Executive"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Year *</label>
                    <input value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2025-2026"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Date *</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                    <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700 font-medium">
                  This will archive <strong>{csaCount} CSA</strong>, <strong>{jumuiyaCount} Jumuiya</strong> and <strong>{groupCount} Group</strong> officials and promote the new term as current.
                </p>
              </div>

              <button onClick={handleHandover} disabled={!isValid || loading}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing Handover...</>
                ) : (
                  <><ArrowRightLeft className="w-4 h-4" /> Execute Handover</>
                )}
              </button>
            </div>
          )}

          {step === 'done' && result && (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Handover Complete!</h4>
                <p className="text-sm text-gray-500 mt-1">All officials have been archived under the new term.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xl font-black text-blue-700">{result.archived?.csa || 0}</p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase">CSA Archived</p>
                </div>
                <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                  <p className="text-xl font-black text-violet-700">{result.archived?.jumuiya || 0}</p>
                  <p className="text-[10px] font-bold text-violet-500 uppercase">Jumuiya Archived</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-xl font-black text-emerald-700">{result.archived?.groups || 0}</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">Groups Archived</p>
                </div>
              </div>

              {result.election_term && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Current Term</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{result.election_term.name} ({result.election_term.year})</p>
                </div>
              )}

              <button onClick={resetAndClose}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
