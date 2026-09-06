// app/colleges/colleges-client.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MapPin, Search, GraduationCap } from "lucide-react";
import Footer from "../../components/Footer";
import { CenterListSkeleton } from "../../components/LoadingSkeleton";

function CollegeCard({ college }) {
  return (
    <Link
      href={`/colleges/${college.slug}`}
      className="group bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
    >
      <div className="relative h-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="absolute -bottom-6 left-3">
          <div className="w-14 h-14 bg-white rounded-lg shadow-md border-4 border-white flex items-center justify-center overflow-hidden">
            {college.logo ? (
              <img src={college.logo} alt={college.name} className="w-full h-full object-cover" />
            ) : (
              <GraduationCap className="w-6 h-6 text-indigo-500" />
            )}
          </div>
        </div>
      </div>

      <div className="pt-8 px-3 pb-3 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {college.name}
        </h3>

        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{college.city}, {college.state}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {college.primaryCategory && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-100 text-indigo-700">
              {college.primaryCategory.replace(/_/g, " ")}
            </span>
          )}
          {college.type && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-green-100 text-green-700">
              {college.type}
            </span>
          )}
          {college.rating > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
              ★ {college.rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-2 line-clamp-2 flex-1">{college.description}</p>
      </div>
    </Link>
  );
}

export default function CollegesClient({ initialColleges = [] }) {
  const [colleges, setColleges] = useState(initialColleges);
  const [loading, setLoading] = useState(initialColleges.length === 0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    if (initialColleges.length > 0) return;
    let retries = 0;
    async function loadColleges() {
      try {
        const res = await fetch(`${API_URL}/colleges?limit=100`, { cache: "no-store" });
        if (!res.ok) {
          if (retries < 3) { retries++; setTimeout(loadColleges, 2000); }
          return;
        }
        const data = await res.json();
        setColleges(data.colleges || []);
      } catch (err) {
        console.error("Error reaching backend:", err);
        if (retries < 3) { retries++; setTimeout(loadColleges, 2000); }
      } finally {
        setLoading(false);
      }
    }
    loadColleges();
  }, [API_URL]);

  const category = searchParams.get("category") || "";
  const state = searchParams.get("state") || "";
  const city = searchParams.get("city") || "";
  const type = searchParams.get("type") || "";
  const ownership = searchParams.get("ownership") || "";
  const searchQuery = searchParams.get("q") || "";
  const minRating = searchParams.get("rating") ? parseFloat(searchParams.get("rating")) : null;

  let filtered = colleges;

  if (category) {
    filtered = filtered.filter((c) =>
      c.primaryCategory === category ||
      c.secondaryCategories?.includes(category)
    );
  }
  if (state) filtered = filtered.filter((c) => c.state === state);
  if (city) filtered = filtered.filter((c) => c.city?.toLowerCase() === city.toLowerCase());
  if (type) filtered = filtered.filter((c) => c.type === type);
  if (ownership) filtered = filtered.filter((c) => c.ownership === ownership);
  if (minRating) filtered = filtered.filter((c) => c.rating >= minRating);

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((c) => {
      const searchableText = [
        c.name, c.primaryCategory,
        ...(c.secondaryCategories || []),
        c.type, c.ownership, c.city, c.district, c.state, c.location,
        c.description || "",
      ].join(" ").toLowerCase();
      const queryWords = query.split(/[\s\/]+/).filter(Boolean);
      return queryWords.every((word) => searchableText.includes(word)) || searchableText.includes(query);
    });
  }

  const activeFiltersCount = [
    category, state, city, type, ownership, searchQuery, minRating ? "rating" : null
  ].filter(Boolean).length;

  const formatCategory = (cat) => cat?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "";

  const clearAllFilters = () => {
    router.push("/colleges");
  };

  const pageTitle = category
    ? formatCategory(category)
    : searchQuery
    ? `Results: "${searchQuery}"`
    : city
    ? `Colleges in ${city}`
    : "Colleges";

  return (
    <>
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 pb-20 md:pb-8">
        <div className="mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight truncate">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Explore top colleges and universities across India.
          </p>

          <div className="relative mt-3">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              defaultValue={searchQuery}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) params.set("q", e.target.value);
                else params.delete("q");
                router.replace(`/colleges${params.toString() ? "?" + params.toString() : ""}`);
              }}
              placeholder="Search colleges by name, city, or category..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-gray-500">Filters:</span>
              {category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  {formatCategory(category)} <button onClick={clearAllFilters} className="hover:text-red-500">×</button>
                </span>
              )}
              {state && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  {state} <button onClick={clearAllFilters} className="hover:text-red-500">×</button>
                </span>
              )}
              {city && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  {city} <button onClick={clearAllFilters} className="hover:text-red-500">×</button>
                </span>
              )}
              {type && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  {type} <button onClick={clearAllFilters} className="hover:text-red-500">×</button>
                </span>
              )}
              {ownership && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  {ownership} <button onClick={clearAllFilters} className="hover:text-red-500">×</button>
                </span>
              )}
              {minRating && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs font-medium">
                  {minRating}★+ <button onClick={clearAllFilters} className="hover:text-red-500">×</button>
                </span>
              )}
              <button onClick={clearAllFilters} className="text-xs text-accent hover:text-accent/80 font-medium underline ml-1">
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {!loading && (
            <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
              {filtered.length} {filtered.length === 1 ? "college" : "colleges"} found
              {searchQuery && ` for "${searchQuery}"`}
              {city && ` in ${city}`}
            </p>
          )}

          {loading ? (
            <CenterListSkeleton count={8} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-700 font-medium mb-2">No colleges found</p>
              <p className="text-sm text-gray-500 mb-3">
                {city ? `No results in ${city}.` : searchQuery ? `No results for "${searchQuery}"` : "Try different filters"}
              </p>
              <button onClick={clearAllFilters} className="text-accent hover:text-accent/80 font-medium text-sm">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 items-stretch">
              {filtered.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}