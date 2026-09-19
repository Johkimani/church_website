import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useState, useEffect } from "react";

const BIBLE_VERSES = [
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "I am the light of the world.", ref: "John 8:12" },
  { text: "Love one another as I have loved you.", ref: "John 15:12" },
  { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { text: "I have fought the good fight.", ref: "2 Timothy 4:7" },
  { text: "Cast all your anxiety on Him because He cares for you.", ref: "1 Peter 5:7" },
  { text: "The Rosary is the weapon for these times.", ref: "St. Padre Pio" },
  { text: "Jesus, I trust in You.", ref: "Divine Mercy" },
];

function getEaster(year: number) {
  const a = year % 19,
    b = Math.floor(year / 100),
    c = year % 100,
    d = Math.floor(b / 4),
    e = b % 4;
  const f = Math.floor((b + 8) / 25),
    g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4),
    k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7,
    m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getLiturgicalInfo() {
  const now = new Date(),
    y = now.getFullYear(),
    easter = getEaster(y);
  const ashWed = new Date(easter);
  ashWed.setDate(ashWed.getDate() - 46);
  const pentecost = new Date(easter);
  pentecost.setDate(pentecost.getDate() + 49);
  const christmas = new Date(y, 11, 25),
    baptism = new Date(y, 0, 12),
    advent = new Date(y, 10, 27);
  const inR = (s: Date, e: Date) => now >= s && now < e;
  if (inR(christmas, baptism))
    return { season: "Christmas", accent: "#0EA5E9" };
  if (inR(advent, christmas))
    return { season: "Advent", accent: "#8B5CF6" };
  if (inR(ashWed, easter))
    return { season: "Lent", accent: "#7C3AED" };
  if (inR(easter, pentecost))
    return { season: "Easter", accent: "#D97706" };
  return { season: "Ordinary Time", accent: "#16A34A" };
}

function getMystery() {
  return [
    "Glorious",
    "Joyful",
    "Sorrowful",
    "Glorious",
    "Luminous",
    "Joyful",
    "Sorrowful",
  ][new Date().getDay()];
}

function getMysteryTitle(mystery: string) {
  const titles: Record<string, string[]> = {
    Joyful: [
      "The Annunciation",
      "The Visitation",
      "The Nativity",
      "The Presentation",
      "The Finding in the Temple",
    ],
    Sorrowful: [
      "The Agony in the Garden",
      "The Scourging at the Pillar",
      "The Crowning with Thorns",
      "The Carrying of the Cross",
      "The Crucifixion",
    ],
    Glorious: [
      "The Resurrection",
      "The Ascension",
      "The Descent of the Holy Spirit",
      "The Assumption of Mary",
      "The Coronation of Mary",
    ],
    Luminous: [
      "The Baptism of Jesus",
      "The Wedding at Cana",
      "The Proclamation of the Kingdom",
      "The Transfiguration",
      "The Institution of the Eucharist",
    ],
  };
  const t = titles[mystery];
  return t ? t[Math.floor(Math.random() * t.length)] : mystery;
}

export default function Dashboard() {
  const { user } = useAuth();
  const mystery = getMystery();
  const liturgy = getLiturgicalInfo();
  const [verseIndex, setVerseIndex] = useState(0);
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    return h < 12
      ? "Good Morning"
      : h < 17
        ? "Good Afternoon"
        : "Good Evening";
  });
  const mysteryTitle = getMysteryTitle(mystery);

  useEffect(() => {
    const t = setInterval(
      () => setVerseIndex((q) => (q + 1) % BIBLE_VERSES.length),
      6000
    );
    return () => clearInterval(t);
  }, []);

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="min-h-screen pb-24 md:pb-8"
      style={{ backgroundColor: "#FAF8F5" }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease forwards;
        }
        .animate-delay-100 { animation-delay: 0.1s; opacity: 0; }
        .animate-delay-200 { animation-delay: 0.2s; opacity: 0; }
        .animate-delay-300 { animation-delay: 0.3s; opacity: 0; }
        .animate-delay-400 { animation-delay: 0.4s; opacity: 0; }
        .animate-delay-500 { animation-delay: 0.5s; opacity: 0; }
        .verse-fade {
          animation: fadeIn 0.5s ease;
        }
        .devotion-card:hover .devotion-arrow {
          transform: translateX(4px);
          opacity: 1;
        }
        .devotion-card:hover .devotion-overlay {
          opacity: 0.5;
        }
        .daily-scroll::-webkit-scrollbar {
          display: none;
        }
        .daily-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO - Magazine Cover Style
          ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <div
          className="relative rounded-3xl overflow-hidden animate-slide-up"
          style={{ minHeight: "340px" }}
        >
          <div className="absolute inset-0">
            <img
              src="/images/mary-rosary.jpg"
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(28,25,23,0.3) 0%, rgba(28,25,23,0.55) 40%, rgba(28,25,23,0.85) 100%)",
            }}
          />

          <div
            className="absolute top-0 left-0 right-0 h-32"
            style={{
              background:
                "linear-gradient(180deg, rgba(217,119,6,0.08) 0%, transparent 100%)",
            }}
          />

          <div
            className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-between"
            style={{ minHeight: "340px" }}
          >
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{
                    background: "rgba(217,119,6,0.2)",
                    color: "#FCD34D",
                    border: "1px solid rgba(217,119,6,0.3)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {liturgy.season}
                </span>
                <span className="text-white/30 text-xs">&middot;</span>
                <span
                  className="text-xs font-medium"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {dateStr}
                </span>
              </div>

              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {greeting}
                {user?.name ? `, ${user.name}` : ""}
              </h1>

              <div className="flex items-center gap-3 my-4">
                <div
                  className="h-px flex-1 max-w-[60px]"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(217,119,6,0.6), transparent)",
                  }}
                />
                <span style={{ color: "rgba(217,119,6,0.5)", fontSize: "14px" }}>
                  &#10013;
                </span>
                <div
                  className="h-px flex-1 max-w-[60px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(217,119,6,0.6))",
                  }}
                />
              </div>

              <div key={verseIndex} className="verse-fade">
                <p
                  className="text-base sm:text-lg italic leading-relaxed max-w-lg"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  &ldquo;{BIBLE_VERSES[verseIndex].text}&rdquo;
                </p>
                <p
                  className="text-xs font-semibold mt-2 tracking-wide"
                  style={{ color: "rgba(217,119,6,0.7)" }}
                >
                  &mdash; {BIBLE_VERSES[verseIndex].ref}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="daily-liturgy"
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl group"
                style={{
                  background:
                    "linear-gradient(135deg, #D97706, #B45309)",
                  color: "#fff",
                  boxShadow: "0 8px 32px rgba(217,119,6,0.35)",
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "0.05em",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Today&apos;s Readings
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: TODAY'S ROSARY - Large Featured Card
          ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 animate-fade-in animate-delay-200">
        <Link to="rosary" className="block group">
          <div
            className="relative rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, #1C1917 0%, #292524 50%, #1C1917 100%)",
              minHeight: "220px",
            }}
          >
            <div className="absolute inset-0">
              <img
                src="/images/mary-rosary.jpg"
                alt=""
                className="w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity duration-500"
                loading="lazy"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(28,25,23,0.9) 0%, rgba(28,25,23,0.6) 50%, rgba(28,25,23,0.85) 100%)",
                }}
              />
            </div>

            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #D97706, transparent)",
              }}
            />

            <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500"
                style={{
                  boxShadow:
                    "0 0 0 3px rgba(217,119,6,0.3), 0 8px 32px rgba(0,0,0,0.4)",
                }}
              >
                <img
                  src="/images/mary-rosary.jpg"
                  alt="Rosary"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(217,119,6,0.2), transparent)",
                  }}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold tracking-[0.25em] uppercase"
                    style={{ color: "#D97706" }}
                  >
                    Today&apos;s Rosary
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(217,119,6,0.4)" }}
                  >
                    &mdash;
                  </span>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-1"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {mystery} Mysteries
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {mysteryTitle}
                </p>
              </div>

              <div
                className="px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group-hover:scale-105 flex items-center gap-2 flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #D97706, #B45309)",
                  color: "#fff",
                  boxShadow: "0 4px 24px rgba(217,119,6,0.4)",
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "0.1em",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a10 10 0 1 0 10 10" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
                Pray Now
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: DEVOTIONS GRID - Book Cover Style
          ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10">
        <div className="flex items-center gap-4 mb-6 animate-fade-in animate-delay-300">
          <h2
            className="text-xs font-bold tracking-[0.25em] uppercase"
            style={{ color: "#B45309", fontFamily: "'Cinzel', serif" }}
          >
            Devotions
          </h2>
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(180,83,9,0.3), transparent)",
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in animate-delay-400">
          {[
            {
              to: "rosary",
              title: "The Holy\nRosary",
              desc: "Joyful, Sorrowful, Glorious & Luminous Mysteries",
              img: "/images/mary-rosary.jpg",
              color: "#D97706",
            },
            {
              to: "seven-sorrows",
              title: "Seven\nSorrows",
              desc: "The Servite Rosary of Our Lady of Sorrows",
              img: "/images/mary-immaculate.jpg",
              color: "#64748B",
            },
            {
              to: "divine-mercy",
              title: "Divine\nMercy",
              desc: "The Chaplet of God's infinite mercy for all",
              img: "/images/christ.jpg",
              color: "#EF4444",
            },
            {
              to: "st-michael",
              title: "St. Michael\nChaplet",
              desc: "Nine decades for the nine angelic choirs",
              img: "/images/christ.webp",
              color: "#B45309",
            },
            {
              to: "reparation",
              title: "Rosary of\nReparation",
              desc: "Offering for sins against the Sacred Heart",
              img: "/images/mary-madonna.jpg",
              color: "#7F1D1D",
            },
          ].map((d) => (
            <Link
              key={d.to}
              to={d.to}
              className="devotion-card group relative rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl"
              style={{ minHeight: "200px" }}
            >
              <div className="absolute inset-0">
                <img
                  src={d.img}
                  alt={d.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div
                  className="devotion-overlay absolute inset-0 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(28,25,23,0.82) 0%, rgba(28,25,23,0.6) 100%)",
                    opacity: 0.75,
                  }}
                />
              </div>

              <div
                className="absolute top-0 left-0 w-1 h-full transition-all duration-500 group-hover:w-1.5"
                style={{ background: d.color }}
              />

              <div
                className="relative z-10 p-5 sm:p-6 flex flex-col justify-between h-full"
                style={{ minHeight: "200px" }}
              >
                <div>
                  <h3
                    className="text-xl sm:text-2xl font-bold text-white leading-tight whitespace-pre-line mb-2"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    {d.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed max-w-[200px]"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {d.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span
                    className="text-[10px] font-bold tracking-[0.2em] uppercase"
                    style={{ color: d.color }}
                  >
                    Pray
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="devotion-arrow transition-all duration-300 opacity-50"
                    style={{ color: d.color }}
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: DAILY - Horizontal Scroll Row
          ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10">
        <div className="flex items-center gap-4 mb-6 animate-fade-in animate-delay-500">
          <h2
            className="text-xs font-bold tracking-[0.25em] uppercase"
            style={{ color: "#B45309", fontFamily: "'Cinzel', serif" }}
          >
            Daily Devotions
          </h2>
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(180,83,9,0.3), transparent)",
            }}
          />
        </div>

        <div className="daily-scroll flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            {
              to: "daily-liturgy",
              title: "Daily Missal",
              desc: "Today's Readings, Psalms & Gospel reflection",
              icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5v15z M4 19.5A2.5 2.5 0 0 1 6.5 17H20",
              color: "#D97706",
              bg: "linear-gradient(135deg, rgba(217,119,6,0.08), rgba(217,119,6,0.03))",
            },
            {
              to: "readings",
              title: "Prayers",
              desc: "Catholic prayers in English & Kiswahili",
              icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
              color: "#B45309",
              bg: "linear-gradient(135deg, rgba(180,83,9,0.08), rgba(180,83,9,0.03))",
            },
            {
              to: "prayer-module",
              title: "Novenas",
              desc: "Nine-day devotions with calendar tracker",
              icon: "M18.5 4a2.5 2.5 0 0 0-5 0v3.5a3 3 0 0 0 6 0V4z M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
              color: "#92400E",
              bg: "linear-gradient(135deg, rgba(146,64,14,0.08), rgba(146,64,14,0.03))",
            },
            {
              to: "bible",
              title: "Holy Bible",
              desc: "Read and reflect on God's Word",
              icon: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
              color: "#78350F",
              bg: "linear-gradient(135deg, rgba(120,53,15,0.08), rgba(120,53,15,0.03))",
            },
          ].map((d) => (
            <Link
              key={d.to}
              to={d.to}
              className="group flex-shrink-0 w-[220px] sm:w-auto sm:flex-1 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                background: d.bg,
                border: "1px solid rgba(180,83,9,0.1)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `${d.color}12`,
                  color: d.color,
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {d.icon.split(" M").map((seg, i) => {
                    const path = i === 0 ? seg : `M${seg}`;
                    return <path key={i} d={path} />;
                  })}
                </svg>
              </div>
              <h3
                className="text-sm font-bold mb-1 transition-colors duration-300 group-hover:text-amber-800"
                style={{
                  color: "#1C1917",
                  fontFamily: "'Cinzel', serif",
                }}
              >
                {d.title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#78716C" }}
              >
                {d.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: MORE TO EXPLORE - Text Links
          ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 mb-8">
        <div className="flex items-center gap-4 mb-5">
          <h2
            className="text-xs font-bold tracking-[0.25em] uppercase"
            style={{ color: "#B45309", fontFamily: "'Cinzel', serif" }}
          >
            More to Explore
          </h2>
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(180,83,9,0.3), transparent)",
            }}
          />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {[
            { to: "liturgy", label: "Liturgy Guide" },
            { to: "liturgical-seasons", label: "Liturgical Seasons" },
            { to: "prayers-of-the-mass", label: "Prayers of the Mass" },
            { to: "sacra-liturgia", label: "Sacra Liturgia" },
          ].map((d) => (
            <Link
              key={d.to}
              to={d.to}
              className="group inline-flex items-center gap-1.5 text-sm transition-colors duration-200"
              style={{ color: "#78716C" }}
            >
              <span
                className="group-hover:text-amber-700 transition-colors duration-200"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 600,
                }}
              >
                {d.label}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: MY PROGRESS - If logged in
          ═══════════════════════════════════════════════════════════ */}
      {user && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
          <Link to="progress" className="block group">
            <div
              className="rounded-2xl p-5 sm:p-6 flex items-center justify-between transition-all duration-300 hover:shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(22,163,74,0.06), rgba(22,163,74,0.02))",
                border: "1px solid rgba(22,163,74,0.12)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: "rgba(22,163,74,0.1)",
                    color: "#16A34A",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 7l-8.5 8.5-5-5L2 17" />
                    <path d="M16 7h6v6" />
                  </svg>
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: "#1C1917",
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    My Spiritual Progress
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#78716C" }}>
                    Track your prayer journey
                  </p>
                </div>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-stone-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
