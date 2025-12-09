// components/Navbar.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [isInstituteLoggedIn, setIsInstituteLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const pathname = usePathname();

  // Check auth status
  useEffect(() => {
    const instituteAuth = localStorage.getItem("instituteLoggedIn") === "true";
    const userAuth = localStorage.getItem("userLoggedIn") === "true";
    setIsInstituteLoggedIn(instituteAuth);
    setIsUserLoggedIn(userAuth);
  }, [pathname]);

  const handleInstituteLogout = () => {
    localStorage.removeItem("instituteLoggedIn");
    localStorage.removeItem("instituteData");
    setIsInstituteLoggedIn(false);
    window.location.href = "/";
  };

  const handleUserLogout = () => {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("userData");
    setIsUserLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">IS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Inscovia</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/centers"
              className="text-gray-700 hover:text-accent transition-colors"
            >
              Centers
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-accent transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-accent transition-colors"
            >
              Contact
            </Link>

            {/* Auth Buttons */}
            {isInstituteLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/institute/dashboard"
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Institute Dashboard
                </Link>
                <button
                  onClick={handleInstituteLogout}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : isUserLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/user/profile"
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleUserLogout}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowAuthMenu(!showAuthMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <span>Login / Register</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showAuthMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase">User Account</p>
                    </div>
                    <Link
                      href="/user-menu"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowAuthMenu(false)}
                    >
                      User Login / Register
                    </Link>

                    <div className="my-2 border-t border-gray-200"></div>

                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Institute Account</p>
                    </div>
                    <Link
                      href="/institute/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowAuthMenu(false)}
                    >
                      Institute Login
                    </Link>
                    <Link
                      href="/institute/register"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowAuthMenu(false)}
                    >
                      Register Institute
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link
                href="/centers"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Centers
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>

              {/* Mobile Auth Buttons */}
              {isInstituteLoggedIn ? (
                <>
                  <Link
                    href="/institute/dashboard"
                    className="px-4 py-2 bg-accent text-white rounded-lg text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Institute Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleInstituteLogout();
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : isUserLoggedIn ? (
                <>
                  <Link
                    href="/user/profile"
                    className="px-4 py-2 bg-accent text-white rounded-lg text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleUserLogout();
                      setIsOpen(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">User Account</p>
                    <Link
                      href="/user-menu"
                      className="block px-4 py-2 bg-blue-600 text-white rounded-lg text-center text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      User Login / Register
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 my-2"></div>

                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Institute Account</p>
                    <div className="flex gap-2">
                      <Link
                        href="/institute/login"
                        className="flex-1 px-4 py-2 bg-accent text-white rounded-lg text-center text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        Institute Login
                      </Link>
                      <Link
                        href="/institute/register"
                        className="flex-1 px-4 py-2 border border-accent text-accent rounded-lg text-center text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}