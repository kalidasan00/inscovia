// components/CenterCard.jsx - FIXED
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFavorites } from "../contexts/FavoritesContext";
import { useCompare } from "../contexts/CompareContext";
import { Heart, GitCompare, MapPin, Star, CheckCircle, AlertTriangle, Lock, X } from "lucide-react";

// ✅ FIXED: moved outside component — never changes, no need to recreate on every render
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function CenterCard({ center }) {
  const [reviewStats, setReviewStats] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showToast, setShowToast] = useState(null);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare, canAddMore } = useCompare();
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("userLoggedIn") === "true");
  }, []);

  useEffect(() => {
    if (!center?.id) return;
    async function loadStats() {
      try {
        const res = await fetch(`${API_URL}/reviews/center/${center.id}/stats`);
        if (res.ok) setReviewStats(await res.json());
      } catch (err) {
        // ✅ FIXED: log in dev, silent in prod
        if (process.env.NODE_ENV === 'development') console.warn('Review stats failed:', err);
      }
    }
    loadStats();
  }, [center?.id]);

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

  // ✅ FIXED: lucide icons for toast — no emojis
  const toastConfig = {
    "added-fav":       { icon: <Heart className="w-3 h-3 fill-current text-red-400" />,       label: "Added to favorites" },
    "removed-fav":     { icon: <X className="w-3 h-3 text-gray-400" />,                        label: "Removed from favorites" },
    "added-compare":   { icon: <CheckCircle className="w-3 h-3 text-green-400" />,             label: "Added to compare" },
    "removed-compare": { icon: <X className="w-3 h-3 text-gray-400" />,                        label: "Removed from compare" },
    "compare-limit":   { icon: <AlertTriangle className="w-3 h-3 text-yellow-400" />,          label: "Max 3 centers to compare" },
    "login-required":  { icon: <Lock className="w-3 h-3 text-gray-400" />,                     label: "Please login to continue" },
  };

  const displayRating = reviewStats?.totalReviews > 0
    ? reviewStats.averageRating.toFixed(1)
    : center.rating > 0
      ? center.rating
      : null;

  const totalReviews = reviewStats?.totalReviews || 0;

  return (
    <div className="relative">
      <Link href={`/centers/${center.slug}`}>
        <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">

          {/* Cover Image */}
          <div className="relative h-24 sm:h-32 w-full bg-gradient-to-br from-gray-100 to-gray-50">
            {center.image && (
              <img
                src={center.image}
                alt={center.name}
                className="object-cover h-full w-full"
                loading="lazy" // ✅ FIXED: lazy load — all cards were loading at once
                onError={e => { e.target.style.display = 'none'; }} // ✅ FIXED: no broken image icon
              />
            )}

            {/* Logo */}
            <div className="absolute -bottom-4 left-2 sm:left-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
                {(center.logo || center.image) ? (
                  <img
                    src={center.logo || center.image}
                    alt={`${center.name} logo`}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }} // ✅ FIXED: fallback
                  />
                ) : (
                  // ✅ fallback placeholder if no logo and no image
                  <span className="text-gray-400 text-xs font-bold">
                    {center.name?.charAt(0) || "?"}
                  </span>
                )}
              </div>
            </div>

            {/* Rating badge */}
            {displayRating && (
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold text-yellow-600 bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-sm">
                {displayRating}
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
              </div>
            )}
          </div>

          <div className="pt-5 sm:pt-7 px-2.5 sm:px-3 pb-2.5 sm:pb-3">
            <h3 className="font-semibold text-xs sm:text-sm leading-tight truncate">{center.name}</h3>

            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
              <span className="truncate">{center.location}</span>
              {center.type && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{center.type}</span>
                </>
              )}
            </div>

            {totalReviews > 0 && (
              <div className="mt-1 text-[10px] sm:text-xs text-gray-600">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </div>
            )}

            {/* ✅ FIXED: course badges — was duplicating "+N" on desktop */}
            <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1">
              {center.courses.slice(0, 2).map((course, idx) => (
                <span key={idx}
                  className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded truncate max-w-[80px]">
                  {course}
                </span>
              ))}
              {center.courses.length > 2 && (
                <span className="text-[10px] sm:text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                  +{center.courses.length - 2}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-2 sm:mt-3 flex gap-1.5">
              <button onClick={handleFavoriteClick}
                className={`flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-1.5 rounded-md transition-all ${
                  isLiked ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{isLiked ? 'Saved' : 'Save'}</span>
              </button>

              <button onClick={handleCompareClick}
                disabled={!canAddMore() && !isComparing}
                className={`flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-1.5 rounded-md transition-all ${
                  isComparing
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}>
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

      {/* Toast */}
      {showToast && toastConfig[showToast] && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-1.5">
            {toastConfig[showToast].icon}
            {toastConfig[showToast].label}
          </div>
        </div>
      )}
    </div>
  );
}