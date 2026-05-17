// components/CenterCard.jsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFavorites } from "../contexts/FavoritesContext";
import { useCompare } from "../contexts/CompareContext";
import { Heart, GitCompare, MapPin, Star, CheckCircle, AlertTriangle, Lock, X } from "lucide-react";

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

  const toastConfig = {
    "added-fav":       { icon: <Heart className="w-3 h-3 fill-current text-red-400" />,       label: "Added to favorites" },
    "removed-fav":     { icon: <X className="w-3 h-3 text-gray-400" />,                        label: "Removed from favorites" },
    "added-compare":   { icon: <CheckCircle className="w-3 h-3 text-green-400" />,             label: "Added to compare" },
    "removed-compare": { icon: <X className="w-3 h-3 text-gray-400" />,                        label: "Removed from compare" },
    "compare-limit":   { icon: <AlertTriangle className="w-3 h-3 text-yellow-400" />,          label: "Max 3 centers" },
    "login-required":  { icon: <Lock className="w-3 h-3 text-gray-400" />,                     label: "Please login" },
  };

  const displayRating = reviewStats?.totalReviews > 0
    ? reviewStats.averageRating.toFixed(1)
    : center.rating > 0
      ? center.rating
      : null;

  const totalReviews = reviewStats?.totalReviews || 0;

  // ✅ clean course names — strip "CATEGORY: " prefix
  const cleanCourses = (center.courses || []).map(c =>
    c.includes(":") ? c.split(":")[1].trim() : c
  );

  return (
    <div className="relative h-full">
      <Link href={`/centers/${center.slug}`} className="h-full">
        {/* ✅ FIXED: h-full + flex flex-col so all cards stretch to same height */}
        <article className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">

          {/* Cover Image — fixed height */}
          <div className="relative h-28 w-full bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0">
            {center.image && (
              <img
                src={center.image}
                alt={center.name}
                className="object-cover h-full w-full"
                loading="lazy"
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}

            {/* Logo */}
            <div className="absolute -bottom-4 left-3">
              <div className="w-10 h-10 bg-white rounded-lg shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
                {(center.logo || center.image) ? (
                  <img
                    src={center.logo || center.image}
                    alt={`${center.name} logo`}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-gray-400 text-sm font-bold">
                    {center.name?.charAt(0) || "?"}
                  </span>
                )}
              </div>
            </div>

            {/* Rating badge */}
            {displayRating && (
              <div className="absolute top-2 right-2 flex items-center gap-0.5 text-xs font-semibold text-yellow-600 bg-white px-1.5 py-0.5 rounded-md shadow-sm">
                {displayRating}
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </div>
            )}
          </div>

          {/* ✅ FIXED: flex-1 so content fills remaining space equally across cards */}
          <div className="pt-6 px-3 pb-3 flex flex-col flex-1">

            {/* Name */}
            <h3 className="font-semibold text-sm leading-tight line-clamp-1">{center.name}</h3>

            {/* Location */}
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{center.city}{center.state ? `, ${center.state}` : ""}</span>
            </div>

            {/* Reviews */}
            {totalReviews > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </div>
            )}

            {/* ✅ FIXED: flex-1 pushes courses+buttons to bottom consistently */}
            <div className="flex-1" />

            {/* Course badges */}
            <div className="mt-2 flex flex-wrap gap-1 min-h-[22px]">
              {cleanCourses.slice(0, 2).map((course, idx) => (
                <span key={idx}
                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded truncate max-w-[90px]">
                  {course}
                </span>
              ))}
              {cleanCourses.length > 2 && (
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                  +{cleanCourses.length - 2}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-2 flex gap-1.5">
              <button onClick={handleFavoriteClick}
                className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg transition-all ${
                  isLiked ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <button onClick={handleCompareClick}
                disabled={!canAddMore() && !isComparing}
                className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg transition-all ${
                  isComparing
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}>
                <GitCompare className="w-3 h-3" />
              </button>
            </div>

            <button className="mt-2 w-full text-center text-xs font-medium px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
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