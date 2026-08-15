import { useState, useEffect } from "react";
import { memberService } from "../../../api/jumuiyaMemberService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { GitCompare, RefreshCw, ChevronDown, Calendar } from "lucide-react";

const YEAR_COLORS: Record<number, string> = {
  1: "#22c55e",
  2: "#3b82f6",
  3: "#8b5cf6",
  4: "#ef4444",
};

const YEAR_NAMES: Record<number, string> = {
  1: "Year 1",
  2: "Year 2",
  3: "Year 3",
  4: "Year 4",
};

const SEMESTERS = ["1.1", "1.2", "2.1", "2.2", "3.1", "3.2", "4.1", "4.2"];

function getDisplayShort(c: any): string {
  return YEAR_NAMES[c.yearLevel] ?? `Year ${c.yearLevel}`;
}

function getCohortColor(c: any): string {
  return YEAR_COLORS[c.yearLevel] ?? "#6366f1";
}

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => currentYear - 14 + i);

export default function CrossComparisonTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSem, setSelectedSem] = useState("1.1");
  const [fromYear, setFromYear] = useState(currentYear - 3);
  const [toYear, setToYear] = useState(currentYear);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await memberService.getCohortAnalytics();
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load cohort data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  if (!data || !data.cohorts) return null;

  const { cohorts } = data;
  const sorted = [...cohorts]
    .filter((c: any) => c.admissionYear >= fromYear && c.admissionYear <= toYear)
    .sort((a: any, b: any) => a.yearLevel - b.yearLevel);

  const selectedSemData = sorted.map((c: any) => {
    const semData = c.semesters.find((s: any) => s.sem === selectedSem);
    return {
      cohort: getDisplayShort(c),
      count: semData?.count || 0,
      pct: semData?.pct || 0,
      color: getCohortColor(c),
    };
  });

  const CohortBar = ({ color, label }: { color: string; label: string }) => (
    <div className="flex items-center gap-2 text-[11px] text-slate-500">
      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Year Range Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-slate-200 p-3">
        <Calendar size={16} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-700">Admission Year</span>
        <select
          value={fromYear}
          onChange={e => setFromYear(parseInt(e.target.value))}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {YEAR_OPTIONS.filter(y => y <= toYear).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <span className="text-sm text-slate-400">to</span>
        <select
          value={toYear}
          onChange={e => setToYear(parseInt(e.target.value))}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {YEAR_OPTIONS.filter(y => y >= fromYear).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {(fromYear !== currentYear - 3 || toYear !== currentYear) && (
          <button
            onClick={() => { setFromYear(currentYear - 3); setToYear(currentYear); }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-xl border border-slate-200">
          <GitCompare size={32} className="text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">No cohorts found for the selected year range</p>
        </div>
      ) : (
      <>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitCompare size={18} className="text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">Cross-Cohort Comparison</h3>
          </div>
          <div className="relative">
            <select
              value={selectedSem}
              onChange={e => setSelectedSem(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {SEMESTERS.map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Comparing registration rates across year levels for <strong className="text-slate-600">Semester {selectedSem}</strong>
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={selectedSemData} margin={{ top: 15, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="cohort" tick={{ fontSize: 12, fill: '#475569' }} stroke="#cbd5e1" />
            <YAxis
              tick={{ fontSize: 12, fill: '#334155' }}
              stroke="#cbd5e1"
              domain={[0, 100]}
              width={45}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              formatter={(value: any, _: any, props: any) => [`${props.payload.count} members (${value}%)`, props.payload.cohort]}
            />
            <Bar dataKey="pct" radius={[6, 6, 0, 0]} name="Registration Rate" barSize={60}>
              {selectedSemData.map((entry: any, index: number) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 justify-center">
          {sorted.map((c: any) => (
            <CohortBar key={c.label} color={getCohortColor(c)} label={getDisplayShort(c)} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitCompare size={18} className="text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800">All Semesters — Year Level Comparison Grid</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SEMESTERS.map((sem) => {
            const maxVal = Math.max(...sorted.map((c: any) => {
              const sd = c.semesters.find((s: any) => s.sem === sem);
              return sd?.pct || 0;
            }), 1);

            return (
              <div key={sem} className="border border-slate-100 rounded-xl p-3">
                <p className="text-xs font-bold text-slate-600 mb-2 text-center">Semester {sem}</p>
                <div className="space-y-1.5">
                  {sorted.map((c: any) => {
                    const sd = c.semesters.find((s: any) => s.sem === sem);
                    const pct = sd?.pct || 0;
                    const color = getCohortColor(c);
                    return (
                      <div key={c.label} className="relative h-5 flex items-center">
                        <div
                          className="absolute left-0 top-0 h-full rounded-r-md transition-all duration-500 flex items-center px-1.5"
                          style={{
                            width: `${Math.min((pct / maxVal) * 100, 100)}%`,
                            backgroundColor: color,
                            opacity: pct > 0 ? 0.85 : 0,
                          }}
                        />
                        <span className="relative z-10 text-[9px] font-semibold ml-1 text-slate-700">
                          {pct > 0 ? `${pct}%` : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-100 text-[8px] text-slate-400">
                  {sorted.map((c: any) => {
                    const color = getCohortColor(c);
                    return (
                      <div key={c.label} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span>{getDisplayShort(c)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
