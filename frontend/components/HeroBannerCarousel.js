"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, MapPin } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function HeroBannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [banners]);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/banners/active?placement=HERO`);
      const data = await res.json();
      setBanners(data.banners || []);
    } catch { }
    finally { setLoading(false); }
  };

  const prev = () => {
    clearInterval(timerRef.current);
    setCurrent(p => (p - 1 + banners.length) % banners.length);
  };

  const next = () => {
    clearInterval(timerRef.current);
    setCurrent(p => (p + 1) % banners.length);
  };

  if (loading || banners.length === 0) return null;

  const banner = banners[current];
  const center = banner.center;

  // ✅ Poster image takes priority, falls back to logo, then cover image
  const posterImage = banner.imageUrl || null;
  const logoImage = center.logo || center.image || null;

  return (
    <div className="max-w-3xl mx-auto mb-4">
      {/* ✅ UPDATED: "Sponsored" label — industry standard (Justdial/Sulekha style) */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="flex items-center gap-1 text-[10px] text-white/50 uppercase tracking-wider">
          <Star className="w-3 h-3 fill-white/40 text-white/40" />
          Sponsored
        </span>
        {banners.length > 1 && (
          <span className="text-[10px] text-white/40">{current + 1}/{banners.length}</span>
        )}
      </div>

      <div className="relative group">
        <Link
          href={`/centers/${center.slug}`}
          className="block rounded-2xl overflow-hidden border border-white/20 transition-all hover:border-white/40"
          style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
        >
          {/* ✅ NEW: Full poster image if uploaded — shown as wide banner on top */}
          {posterImage && (
            <div className="w-full h-28 sm:h-36 overflow-hidden">
              <img
                src={posterImage}
                alt={banner.title || center.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex items-center gap-3 p-3 sm:p-4">
            {/* Logo — always shown below poster (or alone if no poster) */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center border border-white/20">
              {logoImage ? (
                <img
                  src={logoImage}
                  alt={center.name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                // ✅ FIXED: letter fallback instead of emoji
                <span className="text-white font-bold text-xl">
                  {center.name?.charAt(0) || "?"}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm sm:text-base truncate">
                    {banner.title || center.name}
                  </h3>
                  {banner.tagline && (
                    <p className="text-blue-200 text-xs mt-0.5 truncate">{banner.tagline}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] text-white/60">
                      <MapPin className="w-3 h-3" />
                      {center.city}, {center.state}
                    </span>
                    {center.rating > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-yellow-300">
                        <Star className="w-3 h-3 fill-yellow-300" />
                        {center.rating.toFixed(1)}
                      </span>
                    )}
                    <span className="text-[10px] text-white/40 capitalize">
                      {center.primaryCategory?.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <span className="flex-shrink-0 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                  {banner.ctaText || "View →"}
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Navigation arrows */}
        {banners.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}