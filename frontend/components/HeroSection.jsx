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
    <section className="bg-gradient-to-b from-white to-gray-50 py-4 sm:py-6">
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        <div className="text-center mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Find Your Perfect Training Center
          </h1>
          <p className="text-gray-600 mt-1 text-xs sm:text-sm">
            Discover IT & Non-IT coaching centers across India
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <form onSubmit={onSearch}>
            {/* Mobile: Compact Search */}
            <div className="sm:hidden space-y-2">
              <div className="flex gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search centers or courses..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              {/* Filters Toggle */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {showFilters ? "Hide Filters" : "Show Filters"}
                {type && (
                  <span className="ml-1 px-1.5 py-0.5 bg-accent text-white text-xs rounded-full">
                    1
                  </span>
                )}
              </button>

              {/* Collapsible Filter Panel */}
              {showFilters && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-2 border border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Center Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    >
                      <option value="">All Types</option>
                      <option value="IT">IT Training</option>
                      <option value="Non-IT">Non-IT Training</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-white transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Desktop: Full Width Layout */}
            <div className="hidden sm:flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search centers or courses (e.g., Python, Data Science)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              >
                <option value="">All Types</option>
                <option value="IT">IT Training</option>
                <option value="Non-IT">Non-IT Training</option>
              </select>
              <button
                type="submit"
                className="px-5 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors whitespace-nowrap"
              >
                Search
              </button>
              {(q || type) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}