// app/centers/centers-client.jsx - OPTIMIZED
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Footer from "../../components/Footer";
import { CenterListSkeleton } from "../../components/LoadingSkeleton";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import ConsultantCard from "../../components/ConsultantCard";

const CenterCard = dynamic(() => import("../../components/CenterCard"));
const SmartSearch = dynamic(() => import("../../components/SmartSearch"), {
  loading: () => <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
});
const MobileFilters = dynamic(() => import("../../components/MobileFilters"), {
  ssr: false
});

export default function CentersClient() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    async function loadCenters() {
      try {
        const res = await fetch(`${API_URL}/centers`, { cache: "no-store" });
        if (!res.ok) { setTimeout(loadCenters, 2000); return; }
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

  const category = searchParams.get("category") || "";
  const state = searchParams.get("state") || "";
  const city = searchParams.get("city") || "";
  const searchQuery = searchParams.get("q") || "";
  const teachingMode = searchParams.get("teachingMode") || "";
  const minRating = searchParams.get("rating") ? parseFloat(searchParams.get("rating")) : null;
  const priceRange = searchParams.get("priceRange") || "";

  const isStudyAbroadMode = category === "STUDY_ABROAD";

  const uniqueStates = Array.from(new Set(centers.map((c) => c.state).filter(Boolean))).sort();

  let filtered = centers;

  // ✅ Hide STUDY_ABROAD from main list unless explicitly filtering for it
  if (!isStudyAbroadMode) {
    filtered = filtered.filter((c) => c.primaryCategory !== "STUDY_ABROAD");
  }

  if (category) {
    filtered = filtered.filter((c) =>
      c.primaryCategory === category ||
      c.secondaryCategories?.includes(category)
    );
  }

  if (state) filtered = filtered.filter((c) => c.state === state);
  if (city) filtered = filtered.filter((c) => c.city === city);
  if (teachingMode) filtered = filtered.filter((c) => c.teachingMode === teachingMode);
  if (minRating) filtered = filtered.filter((c) => c.rating >= minRating);

  if (priceRange) {
    filtered = filtered.filter((c) => {
      if (!c.courseDetails || !Array.isArray(c.courseDetails) || c.courseDetails.length === 0) return false;
      const prices = c.courseDetails.map(course => {
        const fee = parseInt(course.fees);
        return isNaN(fee) ? 0 : fee;
      }).filter(fee => fee > 0);
      if (prices.length === 0) return false;
      const minPrice = Math.min(...prices);
      if (priceRange === "0-5000") return minPrice < 5000;
      if (priceRange === "5000-10000") return minPrice >= 5000 && minPrice < 10000;
      if (priceRange === "10000-25000") return minPrice >= 10000 && minPrice < 25000;
      if (priceRange === "25000-50000") return minPrice >= 25000 && minPrice < 50000;
      if (priceRange === "50000-100000") return minPrice >= 50000 && minPrice < 100000;
      if (priceRange === "100000+") return minPrice >= 100000;
      return true;
    });
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((c) => {
      const searchableText = [
        c.name, c.primaryCategory,
        ...(c.secondaryCategories || []),
        c.teachingMode, c.city, c.district, c.state, c.location,
        c.description || "",
        ...(c.courses || []),
        ...(c.countries || []),
        ...(c.services || []),
      ].join(" ").toLowerCase();
      const queryWords = query.split(/[\s\/]+/).filter(Boolean);
      return queryWords.every(word => searchableText.includes(word)) || searchableText.includes(query);
    });
  }

  const activeFiltersCount = [category, state, city, searchQuery, teachingMode, minRating ? 'rating' : null, priceRange].filter(Boolean).length;
  const formatCategory = (cat) => cat?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  const handleMobileFilterChange = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.state) params.set('state', newFilters.state);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.categories?.length > 0) newFilters.categories.forEach(cat => params.append('category', cat));
    if (newFilters.teachingModes?.length > 0) newFilters.teachingModes.forEach(mode => params.append('teachingMode', mode));
    if (newFilters.minRating) params.set('rating', newFilters.minRating);
    if (newFilters.priceRange) params.set('priceRange', newFilters.priceRange);
    if (searchQuery) params.set('q', searchQuery);
    router.push(`/centers${params.toString() ? '?' + params.toString() : ''}`);
  };

  const clearAllFilters = () => router.push('/centers');

  return (
    <>
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 pb-20 md:pb-8">
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isStudyAbroadMode
                  ? "🌍 Study Abroad Consultants"
                  : category ? formatCategory(category)
                  : searchQuery ? `Search: ${searchQuery}`
                  : "Training Centers"}
              </h1>
              {isStudyAbroadMode && (
                <p className="text-xs text-gray-500 mt-0.5">Find trusted consultants for studying abroad</p>
              )}
            </div>

            {!isStudyAbroadMode && (
              <button onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{activeFiltersCount}</span>
                )}
              </button>
            )}

            {isStudyAbroadMode && (
              <button onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                ← All Centers
              </button>
            )}
          </div>

          <SmartSearch centers={centers} />

          {activeFiltersCount > 0 && !isStudyAbroadMode && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Active filters:</span>
              {category && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">{formatCategory(category)} <button onClick={clearAllFilters}>×</button></span>}
              {state && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">{state} <button onClick={clearAllFilters}>×</button></span>}
              {city && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">{city} <button onClick={clearAllFilters}>×</button></span>}
              {teachingMode && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">{teachingMode} <button onClick={clearAllFilters}>×</button></span>}
              {minRating && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">{minRating}★ & above <button onClick={clearAllFilters}>×</button></span>}
              {priceRange && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">{priceRange === "100000+" ? "Above ₹1L" : `₹${priceRange.replace('-', ' - ')}`} <button onClick={clearAllFilters}>×</button></span>}
              <button onClick={clearAllFilters} className="text-xs text-accent hover:text-accent/80 font-medium underline">Clear all</button>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {!loading && (
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
              {filtered.length} {isStudyAbroadMode
                ? (filtered.length === 1 ? "consultant" : "consultants")
                : (filtered.length === 1 ? "center" : "centers")} found
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          )}

          {loading ? (
            <CenterListSkeleton count={8} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-700 font-medium mb-2">
                {isStudyAbroadMode ? "No consultants found" : "No centers found"}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                {searchQuery ? `No results for "${searchQuery}"` : "Try different filters"}
              </p>
              <button onClick={clearAllFilters} className="text-accent hover:text-accent/80 font-medium text-sm">Clear all filters</button>
            </div>
          ) : isStudyAbroadMode ? (
            // ✅ Study abroad: single column consultant cards
            <div className="flex flex-col gap-3 max-w-2xl mx-auto">
              {filtered.map((center) => (
                <ConsultantCard key={center.id} center={center} />
              ))}
            </div>
          ) : (
            // Normal: 2/3/4 column grid
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
              {filtered.map((center) => (
                <CenterCard key={center.id} center={center} />
              ))}
            </div>
          )}
        </div>
      </main>

      {showMobileFilters && !isStudyAbroadMode && (
        <MobileFilters
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          filters={{
            categories: category ? [category] : [],
            teachingModes: teachingMode ? [teachingMode] : [],
            state: state || "",
            city: city || "",
            minRating: minRating || null,
            priceRange: priceRange || ""
          }}
          onFilterChange={handleMobileFilterChange}
          categories={["TECHNOLOGY", "MANAGEMENT", "SKILL_DEVELOPMENT", "EXAM_COACHING", "COMPETITIVE_EXAMS", "LANGUAGE_TRAINING", "PROFESSIONAL_COURSES", "DESIGN_CREATIVE", "DIGITAL_MARKETING"]}
          teachingModes={["ONLINE", "OFFLINE", "HYBRID"]}
          states={uniqueStates}
        />
      )}

      <Footer />
    </>
  );
}