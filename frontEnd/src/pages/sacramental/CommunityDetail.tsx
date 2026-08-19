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
import { FaInfoCircle, FaUserTie, FaUsers, FaCalendarAlt, FaShareAlt, FaBars, FaBell, FaTshirt, FaArrowLeft, FaKey, FaTimes, FaUserPlus } from 'react-icons/fa';
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

const COMMUNITY_IMAGES: Record<string, string> = {
  choir: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
  dancers: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
  charismatic: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=600',
  'st-francis': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600',
  youth: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=600',
  mentorship: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=600',
};
const DEFAULT_COMMUNITY_IMAGE = 'https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&q=80&w=600';

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

  // Check if user has joined this community
  const { data: myCommData } = useQuery({
    queryKey: ['my-communities-check', moduleIdClean],
    queryFn: async () => {
      const res = await apiClient.get('/community-enrollment/my-communities');
      return res.data?.communities || [];
    },
    enabled: !!user && !!moduleIdClean,
    staleTime: 60000,
  });

  const hasJoined = isAdmin || (myCommData || []).some((c: any) => c.module_id === moduleIdClean);

  // Tabs that are publicly accessible (no join required)
  const PUBLIC_TABS: TabType[] = ['about', 'officials', 'activities'];
  const isPublicTab = PUBLIC_TABS.includes(activeTab);

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

    // Gated tabs: show join prompt if not joined
    if (!hasJoined && !isPublicTab) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg" style={{ background: detailColor }}>
            <FaUserPlus size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Join to Access</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm leading-relaxed">
            Join {moduleData.title} to view {TAB_LABELS[activeTab].toLowerCase()}, connect with members, and be part of the community.
          </p>
          <button
            onClick={() => navigate(`/community/${moduleIdClean}/join`)}
            className="px-8 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02] shadow-lg cursor-pointer"
            style={{ background: detailColor }}
          >
            <FaUserPlus className="inline mr-2" size={12} /> Join Now
          </button>
        </div>
      );
    }

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
          className="sidebar-header relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${detailColor} 0%, ${detailColor}ee 40%, ${detailColor}cc 100%)`,
          }}
        >
          <div
            className="sidebar-icon relative z-10"
            style={{
              color: 'white',
              backgroundImage: `url(${moduleData.saint_image_url || moduleData.image_url || COMMUNITY_IMAGES[moduleIdClean] || DEFAULT_COMMUNITY_IMAGE})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '3px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}
          />
          <h2 className="sidebar-title text-white drop-shadow-md relative z-10">{moduleData.title}</h2>
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
          {!hasJoined && (
            <button
              className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg cursor-pointer mb-2"
              style={{ background: detailColor }}
              onClick={() => navigate(`/community/${moduleIdClean}/join`)}
            >
              <FaUserPlus size={14} /> Join This Community
            </button>
          )}
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
      <main className="main-content" style={{
        background: `linear-gradient(180deg, ${detailColor}06 0%, ${detailColor}03 300px, var(--bg-soft) 600px)`,
      }}>
        {/* Color accent top bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${detailColor}, ${detailColor}88, ${detailColor})` }} />

        {/* Join banner for non-members */}
        {!hasJoined && user && (
          <div className="mx-4 mt-4 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm" style={{ background: `${detailColor}10`, border: `1px solid ${detailColor}20` }}>
            <FaUserPlus style={{ color: detailColor }} size={16} />
            <span className="flex-1 text-slate-600">
              You're viewing <strong>{moduleData.title}</strong> as a visitor. Join to access all features.
            </span>
            <button
              onClick={() => navigate(`/community/${moduleIdClean}/join`)}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] shadow cursor-pointer whitespace-nowrap"
              style={{ background: detailColor }}
            >
              Join Now
            </button>
          </div>
        )}

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
