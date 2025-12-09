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
    <section className="bg-gradient-to-b from-white to-gray-50 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        <div className="rounded-lg p-4 sm:p-6 bg-white shadow-sm">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Find training centers near you</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Search IT & non-IT coaching centers, compare courses and ratings.</p>

          <form onSubmit={onSearch} className="mt-4">
            {/* Mobile: Compact Search Bar */}
            <div className="sm:hidden">
              <div className="flex gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search centers or courses..."
                  className="flex-1 px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              {/* Collapsible Filters Button */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="mt-3 flex items-center justify-center gap-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {showFilters ? "Hide Filters" : "Show Filters"}
                {(q || type) && (
                  <span className="ml-1 px-2 py-0.5 bg-accent text-white text-xs rounded-full">
                    {[q, type].filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* Collapsible Filter Panel */}
              {showFilters && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="">All types</option>
                      <option value="IT">IT</option>
                      <option value="Non-IT">Non-IT</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Desktop: Full Width Layout */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search center or course (e.g. Data Science)"
                className="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="">All types</option>
                <option value="IT">IT</option>
                <option value="Non-IT">Non-IT</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white rounded-md w-full font-medium hover:bg-accent/90 transition-colors"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border rounded-md w-full font-medium hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}