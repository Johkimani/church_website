import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { fetchPublishedComparison } from "../../../api/axiosInstance";
import type { JumuiData } from "../../../interface/api";
import { Trophy, Award, Medal, Activity, Sparkles } from "lucide-react";

const JUMUIYA_META: Record<string, { name: string; shortName: string; color: string }> = {
  "st-anthony": { name: "St. Anthony of Padua", shortName: "St. Anthony", color: "#8b5cf6" },
  "st-augustine": { name: "St. Augustine", shortName: "St. Augustine", color: "#3b82f6" },
  "st-catherine": { name: "St. Catherine of Alexandria", shortName: "St. Catherine", color: "#b91c1c" },
  "st-dominic": { name: "St. Dominic", shortName: "St. Dominic", color: "#64748b" },
  "st-elizabeth": { name: "St. Elizabeth of Hungary", shortName: "St. Elizabeth", color: "#16a34a" },
  "st-maria-goretti": { name: "St. Maria Goretti", shortName: "St. Maria Goretti", color: "#0ea5e9" },
  "st-monica": { name: "St. Monica", shortName: "St. Monica", color: "#ea580c" },
};

function formatJumuiyaName(id: string, short = false): string {
  if (JUMUIYA_META[id]) return short ? JUMUIYA_META[id].shortName : JUMUIYA_META[id].name;
  if (!id) return "General Jumuiya";
  return id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getJumuiyaColor(id: string): string {
  return JUMUIYA_META[id]?.color || "#6366f1";
}

export default function JumuiComparison() {
  const [data, setData] = useState<JumuiData[]>([]);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchPublishedComparison();
        const raw = Array.isArray(res.data?.data) ? res.data.data : [];
        setData(raw);
        setPublishedAt(res.data?.publishedAt || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formattedChartData = data.map((j) => ({
    ...j,
    displayName: formatJumuiyaName(j._id, true),
    fullName: formatJumuiyaName(j._id, false),
    color: getJumuiyaColor(j._id),
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-white p-6 sm:p-10 font-sans pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-2">
              <Sparkles size={12} />
              Spiritual Knowledge Leaderboard
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Jumuiya <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Performance</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-slate-300 font-medium">
              {publishedAt ? `Snapshot: ${new Date(publishedAt).toLocaleDateString()}` : "Live Data Active"}
            </span>
          </div>
        </div>

        {formattedChartData.length === 0 ? (
          <div className="text-slate-500 text-center py-24 bg-slate-900/50 rounded-3xl border border-slate-800">
            <Activity className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-semibold">No Jumuiya attempt stats recorded yet.</p>
            <p className="text-xs text-slate-600 mt-1">Complete daily liturgical challenges to see standings update.</p>
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
                    className={`relative p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 bg-slate-900/80 backdrop-blur-md ${
                      i === 0 ? "border-amber-500/50 shadow-lg shadow-amber-500/10" : "border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white bg-gradient-to-r ${badgeColor}`}>
                        <RankIcon size={12} />
                        Rank #{i + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{j.totalAttempts} attempts</span>
                    </div>
                    <h3 className="font-bold text-lg text-white mb-1 truncate">{j.fullName}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-black text-amber-400">{j.accuracy?.toFixed(1)}%</span>
                      <span className="text-xs text-slate-400 font-semibold">accuracy</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recharts Bar Chart */}
            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-3xl border border-slate-800/80 mb-8">
              <h3 className="text-sm font-bold text-slate-300 mb-6 uppercase tracking-wider">Overall Accuracy Comparison</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="displayName"
                    tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #334155", color: "#fff" }}
                    formatter={(val: number) => [`${val?.toFixed(1)}% Accuracy`, "Performance"]}
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
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-700/50">
                  <tr>
                    <th className="py-3.5 px-4">Rank</th>
                    <th className="py-3.5 px-4">Jumuiya Name</th>
                    <th className="py-3.5 px-4 text-center">Accuracy</th>
                    <th className="py-3.5 px-4 text-center">Total Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {formattedChartData.map((j, index) => (
                    <tr key={j._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-400">#{index + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: j.color }} />
                        {j.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-amber-400">{j.accuracy?.toFixed(1)}%</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-400">{j.totalAttempts}</td>
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

