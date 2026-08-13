import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('devotions-bg-image');
    if (saved) {
      const container = document.querySelector('.devotions-view-container');
      if (container) {
        container.style.setProperty('--bg-custom-image', `url('${saved}')`);
      }
    }
  }, []);

  // Close the drawer whenever the route changes (link tapped inside it).
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

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
          {/* Sidebar - fixed column on desktop, inside drawer on mobile */}
          <div className="hidden md:flex flex-shrink-0 sticky top-16 lg:top-20 self-start z-30 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
            <Sidebar />
          </div>

         {/* Main content */}
         <main className="flex-1 min-w-0 overflow-y-auto pb-8">
           <Outlet />
         </main>

          {/* Mobile: hamburger to open the same sidebar in a left drawer */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle Devotions navigation"
            className="md:hidden fixed left-3 top-20 z-50 w-11 h-11 rounded-xl flex items-center justify-center transition-transform active:scale-95"
            style={{
              background: "rgba(250, 248, 245, 0.95)",
              backdropFilter: "blur(20px) saturate(1.8)",
              WebkitBackdropFilter: "blur(20px) saturate(1.8)",
              border: "1px solid rgba(28, 25, 23, 0.08)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
              color: "#B45309",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Mobile drawer overlay */}
          {mobileNavOpen && (
            <div
              className="md:hidden fixed inset-0 top-16 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setMobileNavOpen(false)}
            />
          )}

          {/* Mobile drawer — the exact same sidebar as desktop */}
          <div
            className={`md:hidden fixed left-0 top-16 bottom-0 z-50 w-[75%] max-w-[300px] transition-transform duration-300 ease-out ${
              mobileNavOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            style={{ boxShadow: "8px 0 40px rgba(0,0,0,0.12)" }}
          >
            <Sidebar />
          </div>
       </div>
     </div>
   )
}