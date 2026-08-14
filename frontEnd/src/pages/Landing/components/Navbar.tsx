import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useState } from 'react';
import DonationModal from './DonationModal';
import { Heart, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white shadow-md sticky top-0 z-45">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-3">
        <div className="flex items-center gap-2 mr-auto -ml-4 sm:-ml-5">
          <img
            src="/images/csa-logo.jpg"
            alt="CSA Kirinyaga logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover"
          />
          <span className="text-xl sm:text-2xl font-black text-blue-700 tracking-tight whitespace-nowrap">CSA Kirinyaga</span>
        </div>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-6">
          <li>
            <Link 
              to="/" 
              className={`font-medium transition-colors ${location.pathname === "/" ? "text-blue-700 border-b-2 border-blue-700 pb-1" : "text-gray-600 hover:text-blue-700"}`}
            >
              Home
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link 
                  to="/jumuiya" 
                  className={`font-medium transition-colors ${location.pathname === "/jumuiya" ? "text-blue-700 border-b-2 border-blue-700 pb-1" : "text-gray-600 hover:text-blue-700"}`}
                >
                  Jumuiya
                </Link>
              </li>
              <li>
                <Link 
                  to="/officials" 
                  className={`font-medium transition-colors ${location.pathname === "/officials" ? "text-blue-700 border-b-2 border-blue-700 pb-1" : "text-gray-600 hover:text-blue-700"}`}
                >
                  Officials
                </Link>
              </li>
              <li>
                <Link 
                  to="/gallery" 
                  className={`font-medium transition-colors ${location.pathname === "/gallery" ? "text-blue-700 border-b-2 border-blue-700 pb-1" : "text-gray-600 hover:text-blue-700"}`}
                >
                  Gallery
                </Link>
              </li>
            </>
          ) : (
            <>
              <li><a href="#about" className="text-gray-600 hover:text-blue-700 font-medium">About</a></li>
              <li><a href="#projects" className="text-gray-600 hover:text-blue-700 font-medium">Projects</a></li>
            </>
          )}
          
          <li>
            <button 
              onClick={() => setIsDonationOpen(true)}
              className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-bold bg-rose-50 px-4 py-2 rounded-full transition-all border border-rose-100 cursor-pointer"
            >
              <Heart size={18} fill="currentColor" />
              Donate
            </button>
          </li>

          {user ? (
            <li>
              <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 font-medium cursor-pointer">
                Logout
              </button>
            </li>
          ) : (
            <li><Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">Login</Link></li>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-2 text-gray-600 hover:text-blue-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Drawer Navigation (Slide down with glassmorphic styling) */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out border-t border-gray-100 ${
          isMenuOpen ? 'max-h-[400px] opacity-100 bg-white/95 backdrop-blur-md' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <ul className="px-6 py-4 space-y-4 font-medium">
          <li>
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2 ${location.pathname === "/" ? "text-blue-700 font-bold" : "text-gray-600"}`}
            >
              Home
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link 
                  to="/jumuiya" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 ${location.pathname === "/jumuiya" ? "text-blue-700 font-bold" : "text-gray-600"}`}
                >
                  Jumuiya
                </Link>
              </li>
              <li>
                <Link 
                  to="/officials" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 ${location.pathname === "/officials" ? "text-blue-700 font-bold" : "text-gray-600"}`}
                >
                  Officials
                </Link>
              </li>
              <li>
                <Link 
                  to="/gallery" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 ${location.pathname === "/gallery" ? "text-blue-700 font-bold" : "text-gray-600"}`}
                >
                  Gallery
                </Link>
              </li>
            </>
          ) : (
            <>
              <li><a href="#about" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-600">About</a></li>
              <li><a href="#projects" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-600">Projects</a></li>
            </>
          )}

          <li className="pt-2 border-t border-gray-50 flex flex-col gap-3">
            <button 
              onClick={() => { setIsMenuOpen(false); setIsDonationOpen(true); }}
              className="flex items-center justify-center gap-2 text-rose-600 font-bold bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100 w-full cursor-pointer"
            >
              <Heart size={18} fill="currentColor" />
              Donate
            </button>
            
            {user ? (
              <button 
                onClick={() => { setIsMenuOpen(false); logout(); }} 
                className="bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 font-medium w-full cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-medium text-center block w-full"
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>

      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />
    </header>
  );
};

export default Navbar;