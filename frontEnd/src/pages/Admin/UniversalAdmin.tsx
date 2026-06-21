import {
  LayoutDashboard,
  Users,
  Heart,
  BookOpen,
  Database,
  Settings,
  Menu,
  ChevronRight,
  LogOut,
  Bell,
  LayoutGrid,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown, { type Notification } from './components/NotificationDropdown';
import apiService from '../Landing/services/api';
import { useEffect, useState } from 'react';
import { timeAgo } from '../../utils';

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'weekly-activities', name: 'Weekly Activities', icon: LayoutGrid, path: '/admin/weekly-activities' },
  { id: 'semester-activities', name: 'Semester Activities', icon: LayoutGrid, path: '/admin/semester-activities' },
  { id: 'announcements', name: 'Announcements Management', icon: Bell, path: '/admin/announcements' },
  { id: 'officials', name: 'Officials Management', icon: Users, path: '/admin/officials' },
  { id: 'community', name: 'Community Management', icon: LayoutGrid, path: '/admin/community-management' },
  { id: 'donations', name: 'Donation Monitor', icon: Heart, path: '/admin/donations' },
  { id: 'devotions', name: 'Devotions & AI', icon: BookOpen, path: '/admin/devotions' },
  { id: 'suggestions', name: 'User Suggestions', icon: MessageSquare, path: '/admin/suggestions' },
  { id: 'gallery', name: 'Gallery Manager', icon: ImageIcon, path: '/admin/gallery' },
  { id: 'sacramentals-banners', name: 'Sacramentals Banners', icon: ImageIcon, path: '/admin/sacramentals-banners' },
  { id: 'forms-distribution', name: 'Forms Distribution', icon: MessageSquare, path: '/admin/forms-distribution' },
  {
    id: 'projects',
    name: 'Project Management',
    icon: LayoutGrid,
    path: '/admin/projects'
  },
  { id: 'records', name: 'Records Explorer', icon: Database, path: '/admin/records' },
  { id: 'settings', name: 'Settings', icon: Settings, path: '/admin/settings' },
  {
  id: "products",
  name: "Products",
  icon: Database,
  path: "/admin/products"
},
{
  id: "orders",
  name: "Orders",
  icon: Database,
  path: "/admin/orders"
},
{
  id: "hire",
  name: "Hire Requests",
  icon: Database,
  path: "/admin/hire-requests"
},
];

export default function UniversalAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [suggestions, donations] = await Promise.all([
        apiService.fetchTableData('suggestions'),
        apiService.fetchTableData('mpesa_request')
      ]);

      const formattedSuggestions: Notification[] = suggestions.map((s: any) => ({
        id: `s-${s.id}`,
        type: 'suggestion',
        title: 'New Suggestion',
        message: `${s.name || 'Someone'} sent a new suggestion: "${s.suggestion}"`,
        time: timeAgo(s.created_at),
        rawDate: s.created_at,
        isRead: false,
        link: '/admin/suggestions'
      }));

      const formattedDonations: Notification[] = donations
        .filter((d: any) => d.status === 'paid')
        .map((d: any) => ({
          id: `d-${d.checkout_id || Math.random()}`,
          type: 'donation',
          title: 'New Donation',
          message: `Received KES ${Number(d.amount).toLocaleString()} from ${d.user_id}`,
          time: timeAgo(d.created_at),
          rawDate: d.created_at,
          isRead: false,
          link: '/admin/donations'
        }));

      // Combine and sort by date descending
      const combined = [...formattedSuggestions, ...formattedDonations]
        .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
        .slice(0, 10);

      setNotifications(combined);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setIsNotificationsOpen(false);
  };

  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="h-screen bg-slate-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-72' : 'w-20'
          } bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-slate-100 transition-all duration-300 ease-in-out flex flex-col z-50 shadow-2xl`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800 shrink-0">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner shadow-slate-900/20">
            <span className="text-white font-bold text-xl tracking-tight">C</span>
          </div>
          {isSidebarOpen && (
            <div className="ml-4 overflow-hidden">
              <h1 className="text-white font-bold truncate text-lg">CSA KIRINYAGA</h1>
              <p className="text-xs text-slate-400 truncate">Admin Command Center</p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.id === 'dashboard' && location.pathname === '/admin');
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center group transition-all duration-200 px-4 py-4 rounded-3xl ${isActive
                    ? 'bg-blue-500/95 text-white shadow-xl shadow-blue-900/30'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <item.icon size={22} className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-blue-200'} />
                {isSidebarOpen && (
                  <div className="ml-4 flex-1 flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm leading-tight">{item.name}</span>
                    {isActive && <ChevronRight size={16} className="text-blue-200" />}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="ml-4 font-semibold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="admin-panel-header">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 transition duration-200"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 hidden md:flex md:items-center md:justify-center">
            <div className="relative max-w-lg text-center">
              <h2 className="text-slate-900 font-bold text-lg">Welcome back, {user?.name || 'Admin'}</h2>
              <p className="text-xs text-slate-500 mt-1">Here's what's happening with your church dashboard today.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative p-2 transition-colors ${isNotificationsOpen ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
            >
              <Bell size={22} />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <NotificationDropdown
                notifications={notifications}
                onClose={() => setIsNotificationsOpen(false)}
                onMarkAsRead={handleMarkAsRead}
                onClearAll={handleClearAll}
              />
            )}
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{user?.name}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-700 font-black">
                {user?.name?.[0] ?? 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          <div className="p-8 max-w-full">
            <div className="admin-panel-card min-h-[calc(100vh-9rem)]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
