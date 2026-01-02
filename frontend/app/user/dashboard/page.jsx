// app/user/dashboard/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { useFavorites } from "../../../contexts/FavoritesContext";
import { useCompare } from "../../../contexts/CompareContext";
import { Heart, GitCompare, Search, MessageSquare } from "lucide-react";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { favoritesCount } = useFavorites();
  const { compareCount } = useCompare();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    const userData = localStorage.getItem("userData");

    if (!isLoggedIn || !userData) {
      router.push("/user-menu");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/user-menu");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("userData");
    localStorage.removeItem("userToken");
    router.push("/");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-3 sm:px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-3 sm:px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">Please login to access your dashboard.</p>
            <Link
              href="/user-menu"
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

  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-8 pb-24 md:pb-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 sm:p-8 text-white mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-blue-100">
                Explore training centers and courses to boost your career
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Saved Centers */}
          <Link
            href="/user/saved"
            className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-red-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{favoritesCount}</p>
                <p className="text-xs text-gray-600">Saved</p>
              </div>
            </div>
          </Link>

          {/* Compare */}
          <Link
            href="/user/compare"
            className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <GitCompare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{compareCount}</p>
                <p className="text-xs text-gray-600">Comparing</p>
              </div>
            </div>
          </Link>

          {/* Profile Status */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {user.isVerified ? "Verified" : "Active"}
                </p>
                <p className="text-xs text-gray-600">Status</p>
              </div>
            </div>
          </div>

          {/* Browse */}
          <Link
            href="/centers"
            className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-accent transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Browse</p>
                <p className="text-xs text-gray-600">Centers</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
            <Link
              href="/user/profile/edit"
              className="text-sm text-accent hover:text-accent/80 font-medium"
            >
              Edit Profile
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-medium text-gray-900">
                  {user.isVerified ? (
                    <span className="text-green-600">Verified</span>
                  ) : (
                    <span className="text-orange-600">Not Verified</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Link
            href="/centers"
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md hover:border-accent/30 transition-all group"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Browse Centers</h3>
                <p className="text-sm text-gray-600">Find training centers near you</p>
              </div>
            </div>
          </Link>

          <Link
            href="/user/saved"
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md hover:border-accent/30 transition-all group relative"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-red-50 rounded-full group-hover:bg-red-100 transition-colors relative">
                <Heart className="w-8 h-8 text-red-600" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Saved Centers</h3>
                <p className="text-sm text-gray-600">View your {favoritesCount} saved centers</p>
              </div>
            </div>
          </Link>

          <Link
            href="/user/reviews"
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md hover:border-accent/30 transition-all group"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-4 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">My Reviews</h3>
                <p className="text-sm text-gray-600">Manage your reviews</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Banner */}
        {compareCount > 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <GitCompare className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  You're comparing {compareCount} {compareCount === 1 ? 'center' : 'centers'}
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  View them side-by-side to find the perfect match for your learning goals.
                </p>
                <Link
                  href="/user/compare"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View Comparison
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Start Your Learning Journey</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Browse through hundreds of training centers and find the perfect course for your career growth.
                </p>
                <Link
                  href="/centers"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Explore Training Centers
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}