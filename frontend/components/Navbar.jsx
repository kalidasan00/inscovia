"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  Building2,
  User,
  LogOut,
  LayoutDashboard,
  UserCircle
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [isInstituteLoggedIn, setIsInstituteLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const pathname = usePathname();

  // Check auth status
  useEffect(() => {
    const checkAuth = () => {
      try {
        const instituteAuth = localStorage.getItem("instituteLoggedIn") === "true";
        const userAuth = localStorage.getItem("userLoggedIn") === "true";

        console.log("Navbar Auth Check:", { instituteAuth, userAuth }); // Debug log

        setIsInstituteLoggedIn(instituteAuth);
        setIsUserLoggedIn(userAuth);
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    // Check immediately
    checkAuth();

    // Listen for custom auth event
    const handleAuthChange = () => {
      console.log("Auth change event received"); // Debug log
      checkAuth();
    };

    window.addEventListener('storage', checkAuth);
    window.addEventListener('authStateChanged', handleAuthChange);

    // Check on focus (when user comes back to tab)
    window.addEventListener('focus', checkAuth);

    // Small delay to ensure localStorage is ready
    const timeoutId = setTimeout(checkAuth, 100);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('focus', checkAuth);
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.auth-menu-container')) {
        setShowAuthMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Inscovia
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              <Link
                href="/centers"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === '/centers' ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                Browse Centers
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === '/about' ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === '/contact' ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                Contact
              </Link>
            </div>

            {/* Auth Section - User section ALWAYS visible */}
            <div className="flex items-center gap-3">
              {/* User Auth - ALWAYS RENDERED */}
              <div className="flex items-center gap-2">
                {isUserLoggedIn ? (
                  <>
                    <Link
                      href="/user/dashboard"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      My Account
                    </Link>
                    <button
                      onClick={handleUserLogout}
                      className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      title="User Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Link
                    href="/user-menu"
                    className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    User Login
                  </Link>
                )}
              </div>

              {/* Institute Auth */}
              {isInstituteLoggedIn ? (
                <>
                  <Link
                    href="/institute/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Institute Dashboard
                  </Link>
                  <button
                    onClick={handleInstituteLogout}
                    className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    title="Institute Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="relative auth-menu-container">
                  <button
                    onClick={() => setShowAuthMenu(!showAuthMenu)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Institute</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAuthMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Institute Dropdown */}
                  {showAuthMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden">
                      <Link
                        href="/institute/login"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowAuthMenu(false)}
                      >
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Institute Login</div>
                          <div className="text-xs text-gray-500">Access dashboard</div>
                        </div>
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <Link
                        href="/institute/register"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowAuthMenu(false)}
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Register Institute</div>
                          <div className="text-xs text-gray-500">List your center</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-2">
              {/* Navigation Links */}
              <Link
                href="/centers"
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/centers'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Browse Centers
              </Link>
              <Link
                href="/about"
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/about'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/contact'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>

              <div className="pt-3 border-t border-gray-200 mt-2"></div>

              {/* User Section */}
              <div className="px-3 py-2 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-900 uppercase">Student / User</p>
                </div>
                {isUserLoggedIn ? (
                  <div className="space-y-2">
                    <Link
                      href="/user/dashboard"
                      className="block px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      My Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleUserLogout();
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/user-menu"
                    className="block px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Login / Register
                  </Link>
                )}
              </div>

              {/* Institute Section */}
              <div className="px-3 py-2 bg-indigo-50 rounded-lg mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs font-semibold text-indigo-900 uppercase">Training Institute</p>
                </div>
                {isInstituteLoggedIn ? (
                  <div className="space-y-2">
                    <Link
                      href="/institute/dashboard"
                      className="block px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Institute Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleInstituteLogout();
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-2.5 border-2 border-indigo-600 text-indigo-600 rounded-lg text-sm font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href="/institute/login"
                      className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/institute/register"
                      className="flex-1 px-4 py-2.5 border-2 border-indigo-600 text-indigo-600 rounded-lg text-sm font-medium text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}