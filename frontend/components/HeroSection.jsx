"use client";
import { useState, useEffect } from "react";
import SmartSearch from "./SmartSearch";

export default function HeroSection() {
  const [centers, setCenters] = useState([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  // Load centers for search suggestions
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
    <section className="relative py-12 sm:py-16 md:py-20" style={{ backgroundColor: '#1E40AF' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Training Institute
            </span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
            Discover training centers with instant search
          </p>
        </div>

        {/* Search Box - Using SmartSearch Component */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-2">
            <SmartSearch
              centers={centers}
              placeholder="Search institutes, courses, locations..."
            />
          </div>
        </div>
      </div>
    </section>
  );
}