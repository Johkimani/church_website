import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('devotions-bg-image');
    if (saved) {
      const container = document.querySelector<HTMLElement>('.devotions-view-container');
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
            className="md:hidden fixed left-3 top-[4.5rem] z-[60] w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
            style={{
              background: mobileNavOpen ? "rgba(217, 119, 6, 0.12)" : "rgba(250, 248, 245, 0.97)",
              backdropFilter: "blur(20px) saturate(1.8)",
              WebkitBackdropFilter: "blur(20px) saturate(1.8)",
              border: mobileNavOpen ? "1px solid rgba(217, 119, 6, 0.35)" : "1px solid rgba(28, 25, 23, 0.08)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
              color: "#B45309",
            }}
          >
            {mobileNavOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          {/* Mobile drawer overlay — covers full screen including logo area */}
          {mobileNavOpen && (
            <div
              className="md:hidden fixed inset-0 top-0 bg-black/40 backdrop-blur-sm z-[55]"
              onClick={() => setMobileNavOpen(false)}
            />
          )}

          {/* Mobile drawer — slides in from left, covering the logo/header area */}
          <div
            className={`md:hidden fixed left-0 top-0 bottom-0 z-[58] w-64 max-w-[82vw] transition-transform duration-300 ease-out ${
              mobileNavOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            style={{ boxShadow: "8px 0 48px rgba(0,0,0,0.18)" }}
          >
            {/* Close button inside drawer header */}
            <div className="flex items-center justify-between px-4 pt-5 pb-3" style={{ borderBottom: "1px solid rgba(217,119,6,0.12)" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #D97706, #B45309)", boxShadow: "0 4px 12px rgba(217,119,6,0.3)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L8 6H4v4L2 12l2 2v4h4l4 4 4-4h4v-4l2-2-2-2V6h-4L12 2z"/></svg>
                </div>
                <span className="text-sm font-bold text-stone-900" style={{ fontFamily: "'Cinzel', serif" }}>SPIRITUAL</span>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <Sidebar />
          </div>
       </div>
     </div>
   )
}