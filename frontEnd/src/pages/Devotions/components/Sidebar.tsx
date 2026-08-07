import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  FaHome,
  FaBook,
  FaPrayingHands,
  FaChurch,
  FaStar,
  FaChartBar,
  FaUserGraduate,
  FaCross,
  FaBookOpen,
  FaBible,
  FaChevronDown,
} from "react-icons/fa";

const PRAYER_SUBITEMS = [
  { to: "readings", label: "Prayer Book", icon: <FaBook size={14} /> },
  { to: "prayer-module", label: "Novenas & Litanies", icon: <FaBookOpen size={14} /> },
  { to: "rosary", label: "Holy Rosary", icon: <FaPrayingHands size={14} /> },
];

const LITURGY_SUBITEMS = [
  { to: "liturgy", label: "Liturgy Guide", icon: <FaChurch size={14} /> },
  { to: "daily-liturgy", label: "Liturgy Session", icon: <FaChurch size={14} /> },
  { to: "prayers-of-the-mass", label: "Prayers of the Mass", icon: <FaPrayingHands size={14} /> },
  { to: "liturgical-seasons", label: "Liturgical Seasons", icon: <FaCross size={14} /> },
  { to: "sacra-liturgia-page", label: "Sacra Liturgia", icon: <FaBookOpen size={14} /> },
];

const otherItems = [
  { to: "bible", label: "Holy Bible", icon: <FaBible size={16} /> },
  { to: "challenge", label: "Daily Challenge", icon: <FaStar size={16} /> },
  { to: "comparison", label: "Jumuiya Comparison", icon: <FaChartBar size={16} /> },
  { to: "progress", label: "My Progress", icon: <FaUserGraduate size={16} /> },
  { to: "daily-liturgy", label: "Daily Missal", icon: <FaCross size={16} /> },
];

// Personal tabs — only visible to authenticated members.
const PROTECTED_ITEM_TO = new Set(["challenge", "comparison", "progress"]);

const mobileNavItems = [
  { to: "/devotions", label: "Home", icon: <FaHome size={16} /> },
  { to: "readings", label: "Prayers", icon: <FaBook size={16} /> },
  { to: "prayer-module", label: "Novenas", icon: <FaBookOpen size={16} /> },
  { to: "daily-liturgy", label: "Missal", icon: <FaCross size={16} /> },
];

const quickLinks = [
  { title: "Explore the Mass", description: "Deepen your understanding", link: "/devotions/liturgy", icon: <FaChurch size={14} /> },
  { title: "Catholic Prayers", description: "Browse all prayers", link: "/devotions/readings", icon: <FaBook size={14} /> },
  { title: "Pray the Rosary", description: "Meditate on the mysteries", link: "/devotions/rosary", icon: <FaPrayingHands size={14} /> },
];

function QuickLinks() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % quickLinks.length), 6000);
    return () => clearInterval(t);
  }, []);

  const item = quickLinks[index];

  return (
    <div className="mt-4 px-2">
      <NavLink
        to={item.link}
        className="block rounded-xl p-4 transition-all duration-300 group"
        style={{
          background: "linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(217, 119, 6, 0.02))",
          border: "1px solid rgba(217, 119, 6, 0.12)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(217, 119, 6, 0.08))",
              color: "#D97706",
            }}
          >
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{item.title}</p>
            <p className="text-[10px] text-slate-400 truncate">{item.description}</p>
          </div>
          <span className="text-[10px] text-amber-400/60 group-hover:text-amber-400 transition-colors">→</span>
        </div>
        <div className="flex gap-1.5">
          {quickLinks.map((_, i) => (
            <div
              key={i}
              className="h-0.5 rounded-full flex-1 transition-all duration-500"
              style={{
                background: i === index ? "#D97706" : "rgba(217, 119, 6, 0.15)",
              }}
            />
          ))}
        </div>
      </NavLink>
    </div>
  );
}

export default function Sidebar() {
  const { isAuthenticated } = useAuth();
  const [prayersOpen, setPrayersOpen] = useState(false);
  const [liturgyOpen, setLiturgyOpen] = useState(false);
  const visibleOtherItems = otherItems.filter(
    (it) => isAuthenticated || !PROTECTED_ITEM_TO.has(it.to)
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 h-full flex-shrink-0"
        style={{
          background: "rgba(11, 15, 27, 0.6)",
          backdropFilter: "blur(24px) saturate(1.5)",
          WebkitBackdropFilter: "blur(24px) saturate(1.5)",
          borderRight: "1px solid rgba(217, 119, 6, 0.08)",
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #D97706, #B45309)",
                boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
              }}
            >
              <FaCross size={16} className="text-white" />
            </div>
            <div>
              <h1
                className="text-sm font-bold tracking-wide text-white"
                style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
              >
                SPIRITUAL
              </h1>
              <p className="text-[10px] tracking-[0.2em] text-amber-400/70 uppercase">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.15), transparent)" }} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
          {/* Dashboard */}
          <NavLink
            to="/devotions"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                isActive ? "" : "text-slate-400 hover:text-slate-200"
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    background: "linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(217, 119, 6, 0.05))",
                    color: "#FCD34D",
                    boxShadow: "inset 0 0 0 1px rgba(217, 119, 6, 0.2)",
                  }
                : undefined
            }
          >
            <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <FaHome size={16} />
            </span>
            <span>Dashboard</span>
          </NavLink>

          {/* Prayers Dropdown */}
          <div>
            <button
              onClick={() => setPrayersOpen(!prayersOpen)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 w-full text-left group"
              style={{
                background: prayersOpen
                  ? "linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(217, 119, 6, 0.05))"
                  : "transparent",
                color: prayersOpen ? "#FCD34D" : "#94A3B8",
                border: "none",
                cursor: "pointer",
                boxShadow: prayersOpen ? "inset 0 0 0 1px rgba(217, 119, 6, 0.2)" : "none",
              }}
              onMouseEnter={(e) => { if (!prayersOpen) e.currentTarget.style.color = "#CBD5E1"; }}
              onMouseLeave={(e) => { if (!prayersOpen) e.currentTarget.style.color = "#94A3B8"; }}
            >
              <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <FaPrayingHands size={16} />
              </span>
              <span className="flex-1">Prayers</span>
              <FaChevronDown
                size={10}
                style={{
                  transition: "transform 0.2s",
                  transform: prayersOpen ? "rotate(180deg)" : "rotate(0)",
                  opacity: 0.5,
                }}
              />
            </button>

            {/* Sub-items */}
            {prayersOpen && (
              <div className="ml-4 mt-1 space-y-0.5" style={{ animation: "fadeIn 0.2s ease" }}>
                {PRAYER_SUBITEMS.map((sub) => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 ${
                        isActive ? "" : "text-slate-500 hover:text-slate-300"
                      }`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? {
                            background: "rgba(217, 119, 6, 0.1)",
                            color: "#FBBF24",
                          }
                        : undefined
                    }
                  >
                    <span className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      {sub.icon}
                    </span>
                    <span>{sub.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Liturgy Dropdown */}
          <div>
            <button
              onClick={() => setLiturgyOpen(!liturgyOpen)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 w-full text-left group"
              style={{
                background: liturgyOpen
                  ? "linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(217, 119, 6, 0.05))"
                  : "transparent",
                color: liturgyOpen ? "#FCD34D" : "#94A3B8",
                border: "none",
                cursor: "pointer",
                boxShadow: liturgyOpen ? "inset 0 0 0 1px rgba(217, 119, 6, 0.2)" : "none",
              }}
              onMouseEnter={(e) => { if (!liturgyOpen) e.currentTarget.style.color = "#CBD5E1"; }}
              onMouseLeave={(e) => { if (!liturgyOpen) e.currentTarget.style.color = "#94A3B8"; }}
            >
              <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <FaChurch size={16} />
              </span>
              <span className="flex-1">Liturgy</span>
              <FaChevronDown
                size={10}
                style={{
                  transition: "transform 0.2s",
                  transform: liturgyOpen ? "rotate(180deg)" : "rotate(0)",
                  opacity: 0.5,
                }}
              />
            </button>

            {/* Sub-items */}
            {liturgyOpen && (
              <div className="ml-4 mt-1 space-y-0.5" style={{ animation: "fadeIn 0.2s ease" }}>
                {LITURGY_SUBITEMS.map((sub) => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 ${
                        isActive ? "" : "text-slate-500 hover:text-slate-300"
                      }`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? {
                            background: "rgba(217, 119, 6, 0.1)",
                            color: "#FBBF24",
                          }
                        : undefined
                    }
                  >
                    <span className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      {sub.icon}
                    </span>
                    <span>{sub.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Other items */}
          {visibleOtherItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
                  isActive ? "" : "text-slate-400 hover:text-slate-200"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: "linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(217, 119, 6, 0.05))",
                      color: "#FCD34D",
                      boxShadow: "inset 0 0 0 1px rgba(217, 119, 6, 0.2)",
                    }
                  : undefined
              }
            >
              <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                {it.icon}
              </span>
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Quick Links */}
        <QuickLinks />

        {/* Bottom Accent */}
        <div className="px-5 py-4 mt-auto">
          <div className="h-px mb-3" style={{ background: "linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.15), transparent)" }} />
          <NavLink
            to="/devotions"
            end
            className="flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02] group"
            style={{
              background: "linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(217, 119, 6, 0.04))",
              border: "1px solid rgba(217, 119, 6, 0.15)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
                background: "linear-gradient(135deg, rgba(217, 119, 6, 0.25), rgba(217, 119, 6, 0.1))",
              }}>
                <FaHome size={12} className="text-amber-400" />
              </div>
              <span className="text-[11px] font-bold text-amber-400" style={{ fontFamily: "'Cinzel', serif" }}>
                Dashboard
              </span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </NavLink>
          <p className="text-[10px] text-center text-slate-500 tracking-wider mt-3">
            ✦ DEVS: SACRED SPACE ✦
          </p>
        </div>
      </aside>

       {/* Mobile Bottom Navigation */}
       <nav
         className="fixed bottom-0 left-0 right-0 md:hidden flex justify-around py-2 z-50"
         style={{
           background: "rgba(11, 15, 27, 0.85)",
           backdropFilter: "blur(20px) saturate(1.8)",
           WebkitBackdropFilter: "blur(20px) saturate(1.8)",
           borderTop: "1px solid rgba(217, 119, 6, 0.1)",
           boxShadow: "0 -4px 20px rgba(0,0,0,0.4)",
         }}
       >
         {mobileNavItems.map((it) => (
           <NavLink
             key={it.to}
             to={it.to}
             end={it.to === "/devotions"}
             className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200 text-slate-500 hover:text-slate-200 hover:bg-white/5 min-h-[48px] justify-center"
             style={({ isActive }) =>
               isActive
                 ? {
                     color: "#D97706",
                     background: "rgba(217, 119, 6, 0.08)",
                   }
                 : undefined
             }
           >
             <span className="text-xl">{it.icon}</span>
             <span className="text-[8px] font-medium tracking-wide">{it.label.split(" ")[0]}</span>
           </NavLink>
         ))}
       </nav>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </>
  );
}
