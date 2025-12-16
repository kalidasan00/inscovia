// app/centers/page.js
"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CenterCard from "../../components/CenterCard";
import CenterFilter from "../../components/CenterFilter";
import { useSearchParams } from "next/navigation";

export default function Centers() {
  const [centers, setCenters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const searchParams = useSearchParams();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function loadCenters() {
      try {
        const res = await fetch(`${API_URL}/centers`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.warn("Backend not awake, retrying...");
          setTimeout(loadCenters, 2000);
          return;
        }

        const data = await res.json();
        setCenters(data.centers || []);

      } catch (err) {
        console.error("Error reaching backend, retrying...", err);
        setTimeout(loadCenters, 2000);
      } finally {
        setLoading(false);
      }
    }

    loadCenters();
  }, []);

  // Get filter params
  const type = searchParams.get("type") || "";
  const stateParam = searchParams.get("state") || "";
  const districtParam = searchParams.get("district") || "";
  const cityParam = searchParams.get("city") || "";
  const locationParam = searchParams.get("location") || "";
  const urlSearchQuery = searchParams.get("q") || "";

  // Use URL search query if available, otherwise use local search
  const effectiveSearchQuery = urlSearchQuery || searchQuery;

  // Get unique values for filters
  const uniqueTypes = Array.from(new Set(centers.map((c) => c.type))).sort();
  const uniqueStates = Array.from(new Set(centers.map((c) => c.state))).sort();
  const uniqueDistricts = Array.from(new Set(centers.map((c) => c.district))).sort();
  const uniqueCities = Array.from(new Set(centers.map((c) => c.city))).sort();
  const uniqueLocations = Array.from(new Set(centers.map((c) => c.location))).sort();

  // Apply filters
  let filtered = centers;

  // Filter by type
  if (type) {
    filtered = filtered.filter((c) =>
      c.type.toLowerCase() === type.toLowerCase()
    );
  }

  // Filter by state
  if (stateParam) {
    filtered = filtered.filter((c) =>
      c.state.toLowerCase() === stateParam.toLowerCase()
    );
  }

  // Filter by district
  if (districtParam) {
    filtered = filtered.filter((c) =>
      c.district.toLowerCase() === districtParam.toLowerCase()
    );
  }

  // Filter by city
  if (cityParam) {
    filtered = filtered.filter((c) =>
      c.city.toLowerCase() === cityParam.toLowerCase()
    );
  }

  // Filter by location
  if (locationParam) {
    filtered = filtered.filter((c) =>
      c.location.toLowerCase() === locationParam.toLowerCase()
    );
  }

  // Search filter - searches in name, courses, description, type, city, location
  if (effectiveSearchQuery) {
    const query = effectiveSearchQuery.toLowerCase();
    filtered = filtered.filter((c) => {
      const searchableText = [
        c.name,
        c.type,
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

  const activeFiltersCount = [
    type,
    stateParam,
    districtParam,
    cityParam,
    locationParam,
    effectiveSearchQuery
  ].filter(Boolean).length;

  // Handle local search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // You can add URL update here if needed
  };

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Training Centers</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Browse IT and Non-IT training centers
              </p>
            </div>

            {/* Mobile Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-accent text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name, course, city, or location..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
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
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Count */}
        {loading && <p className="text-gray-600 text-sm mb-4">Loading centers...</p>}

        {!loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {filtered.length} {filtered.length === 1 ? "center" : "centers"} found
            </p>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  window.history.pushState({}, '', '/centers');
                  window.location.reload();
                }}
                className="text-sm text-accent hover:text-accent/80 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden md:block md:col-span-1">
            <CenterFilter
              types={uniqueTypes}
              states={uniqueStates}
              districts={uniqueDistricts}
              cities={uniqueCities}
              locations={uniqueLocations}
            />
          </div>

          {/* Mobile Filter Dropdown */}
          {showFilters && (
            <div className="md:hidden col-span-1 mb-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <CenterFilter
                  types={uniqueTypes}
                  states={uniqueStates}
                  districts={uniqueDistricts}
                  cities={uniqueCities}
                  locations={uniqueLocations}
                />
              </div>
            </div>
          )}

          {/* Centers Grid */}
          <div className="col-span-1 md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((center) => (
                <CenterCard key={center.id} center={center} />
              ))}

              {!loading && filtered.length === 0 && (
                <div className="col-span-full p-8 bg-white rounded-lg shadow-sm border text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-700 font-medium text-lg mb-2">No centers found</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      window.history.pushState({}, '', '/centers');
                      window.location.reload();
                    }}
                    className="text-accent hover:text-accent/80 font-medium text-sm"
                  >
                    Clear all filters
                  </button>
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