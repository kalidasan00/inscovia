// components/BottomNav.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname?.startsWith('/institute/login') || pathname?.startsWith('/institute/register')) {
    return null;
  }

  const [isInstituteLoggedIn, setIsInstituteLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsInstituteLoggedIn(localStorage.getItem("instituteLoggedIn") === "true");
      setIsUserLoggedIn(localStorage.getItem("userLoggedIn") === "true");
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authStateChanged', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', checkAuth);
    };
  }, [pathname]);

  // ✅ Check if study abroad filter is active
  const isStudyAbroadActive = pathname?.startsWith("/centers") && searchParams?.get("category") === "STUDY_ABROAD";
  const isCentersActive = pathname?.startsWith("/centers") && !isStudyAbroadActive;

  const navItems = [
    {
      name: "Home",
      href: "/",
      isActive: pathname === "/",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: "Centers",
      href: "/centers",
      isActive: isCentersActive,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      name: "Study Abroad",
      href: "/centers?category=STUDY_ABROAD", // ✅ Filter centers by STUDY_ABROAD
      isActive: isStudyAbroadActive,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: "Profile",
      href: isInstituteLoggedIn
        ? "/institute/dashboard"
        : isUserLoggedIn
          ? "/user/dashboard"
          : "/user-menu",
      isActive: pathname?.startsWith("/institute/dashboard") || pathname?.startsWith("/user/dashboard") || pathname?.startsWith("/user-menu"),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              item.isActive ? "text-accent" : "text-gray-600 hover:text-gray-900"
            }`}>
            <div className={`transition-transform ${item.isActive ? "scale-110" : ""}`}>
              {item.icon}
            </div>
            <span className={`text-xs font-medium ${item.isActive ? "font-semibold" : ""}`}>
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}