import { useCallback, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { fetchPublishedComparison, fetchComparisonOptions } from "../../../api/axiosInstance";
import type { JumuiData } from "../../../interface/api";
import { Trophy, Award, Medal, Activity, Sparkles, CalendarRange } from "lucide-react";

const JUMUIYA_META: Record<string, { name: string; shortName: string; color: string }> = {
  "st-anthony": { name: "St. Anthony of Padua", shortName: "St. Anthony", color: "#8b5cf6" },
  "st-augustine": { name: "St. Augustine", shortName: "St. Augustine", color: "#3b82f6" },
  "st-catherine": { name: "St. Catherine of Alexandria", shortName: "St. Catherine", color: "#b91c1c" },
  "st-dominic": { name: "St. Dominic", shortName: "St. Dominic", color: "#64748b" },
  "st-elizabeth": { name: "St. Elizabeth of Hungary", shortName: "St. Elizabeth", color: "#16a34a" },
  "st-maria-goretti": { name: "St. Maria Goretti", shortName: "St. Maria Goretti", color: "#0ea5e9" },
  "st-monica": { name: "St. Monica", shortName: "St. Monica", color: "#ea580c" },
};

function formatJumuiyaName(idOrSlug: string, short = false, apiName?: string): string {
  if (apiName) return short ? apiName.split(" of ")[0] : apiName;
  if (!idOrSlug) return "General Jumuiya";
  const key = idOrSlug.toLowerCase().trim();

  if (JUMUIYA_META[key]) {
    return short ? JUMUIYA_META[key].shortName : JUMUIYA_META[key].name;
  }

  for (const [k, meta] of Object.entries(JUMUIYA_META)) {
    if (key.includes(k) || k.includes(key)) {
      return short ? meta.shortName : meta.name;
    }
  }

  const clean = idOrSlug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return clean.length > 25 ? "Jumuiya" : clean;
}

function getJumuiyaColor(idOrSlug: string, apiName?: string): string {
  const candidates = [idOrSlug, apiName].filter(Boolean);
  for (const c of candidates) {
    const key = String(c).toLowerCase().trim();
    if (JUMUIYA_META[key]) return JUMUIYA_META[key].color;
    for (const [k, meta] of Object.entries(JUMUIYA_META)) {
      if (key.includes(k) || k.includes(key)) return meta.color;
      if (key.includes(meta.name.toLowerCase())) return meta.color;
      if (key.includes(meta.shortName.toLowerCase())) return meta.color;
    }
  }

  const fallbackColors = ["#8b5cf6", "#3b82f6", "#b91c1c", "#64748b", "#16a34a", "#0ea5e9", "#ea580c"];
  let hash = 0;
  const src = String(idOrSlug || "");
  for (let i = 0; i < src.length; i++) hash = src.charCodeAt(i) + ((hash << 5) - hash);
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

type FilterMode = "all" | "week" | "semester" | "year";

interface WeekOption {
  weekStart: string;
  weekEnd: string;
}
interface SemesterOption {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}
interface YearOption {
  year: string;
  startDate: string;
  endDate: string;
}

export default function JumuiComparison() {
  const [data, setData] = useState<JumuiData[]>([]);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [options, setOptions] = useState<{
    weeks: WeekOption[];
    semesters: SemesterOption[];
    academicYears: YearOption[];
  }>({ weeks: [], semesters: [], academicYears: [] });

  const [mode, setMode] = useState<FilterMode>("all");
  const [weekFilter, setWeekFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  useEffect(() => {
    fetchComparisonOptions()
      .then((res) => {
        setOptions({
          weeks: res.data?.weeks || [],
          semesters: res.data?.semesters || [],
          academicYears: res.data?.academicYears || [],
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const activeRange = useCallback((): { from: string; to: string } | null => {
    if (mode === "week" && weekFilter) {
      const w = options.weeks.find((x) => x.weekStart === weekFilter);
      return w ? { from: w.weekStart, to: w.weekEnd } : null;
    }
    if (mode === "semester" && semesterFilter) {
      const s = options.semesters.find((x) => String(x.id) === String(semesterFilter));
      return s ? { from: s.startDate, to: s.endDate } : null;
    }
    if (mode === "year" && yearFilter) {
      const y = options.academicYears.find((x) => x.year === yearFilter);
      return y ? { from: y.startDate, to: y.endDate } : null;
    }
    return null;
  }, [mode, weekFilter, semesterFilter, yearFilter, options]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const range = activeRange();
        const res = range
          ? await fetchPublishedComparison({ from: range.from, to: range.to })
          : await fetchPublishedComparison();
        const raw = Array.isArray(res.data?.data) ? res.data.data : [];
        setData(raw);
        setPublishedAt(res.data?.publishedAt || null);
        setWeekStart(res.data?.weekStart || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeRange]);

  const selectMode = (m: FilterMode) => {
    setMode(m);
    if (m === "week" && !weekFilter && options.weeks[0]) setWeekFilter(options.weeks[0].weekStart);
    if (m === "semester" && !semesterFilter && options.semesters[0]) setSemesterFilter(String(options.semesters[0].id));
    if (m === "year" && !yearFilter && options.academicYears[0]) setYearFilter(options.academicYears[0].year);
  };

  const clearFilters = () => {
    setMode("all");
    setWeekFilter("");
    setSemesterFilter("");
    setYearFilter("");
  };

  const activeSemester = options.semesters.find((s) => String(s.id) === String(semesterFilter));

  const rangeLabel = (() => {
    if (mode === "week" && weekFilter) {
      const w = options.weeks.find((x) => x.weekStart === weekFilter);
      return w ? `Week of ${fmtDate(w.weekStart)} – ${fmtDate(w.weekEnd)}` : null;
    }
    if (mode === "semester" && activeSemester) {
      return activeSemester.label || `Semester ${fmtDate(activeSemester.startDate)} – ${fmtDate(activeSemester.endDate)}`;
    }
    if (mode === "year" && yearFilter) return `Academic Year ${yearFilter}`;
    return null;
  })();

  const weekLabel = rangeLabel
    ? `${rangeLabel} · Live`
    : weekStart
      ? `Week of ${fmtDate(weekStart)}`
      : publishedAt
        ? `Snapshot: ${new Date(publishedAt).toLocaleDateString()}`
        : "Live Data Active";

  const formattedChartData = data.map((j) => ({
    ...j,
    displayName: formatJumuiyaName(j._id, true, j.name),
    fullName: formatJumuiyaName(j._id, false, j.name),
    color: getJumuiyaColor(j._id, j.name || undefined),
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-stone-500">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  const filterButton = (m: FilterMode, label: string) => (
    <button
      onClick={() => selectMode(m)}
      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
        mode === m
          ? "bg-amber-600 text-white border-amber-600 shadow-sm"
          : "bg-white text-stone-600 border-stone-200 hover:border-amber-400"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 p-6 sm:p-10 font-sans pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[10px] font-bold uppercase tracking-widest mb-2">
              <Sparkles size={12} />
              Spiritual Knowledge Leaderboard
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Jumuiya <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Performance</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-stone-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-stone-600 font-medium">
              {weekLabel}
            </span>
          </div>
        </div>

        {/* Filter module */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <CalendarRange size={15} className="text-amber-600" />
              <span className="text-xs font-black text-stone-600 uppercase tracking-widest">Filter</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {filterButton("all", "All Time")}
              {filterButton("week", "Week")}
              {filterButton("semester", "Semester")}
              {filterButton("year", "Academic Year")}
            </div>
            <div className="flex-1 flex items-center gap-2 min-w-[220px] lg:justify-end">
              {mode === "week" && (
                <select
                  value={weekFilter}
                  onChange={(e) => setWeekFilter(e.target.value)}
                  className="w-full lg:w-64 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {options.weeks.length === 0 && <option value="">No weeks with attempts yet</option>}
                  {options.weeks.map((w) => (
                    <option key={w.weekStart} value={w.weekStart}>
                      Week of {fmtDate(w.weekStart)} – {fmtDate(w.weekEnd)}
                    </option>
                  ))}
                </select>
              )}
              {mode === "semester" && (
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="w-full lg:w-64 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {options.semesters.length === 0 && <option value="">No semesters configured yet</option>}
                  {options.semesters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label || `${fmtDate(s.startDate)} – ${fmtDate(s.endDate)}`}
                      {s.isCurrent ? " (Current)" : ""}
                    </option>
                  ))}
                </select>
              )}
              {mode === "year" && (
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full lg:w-64 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {options.academicYears.length === 0 && <option value="">No academic years yet</option>}
                  {options.academicYears.map((y) => (
                    <option key={y.year} value={y.year}>
                      {y.year}
                    </option>
                  ))}
                </select>
              )}
              {mode !== "all" && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-bold text-amber-700 hover:text-amber-900 whitespace-nowrap"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
          {mode !== "all" && (
            <p className="text-[10px] text-stone-400 mt-2 ml-[22px]">
              Showing live per-jumuiya accuracy for {rangeLabel || "the selected period"}. Adjusts automatically as members answer.
            </p>
          )}
        </div>

        {formattedChartData.length === 0 ? (
          <div className="text-stone-500 text-center py-24 bg-white rounded-3xl border border-stone-200">
            <Activity className="w-10 h-10 mx-auto mb-3 text-stone-500" />
            <p className="text-sm font-semibold">No Jumuiya attempt stats recorded for this period.</p>
            <p className="text-xs text-stone-500 mt-1">Pick another period, or complete this week's liturgical challenge to see standings update.</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {formattedChartData.slice(0, 3).map((j, i) => {
                const RankIcon = i === 0 ? Trophy : i === 1 ? Award : Medal;
                const badgeColor = i === 0 ? "from-amber-500 to-amber-700" : i === 1 ? "from-slate-400 to-slate-600" : "from-amber-700 to-orange-900";

                return (
                  <div
                    key={j._id}
                    className={`relative p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 bg-white ${
                      i === 0 ? "border-amber-500/50 shadow-lg shadow-amber-500/10" : "border-stone-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white bg-gradient-to-r ${badgeColor}`}>
                        <RankIcon size={12} />
                        Rank #{i + 1}
                      </span>
                      <span className="text-xs font-semibold text-stone-500">{j.totalAttempts} members participated</span>
                    </div>
                    <h3 className="font-bold text-lg text-stone-900 mb-1 truncate">{j.fullName}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-black text-amber-600">{j.accuracy?.toFixed(1)}%</span>
                      <span className="text-xs text-stone-500 font-semibold">accuracy</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recharts Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 mb-8">
              <h3 className="text-sm font-bold text-stone-600 mb-6 uppercase tracking-wider">Accuracy Comparison Across 7 Jumuiyas (%)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="displayName"
                    tick={{ fill: "#78716C", fontSize: 11, fontWeight: 600 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: "#78716C", fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid rgba(28,25,23,0.1)", color: "#1c1917" }}
                    formatter={(value: any) => [`${value?.toFixed(1)}% Accuracy`, "Performance"]}
                    labelFormatter={(label) => `Jumuiya: ${label}`}
                  />
                  <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                    {formattedChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100 text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4">Rank</th>
                    <th className="py-3.5 px-4">Jumuiya Name</th>
                    <th className="py-3.5 px-4 text-center">Accuracy</th>
                    <th className="py-3.5 px-4 text-center">Members Participated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-900">
                  {formattedChartData.map((j, index) => (
                    <tr key={j._id} className="hover:bg-stone-100 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-stone-500">#{index + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-stone-900 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: j.color }} />
                        {j.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-amber-600">{j.accuracy?.toFixed(1)}%</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-stone-500">{j.totalAttempts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
