"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Code2, BarChart3, Globe, Palette } from "lucide-react";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
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
    "UI/UX Design",
    "Artificial Intelligence",
    "Graphic Design",
    "Spoken English",
    "Cloud Computing"
  ];

  // Handle search input changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = popularCourses.filter(course =>
        course.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setFocusedIndex(-1);
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

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[focusedIndex]);
    }
  };

  // Handle search submission
  function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim() && !selectedType) return;

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedType) params.set("type", selectedType);

    router.push(`/centers?${params.toString()}`);
    setShowSuggestions(false);
  }

  // Handle suggestion click
  function handleSuggestionClick(suggestion) {
    setSearchQuery(suggestion);
    setShowSuggestions(false);

    const params = new URLSearchParams();
    params.set("q", suggestion);
    if (selectedType) params.set("type", selectedType);

    router.push(`/centers?${params.toString()}`);
  }

  // Quick filter buttons
  const quickFilters = [
    { label: "Python", icon: Code2 },
    { label: "Data Science", icon: BarChart3 },
    { label: "Web Dev", icon: Globe },
    { label: "Design", icon: Palette }
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 py-20 md:py-28 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Content */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6">
            <span className="text-2xl">🎓</span>
            <span className="text-white font-semibold text-sm">India's Premier Training Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
              Training Institute
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-4">
            Discover, Compare & Enroll in Top IT & Non-IT Training Centers
          </p>

          <div className="flex items-center justify-center gap-6 text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="font-medium">500+ Centers</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium">Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">10K+ Students</span>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="bg-white rounded-2xl shadow-2xl p-2">
              <div className="flex flex-col md:flex-row gap-2">
                {/* Search Input with Autocomplete */}
                <div className="relative flex-1" ref={searchRef}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => searchQuery && setShowSuggestions(true)}
                      placeholder="Search for courses like Python, Data Science, Digital Marketing..."
                      className="w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setShowSuggestions(false);
                        }}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                            index === focusedIndex ? 'bg-blue-50' : ''
                          }`}
                        >
                          <Search className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-6 py-4 text-gray-900 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer min-w-[140px]"
                >
                  <option value="">All Types</option>
                  <option value="IT">💻 IT</option>
                  <option value="Non-IT">📚 Non-IT</option>
                </select>

                {/* Search Button */}
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <span className="text-white/90 text-sm font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Popular:
            </span>
            {quickFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.label}
                  onClick={() => {
                    setSearchQuery(filter.label);
                    const params = new URLSearchParams();
                    params.set("q", filter.label);
                    router.push(`/centers?${params.toString()}`);
                  }}
                  className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}