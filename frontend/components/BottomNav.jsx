// components/BottomNav.jsx
"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Building2, Plus, LogOut, User, ChevronRight, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function BottomNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isInstituteLoggedIn, setIsInstituteLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [user, setUser] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [switchingOrg, setSwitchingOrg] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const instituteLoggedIn = localStorage.getItem("instituteLoggedIn") === "true";
      const userLoggedIn = localStorage.getItem("userLoggedIn") === "true";
      setIsInstituteLoggedIn(instituteLoggedIn);
      setIsUserLoggedIn(userLoggedIn);

      try {
        const userData = localStorage.getItem("userData");
        if (userData) setUser(JSON.parse(userData));

        const orgsData = localStorage.getItem("userOrgs");
        if (orgsData) setOrgs(JSON.parse(orgsData));
      } catch { }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authStateChanged', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', checkAuth);
    };
  }, []);

  const handleSwitchToInstitute = async (org) => {
    setSwitchingOrg(org.id);
    try {
      const userToken = localStorage.getItem("userToken");
      const res = await fetch(`${API_URL}/org/switch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("instituteLoggedIn", "true");
      localStorage.setItem("instituteToken", data.token);
      localStorage.setItem("instituteData", JSON.stringify(user));
      localStorage.setItem("instituteOrgs", JSON.stringify(orgs));
      window.dispatchEvent(new Event("authStateChanged"));
      setShowSheet(false);
      router.push("/institute/dashboard");
    } catch (err) {
      console.error("Switch error:", err.message);
    } finally {
      setSwitchingOrg(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("userData");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userOrgs");
    localStorage.removeItem("userCity");
    localStorage.removeItem("userLat");
    localStorage.removeItem("userLng");
    localStorage.removeItem("instituteLoggedIn");
    localStorage.removeItem("instituteToken");
    localStorage.removeItem("instituteData");
    localStorage.removeItem("instituteOrgs");
    window.dispatchEvent(new Event("authStateChanged"));
    setShowSheet(false);
    router.push("/");
  };

  // ✅ FIXED: removed pathname?.startsWith('/login') from exclusion
  if (
    pathname?.startsWith('/institute/register') ||
    pathname?.startsWith('/admin')
  ) {
    return null;
  }

  const isStudyAbroadActive = pathname?.startsWith("/centers") && searchParams?.get("category") === "STUDY_ABROAD";
  const isCentersActive = pathname?.startsWith("/centers") && !isStudyAbroadActive;
  const isLoggedIn = isInstituteLoggedIn || isUserLoggedIn;

  const isProfileActive =
    pathname?.startsWith("/institute/dashboard") ||
    pathname?.startsWith("/user/dashboard") ||
    pathname?.startsWith("/login");

  const navItems = [
    {
      name: "Home",
      href: "/",
      isActive: pathname === "/",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      onClick: null,
    },
    {
      name: "Centers",
      href: "/centers",
      isActive: isCentersActive,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      onClick: null,
    },
    {
      name: "Abroad",
      href: "/centers?category=STUDY_ABROAD",
      isActive: isStudyAbroadActive,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: null,
    },
    {
      name: "Profile",
      href: isLoggedIn ? null : "/login",
      isActive: isProfileActive || showSheet,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      onClick: isLoggedIn ? () => setShowSheet(true) : null,
    },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const content = (
              <>
                <div className={`transition-transform ${item.isActive ? "scale-110" : ""}`}>
                  {item.icon}
                </div>
                <span className={`text-xs ${item.isActive ? "font-semibold" : "font-medium"}`}>
                  {item.name}
                </span>
              </>
            );

            if (item.onClick) {
              return (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    item.isActive ? "text-accent" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href || "/login"}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  item.isActive ? "text-accent" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Profile Bottom Sheet */}
      {showSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[60] md:hidden"
            onClick={() => setShowSheet(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[70] md:hidden bg-white rounded-t-2xl shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <button
              onClick={() => setShowSheet(false)}
              className="absolute top-3 right-4 p-1.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-4 pb-8 pt-2 space-y-2">
              {user && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <Link
                href="/user/dashboard"
                onClick={() => setShowSheet(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-800 flex-1">My Profile</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>

              {orgs.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 pt-2">
                    Your Institutes
                  </p>
                  {orgs.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleSwitchToInstitute(org)}
                      disabled={switchingOrg === org.id}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 text-left"
                    >
                      <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{org.name}</p>
                        <p className="text-[10px] text-gray-500">{org.city} · <span className="capitalize text-indigo-600">{org.role?.toLowerCase()}</span></p>
                      </div>
                      {switchingOrg === org.id
                        ? <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        : <ChevronRight className="w-4 h-4 text-gray-400" />
                      }
                    </button>
                  ))}
                </>
              )}

              <Link
                href="/institute/register"
                onClick={() => setShowSheet(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors"
              >
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-800">Add Institute</span>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-medium text-red-600">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavInner />
    </Suspense>
  );
}