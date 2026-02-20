"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  FileText,
  Target
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isInstituteLoggedIn, setIsInstituteLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const pathname = usePathname();

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

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  const handleLogout = () => {
    if (isInstituteLoggedIn) {
      localStorage.removeItem("instituteLoggedIn");
      localStorage.removeItem("instituteToken");
      localStorage.removeItem("instituteData");
    } else if (isUserLoggedIn) {
      localStorage.removeItem("userLoggedIn");
      localStorage.removeItem("userData");
      localStorage.removeItem("userToken");
    }
    window.location.href = "/";
  };

  const isLoggedIn = isInstituteLoggedIn || isUserLoggedIn;
  const dashboardHref = isInstituteLoggedIn ? "/institute/dashboard" : "/user/dashboard";
  const accountLabel = isInstituteLoggedIn ? "Dashboard" : "Account";

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Inscovia - 1 2.png"
              alt="Inscovia Logo"
              width={240}
              height={70}
              priority
              className="h-14 sm:h-14 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-6">
              <Link href="/"
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname === '/' ? 'text-blue-600' : 'text-gray-700'}`}>
                Home
              </Link>
              <Link href="/centers"
                className={`flex items-center gap-1.5 text-sm transition-colors hover:text-blue-600 ${pathname === '/centers' ? 'text-blue-600' : 'text-gray-700'}`}>
                <Search className="w-4 h-4" />
                <span>Browse</span>
              </Link>
              <Link href="/previous-year-papers"
                className={`flex items-center gap-1.5 text-sm transition-colors hover:text-blue-600 ${pathname === '/previous-year-papers' ? 'text-blue-600' : 'text-gray-700'}`}>
                <FileText className="w-4 h-4" />
                <span>Papers</span>
              </Link>
              {/* ✅ NEW */}
              <Link href="/practice"
                className={`flex items-center gap-1.5 text-sm transition-colors hover:text-blue-600 ${pathname === '/practice' ? 'text-blue-600' : 'text-gray-700'}`}>
                <Target className="w-4 h-4" />
                <span>Practice</span>
              </Link>
            </div>

            {/* Auth */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link href={dashboardHref}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                  {isInstituteLoggedIn ? <LayoutDashboard className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span>{accountLabel}</span>
                </Link>
                <button onClick={handleLogout}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/user-menu"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu — fixed overlay above content */}
        {isOpen && (
          <>
            <div className="md:hidden fixed inset-0 top-16 bg-black/20 z-40"
              onClick={() => setIsOpen(false)} />
            <div className="md:hidden fixed left-0 right-0 top-16 z-50 bg-white border-t shadow-lg rounded-b-2xl overflow-hidden">
              <div className="space-y-0">

                <Link href="/"
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm border-b border-gray-100 ${pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setIsOpen(false)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home</span>
                </Link>

                <Link href="/centers"
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm border-b border-gray-100 ${pathname === '/centers' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setIsOpen(false)}>
                  <Search className="w-5 h-5" />
                  <span>Browse Centers</span>
                </Link>

                <Link href="/previous-year-papers"
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm border-b border-gray-100 ${pathname === '/previous-year-papers' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setIsOpen(false)}>
                  <FileText className="w-5 h-5" />
                  <span>Previous Year Papers</span>
                </Link>

                {/* ✅ NEW: Practice Zone */}
                <Link href="/practice"
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm border-b border-gray-100 ${pathname === '/practice' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setIsOpen(false)}>
                  <Target className="w-5 h-5" />
                  <span>Practice Zone 🎯</span>
                </Link>

                {/* Auth */}
                {isLoggedIn ? (
                  <>
                    <Link href={dashboardHref}
                      className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                      onClick={() => setIsOpen(false)}>
                      {isInstituteLoggedIn ? <LayoutDashboard className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      <span>{isInstituteLoggedIn ? "Dashboard" : "My Account"}</span>
                    </Link>
                    <button onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50">
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/user-menu"
                      className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                      onClick={() => setIsOpen(false)}>
                      <User className="w-5 h-5" />
                      <span>User Login</span>
                    </Link>
                    <Link href="/institute/login"
                      className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}>
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Institute Login</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}