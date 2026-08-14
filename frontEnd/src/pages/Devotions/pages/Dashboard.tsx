import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useState, useEffect } from "react";

const OVERLAY = "linear-gradient(to top, rgba(28, 25, 23, 0.85), rgba(28, 25, 23, 0.35))";
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
    icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  },
  {
    to: "readings",
    badge: "Prayer Book",
    title: "Catholic Prayers",
    description: "Essential prayers of the Catholic tradition, from the Our Father to the Memorare.",
    cta: "Browse Prayers",
    image: "/images/rosary-praying-avatar.png",
    icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  },
  {
    to: "prayer-module",
    badge: "Novena Prayers",
    title: "Novenas & Litanies",
    description: "Nine-day devotions and litanies of petition, praise, and intercession.",
    cta: "Begin Novena",
    image: "/images/rosary_prayers.jpg",
    icon: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  },
  {
    to: "bible",
    badge: "Sacred Scripture",
    title: "Holy Bible",
    description: "Read and reflect on the Word of God with daily inspiration.",
    cta: "Open Bible",
    image: "/images/read-you-bible.png",
    icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  },
  {
    to: "progress",
    badge: "Spiritual Growth",
    title: "My Progress",
    description: "Track your prayers, rosaries, and devotion journey in one place.",
    cta: "View Progress",
    image: "/images/christ.jpg",
    icon: "M22 7l-8.5 8.5-5-5L2 17M16 7h6v6",
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
  const mysteries = ["Glorious", "Joyful", "Sorrowful", "Glorious", "Luminous", "Joyful", "Sorrowful"];
  return mysteries[day];
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

  // "My Progress" is personal — hide it for logged-out visitors.
  const cards = CARDS.filter((card) => card.to !== "progress" || !!user);

  useEffect(() => {
    const t = setInterval(() => setQuote((q) => (q + 1) % QUOTES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const stats = [
    {
      to: "rosary",
      label: "Today's Mystery",
      value: `${mystery} Mysteries`,
      accent: "#FBBF24",
      icon: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 2a8 8 0 1 1-8 8 8 8 0 0 1 8-8z",
    },
    {
      to: "daily-liturgy",
      label: "Liturgical Season",
      value: liturgy.season,
      accent: liturgy.color,
      icon: "M12 2v20M4.9 4.9l14.2 14.2M2 12h20",
    },
    {
      to: "daily-liturgy",
      label: "Today",
      value: dateLabel,
      accent: "#94A3B8",
      icon: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    },
  ];

  return (
    <div
      className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-32 md:pb-8 min-h-screen"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)",
      }}
    >
      {/* ═══════════════ HERO — TODAY'S READINGS ═══════════════ */}
      <Link to="daily-liturgy" className="block group">
        <div
          className="rounded-3xl relative overflow-hidden transition-all duration-300"
          style={{ height: "380px", transform: "translateY(0)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 24px 60px rgba(0,0,0,0.5)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)"; }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          />
          <div className="absolute inset-0" style={{ background: OVERLAY }} />
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
            background: "linear-gradient(90deg, transparent, #D97706, transparent)",
          }} />
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full" style={{
            background: "radial-gradient(circle, rgba(217, 119, 6, 0.28), transparent 70%)",
          }} />
          <div className="absolute right-8 bottom-4 text-[150px] leading-none select-none" style={{
            color: "rgba(255, 255, 255, 0.045)",
            fontFamily: "'Cinzel', serif",
          }}>✝</div>

          <div className="relative z-10 h-full flex flex-col justify-center p-8 sm:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
                style={{ background: "rgba(217, 119, 6, 0.12)", border: "1px solid rgba(217, 119, 6, 0.25)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-bold tracking-[0.15em] text-amber-400 uppercase">Today's Readings</span>
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
                style={{ background: `${liturgy.color}14`, border: `1px solid ${liturgy.color}45`, color: liturgy.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: liturgy.color }} />
                <span className="text-[11px] font-bold tracking-[0.15em] uppercase">{liturgy.season}</span>
              </span>
            </div>

            <h1
              className="text-3xl sm:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
            >
              {greeting}, {user?.name || "Beloved"}
            </h1>

            <div className="max-w-xl min-h-[74px]" key={quote} style={{ animation: "dashFade 0.5s ease" }}>
              <p className="text-base sm:text-lg text-slate-200 italic leading-relaxed">
                "{QUOTES[quote].text}"
              </p>
              <p className="text-xs text-amber-400/70 mt-1.5 not-italic font-semibold tracking-wide">— {QUOTES[quote].ref}</p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
              <span className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm group-hover:text-amber-300 transition-colors w-fit">
                Open Readings
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
              <span className="text-[11px] text-slate-400 tracking-[0.2em] uppercase">{dateLabel}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* ═══════════════ STAT STRIP ═══════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 bg-white"
            style={{
              border: "1px solid rgba(28, 25, 23, 0.08)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.12)"; e.currentTarget.style.borderColor = `${s.accent}66`; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(28,25,23,0.08)"; }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.accent}1a`, color: s.accent }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={s.icon} />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-stone-500 font-bold tracking-[0.2em] uppercase mb-1">{s.label}</p>
              <p className="text-sm font-bold text-stone-900 truncate">{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ═══════════════ SECTION — JOURNEY ═══════════════ */}
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="w-6 h-[2px]" style={{ background: "linear-gradient(90deg, #D97706, transparent)" }} />
        <h2
          className="text-[13px] font-bold tracking-[0.25em] uppercase"
          style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", color: "#57534E" }}
        >
          Continue Your Journey
        </h2>
        <div className="flex-1 h-[2px]" style={{ background: "linear-gradient(90deg, rgba(28,25,23,0.08), transparent)" }} />
      </div>

      {/* ═══════════════ 5 CARD GRID ═══════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="block group">
            <div
              className="rounded-2xl relative overflow-hidden transition-all duration-300"
              style={{ height: "240px", transform: "translateY(0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 40px rgba(0,0,0,0.45)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"; }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              <div className="absolute inset-0" style={{ background: OVERLAY }} />
              <div className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity" style={{
                background: "linear-gradient(90deg, transparent, #D97706, transparent)",
              }} />

              <div className="absolute top-4 left-4 w-9 h-9 rounded-xl flex items-center justify-center z-10"
                style={{ background: "rgba(217, 119, 6, 0.2)", color: "#FBBF24", border: "1px solid rgba(217, 119, 6, 0.3)", backdropFilter: "blur(6px)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-end p-6">
                <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                  style={{ background: "rgba(217, 119, 6, 0.15)", border: "1px solid rgba(217, 119, 6, 0.25)" }}
                >
                  <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">{card.badge}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
                  {card.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-2">
                  {card.description}
                </p>
                <span className="text-xs font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
                  {card.cta} →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ═══════════════ ROSARY RITUAL CARD ═══════════════ */}
      <div
        className="rounded-3xl p-6 sm:p-7 relative overflow-hidden bg-white"
        style={{
          border: "1px solid rgba(217, 119, 6, 0.25)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
          background: "linear-gradient(90deg, transparent, #D97706, transparent)",
        }} />
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
              style={{
                border: "2px solid rgba(217, 119, 6, 0.35)",
                boxShadow: "0 6px 18px rgba(217, 119, 6, 0.25)",
              }}
            >
              <img
                src="/images/virgin-mary.jpg"
                alt="The Blessed Virgin Mary, Mother of Jesus"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] text-amber-700/70 font-bold tracking-[0.25em] uppercase mb-1">Today's Rosary</p>
              <p className="text-lg font-bold text-stone-900" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
                {mystery} Mysteries
              </p>
              <p className="text-xs text-stone-500 mt-0.5">{liturgy.message}</p>
            </div>
          </div>
          <Link
            to="rosary"
            className="text-sm font-bold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #D97706, #B45309)",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(217, 119, 6, 0.35)",
            }}
          >
            Pray the Rosary →
          </Link>
        </div>
      </div>

      <style>{`@keyframes dashFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
