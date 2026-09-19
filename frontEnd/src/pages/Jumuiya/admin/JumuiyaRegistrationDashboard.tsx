import { useState, useEffect, useCallback } from "react";
import {
  Search, X, UserPlus, Loader2, Check, Clock, RefreshCw
} from "lucide-react";
import { memberService } from "../../../api/jumuiyaMemberService";
import toast from "react-hot-toast";

interface Props {
  jumuiyaId: string;
  jumuiyaName: string;
  jumuiyaColor: string;
  user?: { id?: string; name?: string; [key: string]: any };
  onRegister?: () => void;
}

const SEMESTERS = [
  { label: "1.1", dbCol: "sem_1_reg" },
  { label: "1.2", dbCol: "sem_2_reg" },
  { label: "2.1", dbCol: "sem_3_reg" },
  { label: "2.2", dbCol: "sem_4_reg" },
  { label: "3.1", dbCol: "sem_5_reg" },
  { label: "3.2", dbCol: "sem_6_reg" },
  { label: "4.1", dbCol: "sem_7_reg" },
  { label: "4.2", dbCol: "sem_8_reg" },
];

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
  } catch { return d; }
}

const JumuiyaRegistrationDashboard: React.FC<Props> = ({ jumuiyaId, jumuiyaName, jumuiyaColor, user, onRegister }) => {
  const [showManualReg, setShowManualReg] = useState(false);
  const [regSearch, setRegSearch] = useState("");
  const [regResults, setRegResults] = useState<any[]>([]);
  const [regSearching, setRegSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [regSemesters, setRegSemesters] = useState<string[]>([]);
  const [regSerialNo, setRegSerialNo] = useState("");
  const [regAmount, setRegAmount] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);

  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<"pending" | "all">("pending");

  const searchMember = async (q: string) => {
    setRegSearch(q);
    if (q.trim().length < 2) { setRegResults([]); return; }
    setRegSearching(true);
    try {
      const res = await memberService.lookupMemberByRegNumber(q.trim());
      const results = (res.data || []).filter(
        (m: any) => (m.jumuiya_id || "").toLowerCase() === jumuiyaId.toLowerCase() || !m.jumuiya_id
      );
      setRegResults(results);
    } catch { setRegResults([]); }
    setRegSearching(false);
  };

  const toggleSem = (col: string) => {
    setRegSemesters(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
  };

  const resetRegisterForm = () => {
    setRegSearch("");
    setRegResults([]);
    setSelectedMember(null);
    setRegSemesters([]);
    setRegSerialNo("");
    setRegAmount("");
  };

  const fetchPendingPayments = useCallback(async (status?: string) => {
    if (!jumuiyaId) return;
    setLoadingPayments(true);
    try {
      const res = await memberService.getMyJumuiyaPendingPayments({ jumuiya_id: jumuiyaId, status: status || paymentFilter });
      setPendingPayments(res.data || []);
    } catch { setPendingPayments([]); }
    setLoadingPayments(false);
  }, [jumuiyaId, paymentFilter]);

  useEffect(() => {
    if (jumuiyaId) fetchPendingPayments();
  }, [jumuiyaId, fetchPendingPayments, paymentFilter]);

  useEffect(() => {
    const uniqCount = selectedMember
      ? regSemesters.filter(s => !selectedMember[s]).length
      : 0;
    setRegAmount(String(uniqCount * 50));
  }, [regSemesters, selectedMember]);

  const submitRegistration = async () => {
    if (!selectedMember || !jumuiyaId) return;
    setRegSubmitting(true);
    try {
      const newSemCount = regSemesters.filter(s => !selectedMember[s]).length;
      await memberService.secretaryRegisterMember({
        member_id: selectedMember.member_id,
        jumuiya_id: jumuiyaId,
        jumuiya_name: jumuiyaName,
        semesters: regSemesters,
        serial_no: regSerialNo ? parseInt(regSerialNo) : undefined,
        amount: newSemCount * 50,
        registered_by: user?.id || user?.member_id || "",
        registered_by_name: user?.name || "",
      });
      toast.success(`${selectedMember.first_name} registered successfully`);
      setShowManualReg(false);
      resetRegisterForm();
      fetchPendingPayments();
      onRegister?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
    }
    setRegSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4 flex-wrap bg-white rounded-xl border border-slate-200 p-5">
        <div>
          <h3 className="text-sm font-bold text-slate-700">Registration — {jumuiyaName}</h3>
          <p className="text-xs text-slate-400 mt-1">Register members and track pending payments for accountability.</p>
        </div>
        <button onClick={() => setShowManualReg(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
          <UserPlus size={16} /> Register Member
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Clock size={15} className="text-amber-500" /> Pending Payments
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setPaymentFilter("pending")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${paymentFilter === "pending" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                Pending
              </button>
              <button onClick={() => setPaymentFilter("all")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${paymentFilter === "all" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                History
              </button>
            </div>
            <button onClick={() => fetchPendingPayments()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
        {loadingPayments ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-3 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Member</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Amount</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Semesters</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Registered By</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Date</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Status</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">No payments found</td>
                  </tr>
                ) : (
                  pendingPayments.map((p: any) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-700">{p.member_name}</td>
                      <td className="py-2 px-3 text-slate-600 font-semibold">KES {p.amount}</td>
                      <td className="py-2 px-3 text-slate-500">{(p.semester_labels || []).join(", ")}</td>
                      <td className="py-2 px-3 text-slate-500">{p.registered_by_name || "—"}</td>
                      <td className="py-2 px-3 text-slate-500">{formatDate(p.created_at)}</td>
                      <td className="py-2 px-3">
                        {p.status === "paid" ? (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Paid</span>
                        ) : p.status === "cancelled" ? (
                          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Cancelled</span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Pending</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {p.status === "pending" ? (
                          <button
                            onClick={async () => {
                              if (!confirm(`Cancel payment for ${p.member_name}?`)) return;
                              try {
                                await memberService.cancelPendingPayment(p.id);
                                toast.success("Payment cancelled");
                                fetchPendingPayments();
                              } catch (err: any) {
                                toast.error(err?.response?.data?.message || "Cancel failed");
                              }
                            }}
                            className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showManualReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowManualReg(false); resetRegisterForm(); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {selectedMember ? "Confirm Registration" : "Search Member"}
              </h3>
              <button onClick={() => { setShowManualReg(false); resetRegisterForm(); }} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {!selectedMember ? (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by reg number or name..."
                    value={regSearch}
                    onChange={e => searchMember(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {regSearching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />}
                </div>
                {regResults.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {regResults.map((m: any) => (
                      <button
                        key={m.member_id}
                        onClick={() => {
                          setSelectedMember(m);
                          const alreadyRegd = SEMESTERS.filter(s => m[s.dbCol] === true).map(s => s.dbCol);
                          setRegSemesters(alreadyRegd);
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <p className="font-semibold text-slate-800 text-sm">{m.first_name} {m.last_name || ""}</p>
                        <p className="text-xs text-slate-500 font-mono">{m.member_id}</p>
                        {m.jumuiya_name && <p className="text-xs text-slate-400 mt-0.5">{m.jumuiya_name}</p>}
                      </button>
                    ))}
                  </div>
                ) : regSearch.trim().length >= 2 && !regSearching ? (
                  <p className="text-sm text-slate-400 text-center py-8">No members found</p>
                ) : null}
              </>
            ) : (
              <>
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <p className="font-bold text-slate-800">{selectedMember.first_name} {selectedMember.last_name || ""}</p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedMember.member_id}</p>
                  {selectedMember.email && <p className="text-xs text-slate-400">{selectedMember.email}</p>}
                </div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">Semesters to Register</label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {SEMESTERS.map(s => {
                    const isExisting = selectedMember?.[s.dbCol] === true;
                    return (
                      <label
                        key={s.label}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-colors ${
                          regSemesters.includes(s.dbCol)
                            ? isExisting
                              ? "bg-green-100 text-green-700 border-green-300 cursor-default"
                              : "bg-blue-600 text-white border-blue-600 cursor-pointer"
                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 cursor-pointer"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={regSemesters.includes(s.dbCol)}
                          onChange={() => toggleSem(s.dbCol)}
                          disabled={isExisting}
                          className="sr-only"
                        />
                        {s.label}
                        {isExisting && <Check size={12} className="text-green-600" />}
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mb-4 -mt-3">
                  Green = already registered. Check only the semesters you want to register now.
                </p>

                <label className="block text-sm font-semibold text-slate-700 mb-1">Serial No (from physical card)</label>
                <input
                  type="number"
                  value={regSerialNo}
                  onChange={e => setRegSerialNo(e.target.value)}
                  placeholder="Leave blank to auto-assign"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />

                <label className="block text-sm font-semibold text-slate-700 mb-1">Amount to Collect (KES)</label>
                <input
                  type="text"
                  value={`KES ${regAmount}`}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm mb-4 bg-slate-50 text-slate-700 font-semibold"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => { setSelectedMember(null); setRegResults([]); }}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={submitRegistration}
                    disabled={regSubmitting}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {regSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    {regSubmitting ? "Registering..." : "Register & Mark Pending"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JumuiyaRegistrationDashboard;