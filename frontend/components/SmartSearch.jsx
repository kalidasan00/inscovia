"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, BookOpen, Building2, Sparkles, Loader2 } from "lucide-react";

export default function SmartSearch({
  centers = [],
  placeholder = "Search institutes, courses, locations..."
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState(false); // true = AI results, false = keyword
  const [suggestions, setSuggestions] = useState({
    institutes: [],
    courses: [],
    locations: []
  });
  const [aiResults, setAiResults] = useState([]);

  const router = useRouter();
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─────────────────────────────────────
  // Local keyword suggestions (instant)
  // ─────────────────────────────────────
  const getLocalSuggestions = useCallback((searchTerm) => {
    const term = searchTerm.toLowerCase().trim();

    const matchingInstitutes = centers
      .filter(c => c.name.toLowerCase().includes(term))
      .slice(0, 3)
      .map(c => ({
        type: "institute",
        name: c.name,
        location: `${c.city}, ${c.state}`,
        slug: c.slug
      }));

    const allCourses = new Set();
    centers.forEach(c => {
      c.courses?.forEach(course => {
        const courseName = course.includes(":") ? course.split(":")[1].trim() : course;
        if (courseName.toLowerCase().includes(term)) allCourses.add(courseName);
      });
    });

    const allLocations = new Set();
    centers.forEach(c => {
      const cityState = `${c.city}, ${c.state}`;
      if (cityState.toLowerCase().includes(term)) allLocations.add(cityState);
      if (c.location?.toLowerCase().includes(term)) allLocations.add(`${c.location}, ${c.city}`);
    });

    return {
      institutes: matchingInstitutes,
      courses: Array.from(allCourses).slice(0, 4),
      locations: Array.from(allLocations).slice(0, 3)
    };
  }, [centers]);

  // ─────────────────────────────────────
  // AI search (debounced — fires after
  // user stops typing for 600ms)
  // ─────────────────────────────────────
  const runAiSearch = useCallback(async (searchQuery) => {
    if (searchQuery.length < 3) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      if (res.ok && data.results?.length > 0) {
        setAiResults(data.results.slice(0, 5));
        setAiMode(data.searchType === "ai");
        setIsOpen(true);
      }
    } catch {
      // AI search failed silently — local suggestions still showing
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  // Main effect — runs on query change
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions({ institutes: [], courses: [], locations: [] });
      setAiResults([]);
      setIsOpen(false);
      return;
    }

    // Show local suggestions instantly
    const local = getLocalSuggestions(query);
    setSuggestions(local);
    setIsOpen(true);

    // Debounce AI search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runAiSearch(query);
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, getLocalSuggestions, runAiSearch]);

  // ─────────────────────────────────────
  // Navigation handlers
  // ─────────────────────────────────────
  const handleSearch = () => {
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/centers?q=${encodeURIComponent(query.trim())}`);
  };

  const handleInstituteClick = (slug) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/centers/${slug}`);
  };

  const handleCourseClick = (course) => {
    setIsOpen(false);
    setQuery(course);
    router.push(`/centers?q=${encodeURIComponent(course)}`);
  };

  const handleLocationClick = (location) => {
    setIsOpen(false);
    setQuery("");
    const city = location.split(",")[0].trim();
    router.push(`/centers?city=${encodeURIComponent(city)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
    else if (e.key === "Escape") setIsOpen(false);
  };

  const totalLocal =
    suggestions.institutes.length +
    suggestions.courses.length +
    suggestions.locations.length;

  const hasResults = totalLocal > 0 || aiResults.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-9 sm:pl-12 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm transition-all"
        />

        {loading
          ? <Loader2 className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-accent animate-spin" />
          : <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        }

        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); setAiResults([]); }}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[480px] overflow-hidden">
          {!hasResults && !loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found for "{query}"
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[480px]">

              {/* ── AI Results Section ── */}
              {aiResults.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                      {aiMode ? "AI Matched" : "Top Results"}
                    </span>
                    {aiMode && (
                      <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        Smart Search
                      </span>
                    )}
                  </div>
                  {aiResults.map((inst, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInstituteClick(inst.slug)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                        <Building2 className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {inst.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {inst.city}, {inst.state}
                          </span>
                          {inst.rating > 0 && (
                            <span className="text-xs text-yellow-600 font-medium">
                              ⭐ {inst.rating}
                            </span>
                          )}
                        </div>
                        {inst.courses?.length > 0 && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {inst.courses.slice(0, 2).join(" · ")}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* ── Local: Institutes ── */}
              {suggestions.institutes.length > 0 && (
                <div className={`p-2 ${aiResults.length > 0 ? "border-t border-gray-100" : ""}`}>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Institutes
                  </div>
                  {suggestions.institutes.map((institute, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInstituteClick(institute.slug)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                        <Building2 className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {institute.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {institute.location}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* ── Local: Courses ── */}
              {suggestions.courses.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Courses
                  </div>
                  {suggestions.courses.map((course, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCourseClick(course)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-sm text-gray-900">{course}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* ── Local: Locations ── */}
              {suggestions.locations.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Locations
                  </div>
                  {suggestions.locations.map((location, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLocationClick(location)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-sm text-gray-900">{location}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* ── View All ── */}
              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={handleSearch}
                  className="w-full px-3 py-2.5 text-sm font-medium text-accent hover:bg-accent/5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
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