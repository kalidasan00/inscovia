// components/HeroSection.jsx
"use client";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-10 sm:py-16 md:py-20 lg:py-24 2xl:py-28">

      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }}
      />

      {/* Glow blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 lg:w-[32rem] lg:h-[32rem] bg-cyan-500 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 lg:w-[32rem] lg:h-[32rem] bg-indigo-400 rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="page-container relative z-10 text-center">
        <div className="max-w-4xl 2xl:max-w-5xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-white/10 border border-white/20 rounded-full text-xs lg:text-sm text-cyan-200 font-medium mb-5 sm:mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            AI-Powered Institute Discovery
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-bold text-white mb-3 sm:mb-4 lg:mb-5 leading-tight tracking-tight">
            Find Your Perfect
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300">
              Training Institute
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-base lg:text-lg 2xl:text-xl text-blue-200 max-w-xl lg:max-w-2xl mx-auto mb-7 sm:mb-8 lg:mb-10">
            Discover and compare top-rated coaching centers across India.
            Technology, Management, Skill Development &amp; more.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 sm:mb-10">
            <button
              onClick={() => router.push("/centers")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 lg:px-8 lg:py-3.5 bg-white text-blue-800 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/30 text-sm lg:text-base"
            >
              <Search className="w-4 h-4 lg:w-5 lg:h-5" />
              Browse All Institutes
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}