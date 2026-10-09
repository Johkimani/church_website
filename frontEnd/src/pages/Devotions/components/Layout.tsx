import { Outlet } from 'react-router-dom'
import { useEffect, useRef, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import { useMobileNavEntry } from '../../../context/MobileNavContext'

export default function Layout() {
  const navRenderRef = useRef<(close: () => void) => ReactNode>(() => null);

  useEffect(() => {
    const saved = localStorage.getItem('devotions-bg-image');
    if (saved) {
      const container = document.querySelector<HTMLElement>('.devotions-view-container');
      if (container) {
        container.style.setProperty('--bg-custom-image', `url('${saved}')`);
      }
    }
  }, []);

  // Mobile: the devotions nav lives in the header drawer's context tab.
  navRenderRef.current = () => <Sidebar fillWidth />;
  useMobileNavEntry('devotions', 'Devotion', navRenderRef);

  return (
    <div className="devotions-view-container relative" style={{ minHeight: '100vh', width: '100%', background: '#FAF8F5', display: 'flex' }}>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 60% 40% at 85% -5%, rgba(217, 119, 6, 0.08), transparent),
            radial-gradient(ellipse 50% 40% at -5% 15%, rgba(217, 119, 6, 0.05), transparent),
            radial-gradient(ellipse 80% 50% at 50% 110%, rgba(217, 119, 6, 0.06), transparent)
          `,
        }} />
      </div>

      <div className="relative z-10 flex w-full" style={{ flex: 1, minHeight: '100vh', color: '#1C1917' }}>
        {/* Sidebar - fixed column on desktop only (mobile uses header drawer) */}
        <div className="hidden md:flex flex-shrink-0 sticky top-16 lg:top-20 self-start z-30 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
