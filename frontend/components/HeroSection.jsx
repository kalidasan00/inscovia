// components/HeroSection.jsx
"use client";
import { useRouter } from "next/navigation";
import { Search, Globe, ArrowRight } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-10 sm:py-16 md:py-20">

      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }}
      />

      {/* Glow blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs text-cyan-200 font-medium mb-5 sm:mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          AI-Powered Institute Discovery
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight tracking-tight">
          Find Your Perfect
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300">
            Training Institute
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-sm sm:text-base text-blue-200 max-w-xl mx-auto mb-7 sm:mb-8">
          Discover and compare top-rated coaching centers across India.
          Technology, Management, Skill Development &amp; more.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 sm:mb-10">
          <button
            onClick={() => router.push("/centers")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-800 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/30 text-sm"
          >
            <Search className="w-4 h-4" />
            Browse All Institutes
          </button>
          <button
            onClick={() => router.push("/centers?category=STUDY_ABROAD")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/25 text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-sm"
          >
            <Globe className="w-4 h-4" />
            Study Abroad
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>



      </div>
    </section>
  );
}