// app/user/dashboard/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Link from "next/link";
import { useFavorites } from "../../../contexts/FavoritesContext";
import { useCompare } from "../../../contexts/CompareContext";
import { Heart, GitCompare, Search, MessageSquare, User, Mail, Phone, LogOut, X, AlertCircle } from "lucide-react";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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
    setShowLogoutModal(false);
    router.push("/");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
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
        <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
          <div className="text-center py-16">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-sm text-gray-600 mb-4">Please login to access your dashboard.</p>
            <Link
              href="/user-menu"
              className="inline-flex px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 text-sm font-medium"
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

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">
                  {user.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  {user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
          {/* Saved Centers */}
          <Link
            href="/user/saved"
            className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-red-200 transition-all"
          >
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{favoritesCount}</p>
                <p className="text-xs text-gray-600">Saved</p>
              </div>
            </div>
          </Link>

          {/* Compare */}
          <Link
            href="/user/compare"
            className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <GitCompare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{compareCount}</p>
                <p className="text-xs text-gray-600">Compare</p>
              </div>
            </div>
          </Link>

          {/* Reviews */}
          <Link
            href="/user/reviews"
            className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-purple-200 transition-all"
          >
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-900 font-semibold">Reviews</p>
                <p className="text-xs text-gray-600">Manage</p>
              </div>
            </div>
          </Link>

          {/* Browse */}
          <Link
            href="/centers"
            className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-accent transition-all"
          >
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-gray-900 font-semibold">Browse</p>
                <p className="text-xs text-gray-600">Centers</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-5 mb-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">Profile Information</h2>
            <Link
              href="/user/profile/edit"
              className="text-xs sm:text-sm text-accent hover:text-accent/80 font-medium"
            >
              Edit
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Name</p>
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Phone</p>
                <p className="text-sm font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Status</p>
                <p className="text-sm font-medium">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <Link
            href="/centers"
            className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-accent/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Browse Centers</h3>
                <p className="text-xs text-gray-600">Find training centers</p>
              </div>
            </div>
          </Link>

          <Link
            href="/user/saved"
            className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-accent/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                <Heart className="w-5 h-5 text-red-600" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Saved Centers</h3>
                <p className="text-xs text-gray-600">{favoritesCount} saved</p>
              </div>
            </div>
          </Link>

          <Link
            href="/user/reviews"
            className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-accent/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">My Reviews</h3>
                <p className="text-xs text-gray-600">Manage reviews</p>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
            onClick={() => setShowLogoutModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowLogoutModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Logout?
                </h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to logout from your account?
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>

      <Footer />
    </>
  );
}