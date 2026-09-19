import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useState, useEffect } from "react";

const QUOTES = [
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "I am the light of the world.", ref: "John 8:12" },
  { text: "Love one another as I have loved you.", ref: "John 15:12" },
  { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { text: "I have fought the good fight.", ref: "2 Timothy 4:7" },
];

function getEaster(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getLiturgicalInfo() {
  const now = new Date(), y = now.getFullYear(), easter = getEaster(y);
  const ashWed = new Date(easter); ashWed.setDate(ashWed.getDate() - 46);
  const pentecost = new Date(easter); pentecost.setDate(pentecost.getDate() + 49);
  const christmas = new Date(y, 11, 25), baptism = new Date(y, 0, 12), advent = new Date(y, 10, 27);
  const inR = (s: Date, e: Date) => now >= s && now < e;
  if (inR(christmas, baptism)) return { season: "Christmas", accent: "#0EA5E9" };
  if (inR(advent, christmas)) return { season: "Advent", accent: "#8B5CF6" };
  if (inR(ashWed, easter)) return { season: "Lent", accent: "#7C3AED" };
  if (inR(easter, pentecost)) return { season: "Easter", accent: "#D97706" };
  return { season: "Ordinary Time", accent: "#16A34A" };
}

function getMystery() {
  return ["Glorious", "Joyful", "Sorrowful", "Glorious", "Luminous", "Joyful", "Sorrowful"][new Date().getDay()];
}

export default function Dashboard() {
  const { user } = useAuth();
  const mystery = getMystery();
  const liturgy = getLiturgicalInfo();
  const [quote, setQuote] = useState(0);
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  });

  useEffect(() => {
    const t = setInterval(() => setQuote(q => (q + 1) % QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* ═══════════════════ HERO ═══════════════════ */}
        <div className="relative rounded-3xl overflow-hidden mb-8" style={{ background: "linear-gradient(135deg, #1C1917 0%, #292524 100%)", minHeight: "280px" }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #D97706, transparent 70%)" }} />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #D97706, transparent 70%)" }} />
          </div>

          <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-between" style={{ minHeight: "280px" }}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase" style={{ background: `${liturgy.accent}20`, color: liturgy.accent, border: `1px solid ${liturgy.accent}35` }}>
                  {liturgy.season}
                </span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-white/40 text-xs font-medium">{dateStr}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 leading-tight" style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}>
                {greeting}{user?.name ? `, ${user.name}` : ""}
              </h1>

              <div key={quote} style={{ animation: "fadeUp 0.5s ease" }}>
                <p className="text-base sm:text-lg text-white/60 italic mt-3">"{QUOTES[quote].text}"</p>
                <p className="text-xs text-amber-500/50 mt-1 font-medium">— {QUOTES[quote].ref}</p>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="daily-liturgy"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #D97706, #B45309)", color: "#fff", boxShadow: "0 8px 32px rgba(217,119,6,0.4)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                Today's Readings
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════════════════ QUICK ACTIONS ═══════════════════ */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">Quick Pray</h2>
            <div className="flex-1 h-px bg-stone-100" />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {[
              { to: "rosary", icon: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 2a8 8 0 1 1-8 8 8 8 0 0 1 8-8z", label: "Rosary", color: "#D97706" },
              { to: "seven-sorrows", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", label: "7 Sorrows", color: "#64748B" },
              { to: "divine-mercy", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z", label: "Divine Mercy", color: "#EF4444" },
              { to: "st-michael", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "St. Michael", color: "#B45309" },
              { to: "prayer-module", icon: "M18.5 4a2.5 2.5 0 0 0-5 0v3.5a3 3 0 0 0 6 0V4z", label: "Novenas", color: "#8B5CF6" },
              { to: "readings", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z", label: "Prayers", color: "#2563EB" },
              { to: "bible", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z", label: "Bible", color: "#16A34A" },
              { to: "liturgy", icon: "M12 2v20M4.9 4.9l14.2 14.2M2 12h20", label: "Liturgy", color: "#9333EA" },
            ].map(item => (
              <Link key={item.to} to={item.to} className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-white border border-stone-100 hover:border-amber-200 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${item.color}10`, color: item.color }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-600 group-hover:text-amber-700 transition-colors text-center leading-tight">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════════════════ TODAY'S MYSTERY ═══════════════════ */}
        <Link to="rosary" className="block group mb-8">
          <div className="rounded-2xl p-5 sm:p-6 flex items-center gap-4 sm:gap-5 bg-white border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0 relative" style={{ boxShadow: "0 4px 20px rgba(217,119,6,0.2)" }}>
              <img src="/images/mary-rosary.jpg" alt="Rosary" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-600 mb-1">Today's Rosary</p>
              <p className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-amber-700 transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>
                {mystery} Mysteries
              </p>
              <p className="text-xs text-stone-400 mt-0.5">Pray with Mary today</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all flex-shrink-0"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </div>
        </Link>

        {/* ═══════════════════ ROSARY DEVOTIONS ═══════════════════ */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">Rosary & Chaplets</h2>
            <div className="flex-1 h-px bg-stone-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { to: "rosary", title: "The Holy Rosary", desc: "Joyful, Sorrowful, Glorious & Luminous", color: "#D97706", img: "/images/mary-rosary.jpg" },
              { to: "seven-sorrows", title: "Seven Sorrows", desc: "The Servite Rosary of Mary's grief", color: "#64748B", img: "/images/mary-immaculate.jpg" },
              { to: "divine-mercy", title: "Divine Mercy Chaplet", desc: "The chaplet of God's infinite mercy", color: "#EF4444", img: "/images/christ.jpg" },
              { to: "st-michael", title: "Chaplet of St. Michael", desc: "Nine decades for nine angel choirs", color: "#B45309", img: "/images/christ.jpg" },
              { to: "reparation", title: "Rosary of Reparation", desc: "Offering for sins against the Sacred Heart", color: "#8B5CF6", img: "/images/christ.jpg" },
            ].map(d => (
              <Link key={d.to} to={d.to} className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <img src={d.img} alt={d.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0" style={{ background: `${d.color}30` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">{d.title}</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{d.desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════════════════ DAILY DEVOTIONS ═══════════════════ */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">Daily Devotions</h2>
            <div className="flex-1 h-px bg-stone-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { to: "daily-liturgy", title: "Daily Missal", desc: "Today's Readings, Psalms & Gospel", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5v15z", color: "#D97706" },
              { to: "readings", title: "Prayer Book", desc: "Catholic prayers in English & Kiswahili", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z", color: "#2563EB" },
              { to: "prayer-module", title: "Novenas & Litanies", desc: "Nine-day devotions with calendar tracker", icon: "M18.5 4a2.5 2.5 0 0 0-5 0v3.5a3 3 0 0 0 6 0V4z", color: "#8B5CF6" },
              { to: "bible", title: "Holy Bible", desc: "Read and reflect on God's Word", icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z", color: "#16A34A" },
            ].map(d => (
              <Link key={d.to} to={d.to} className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${d.color}10`, color: d.color }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d.icon} /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">{d.title}</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{d.desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════════════════ MORE TO EXPLORE ═══════════════════ */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">More to Explore</h2>
            <div className="flex-1 h-px bg-stone-100" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { to: "liturgy", label: "Liturgy Guide", desc: "Understanding the Mass" },
              { to: "liturgical-seasons", label: "Liturgical Seasons", desc: "Church calendar year" },
              { to: "prayers-of-the-mass", label: "Prayers of the Mass", desc: "The Order of Mass" },
            ].map(d => (
              <Link key={d.to} to={d.to} className="group rounded-2xl p-4 bg-white border border-stone-100 hover:border-amber-200 hover:shadow-md transition-all duration-200">
                <p className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">{d.label}</p>
                <p className="text-[11px] text-stone-400 mt-1">{d.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {user && (
          <Link to="progress" className="block group mb-4">
            <div className="rounded-2xl p-4 sm:p-5 flex items-center justify-between bg-white border border-stone-100 hover:border-amber-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#16A34A12", color: "#16A34A" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 7l-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">My Spiritual Progress</p>
                  <p className="text-[11px] text-stone-400">Track your prayer journey</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </div>
          </Link>
        )}

        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    </div>
  );
}
