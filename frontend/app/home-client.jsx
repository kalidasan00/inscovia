"use client";

import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import AIChatWidget from "../components/AIChatWidget";
import Link from "next/link";
import {
  MonitorSmartphone,
  BookOpen,
  Building2,
  ChevronRight,
  Code2,
  BarChart3,
  Globe,
  TrendingUp,
  Palette,
  GraduationCap,
  MapPin
} from "lucide-react";

export default function HomeClient() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    async function loadCenters() {
      try {
        const res = await fetch(`${API_URL}/centers`, { cache: "no-store" });
        if (!res.ok) { setTimeout(loadCenters, 2000); return; }
        const data = await res.json();
        setCenters(data.centers || []);
      } catch (err) {
        console.error("Error loading centers:", err);
        setTimeout(loadCenters, 2000);
      } finally {
        setLoading(false);
      }
    }
    loadCenters();
  }, [API_URL]);

  const technologyCount = centers.filter(c => c.primaryCategory === "TECHNOLOGY").length;
  const managementCount = centers.filter(c => c.primaryCategory === "MANAGEMENT").length;
  const skillDevCount = centers.filter(c => c.primaryCategory === "SKILL_DEVELOPMENT").length;
  const examCoachingCount = centers.filter(c => c.primaryCategory === "EXAM_COACHING").length;
  const totalCount = centers.filter(c => c.primaryCategory !== "STUDY_ABROAD").length;

  const cities = [...new Set(centers.map(c => c.city))].filter(Boolean).sort();

  return (
    <>
      <main className="bg-gray-50 pb-20 md:pb-8">
        <HeroSection />

        <section className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <Link href="/centers?category=TECHNOLOGY" className="group bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-blue-200 transition-colors">
                  <MonitorSmartphone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Technology</h3>
                <span className="text-[10px] sm:text-xs text-gray-500">{loading ? "..." : `${technologyCount} centers`}</span>
              </div>
            </Link>

            <Link href="/centers?category=MANAGEMENT" className="group bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-green-300 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-green-200 transition-colors">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Management</h3>
                <span className="text-[10px] sm:text-xs text-gray-500">{loading ? "..." : `${managementCount} centers`}</span>
              </div>
            </Link>

            <Link href="/centers?category=SKILL_DEVELOPMENT" className="group bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-purple-300 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Skills</h3>
                <span className="text-[10px] sm:text-xs text-gray-500">{loading ? "..." : `${skillDevCount} centers`}</span>
              </div>
            </Link>

            <Link href="/centers?category=EXAM_COACHING" className="group bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-orange-300 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-orange-200 transition-colors">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Coaching</h3>
                <span className="text-[10px] sm:text-xs text-gray-500">{loading ? "..." : `${examCoachingCount} centers`}</span>
              </div>
            </Link>

            <Link href="/centers" className="group bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 hover:shadow-md transition-all">
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

        <section className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Popular Courses</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { name: "AI/ML", icon: Code2, color: "bg-blue-100 text-blue-600", query: "Artificial Intelligence Machine Learning" },
              { name: "Data Science", icon: BarChart3, color: "bg-purple-100 text-purple-600", query: "Data Science" },
              { name: "Cyber Security", icon: "shield", color: "bg-red-100 text-red-600", query: "Cyber Security" },
              { name: "Ethical Hacking", icon: "lock", color: "bg-orange-100 text-orange-600", query: "Ethical Hacking" },
              { name: "Web Development", icon: Globe, color: "bg-green-100 text-green-600", query: "Web Development" },
              { name: "Cloud Computing", icon: "cloud", color: "bg-sky-100 text-sky-600", query: "Cloud Computing" },
              { name: "UI/UX Design", icon: Palette, color: "bg-pink-100 text-pink-600", query: "UI UX Design" },
              { name: "Web Design", icon: "layout", color: "bg-indigo-100 text-indigo-600", query: "Web Design" },
              { name: "Digital Marketing", icon: TrendingUp, color: "bg-teal-100 text-teal-600", query: "Digital Marketing" }
            ].map((course) => {
              const Icon = course.icon;
              return (
                <Link key={course.name} href={`/centers?q=${encodeURIComponent(course.query)}`} className="group bg-white rounded-lg shadow-sm border p-3 hover:shadow-md hover:border-indigo-200 transition-all text-center">
                  <div className={`w-10 h-10 ${course.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    {typeof Icon === 'string' ? (
                      Icon === 'shield' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      ) : Icon === 'lock' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      ) : Icon === 'cloud' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-10 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                      ) : Icon === 'layout' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" /></svg>
                      ) : null
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <h3 className="text-xs font-semibold text-gray-900">{course.name}</h3>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Prepare for Top Exams</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "JEE", fullName: "Joint Entrance Exam", color: "from-red-500 to-orange-500" },
              { name: "NEET", fullName: "Medical Entrance", color: "from-green-500 to-teal-500" },
              { name: "CAT", fullName: "MBA Entrance", color: "from-blue-500 to-indigo-500" },
              { name: "GATE", fullName: "Graduate Aptitude", color: "from-purple-500 to-pink-500" },
              { name: "UPSC", fullName: "Civil Services", color: "from-yellow-500 to-orange-500" },
              { name: "CLAT", fullName: "Law Entrance", color: "from-indigo-500 to-purple-500" }
            ].map((exam) => (
              <Link key={exam.name} href={`/centers?q=${encodeURIComponent(exam.name)}`} className="group bg-white rounded-xl shadow-sm border p-4 hover:shadow-lg hover:border-gray-300 transition-all">
                <div className={`w-12 h-12 bg-gradient-to-br ${exam.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1">{exam.name}</h3>
                <p className="text-[10px] text-gray-500 text-center">{exam.fullName}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Select Your City</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : cities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {cities.slice(0, 18).map((city) => (
                <Link key={city} href={`/centers?city=${encodeURIComponent(city)}`} className="group bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-indigo-200 transition-all">
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

        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Find Your Perfect Course</h2>
            <p className="text-white/90 mb-6">Browse verified training centers across India</p>
            <Link href="/centers" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition-all">
              Explore All Centers <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      {/* ✅ AI Chat Widget - homepage only */}
      <AIChatWidget />
    </>
  );
}