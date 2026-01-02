// app/user/saved/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import CenterCard from "../../../components/CenterCard";
import { useFavorites } from "../../../contexts/FavoritesContext";
import { Heart } from "lucide-react";

export default function SavedCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { favorites } = useFavorites();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  // Check auth
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    const userData = localStorage.getItem("userData");

    if (!isLoggedIn || !userData) {
      router.push("/user-menu");
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      router.push("/user-menu");
    }
  }, [router]);

  // Load all centers
  useEffect(() => {
    async function loadCenters() {
      try {
        const res = await fetch(`${API_URL}/centers`);
        if (res.ok) {
          const data = await res.json();
          setCenters(data.centers || []);
        }
      } catch (error) {
        console.error("Error loading centers:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCenters();
  }, [API_URL]);

  // Filter centers to show only favorites
  const savedCenters = centers.filter(center => favorites.includes(center.id));

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <Heart className="w-6 h-6 text-red-600 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Saved Centers
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {favorites.length} {favorites.length === 1 ? 'center' : 'centers'} saved
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your saved centers...</p>
          </div>
        ) : savedCenters.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Saved Centers Yet
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start exploring training centers and save your favorites for quick access later.
            </p>
            <button
              onClick={() => router.push('/centers')}
              className="px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Training Centers
            </button>
          </div>
        ) : (
          /* Saved Centers Grid */
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {savedCenters.map((center) => (
                <CenterCard key={center.id} center={center} />
              ))}
            </div>

            {/* Tips */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Pro Tip</h3>
                  <p className="text-sm text-blue-700">
                    Use the compare feature to evaluate multiple centers side-by-side and find the best match for your learning goals.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}