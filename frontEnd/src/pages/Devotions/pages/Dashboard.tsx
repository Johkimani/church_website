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

const CARDS = [
  {
    to: "daily-liturgy",
    badge: "Today's Readings",
    title: "Daily Missal",
    description: "The Liturgy of the Word and Gospel for today's celebration.",
    cta: "Open Readings",
    image: "/images/biblestudy.webp",
  },
  {
    to: "readings",
    badge: "Prayer Book",
    title: "Catholic Prayers",
    description: "Essential prayers of the Catholic tradition, from the Our Father to the Memorare.",
    cta: "Browse Prayers",
    image: "/images/rosary-praying-avatar.png",
  },
  {
    to: "prayer-module",
    badge: "Novena Prayers",
    title: "Novenas & Litanies",
    description: "Nine-day devotions and litanies of petition, praise, and intercession.",
    cta: "Begin Novena",
    image: "/images/rosary_prayers.jpg",
  },
  {
    to: "bible",
    badge: "Sacred Scripture",
    title: "Holy Bible",
    description: "Read and reflect on the Word of God with daily inspiration.",
    cta: "Open Bible",
    image: "/images/read-you-bible.png",
  },
  {
    to: "progress",
    badge: "Spiritual Growth",
    title: "My Progress",
    description: "Track your prayers, rosaries, and devotion journey in one place.",
    cta: "View Progress",
    image: "/images/christ.jpg",
  },
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
  const cards = CARDS.filter((card) => card.to !== "progress" || !!user);

  useEffect(() => {
    const t = setInterval(() => setQuote((q) => (q + 1) % QUOTES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const stats = [
    { to: "rosary", label: "Mystery", value: `${mystery} Mysteries`, accent: "#FBBF24", icon: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 2a8 8 0 1 1-8 8 8 8 0 0 1 8-8z" },
    { to: "daily-liturgy", label: "Season", value: liturgy.season, accent: liturgy.color, icon: "M12 2v20M4.9 4.9l14.2 14.2M2 12h20" },
    { to: "daily-liturgy", label: "Today", value: dateLabel, accent: "#94A3B8", icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
  ];

  return (
    <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-8 min-h-screen" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)" }}>

      {/* Hero Card */}
      <Link to="daily-liturgy" className="block group">
        <div className="rounded-2xl sm:rounded-3xl relative overflow-hidden transition-shadow duration-300 hover:shadow-2xl" style={{ height: "clamp(200px, 40vw, 380px)" }}>
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,25,23,0.85), rgba(28,25,23,0.35))" }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #D97706, transparent)" }} />
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(217,119,6,0.28), transparent 70%)" }} />
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

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 mb-6 sm:mb-8">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="group rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-4 transition-all duration-300 hover:shadow-lg bg-white border border-stone-100 hover:border-stone-200">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.accent}1a`, color: s.accent }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] text-stone-500 font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-0.5 sm:mb-1">{s.label}</p>
              <p className="text-xs sm:text-sm font-bold text-stone-900 truncate">{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Marian Devotion */}
      <div className="rounded-2xl sm:rounded-3xl relative overflow-hidden mb-6 sm:mb-8" style={{ background: "linear-gradient(135deg, rgba(217,119,6,0.08), rgba(217,119,6,0.02))", border: "1px solid rgba(217,119,6,0.2)" }}>
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

      {/* Section Title */}
      <div className="flex items-center gap-3 mb-4 sm:mb-5 px-1">
        <div className="w-5 sm:w-6 h-[2px]" style={{ background: "linear-gradient(90deg, #D97706, transparent)" }} />
        <h2 className="text-[11px] sm:text-[13px] font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", color: "#57534E" }}>Continue Your Journey</h2>
        <div className="flex-1 h-[2px]" style={{ background: "linear-gradient(90deg, rgba(28,25,23,0.08), transparent)" }} />
      </div>

      {/* Journey Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="block group">
            <div className="rounded-2xl relative overflow-hidden transition-shadow duration-300 hover:shadow-2xl" style={{ height: "200px" }}>
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${card.image})` }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,25,23,0.85), rgba(28,25,23,0.35))" }} />
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(90deg, transparent, #D97706, transparent)" }} />
              <div className="relative z-10 h-full flex flex-col justify-end p-5">
                <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full mb-2" style={{ background: "rgba(217,119,6,0.15)", border: "1px solid rgba(217,119,6,0.25)" }}>
                  <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">{card.badge}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>{card.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3 line-clamp-2">{card.description}</p>
                <span className="text-[11px] sm:text-xs font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">{card.cta} →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Rosary CTA */}
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
