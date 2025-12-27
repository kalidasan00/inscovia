"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  // Popular courses for suggestions
  const popularCourses = [
    "Python Programming",
    "Data Science",
    "Web Development",
    "Digital Marketing",
    "Excel Training",
    "Machine Learning",
    "Java Programming",
    "UI/UX Design"
  ];

  // Handle search input changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = popularCourses.filter(course =>
        course.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search submission
  function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    router.push(`/centers?q=${encodeURIComponent(searchQuery.trim())}`);
    setShowSuggestions(false);
  }

  // Handle suggestion click
  function handleSuggestionClick(suggestion) {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    router.push(`/centers?q=${encodeURIComponent(suggestion)}`);
  }

  // Quick filter buttons
  const quickFilters = ["Python", "Data Science", "Web Dev", "Design"];

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 py-12 sm:py-16 md:py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Training Institute
            </span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
            Discover training centers
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="bg-white rounded-xl shadow-2xl p-2">
              <div className="flex gap-2">
                {/* Search Input with Autocomplete */}
                <div className="relative flex-1" ref={searchRef}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery && setShowSuggestions(true)}
                      placeholder="Search courses..."
                      className="w-full pl-10 sm:pl-12 pr-10 py-3 sm:py-4 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setShowSuggestions(false);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 transition-colors flex items-center gap-2 sm:gap-3"
                        >
                          <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 text-sm sm:text-base truncate">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-white/90 text-xs sm:text-sm font-medium">
              Popular:
            </span>
            {quickFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setSearchQuery(filter);
                  router.push(`/centers?q=${encodeURIComponent(filter)}`);
                }}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-xs sm:text-sm font-medium hover:bg-white/20 transition-all"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}