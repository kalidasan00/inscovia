// components/Navbar.jsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Menu, X, User, LogOut, LayoutDashboard,
  Search, FileText, Target, Bell,
  MapPin, BookOpen, Building2, Sparkles, Loader2,
  Globe, Home, ChevronDown
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function NavSearch({ centers }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [suggestions, setSuggestions] = useState({ institutes: [], courses: [], locations: [] });
  const router = useRouter();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLocalSuggestions = useCallback((term) => {
    const t = term.toLowerCase().trim();
    const matchingInstitutes = centers
      .filter(c =>
        c.name.toLowerCase().includes(t) ||
        c.city?.toLowerCase().includes(t) ||
        c.courses?.some(course => course.toLowerCase().includes(t))
      )
      .slice(0, 4)
      .map(c => ({ name: c.name, location: `${c.city}, ${c.state}`, slug: c.slug }));

    const allCourses = new Set();
    centers.forEach(c => {
      c.courses?.forEach(course => {
        const name = course.includes(":") ? course.split(":")[1].trim() : course;
        if (name.toLowerCase().includes(t)) allCourses.add(name);
      });
    });

    const allLocations = new Set();
    centers.forEach(c => {
      const cs = `${c.city}, ${c.state}`;
      if (cs.toLowerCase().includes(t)) allLocations.add(cs);
    });

    return {
      institutes: matchingInstitutes,
      courses: Array.from(allCourses).slice(0, 3),
      locations: Array.from(allLocations).slice(0, 2)
    };
  }, [centers]);

  const runAiSearch = useCallback(async (q) => {
    if (q.length < 3) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      if (res.ok && data.results?.length > 0) {
        setAiResults(data.results.slice(0, 5));
        setAiMode(data.searchType === "ai");
        setIsOpen(true);
      }
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions({ institutes: [], courses: [], locations: [] });
      setAiResults([]);
      setIsOpen(false);
      return;
    }
    const local = getLocalSuggestions(query);
    setSuggestions(local);
    setIsOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runAiSearch(query), 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, getLocalSuggestions, runAiSearch]);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsOpen(false);
    setQuery("");
    const city = localStorage.getItem("userCity");
    const cityParam = city ? `&city=${encodeURIComponent(city)}` : "";
    router.push(`/centers?q=${encodeURIComponent(query.trim())}${cityParam}`);
  };

  const handleInstituteClick = (slug) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/centers/${slug}`);
  };

  const handleCourseClick = (course) => {
    setIsOpen(false);
    setQuery("");
    const city = localStorage.getItem("userCity");
    const cityParam = city ? `&city=${encodeURIComponent(city)}` : "";
    router.push(`/centers?q=${encodeURIComponent(course)}${cityParam}`);
  };

  const handleLocationClick = (location) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/centers?city=${encodeURIComponent(location.split(",")[0].trim())}`);
  };

  const totalLocal = suggestions.institutes.length + suggestions.courses.length + suggestions.locations.length;
  const hasResults = totalLocal > 0 || aiResults.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xs lg:max-w-sm">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSearch(); if (e.key === "Escape") setIsOpen(false); }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search institutes, courses..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
        />
        {loading
          ? <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
          : <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        }
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); setAiResults([]); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-[999] max-h-[420px] overflow-hidden">
          {!hasResults && !loading ? (
            <div className="p-4 text-center text-gray-400 text-sm">No results for "{query}"</div>
          ) : (
            <div className="overflow-y-auto max-h-[420px]">
              {aiResults.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                      {aiMode ? "AI Matched" : "Top Results"}
                    </span>
                    {aiMode && (
                      <span className="ml-auto text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Smart Search</span>
                    )}
                  </div>
                  {aiResults.map((inst, i) => (
                    <button key={i} onClick={() => handleInstituteClick(inst.slug)}
                      className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2.5 group">
                      <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{inst.name}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />{inst.city}, {inst.state}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.institutes.length > 0 && (
                <div className={`p-2 ${aiResults.length > 0 ? "border-t border-gray-100" : ""}`}>
                  <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Institutes</p>
                  {suggestions.institutes.map((inst, i) => (
                    <button key={i} onClick={() => handleInstituteClick(inst.slug)}
                      className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{inst.name}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />{inst.location}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.courses.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Courses</p>
                  {suggestions.courses.map((course, i) => (
                    <button key={i} onClick={() => handleCourseClick(course)}
                      className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <p className="text-xs text-gray-900">{course}</p>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.locations.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Locations</p>
                  {suggestions.locations.map((location, i) => (
                    <button key={i} onClick={() => handleLocationClick(location)}
                      className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-900">{location}</p>
                    </button>
                  ))}
                </div>
              )}
              <div className="p-2 border-t border-gray-100">
                <button onClick={handleSearch}
                  className="w-full px-2 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                  <Search className="w-3.5 h-3.5" />
                  View all results for "{query}"
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CitySelector({ city, onCityChange }) {
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDetect = () => {
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const detected =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            null;
          if (detected) {
            onCityChange(detected);
            setOpen(false);
          }
        } catch { }
        finally { setDetecting(false); }
      },
      () => setDetecting(false),
      { timeout: 8000 }
    );
  };

  const handleManualSet = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onCityChange(manualInput.trim());
      setManualInput("");
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100"
      >
        <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        <span className="max-w-[80px] truncate">{city || "Set City"}</span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-[999] p-3 space-y-3">
          <p className="text-xs font-semibold text-gray-700">Your Location</p>
          <button
            onClick={handleDetect}
            disabled={detecting}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {detecting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <MapPin className="w-3.5 h-3.5" />
            }
            {detecting ? "Detecting..." : "Detect my location"}
          </button>
          <form onSubmit={handleManualSet} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="Type city name..."
              className="flex-1 px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button type="submit"
              className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Set
            </button>
          </form>
          {city && (
            <button
              onClick={() => { onCityChange(null); setOpen(false); }}
              className="w-full text-xs text-gray-400 hover:text-red-500 text-center transition-colors"
            >
              Clear location
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isInstituteLoggedIn, setIsInstituteLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [centers, setCenters] = useState([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [userCity, setUserCity] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("userCity");
      if (saved) setUserCity(saved);
    } catch { }
    const handleCityChange = () => {
      try {
        const saved = localStorage.getItem("userCity");
        setUserCity(saved || null);
      } catch { }
    };
    window.addEventListener("userCityChanged", handleCityChange);
    window.addEventListener("storage", handleCityChange);
    return () => {
      window.removeEventListener("userCityChanged", handleCityChange);
      window.removeEventListener("storage", handleCityChange);
    };
  }, []);

  const handleCityChange = (city) => {
    setUserCity(city);
    try {
      if (city) localStorage.setItem("userCity", city);
      else localStorage.removeItem("userCity");
      window.dispatchEvent(new Event("userCityChanged"));
    } catch { }
    if (pathname?.startsWith("/centers")) {
      const params = new URLSearchParams(window.location.search);
      if (city) params.set("city", city);
      else params.delete("city");
      router.push(`/centers?${params.toString()}`);
    }
  };

  useEffect(() => {
    async function loadCenters() {
      try {
        const res = await fetch(`${API_URL}/centers?limit=100`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCenters(data.centers || []);
        }
      } catch { }
    }
    loadCenters();
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const instituteAuth = localStorage.getItem("instituteLoggedIn") === "true";
        const userAuth = localStorage.getItem("userLoggedIn") === "true";
        setIsInstituteLoggedIn(instituteAuth);
        setIsUserLoggedIn(userAuth);
        if (instituteAuth) fetchInstituteUnreadCount();
        else if (userAuth) fetchUserUnreadCount();
        else setUnreadCount(0);
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

  useEffect(() => {
    setIsOpen(false);
    setShowMobileSearch(false);
  }, [pathname]);

  const fetchInstituteUnreadCount = async () => {
    try {
      const token = localStorage.getItem("instituteToken");
      if (!token) return;
      const res = await fetch(`${API_URL}/auth/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
    } catch { }
  };

  const fetchUserUnreadCount = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) return;
      const res = await fetch(`${API_URL}/user/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
    } catch { }
  };

  const handleLogout = () => {
    if (isInstituteLoggedIn) {
      localStorage.removeItem("instituteLoggedIn");
      localStorage.removeItem("instituteToken");
      localStorage.removeItem("instituteData");
    } else if (isUserLoggedIn) {
      localStorage.removeItem("userLoggedIn");
      localStorage.removeItem("userData");
      localStorage.removeItem("userToken");
      localStorage.removeItem("userCity");
      setUserCity(null);
    }
    window.location.href = "/";
  };

  const isLoggedIn = isInstituteLoggedIn || isUserLoggedIn;
  const dashboardHref = isInstituteLoggedIn ? "/institute/dashboard" : "/user/dashboard";
  const accountLabel = isInstituteLoggedIn ? "Dashboard" : "Account";

  const navLink = (path) =>
    `text-sm font-medium transition-colors hover:text-blue-600 ${pathname === path || pathname?.startsWith(path + "?") ? "text-blue-600" : "text-gray-700"}`;

  const isStudyAbroadActive = pathname?.startsWith("/centers") &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("category") === "STUDY_ABROAD";

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/Inscovia - 1 2.png"
              alt="Inscovia Logo"
              width={240}
              height={70}
              priority
              className="h-14 sm:h-14 w-auto"
            />
          </Link>

          {/* Desktop: City + Search */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-4 items-center gap-2">
            {isUserLoggedIn && (
              <CitySelector city={userCity} onCityChange={handleCityChange} />
            )}
            <NavSearch centers={centers} />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <Link href="/" className={navLink("/")}>Home</Link>
              <Link href="/centers" className={navLink("/centers")}>Centers</Link>
              <Link href="/centers?category=STUDY_ABROAD"
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-blue-600 ${isStudyAbroadActive ? "text-blue-600" : "text-gray-700"}`}>
                <Globe className="w-4 h-4" />
                <span>Abroad</span>
              </Link>
              <Link href="/previous-year-papers"
                className={`flex items-center gap-1 ${navLink("/previous-year-papers")}`}>
                <FileText className="w-4 h-4" />
                <span>Papers</span>
              </Link>
              <Link href="/practice"
                className={`flex items-center gap-1 ${navLink("/practice")}`}>
                <Target className="w-4 h-4" />
                <span>Practice</span>
              </Link>
            </div>
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link href="/notifications"
                  className="relative p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href={dashboardHref}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                  {isInstituteLoggedIn ? <LayoutDashboard className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span>{accountLabel}</span>
                </Link>
                <button onClick={handleLogout}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
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

          {/* Mobile Right */}
          <div className="md:hidden flex items-center gap-1.5">
            {isUserLoggedIn && (
              <CitySelector city={userCity} onCityChange={handleCityChange} />
            )}
            <button
              onClick={() => { setShowMobileSearch(!showMobileSearch); setIsOpen(false); }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <Search className="w-5 h-5" />
            </button>
            {isLoggedIn && (
              <Link href="/notifications"
                className="relative p-1.5 text-gray-500 hover:text-blue-600 rounded-md">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button onClick={() => { setIsOpen(!isOpen); setShowMobileSearch(false); }}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-md">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {showMobileSearch && (
          <div className="md:hidden pb-3 pt-1 border-t border-gray-100">
            <NavSearch centers={centers} />
          </div>
        )}

        {/* Mobile Menu — ✅ FIXED: max-h so it never goes outside screen + overflow-y-auto to scroll inside */}
        {isOpen && (
          <>
            <div className="md:hidden fixed inset-0 top-16 bg-black/20 z-40" onClick={() => setIsOpen(false)} />
            <div className="md:hidden fixed left-0 right-0 top-16 z-50 bg-white border-t shadow-lg rounded-b-2xl overflow-hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="space-y-0">
                <Link href="/"
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm border-b border-gray-100 ${pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setIsOpen(false)}>
                  <Home className="w-5 h-5" /><span>Home</span>
                </Link>
                <Link href="/centers"
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm border-b border-gray-100 ${pathname === '/centers' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setIsOpen(false)}>
                  <Search className="w-5 h-5" /><span>Browse Centers</span>
                </Link>
                <Link href="/centers?category=STUDY_ABROAD"
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm border-b border-gray-100 ${isStudyAbroadActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setIsOpen(false)}>
                  <Globe className="w-5 h-5" /><span>Study Abroad</span>
                </Link>
                <Link href="/previous-year-papers"
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm border-b border-gray-100 ${pathname === '/previous-year-papers' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setIsOpen(false)}>
                  <FileText className="w-5 h-5" /><span>Previous Year Papers</span>
                </Link>
                <Link href="/practice"
                  className={`flex items-center gap-3 px-4 py-3.5 text-sm border-b border-gray-100 ${pathname === '/practice' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setIsOpen(false)}>
                  <Target className="w-5 h-5" /><span>Practice Zone</span>
                </Link>
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
                      <LogOut className="w-5 h-5" /><span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/user-menu"
                      className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                      onClick={() => setIsOpen(false)}>
                      <User className="w-5 h-5" /><span>User Login</span>
                    </Link>
                    <Link href="/institute/login"
                      className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}>
                      <LayoutDashboard className="w-5 h-5" /><span>Institute Login</span>
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