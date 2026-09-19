import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useState, useEffect } from "react";

const HERO_IMAGE = "/images/eucharist.jpg";

const QUOTES = [
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "I am the light of the world. Whoever follows me will not walk in darkness.", ref: "John 8:12" },
  { text: "Love one another as I have loved you.", ref: "John 15:12" },
  { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { text: "I have fought the good fight, I have finished the race, I have kept the faith.", ref: "2 Timothy 4:7" },
];

function getEaster(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getLiturgicalInfo() {
  const now = new Date();
  const y = now.getFullYear();
  const easter = getEaster(y);
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(ashWednesday.getDate() - 46);
  const pentecost = new Date(easter);
  pentecost.setDate(pentecost.getDate() + 49);
  const christmas = new Date(y, 11, 25);
  const baptismOfLord = new Date(y, 0, 12);
  const adventStart = new Date(y, 10, 27);
  const inRange = (s: Date, e: Date) => now >= s && now < e;
  if (inRange(christmas, baptismOfLord)) return { season: "Christmas", color: "#F1F5F9", message: "The Word became flesh and dwelt among us." };
  if (inRange(adventStart, christmas)) return { season: "Advent", color: "#8B5CF6", message: "Prepare the way of the Lord." };
  if (inRange(ashWednesday, easter)) return { season: "Lent", color: "#8B5CF6", message: "Repent, and believe in the Gospel." };
  if (inRange(easter, pentecost)) return { season: "Easter", color: "#FCD34D", message: "Christ is risen! Alleluia." };
  return { season: "Ordinary Time", color: "#22C55E", message: "Walk in the light of the Lord." };
}

function getTodaysMystery() {
  const day = new Date().getDay();
  return ["Glorious", "Joyful", "Sorrowful", "Glorious", "Luminous", "Joyful", "Sorrowful"][day];
}

const ROSARY_DEVOTIONS = [
  { to: "rosary", title: "The Holy Rosary", desc: "Meditate on the mysteries of Christ's life with Mary.", color: "#D97706", image: "/images/mary-rosary.jpg" },
  { to: "seven-sorrows", title: "Seven Sorrows", desc: "Walk with Our Lady through her seven sorrows.", color: "#64748B", image: "/images/mary-immaculate.jpg" },
  { to: "divine-mercy", title: "Divine Mercy", desc: "The chaplet revealed to St. Faustina for God's mercy.", color: "#EF4444", image: "/images/christ.jpg" },
  { to: "st-michael", title: "St. Michael Chaplet", desc: "Nine decades honoring the nine choirs of angels.", color: "#B45309", image: "/images/christ.jpg" },
  { to: "reparation", title: "Rosary of Reparation", desc: "Offer prayers in reparation for sins against the Sacred Heart.", color: "#8B5CF6", image: "/images/christ.jpg" },
];

const QUICK_LINKS = [
  { to: "daily-liturgy", label: "Daily Missal", desc: "Today's readings & Gospel", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5v15z" },
  { to: "readings", label: "Prayer Book", desc: "Catholic prayers collection", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" },
  { to: "prayer-module", label: "Novenas", desc: "Nine-day prayer devotions", icon: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" },
  { to: "bible", label: "Holy Bible", desc: "Read the Word of God", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" },
  { to: "liturgy", label: "Liturgy Guide", desc: "Understanding the Mass", icon: "M12 2v20M4.9 4.9l14.2 14.2M2 12h20" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const mystery = getTodaysMystery();
  const liturgy = getLiturgicalInfo();
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  });
  const [quote, setQuote] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setQuote((q) => (q + 1) % QUOTES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-8 min-h-screen" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)" }}>

      {/* ─── Hero ─── */}
      <Link to="daily-liturgy" className="block group">
        <div className="rounded-2xl sm:rounded-3xl relative overflow-hidden transition-shadow duration-300 hover:shadow-2xl" style={{ height: "clamp(220px, 42vw, 400px)" }}>
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,25,23,0.9), rgba(28,25,23,0.3))" }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #D97706, transparent)" }} />
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(217,119,6,0.25), transparent 70%)" }} />
          <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.25)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.15em] text-amber-400 uppercase">Today's Readings</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: `${liturgy.color}14`, border: `1px solid ${liturgy.color}45`, color: liturgy.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: liturgy.color }} />
                <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase">{liturgy.season}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-4 leading-tight" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
              {greeting}, {user?.name || "Beloved"}
            </h1>
            <div className="max-w-xl min-h-[48px] sm:min-h-[74px]" key={quote} style={{ animation: "dashFade 0.5s ease" }}>
              <p className="text-sm sm:text-lg text-slate-200 italic leading-relaxed">"{QUOTES[quote].text}"</p>
              <p className="text-[10px] sm:text-xs text-amber-400/70 mt-1 not-italic font-semibold tracking-wide">— {QUOTES[quote].ref}</p>
            </div>
            <div className="mt-3 sm:mt-6 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-amber-400 font-semibold text-xs sm:text-sm group-hover:text-amber-300 transition-colors">
                Open Readings
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 tracking-[0.15em] sm:tracking-[0.2em] uppercase hidden sm:inline">{dateLabel}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* ─── Today at a Glance ─── */}
      <div className="mt-5 sm:mt-6 mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 sm:w-6 h-[2px]" style={{ background: "linear-gradient(90deg, #D97706, transparent)" }} />
          <h2 className="text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'Cinzel', serif", color: "#57534E" }}>Today at a Glance</h2>
          <div className="flex-1 h-[2px]" style={{ background: "linear-gradient(90deg, rgba(28,25,23,0.08), transparent)" }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="rosary" className="group rounded-2xl p-4 bg-white border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "#FBBF2415", color: "#FBBF24" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /></svg>
            </div>
            <p className="text-[9px] sm:text-[10px] text-stone-400 font-bold tracking-[0.15em] uppercase mb-0.5">Mystery</p>
            <p className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">{mystery}</p>
          </Link>
          <Link to="daily-liturgy" className="group rounded-2xl p-4 bg-white border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${liturgy.color}15`, color: liturgy.color }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20" /></svg>
            </div>
            <p className="text-[9px] sm:text-[10px] text-stone-400 font-bold tracking-[0.15em] uppercase mb-0.5">Season</p>
            <p className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">{liturgy.season}</p>
          </Link>
          <Link to="daily-liturgy" className="group rounded-2xl p-4 bg-white border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "#94A3B815", color: "#94A3B8" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </div>
            <p className="text-[9px] sm:text-[10px] text-stone-400 font-bold tracking-[0.15em] uppercase mb-0.5">Date</p>
            <p className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors truncate">{today.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
          </Link>
          {user && (
            <Link to="progress" className="group rounded-2xl p-4 bg-white border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "#10B98115", color: "#10B981" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 7l-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></svg>
              </div>
              <p className="text-[9px] sm:text-[10px] text-stone-400 font-bold tracking-[0.15em] uppercase mb-0.5">Progress</p>
              <p className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">My Journey</p>
            </Link>
          )}
          {!user && (
            <Link to="rosary" className="group rounded-2xl p-4 bg-white border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "#8B5CF615", color: "#8B5CF6" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>
              </div>
              <p className="text-[9px] sm:text-[10px] text-stone-400 font-bold tracking-[0.15em] uppercase mb-0.5">Quick</p>
              <p className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">Pray Now</p>
            </Link>
          )}
        </div>
      </div>

      {/* ─── Marian Devotion ─── */}
      <div className="rounded-2xl sm:rounded-3xl relative overflow-hidden mb-8 sm:mb-10" style={{ background: "linear-gradient(135deg, rgba(217,119,6,0.08), rgba(217,119,6,0.02))", border: "1px solid rgba(217,119,6,0.2)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #D97706, transparent)" }} />
        <div className="grid md:grid-cols-5 gap-0">
          <div className="md:col-span-2 relative h-48 sm:h-56 md:h-64 md:min-h-full overflow-hidden">
            <img src="/images/mary-immaculate.jpg" alt="The Immaculate Conception" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 md:hidden" style={{ background: "linear-gradient(to top, rgba(28,25,23,0.55), transparent 60%)" }} />
            <div className="absolute inset-0 hidden md:block" style={{ background: "linear-gradient(to right, transparent 75%, rgba(250,248,245,1))" }} />
          </div>
          <div className="md:col-span-3 p-5 sm:p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full mb-3 sm:mb-5" style={{ background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.25)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.15em] text-amber-700 uppercase">Marian Devotion</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 mb-3 sm:mb-4" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>Our Blessed Mother</h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-4 sm:mb-6 max-w-2xl">
              "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus." Entrust your day to Mary — she leads every soul who prays with her to her Son.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link to="rosary" className="text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 hover:scale-105" style={{ background: "linear-gradient(135deg, #D97706, #B45309)", color: "#fff", boxShadow: "0 8px 24px rgba(217,119,6,0.35)" }}>
                Pray the Rosary →
              </Link>
              <Link to="prayer-module" className="text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 hover:scale-105" style={{ background: "#FFFFFF", color: "#B45309", border: "1px solid rgba(217,119,6,0.35)", boxShadow: "0 4px 16px rgba(217,119,6,0.12)" }}>
                Marian Novenas
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Rosary & Chaplets ─── */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-5 sm:w-6 h-[2px]" style={{ background: "linear-gradient(90deg, #D97706, transparent)" }} />
          <h2 className="text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'Cinzel', serif", color: "#57534E" }}>Rosary & Chaplets</h2>
          <div className="flex-1 h-[2px]" style={{ background: "linear-gradient(90deg, rgba(28,25,23,0.08), transparent)" }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {ROSARY_DEVOTIONS.map((d) => (
            <Link key={d.to} to={d.to} className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative" style={{ border: `2px solid ${d.color}25` }}>
                <img src={d.image} alt={d.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0" style={{ background: `${d.color}30` }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">{d.title}</h3>
                <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{d.desc}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Quick Access ─── */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-5 sm:w-6 h-[2px]" style={{ background: "linear-gradient(90deg, #D97706, transparent)" }} />
          <h2 className="text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'Cinzel', serif", color: "#57534E" }}>Quick Access</h2>
          <div className="flex-1 h-[2px]" style={{ background: "linear-gradient(90deg, rgba(28,25,23,0.08), transparent)" }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="group rounded-2xl p-4 bg-white border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300 text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110" style={{ background: "rgba(217,119,6,0.08)", color: "#B45309" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={link.icon} /></svg>
              </div>
              <p className="text-xs font-bold text-stone-900 group-hover:text-amber-700 transition-colors mb-0.5">{link.label}</p>
              <p className="text-[10px] text-stone-400 leading-snug">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Bottom Rosary CTA ─── */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 relative overflow-hidden bg-white" style={{ border: "1px solid rgba(217,119,6,0.25)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #D97706, transparent)" }} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0" style={{ border: "2px solid rgba(217,119,6,0.35)", boxShadow: "0 6px 18px rgba(217,119,6,0.25)" }}>
              <img src="/images/virgin-mary.jpg" alt="The Blessed Virgin Mary" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] text-amber-700/70 font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase mb-0.5 sm:mb-1">Today's Rosary</p>
              <p className="text-base sm:text-lg font-bold text-stone-900" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>{mystery} Mysteries</p>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">{liturgy.message}</p>
            </div>
          </div>
          <Link to="rosary" className="text-xs sm:text-sm font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 hover:scale-105 w-full sm:w-auto text-center" style={{ background: "linear-gradient(135deg, #D97706, #B45309)", color: "#fff", boxShadow: "0 8px 24px rgba(217,119,6,0.35)" }}>
            Pray the Rosary →
          </Link>
        </div>
      </div>

      <style>{`@keyframes dashFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
