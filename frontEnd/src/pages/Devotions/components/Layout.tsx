import { Outlet, NavLink } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar'

export default function Layout() {
  useEffect(() => {
    const saved = localStorage.getItem('devotions-bg-image');
    if (saved) {
      const container = document.querySelector('.devotions-view-container');
      if (container) {
        container.style.setProperty('--bg-custom-image', `url('${saved}')`);
      }
    }
  }, []);

   return (
     <div className="devotions-view-container relative" style={{ minHeight: '100vh', width: '100%', background: '#FAF8F5', display: 'flex' }}>
       {/* ═══════════════ LIGHT AMBIENT BACKGROUND ═══════════════ */}
       <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Soft warm glows */}
         <div className="absolute inset-0" style={{
           background: `
             radial-gradient(ellipse 60% 40% at 85% -5%, rgba(217, 119, 6, 0.08), transparent),
             radial-gradient(ellipse 50% 40% at -5% 15%, rgba(217, 119, 6, 0.05), transparent),
             radial-gradient(ellipse 80% 50% at 50% 110%, rgba(217, 119, 6, 0.06), transparent)
           `,
         }} />
       </div>

       {/* ═══════════════ CONTENT LAYER ═══════════════ */}
        <div className="relative z-10 flex w-full" style={{ flex: 1, minHeight: '100vh', color: '#1C1917' }}>
          {/* Sidebar - hidden on mobile, fixed column on desktop */}
          <div className="hidden md:flex flex-shrink-0 sticky top-16 lg:top-20 self-start z-30 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
            <Sidebar />
          </div>
         
         {/* Main content */}
         <main className="flex-1 min-w-0 overflow-y-auto pb-8 pl-14 md:pl-0">
           <Outlet />
         </main>
         
          {/* Mobile left navigation rail */}
          <nav
            className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-14 py-4 flex flex-col items-center justify-center gap-2"
            style={{
              background: "rgba(250, 248, 245, 0.9)",
              backdropFilter: "blur(20px) saturate(1.8)",
              WebkitBackdropFilter: "blur(20px) saturate(1.8)",
              borderRight: "1px solid rgba(28, 25, 23, 0.08)",
              boxShadow: "4px 0 20px rgba(0,0,0,0.08)",
            }}
          >
             {[
               { to: "/devotions", label: "Home", icon: "\u2302", key: "home" },
               { to: "/devotions/readings", label: "Prayers", icon: "\uD83D\uDCD6", key: "book" },
               { to: "/devotions/prayer-module", label: "Novenas", icon: "\uD83D\uDD6F\uFE0F", key: "novena" },
               { to: "/devotions/daily-liturgy", label: "Missal", icon: "\u271D", key: "missal" },
             ].map((item) => (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.to === "/devotions"}
                className={({ isActive }) => `
                  flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all w-11
                  ${isActive 
                    ? "text-amber-600 bg-amber-600/10" 
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-900/5"
                  }
                  min-h-[52px] justify-center
                `}
              >
               <span className="text-xl leading-none">{item.icon}</span>
               <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
             </NavLink>
           ))}
         </nav>
       </div>
     </div>
   )
}
