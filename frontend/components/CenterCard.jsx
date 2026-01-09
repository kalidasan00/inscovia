// components/CenterCard.jsx - UPDATED TO USE SLUG
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFavorites } from "../contexts/FavoritesContext";
import { useCompare } from "../contexts/CompareContext";
import { Heart, GitCompare } from "lucide-react";

export default function CenterCard({ center }) {
  const [reviewStats, setReviewStats] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare, canAddMore } = useCompare();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const [showToast, setShowToast] = useState(null);

  useEffect(() => {
    const userLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    setIsLoggedIn(userLoggedIn);
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch(`${API_URL}/reviews/center/${center.id}/stats`);
        if (res.ok) {
          const data = await res.json();
          setReviewStats(data);
        }
      } catch (err) {
        // Silently fail
      }
    }

    if (center?.id) {
      loadStats();
    }
  }, [center?.id, API_URL]);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setShowToast("login-required");
      setTimeout(() => router.push("/user-menu"), 1500);
      return;
    }

    toggleFavorite(center.id);
    setShowToast(isFavorite(center.id) ? "removed-fav" : "added-fav");
    setTimeout(() => setShowToast(null), 2000);
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setShowToast("login-required");
      setTimeout(() => router.push("/user-menu"), 1500);
      return;
    }

    const result = toggleCompare(center.id);
    if (result.success) {
      setShowToast(result.action === "added" ? "added-compare" : "removed-compare");
    } else {
      setShowToast("compare-limit");
    }
    setTimeout(() => setShowToast(null), 2000);
  };

  const isLiked = isFavorite(center.id);
  const isComparing = isInCompare(center.id);

  return (
    <div className="relative">
      {/* ← CHANGED: Use slug instead of id in URL */}
      <Link href={`/centers/${center.slug}`}>
        <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          {/* Rest of the component stays the same */}
          <div className="relative h-24 sm:h-32 w-full bg-gradient-to-br from-gray-100 to-gray-50">
            <img
              src={center.image}
              alt={center.name}
              className="object-cover h-full w-full"
            />

            <div className="absolute -bottom-4 left-2 sm:left-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
                <img
                  src={center.logo || center.image}
                  alt={`${center.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {reviewStats && reviewStats.totalReviews > 0 ? (
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold text-yellow-600 bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-sm">
                {reviewStats.averageRating.toFixed(1)}
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              </div>
            ) : center.rating > 0 ? (
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold text-yellow-600 bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-sm">
                {center.rating}
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              </div>
            ) : null}
          </div>

          <div className="pt-5 sm:pt-7 px-2.5 sm:px-3 pb-2.5 sm:pb-3">
            <h3 className="font-semibold text-xs sm:text-sm leading-tight truncate">{center.name}</h3>

            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 flex items-center gap-1">
              <span className="flex items-center gap-0.5 truncate">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {center.location}
              </span>
              {center.type && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{center.type}</span>
                </>
              )}
            </div>

            {reviewStats && reviewStats.totalReviews > 0 && (
              <div className="mt-1 text-[10px] sm:text-xs text-gray-600">
                {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
              </div>
            )}

            <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1">
              {center.courses.slice(0, 1).map((course, idx) => (
                <span
                  key={idx}
                  className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-700 rounded truncate max-w-full"
                >
                  {course}
                </span>
              ))}
              <span className="hidden sm:inline text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                {center.courses[1] || `+${center.courses.length - 1}`}
              </span>
              {center.courses.length > 1 && (
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                  +{center.courses.length - 1}
                </span>
              )}
            </div>

            <div className="mt-2 sm:mt-3 flex gap-1.5">
              <button
                onClick={handleFavoriteClick}
                className={`flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-1.5 rounded-md transition-all ${
                  isLiked
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{isLiked ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleCompareClick}
                disabled={!canAddMore() && !isComparing}
                className={`flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-1.5 rounded-md transition-all ${
                  isComparing
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <GitCompare className="w-3 h-3" />
                <span className="hidden sm:inline">{isComparing ? 'Added' : 'Compare'}</span>
              </button>
            </div>

            <button className="mt-1.5 sm:mt-2 w-full text-center text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-1.5 sm:py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors">
              View Details
            </button>
          </div>
        </article>
      </Link>

      {showToast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            {showToast === "added-fav" && "❤️ Added to favorites"}
            {showToast === "removed-fav" && "Removed from favorites"}
            {showToast === "added-compare" && "✓ Added to compare"}
            {showToast === "removed-compare" && "Removed from compare"}
            {showToast === "compare-limit" && "⚠️ Max 3 centers to compare"}
            {showToast === "login-required" && "🔒 Please login to continue"}
          </div>
        </div>
      )}
    </div>
  );
}