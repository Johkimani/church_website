import type { SeasonInfo } from "../data/liturgicalCalendar";

interface LiturgicalBannerProps {
  season: SeasonInfo;
  celebration?: string;
}

export default function LiturgicalBanner({ season, celebration }: LiturgicalBannerProps) {
  const seasonStyles: Record<string, { text: string; badge: string; accent: string }> = {
    Advent: { text: "text-purple-900", badge: "bg-purple-100 text-purple-800", accent: "border-purple-300" },
    Christmas: { text: "text-amber-900", badge: "bg-amber-100 text-amber-800", accent: "border-gold-300" },
    Lent: { text: "text-rose-900", badge: "bg-rose-100 text-rose-800", accent: "border-rose-300" },
    Triduum: { text: "text-red-900", badge: "bg-red-100 text-red-800", accent: "border-red-300" },
    Easter: { text: "text-amber-900", badge: "bg-amber-100 text-amber-800", accent: "border-gold-300" },
    "Ordinary Time": { text: "text-emerald-900", badge: "bg-emerald-100 text-emerald-800", accent: "border-emerald-300" },
  };

  const styles = seasonStyles[season.name] || seasonStyles["Ordinary Time"];
  const isSpecial = season.name === "Advent" || season.name === "Lent";

  return (
    <div
      className="relative overflow-hidden rounded-[22px] transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: `linear-gradient(135deg, ${season.colorHex}22 0%, ${season.colorHex}44 50%, ${season.colorHex}22 100%)`,
        boxShadow:
          "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 30px -4px rgba(0,0,0,0.1)",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.25)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${season.colorHex}33` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: season.colorHex }}
            >
              {season.name === "Advent" && ""}
              {season.name === "Christmas" && ""}
              {season.name === "Lent" && ""}
              {season.name === "Triduum" && ""}
              {season.name === "Easter" && ""}
              {season.name === "Ordinary Time" && ""}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={`text-lg font-bold ${styles.text}`}>{season.label}</h2>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles.badge}`}>
                {season.color}
              </span>
              {isSpecial && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  Special Season
                </span>
              )}
            </div>
            {celebration && (
              <p className="text-sm text-slate-600 mt-0.5 font-medium">{celebration}</p>
            )}
            <p className="text-xs text-slate-500 mt-0.5">{season.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full border-2 shadow-inner flex-shrink-0"
            style={{
              backgroundColor: season.colorHex,
              borderColor: `${season.colorHex}88`,
            }}
          />
          <div className="text-right">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Season Color</p>
            <p className="text-xs font-medium text-slate-700 capitalize">{season.color}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
