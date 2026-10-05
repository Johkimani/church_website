import { useState, useEffect } from "react";
import { getSaintOfTheDay } from "../data/saintsData";
import { getLiturgicalSeason, getUpcomingFeasts, getLiturgicalYear } from "../data/liturgicalCalendar";
import { getDailyReadings } from "../services/dailyReadingsApi";
import type { DailyReadings } from "../data/readingsData";
import SaintOfTheDay from "../components/SaintOfTheDay";
import LiturgicalBanner from "../components/LiturgicalBanner";
import DailyMissal from "../components/DailyMissal";
import MarianImage from "../components/MarianImage";

export default function DailyLiturgy() {
  const today = new Date();
  const saint = getSaintOfTheDay(today);
  const season = getLiturgicalSeason(today);
  const liturgicalYear = getLiturgicalYear(today);
  const upcomingFeasts = getUpcomingFeasts(today);
  const [readings, setReadings] = useState<DailyReadings | null>(null);
  const [readingsLoading, setReadingsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDailyReadings(today);
        setReadings(data);
      } catch {
      } finally {
        setReadingsLoading(false);
      }
    }
    load();
  }, []);

  const celebration = `${season.label} — Year ${liturgicalYear}`;

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <MarianImage
            src="/images/mary-madonna.jpg"
            caption="Our Lady"
            size={76}
            href="/devotions/rosary"
          />
          <div className="flex-1 min-w-[220px]">
             <h1 className="text-2xl font-bold text-stone-900">Daily Liturgy</h1>
             <p className="text-sm text-stone-500 mt-1">
              {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Liturgical Year</p>
             <p className="text-lg font-bold text-amber-700">Year {liturgicalYear}</p>
          </div>
        </div>

        <LiturgicalBanner season={season} celebration={celebration} />

        <SaintOfTheDay saint={saint} />

        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm text-stone-500 hover:text-amber-600 transition-colors select-none">
            <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            What is the Daily Missal?
          </summary>
<div className="mt-3 bg-white rounded-xl border border-stone-200 p-5 text-sm text-stone-700 leading-relaxed">
            <p className="mb-2">
              The <strong className="text-stone-900">Daily Missal</strong> contains the Scripture readings for each day of the Catholic liturgical year — the same readings proclaimed at Mass worldwide. Each day typically includes a First Reading, Responsorial Psalm, and Gospel Reading.
            </p>
            <p className="mb-2">
              On Sundays and feast days, a <strong className="text-stone-900">Second Reading</strong> is added between the
              First Reading and the Psalm. The readings follow a three-year cycle: <strong className="text-amber-700">Year A</strong> (Matthew),
              <strong className="text-amber-700"> Year B</strong> (Mark), and <strong className="text-amber-700">Year C</strong> (Luke).
            </p>
            <p>
               Toggle between <strong className="text-amber-700">English</strong> and <strong className="text-amber-700">Kiswahili</strong>
              to read in either language. Each reading includes the official liturgical conclusion 
              ("The word of the Lord" / "Thanks be to God").
            </p>
          </div>
        </details>

        <div>
          <div className="flex items-center gap-3 mb-4">
             <h2 className="text-lg font-bold text-stone-900">Mass Readings</h2>
             <div className="flex-1 h-px bg-stone-200" />
          </div>
          {readingsLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
               <div key={i} className="rounded-[16px] bg-white overflow-hidden" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.05)" }}>
                   <div className="px-5 py-3 bg-stone-100 border-b border-stone-200"><div className="h-4 bg-stone-200 rounded w-24" /></div>
                   <div className="px-5 py-4 space-y-2">
                     <div className="h-3 bg-stone-200 rounded w-full" />
                     <div className="h-3 bg-stone-200 rounded w-5/6" />
                     <div className="h-3 bg-stone-200 rounded w-4/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DailyMissal initialReadings={readings || undefined} />
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
             <h2 className="text-lg font-bold text-stone-900">Upcoming Feasts</h2>
             <div className="flex-1 h-px bg-stone-200" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingFeasts.map((feast, i) => (
               <div
                 key={i}
className="bg-white rounded-[16px] px-4 py-3 flex items-center justify-between transition-all duration-200 hover:scale-[1.02]"
                 style={{
                   boxShadow:
                     "0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.05)",
                   border: "1px solid rgba(28,25,23,0.08)",
                 }}
               >
                 <div>
                   <p className="text-sm font-medium text-stone-700">{feast.name}</p>
                   <p className="text-xs text-stone-500">
                    {feast.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-indigo-600">{feast.daysUntil}</p>
                  <p className="text-[10px] text-stone-500 uppercase tracking-wider">days</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
