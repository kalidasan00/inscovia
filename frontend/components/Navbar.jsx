// components/Navbar.jsx
"use client";
import {
  useState, useEffect, useRef, useCallback, useMemo, memo,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Menu, X, User, LogOut, LayoutDashboard,
  Search, FileText, Target, Bell,
  MapPin, BookOpen, Building2, Sparkles, Loader2,
  Globe, Home, ChevronDown,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const lsGet    = (k) => { try { return typeof window !== "undefined" ? localStorage.getItem(k) : null; } catch { return null; } };
const lsSet    = (k, v) => { try { if (typeof window !== "undefined") localStorage.setItem(k, v); } catch {} };
const lsRemove = (k) => { try { if (typeof window !== "undefined") localStorage.removeItem(k); } catch {} };

/* ═══════════════════════════════════════
   NotificationBell
═══════════════════════════════════════ */
const NotificationBell = memo(function NotificationBell({ unreadCount, className = "" }) {
  const label = unreadCount > 0
    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
    : "Notifications";
  return (
    <Link
      href="/notifications"
      aria-label={label}
      className={`relative flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
    >
      <Bell className="w-5 h-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-[3px] pointer-events-none"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
});

/* ═══════════════════════════════════════
   SearchDropdown
═══════════════════════════════════════ */
const SearchDropdown = memo(function SearchDropdown({
  query, suggestions, aiResults, aiMode,
  onInstituteClick, onCourseClick, onLocationClick, onSearch,
}) {
  const hasResults =
    suggestions.institutes.length + suggestions.courses.length +
    suggestions.locations.length + aiResults.length > 0;

  if (!hasResults) {
    return <div className="p-4 text-center text-gray-400 text-sm">No results for &ldquo;{query}&rdquo;</div>;
  }

  return (
    <div className="overflow-y-auto max-h-[380px]">
      {aiResults.length > 0 && (
        <section className="p-2">
          <div className="px-2 py-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-blue-600" aria-hidden="true" />
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              {aiMode ? "AI Matched" : "Top Results"}
            </span>
            {aiMode && <span className="ml-auto text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Smart Search</span>}
          </div>
          <ul role="listbox">
            {aiResults.map((inst) => (
              <li key={inst.slug} role="option" aria-selected="false">
                <button onClick={() => onInstituteClick(inst.slug)}
                  className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-medium text-gray-900 truncate">{inst.name}</span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <MapPin className="w-2.5 h-2.5" />{inst.city}, {inst.state}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {suggestions.institutes.length > 0 && (
        <section className={`p-2 ${aiResults.length > 0 ? "border-t border-gray-100" : ""}`}>
          <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Institutes</p>
          <ul role="listbox">
            {suggestions.institutes.map((inst) => (
              <li key={inst.slug} role="option" aria-selected="false">
                <button onClick={() => onInstituteClick(inst.slug)}
                  className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-medium text-gray-900 truncate">{inst.name}</span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <MapPin className="w-2.5 h-2.5" />{inst.location}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {suggestions.courses.length > 0 && (
        <section className="p-2 border-t border-gray-100">
          <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Courses</p>
          <ul role="listbox">
            {suggestions.courses.map((course) => (
              <li key={course} role="option" aria-selected="false">
                <button onClick={() => onCourseClick(course)}
                  className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  </span>
                  <span className="text-xs text-gray-900">{course}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {suggestions.locations.length > 0 && (
        <section className="p-2 border-t border-gray-100">
          <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Locations</p>
          <ul role="listbox">
            {suggestions.locations.map((location) => (
              <li key={location} role="option" aria-selected="false">
                <button onClick={() => onLocationClick(location)}
                  className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2.5">
                  <span className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-green-600" />
                  </span>
                  <span className="text-xs text-gray-900">{location}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="p-2 border-t border-gray-100">
        <button onClick={onSearch}
          className="w-full px-2 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
          <Search className="w-3.5 h-3.5" />
          View all results for &ldquo;{query}&rdquo;
        </button>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════
   NavSearch
═══════════════════════════════════════ */
const NavSearch = memo(function NavSearch({ centers, autoFocus = false }) {
  const [query, setQuery]           = useState("");
  const [dropdownOpen, setDropdown] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [aiMode, setAiMode]         = useState(false);
  const [aiResults, setAiResults]   = useState([]);
  const [suggestions, setSuggestions] = useState({ institutes: [], courses: [], locations: [] });

  const router      = useRouter();
  const wrapperRef  = useRef(null);
  const inputRef    = useRef(null);
  const debounceRef = useRef(null);
  const abortRef    = useRef(null);

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener("mousedown", handler, { passive: true });
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchIndex = useMemo(() => {
    const institutes  = [];
    const courseMap   = new Map();
    const locationSet = new Set();
    for (const c of centers) {
      institutes.push({
        name: c.name, nameLower: c.name.toLowerCase(),
        cityLower: c.city?.toLowerCase() ?? "",
        city: c.city, state: c.state, slug: c.slug,
        coursesLower: c.courses?.map((co) => co.toLowerCase()) ?? [],
        location: `${c.city}, ${c.state}`,
      });
      c.courses?.forEach((co) => {
        const name = co.includes(":") ? co.split(":")[1].trim() : co;
        if (!courseMap.has(name.toLowerCase())) courseMap.set(name.toLowerCase(), name);
      });
      locationSet.add(`${c.city}, ${c.state}`);
    }
    return { institutes, courseMap, locationSet };
  }, [centers]);

  const getLocal = useCallback((term) => {
    const t = term.toLowerCase().trim();
    const institutes = [], courses = [], locations = [];
    for (const c of searchIndex.institutes) {
      if (c.nameLower.includes(t) || c.cityLower.includes(t) || c.coursesLower.some((co) => co.includes(t))) {
        institutes.push({ name: c.name, location: c.location, slug: c.slug });
        if (institutes.length === 4) break;
      }
    }
    for (const [lower, original] of searchIndex.courseMap) {
      if (lower.includes(t)) { courses.push(original); if (courses.length === 3) break; }
    }
    for (const loc of searchIndex.locationSet) {
      if (loc.toLowerCase().includes(t)) { locations.push(loc); if (locations.length === 2) break; }
    }
    return { institutes, courses, locations };
  }, [searchIndex]);

  const runAI = useCallback(async (q) => {
    if (q.length < 3) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
        signal: abortRef.current.signal,
      });
      const data = await res.json();
      if (res.ok && data.results?.length > 0) {
        setAiResults(data.results.slice(0, 5));
        setAiMode(data.searchType === "ai");
        setDropdown(true);
      }
    } catch (err) { if (err.name !== "AbortError") console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setSuggestions({ institutes: [], courses: [], locations: [] });
      setAiResults([]); setDropdown(false); return;
    }
    setSuggestions(getLocal(query)); setDropdown(true);
    debounceRef.current = setTimeout(() => runAI(query), 600);
    return () => clearTimeout(debounceRef.current);
  }, [query, getLocal, runAI]);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    const city = lsGet("userCity");
    const cp   = city ? `&city=${encodeURIComponent(city)}` : "";
    setDropdown(false); setQuery("");
    router.push(`/centers?q=${encodeURIComponent(query.trim())}${cp}`);
  }, [query, router]);

  const handleInstitute = useCallback((slug) => {
    setDropdown(false); setQuery(""); router.push(`/centers/${slug}`);
  }, [router]);

  const handleCourse = useCallback((course) => {
    const city = lsGet("userCity");
    const cp   = city ? `&city=${encodeURIComponent(city)}` : "";
    setDropdown(false); setQuery("");
    router.push(`/centers?q=${encodeURIComponent(course)}${cp}`);
  }, [router]);

  const handleLocation = useCallback((location) => {
    setDropdown(false); setQuery("");
    router.push(`/centers?city=${encodeURIComponent(location.split(",")[0].trim())}`);
  }, [router]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <label htmlFor="nav-search" className="sr-only">Search institutes, courses or locations</label>
        <input
          ref={inputRef}
          id="nav-search"
          type="search"
          role="combobox"
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); if (e.key === "Escape") setDropdown(false); }}
          onFocus={() => query.length >= 2 && setDropdown(true)}
          placeholder="Search institutes, courses..."
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all"
        />
        {loading
          ? <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin pointer-events-none" />
          : <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        }
        {query && (
          <button
            onClick={() => { setQuery(""); setDropdown(false); setAiResults([]); abortRef.current?.abort(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {dropdownOpen && query.length >= 2 && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-[200] overflow-hidden"
        >
          <SearchDropdown
            query={query} suggestions={suggestions}
            aiResults={aiResults} aiMode={aiMode}
            onInstituteClick={handleInstitute}
            onCourseClick={handleCourse}
            onLocationClick={handleLocation}
            onSearch={handleSearch}
          />
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════
   CitySelector
═══════════════════════════════════════ */
const CitySelector = memo(function CitySelector({ city, onCityChange }) {
  const [open, setOpen]           = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [manualInput, setManual]  = useState("");
  const ref      = useRef(null);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler, { passive: true });
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDetect = useCallback(() => {
    if (!navigator?.geolocation) { alert("Geolocation not supported."); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en", "User-Agent": "Inscovia/1.0 (https://inscovia.com)" } }
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county;
          if (city) {
            onCityChange(city);
            lsSet("userLat", String(latitude)); lsSet("userLng", String(longitude));
            setOpen(false);
          }
        } catch {} finally { setDetecting(false); }
      },
      () => setDetecting(false),
      { timeout: 8000 }
    );
  }, [onCityChange]);

  const handleManualSet = useCallback((e) => {
    e.preventDefault();
    if (manualInput.trim()) { onCityChange(manualInput.trim()); setManual(""); setOpen(false); }
  }, [manualInput, onCityChange]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={city ? `Location: ${city}` : "Set your city"}
        aria-expanded={open}
        title={city || "Set city"}
        className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100 whitespace-nowrap"
      >
        <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        <span className="max-w-[80px] truncate">{city || "Set City"}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Location settings"
          className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-[300] p-3 space-y-3"
        >
          <p className="text-xs font-semibold text-gray-700">Your Location</p>
          <button
            onClick={handleDetect} disabled={detecting}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {detecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
            {detecting ? "Detecting…" : "Detect my location"}
          </button>
          <form onSubmit={handleManualSet} className="flex gap-2">
            <input
              type="text" value={manualInput} onChange={(e) => setManual(e.target.value)}
              placeholder="Type city name…" autoComplete="off"
              className="flex-1 px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">Set</button>
          </form>
          {city && (
            <button onClick={() => { onCityChange(null); setOpen(false); }}
              className="w-full text-xs text-gray-400 hover:text-red-500 text-center transition-colors py-1">
              Clear location
            </button>
          )}
        </div>
      )}
    </div>
  );
});

const MOBILE_NAV = [
  { href: "/",                              label: "Home",                 Icon: Home },
  { href: "/centers",                       label: "Browse Centers",       Icon: Search },
  { href: "/centers?category=STUDY_ABROAD", label: "Study Abroad",        Icon: Globe },
  { href: "/previous-year-papers",          label: "Previous Year Papers", Icon: FileText },
  { href: "/practice",                      label: "Practice Zone",        Icon: Target },
];

/* ═══════════════════════════════════════
   NAVBAR
═══════════════════════════════════════ */
export default function Navbar() {
  const [menuOpen, setMenuOpen]                = useState(false);
  const [showMobileSearch, setMobileSearch]    = useState(false);
  const [isInstituteLoggedIn, setInstLoggedIn] = useState(false);
  const [isUserLoggedIn, setUserLoggedIn]      = useState(false);
  const [unreadCount, setUnread]               = useState(0);
  const [centers, setCenters]                  = useState([]);
  const [userCity, setUserCity]                = useState(null);

  const centersFetched = useRef(false);
  const pathname       = usePathname();
  const searchParams   = useSearchParams();
  const router         = useRouter();

  const isLoggedIn    = isInstituteLoggedIn || isUserLoggedIn;
  const dashboardHref = isInstituteLoggedIn ? "/institute/dashboard" : "/user/dashboard";
  const accountLabel  = isInstituteLoggedIn ? "Dashboard" : "Account";

  const isStudyAbroadActive = useMemo(() =>
    pathname?.startsWith("/centers") && searchParams?.get("category") === "STUDY_ABROAD",
    [pathname, searchParams]
  );

  const navLinkCls = useCallback((path) =>
    `text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap hover:text-blue-600 hover:bg-gray-50 ${
      pathname === path ? "text-blue-600 bg-blue-50" : "text-gray-600"
    }`, [pathname]
  );

  useEffect(() => {
    const saved = lsGet("userCity");
    if (saved) setUserCity(saved);
    const sync = () => setUserCity(lsGet("userCity") || null);
    window.addEventListener("userCityChanged", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("userCityChanged", sync); window.removeEventListener("storage", sync); };
  }, []);

  const handleCityChange = useCallback((city) => {
    setUserCity(city);
    if (city) lsSet("userCity", city); else lsRemove("userCity");
    window.dispatchEvent(new Event("userCityChanged"));
    if (pathname?.startsWith("/centers")) {
      const params = new URLSearchParams(window.location.search);
      if (city) params.set("city", city); else params.delete("city");
      router.push(`/centers?${params.toString()}`);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (centersFetched.current) return;
    centersFetched.current = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/centers?limit=100`, { next: { revalidate: 300 } });
        if (res.ok) { const d = await res.json(); setCenters(d.centers || []); }
      } catch {}
    })();
  }, []);

  const fetchUnread = useCallback(async (type) => {
    const tokenKey = type === "institute" ? "instituteToken" : "userToken";
    const token    = lsGet(tokenKey);
    if (!token) return;
    const endpoint = type === "institute" ? `${API_URL}/auth/notifications` : `${API_URL}/user/notifications`;
    try {
      const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const d = await res.json();
      setUnread(d.unreadCount || 0);
    } catch {}
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const instAuth = lsGet("instituteLoggedIn") === "true";
      const usrAuth  = lsGet("userLoggedIn") === "true";
      setInstLoggedIn(instAuth); setUserLoggedIn(usrAuth);
      if (instAuth) fetchUnread("institute");
      else if (usrAuth) fetchUnread("user");
      else setUnread(0);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authStateChanged", checkAuth);
    let pollId = setInterval(() => { if (document.visibilityState === "visible") checkAuth(); }, 60_000);
    const onVis = () => { clearInterval(pollId); if (document.visibilityState === "visible") pollId = setInterval(() => checkAuth(), 60_000); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authStateChanged", checkAuth);
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(pollId);
    };
  }, [fetchUnread]);

  useEffect(() => { setMenuOpen(false); setMobileSearch(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = useCallback(() => {
    setUnread(0);
    if (isInstituteLoggedIn) { lsRemove("instituteLoggedIn"); lsRemove("instituteToken"); lsRemove("instituteData"); }
    else if (isUserLoggedIn) {
      lsRemove("userLoggedIn"); lsRemove("userData"); lsRemove("userToken");
      lsRemove("userCity"); lsRemove("userLat"); lsRemove("userLng");
      setUserCity(null);
    }
    window.dispatchEvent(new Event("authStateChanged"));
    router.push("/");
  }, [isInstituteLoggedIn, isUserLoggedIn, router]);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm" aria-label="Main navigation">

      {/* ══════════════════════════════════
          DESKTOP  (lg = 1024px+)
          Layout: Logo | City+Search | Nav links | Auth
      ══════════════════════════════════ */}
      <div className="hidden lg:block">
        <div className="max-w-screen-xl mx-auto px-6 xl:px-8">
          <div className="flex items-center h-16 gap-4">

            {/* Logo — fixed width so it never shrinks */}
            <Link href="/" aria-label="Inscovia — home" className="flex items-center flex-shrink-0">
              <Image src="/Inscovia - 1 2.png" alt="Inscovia" width={140} height={40} priority className="h-9 w-auto" />
            </Link>

            {/* City + Search — flex-1 so it fills available space */}
            <div className="flex items-center gap-2 flex-1 min-w-0 mx-2">
              {isUserLoggedIn && (
                <div className="flex-shrink-0">
                  <CitySelector city={userCity} onCityChange={handleCityChange} />
                </div>
              )}
              <div className="flex-1 min-w-0 max-w-sm">
                <NavSearch centers={centers} />
              </div>
            </div>

            {/* Nav links — no shrink, consistent spacing */}
            <nav className="flex items-center gap-1 flex-shrink-0" aria-label="Primary">
              <Link href="/" className={navLinkCls("/")} aria-current={pathname === "/" ? "page" : undefined}>
                Home
              </Link>
              <Link href="/centers" className={navLinkCls("/centers")} aria-current={pathname === "/centers" ? "page" : undefined}>
                Centers
              </Link>
              <Link
                href="/centers?category=STUDY_ABROAD"
                aria-current={isStudyAbroadActive ? "page" : undefined}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap hover:text-blue-600 hover:bg-gray-50 ${
                  isStudyAbroadActive ? "text-blue-600 bg-blue-50" : "text-gray-600"
                }`}
              >
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span>Abroad</span>
              </Link>
              <Link
                href="/previous-year-papers"
                aria-current={pathname === "/previous-year-papers" ? "page" : undefined}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap hover:text-blue-600 hover:bg-gray-50 ${
                  pathname === "/previous-year-papers" ? "text-blue-600 bg-blue-50" : "text-gray-600"
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>Papers</span>
              </Link>
              <Link
                href="/practice"
                aria-current={pathname === "/practice" ? "page" : undefined}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap hover:text-blue-600 hover:bg-gray-50 ${
                  pathname === "/practice" ? "text-blue-600 bg-blue-50" : "text-gray-600"
                }`}
              >
                <Target className="w-4 h-4 flex-shrink-0" />
                <span>Practice</span>
              </Link>
            </nav>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

            {/* Auth */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isLoggedIn ? (
                <>
                  <NotificationBell unreadCount={unreadCount} className="p-2" />
                  <Link
                    href={dashboardHref}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    {isInstituteLoggedIn
                      ? <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                      : <User className="w-4 h-4 flex-shrink-0" />}
                    <span>{accountLabel}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    aria-label="Logout"
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link
                  href="/user-menu"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>Login</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          MOBILE / TABLET  (< 1024px)
      ══════════════════════════════════ */}
      <div className="lg:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">

          {/* Row 1 */}
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" aria-label="Inscovia — home" className="flex items-center flex-shrink-0">
              <Image src="/Inscovia - 1 2.png" alt="" width={120} height={36} priority className="h-8 sm:h-9 w-auto" />
            </Link>

            <div className="flex items-center gap-0.5">
              {isUserLoggedIn && <CitySelector city={userCity} onCityChange={handleCityChange} />}

              <button
                onClick={() => { setMobileSearch((v) => !v); setMenuOpen(false); }}
                aria-label={showMobileSearch ? "Close search" : "Open search"}
                aria-expanded={showMobileSearch}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showMobileSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              {isLoggedIn && <NotificationBell unreadCount={unreadCount} className="p-2" />}

              <button
                onClick={() => { setMenuOpen((v) => !v); setMobileSearch(false); }}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-menu"
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Row 2 — search */}
          {showMobileSearch && (
            <div className="pb-3 pt-1 border-t border-gray-100">
              <NavSearch centers={centers} autoFocus />
            </div>
          )}
        </div>

        {/* Drawer */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 top-14 sm:top-16 bg-black/30 z-40"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              id="mobile-nav-menu"
              role="dialog"
              aria-label="Navigation menu"
              className="fixed left-0 right-0 top-14 sm:top-16 z-50 bg-white border-t border-gray-100 shadow-lg rounded-b-2xl max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-4rem)] overflow-y-auto"
            >
              {userCity && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-blue-100">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-blue-700 font-medium truncate">{userCity}</span>
                </div>
              )}
              <ul role="list" className="py-1">
                {MOBILE_NAV.map(({ href, label, Icon }) => {
                  const isActive = href === "/centers?category=STUDY_ABROAD"
                    ? isStudyAbroadActive : pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 text-sm border-b border-gray-100 transition-colors ${
                          isActive ? "text-blue-600 bg-blue-50 font-medium" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{label}</span>
                      </Link>
                    </li>
                  );
                })}

                {isLoggedIn ? (
                  <>
                    <li>
                      <Link href={dashboardHref} onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                        {isInstituteLoggedIn
                          ? <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                          : <User className="w-5 h-5 flex-shrink-0" />}
                        <span>{isInstituteLoggedIn ? "Dashboard" : "My Account"}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/notifications" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                        <Bell className="w-5 h-5 flex-shrink-0" />
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    </li>
                    <li>
                      <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span>Logout</span>
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/user-menu" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                        <User className="w-5 h-5 flex-shrink-0" />
                        <span>User Login</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/institute/login" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                        <span>Institute Login</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}