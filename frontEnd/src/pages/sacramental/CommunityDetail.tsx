import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCommunityData } from './context/CommunityDataContext';
import type { CommunityModule } from './context/CommunityDataContext';
import { apiClient } from '../../api/axiosInstance';
import CommunityAboutTab from './components/tabs/CommunityAboutTab';
import CommunityOfficialsTab from './components/tabs/CommunityOfficialsTab';
import CommunityMembersTab from './components/tabs/CommunityMembersTab';
import CommunityRegistrationTab from './components/tabs/CommunityRegistrationTab';
import CommunityStampCardTab from './components/tabs/CommunityStampCardTab';
import CommunityChannelsTab from './components/tabs/CommunityChannelsTab';
import CommunityActivitiesTab from './components/tabs/CommunityActivitiesTab';
import CommunityTshirtsTab from './components/tabs/CommunityTshirtsTab';
import CommunitySettingsTab from './components/tabs/CommunitySettingsTab';
import CommunityNotificationsTab from './components/tabs/CommunityNotificationsTab';
import { FaInfoCircle, FaUserTie, FaUsers, FaCalendarAlt, FaUserPlus, FaShareAlt, FaBars, FaBell, FaTshirt, FaArrowLeft, FaKey, FaStamp, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../Jumuiya/JumuiyaDetail.css';

type TabType = 'about' | 'officials' | 'registration' | 'channels' | 'members' | 'activities' | 'tshirts' | 'settings' | 'stampcard';

const MINISTRY_COLORS: Record<string, string> = {
  choir: '#7c2d12',
  dancers: '#9a3412',
  charismatic: '#b45309',
  'st-francis': '#92400e',
  youth: '#a16207',
  mentorship: '#6d28d9',
};

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
  const isMemberOfThisCommunity = !!(user?.role);

  const isAdmin = user?.role === 'admin' || (Array.isArray(user?.role) && user.role.includes('admin'));

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
    const validTab = tabFromUrl && [
      'about', 'officials', 'registration', 'channels', 'members',
      'activities', 'tshirts', 'settings', 'stampcard'
    ].includes(tabFromUrl);
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

  const tabs = [
    { id: 'about' as TabType, label: 'About', icon: <FaInfoCircle /> },
    { id: 'officials' as TabType, label: 'Officials', icon: <FaUserTie /> },
    { id: 'members' as TabType, label: 'Members', icon: <FaUsers /> },
    { id: 'registration' as TabType, label: 'Registration', icon: <FaUserPlus /> },
    { id: 'stampcard' as TabType, label: 'Stamp Card', icon: <FaStamp /> },
    { id: 'activities' as TabType, label: 'Activities', icon: <FaCalendarAlt /> },
    { id: 'channels' as TabType, label: 'Channels', icon: <FaShareAlt /> },
    { id: 'tshirts' as TabType, label: 'T-Shirts', icon: <FaTshirt /> },
    { id: 'settings' as TabType, label: 'Settings', icon: <FaKey /> },
  ];

  const renderTabContent = () => {
    if (!moduleData) return null;
    switch (activeTab) {
      case 'about':
        return <CommunityAboutTab module={moduleData} color={detailColor} onNavigateBack={() => navigate('/community')} onQuickLink={(tab) => setTabWithUrl(tab)} />;
      case 'officials':
        return <CommunityOfficialsTab module={moduleData} color={detailColor} isAdmin={isAdmin} />;
      case 'members':
        return <CommunityMembersTab moduleId={moduleIdClean} moduleName={moduleData.title} color={detailColor} />;
      case 'registration':
        return <CommunityRegistrationTab moduleId={moduleIdClean} moduleName={moduleData.title} color={detailColor} module={moduleData} />;
      case 'stampcard':
        return <CommunityStampCardTab moduleId={moduleIdClean} moduleName={moduleData.title} color={detailColor} />;
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
          <div className="animate-spin text-amber-800"><i className="fas fa-circle-notch text-4xl"></i></div>
        </div>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="detail-page" style={{ '--jumuiya-color': detailColor } as React.CSSProperties}>
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-8 bg-white rounded-sm shadow-lg border border-stone-200/70 max-w-md">
            <i className="fas fa-exclamation-triangle text-4xl text-amber-500 mb-4"></i>
            <h2 className="text-xl font-bold text-stone-800 mb-2">Ministry Not Found</h2>
            <p className="text-stone-500 mb-6">We could not find the community ministry you are looking for.</p>
            <button onClick={() => navigate('/community')} className="px-6 py-2 bg-stone-900 text-white rounded-full font-medium cursor-pointer">
              <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Community
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="sidebar-header">
          <div
            className="sidebar-icon"
            style={{
              color: 'white',
              backgroundImage: `url(${moduleData.saint_image_url || moduleData.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: detailColor,
            }}
          />
          <h2 className="sidebar-title">{moduleData.title}</h2>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setTabWithUrl(tab.id);
                setIsSidebarOpen(false);
              }}
              style={activeTab === tab.id ? {
                borderLeftColor: detailColor,
                color: detailColor,
                background: `linear-gradient(90deg, ${detailColor}10 0%, transparent 100%)`
              } : {}}
            >
              <span className="nav-icon" style={activeTab === tab.id ? { color: detailColor } : {}}>{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
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
        <div className="content-wrapper animate-fade-in">
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
            {hasNewNotif && <span className="notif-badge-pulsing" />}
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
