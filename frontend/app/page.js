"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="bg-gray-50 pb-20 md:pb-8">
        {/* Hero Section with Search */}
        <HeroSection />

        {/* ------------------------ CATEGORY CARDS ------------------------ */}
        <section className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
            Explore by Category
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* IT Training */}
            <Link
              href="/centers?type=IT"
              className="group bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-accent/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 mb-0.5">IT Training Centers</h3>
                  <p className="text-xs text-gray-600">Software, Cloud, AI & more</p>
                </div>
              </div>
            </Link>

            {/* Non-IT Training */}
            <Link
              href="/centers?type=Non-IT"
              className="group bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-accent/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 mb-0.5">Non-IT Training</h3>
                  <p className="text-xs text-gray-600">Finance, Marketing & Design</p>
                </div>
              </div>
            </Link>

            {/* All Centers */}
            <Link
              href="/centers"
              className="group bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-accent/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 mb-0.5">Browse All Centers</h3>
                  <p className="text-xs text-gray-600">View all training centers</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ------------------------ FEATURED TRAINING CENTERS ------------------------ */}
        <section className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            ⭐ Featured Training Centers
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[260px] bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all"
              >
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3"></div>
                <h3 className="font-semibold text-sm text-gray-900">Featured Center {i}</h3>
                <p className="text-xs text-gray-600">City • Popular Courses</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------ TOP COACHING CENTERS ------------------------ */}
        <section className="max-w-6xl mx-auto px-3 sm:px-4 py-2">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            🔥 Top Coaching Centers
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[260px] bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all"
              >
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3"></div>
                <h3 className="font-semibold text-sm text-gray-900">Top Center {i}</h3>
                <p className="text-xs text-gray-600">Best Rated • Trending Courses</p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------ FEATURES SECTION ------------------------ */}
        <section className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">
              Why Choose Inscovia?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">Verified Centers</h3>
                  <p className="text-xs text-gray-600">All centers verified & reviewed</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">Compare & Choose</h3>
                  <p className="text-xs text-gray-600">Compare courses & ratings easily</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">Fast & Simple</h3>
                  <p className="text-xs text-gray-600">Find centers in minutes</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-200 text-center">
              <Link
                href="/centers"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                Explore All Training Centers
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
