import { useState } from "react";

type PrayerSection = {
  title: string;
  text: string;
};

type Decade = {
  title: string;
  mystery?: string;
  ourFather?: string;
  hailMary?: string;
  hailMarys?: string;
  gloryBe?: string;
  fatima?: string;
  reparation?: string;
  invocation?: string;
  choir?: string;
};

type ChapletData = {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  image: string;
  howToPray: string[];
  openingPrayer: PrayerSection;
  beforeTheRosary?: { title: string; prayers: { label: string; text: string }[] };
  preliminaryPrayers?: PrayerSection[];
  decades: Decade[];
  eternalFather?: string;
  decadePrayer?: string;
  holyGod?: string;
  closingPrayer?: PrayerSection;
  closingPrayers?: PrayerSection[];
  actOfReparation?: PrayerSection;
  hailHolyQueen?: PrayerSection;
};

const GOLD = "#D97706";

export default function ChapletViewer({ data }: { data: ChapletData }) {
  const [view, setView] = useState<"guide" | "prayers">("guide");
  const [expandedDecade, setExpandedDecade] = useState<number | null>(null);
  const [expandedPrayer, setExpandedPrayer] = useState<string | null>(null);

  const toggleDecade = (i: number) => setExpandedDecade(expandedDecade === i ? null : i);
  const togglePrayer = (title: string) => setExpandedPrayer(expandedPrayer === title ? null : title);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 pb-32 md:pb-8 max-w-4xl mx-auto min-h-screen">
      {/* Hero Banner */}
      <div
        className="rounded-3xl relative overflow-hidden mb-8"
        style={{
          background: `linear-gradient(135deg, ${data.color}18, ${data.color}05)`,
          border: `1px solid ${data.color}30`,
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${data.color}, transparent)` }} />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full" style={{ background: `radial-gradient(circle, ${data.color}20, transparent 70%)` }} />
        <div className="relative z-10 p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: `${data.color}15`, border: `1px solid ${data.color}30` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: data.color }} />
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: data.color }}>{data.subtitle}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
            {data.title}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">{data.description}</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-8">
        {([
          { key: "guide" as const, label: "How to Pray" },
          { key: "prayers" as const, label: "All Prayers" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className="px-5 py-2.5 rounded-xl text-[12px] font-bold tracking-wider uppercase transition-all duration-200"
            style={{
              background: view === tab.key ? `linear-gradient(135deg, ${data.color}, ${data.color}CC)` : "#FFFFFF",
              color: view === tab.key ? "#FFFFFF" : "#78716C",
              border: `1px solid ${view === tab.key ? data.color : "rgba(28,25,23,0.08)"}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === "guide" && (
        <div className="space-y-8">
          {/* How to Pray Steps */}
          <div className="rounded-2xl p-6 bg-white" style={{ border: "1px solid rgba(28,25,23,0.08)" }}>
            <h3 className="text-sm font-bold tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "'Cinzel', serif", color: data.color }}>How to Pray</h3>
            <div className="space-y-3">
              {data.howToPray.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: `${data.color}15`, color: data.color }}>
                    {i + 1}
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Opening Prayer */}
          <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: data.color }} />
              <h3 className="text-sm font-bold tracking-wider uppercase" style={{ color: data.color }}>{data.openingPrayer.title}</h3>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>
              {data.openingPrayer.text}
            </p>
          </div>

          {/* Before the Rosary (if present) */}
          {data.beforeTheRosary && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: "1px solid rgba(28,25,23,0.08)" }}>
              <h3 className="text-sm font-bold tracking-wider uppercase text-stone-700 mb-4">{data.beforeTheRosary.title}</h3>
              <div className="space-y-3">
                {data.beforeTheRosary.prayers.map((prayer) => (
                  <div key={prayer.label} className="rounded-xl p-4" style={{ background: "#FAF8F5", border: "1px solid rgba(28,25,23,0.06)" }}>
                    <p className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: data.color }}>{prayer.label}</p>
                    <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>
                      {prayer.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preliminary Prayers (if present) */}
          {data.preliminaryPrayers && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: "1px solid rgba(28,25,23,0.08)" }}>
              <h3 className="text-sm font-bold tracking-wider uppercase text-stone-700 mb-4">Preliminary Prayers</h3>
              <div className="space-y-3">
                {data.preliminaryPrayers.map((prayer) => (
                  <div key={prayer.title} className="rounded-xl p-4" style={{ background: "#FAF8F5", border: "1px solid rgba(28,25,23,0.06)" }}>
                    <p className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: data.color }}>{prayer.title}</p>
                    <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>
                      {prayer.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decades as Steps */}
          <div>
            <h3 className="text-sm font-bold tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "'Cinzel', serif", color: "#57534E" }}>
              The Decades
            </h3>
            <div className="space-y-3">
              {data.decades.map((decade, i) => {
                const isExpanded = expandedDecade === i;
                return (
                  <div key={i} className="rounded-2xl overflow-hidden bg-white transition-all" style={{ border: `1px solid ${isExpanded ? `${data.color}40` : "rgba(28,25,23,0.08)"}` }}>
                    <button
                      onClick={() => toggleDecade(i)}
                      className="w-full flex items-center gap-4 p-5 text-left transition-all"
                      style={{ background: isExpanded ? `${data.color}08` : "transparent" }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${data.color}12`, color: data.color }}>
                        <span className="text-sm font-bold">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-stone-900">{decade.title}</h4>
                        {decade.mystery && <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{decade.mystery}</p>}
                        {decade.choir && <p className="text-xs mt-0.5" style={{ color: data.color }}>{decade.choir}</p>}
                      </div>
                      <span className="text-lg flex-shrink-0 transition-transform" style={{ color: data.color, transform: isExpanded ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 space-y-3" style={{ animation: "fadeIn 0.2s ease" }}>
                        {decade.mystery && (
                          <div className="rounded-xl p-4" style={{ background: `${data.color}08`, border: `1px solid ${data.color}20` }}>
                            <p className="text-[10px] font-bold tracking-wider uppercase mb-1" style={{ color: data.color }}>Meditation</p>
                            <p className="text-sm text-stone-700 leading-relaxed">{decade.mystery}</p>
                          </div>
                        )}
                        {decade.ourFather && (
                          <div className="rounded-xl p-4" style={{ background: "#FAF8F5", border: "1px solid rgba(28,25,23,0.06)" }}>
                            <p className="text-[10px] font-bold tracking-wider uppercase text-amber-700 mb-1">Our Father</p>
                            <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>{decade.ourFather}</p>
                          </div>
                        )}
                        {(decade.hailMary || decade.hailMarys) && (
                          <div className="rounded-xl p-4" style={{ background: "#FAF8F5", border: "1px solid rgba(28,25,23,0.06)" }}>
                            <p className="text-[10px] font-bold tracking-wider uppercase text-stone-500 mb-1">{decade.hailMarys ? "Hail Mary (×10)" : "Hail Mary"}</p>
                            <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>{decade.hailMary || decade.hailMarys}</p>
                          </div>
                        )}
                        {decade.gloryBe && (
                          <div className="rounded-xl p-4" style={{ background: "#FAF8F5", border: "1px solid rgba(28,25,23,0.06)" }}>
                            <p className="text-[10px] font-bold tracking-wider uppercase text-stone-500 mb-1">Glory Be</p>
                            <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>{decade.gloryBe}</p>
                          </div>
                        )}
                        {decade.fatima && (
                          <div className="rounded-xl p-4" style={{ background: "#FAF8F5", border: "1px solid rgba(28,25,23,0.06)" }}>
                            <p className="text-[10px] font-bold tracking-wider uppercase text-stone-500 mb-1">Fatima Prayer</p>
                            <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>{decade.fatima}</p>
                          </div>
                        )}
                        {decade.reparation && (
                          <div className="rounded-xl p-4" style={{ background: `${data.color}06`, border: `1px solid ${data.color}15` }}>
                            <p className="text-[10px] font-bold tracking-wider uppercase mb-1" style={{ color: data.color }}>Reparation</p>
                            <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>{decade.reparation}</p>
                          </div>
                        )}
                        {decade.invocation && (
                          <div className="rounded-xl p-4" style={{ background: `${data.color}06`, border: `1px solid ${data.color}15` }}>
                            <p className="text-[10px] font-bold tracking-wider uppercase mb-1" style={{ color: data.color }}>Invocation</p>
                            <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>{decade.invocation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Eternal Father (if present) */}
          {data.eternalFather && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: data.color }} />
                <h3 className="text-sm font-bold tracking-wider uppercase" style={{ color: data.color }}>On Each Large Bead</h3>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>
                {data.eternalFather}
              </p>
            </div>
          )}

          {/* Decade Prayer (if present) */}
          {data.decadePrayer && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: data.color }} />
                <h3 className="text-sm font-bold tracking-wider uppercase" style={{ color: data.color }}>On Each Small Bead</h3>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>
                {data.decadePrayer}
              </p>
            </div>
          )}

          {/* Holy God (if present) */}
          {data.holyGod && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: data.color }} />
                <h3 className="text-sm font-bold tracking-wider uppercase" style={{ color: data.color }}>Holy God (3x after each decade)</h3>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>
                {data.holyGod}
              </p>
            </div>
          )}

          {/* Act of Reparation (if present) */}
          {data.actOfReparation && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: data.color }} />
                <h3 className="text-sm font-bold tracking-wider uppercase" style={{ color: data.color }}>{data.actOfReparation.title}</h3>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>
                {data.actOfReparation.text}
              </p>
            </div>
          )}

          {/* Closing Prayer */}
          {data.closingPrayer && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: data.color }} />
                <h3 className="text-sm font-bold tracking-wider uppercase" style={{ color: data.color }}>{data.closingPrayer.title}</h3>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed italic whitespace-pre-line" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>
                {data.closingPrayer.text}
              </p>
            </div>
          )}

          {/* Closing Prayers (if present) */}
          {data.closingPrayers && (
            <div className="space-y-3">
              {data.closingPrayers.map((prayer) => {
                const isOpen = expandedPrayer === prayer.title;
                return (
                  <div key={prayer.title} className="rounded-2xl overflow-hidden bg-white" style={{ border: `1px solid ${isOpen ? `${data.color}40` : "rgba(28,25,23,0.08)"}` }}>
                    <button onClick={() => togglePrayer(prayer.title)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full" style={{ background: data.color }} />
                        <h3 className="text-sm font-bold text-stone-900">{prayer.title}</h3>
                      </div>
                      <span className="text-lg flex-shrink-0 transition-transform" style={{ color: data.color, transform: isOpen ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <p className="text-sm text-stone-700 leading-relaxed italic whitespace-pre-line" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>
                          {prayer.text}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Hail Holy Queen (if present) */}
          {data.hailHolyQueen && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: data.color }} />
                <h3 className="text-sm font-bold tracking-wider uppercase" style={{ color: data.color }}>{data.hailHolyQueen.title}</h3>
              </div>
              <p className="text-sm text-stone-700 leading-relaxed italic whitespace-pre-line" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>
                {data.hailHolyQueen.text}
              </p>
            </div>
          )}
        </div>
      )}

      {view === "prayers" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
            <h3 className="text-sm font-bold tracking-wider uppercase mb-3" style={{ color: data.color }}>{data.openingPrayer.title}</h3>
            <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>
              {data.openingPrayer.text}
            </p>
          </div>

          {data.beforeTheRosary?.prayers.map((prayer) => (
            <div key={prayer.label} className="rounded-2xl p-6 bg-white" style={{ border: "1px solid rgba(28,25,23,0.08)" }}>
              <h3 className="text-sm font-bold tracking-wider uppercase text-amber-700 mb-3">{prayer.label}</h3>
              <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>
                {prayer.text}
              </p>
            </div>
          ))}

          {data.decades.map((decade, i) => (
            <div key={i} className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}15` }}>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: data.color }}>Decade {i + 1}</p>
              <h3 className="text-base font-bold text-stone-900 mb-3" style={{ fontFamily: "'Cinzel', serif" }}>{decade.title}</h3>
              {decade.mystery && <p className="text-xs text-stone-500 mb-3 italic">{decade.mystery}</p>}
              {decade.ourFather && (
                <div className="rounded-xl p-4 mb-3" style={{ background: "#FAF8F5" }}>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-amber-700 mb-1">Our Father</p>
                  <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>{decade.ourFather}</p>
                </div>
              )}
              {decade.hailMary && (
                <div className="rounded-xl p-4 mb-3" style={{ background: "#FAF8F5" }}>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-stone-500 mb-1">Hail Mary (×10)</p>
                  <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>{decade.hailMary}</p>
                </div>
              )}
              {decade.gloryBe && (
                <div className="rounded-xl p-4 mb-3" style={{ background: "#FAF8F5" }}>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-stone-500 mb-1">Glory Be</p>
                  <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>{decade.gloryBe}</p>
                </div>
              )}
              {decade.fatima && (
                <div className="rounded-xl p-4" style={{ background: "#FAF8F5" }}>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-stone-500 mb-1">Fatima Prayer</p>
                  <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif" }}>{decade.fatima}</p>
                </div>
              )}
            </div>
          ))}

          {data.eternalFather && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
              <h3 className="text-sm font-bold tracking-wider uppercase mb-3" style={{ color: data.color }}>Eternal Father</h3>
              <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>{data.eternalFather}</p>
            </div>
          )}

          {data.decadePrayer && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
              <h3 className="text-sm font-bold tracking-wider uppercase mb-3" style={{ color: data.color }}>On Each Small Bead</h3>
              <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>{data.decadePrayer}</p>
            </div>
          )}

          {data.holyGod && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
              <h3 className="text-sm font-bold tracking-wider uppercase mb-3" style={{ color: data.color }}>Holy God (3x)</h3>
              <p className="text-sm text-stone-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>{data.holyGod}</p>
            </div>
          )}

          {data.closingPrayer && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
              <h3 className="text-sm font-bold tracking-wider uppercase mb-3" style={{ color: data.color }}>{data.closingPrayer.title}</h3>
              <p className="text-sm text-stone-700 leading-relaxed italic whitespace-pre-line" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>{data.closingPrayer.text}</p>
            </div>
          )}

          {data.closingPrayers?.map((prayer) => (
            <div key={prayer.title} className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
              <h3 className="text-sm font-bold tracking-wider uppercase mb-3" style={{ color: data.color }}>{prayer.title}</h3>
              <p className="text-sm text-stone-700 leading-relaxed italic whitespace-pre-line" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>{prayer.text}</p>
            </div>
          ))}

          {data.hailHolyQueen && (
            <div className="rounded-2xl p-6 bg-white" style={{ border: `1px solid ${data.color}20` }}>
              <h3 className="text-sm font-bold tracking-wider uppercase mb-3" style={{ color: data.color }}>{data.hailHolyQueen.title}</h3>
              <p className="text-sm text-stone-700 leading-relaxed italic whitespace-pre-line" style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "15px" }}>{data.hailHolyQueen.text}</p>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
