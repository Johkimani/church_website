import { useState, useEffect } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { Check, X, AlertTriangle, Eye, RefreshCw, Edit3, Save, RotateCcw, Trash2 } from "lucide-react";

interface Props {
  jumuiyaId: string;
}

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  reviewed: { label: "Reviewed", classes: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  processed: { label: "Processed", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", classes: "bg-red-50 text-red-700 border-red-200" },
};

const ValidationReview: React.FC<Props> = ({ jumuiyaId }) => {
  const [imports, setImports] = useState<any[]>([]);
  const [selectedImport, setSelectedImport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [revalidating, setRevalidating] = useState(false);

  const fetchImports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await memberService.getImports(jumuiyaId);
      setImports((res.data || []).filter((imp: any) => imp.status !== "processed"));
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to fetch imports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImports(); }, [jumuiyaId]);

  const viewImportDetail = async (importId: number) => {
    setEditingId(null);
    setEditForm({});
    try {
      const res = await memberService.getImportStatus(jumuiyaId, importId);
      setSelectedImport(res.data);
    } catch (err: any) {
      setError("Failed to load import details");
    }
  };

  const handleStatusChange = async (importId: number, status: string) => {
    try {
      await memberService.updateImportStatus(jumuiyaId, importId, { status });
      setSelectedImport(null);
      fetchImports();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Update failed");
    }
  };

  const startEditing = (rec: any) => {
    setEditingId(rec.id);
    setEditForm({
      name: rec.raw_name || "",
      regNumber: rec.raw_reg_number || "",
      gender: rec.raw_gender || "",
      phone: rec.raw_phone || "",
      email: rec.raw_email || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const hasErrorRecords = selectedImport?.records?.some((r: any) => r.status === "error") ?? false;

  const handleRevalidate = async () => {
    if (!selectedImport?.records?.length) return;
    setRevalidating(true);
    setError(null);
    try {
      const members = selectedImport.records.map((r: any) => ({
        name: r.raw_name || "",
        regNumber: r.raw_reg_number || "",
        gender: r.raw_gender || "",
        phone: r.raw_phone || "",
        email: r.raw_email || "",
      }));
      const res = await memberService.validateImportData(jumuiyaId, members);
      const results = res.data.results;
      for (let i = 0; i < results.length; i++) {
        const rec = selectedImport.records[i];
        await memberService.updateImportRecord(jumuiyaId, rec.id, {
          name: results[i].raw.name || rec.raw_name,
          regNumber: results[i].raw.regNumber || rec.raw_reg_number,
          gender: results[i].raw.gender || rec.raw_gender,
          phone: results[i].raw.phone || rec.raw_phone,
          email: results[i].raw.email || rec.raw_email,
        });
      }
      const refreshed = await memberService.getImportStatus(jumuiyaId, selectedImport.id);
      setSelectedImport(refreshed.data);
      fetchImports();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Re-validation failed");
    } finally {
      setRevalidating(false);
    }
  };

  const saveEdit = async (recordId: number) => {
    setSaving(true);
    setError(null);
    try {
      await memberService.updateImportRecord(jumuiyaId, recordId, editForm);
      setEditingId(null);
      setEditForm({});
      // Re-fetch the import detail to show updated data
      if (selectedImport) {
        const res = await memberService.getImportStatus(jumuiyaId, selectedImport.id);
        setSelectedImport(res.data);
      }
      fetchImports();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (!window.confirm("Delete this record permanently?")) return;
    setSaving(true);
    setError(null);
    try {
      await memberService.deleteImportRecord(jumuiyaId, recordId);
      if (selectedImport) {
        const res = await memberService.getImportStatus(jumuiyaId, selectedImport.id);
        setSelectedImport(res.data);
      }
      fetchImports();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-1/4" />
        <div className="h-48 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Validation & Review</h3>
          <p className="text-xs text-slate-500">Review imported records, fix validation issues, and approve imports.</p>
        </div>
        <button onClick={fetchImports} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {imports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Eye size={32} className="text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No imports found.</p>
          <p className="text-slate-300 text-xs mt-1">Import members first in the Import tab.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Queue / Batch</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Source</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Valid</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Errors</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {imports.map((imp) => {
                const st = STATUS_STYLES[imp.status] || STATUS_STYLES.pending;
                const isWhatsApp = imp.file_name === "whatsapp-self-registration";
                return (
                  <tr key={imp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">
                      #{imp.id}
                    </td>
                    <td className="py-3 px-4">
                      {isWhatsApp ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          WhatsApp Link
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                          {imp.file_name || "Manual / CSV"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{imp.import_date?.slice(0, 10)}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{imp.total_records}</td>
                    <td className="py-3 px-4 text-emerald-600 font-medium">{imp.valid_records}</td>
                    <td className="py-3 px-4 text-red-600 font-medium">{imp.error_records}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${st.classes}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => viewImportDetail(imp.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors" title="View Details">
                          <Eye size={13} /> View / Edit
                        </button>
                        {imp.status === "pending" && (
                          <button onClick={() => handleStatusChange(imp.id, "processed")}
                            disabled={imp.error_records > 0}
                            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              imp.error_records > 0
                                ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                                : "text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                            }`}
                            title={imp.error_records > 0 ? "Fix errors before importing" : "Import all valid records to Jumuiya"}>
                            <Check size={13} /> Import to Jumuiya
                          </button>
                        )}
                        {imp.status === "reviewed" && (
                          <button onClick={() => handleStatusChange(imp.id, "processed")}
                            disabled={imp.error_records > 0}
                            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              imp.error_records > 0
                                ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                                : "text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                            }`}
                            title={imp.error_records > 0 ? "Fix errors before processing" : "Import to Jumuiya"}>
                            <Check size={13} /> Import to Jumuiya
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedImport && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedImport(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Import #{selectedImport.id}</h3>
              <button onClick={() => setSelectedImport(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              File: {selectedImport.file_name || "Manual entry"} &middot; Date: {selectedImport.import_date?.slice(0, 10)}
            </p>

            {selectedImport.records?.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Reg #</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Gender</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Phone</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Issues</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedImport.records.map((rec: any) => {
                      const isEditing = editingId === rec.id;
                      const isError = rec.status === "error";
                      return (
                        <tr key={rec.id} className={`border-b border-slate-100 ${isError ? "bg-red-50" : ""}`}>
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input value={editForm.name} onChange={(e) => handleEditChange("name", e.target.value)}
                                className="w-28 border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                            ) : (
                              <span className="text-slate-700 text-xs">{rec.raw_name || "—"}</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input value={editForm.regNumber} onChange={(e) => handleEditChange("regNumber", e.target.value)}
                                className="w-28 border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                            ) : (
                              <span className="text-slate-700 text-xs">{rec.raw_reg_number || "—"}</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <select value={editForm.gender} onChange={(e) => handleEditChange("gender", e.target.value)}
                                className="w-20 border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400">
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            ) : (
                              <span className="text-slate-700 text-xs">{rec.raw_gender || "—"}</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input value={editForm.phone} onChange={(e) => handleEditChange("phone", e.target.value)}
                                className="w-24 border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                            ) : (
                              <span className="text-slate-700 text-xs">{rec.raw_phone || "—"}</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input value={editForm.email} onChange={(e) => handleEditChange("email", e.target.value)}
                                className="w-24 border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
                            ) : (
                              <span className="text-slate-700 text-xs">{rec.raw_email || "—"}</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              rec.status === "valid" ? "bg-emerald-50 text-emerald-700" :
                              rec.status === "warning" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-xs max-w-[140px]">
                            {rec.validation_errors?.length > 0 && (
                              <div className="text-red-600 leading-tight">{rec.validation_errors.join("; ")}</div>
                            )}
                            {rec.validation_warnings?.length > 0 && (
                              <div className="text-amber-600 flex items-center gap-1"><AlertTriangle size={12} /> {rec.validation_warnings.join("; ")}</div>
                            )}
                            {(!rec.validation_errors?.length && !rec.validation_warnings?.length) && (
                              <span className="text-emerald-600">No issues</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <div className="flex gap-1">
                                <button onClick={() => saveEdit(rec.id)} disabled={saving}
                                  className="p-1 rounded text-emerald-500 hover:bg-emerald-50 transition-colors" title="Save">
                                  <Save size={14} />
                                </button>
                                <button onClick={cancelEditing}
                                  className="p-1 rounded text-red-400 hover:bg-red-50 transition-colors" title="Cancel">
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                {isError && (selectedImport.status === "pending" || selectedImport.status === "rejected") && (
                                  <button onClick={() => startEditing(rec)}
                                    className="p-1 rounded text-indigo-400 hover:bg-indigo-50 transition-colors" title="Edit to fix errors">
                                    <Edit3 size={14} />
                                  </button>
                                )}
                                {(selectedImport.status === "pending" || selectedImport.status === "rejected") && (
                                  <button onClick={() => handleDeleteRecord(rec.id)}
                                    className="p-1 rounded text-red-400 hover:bg-red-50 transition-colors" title="Delete record">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-4">No record details available.</p>
            )}

            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setSelectedImport(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                Close
              </button>
              {selectedImport.records?.length > 0 && (
                <button onClick={handleRevalidate} disabled={revalidating}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors disabled:opacity-50"
                  title={hasErrorRecords ? "Re-validate all records after fixing errors" : "Re-validate all records"}>
                  <RotateCcw size={14} className={revalidating ? "animate-spin" : ""} /> {revalidating ? "Re-validating..." : "Re-validate All"}
                </button>
              )}
              {selectedImport.status === "pending" && (
                <>
                  <button onClick={() => handleStatusChange(selectedImport.id, "reviewed")}
                    disabled={hasErrorRecords}
                    className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                      hasErrorRecords
                        ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                        : "text-white bg-indigo-600 hover:bg-indigo-700"
                    }`}
                    title={hasErrorRecords ? "Fix all errors before marking as reviewed" : ""}>
                    Mark Reviewed
                  </button>
                  <button onClick={() => handleStatusChange(selectedImport.id, "rejected")}
                    className="px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
                    Reject
                  </button>
                </>
              )}
              {selectedImport.status === "reviewed" && (
                <button onClick={() => handleStatusChange(selectedImport.id, "processed")}
                  disabled={hasErrorRecords}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                    hasErrorRecords
                      ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                      : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                  }`}
                  title={hasErrorRecords ? "Fix all errors before processing" : ""}>
                  Process
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationReview;
