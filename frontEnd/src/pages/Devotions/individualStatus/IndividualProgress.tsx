import { useEffect, useState } from "react";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart
} from "recharts";
import { fetchPublishedMemberProgress } from "../../../api/axiosInstance";
import { useAuth } from "../../../context/AuthContext";

interface WeekEntry {
  week: number;
  totalAttempts: number;
  correctAttempts: number;
}

interface SummaryEntry {
  totalAttempts: number;
  correctAttempts: number;
}

// Encouragement messages based on accuracy
function getEncouragement(accuracy: number): { emoji: string; verse: string; msg: string } {
  if (accuracy >= 80) return {
    emoji: "",
    verse: "\"Well done, good and faithful servant.\" — Matthew 25:21",
    msg: "Outstanding! Keep shining in your faith walk.",
  };
  if (accuracy >= 60) return {
    emoji: "",
    verse: "\"I press on toward the goal.\" — Philippians 3:14",
    msg: "Great progress — your perseverance is an inspiration.",
  };
  if (accuracy >= 40) return {
    emoji: "",
    verse: "\"Faith as small as a mustard seed.\" — Matthew 17:20",
    msg: "You're growing! Every attempt builds wisdom.",
  };
  return {
    emoji: "",
    verse: "\"Ask and it shall be given to you.\" — Matthew 7:7",
    msg: "Keep showing up — your journey is just beginning.",
  };
}

// Radial accuracy ring component
function AccuracyRing({ accuracy }: { accuracy: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;
  const color = accuracy >= 80 ? "#22c55e" : accuracy >= 60 ? "#f59e0b" : accuracy >= 40 ? "#3b82f6" : "#e11d48";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 128, height: 128 }}>
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-800">{accuracy.toFixed(0)}%</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Accuracy</span>
      </div>
    </div>
  );
}

// Week bar entry
function WeekBar({ label, accuracy, maxAcc }: { label: string; accuracy: number; maxAcc: number }) {
  const pct = maxAcc > 0 ? (accuracy / maxAcc) * 100 : 0;
  const color = accuracy >= 70 ? "#22c55e" : accuracy >= 45 ? "#f59e0b" : "#f87171";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-slate-400 w-14 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-slate-600 w-10 shrink-0">{accuracy}%</span>
    </div>
  );
}

// Custom recharts tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-amber-100 rounded-2xl px-4 py-3 shadow-xl text-left">
        <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-slate-900">{payload[0].value}%</p>
        <p className="text-xs text-slate-400 font-medium">Accuracy</p>
      </div>
    );
  }
  return null;
}

export default function MemberDashboard() {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<WeekEntry[]>([]);
  const [summary, setSummary] = useState<SummaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const firstName = user?.name?.split(" ")[0] || "Pilgrim";

  const chartData = weeks.map((w) => ({
    name: weeks.length <= 1 ? "This Week" : `Week ${w.week}`,
    accuracy: w.totalAttempts ? Math.round((w.correctAttempts / w.totalAttempts) * 100) : 0,
    attempts: w.totalAttempts,
    correct: w.correctAttempts,
  }));

  const accuracy = summary?.totalAttempts
    ? (summary.correctAttempts / summary.totalAttempts) * 100
    : 0;

  const encouragement = getEncouragement(accuracy);

  const wrongAnswers = (summary?.totalAttempts || 0) - (summary?.correctAttempts || 0);
  const maxAcc = Math.max(...chartData.map((d) => d.accuracy), 1);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchPublishedMemberProgress();
        const body = res.data;
        setWeeks(Array.isArray(body?.weeks) ? body.weeks : []);
        setSummary(body?.summary || null);
      } catch (err) {
        console.error("Failed to load published progress:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-amber-200" />
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-xl"></span>
          </div>
          <p className="text-sm font-semibold text-amber-700 tracking-wide">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f2] pb-28" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Subtle texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{ backgroundImage: "radial-gradient(ellipse at 70% 0%, #fef3c7 0%, transparent 60%), radial-gradient(ellipse at 10% 90%, #dbeafe 0%, transparent 55%)" }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16">

        <div className="mb-8">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-[0.25em] mb-2">Your Spiritual Journey</p>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            Welcome back,{" "}
            <span className="text-amber-600">{firstName}</span> {encouragement.emoji}
          </h1>
          {summary && (
            <p className="text-sm text-slate-500 mt-2 italic leading-relaxed max-w-md">
              {encouragement.verse}
            </p>
          )}
        </div>

        {!summary ? (
          <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-12 text-center">
            <div className="text-5xl mb-5"></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">No Progress Recorded Yet</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
              Complete the weekly liturgical challenge and the liturgist will publish your progress here.
            </p>
            <div className="mt-6 inline-block px-5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700">
              Start this week's challenge to begin your journey
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 mb-6 text-white shadow-lg shadow-amber-200/60">
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Liturgist's Note</p>
              <p className="font-semibold text-sm leading-relaxed">{encouragement.msg}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* Total attempts */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                <div className="text-2xl mb-1"></div>
                <p className="text-2xl font-black text-slate-900">{summary.totalAttempts}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Attempts</p>
              </div>
              {/* Correct */}
              <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 text-center">
                <div className="text-2xl mb-1"></div>
                <p className="text-2xl font-black text-emerald-700">{summary.correctAttempts}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Correct</p>
              </div>
              {/* Wrong */}
              <div className="bg-white rounded-2xl border border-red-50 shadow-sm p-4 text-center">
                <div className="text-2xl mb-1"></div>
                <p className="text-2xl font-black text-red-500">{wrongAnswers}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Review</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <AccuracyRing accuracy={accuracy} />
              </div>
              <div className="flex-1 w-full space-y-3">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Weekly Breakdown</p>
                {chartData.length > 0 ? (
                  chartData.map((d) => (
                    <WeekBar key={d.name} label={d.name} accuracy={d.accuracy} maxAcc={maxAcc} />
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No weekly data yet.</p>
                )}
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-black text-slate-900">Accuracy Trend</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Your journey week by week</p>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold">
                    Latest Published Week
                  </span>
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8f8f8" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#progressGrad)"
                        dot={{ fill: "#f59e0b", strokeWidth: 2, r: 5, stroke: "#fff" }}
                        activeDot={{ r: 7, stroke: "#f59e0b", strokeWidth: 2, fill: "#fff" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 text-center">
              <p className="text-amber-800 font-semibold text-sm leading-relaxed italic">
                "Do not be conformed to this world, but be transformed by the renewing of your mind."
              </p>
              <p className="text-xs text-amber-600 font-bold mt-2">— Romans 12:2</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
