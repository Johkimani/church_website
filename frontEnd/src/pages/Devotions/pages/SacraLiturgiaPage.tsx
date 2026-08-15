import { useState } from "react";
import MarianImage from "../components/MarianImage";

export default function SacraLiturgiaPage() {
  const [_activeSeason, setActiveSeason] = useState("advent");
  const [_activeTab, setActiveTab] = useState("intro");

  const seasons = [
    { id: "advent", name: "ADVENT", roman: "I", color: "#4A2E80", active: true },
    { id: "christmas", name: "CHRISTMAS", roman: "II", color: "#D4AF37", active: false },
    { id: "ordinary1", name: "ORDINARY TIME I", roman: "III", color: "#2E6B40", active: false },
    { id: "lent", name: "LENT", roman: "IV", color: "#3B1F52", active: false },
    { id: "triduum", name: "TRIDUUM / EASTER", roman: "V", color: "#D4AF37", active: false },
    { id: "ordinary2", name: "ORDINARY TIME II", roman: "VI", color: "#2E6B40", active: false },
  ];

  const massSteps = [
    { num: "I", title: "INTRODUCTORY RITES", icon: "🚶", subtitle: "The Entrance Procession", detail: "Music: O Come, O Come, Emmanuel" },
    { num: "II", title: "THE GREETING", icon: "🤝", subtitle: "Priest says 'Grace to you...'", detail: null, response: "And with your spirit." },
    { num: "III", title: "PENITENTIAL ACT", icon: "🙏", subtitle: "Confiteor", detail: "I confess to almighty God..." },
    { num: "IV", title: "KYRIE ELEISON", icon: "🎵", subtitle: "Lord, have mercy", detail: "Kyrie Eleison — Christe Eleison — Kyrie Eleison" },
  ];

  return (
    <div className="w-full min-h-screen bg-transparent font-sans">
      <header className="sticky top-16 lg:top-20 z-30 bg-white/90 backdrop-blur-xl border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow">
                <span className="text-white text-xs">✝</span>
              </div>
              <div>
                <h1 className="text-xs font-bold text-stone-900 tracking-[0.2em] uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                  SACRA LITURGIA
                </h1>
                <p className="text-[9px] text-stone-500 tracking-[0.3em] uppercase">Catholic Faith Guide</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {["LITURGICAL YEAR", "ORDER OF MASS", "SACRAMENTS"].map((item) => (
                <a key={item} href="#" className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 hover:text-amber-600 transition-colors duration-200 border-b-2 border-transparent hover:border-amber-600 pb-0.5">
                  {item}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>
          JOURNEY THROUGH THE LITURGICAL YEAR
        </h2>
        <p className="text-sm text-stone-500 mt-2 max-w-lg mx-auto leading-relaxed">
          Exploring the Mysteries of Salvation History and Catholic Worship. Use the timeline to navigate the seasons.
        </p>
        <div className="mt-6 flex justify-center">
          <MarianImage
            src="/images/mary-annunciation.jpg"
            caption="Mary at the Annunciation"
            size={92}
            href="/devotions/rosary"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative flex items-center gap-2 overflow-x-auto sm:overflow-visible sm:justify-between px-1 pb-2 hide-scrollbar">
          <div className="hidden sm:block absolute top-5 left-4 right-4 h-[2px] bg-amber-500/20" />

          {seasons.map((season, index) => (
            <div key={season.id} className="relative z-10 flex flex-col items-center flex-1 min-w-[100px] sm:min-w-0">
              {index < seasons.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-[2px] bg-amber-500/10" />
              )}

              <button
                onClick={() => setActiveSeason(season.id)}
                className={`relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-full border-2 transition-all duration-300 cursor-pointer shrink-0 ${
                  season.active ? "shadow-lg scale-105" : "bg-white border-stone-300 hover:border-amber-500"
                }`}
                style={
                  season.active
                    ? {
                        background: season.color === "#D4AF37" ? "rgba(212,175,55,0.1)" : `${season.color}12`,
                        borderColor: season.color,
                        boxShadow: `0 4px 16px ${season.color}18`,
                      }
                    : {}
                }
              >
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: season.active ? season.color : "#78716C" }}>
                  {season.roman}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-center leading-tight" style={{ color: season.active ? season.color : "#57534E" }}>
                  {season.name}
                </span>
                {season.active && (
                  <span className="mt-0.5 px-2 py-0.5 bg-amber-500 text-white rounded-full text-[8px] font-black uppercase tracking-wider">
                    ACTIVE
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            <div className="lg:col-span-2">
              <div className="h-40 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #4A2E80 0%, #3B1F52 50%, #2D1340 100%)" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white/80 text-5xl">✝</div>
                </div>
                <div className="absolute bottom-3 left-5">
                  <span className="px-2.5 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[9px] font-bold uppercase tracking-wider text-white">
                    LITURGICAL SEASON
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Liturgical Color</span>
                  <span className="text-sm font-semibold text-stone-700 ml-auto">Violet</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Duration</span>
                  <span className="text-sm font-semibold text-stone-700 ml-auto">4 Weeks</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Significance</span>
                  <span className="text-sm font-semibold text-stone-700 ml-auto">Preparation &amp; Hope</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Scripture Focus</span>
                  <span className="text-sm font-semibold text-stone-700 ml-auto">Isaiah, John Baptist</span>
                </div>

                <div className="flex justify-center pt-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                    <span className="text-amber-600 text-base">📜</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 p-5">
              <div className="flex gap-1 mb-5 bg-stone-100 rounded-2xl p-1 border border-stone-200">
                {["INTRO RITES", "WORD", "EUCHARIST"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "_"))}
                    className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                      tab === "INTRO RITES"
                        ? "bg-amber-600 text-white shadow"
                        : "text-stone-500 hover:text-amber-600 hover:bg-stone-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {massSteps.map((step) => (
                  <div key={step.num} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                    <div className="flex items-center gap-3 p-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">
                        {step.num}
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-base shadow-sm">
                        {step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-stone-700">{step.title}</h4>
                        <p className="text-[10px] text-stone-500 mt-0.5">{step.subtitle}</p>
                      </div>
                      <span className="flex-shrink-0 text-stone-400 text-xs">▸</span>
                    </div>
                    <div className="px-3.5 pb-3 pt-0 ml-[52px]">
                      <div className="bg-stone-100 rounded-xl px-3 py-2.5 border border-stone-200">
                        <p className="text-[11px] text-stone-600 leading-relaxed">{step.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-gradient-to-r from-amber-100 to-orange-50 rounded-2xl p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-600 text-xs">✝</span>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">Congregational Response</h4>
                    <blockquote className="text-stone-600 italic text-xs border-l-2 border-amber-500 pl-3 leading-relaxed">
                      "And with your spirit." — The people's response to the priest's greeting, expressing the communion of the Church.
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden">
            <div className="p-5">
              <h3 className="text-sm font-bold text-stone-900 tracking-wide uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                Sacraments of Initiation
              </h3>
              <p className="text-xs text-stone-500 mt-1 mb-4">The foundation of Christian life.</p>

              <div className="flex gap-2 mb-5">
                <button className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-200">Baptism</button>
                <button className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-stone-700 border border-stone-300 shadow-sm">Confirmation</button>
                <button className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">Eucharist</button>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: "Baptism", color: "#4A2E80", desc: "Water — I baptize you in the name of the Father, and of the Son, and of the Holy Spirit" },
                  { name: "Confirmation", color: "#FFFFFF", desc: "Sacred Chrism — Be sealed with the Gift of the Holy Spirit" },
                  { name: "Eucharist", color: "#2E6B40", desc: "Bread &amp; Wine — This is my Body... This is the chalice of my Blood" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow" style={{ background: s.color }}>
                      ✝
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-stone-700">{s.name}</div>
                      <div className="text-[9px] text-stone-500 italic">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-stone-100 to-stone-200 rounded-3xl border border-stone-200 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200/40 to-transparent" />

            <div className="relative z-10 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-600 text-xs">🕯</span>
                </div>
                <h3 className="text-sm font-bold text-stone-900 tracking-wide uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
                  Votive Lights &amp; Prayer
                </h3>
              </div>

              <p className="text-stone-600 text-xs leading-relaxed mb-4">
                Light a candle for a loved one. Each light is a visible prayer.
              </p>

              <div className="flex items-end justify-center gap-5 py-6">
                {["Faith", "Hope", "Love"].map((label, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-5 h-9 rounded-t-full bg-gradient-to-b from-amber-100 to-amber-300 border border-amber-200/50 relative" style={{ background: "linear-gradient(to bottom, #fef3c7, #fcd34d)" }}>
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-lg" style={{ animationDelay: `${i * 0.3}s` }} />
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-0.5 h-2 rounded-full bg-orange-400" />
                    </div>
                    <div className="mt-1.5 w-10 h-[2px] bg-amber-800/10 rounded-full" />
                    <span className="text-[8px] text-amber-600/70 mt-1 uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>

              <blockquote className="border-l-2 border-amber-400 pl-3 py-1.5">
                <p className="text-amber-800 italic text-[11px] leading-relaxed">"Behold the Lamb of God, behold him who takes away the sins of the world. Blessed are those called to the supper of the Lamb."</p>
                <p className="text-amber-700 text-[9px] mt-1 font-semibold">— John 1:29</p>
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white/80 border-t border-stone-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-[10px] text-stone-500">© SACRA LITURGIA | Catholic Faith Guide</p>
          <p className="text-[10px] text-stone-500">Based on the Roman Missal &amp; GIRM</p>
        </div>
      </footer>
    </div>
  );
}