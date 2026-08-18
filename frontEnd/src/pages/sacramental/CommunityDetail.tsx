import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCommunityData } from './context/CommunityDataContext';
import type { CommunityModule } from './context/CommunityDataContext';
import { apiClient } from '../../api/axiosInstance';
import CommunityAboutTab from './components/tabs/CommunityAboutTab';
import CommunityOfficialsTab from './components/tabs/CommunityOfficialsTab';
import CommunityMembersTab from './components/tabs/CommunityMembersTab';
import CommunityChannelsTab from './components/tabs/CommunityChannelsTab';
import CommunityActivitiesTab from './components/tabs/CommunityActivitiesTab';
import CommunityTshirtsTab from './components/tabs/CommunityTshirtsTab';
import CommunitySettingsTab from './components/tabs/CommunitySettingsTab';
import CommunityNotificationsTab from './components/tabs/CommunityNotificationsTab';
import { FaInfoCircle, FaUserTie, FaUsers, FaCalendarAlt, FaShareAlt, FaBars, FaBell, FaTshirt, FaArrowLeft, FaKey, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../Jumuiya/JumuiyaDetail.css';

type TabType = 'about' | 'officials' | 'channels' | 'members' | 'activities' | 'tshirts' | 'settings';

const MINISTRY_COLORS: Record<string, string> = {
  choir: '#1e3a5f',
  dancers: '#7c3aed',
  charismatic: '#db2777',
  'st-francis': '#047857',
  youth: '#8e44ad',
  mentorship: '#6d28d9',
};

const TAB_ICONS: Record<TabType, React.ReactNode> = {
  about: <FaInfoCircle />,
  officials: <FaUserTie />,
  members: <FaUsers />,
  activities: <FaCalendarAlt />,
  channels: <FaShareAlt />,
  tshirts: <FaTshirt />,
  settings: <FaKey />,
};

const TAB_LABELS: Record<TabType, string> = {
  about: 'About',
  officials: 'Officials',
  members: 'Members',
  activities: 'Activities',
  channels: 'Channels',
  tshirts: 'T-Shirts',
  settings: 'Settings',
};

const TAB_ORDER: TabType[] = ['about', 'officials', 'members', 'activities', 'channels', 'tshirts', 'settings'];

const CommunityDetail: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getModuleById } = useCommunityData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasNewNotif, setHasNewNotif] = useState(true);

  const moduleIdClean = moduleId ? moduleId.toLowerCase().replace(/[^a-z0-9-]/g, '-') : '';

  const { data: serverModuleData, isLoading, isError } = useQuery({
    queryKey: ['community', moduleIdClean],
    queryFn: async () => {
      const res = await apiClient.get(`/community-view/${moduleIdClean}`);
      if (res.data?.isMissing || res.data?.isServerError) throw new Error('Not available');
      return res.data;
    },
    retry: 1,
    staleTime: 300000,
  });

  const contextFallback = moduleIdClean ? getModuleById(moduleIdClean) : undefined;
  const moduleData: CommunityModule | undefined = serverModuleData || contextFallback;

  const detailColor = MINISTRY_COLORS[moduleIdClean || ''] || moduleData?.color || '#7c2d12';
  const isAdmin = user?.role === 'admin' || (Array.isArray(user?.role) && user.role.includes('admin'));

  const notifCount = ((moduleData as any)?.announcements || []).length;

  const setTabWithUrl = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    const params = new URLSearchParams(location.search);
    params.set('tab', tab);
    navigate({
      pathname: location.pathname,
      search: params.toString() ? `?${params.toString()}` : '',
    }, { replace: false });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab') as TabType | null;
    const validTab = tabFromUrl && TAB_ORDER.includes(tabFromUrl);
    if (validTab) setActiveTab(tabFromUrl);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.search]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  const renderTabContent = () => {
    if (!moduleData) return null;
    switch (activeTab) {
      case 'about':
        return <CommunityAboutTab module={moduleData} color={detailColor} onNavigateBack={() => navigate('/community')} onQuickLink={(tab) => setTabWithUrl(tab)} />;
      case 'officials':
        return <CommunityOfficialsTab module={moduleData} color={detailColor} isAdmin={isAdmin} />;
      case 'members':
        return <CommunityMembersTab moduleId={moduleIdClean} moduleName={moduleData.title} color={detailColor} />;
      case 'activities':
        return <CommunityActivitiesTab moduleId={moduleIdClean} color={detailColor} module={moduleData} />;
      case 'channels':
        return <CommunityChannelsTab moduleId={moduleIdClean} module={moduleData} color={detailColor} />;
      case 'tshirts':
        return <CommunityTshirtsTab moduleId={moduleIdClean} moduleName={moduleData.title} color={detailColor} />;
      case 'settings':
        return <CommunitySettingsTab color={detailColor} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="detail-page" style={{ '--jumuiya-color': detailColor } as React.CSSProperties}>
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-[3px] border-stone-200 border-t-amber-700 rounded-full animate-spin" />
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">Loading ministry…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="detail-page" style={{ '--jumuiya-color': detailColor } as React.CSSProperties}>
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-stone-200/70 max-w-md">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4">
              <FaInfoCircle size={28} />
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">Ministry Not Found</h2>
            <p className="text-stone-500 mb-6 text-sm">We could not find the community ministry you are looking for.</p>
            <button
              onClick={() => navigate('/community')}
              className="px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm cursor-pointer hover:bg-stone-800 transition-all hover:scale-[1.02] shadow-lg"
            >
              <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Community
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeIndex = TAB_ORDER.indexOf(activeTab);

  return (
    <div
      className="detail-page"
      style={{
        '--jumuiya-color': detailColor,
        '--jumuiya-color-light': `${detailColor}20`,
        '--jumuiya-color-medium': `${detailColor}50`,
        '--jumuiya-color-dark': `${detailColor}dd`,
      } as React.CSSProperties}
    >
      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div
          className="sidebar-header"
          style={{
            background: `linear-gradient(135deg, ${detailColor} 0%, ${detailColor}dd 50%, ${detailColor}bb 100%)`,
          }}
        >
          <div
            className="sidebar-icon"
            style={{
              color: 'white',
              backgroundImage: `url(${moduleData.saint_image_url || moduleData.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '3px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          />
          <h2 className="sidebar-title text-white drop-shadow-md">{moduleData.title}</h2>
        </div>

        <nav className="sidebar-nav">
          {TAB_ORDER.map((tabId, idx) => {
            const isActive = activeTab === tabId;
            return (
              <button
                key={tabId}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setTabWithUrl(tabId);
                  setIsSidebarOpen(false);
                }}
                style={isActive ? {
                  borderLeftColor: detailColor,
                  color: detailColor,
                  background: `linear-gradient(90deg, ${detailColor}10 0%, transparent 100%)`,
                } : {}}
              >
                <span
                  className="nav-icon"
                  style={isActive ? { color: detailColor } : {}}
                >
                  {TAB_ICONS[tabId]}
                </span>
                <span className="nav-label">{TAB_LABELS[tabId]}</span>
                {/* Active indicator bar */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full transition-all duration-300"
                    style={{ background: detailColor }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="btn-premium"
            onClick={() => navigate('/community')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <FaArrowLeft style={{ marginRight: '8px' }} /> All Ministries
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-wrapper animate-fade-in" key={activeTab}>
          {renderTabContent()}
        </div>
      </main>

      {/* Notification FAB */}
      {!isNotifOpen && (
        <div className="notif-fab-container">
          <button
            className="notif-fab"
            onClick={() => {
              setIsNotifOpen(true);
              setHasNewNotif(false);
            }}
            style={{ backgroundColor: detailColor }}
            aria-label="Notifications"
          >
            <FaBell />
            {hasNewNotif && notifCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center px-1.5 shadow-lg animate-bounce">
                {notifCount}
              </span>
            )}
          </button>
        </div>
      )}

      {isNotifOpen && (
        <div className="notif-panel-floating animate-slide-up">
          <div className="notif-panel-header" style={{ borderBottomColor: detailColor }}>
            <h3>Ministry Updates</h3>
            <button className="close-panel" onClick={() => setIsNotifOpen(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="notif-panel-content">
            <CommunityNotificationsTab module={moduleData} color={detailColor} />
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {(isSidebarOpen || (isNotifOpen && window.innerWidth < 768)) && (
        <div
          className="sidebar-overlay"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsNotifOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CommunityDetail;
