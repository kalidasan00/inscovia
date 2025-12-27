"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function CenterDetails() {
  const { id } = useParams();
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5001/api";

  useEffect(() => {
    async function loadCenter() {
      try {
        const res = await fetch(`${API_URL}/centers/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.warn("Backend still waking up, retrying...");
          setTimeout(loadCenter, 2000);
          return;
        }

        const data = await res.json();
        setCenter(data);
      } catch (err) {
        console.error("Error loading center:", err);
        setTimeout(loadCenter, 2000);
      } finally {
        setLoading(false);
      }
    }

    loadCenter();
  }, [id]);

  const formatCategory = (category) => {
    return category?.replace(/_/g, ' ') || '';
  };

  const getTeachingModeIcon = (mode) => {
    switch(mode) {
      case 'ONLINE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'OFFLINE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'HYBRID':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      default:
        return null;
    }
  };

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
            <p className="text-gray-600 mb-4">
              The center you're looking for doesn't exist.
            </p>
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
          {/* Cover Image */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            {center.image ? (
              <img
                src={center.image}
                alt={center.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/80">
                <p className="text-sm">No cover image</p>
              </div>
            )}

            {/* Logo */}
            <div className="absolute -bottom-8 left-4 sm:left-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg shadow-md border-2 border-white overflow-hidden flex items-center justify-center">
                {center.logo ? (
                  <img src={center.logo} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-10 sm:pt-12 px-4 sm:px-6 pb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {center.name}
            </h1>

            {/* Categories and Info */}
            <div className="mt-3 flex flex-wrap gap-2">
              {/* Primary Category */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {formatCategory(center.primaryCategory)}
              </span>

              {/* Secondary Categories */}
              {center.secondaryCategories?.map((cat, i) => (
                <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {formatCategory(cat)}
                </span>
              ))}

              {/* Teaching Mode */}
              {center.teachingMode && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {getTeachingModeIcon(center.teachingMode)}
                  {center.teachingMode}
                </span>
              )}
            </div>

            {/* Location */}
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{center.location}, {center.city}, {center.district}, {center.state}</span>
            </div>

            {/* Rating */}
            {center.rating > 0 && (
              <div className="mt-2 flex items-center gap-1 text-sm">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{center.rating.toFixed(1)}</span>
                <span className="text-gray-500">/ 5</span>
              </div>
            )}

            {/* Description */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{center.description}</p>
            </div>

            {/* Courses */}
            {center.courses && center.courses.length > 0 && (
              <section className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Available Courses ({center.courses.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {center.courses.map((c, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 bg-gray-50 border rounded-lg text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {c}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contact Information */}
            {(center.phone || center.email || center.website) && (
              <section className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  {center.phone && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${center.phone}`} className="text-blue-600 hover:underline">{center.phone}</a>
                    </div>
                  )}
                  {center.email && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${center.email}`} className="text-blue-600 hover:underline">{center.email}</a>
                    </div>
                  )}
                  {center.website && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <a href={center.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{center.website}</a>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Gallery */}
            {center.gallery && center.gallery.length > 0 && (
              <section className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {center.gallery.map((img, i) => (
                    <img key={i} src={img} alt={`Gallery ${i + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  ))}
                </div>
              </section>
            )}

            {/* Back */}
            <div className="mt-6 pt-6 border-t">
              <Link
                href="/centers"
                className="text-accent hover:text-accent/80 text-sm font-medium inline-flex items-center gap-1"
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