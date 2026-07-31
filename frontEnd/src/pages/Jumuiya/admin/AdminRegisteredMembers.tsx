import React, { useState, useEffect, useMemo } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import { FaSearch, FaDownload, FaSync, FaUserGraduate, FaFilter, FaUsers, FaCheckCircle, FaGraduationCap } from "react-icons/fa";
import * as XLSX from "xlsx";

interface AdminRegisteredMembersProps {
  jumuiyaId: string;
  jumuiyaName: string;
  jumuiyaColor: string;
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

function getYearSemLabel(m: any): string {
  for (let i = 8; i >= 1; i--) {
    const col = `sem_${i}_reg`;
    if (m[col]) return SEMESTERS[i - 1]?.label || "—";
  }
  return "—";
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "numeric" });
  } catch { return d; }
}

const AdminRegisteredMembers: React.FC<AdminRegisteredMembersProps> = ({ jumuiyaId, jumuiyaName, jumuiyaColor }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await memberService.csaGetJumuiyaMemberList(jumuiyaId);
      setMembers(res.data || []);
    } catch {
      try {
        const res = await memberService.exportMembers(jumuiyaId);
        setMembers(res.data || []);
      } catch (err) {
        console.error("Failed to load registered members:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [jumuiyaId]);

  // Stats
  const stats = useMemo(() => {
    const total = members.length;
    const male = members.filter(m => (m.gender || "").toLowerCase() === "male").length;
    const female = members.filter(m => (m.gender || "").toLowerCase() === "female").length;
    const semesterCounts: Record<string, number> = {};
    SEMESTERS.forEach(s => {
      semesterCounts[s.label] = members.filter(m => m[s.dbCol] === true || m[s.dbCol] === "true" || m[s.dbCol] === 1).length;
    });
    return { total, male, female, semesterCounts };
  }, [members]);

  // Filtered members
  const filtered = useMemo(() => {
    let result = [...members];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        (m.name || `${m.first_name || ""} ${m.last_name || ""}`.trim()).toLowerCase().includes(q) ||
        (m.reg_number || "").toLowerCase().includes(q) ||
        (m.course || "").toLowerCase().includes(q)
      );
    }

    if (genderFilter !== "all") {
      result = result.filter(m => (m.gender || "").toLowerCase() === genderFilter);
    }

    if (semesterFilter !== "all") {
      const col = SEMESTERS.find(s => s.label === semesterFilter)?.dbCol;
      if (col) result = result.filter(m => m[col] === true || m[col] === "true" || m[col] === 1);
    }

    return result;
  }, [members, search, genderFilter, semesterFilter]);

  const handleExport = () => {
    const data = filtered.map(m => {
      const name = m.name || `${m.first_name || ""} ${m.last_name || ""}`.trim();
      const row: Record<string, any> = {
        Name: name,
        "Reg Number": m.reg_number || "—",
        Gender: m.gender || "—",
        Course: m.course || "—",
        "Year.Sem": m.year_sem || getYearSemLabel(m),
        Registered: formatDate(m.registration_date),
      };
      SEMESTERS.forEach(s => {
        row[`Sem ${s.label}`] = m[s.dbCol] ? "✓" : "—";
      });
      return row;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Registered Members");
    XLSX.writeFile(wb, `${jumuiyaName.replace(/\s+/g, "-")}-registered-members.xlsx`);
  };

  const _c = (s) => jumuiyaColor.length > 7 ? jumuiyaColor.slice(0, 7) + s : jumuiyaColor + s;

  return (
    <div className="admin-card" style={{ "--jumuiya-color": jumuiyaColor } as React.CSSProperties}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <FaUserGraduate style={{ color: jumuiyaColor }} />
          Registered Members — {jumuiyaName}
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
          View and manage all registered members in this Jumuiya
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <div style={{ background: `${_c('10')}`, borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <FaUsers style={{ color: jumuiyaColor, fontSize: "1.2rem", marginBottom: "6px" }} />
          <p style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>{stats.total}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>Total</p>
        </div>
        <div style={{ background: "#eff6ff", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <FaUsers style={{ color: "#3b82f6", fontSize: "1.2rem", marginBottom: "6px" }} />
          <p style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "#3b82f6" }}>{stats.male}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>Male</p>
        </div>
        <div style={{ background: "#fdf2f8", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <FaUsers style={{ color: "#ec4899", fontSize: "1.2rem", marginBottom: "6px" }} />
          <p style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "#ec4899" }}>{stats.female}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>Female</p>
        </div>
        <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <FaCheckCircle style={{ color: "#10b981", fontSize: "1.2rem", marginBottom: "6px" }} />
          <p style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "#10b981" }}>
            {SEMESTERS.reduce((sum, s) => sum + (stats.semesterCounts[s.label] || 0), 0)}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>Semester Regs</p>
        </div>
      </div>

      {/* Semester Progress */}
      <div style={{ marginBottom: "24px", padding: "16px", background: "var(--bg-secondary)", borderRadius: "12px" }}>
        <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <FaGraduationCap style={{ display: "inline", marginRight: "6px" }} />
          Semester Registration Progress
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "60px" }}>
          {SEMESTERS.map(s => {
            const count = stats.semesterCounts[s.label] || 0;
            const maxH = Math.max(...Object.values(stats.semesterCounts), 1);
            const pct = (count / maxH) * 100;
            return (
              <div key={s.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-primary)" }}>{count}</span>
                <div style={{ width: "100%", height: `${pct}%`, background: jumuiyaColor, borderRadius: "3px 3px 0 0", minHeight: count > 0 ? "4px" : 0, opacity: 0.7 }} />
                <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters & Actions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.85rem" }} />
          <input
            type="text"
            placeholder="Search by name, reg number, course..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px 10px 36px", borderRadius: "10px",
              border: "1px solid var(--border-color)", fontSize: "0.875rem"
            }}
          />
        </div>

        <select
          value={genderFilter}
          onChange={e => setGenderFilter(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-color)", fontSize: "0.875rem", background: "white" }}
        >
          <option value="all">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <select
          value={semesterFilter}
          onChange={e => setSemesterFilter(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-color)", fontSize: "0.875rem", background: "white" }}
        >
          <option value="all">All Semesters</option>
          {SEMESTERS.map(s => (
            <option key={s.label} value={s.label}>Sem {s.label}</option>
          ))}
        </select>

        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px",
            background: "#10b981", color: "white", border: "none", borderRadius: "10px",
            fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", opacity: filtered.length === 0 ? 0.5 : 1,
          }}
        >
          <FaDownload /> Export
        </button>

        <button
          onClick={fetchMembers}
          style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px",
            background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-color)",
            borderRadius: "10px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
          }}
        >
          <FaSync className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
        Showing <strong>{filtered.length}</strong> of <strong>{members.length}</strong> members
      </p>

      {/* Members Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          <FaSync className="animate-spin" style={{ fontSize: "1.5rem", marginBottom: "8px" }} />
          <p>Loading members...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 24px", color: "var(--text-secondary)",
          background: "var(--bg-secondary)", borderRadius: "12px", border: "2px dashed var(--border-color)"
        }}>
          <FaUserGraduate style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.3 }} />
          <p style={{ fontWeight: 600, marginBottom: "4px" }}>
            {members.length === 0 ? "No registered members yet" : "No members match your filters"}
          </p>
          <p style={{ fontSize: "0.85rem", margin: 0 }}>
            {members.length === 0 ? "Members will appear here once they are registered through the CSA system." : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>#</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>Name</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>Reg Number</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>Gender</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>Course</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>Year.Sem</th>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--text-secondary)", fontSize: "0.75rem", textTransform: "uppercase" }}>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.registration_id || m.id || i} style={{ borderBottom: "1px solid var(--border-light)", background: i % 2 === 0 ? "white" : "var(--bg-soft)" }}>
                  <td style={{ padding: "10px 14px", color: "var(--text-muted)", fontSize: "0.8rem" }}>{i + 1}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {m.name || `${m.first_name || ""} ${m.last_name || ""}`.trim() || "—"}
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--text-secondary)", fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {m.reg_number || "—"}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600,
                      background: (m.gender || "").toLowerCase() === "male" ? "#eff6ff" : "#fdf2f8",
                      color: (m.gender || "").toLowerCase() === "male" ? "#3b82f6" : "#ec4899"
                    }}>
                      {(m.gender || "").toLowerCase() === "male" ? "M" : "W"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--text-secondary)", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={m.course}>
                    {m.course || "—"}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600,
                      background: `${_c('15')}`, color: jumuiyaColor
                    }}>
                      {m.year_sem || getYearSemLabel(m)}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    {formatDate(m.registration_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRegisteredMembers;
