import { useState, useEffect } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import {
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Printer, Users, ThumbsUp, ThumbsDown, Eye,
} from "lucide-react";

interface Props {
  jumuiyaId: string;
  jumuiyaName: string;
  jumuiyaColor: string;
}

export default function CsaAllocationsApproval({ jumuiyaId, jumuiyaName, jumuiyaColor }: Props) {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [batchAction, setBatchAction] = useState<string | null>(null);
  const [memberList, setMemberList] = useState<any[]>([]);
  const [showMemberList, setShowMemberList] = useState(false);
  const [memberListLoading, setMemberListLoading] = useState(false);

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await memberService.csaGetApprovals(jumuiyaId);
      setApprovals(res.data?.approvals || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberList = async () => {
    setMemberListLoading(true);
    try {
      const res = await memberService.csaGetJumuiyaMemberList(jumuiyaId);
      setMemberList(res.data?.members || []);
      setShowMemberList(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to load member list");
    } finally {
      setMemberListLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [jumuiyaId]);

  const handleReview = async (id: number, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      await memberService.csaReviewApproval(id, { status });
      setApprovals(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to update");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBatchReview = async (status: "approved" | "rejected") => {
    setBatchAction(status);
    try {
      await memberService.csaBatchReviewApprovals(jumuiyaId, { status });
      setApprovals(prev => prev.map(a => ({ ...a, status })));
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Batch update failed");
    } finally {
      setBatchAction(null);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const rows = approvals.filter(a => a.status === "approved").length > 0
      ? approvals.filter(a => a.status === "approved")
      : approvals;
    const list = showMemberList && memberList.length > 0 ? memberList : rows;
    printWindow.document.write(`
      <html>
        <head><title>${jumuiyaName} - Member List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: ${jumuiyaColor}; font-size: 24px; margin-bottom: 4px; }
          h2 { color: #666; font-size: 14px; font-weight: normal; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
          td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .male { color: #2563eb; }
          .female { color: #db2777; }
          .footer { margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print { body { padding: 20px; } }
        </style>
        </head>
        <body>
          <h1>${jumuiyaName}</h1>
          <h2>New Member Allocations — ${new Date().toLocaleDateString()}</h2>
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Reg #</th><th>Gender</th><th>Phone</th><th>Year</th></tr></thead>
            <tbody>
              ${list.map((m: any, i: number) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${m.name || m.member_name || ""}</td>
                  <td>${m.reg_number || ""}</td>
                  <td class="${m.gender === "Male" ? "male" : "female"}">${m.gender === "Male" ? "M" : "W"}</td>
                  <td>${m.phone || ""}</td>
                  <td>${m.academic_year || ""}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="footer">Total: ${list.length} members · Printed ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const pendingCount = approvals.filter(a => a.status === "pending").length;
  const approvedCount = approvals.filter(a => a.status === "approved").length;
  const rejectedCount = approvals.filter(a => a.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users size={20} style={{ color: jumuiyaColor }} />
            New Allocations — {jumuiyaName}
          </h3>
          <p className="text-sm text-slate-500">
            Review and approve/reject members allocated to your Jumuiya from Central Admissions.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchApprovals} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-lg border border-slate-200">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 transition-colors px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><XCircle size={14} /></button>
        </div>
      )}

      {/* Summary */}
      <div className="flex gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex-1">
          <p className="text-2xl font-bold text-slate-800">{approvals.length}</p>
          <p className="text-xs text-slate-500 font-medium">Total Allocated</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 flex-1">
          <p className="text-2xl font-bold text-emerald-700">{approvedCount}</p>
          <p className="text-xs text-emerald-600 font-medium">Approved</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 flex-1">
          <p className="text-2xl font-bold text-blue-700">{pendingCount}</p>
          <p className="text-xs text-blue-600 font-medium">Pending</p>
        </div>
        {rejectedCount > 0 && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-4 flex-1">
            <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
            <p className="text-xs text-red-600 font-medium">Rejected</p>
          </div>
        )}
      </div>

      {/* Batch Actions */}
      {pendingCount > 0 && (
        <div className="flex gap-2">
          <button onClick={() => handleBatchReview("approved")} disabled={batchAction !== null}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 rounded-lg transition-colors">
            {batchAction === "approved" ? "Approving..." : <><ThumbsUp size={14} /> Approve All</>}
          </button>
          <button onClick={() => handleBatchReview("rejected")} disabled={batchAction !== null}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg transition-colors">
            {batchAction === "rejected" ? "Rejecting..." : <><ThumbsDown size={14} /> Reject All</>}
          </button>
        </div>
      )}

      {/* Member List Toggle */}
      <div className="flex gap-2">
        <button onClick={() => { setShowMemberList(!showMemberList); if (!showMemberList && memberList.length === 0) fetchMemberList(); }}
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 transition-colors px-3 py-1.5 rounded-lg border border-indigo-200">
          <Eye size={14} /> {showMemberList ? "Hide" : "View"} Finalized Members
        </button>
      </div>

      {/* Finalized Member List */}
      {showMemberList && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" />
            Finalized Members ({memberList.length})
          </h4>
          {memberListLoading ? (
            <div className="animate-pulse space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-6 bg-slate-100 rounded" />)}
            </div>
          ) : memberList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">#</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Name</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Reg #</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Gender</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Phone</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {memberList.map((m, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-1.5 px-3 text-slate-400">{i + 1}</td>
                      <td className="py-1.5 px-3 font-medium text-slate-700">{m.name}</td>
                      <td className="py-1.5 px-3 text-slate-600">{m.reg_number}</td>
                      <td className="py-1.5 px-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.gender === "Male" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"}`}>
                          {m.gender === "Male" ? "M" : "W"}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-slate-600">{m.phone}</td>
                      <td className="py-1.5 px-3 text-slate-600">{m.academic_year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-4 text-center">No finalized members yet.</p>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Users size={32} className="text-slate-300 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-600">No pending allocations</h4>
          <p className="text-sm text-slate-400 mt-1">New members allocated to your Jumuiya will appear here for your approval.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {approvals.map((a, idx) => (
            <div key={a.id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${
              a.status === "approved" ? "border-emerald-200 bg-emerald-50/50" :
              a.status === "rejected" ? "border-red-200 bg-red-50/50" :
              "border-slate-200"
            }`}>
              <div className="w-6 shrink-0 text-center text-xs font-bold text-slate-400">{idx + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{a.name}</p>
                <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                  <span>{a.reg_number || "—"}</span>
                  <span className={`font-semibold ${a.gender === "Male" ? "text-blue-600" : "text-pink-600"}`}>
                    {a.gender === "Male" ? "M" : "W"}
                  </span>
                  {a.phone && <span>{a.phone}</span>}
                  {a.academic_year && <span>{a.academic_year}</span>}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {a.status === "pending" ? (
                  <>
                    <button onClick={() => handleReview(a.id, "approved")} disabled={actionLoading === a.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50">
                      {actionLoading === a.id ? "..." : <><CheckCircle size={12} /> Approve</>}
                    </button>
                    <button onClick={() => handleReview(a.id, "rejected")} disabled={actionLoading === a.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50">
                      {actionLoading === a.id ? "..." : <><XCircle size={12} /> Reject</>}
                    </button>
                  </>
                ) : (
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                    a.status === "approved" ? "text-emerald-600 bg-emerald-100" : "text-red-600 bg-red-100"
                  }`}>
                    {a.status === "approved" ? "Approved" : "Rejected"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}