"use client";

import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import FeaturedBanner from "../components/FeaturedBanner";
import AIChatWidget from "../components/AIChatWidget";
import Link from "next/link";
import {
  MonitorSmartphone, BookOpen, Building2, ChevronRight,
  Code2, BarChart3, Globe, TrendingUp, Palette, GraduationCap,
  MapPin, Shield, Lock, Cloud, Layout
} from "lucide-react";

export default function HomeClient() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    let cancelled = false;
    async function loadCenters() {
      try {
        const res = await fetch(`${API_URL}/centers`, { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setTimeout(loadCenters, 2000);
          return;
        }
        const data = await res.json();
        if (!cancelled) setCenters(data.centers || []);
      } catch {
        if (!cancelled) setTimeout(loadCenters, 2000);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCenters();
    return () => { cancelled = true; };
  }, [API_URL]);

  const technologyCount   = centers.filter(c => c.primaryCategory === "IT_TECHNOLOGY").length;
  const managementCount   = centers.filter(c => c.primaryCategory === "MANAGEMENT").length;
  const skillDevCount     = centers.filter(c => c.primaryCategory === "SKILL_DEVELOPMENT").length;
  const examCoachingCount = centers.filter(c => c.primaryCategory === "EXAM_COACHING").length;
  const totalCount        = centers.filter(c => c.primaryCategory !== "STUDY_ABROAD").length;
  const cities = [...new Set(centers.map(c => c.city))].filter(Boolean).sort();

  return (
    <>
      <main className="bg-gray-50 pb-20 md:pb-8">
        <HeroSection />

        {/* ── Featured Institutes — rendered by FeaturedBanner which handles its own fetch ── */}
        <section className="max-w-6xl mx-auto px-4 pt-6 pb-0">
          <FeaturedBanner />
        </section>

        {/* ── Browse by Category ── */}
        <section className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">

            <Link href="/centers?category=IT_TECHNOLOGY"
              className="group bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-blue-200 transition-colors">
                  <MonitorSmartphone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Technology</h3>
                <span className="text-[10px] sm:text-xs text-gray-500">{loading ? "..." : `${technologyCount} centers`}</span>
              </div>
            </Link>

            <Link href="/centers?category=MANAGEMENT"
              className="group bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-green-300 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-green-200 transition-colors">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Management</h3>
                <span className="text-[10px] sm:text-xs text-gray-500">{loading ? "..." : `${managementCount} centers`}</span>
              </div>
            </Link>

            <Link href="/centers?category=SKILL_DEVELOPMENT"
              className="group bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-purple-300 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Skills</h3>
                <span className="text-[10px] sm:text-xs text-gray-500">{loading ? "..." : `${skillDevCount} centers`}</span>
              </div>
            </Link>

            <Link href="/centers?category=EXAM_COACHING"
              className="group bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-orange-300 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-orange-200 transition-colors">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Coaching</h3>
                <span className="text-[10px] sm:text-xs text-gray-500">{loading ? "..." : `${examCoachingCount} centers`}</span>
              </div>
            </Link>

            <Link href="/centers"
              className="group bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 hover:shadow-md transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-white mb-0.5 sm:mb-1">All Centers</h3>
                <span className="text-[10px] sm:text-xs text-white/80">{loading ? "..." : `${totalCount} total`}</span>
              </div>
            </Link>

          </div>
        </section>

        {/* ── Popular Courses ── */}
        <section className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Popular Courses</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { name: "AI/ML",             icon: Code2,      color: "bg-blue-100 text-blue-600",     query: "Artificial Intelligence Machine Learning" },
              { name: "Data Science",      icon: BarChart3,  color: "bg-purple-100 text-purple-600", query: "Data Science" },
              { name: "Cyber Security",    icon: Shield,     color: "bg-red-100 text-red-600",       query: "Cyber Security" },
              { name: "Ethical Hacking",   icon: Lock,       color: "bg-orange-100 text-orange-600", query: "Ethical Hacking" },
              { name: "Web Development",   icon: Globe,      color: "bg-green-100 text-green-600",   query: "Web Development" },
              { name: "Cloud Computing",   icon: Cloud,      color: "bg-sky-100 text-sky-600",       query: "Cloud Computing" },
              { name: "UI/UX Design",      icon: Palette,    color: "bg-pink-100 text-pink-600",     query: "UI UX Design" },
              { name: "Web Design",        icon: Layout,     color: "bg-indigo-100 text-indigo-600", query: "Web Design" },
              { name: "Digital Marketing", icon: TrendingUp, color: "bg-teal-100 text-teal-600",     query: "Digital Marketing" },
            ].map((course) => {
              const Icon = course.icon;
              return (
                <Link key={course.name} href={`/centers?q=${encodeURIComponent(course.query)}`}
                  className="group bg-white rounded-lg shadow-sm border p-3 hover:shadow-md hover:border-indigo-200 transition-all text-center">
                  <div className={`w-10 h-10 ${course.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-900">{course.name}</h3>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Top Exams ── */}
        <section className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Prepare for Top Exams</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "JEE",  fullName: "Joint Entrance Exam", color: "from-red-500 to-orange-500" },
              { name: "NEET", fullName: "Medical Entrance",    color: "from-green-500 to-teal-500" },
              { name: "CAT",  fullName: "MBA Entrance",        color: "from-blue-500 to-indigo-500" },
              { name: "GATE", fullName: "Graduate Aptitude",   color: "from-purple-500 to-pink-500" },
              { name: "UPSC", fullName: "Civil Services",      color: "from-yellow-500 to-orange-500" },
              { name: "CLAT", fullName: "Law Entrance",        color: "from-indigo-500 to-purple-500" },
            ].map((exam) => (
              <Link key={exam.name} href={`/centers?q=${encodeURIComponent(exam.name)}`}
                className="group bg-white rounded-xl shadow-sm border p-4 hover:shadow-lg hover:border-gray-300 transition-all">
                <div className={`w-12 h-12 bg-gradient-to-br ${exam.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1">{exam.name}</h3>
                <p className="text-[10px] text-gray-500 text-center">{exam.fullName}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Select City ── */}
        <section className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Select Your City</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : cities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {cities.slice(0, 18).map((city) => (
                <Link key={city} href={`/centers?city=${encodeURIComponent(city)}`}
                  className="group bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-indigo-200 transition-all">
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{city}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No cities available</p>
            </div>
          )}
          {cities.length > 18 && (
            <div className="text-center mt-4">
              <Link href="/centers" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                View all cities <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>

        {/* ── CTA Banner ── */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Find Your Perfect Course</h2>
            <p className="text-white/90 mb-6">Browse verified training centers across India</p>
            <Link href="/centers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition-all">
              Explore All Centers <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <AIChatWidget />
    </>
  );
}