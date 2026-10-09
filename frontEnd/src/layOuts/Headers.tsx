import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useApp } from "../context/AppContext";
import { FaBell, FaShoppingCart } from "react-icons/fa";
import { publicNavLinks, authNavLinks } from "./headerRoutes";
import AdminPanel from "../pages/Landing/components/AdminPanel";

const isAdminRole = (role: string | string[] | undefined): boolean => {
  if (!role) return false;
  if (Array.isArray(role)) return role.length > 0;
  return typeof role === "string" && role.trim().length > 0;
};

const Headers = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { cart, cartItemsCount, setIsCartOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAdmin, setShowAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [animateBadge, setAnimateBadge] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (unreadCount > 0) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  useEffect(() => {
    if (cart.length > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 800);
      return () => clearTimeout(timer);
    }
  }, [cart.length]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    ...publicNavLinks,
    ...(user ? authNavLinks : []),
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const openNotifications = () => {
    if (user) {
      navigate("/Notification");
    } else {
      navigate("/login?redirect=" + encodeURIComponent("/Notification"));
    }
  };

  return (
    <>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-lg shadow-sm border-b border-slate-100/50"
            : "bg-white/95 backdrop-blur-sm"
        } px-[6%] lg:px-[8%] py-0 flex justify-between items-center h-16 lg:h-20`}
      >
{/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img
              src="/images/csa-logo.jpg"
              alt="CSA Kirinyaga logo"
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg object-cover shadow-sm shadow-blue-200 group-hover:shadow-md group-hover:shadow-blue-300 transition-shadow"
            />
            <div className="hidden sm:block">
              <span className="text-base lg:text-lg font-black text-slate-900 tracking-tight">
                CSA Kirinyaga
              </span>
            </div>
          </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {/* Desktop Nav - Full horizontal layout */}
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <li key={link.path}>
                  {link.path.includes("#") ? (
                    <a
                      href={link.path}
                      className={`relative px-3 lg:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        active
                          ? "text-blue-700 bg-blue-50"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {link.name}
                      {active && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-600 rounded-full" />
                      )}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      className={`relative px-3 lg:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        active
                          ? "text-blue-700 bg-blue-50"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {link.name}
                      {active && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-600 rounded-full" />
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Right controls */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Notifications */}
            <button
              onClick={openNotifications}
              className="relative p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
              title="Notifications"
            >
              <FaBell className="text-lg" />
              {unreadCount > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black px-1.5 rounded-full border-2 border-white min-w-[18px] h-[18px] flex items-center justify-center ${
                    animateBadge ? "animate-bounce" : ""
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              className="relative p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
              onClick={() => setIsCartOpen(true)}
              title="Shopping Cart"
            >
              <FaShoppingCart className="text-lg" />
              {cart.length > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[8px] font-black px-1.5 rounded-full border-2 border-white min-w-[18px] h-[18px] flex items-center justify-center ${
                    animateCart ? "animate-bounce" : ""
                  }`}
                >
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 lg:pl-3 border-l border-slate-200">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user.name?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-semibold text-slate-700 hidden lg:block truncate max-w-[100px]">
                  {user.name}
                </span>
                {isAdminRole(user?.role) && (
                  <button
                    className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition-all"
                    onClick={() => navigate("/admin")}
                  >
                    Admin
                  </button>
                )}
                <button
                  className="text-slate-500 hover:text-red-600 px-2 py-1.5 rounded-lg font-semibold text-xs hover:bg-red-50 transition-all"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.97]"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
          <div className="flex justify-between items-center px-4 py-2">
            <div className="flex items-center gap-2">
              <img
                src="/images/csa-logo.jpg"
                alt="CSA Kirinyaga logo"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-sm font-black text-slate-900">CSA Kirinyaga</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={openNotifications}
                className="relative p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                title="Notifications"
              >
                <FaBell className="text-lg" />
                {unreadCount > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black px-1.5 rounded-full border-2 border-white min-w-[18px] h-[18px] flex items-center justify-center ${
                      animateBadge ? "animate-bounce" : ""
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              {user ? (
                <button
                  className="text-slate-500 hover:text-red-600 px-2 py-1.5 rounded-lg font-semibold text-xs hover:bg-red-50 transition-all"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-semibold text-xs transition-all"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </button>
              )}
              <button
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Open Menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 overflow-hidden overscroll-contain ${
          isMobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div
          className={`absolute top-0 left-0 w-[72%] max-w-[300px] h-full bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-md">
                <img
                  src="/images/csa-logo.jpg"
                  alt="CSA Kirinyaga logo"
                  className="w-9 h-9 object-cover"
                />
              </div>
              <div>
                <span className="font-black text-sm leading-tight">CSA Kirinyaga</span>
                <p className="text-xs text-blue-100 opacity-90">Main Menu</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y">
            <nav className="p-4 space-y-1">
              {navLinks.map((link, idx) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    style={{
                      animationDelay: `${idx * 30}ms`,
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full transition-all ${
                          active ? "bg-blue-600 scale-125" : "bg-slate-300"
                        }`}
                      />
                      {link.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-md transition-colors ${
                      active ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"
                    }`}>
                      {isActive(link.path) ? "Active" : "Go"}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-slate-100 p-4 bg-slate-50/50">
            <button
              onClick={() => {
                openNotifications();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full px-4 py-3 mb-2 rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FaBell className="text-sm text-slate-500" />
                <span className="font-semibold text-sm text-slate-700">Notifications</span>
              </div>
              <span className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
                <span className="text-xs text-slate-400 font-bold">Go</span>
              </span>
            </button>

            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-100">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm backdrop-blur-sm">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-blue-100 truncate">
                      {Array.isArray(user.role) ? user.role.join(", ") : user.role || "Member"}
                    </p>
                  </div>
                  {isAdminRole(user?.role) && (
                    <button
                      className="bg-white text-blue-700 px-3 py-1.5 rounded-lg font-semibold text-xs hover:bg-blue-50 transition-all active:scale-[0.98]"
                      onClick={() => {
                        navigate("/admin");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Admin
                    </button>
                  )}
                </div>
                <button
                  className="w-full border border-red-100 text-red-600 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 hover:border-red-200 transition-all active:scale-[0.98]"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign In to Access
              </button>
            )}

            <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-4 pt-3 border-t border-slate-100/50">
              CSA Kirinyaga &bull; 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Headers;
