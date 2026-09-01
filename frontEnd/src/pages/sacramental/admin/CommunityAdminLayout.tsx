import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaBell, FaInfoCircle, FaUserTie, FaUsers, FaCalendarAlt, FaArrowLeft, FaBars, FaTimes } from 'react-icons/fa';
import '../../Jumuiya/admin/Admin.css';

interface Props {
  color: string;
  moduleName: string;
}

const CommunityAdminLayout: React.FC<Props> = ({ color, moduleName }) => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const tabs = [
    { id: 'about', label: 'About', icon: <FaInfoCircle /> },
    { id: 'officials', label: 'Officials', icon: <FaUserTie /> },
    { id: 'members', label: 'Members', icon: <FaUsers /> },
    { id: 'activities', label: 'Activities', icon: <FaCalendarAlt /> },
    { id: 'notifications', label: 'Alerts', icon: <FaBell /> },
  ];

  const activeTab = tabs.find(t => location.pathname.includes(`/${t.id}`))?.id || 'about';

  return (
    <div className="admin-layout" style={{ '--admin-color': color } as React.CSSProperties}>
      {/* Mobile top bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
            >
              {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
            <h3 className="font-black text-sm text-slate-800 truncate">{moduleName}</h3>
            <button
              onClick={() => navigate('/admin/community-management')}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
            >
              <FaArrowLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${isMobile ? (mobileOpen ? 'mobile-open' : 'mobile-closed') : ''}`}>
        {!isMobile && (
          <div className="admin-sidebar-header">
            {!collapsed && <h3>{moduleName} Admin</h3>}
            <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? '»' : '«'}
            </button>
          </div>
        )}
        <nav className="admin-sidebar-nav">
          {tabs.map(tab => (
            <NavLink
              key={tab.id}
              to={`/admin/community-management/${moduleId}/${tab.id}`}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{tab.icon}</span>
              {!collapsed && <span className="admin-nav-label">{tab.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button onClick={() => navigate('/admin/community-management')} className="admin-back-btn">
            <FaArrowLeft /> {!collapsed && 'Back'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`admin-main ${isMobile ? 'mobile-main' : ''}`}>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-around px-2 h-16">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <NavLink
                  key={tab.id}
                  to={`/admin/community-management/${moduleId}/${tab.id}`}
                  className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all min-w-0"
                  style={isActive ? { color } : { color: '#94a3b8' }}
                >
                  <span className={`text-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {tab.icon}
                  </span>
                  <span className={`text-[10px] font-bold ${isActive ? 'font-black' : ''}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <span
                      className="absolute top-0 w-8 h-1 rounded-b-full"
                      style={{ background: color }}
                    />
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityAdminLayout;
