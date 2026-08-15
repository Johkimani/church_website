import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useApp } from "../context/AppContext";
import { FaBell, FaReceipt, FaShoppingCart } from "react-icons/fa";
import { publicNavLinks, authNavLinks } from "./headerRoutes";
import AdminPanel from "../pages/Landing/components/AdminPanel";
import { prefetchByPath } from "../utils/routePrefetch";

const prefetchNav = (path: string) => () => prefetchByPath(path);

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
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
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

  return (
    <>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-lg shadow-sm border-b border-slate-100/50"
            : "bg-white/95 backdrop-blur-sm"
        } px-[6%] lg:px-[8%] py-2 flex justify-between items-center min-h-16 lg:min-h-20`}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-1.5 cursor-pointer group mr-auto shrink-0"
          onClick={() => navigate("/")}
        >
          <img
            src="/images/csa-logo.jpg"
            alt="CSA Kirinyaga logo"
            className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg object-cover shadow-md shadow-blue-200 group-hover:shadow-lg group-hover:shadow-blue-300 transition-shadow"
          />
          <div className="block">
            <span className="text-base lg:text-lg font-black text-slate-900 tracking-tight whitespace-nowrap">
              CSA KYU
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center ml-auto gap-x-0.5 lg:gap-x-1 overflow-x-auto scrollbar-hide flex-nowrap">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <li key={link.path} className="shrink-0">
                {link.path.includes("#") ? (
                  <a
                    href={link.path}
                    onMouseEnter={prefetchNav(link.path)}
                    onFocus={prefetchNav(link.path)}
                    className={`relative px-3 lg:px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      active
                        ? "text-blue-700 bg-blue-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </a>
                ) : (
                  <Link
                    to={link.path}
                    onMouseEnter={prefetchNav(link.path)}
                    onFocus={prefetchNav(link.path)}
                    className={`relative px-3 lg:px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      active
                        ? "text-blue-700 bg-blue-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notifications */}
          <button
            onClick={() => navigate("/Notification")}
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
            <div className="hidden md:flex items-center gap-2 pl-2 lg:pl-3 border-l border-slate-200">
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user.name?.charAt(0) || "U"}
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden lg:block truncate max-w-[100px]">
                {user.name}
              </span>
              <button
                className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 px-2 py-1.5 rounded-lg font-semibold text-xs hover:bg-emerald-50 transition-all"
                onClick={() => navigate("/my-receipts")}
                title="My Receipts"
              >
                <FaReceipt className="text-sm" />
                <span className="hidden xl:inline">Receipts</span>
              </button>
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
            <div className="hidden md:flex items-center gap-2 pl-2 lg:pl-3 border-l border-slate-200">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.97]"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 overflow-hidden ${
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
          className={`absolute top-0 left-0 w-[75%] max-w-[300px] h-full bg-white shadow-2xl transition-transform duration-400 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/csa-logo.jpg"
                alt="CSA Kirinyaga logo"
                className="w-7 h-7 rounded-lg object-cover"
              />
              <span className="font-black text-slate-900 text-sm">CSA Kirinyaga</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <div className="overflow-y-auto h-[calc(100%-64px)] pb-8">
            <nav className="p-4 space-y-0.5">
              {navLinks.map((link, idx) => {
                const active = isActive(link.path);
                return (
                  <div
                    key={link.path}
                    style={{
                      transitionDelay: `${idx * 40}ms`,
                    }}
                  >
                    {link.path.includes("#") ? (
                      <a
                        href={link.path}
                        onMouseEnter={prefetchNav(link.path)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                          active
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            active ? "bg-blue-600" : "bg-slate-300"
                          }`}
                        />
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        onMouseEnter={prefetchNav(link.path)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                          active
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            active ? "bg-blue-600" : "bg-slate-300"
                          }`}
                        />
                        {link.name}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="px-4 pt-4 border-t border-slate-100 mx-4 space-y-3">
              <button
                onClick={() => {
                  navigate("/Notification");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FaBell className="text-sm text-slate-500" />
                  <span className="font-semibold text-sm text-slate-700">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">
                        {Array.isArray(user.role) ? user.role.join(", ") : user.role || "Member"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/my-receipts");
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
                  >
                    <FaReceipt className="text-sm text-emerald-600" />
                    <span className="font-semibold text-sm text-slate-700">My Receipts</span>
                  </button>
                  {isAdminRole(user?.role) && (
                    <button
                      className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all active:scale-[0.98]"
                      onClick={() => {
                        navigate("/admin");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Admin Dashboard
                    </button>
                  )}
                  <button
                    className="w-full text-red-600 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
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
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-200"
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </button>
              )}

              <p className="text-center text-[10px] text-slate-300 uppercase tracking-widest font-semibold pt-2">
                CSA Kirinyaga &bull; 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Headers;
