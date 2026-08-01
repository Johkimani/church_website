import { useState } from "react";
import type { Saint } from "../data/saintsData";

interface SaintOfTheDayProps {
  saint: Saint;
}

export default function SaintOfTheDay({ saint }: SaintOfTheDayProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-[22px] bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
      onClick={() => setExpanded(!expanded)}
      style={{
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 30px -4px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.05)",
      }}
    >
      <div className={`bg-gradient-to-br ${saint.imageGradient} p-6 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3)_0%,transparent_60%)] pointer-events-none" />
        <div className="flex items-start gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-2xl font-bold text-white drop-shadow-md">{saint.symbol}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
              Saint of the Day
            </p>
            <h3 className="text-xl font-bold text-white leading-tight drop-shadow-sm">{saint.name}</h3>
            <p className="text-sm text-white/80 mt-0.5 italic">{saint.feastName}</p>
          </div>
          {saint.canonization && (
            <div className="hidden sm:flex items-center bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
                {saint.canonization}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-3">
        <p className={`text-sm text-slate-700 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
          {saint.biography}
        </p>

        <div className="bg-amber-50 border-l-4 border-amber-300 rounded-r-lg p-4">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">Quote</p>
          <p className="text-sm text-amber-900 italic leading-relaxed">&ldquo;{saint.quote}&rdquo;</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {saint.patronage}
          </span>
          {saint.bornDied && (
            <span className="inline-flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {saint.bornDied}
            </span>
          )}
        </div>

        <button
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          {expanded ? "Show less" : "Read more"}
          <svg
            className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
