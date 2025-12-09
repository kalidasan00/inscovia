// test deploy
"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

// Icons
import { Laptop, BookOpen, GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="bg-gray-50">

        {/* SEARCH BOX (Single) */}
        <section className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-xl shadow p-4 md:p-5 border border-gray-100 max-w-md w-full">

            <h2 className="text-lg font-semibold text-gray-900">
              Find training centers near you
            </h2>

            <p className="text-gray-600 mt-1 text-[13px] leading-relaxed">
              Search IT & non-IT coaching centers, compare courses and ratings.
            </p>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search center or course"
              className="mt-3 w-full p-2 rounded-lg border border-gray-300 text-sm focus:ring-1 focus:ring-blue-400"
            />

            {/* Dropdown */}
            <select
              className="mt-2 w-full p-2 rounded-lg border border-gray-300 text-sm focus:ring-1 focus:ring-blue-400"
            >
              <option>All types</option>
              <option>IT Training</option>
              <option>Non-IT Training</option>
              <option>Coaching Center</option>
            </select>

            {/* Buttons */}
            <div className="flex gap-2 mt-3">
              <button className="flex-1 bg-[#00bcd4] text-white py-2 rounded-lg text-sm hover:opacity-90 transition">
                Search
              </button>

              <button className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-100 transition">
                Reset
              </button>
            </div>

          </div>
        </section>

        {/* CATEGORY CARDS */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Explore Training Categories
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

            {/* IT */}
            <Link
              href="/centers?category=it"
              className="p-3 bg-white shadow-sm rounded-lg border hover:shadow transition cursor-pointer flex gap-2 items-start"
            >
              <Laptop className="text-blue-600 w-6 h-6" />
              <div>
                <h3 className="text-[14px] font-semibold">IT Training Centers</h3>
                <p className="text-gray-600 text-[11px] leading-snug mt-0.5">
                  Software, cloud, AI, cybersecurity & more.
                </p>
              </div>
            </Link>

            {/* Non-IT */}
            <Link
              href="/centers?category=non-it"
              className="p-3 bg-white shadow-sm rounded-lg border hover:shadow transition cursor-pointer flex gap-2 items-start"
            >
              <BookOpen className="text-green-600 w-6 h-6" />
              <div>
                <h3 className="text-[14px] font-semibold">Non-IT Training Centers</h3>
                <p className="text-gray-600 text-[11px] leading-snug mt-0.5">
                  Accounting, HR, marketing, design & more.
                </p>
              </div>
            </Link>

            {/* Coaching */}
            <Link
              href="/centers?category=coaching"
              className="p-3 bg-white shadow-sm rounded-lg border hover:shadow transition cursor-pointer flex gap-2 items-start"
            >
              <GraduationCap className="text-purple-600 w-6 h-6" />
              <div>
                <h3 className="text-[14px] font-semibold">Coaching Centers</h3>
                <p className="text-gray-600 text-[11px] leading-snug mt-0.5">
                  UPSC, SSC, NEET, JEE & competitive exams.
                </p>
              </div>
            </Link>

          </div>
        </section>

        {/* FEATURED SECTION */}
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* MAIN FEATURE BLOCK */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">

                <h2 className="text-xl font-bold text-gray-900">
                  Featured IT & Non-IT Centers
                </h2>

                <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                  Hand-picked training centers to help you upskill faster.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href="/centers"
                    className="p-3 rounded-lg border border-gray-200 hover:shadow bg-white transition text-sm font-medium"
                  >
                    Explore All Centers →
                  </Link>

                  <Link
                    href="/centers?type=IT"
                    className="p-3 rounded-lg border border-gray-200 hover:shadow bg-white transition text-sm font-medium"
                  >
                    Top IT Courses →
                  </Link>
                </div>

              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Why Inscovia?</h3>

              <ul className="mt-3 space-y-2 text-gray-700 text-[14px] leading-relaxed">

                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  Verified training centers
                </li>

                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  Compare courses and ratings
                </li>

                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  Mobile-first, fast, and reliable
                </li>

              </ul>
            </aside>

          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
