// app/institute/dashboard/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";

export default function InstituteDashboard() {
  const [institute, setInstitute] = useState(null);
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    // Check if logged in
    const isLoggedIn = localStorage.getItem("instituteLoggedIn") === "true";
    const token = localStorage.getItem("instituteToken");

    if (!isLoggedIn || !token) {
      router.push("/institute/login");
      return;
    }

    try {
      // Fetch current institute data with center
      const response = await fetch("http://localhost:5001/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch institute data");
      }

      const data = await response.json();
      setInstitute(data.user);
      setCenter(data.center); // Set center data
    } catch (error) {
      console.error("Error:", error);
      // If token is invalid, logout
      localStorage.removeItem("instituteLoggedIn");
      localStorage.removeItem("instituteToken");
      localStorage.removeItem("instituteData");
      router.push("/institute/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!institute) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">Please login to access your dashboard.</p>
            <Link
              href="/institute/login"
              className="inline-flex px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90"
            >
              Go to Login
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Build full location string
  const fullLocation = [institute.city, institute.district, institute.state]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Welcome, {institute.instituteName}!</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your institute profile and content</p>
          </div>
          <Link
            href="/institute/dashboard/edit"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
          {/* Cover Image */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-100 to-purple-100">
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Edit Cover Button */}
            <Link
              href="/institute/dashboard/edit"
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>

          {/* Logo Badge */}
          <div className="relative px-4 sm:px-6">
            <div className="absolute -top-8 sm:-top-10">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                {/* Edit Logo Button */}
                <Link
                  href="/institute/dashboard/edit"
                  className="absolute -bottom-1 -right-1 p-1.5 bg-accent text-white rounded-full shadow-lg hover:bg-accent/90 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-10 sm:pt-12 px-4 sm:px-6 pb-6">
            {/* Institute Info */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{institute.instituteName}</h2>
                  <Link
                    href="/institute/dashboard/edit"
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Edit basic info"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Link>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {fullLocation}
                  </span>
                  {institute.type && (
                    <>
                      <span>•</span>
                      <span>{institute.type}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900">Your Center Profile</h4>
                  {center ? (
                    <>
                      <p className="text-sm text-blue-700 mt-1">
                        Your center is live on Inscovia! Students can now find and contact you.
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Link
                          href={`/centers/${center.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          View Public Profile
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-blue-700 mt-1">
                      Complete your profile to make your center visible to students.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Center Stats */}
            {center && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{center.courses?.length || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Courses</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{center.rating || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Rating</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{center.gallery?.length || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Photos</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {center.logo && center.image ? '100%' : center.logo || center.image ? '50%' : '0%'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Profile</div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{institute.email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="truncate">{institute.phone}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/institute/dashboard/edit"
                className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors group"
              >
                <svg className="w-8 h-8 text-gray-600 group-hover:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm font-medium text-center">Edit Profile</span>
              </Link>

              <Link
                href="/institute/dashboard/courses"
                className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors group"
              >
                <svg className="w-8 h-8 text-gray-600 group-hover:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium text-center">Manage Courses</span>
              </Link>

              <Link
                href="/institute/dashboard/gallery"
                className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors group"
              >
                <svg className="w-8 h-8 text-gray-600 group-hover:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-center">Gallery</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}