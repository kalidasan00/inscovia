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

  const searchParams = useSearchParams();

  // ⭐ Use environment variable (works on Vercel + Mobile)
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

  // Filters
  const type = searchParams.get("type") || "";
  const location = searchParams.get("location") || "";
  const q = searchParams.get("q") || "";

  const uniqueLocations = Array.from(
    new Set(centers.map((c) => c.location))
  ).sort();

  let filtered = centers;
  if (type) filtered = filtered.filter((c) => c.type.toLowerCase() === type.toLowerCase());
  if (location) filtered = filtered.filter((c) => c.location.toLowerCase() === location.toLowerCase());
  if (q)
    filtered = filtered.filter((c) =>
      (c.name + " " + c.courses.join(" ")).toLowerCase().includes(q.toLowerCase())
    );

  const activeFiltersCount = [type, location, q].filter(Boolean).length;

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Training Centers</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Browse IT and Non-IT training centers.
            </p>
          </div>

          {/* Mobile Filters */}
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

        {/* Loading State */}
        {loading && <p className="text-gray-600 text-sm">Loading centers...</p>}

        {!loading && (
          <p className="text-sm text-gray-600 mb-4">
            {filtered.length} {filtered.length === 1 ? "center" : "centers"} found
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden md:block md:col-span-1">
            <CenterFilter locations={uniqueLocations} />
          </div>

          {/* Mobile Filter Dropdown */}
          {showFilters && (
            <div className="md:hidden col-span-1 mb-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <CenterFilter locations={uniqueLocations} />
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
                <div className="col-span-full p-6 bg-white rounded-lg shadow-sm border text-center">
                  <p className="text-gray-700 font-medium">No centers found</p>
                  <p className="text-sm text-gray-500">
                    Try adjusting the filters.
                  </p>
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
