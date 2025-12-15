// components/HeroSection.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  function onSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    router.push(`/centers?${params.toString()}`);
  }

  function handleReset() {
    setQ("");
    setType("");
    router.push("/centers");
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-12 sm:py-16 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute top-20 left-20 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-32 w-2 h-2 bg-white/40 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-white/40 rounded-full animate-ping delay-1000"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold rounded-full border border-white/30">
              🎓 India's #1 Training Center Platform
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
              Training Center
            </span>
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto">
            Discover 500+ verified IT & Non-IT coaching centers across India. Compare, Choose & Excel! 🚀
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 backdrop-blur-xl">
          <form onSubmit={onSearch}>
            {/* Mobile: Compact Search */}
            <div className="sm:hidden space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search Python, Data Science, Excel..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                🔍 Search Training Centers
              </button>

              {/* Filters Toggle */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {showFilters ? "Hide Filters" : "Advanced Filters"}
                {type && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    1
                  </span>
                )}
              </button>

              {/* Collapsible Filter Panel */}
              {showFilters && (
                <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl space-y-3 border-2 border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Training Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">All Types</option>
                      <option value="IT">💻 IT Training</option>
                      <option value="Non-IT">📚 Non-IT Training</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-white transition-all"
                  >
                    🔄 Reset All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Desktop: Premium Search Bar */}
            <div className="hidden sm:block">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search for courses like Python, Data Science, Digital Marketing..."
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="px-4 py-4 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">All Types</option>
                  <option value="IT">💻 IT Training</option>
                  <option value="Non-IT">📚 Non-IT Training</option>
                </select>

                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  Search Now
                </button>

                {(q || type) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-4 border-2 border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Popular Searches */}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">Popular:</span>
                {["Python", "Data Science", "Digital Marketing", "Excel"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQ(term);
                      const params = new URLSearchParams();
                      params.set("q", term);
                      router.push(`/centers?${params.toString()}`);
                    }}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 flex-wrap text-white/80 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span>4.8★ Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>500+ Verified Centers</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            <span>10K+ Students</span>
          </div>
        </div>
      </div>
    </section>
  );
}