// app/centers/page.js
"use client";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CenterCard from "../../components/CenterCard";
import CenterFilter from "../../components/CenterFilter";
import centers from "../../data/centers.json";
import { useSearchParams } from "next/navigation";

export default function Centers() {
  const [showFilters, setShowFilters] = useState(false);
  const searchParams = useSearchParams();
  const all = centers;

  const uniqueLocations = Array.from(new Set(all.map(c => c.location))).sort();

  // Get filter values from URL
  const type = searchParams.get("type") || "";
  const location = searchParams.get("location") || "";
  const q = searchParams.get("q") || "";

  // Apply filters
  let filtered = all;
  if (type) filtered = filtered.filter(c => c.type.toLowerCase() === type.toLowerCase());
  if (location) filtered = filtered.filter(c => c.location.toLowerCase() === location.toLowerCase());
  if (q) filtered = filtered.filter(c => (c.name + " " + c.courses.join(" ")).toLowerCase().includes(q.toLowerCase()));

  // Count active filters
  const activeFiltersCount = [type, location, q].filter(Boolean).length;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Training Centers</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Browse IT and Non-IT training centers.
            </p>
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filters
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-accent text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filtered.length} {filtered.length === 1 ? 'center' : 'centers'} found
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Desktop Sidebar Filter - Always Visible */}
          <div className="hidden md:block md:col-span-1">
            <CenterFilter locations={uniqueLocations} />
          </div>

          {/* Mobile Collapsible Filter */}
          {showFilters && (
            <div className="md:hidden col-span-1 mb-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <CenterFilter locations={uniqueLocations} />
              </div>
            </div>
          )}

          {/* Center Cards Grid */}
          <div className="col-span-1 md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map(center => (
                <CenterCard key={center.id} center={center} />
              ))}

              {filtered.length === 0 && (
                <div className="col-span-full p-6 bg-white rounded-lg shadow-sm border border-gray-200 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-700 font-medium mb-1">No centers found</p>
                  <p className="text-sm text-gray-500">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}