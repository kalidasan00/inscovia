"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function CenterDetails() {
  const params = useParams();
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCenter() {
      try {
        const res = await fetch(`http://localhost:5001/api/centers/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCenter(data);
        } else {
          setCenter(null);
        }
      } catch (err) {
        console.error("Error loading center:", err);
        setCenter(null);
      } finally {
        setLoading(false);
      }
    }
    loadCenter();
  }, [params.id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-gray-600">Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!center) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Center Not Found</h2>
            <p className="text-gray-600 mb-4">The center you're looking for doesn't exist.</p>
            <Link href="/centers" className="text-accent hover:text-accent/80">
              ← Back to Centers
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 md:pb-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
          {/* Cover Image with Logo */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-50">
            {center.image && (
              <img
                src={center.image}
                alt={center.name}
                className="w-full h-full object-cover"
              />
            )}

            {/* Logo Badge */}
            <div className="absolute -bottom-8 sm:-bottom-10 left-4 sm:left-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
                {center.logo ? (
                  <img
                    src={center.logo}
                    alt={`${center.name} logo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-10 sm:pt-12 px-4 sm:px-6 pb-6">
            {/* Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {center.name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {center.location}
                  </span>
                  <span>•</span>
                  <span>{center.type}</span>
                  {center.rating && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium text-yellow-600">
                        {center.rating}
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 sm:flex-none px-5 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                  Enquiry
                </button>
                <button className="flex-1 sm:flex-none px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="hidden sm:inline">Website</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="mt-4 text-sm text-gray-700 leading-relaxed">
              {center.description}
            </p>

            {/* Courses Section */}
            <section className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                Available Courses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {center.courses && center.courses.map((course, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700 hover:border-accent/30 hover:bg-accent/5 transition-colors"
                  >
                    {course}
                  </div>
                ))}
              </div>
            </section>

            {/* Back Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/centers"
                className="inline-flex items-center gap-2 text-accent hover:text-accent/80 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Centers
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}