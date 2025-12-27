"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
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
  Table,
  Palette
} from "lucide-react";

export default function Home() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    async function loadCenters() {
      try {
        const res = await fetch(`${API_URL}/centers`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setTimeout(loadCenters, 2000);
          return;
        }

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

  // Get counts for categories
  const technologyCount = centers.filter(c => c.primaryCategory === "TECHNOLOGY").length;
  const managementCount = centers.filter(c => c.primaryCategory === "MANAGEMENT").length;
  const skillDevCount = centers.filter(c => c.primaryCategory === "SKILL_DEVELOPMENT").length;
  const examCoachingCount = centers.filter(c => c.primaryCategory === "EXAM_COACHING").length;
  const totalCount = centers.length;

  return (
    <>
      <Navbar />

      <main className="bg-gray-50 pb-20 md:pb-8">
        {/* Hero Section */}
        <HeroSection />

        {/* Categories */}
        <section className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Browse by Category</h2>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Technology */}
            <Link
              href="/centers?category=TECHNOLOGY"
              className="group bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-blue-200 transition-colors">
                  <MonitorSmartphone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Technology</h3>
                <span className="text-[10px] sm:text-xs text-gray-500">{loading ? "..." : `${technologyCount} centers`}</span>
              </div>
            </Link>

            {/* Management */}
            <Link
              href="/centers?category=MANAGEMENT"
              className="group bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-green-300 transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-green-200 transition-colors">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Management</h3>
                <span className="text-[10px] sm:text-xs text-gray-500">{loading ? "..." : `${managementCount} centers`}</span>
              </div>
            </Link>

            {/* Skill Development */}
            <Link
              href="/centers?category=SKILL_DEVELOPMENT"
              className="group bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-purple-300 transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Skills</h3>
                <span className="text-[10px] sm:text-xs text-gray-500">{loading ? "..." : `${skillDevCount} centers`}</span>
              </div>
            </Link>

            {/* Exam Coaching */}
            <Link
              href="/centers?category=EXAM_COACHING"
              className="group bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-orange-300 transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-orange-200 transition-colors">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-0.5 sm:mb-1">Coaching</h3>
                <span className="text-[10px] sm:text-xs text-gray-500">{loading ? "..." : `${examCoachingCount} centers`}</span>
              </div>
            </Link>

            {/* All Centers */}
            <Link
              href="/centers"
              className="group bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 hover:shadow-md transition-all"
            >
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

        {/* Popular Courses */}
        <section className="max-w-6xl mx-auto px-4 py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Courses</h2>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { name: "Python", icon: Code2, color: "bg-blue-100 text-blue-600", query: "Python" },
              { name: "Data Science", icon: BarChart3, color: "bg-purple-100 text-purple-600", query: "Data Science" },
              { name: "Web Dev", icon: Globe, color: "bg-green-100 text-green-600", query: "Web Development" },
              { name: "Marketing", icon: TrendingUp, color: "bg-orange-100 text-orange-600", query: "Digital Marketing" },
              { name: "Excel", icon: Table, color: "bg-teal-100 text-teal-600", query: "Excel" },
              { name: "Design", icon: Palette, color: "bg-pink-100 text-pink-600", query: "Design" }
            ].map((course) => {
              const Icon = course.icon;
              return (
                <Link
                  key={course.name}
                  href={`/centers?q=${encodeURIComponent(course.query)}`}
                  className="group bg-white rounded-lg shadow-sm border p-3 hover:shadow-md hover:border-indigo-200 transition-all text-center"
                >
                  <div className={`w-10 h-10 ${course.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-900">
                    {course.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Find Your Perfect Course
            </h2>
            <p className="text-white/90 mb-6">
              Browse verified training centers
            </p>
            <Link
              href="/centers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Explore Centers
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}