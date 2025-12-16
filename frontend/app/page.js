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
  CheckCircle2,
  BarChart3,
  Zap,
  ChevronRight,
  ArrowRight,
  Code2,
  Globe,
  TrendingUp,
  Table,
  Palette
} from "lucide-react";

export default function Home() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function loadCenters() {
      try {
        const res = await fetch(`${API_URL}/centers`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.warn("Backend not awake, retrying...");
          setTimeout(loadCenters, 2000);
          return;
        }

        const data = await res.json();
        setCenters(data.centers || []);
      } catch (err) {
        console.error("Error reaching backend, retrying...", err);
        setTimeout(loadCenters, 2000);
      } finally {
        setLoading(false);
      }
    }

    loadCenters();
  }, []);

  // Get counts for categories
  const itCount = centers.filter(c => c.type === "IT").length;
  const nonItCount = centers.filter(c => c.type === "Non-IT").length;
  const totalCount = centers.length;

  return (
    <>
      <Navbar />

      <main className="bg-gray-50 pb-20 md:pb-8">
        {/* Hero Section with Search */}
        <HeroSection />

        {/* ------------------------ CATEGORY CARDS ------------------------ */}
        <section className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Explore by Category
            </h2>
            <p className="text-gray-600">Choose your learning path and discover top training centers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* IT Training */}
            <Link
              href="/centers?type=IT"
              className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl hover:border-indigo-200 transition-all hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MonitorSmartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">IT Training</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Software Development, Cloud Computing, AI & Data Science
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold">
                  {loading ? "..." : `${itCount} Centers`}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Non-IT Training */}
            <Link
              href="/centers?type=Non-IT"
              className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl hover:border-green-200 transition-all hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Non-IT Training</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Finance, Marketing, Design, Languages & Soft Skills
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-semibold">
                  {loading ? "..." : `${nonItCount} Centers`}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* All Centers */}
            <Link
              href="/centers"
              className="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-sm border border-purple-200 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Browse All</h3>
                <p className="text-sm text-white/90 mb-3">
                  Explore all training centers in one place
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/30">
                  {loading ? "..." : `${totalCount} Centers`}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ------------------------ POPULAR COURSES ------------------------ */}
        <section className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                🔥 Popular Courses
              </h2>
              <p className="text-sm text-gray-600 mt-1">Trending courses students are enrolling in</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "Python", icon: Code2, color: "from-blue-500 to-cyan-500", query: "Python" },
              { name: "Data Science", icon: BarChart3, color: "from-purple-500 to-pink-500", query: "Data Science" },
              { name: "Web Dev", icon: Globe, color: "from-green-500 to-emerald-500", query: "Web Development" },
              { name: "Digital Marketing", icon: TrendingUp, color: "from-orange-500 to-red-500", query: "Digital Marketing" },
              { name: "Excel", icon: Table, color: "from-teal-500 to-cyan-500", query: "Excel" },
              { name: "UI/UX", icon: Palette, color: "from-violet-500 to-purple-500", query: "UI UX Design" }
            ].map((course) => {
              const Icon = course.icon;
              return (
                <Link
                  key={course.name}
                  href={`/centers?q=${encodeURIComponent(course.query)}`}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all text-center"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${course.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {course.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ------------------------ WHY CHOOSE US ------------------------ */}
        <section className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Why Choose Inscovia?
            </h2>
            <p className="text-gray-600">Your trusted partner in finding the perfect training center</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verified Centers</h3>
              <p className="text-sm text-gray-600">
                All training centers are thoroughly verified and reviewed by our team
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Comparison</h3>
              <p className="text-sm text-gray-600">
                Compare courses, fees, ratings and reviews to make informed decisions
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quick & Simple</h3>
              <p className="text-sm text-gray-600">
                Find and enroll in your perfect training center within minutes
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------ CTA SECTION ------------------------ */}
        <section className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Browse through 500+ verified training centers and find the perfect course for your career goals
            </p>
            <Link
              href="/centers"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
            >
              Explore All Centers
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}