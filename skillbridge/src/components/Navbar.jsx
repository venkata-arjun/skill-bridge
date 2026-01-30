import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  BarChart3,
  GraduationCap,
  Mic,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { currentUser, profile, signOut } = useAuth();
  const nav = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  async function handleSignOut() {
    await signOut();
    nav("/");
  }

  // close profile menu when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((s) => !s);
  const toggleProfileMenu = () => setIsProfileMenuOpen((s) => !s);

  const displayName = profile?.displayName || currentUser?.email || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 shrink-0 group"
        >
          <img
            src={logo}
            alt="SkillBridge"
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain rounded-lg transition-all duration-300"
          />
          <div className="leading-tight">
            <span className="block text-lg sm:text-xl md:text-2xl font-extrabold transition-all duration-300">
              <span className="text-black">Skill</span>
              <span className="text-black">Bridge</span>
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 ml-4 xl:ml-6">
          <Link
            to="/"
            className="text-sm xl:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-blue-50"
          >
            Home
          </Link>
          <Link
            to="/sessions"
            className="text-sm xl:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-blue-50"
          >
            Explore
          </Link>
          {currentUser && profile?.role === "speaker" && (
            <Link
              to="/topics"
              className="text-sm xl:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-blue-50"
            >
              Topics
            </Link>
          )}
          {profile?.role === "student" && (
            <Link
              to="/request"
              className="text-sm xl:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-blue-50"
            >
              Request
            </Link>
          )}
          {currentUser && profile?.role && (
            <Link
              to={`/dashboard/${profile.role}`}
              className="text-sm xl:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-blue-50"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/about"
            className="text-sm xl:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-blue-50"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Auth buttons / Profile */}
          {!currentUser ? (
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg lg:rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium lg:font-semibold shadow-md lg:shadow-lg hover:shadow-lg lg:hover:shadow-xl transition-all duration-300 hover:from-blue-700 hover:to-blue-800 text-sm lg:text-base"
              >
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">Log in</span>
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg lg:rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-medium lg:font-semibold shadow-md lg:shadow-lg hover:shadow-lg lg:hover:shadow-xl transition-all duration-300 hover:from-green-700 hover:to-green-800 text-sm lg:text-base"
              >
                <span className="hidden sm:inline">Sign Up</span>
                <span className="sm:hidden">Sign up</span>
              </Link>
            </div>
          ) : (
            <div
              className="hidden md:flex items-center gap-1 sm:gap-2 lg:gap-4"
              ref={profileMenuRef}
            >
              <div className="text-xs sm:text-sm lg:text-base text-gray-600 hidden lg:block">
                Hi,{" "}
                <span className="font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200 truncate max-w-20 sm:max-w-32">
                  {displayName}
                </span>
              </div>

              <button
                onClick={toggleProfileMenu}
                aria-haspopup="true"
                aria-expanded={isProfileMenuOpen}
                className="flex items-center gap-1 sm:gap-2 p-1 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200">
                  {initials}
                </div>
                <ChevronDown
                  className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform duration-200 ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-2 sm:right-4 lg:right-6 top-12 sm:top-14 lg:top-16 w-48 sm:w-56 bg-white/95 backdrop-blur-xl rounded-lg sm:rounded-xl shadow-xl lg:shadow-2xl border border-gray-200/50 py-1 sm:py-2 animate-in slide-in-from-top-2 duration-200 z-[100]">
                  <Link
                    onClick={() => setIsProfileMenuOpen(false)}
                    to="/profile"
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    Profile
                  </Link>

                  {profile?.role === "student" && (
                    <Link
                      onClick={() => setIsProfileMenuOpen(false)}
                      to="/dashboard/student"
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                    >
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Student Dashboard
                    </Link>
                  )}
                  {profile?.role === "faculty" && (
                    <Link
                      onClick={() => setIsProfileMenuOpen(false)}
                      to="/dashboard/faculty"
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                    >
                      <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                      Faculty Dashboard
                    </Link>
                  )}
                  {profile?.role === "speaker" && (
                    <Link
                      onClick={() => setIsProfileMenuOpen(false)}
                      to="/dashboard/speaker"
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                    >
                      <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
                      Speaker Dashboard
                    </Link>
                  )}

                  <div className="border-t border-gray-200 my-1 sm:my-2"></div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-600 font-medium hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out z-[100] ${
          isMobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute inset-x-0 top-full bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-xl py-4 sm:py-6 px-3 sm:px-4 ${
            isMobileMenuOpen ? "block" : "hidden"
          }`}
        >
          <nav className="flex flex-col gap-2 sm:gap-4">
            {!currentUser ? (
              <div className="pt-3 sm:pt-4 border-t border-gray-200 mt-3 sm:mt-4 flex flex-col gap-2 sm:gap-3">
                <Link
                  to="/"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </Link>
                <Link
                  to="/sessions"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Explore
                </Link>
                {currentUser && profile?.role === "speaker" && (
                  <Link
                    to="/topics"
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Topics
                  </Link>
                )}
                {profile?.role === "student" && (
                  <Link
                    to="/request"
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                  >
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    Request
                  </Link>
                )}
                <Link
                  to="/about"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  About
                </Link>
                <div className="border-t border-gray-200 my-2"></div>
                <Link
                  to="/login"
                  onClick={toggleMobileMenu}
                  className="block px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 text-center shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={toggleMobileMenu}
                  className="block px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 text-center shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="pt-3 sm:pt-4 border-t border-gray-200 mt-3 sm:mt-4 flex flex-col gap-2 sm:gap-3">
                {/* Profile info at the top */}
                <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-3 py-2 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl mx-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">
                    <span className="text-xs sm:text-sm md:text-base">
                      {initials}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-bold text-gray-800 truncate">
                      {displayName}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 capitalize">
                      {profile?.role || "Member"}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-2"></div>

                <Link
                  to="/profile"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  Profile
                </Link>

                <Link
                  to="/"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </Link>
                <Link
                  to="/sessions"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Explore
                </Link>
                {currentUser && profile?.role === "speaker" && (
                  <Link
                    to="/topics"
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Topics
                  </Link>
                )}
                {profile?.role === "student" && (
                  <Link
                    to="/request"
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                  >
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    Request
                  </Link>
                )}
                {profile?.role && (
                  <Link
                    to={`/dashboard/${profile.role}`}
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                  >
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/about"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  About
                </Link>

                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={() => {
                    handleSignOut();
                    toggleMobileMenu();
                  }}
                  className="w-full text-left flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
