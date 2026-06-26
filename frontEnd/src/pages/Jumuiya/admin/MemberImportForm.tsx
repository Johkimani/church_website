import { useState } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { FaUpload, FaPlus, FaTrash, FaFileExcel } from "react-icons/fa";
import toast from "react-hot-toast";

interface Props {
  jumuiyaId: string;
  seasonId?: number;
}

const TEMPLATE_HEADERS = ["Name", "RegistrationNumber", "Gender", "Jumuiya", "Phone", "Email"];

const MemberImportForm: React.FC<Props> = ({ jumuiyaId, seasonId }) => {
  const [mode, setMode] = useState<"manual" | "upload">("manual");
  const [members, setMembers] = useState<any[]>([{ name: "", regNumber: "", gender: "", jumuiya: "", phone: "", email: "" }]);
  const [importing, setImporting] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const addRow = () => {
    setMembers([...members, { name: "", regNumber: "", gender: "", jumuiya: "", phone: "", email: "" }]);
  };

  const removeRow = (index: number) => {
    if (members.length > 1) setMembers(members.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split("\n").filter(l => l.trim());
        if (lines.length < 2) {
          toast.error("CSV must have a header row and at least one data row");
          return;
        }
        const headers = lines[0].split(",").map(h => h.trim());
        const parsed = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, i) => { obj[h] = values[i] || ""; });
          return obj;
        });
        setMembers(parsed);
        toast.success(`Parsed ${parsed.length} member(s) from CSV`);
      } catch {
        toast.error("Failed to parse CSV file");
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csv = TEMPLATE_HEADERS.join(",") + "\n" + ",".repeat(TEMPLATE_HEADERS.length - 1);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "member-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleValidate = async () => {
    try {
      const res = await memberService.validateImportData(jumuiyaId, members);
      setValidationResults(res.data);
      toast.success(`Validation complete: ${res.data.summary.valid} valid, ${res.data.summary.warning} warnings, ${res.data.summary.error} errors`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Validation failed");
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await memberService.importMembers(jumuiyaId, {
        members,
        season_id: seasonId,
        file_name: mode === "upload" ? "csv-upload" : "manual-entry",
      });
      setImportResult(res.data);
      setValidationResults(null);
      toast.success(`Imported ${res.data.summary.valid} members successfully`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setMembers([{ name: "", regNumber: "", gender: "", jumuiya: "", phone: "", email: "" }]);
    setValidationResults(null);
    setImportResult(null);
  };

  return (
    <div className="admin-card">
      <h2>Import Members</h2>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button className={`btn-${mode === "manual" ? "primary" : "secondary"}`} onClick={() => setMode("manual")}>
          <FaPlus /> Manual Entry
        </button>
        <button className={`btn-${mode === "upload" ? "primary" : "secondary"}`} onClick={() => setMode("upload")}>
          <FaUpload /> CSV Upload
        </button>
        <button className="btn-secondary" onClick={downloadTemplate}>
          <FaFileExcel /> Download Template
        </button>
      </div>

      {mode === "upload" && (
        <div style={{ marginBottom: "20px", padding: "20px", border: "2px dashed #d1d5db", borderRadius: "8px", textAlign: "center" }}>
          <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ marginBottom: "8px" }} />
          <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>Upload a CSV file with columns: Name, RegistrationNumber, Gender, Jumuiya, Phone, Email</p>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Registration #</th>
              <th>Gender</th>
              <th>Jumuiya</th>
              <th>Phone</th>
              <th>Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td><input value={m.name} onChange={e => handleMemberChange(i, "name", e.target.value)} placeholder="Full name" style={{ width: "140px" }} /></td>
                <td><input value={m.regNumber} onChange={e => handleMemberChange(i, "regNumber", e.target.value)} placeholder="CS01/A/2024/01" style={{ width: "130px" }} /></td>
                <td>
                  <select value={m.gender} onChange={e => handleMemberChange(i, "gender", e.target.value)} style={{ width: "100px" }}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </td>
                <td>
                  <select value={m.jumuiya} onChange={e => handleMemberChange(i, "jumuiya", e.target.value)} style={{ width: "140px" }}>
                    <option value="">Select</option>
                    <option value="St. Anthony">St. Anthony</option>
                    <option value="St. Augustine">St. Augustine</option>
                    <option value="St. Catherine">St. Catherine</option>
                    <option value="St. Dominic">St. Dominic</option>
                    <option value="St. Elizabeth">St. Elizabeth</option>
                    <option value="St. Maria Goretti">St. Maria Goretti</option>
                    <option value="St. Monica">St. Monica</option>
                  </select>
                </td>
                <td><input value={m.phone} onChange={e => handleMemberChange(i, "phone", e.target.value)} placeholder="+254..." style={{ width: "120px" }} /></td>
                <td><input value={m.email} onChange={e => handleMemberChange(i, "email", e.target.value)} placeholder="email" style={{ width: "140px" }} /></td>
                <td><button onClick={() => removeRow(i)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}><FaTrash /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        {mode === "manual" && (
          <button className="btn-secondary" onClick={addRow}><FaPlus /> Add Row</button>
        )}
        <button className="btn-secondary" onClick={handleValidate} disabled={importing}>
          Validate
        </button>
        <button className="btn-primary" onClick={handleImport} disabled={importing}>
          {importing ? "Importing..." : "Import Members"}
        </button>
        <button className="btn-secondary" onClick={resetForm}>Reset</button>
      </div>

      {validationResults && (
        <div style={{ marginTop: "24px" }}>
          <h3>Validation Results</h3>
          <div style={{ display: "flex", gap: "12px", margin: "12px 0" }}>
            <span style={{ color: "#22c55e" }}>Valid: {validationResults.summary.valid}</span>
            <span style={{ color: "#f97316" }}>Warnings: {validationResults.summary.warning}</span>
            <span style={{ color: "#ef4444" }}>Errors: {validationResults.summary.error}</span>
          </div>
          {validationResults.results.filter((r: any) => r.status !== "valid").map((r: any, i: number) => (
            <div key={i} style={{ padding: "8px", margin: "4px 0", background: r.status === "error" ? "#fef2f2" : "#fff7ed", borderRadius: "4px", fontSize: "0.85rem" }}>
              <strong>Row {r.row}:</strong> {r.errors?.join("; ") || r.warnings?.join("; ")}
            </div>
          ))}
        </div>
      )}

      {importResult && (
        <div style={{ marginTop: "24px", padding: "16px", background: "#f0fdf4", borderRadius: "8px" }}>
          <h3 style={{ color: "#22c55e" }}>Import Complete</h3>
          <p>Total: {importResult.summary.total} | Valid: {importResult.summary.valid} | Errors: {importResult.summary.errors}</p>
          <p>Import ID: {importResult.import?.id}</p>
        </div>
      )}
    </div>
  );
};

export default MemberImportForm;
