"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, MapPin, Sparkles } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function FeaturedBanner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      // Try FEATURED first, fall back to HERO if empty
      const res = await fetch(`${API_URL}/banners/active?placement=FEATURED`);
      const data = await res.json();
      console.log("[FeaturedBanner] FEATURED response:", data);

      let found = data.banners || [];

      if (found.length === 0) {
        console.log("[FeaturedBanner] No FEATURED banners, trying HERO...");
        const res2 = await fetch(`${API_URL}/banners/active?placement=HERO`);
        const data2 = await res2.json();
        console.log("[FeaturedBanner] HERO response:", data2);
        found = data2.banners || [];
      }

      setBanners(found);
    } catch (err) {
      console.error("[FeaturedBanner] fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured Institutes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1].map(i => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured Institutes</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {banners.slice(0, 2).map((banner) => {
          const center = banner.center;
          if (!center) return null;
          return (
            <Link
              key={banner.id}
              href={`/centers/${center.slug}`}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
            >
              {/* Logo */}
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-blue-100 flex items-center justify-center">
                {center.logo || center.image ? (
                  <img
                    src={center.logo || center.image}
                    alt={center.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <span className="text-indigo-600 font-bold text-lg">{center.name?.charAt(0)}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  Featured
                </span>
                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors mt-0.5">
                  {banner.title || center.name}
                </p>
                {banner.tagline && (
                  <p className="text-xs text-gray-500 truncate">{banner.tagline}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />{center.city}
                  </span>
                  {center.rating > 0 && (
                    <span className="text-[10px] text-yellow-600 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-yellow-400" />{center.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-xs text-blue-600 font-medium flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
                {banner.ctaText || "View →"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}