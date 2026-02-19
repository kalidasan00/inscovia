"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SmartSearch from "./SmartSearch";

export default function HeroSection() {
  const [centers, setCenters] = useState([]);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    async function loadCenters() {
      try {
        const res = await fetch(`${API_URL}/centers`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCenters(data.centers || []);
        }
      } catch (err) {
        console.error("Error loading centers:", err);
      }
    }
    loadCenters();
  }, [API_URL]);

  return (
    <section className="relative py-8 sm:py-16 md:py-20" style={{ backgroundColor: '#1E40AF' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">

        {/* Header - smaller on mobile */}
        <div className="text-center mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4 leading-tight">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Training Institute
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-blue-100 max-w-2xl mx-auto">
            Discover training centers with instant search
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-3xl mx-auto mb-3 sm:mb-4">
          <div className="bg-white rounded-xl shadow-2xl p-2">
            <SmartSearch centers={centers} placeholder="Search institutes, courses, locations..." />
          </div>
        </div>

        {/* ✅ Study Abroad CTA */}
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push("/centers?category=STUDY_ABROAD")}
            className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-400/40 rounded-xl transition-all group">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-2xl">🌍</span>
              <div className="text-left">
                <p className="text-white font-semibold text-xs sm:text-sm">Planning to Study Abroad?</p>
                <p className="text-blue-200 text-[10px] sm:text-xs">Find trusted consultants for USA, UK, Canada & more</p>
              </div>
            </div>
            <span className="text-cyan-300 text-xs font-medium group-hover:translate-x-1 transition-transform flex-shrink-0">
              Explore →
            </span>
          </button>
        </div>

      </div>
    </section>
  );
}