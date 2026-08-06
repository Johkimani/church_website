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
     <div className="devotions-view-container relative" style={{ minHeight: '100vh', width: '100%', background: '#050810', display: 'flex' }}>
       {/* ═══════════════ CELESTIAL BACKGROUND ═══════════════ */}
       <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Star field */}
         <div className="absolute inset-0" style={{
           backgroundImage: `
             radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.8), transparent),
             radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.6), transparent),
             radial-gradient(1.5px 1.5px at 40% 10%, rgba(255,255,255,0.9), transparent),
             radial-gradient(1px 1px at 55% 45%, rgba(255,255,255,0.5), transparent),
             radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.7), transparent),
             radial-gradient(1.5px 1.5px at 85% 55%, rgba(255,255,255,0.8), transparent),
             radial-gradient(1px 1px at 15% 65%, rgba(255,255,255,0.4), transparent),
             radial-gradient(1px 1px at 35% 80%, rgba(255,255,255,0.6), transparent),
             radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.5), transparent),
             radial-gradient(1.5px 1.5px at 80% 85%, rgba(255,255,255,0.7), transparent),
             radial-gradient(1px 1px at 90% 40%, rgba(255,255,255,0.6), transparent),
             radial-gradient(1px 1px at 5% 90%, rgba(255,255,255,0.4), transparent),
             radial-gradient(1px 1px at 50% 55%, rgba(255,255,255,0.5), transparent),
             radial-gradient(1px 1px at 65% 30%, rgba(255,255,255,0.6), transparent),
             radial-gradient(1.5px 1.5px at 20% 50%, rgba(217,119,6,0.6), transparent),
             radial-gradient(1px 1px at 75% 65%, rgba(217,119,6,0.4), transparent),
             radial-gradient(1px 1px at 45% 25%, rgba(139,92,246,0.5), transparent),
             radial-gradient(1px 1px at 95% 75%, rgba(139,92,246,0.4), transparent)
           `,
         }} />

         {/* Nebular galaxy cross — left side */}
         <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] pointer-events-none" style={{
           background: `
             radial-gradient(ellipse 40% 60% at 50% 50%, rgba(67, 56, 202, 0.2), transparent),
             radial-gradient(ellipse 60% 30% at 50% 50%, rgba(99, 102, 241, 0.15), transparent)
           `,
           filter: 'blur(30px)',
           transform: 'rotate(-15deg)',
         }}>
           {/* Cross shape */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{
             width: '120px', height: '280px',
             background: 'linear-gradient(180deg, rgba(67, 56, 202, 0.3), rgba(99, 102, 241, 0.15), rgba(67, 56, 202, 0.3))',
             filter: 'blur(20px)',
             borderRadius: '8px',
           }} />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{
             width: '220px', height: '60px',
             background: 'linear-gradient(90deg, rgba(67, 56, 202, 0.3), rgba(99, 102, 241, 0.15), rgba(67, 56, 202, 0.3))',
             filter: 'blur(20px)',
             borderRadius: '8px',
           }} />
           {/* Luminous glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full" style={{
             background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6), transparent)',
             filter: 'blur(8px)',
           }} />
         </div>

         {/* Jesus illustration area — right side */}
         <div className="absolute top-10 right-0 w-[450px] h-[600px] pointer-events-none opacity-20" style={{
           background: `
             radial-gradient(ellipse 50% 70% at 60% 40%, rgba(217, 119, 6, 0.15), transparent),
             radial-gradient(ellipse 30% 40% at 50% 30%, rgba(255, 255, 255, 0.05), transparent)
           `,
           filter: 'blur(20px)',
         }}>
           {/* Star-like points around figure */}
           {[...Array(8)].map((_, i) => (
             <div key={i} className="absolute rounded-full" style={{
               width: `${3 + Math.random() * 4}px`,
               height: `${3 + Math.random() * 4}px`,
               top: `${15 + Math.random() * 40}%`,
               left: `${30 + Math.random() * 40}%`,
               background: `radial-gradient(circle, rgba(217, 196, 130, ${0.4 + Math.random() * 0.4}), transparent)`,
               filter: 'blur(1px)',
             }} />
           ))}
         </div>

         {/* Ambient glow overlays */}
         <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{
           background: `
             radial-gradient(ellipse 80% 50% at 50% 0%, rgba(67, 56, 202, 0.08), transparent),
             radial-gradient(ellipse 60% 40% at 80% 10%, rgba(217, 119, 6, 0.04), transparent),
             radial-gradient(ellipse 50% 50% at 20% 80%, rgba(67, 56, 202, 0.03), transparent)
           `,
         }} />
       </div>

       {/* ═══════════════ CONTENT LAYER ═══════════════ */}
        <div className="relative z-10 flex w-full" style={{ flex: 1, minHeight: '100vh', color: '#E2E8F0' }}>
          {/* Sidebar - hidden on mobile, fixed column on desktop */}
          <div className="hidden md:flex flex-shrink-0 sticky top-16 lg:top-20 self-start z-30 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
            <Sidebar />
          </div>
         
         {/* Main content */}
         <main className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-8">
           <Outlet />
         </main>
         
         {/* Mobile bottom navigation */}
         <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0f1c]/95 backdrop-blur-xl border-t border-[#ffffff]/10 flex justify-around py-2">
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
                 flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all
                 ${isActive 
                   ? "text-amber-400 bg-amber-400/10" 
                   : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                 }
                 min-h-[48px] justify-center
               `}
             >
               <span className="text-xl">{item.icon}</span>
               <span className="text-[10px] font-medium">{item.label}</span>
             </NavLink>
           ))}
         </nav>
       </div>
     </div>
   )
}
