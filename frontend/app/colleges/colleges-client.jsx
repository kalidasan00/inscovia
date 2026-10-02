// app/colleges/colleges-client.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MapPin, Search, GraduationCap } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function formatEnum(value) {
  return value?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()) || "";
}

function CollegeCard({ college }) {
  // If an image URL is dead, fall back instead of showing a broken icon
  const [coverFailed, setCoverFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const showCover = Boolean(college.image) && !coverFailed;
  const showLogo = Boolean(college.logo) && !logoFailed;
  const rating = Number(college.rating) || 0;

  return (
    <Link
      href={`/colleges/${college.slug}`}
      className="group bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
    >
      {/* Cover: gradient is the fallback when there is no cover image */}
      <div className="relative h-24 bg-gradient-to-br from-indigo-600 to-purple-600">
        {showCover && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={college.image}
              alt=""
              loading="lazy"
              onError={() => setCoverFailed(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}

        {/* Logo overlaps the bottom edge of the cover */}
        <div className="absolute -bottom-6 left-3">
          <div className="w-14 h-14 bg-white rounded-lg shadow-md border-4 border-white flex items-center justify-center overflow-hidden">
            {showLogo ? (
              <img
                src={college.logo}
                alt={`${college.name} logo`}
                loading="lazy"
                onError={() => setLogoFailed(true)}
                className="w-full h-full object-contain"
              />
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
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-100 text-indigo-700">
            {formatEnum(college.primaryCategory)}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-100 text-purple-700">
            {formatEnum(college.type)}
          </span>
          {rating > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
              ★ {rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-2 line-clamp-2 flex-1">{college.description}</p>
      </div>
    </Link>
  );
}

function CollegeCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border overflow-hidden animate-pulse">
      <div className="h-24 bg-gray-200" />
      <div className="pt-8 px-3 pb-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}

export default function CollegesClient({ initialColleges = [] }) {
  const [colleges, setColleges] = useState(initialColleges);
  const [loading, setLoading] = useState(initialColleges.length === 0);
  const [fetchError, setFetchError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const state = searchParams.get("state") || "";

  const [searchText, setSearchText] = useState(query);
  const firstRun = useRef(true);

  // ── load colleges ─────────────────────────────────────────────────────────
  useEffect(() => {
    // Use the server-provided list on first render ONLY when no filter is active.
    // Any later change (or a filtered first load) fetches from the API.
    if (firstRun.current) {
      firstRun.current = false;
      if (initialColleges.length > 0 && !query && !category && !state) return;
    }

    let retries = 0;
    let cancelled = false;
    let retryTimer = null;

    const fail = () => {
      if (retries < 3) {
        retries++;
        retryTimer = setTimeout(loadColleges, 2000);
      } else if (!cancelled) {
        setFetchError(true);
        setLoading(false);
      }
    };

    async function loadColleges() {
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (category) params.set("category", category);
        if (state) params.set("state", state);

        const res = await fetch(`${API_URL}/colleges?${params.toString()}`, { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) return fail();

        const data = await res.json();
        if (!cancelled) {
          setColleges(data.colleges || []);
          setFetchError(false);
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Error loading colleges:", err);
        fail();
      }
    }

    setLoading(true);
    loadColleges();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [query, category, state, retryKey]);

  // ── debounced search: update the URL 350ms after the user stops typing ────
  useEffect(() => {
    if (searchText === query) return;
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchText) params.set("q", searchText);
      else params.delete("q");
      router.replace(`/colleges${params.toString() ? "?" + params.toString() : ""}`);
    }, 350);
    return () => clearTimeout(t);
  }, [searchText]);

  const clearSearch = () => {
    setSearchText("");
    router.replace("/colleges");
  };

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 pb-20 md:pb-8">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">Colleges</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Explore top colleges and universities across India.
        </p>

        <div className="relative mt-3">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search colleges by name, city, or course..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
        </div>
      </div>

      {!loading && !fetchError && (
        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
          {colleges.length} {colleges.length === 1 ? "college" : "colleges"} found
          {query && ` for "${query}"`}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
          {Array.from({ length: 8 }).map((_, i) => <CollegeCardSkeleton key={i} />)}
        </div>
      ) : fetchError ? (
        <div className="text-center py-8 bg-white rounded-lg border">
          <p className="text-gray-700 font-medium mb-2">Unable to Load Colleges</p>
          <p className="text-sm text-gray-500 mb-3">Something went wrong. Please check your connection and try again.</p>
          <button
            onClick={() => { setFetchError(false); setRetryKey((k) => k + 1); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : colleges.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border">
          <p className="text-gray-700 font-medium mb-1">No colleges found</p>
          <p className="text-sm text-gray-500 mb-3">Try a different search term</p>
          <button onClick={clearSearch} className="text-accent hover:text-accent/80 font-medium text-sm">
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 items-stretch">
          {colleges.map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </div>
      )}
    </main>
  );
}