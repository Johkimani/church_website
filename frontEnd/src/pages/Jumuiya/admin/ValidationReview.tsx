import { useState, useEffect } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { FaCheck, FaTimes, FaExclamationTriangle, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";

interface Props {
  jumuiyaId: string;
}

const STATUS_BADGE: Record<string, { color: string; bg: string }> = {
  pending: { color: "#f97316", bg: "#fff7ed" },
  reviewed: { color: "#6366f1", bg: "#eef2ff" },
  processed: { color: "#22c55e", bg: "#f0fdf4" },
  rejected: { color: "#ef4444", bg: "#fef2f2" },
};

const ValidationReview: React.FC<Props> = ({ jumuiyaId }) => {
  const [imports, setImports] = useState<any[]>([]);
  const [selectedImport, setSelectedImport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchImports = async () => {
    setLoading(true);
    try {
      const res = await memberService.getImports(jumuiyaId);
      setImports(res.data || []);
    } catch (err) {
      console.error("Failed to fetch imports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImports(); }, [jumuiyaId]);

  const viewImportDetail = async (importId: number) => {
    try {
      const res = await memberService.getImportStatus(jumuiyaId, importId);
      setSelectedImport(res.data);
    } catch (err) {
      toast.error("Failed to load import details");
    }
  };

  const handleStatusChange = async (importId: number, status: string) => {
    try {
      await memberService.updateImportStatus(jumuiyaId, importId, { status });
      toast.success(`Import marked as ${status}`);
      setSelectedImport(null);
      fetchImports();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Update failed");
    }
  };

  if (loading) {
    return <div className="admin-card"><p style={{ textAlign: "center", padding: "40px" }}>Loading imports...</p></div>;
  }

  return (
    <div className="admin-card">
      <h2>Validation & Review</h2>
      <p style={{ color: "#6b7280", marginBottom: "20px" }}>Review imported records, fix validation issues, and approve imports.</p>

      {imports.length === 0 ? (
        <p style={{ padding: "20px 0", color: "#6b7280" }}>No imports found. Import members first.</p>
      ) : (
        <table className="premium-table">
          <thead>
            <tr>
              <th>Import ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Valid</th>
              <th>Errors</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {imports.map((imp) => {
              const badge = STATUS_BADGE[imp.status] || STATUS_BADGE.pending;
              return (
                <tr key={imp.id}>
                  <td>#{imp.id}</td>
                  <td>{imp.import_date?.slice(0, 10)}</td>
                  <td>{imp.total_records}</td>
                  <td style={{ color: "#22c55e" }}>{imp.valid_records}</td>
                  <td style={{ color: "#ef4444" }}>{imp.error_records}</td>
                  <td>
                    <span style={{ color: badge.color, background: badge.bg, padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 600 }}>
                      {imp.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn-sm" onClick={() => viewImportDetail(imp.id)} title="View Details"><FaEye /></button>
                      {imp.status === "pending" && (
                        <>
                          <button className="btn-sm" style={{ background: "#22c55e", color: "white" }} onClick={() => handleStatusChange(imp.id, "reviewed")} title="Mark Reviewed"><FaCheck /></button>
                          <button className="btn-sm" style={{ background: "#ef4444", color: "white" }} onClick={() => handleStatusChange(imp.id, "rejected")} title="Reject"><FaTimes /></button>
                        </>
                      )}
                      {imp.status === "reviewed" && (
                        <button className="btn-sm" style={{ background: "#6366f1", color: "white" }} onClick={() => handleStatusChange(imp.id, "processed")}>
                          Process
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selectedImport && (
        <div className="modal-overlay" onClick={() => setSelectedImport(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "800px" }}>
            <h3>Import #{selectedImport.id} — Details</h3>
            <p>File: {selectedImport.file_name || "Manual entry"} | Date: {selectedImport.import_date?.slice(0, 10)}</p>

            {selectedImport.records?.length > 0 ? (
              <div style={{ overflowX: "auto", marginTop: "16px" }}>
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Raw Name</th>
                      <th>Cleaned Name</th>
                      <th>Status</th>
                      <th>Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedImport.records.map((rec: any) => (
                      <tr key={rec.id}>
                        <td>{rec.raw_name || "—"}</td>
                        <td>{rec.cleaned_name || "—"}</td>
                        <td>
                          <span style={{
                            padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 600,
                            color: rec.status === "valid" ? "#22c55e" : rec.status === "warning" ? "#f97316" : "#ef4444",
                            background: rec.status === "valid" ? "#f0fdf4" : rec.status === "warning" ? "#fff7ed" : "#fef2f2",
                          }}>
                            {rec.status}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                          {rec.validation_errors?.length > 0 && <div style={{ color: "#ef4444" }}>{rec.validation_errors.join("; ")}</div>}
                          {rec.validation_warnings?.length > 0 && <div style={{ color: "#f97316" }}><FaExclamationTriangle /> {rec.validation_warnings.join("; ")}</div>}
                          {(!rec.validation_errors?.length && !rec.validation_warnings?.length) && <span style={{ color: "#22c55e" }}>No issues</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ padding: "16px 0", color: "#6b7280" }}>No record details available.</p>
            )}

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
              <button className="btn-secondary" onClick={() => setSelectedImport(null)}>Close</button>
              {selectedImport.status === "pending" && (
                <>
                  <button className="btn-primary" onClick={() => handleStatusChange(selectedImport.id, "reviewed")}>Mark Reviewed</button>
                  <button className="btn-secondary" style={{ color: "#ef4444" }} onClick={() => handleStatusChange(selectedImport.id, "rejected")}>Reject</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationReview;
