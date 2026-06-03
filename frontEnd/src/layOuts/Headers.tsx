import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaHome, FaInfoCircle, FaUsers, FaPrayingHands } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { HiOutlineMenu, HiOutlineSupport, HiOutlineX } from "react-icons/hi";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Headers: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  const token: string | null = localStorage.getItem("token");

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogins = async () => {
    try {
      if (isLoggedIn) {
        const response = await axios.post(
          "http://localhost:3001/authentication/v1/log-out",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data === "logged out successfully") {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          navigate("/");
        } else {
          alert("Failed to log you out");
        }
      } else {
        navigate("/login");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
      } else if (error instanceof Error) {
        console.error("General error:", error.message);
      } else {
        console.error("Unexpected error");
      }
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "Community", path: "/community", icon: <FaInfoCircle /> },
    { name: "Jumuiya", path: "/jumuiya", icon: <FaInfoCircle /> },
    { name: "Officials", path: "/officials", icon: <FaUsers /> },
    { name: "Activities", path: "/activities", icon: <HiOutlineSupport /> },
    { name: "Gallery", path: "/gallery", icon: <FiImage /> },
    { name: "Devotions", path: "/devotions", icon: <FaPrayingHands /> },
  ];

  return (
    <>
      {/* DESKTOP NAV */}
      <div className="hidden md:flex justify-between items-center px-[8%] py-4 bg-white shadow-md">
        <div className="flex items-center gap-2">
          <img
            src="/assets/Images/church.png"
            alt="CSA Kirinyaga Logo"
            className="object-contain w-10 h-10"
          />
        </div>

        <ul className="flex gap-4 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1 transition-all duration-300 pb-1 border-b-2 ${
                isActive(link.path)
                  ? "text-blue-600 border-blue-600 font-bold"
                  : "text-gray-600 border-transparent hover:text-blue-500 hover:border-blue-300"
              }`}
            >
              {link.icon}
              <li>{link.name}</li>
            </Link>
          ))}
        </ul>

        <button
          onClick={handleLogins}
          className="px-5 py-1 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          {isLoggedIn ? "Logout" : "Login"}
        </button>
      </div>

      {/* MOBILE NAV */}
      <div className="md:hidden flex justify-between items-center px-[8%] py-4 bg-white shadow-md">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-2xl">
          {isMenuOpen ? <HiOutlineX /> : <HiOutlineMenu />}
        </button>

        {isMenuOpen && (
          <ul className="absolute left-0 flex flex-col items-center w-full gap-4 py-6 bg-white shadow-xl top-16 z-50">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`w-full text-center py-2 ${
                  isActive(link.path)
                    ? "text-blue-600 font-bold bg-blue-50"
                    : "text-gray-600"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <button
              onClick={() => {
                handleLogins();
                setIsMenuOpen(false);
              }}
              className="px-8 py-2 mt-4 text-white bg-blue-600 rounded-md shadow-lg"
            >
              {isLoggedIn ? "Logout" : "Login"}
            </button>
          </ul>
        )}
      </div>
    </>
  );
};

export default Headers;