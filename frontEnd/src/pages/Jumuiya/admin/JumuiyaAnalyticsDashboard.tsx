import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Activity, Layers, Trophy, Users, TrendingUp, GraduationCap,
  Calendar, X
} from "lucide-react";
import { semesterServices } from "../../../api/semesterServices";
import { semNumFromConfig, semColForYearSem, yearSemLabel } from "../../../utils/semester";
import { isMale, isFemale, normalizeYearOfStudy } from "../../../utils/memberYear";

interface Props {
  jumuiyaId: string;
  jumuiyaName: string;
  jumuiyaColor: string;
  members: any[];
  stats: any;
}

const JUMUIYA_COLORS: Record<string, string> = {
  "St. Anthony": "#8b5cf6", "St. Augustine": "#3b82f6", "St. Catherine": "#800000",
  "St. Dominic": "#979695", "St. Elizabeth": "#07a414", "St. Maria Goretti": "#0ea5e9", "St. Monica": "#ef4444",
  anthony: "#8b5cf6", augustine: "#3b82f6", catherine: "#800000",
  dominic: "#979695", elizabeth: "#07a414", "maria-goretti": "#0ea5e9", monica: "#ef4444",
};

function resolveColor(nameOrSlug: string, fallback: string): string {
  return JUMUIYA_COLORS[nameOrSlug] || JUMUIYA_COLORS[nameOrSlug.toLowerCase()] || fallback;
}

const PIE_COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444", "#22c55e"];

const SEMESTER_LABELS = ["1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2"];

function isRegisteredForCurrentSem(m: any, semNum: 1 | 2): boolean {
  const col = semColForYearSem(normalizeYearOfStudy(m.year_of_study), semNum);
  if (!col) return false;
  return m[col] === true || m[col] === 1 || m[col] === "1" || m[col] === "true";
}

const JumuiyaAnalyticsDashboard: React.FC<Props> = ({ jumuiyaId, jumuiyaName, jumuiyaColor, members }) => {
  const resolvedColor = resolveColor(jumuiyaName, resolveColor(jumuiyaId, jumuiyaColor));
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "cohort" | "yearly">("overview");
  const [genderModal, setGenderModal] = useState<"gent" | "lady" | null>(null);

  const [semester, setSemester] = useState<any>(null);
  useEffect(() => {
    semesterServices
      .getCurrent()
      .then((data) => setSemester(data || null))
      .catch(() => setSemester(null));
  }, []);
  const semNum: 1 | 2 = semNumFromConfig(semester);

  const genderBreakdown = useMemo(() => {
    const male = members.filter((m: any) => isMale(m.gender)).length;
    const female = members.filter((m: any) => isFemale(m.gender)).length;
return [
      { name: "Gents", value: male },
      { name: "Ladies", value: female },
    ];
  }, [members]);

  const yearBreakdown = useMemo(() => {
    const years: Record<string, number> = {};
    members.forEach((m: any) => {
      const y = normalizeYearOfStudy(m.year_of_study);
      if (y === "Unknown") return;
      years[y] = (years[y] || 0) + 1;
    });
    return Object.entries(years)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([year, count]) => ({ name: `Year ${year}`, count }));
  }, [members]);

  const semesterFillData = useMemo(() => {
    const counts: Record<string, number> = {};
    SEMESTER_LABELS.forEach(s => { counts[s] = 0; });
    const colMap = ["sem_1_reg", "sem_2_reg", "sem_3_reg", "sem_4_reg", "sem_5_reg", "sem_6_reg", "sem_7_reg", "sem_8_reg"];
    members.forEach((m: any) => {
      colMap.forEach((col, i) => {
        if (m[col] === true || m[col] === 1 || m[col] === "1" || m[col] === "true") {
          counts[SEMESTER_LABELS[i]]++;
        }
      });
    });
    return SEMESTER_LABELS.map(s => ({ semester: s, count: counts[s] }));
  }, [members]);

  const monthlyTrendData = useMemo(() => {
    const byMonth: Record<string, number> = {};
    members.forEach((m: any) => {
      const date = m.join_date || m.created_at;
      if (!date) return;
      const month = date.slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => {
        const [y, m] = month.split("-");
        const d = new Date(parseInt(y), parseInt(m) - 1);
        return { month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), count };
      });
  }, [members]);

  const cohortData = useMemo(() => {
    const colMap = ["sem_1_reg", "sem_2_reg", "sem_3_reg", "sem_4_reg", "sem_5_reg", "sem_6_reg", "sem_7_reg", "sem_8_reg"];
    const cohorts: Record<string, number[]> = {};
    members.forEach((m: any) => {
      const yos = m.year_of_study;
      if (!yos || parseInt(yos) < 1 || parseInt(yos) > 4) return;
      const admissionYear = new Date().getFullYear() - parseInt(yos) + 1;
      const key = `Year ${yos} (${admissionYear})`;
      if (!cohorts[key]) cohorts[key] = SEMESTER_LABELS.map(() => 0);
      colMap.forEach((col, i) => {
        if (m[col] === true || m[col] === 1 || m[col] === "1" || m[col] === "true") {
          cohorts[key][i]++;
        }
      });
    });
    return Object.entries(cohorts).map(([name, counts]) => {
      const row: Record<string, any> = { name };
      SEMESTER_LABELS.forEach((s, i) => { row[s] = counts[i]; });
      return row;
    });
  }, [members]);

  const yearlyComparison = useMemo(() => {
    const byYear: Record<string, number> = {};
    members.forEach((m: any) => {
      const date = m.join_date || m.created_at;
      if (!date) return;
      const year = date.slice(0, 4);
      byYear[year] = (byYear[year] || 0) + 1;
    });
    return Object.entries(byYear)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, count]) => ({ year, count }));
  }, [members]);

  const registrationStats = useMemo(() => {
    const total = members.length;
    const registered = members.filter((m: any) => isRegisteredForCurrentSem(m, semNum)).length;
    const maleMembers = members.filter((m: any) => isMale(m.gender));
    const femaleMembers = members.filter((m: any) => isFemale(m.gender));
    const maleTotal = maleMembers.length;
    const maleRegistered = maleMembers.filter((m: any) => isRegisteredForCurrentSem(m, semNum)).length;
    const femaleTotal = femaleMembers.length;
    const femaleRegistered = femaleMembers.filter((m: any) => isRegisteredForCurrentSem(m, semNum)).length;

    const byYear: { label: string; total: number; registered: number }[] = [];
    const byYearRaw: Record<string, any[]> = {};
    members.forEach((m: any) => {
      const y = normalizeYearOfStudy(m.year_of_study);
      if (y === "Unknown") return;
      (byYearRaw[y] = byYearRaw[y] || []).push(m);
    });
    Object.keys(byYearRaw)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach((y) => {
        const yMembers = byYearRaw[y];
        const regd = yMembers.filter((m: any) => isRegisteredForCurrentSem(m, semNum)).length;
        byYear.push({ label: `Year ${y}`, total: yMembers.length, registered: regd });
      });

    const currentSemRange = ["1", "2", "3", "4"].map(y => yearSemLabel(y, semNum)).join(" / ");

    return {
      total, registered, rate: total ? Math.round((registered / total) * 100) : 0,
      maleTotal, maleRegistered, maleRate: maleTotal ? Math.round((maleRegistered / maleTotal) * 100) : 0,
      femaleTotal, femaleRegistered, femaleRate: femaleTotal ? Math.round((femaleRegistered / femaleTotal) * 100) : 0,
      byYear, currentSemRange,
    };
  }, [members, semNum]);

  const unregisteredMembers = useMemo(
    () => members.filter((m: any) => !isRegisteredForCurrentSem(m, semNum)),
    [members, semNum]
  );

  const genderData = genderBreakdown.filter(g => g.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Manual Registration Button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit overflow-x-auto">
        <button onClick={() => setActiveSubTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeSubTab === "overview" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <Activity size={16} /> Overview
        </button>
        <button onClick={() => setActiveSubTab("cohort")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeSubTab === "cohort" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <Layers size={16} /> Cohort Progression
        </button>
        <button onClick={() => setActiveSubTab("yearly")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeSubTab === "yearly" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <Trophy size={16} /> Yearly Comparison
        </button>
      </div>
      </div>

      {activeSubTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="rounded-xl p-4 text-white" style={{ backgroundColor: resolvedColor }}>
              <p className="text-3xl font-bold">{members.length}</p>
              <p className="text-xs opacity-80 font-medium mt-1">Total Members</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-baseline gap-1.5">
                <p className="text-3xl font-bold text-emerald-600">{registrationStats.registered}</p>
                <span className="text-sm text-slate-400">/ {registrationStats.total}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${registrationStats.rate}%`, backgroundColor: resolvedColor }} />
                </div>
                <span className="text-xs font-bold text-slate-500">{registrationStats.rate}%</span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">Current Registration</p>
            </div>
            <button onClick={() => setGenderModal("gent")}
              className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:ring-2 hover:ring-offset-1 hover:ring-blue-300 transition-all group">
              <p className="text-3xl font-bold text-blue-600">{registrationStats.maleTotal}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${registrationStats.maleRate}%` }} />
                </div>
                <span className="text-xs font-bold text-blue-500">{registrationStats.maleRate}%</span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {registrationStats.maleRegistered}/{registrationStats.maleTotal} registered
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-400 ml-1">— click to view</span>
              </p>
            </button>
            <button onClick={() => setGenderModal("lady")}
              className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:ring-2 hover:ring-offset-1 hover:ring-pink-300 transition-all group">
              <p className="text-3xl font-bold text-pink-600">{registrationStats.femaleTotal}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-pink-500 transition-all duration-500" style={{ width: `${registrationStats.femaleRate}%` }} />
                </div>
                <span className="text-xs font-bold text-pink-500">{registrationStats.femaleRate}%</span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {registrationStats.femaleRegistered}/{registrationStats.femaleTotal} registered
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-pink-400 ml-1">— click to view</span>
              </p>
            </button>
          </div>

          {/* Registration by Year */}
          {registrationStats.byYear.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Activity size={15} className="text-indigo-500" /> Registration by Year of Study
                <span className="text-xs font-normal text-slate-400 ml-1">(current: {registrationStats.currentSemRange})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {registrationStats.byYear.map((y) => (
                  <div key={y.label} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-slate-600 mb-2">{y.label}</p>
                    <p className="text-2xl font-bold text-slate-800">{y.registered}
                      <span className="text-sm font-normal text-slate-400"> / {y.total}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${y.total ? Math.round((y.registered / y.total) * 100) : 0}%`, backgroundColor: resolvedColor }} />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{y.total ? Math.round((y.registered / y.total) * 100) : 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
              {unregisteredMembers.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    <span className="font-semibold text-amber-600">{unregisteredMembers.length}</span> member{unregisteredMembers.length !== 1 ? "s" : ""} not yet registered this semester
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registration Trend */}
            {monthlyTrendData.length > 1 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <TrendingUp size={15} className="text-indigo-500" /> Registration Trend
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke={resolvedColor} strokeWidth={2} dot={{ r: 3, fill: resolvedColor }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Semester Fill Rate */}
            {semesterFillData.some(s => s.count > 0) && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <GraduationCap size={15} className="text-indigo-500" /> Semester Fill Rate
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={semesterFillData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="semester" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="count" fill={resolvedColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gender Distribution */}
            {genderData.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Users size={15} className="text-indigo-500" /> Gender Distribution
                </h3>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {genderData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Year Distribution */}
            {yearBreakdown.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <GraduationCap size={15} className="text-indigo-500" /> Members by Year of Study
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={yearBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="count" fill={resolvedColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "cohort" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Layers size={15} className="text-indigo-500" /> Cohort Progression — {jumuiyaName}
          </h3>
          {cohortData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users size={32} className="text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">No cohort data available yet.</p>
              <p className="text-slate-300 text-xs mt-1">Cohort data appears once members have semester registrations.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                {SEMESTER_LABELS.map((s, i) => (
                  <Line key={s} type="monotone" dataKey={s} stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} name={s} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {activeSubTab === "yearly" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Trophy size={15} className="text-indigo-500" /> Yearly Comparison — {jumuiyaName}
          </h3>
          {yearlyComparison.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar size={32} className="text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">No yearly data available yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill={resolvedColor} radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
      {/* Gender Member Modal */}
      {genderModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setGenderModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {genderModal === "gent" ? "Gents" : "Ladies"} Members — {jumuiyaName}
              </h3>
              <button onClick={() => setGenderModal(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Name</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Reg #</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Year</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Phone</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Source</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-500 text-xs uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.filter((m: any) => genderModal === "gent" ? isMale(m.gender) : isFemale(m.gender)).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">No members found.</td>
                    </tr>
                  ) : (
                    members.filter((m: any) => genderModal === "gent" ? isMale(m.gender) : isFemale(m.gender)).map((m: any, i: number) => (
                      <tr key={m.member_id || i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium text-slate-700">{m.first_name} {m.last_name}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono text-xs">{m.member_id || "—"}</td>
                        <td className="py-2 px-3 text-slate-500">{m.year_of_study || "—"}</td>
                        <td className="py-2 px-3 text-slate-500">{m.phone || "—"}</td>
                        <td className="py-2 px-3">
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${m.source === "csa" ? "bg-cyan-50 text-cyan-700" : "bg-indigo-50 text-indigo-700"}`}>
                            {m.source === "csa" ? "CSA" : "Jum"}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {(() => {
                            const col = semColForYearSem(m.year_of_study, semNum);
                            const regd = col ? (m[col] === true || m[col] === 1 || m[col] === "1" || m[col] === "true") : false;
                            return regd
                              ? <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Registered</span>
                              : <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Not Registered</span>;
                          })()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JumuiyaAnalyticsDashboard;
