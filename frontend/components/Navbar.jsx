"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Menu,
  X,
  Building2,
  User,
  LogOut,
  LayoutDashboard
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isInstituteLoggedIn, setIsInstituteLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const pathname = usePathname();

  // Check auth status
  useEffect(() => {
    const checkAuth = () => {
      try {
        const instituteAuth = localStorage.getItem("instituteLoggedIn") === "true";
        const userAuth = localStorage.getItem("userLoggedIn") === "true";
        setIsInstituteLoggedIn(instituteAuth);
        setIsUserLoggedIn(userAuth);
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authStateChanged', checkAuth);
    window.addEventListener('focus', checkAuth);
    const timeoutId = setTimeout(checkAuth, 100);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', checkAuth);
      window.removeEventListener('focus', checkAuth);
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  const handleInstituteLogout = () => {
    localStorage.removeItem("instituteLoggedIn");
    localStorage.removeItem("instituteToken");
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
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-accent">
              Inscovia
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              <Link
                href="/centers"
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  pathname === '/centers' ? 'text-accent' : 'text-gray-700'
                }`}
              >
                Browse Centers
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  pathname === '/about' ? 'text-accent' : 'text-gray-700'
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  pathname === '/contact' ? 'text-accent' : 'text-gray-700'
                }`}
              >
                Contact
              </Link>
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-2">
              {/* User */}
              {isUserLoggedIn ? (
                <>
                  <Link
                    href="/user/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-accent text-sm font-medium rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Account</span>
                  </Link>
                  <button
                    onClick={handleUserLogout}
                    className="p-1.5 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link
                  href="/user-menu"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              <div className="w-px h-6 bg-gray-300"></div>

              {/* Institute */}
              {isInstituteLoggedIn ? (
                <>
                  <Link
                    href="/institute/dashboard"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={handleInstituteLogout}
                    className="p-1.5 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link
                  href="/institute/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Institute</span>
                </Link>
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
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/centers'
                    ? 'bg-accent/10 text-accent'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Browse Centers
              </Link>
              <Link
                href="/about"
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/about'
                    ? 'bg-accent/10 text-accent'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/contact'
                    ? 'bg-accent/10 text-accent'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>

              <div className="pt-2 border-t border-gray-200 mt-2"></div>

              {/* User Section */}
              {isUserLoggedIn ? (
                <div className="space-y-2">
                  <Link
                    href="/user/dashboard"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      handleUserLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/user-menu"
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  User Login
                </Link>
              )}

              <div className="pt-2 border-t border-gray-200"></div>

              {/* Institute Section */}
              {isInstituteLoggedIn ? (
                <div className="space-y-2">
                  <Link
                    href="/institute/dashboard"
                    className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Institute Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleInstituteLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/institute/login"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <Building2 className="w-4 h-4" />
                    Institute Login
                  </Link>
                  <Link
                    href="/institute/register"
                    className="flex-1 px-4 py-2.5 border border-accent text-accent rounded-lg text-sm font-medium text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}