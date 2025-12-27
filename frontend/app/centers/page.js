// app/centers/page.js
"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CenterCard from "../../components/CenterCard";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Centers() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    async function loadCenters() {
      try {
        const res = await fetch(`${API_URL}/centers`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setTimeout(loadCenters, 2000);
          return;
        }

        const data = await res.json();
        setCenters(data.centers || []);
      } catch (err) {
        console.error("Error reaching backend:", err);
        setTimeout(loadCenters, 2000);
      } finally {
        setLoading(false);
      }
    }

    loadCenters();
  }, [API_URL]);

  // Get filter params
  const category = searchParams.get("category") || "";
  const state = searchParams.get("state") || "";
  const city = searchParams.get("city") || "";
  const urlSearchQuery = searchParams.get("q") || "";

  const effectiveSearchQuery = urlSearchQuery || searchQuery;

  // Get unique values for filters
  const uniqueStates = Array.from(new Set(centers.map((c) => c.state).filter(Boolean))).sort();
  const uniqueCities = Array.from(new Set(centers.map((c) => c.city).filter(Boolean))).sort();

  // Apply filters
  let filtered = centers;

  if (category) {
    filtered = filtered.filter((c) =>
      c.primaryCategory === category ||
      c.secondaryCategories?.includes(category)
    );
  }

  if (state) {
    filtered = filtered.filter((c) => c.state === state);
  }

  if (city) {
    filtered = filtered.filter((c) => c.city === city);
  }

  if (effectiveSearchQuery) {
    const query = effectiveSearchQuery.toLowerCase();
    filtered = filtered.filter((c) => {
      const searchableText = [
        c.name,
        c.primaryCategory,
        ...(c.secondaryCategories || []),
        c.teachingMode,
        c.city,
        c.district,
        c.state,
        c.location,
        c.description || "",
        ...(c.courses || [])
      ].join(" ").toLowerCase();
      return searchableText.includes(query);
    });
  }

  const activeFiltersCount = [category, state, city, effectiveSearchQuery].filter(Boolean).length;

  const formatCategory = (cat) => {
    return cat?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  const handleFilterChange = (type, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }
    router.push(`/centers?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    router.push('/centers');
  };

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {category ? formatCategory(category) : "Training Centers"}
            </h1>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium"
            >
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, institutes..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg border p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-accent hover:text-accent/80 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* State Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  value={state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">All States</option>
                  {uniqueStates.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-xs font-medium text-gray-600 mb-2">Active Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {category && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                        {formatCategory(category)}
                        <button onClick={() => handleFilterChange('category', '')} className="hover:text-accent/80">
                          ×
                        </button>
                      </span>
                    )}
                    {state && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                        {state}
                        <button onClick={() => handleFilterChange('state', '')} className="hover:text-accent/80">
                          ×
                        </button>
                      </span>
                    )}
                    {city && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                        {city}
                        <button onClick={() => handleFilterChange('city', '')} className="hover:text-accent/80">
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results Count */}
            {!loading && (
              <p className="text-sm text-gray-600 mb-4">
                {filtered.length} {filtered.length === 1 ? "center" : "centers"} found
              </p>
            )}

            {/* Centers Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-gray-700 font-medium text-lg mb-2">No centers found</p>
                <p className="text-sm text-gray-500 mb-4">Try different filters</p>
                <button
                  onClick={clearAllFilters}
                  className="text-accent hover:text-accent/80 font-medium text-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((center) => (
                  <CenterCard key={center.id} center={center} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}