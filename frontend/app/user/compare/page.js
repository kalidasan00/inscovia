// app/user/compare/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useCompare } from "../../../contexts/CompareContext";
import { GitCompare, X, Star, MapPin, BookOpen, Globe } from "lucide-react";

export default function CompareCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

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

  const comparedCenters = centers.filter(center => compareList.includes(center.id));

  const formatCategory = (cat) => {
    return cat?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (comparedCenters.length === 0) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-8 pb-24 md:pb-8">
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GitCompare className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Centers to Compare
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Add training centers to your comparison list to see them side-by-side.
            </p>
            <button
              onClick={() => router.push('/centers')}
              className="px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
            >
              Browse Training Centers
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <GitCompare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Compare Centers
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Comparing {comparedCenters.length} {comparedCenters.length === 1 ? 'center' : 'centers'}
                </p>
              </div>
            </div>

            {comparedCenters.length > 0 && (
              <button
                onClick={clearCompare}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors text-sm"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                    Feature
                  </th>
                  {comparedCenters.map((center) => (
                    <th key={center.id} className="px-6 py-4 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">{center.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {center.city}, {center.state}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCompare(center.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* Image */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">Image</td>
                  {comparedCenters.map((center) => (
                    <td key={center.id} className="px-6 py-4">
                      <img src={center.image} alt={center.name} className="w-full h-32 object-cover rounded-lg" />
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-gray-50">Rating</td>
                  {comparedCenters.map((center) => (
                    <td key={center.id} className="px-6 py-4">
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold">{center.rating.toFixed(1)}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">Category</td>
                  {comparedCenters.map((center) => (
                    <td key={center.id} className="px-6 py-4">
                      <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                        {formatCategory(center.primaryCategory)}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Teaching Mode */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-gray-50">Teaching Mode</td>
                  {comparedCenters.map((center) => (
                    <td key={center.id} className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {center.teachingMode}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Courses */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">Courses Offered</td>
                  {comparedCenters.map((center) => (
                    <td key={center.id} className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-semibold">{center.courses?.length || 0} courses</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-gray-50">About</td>
                  {comparedCenters.map((center) => (
                    <td key={center.id} className="px-6 py-4">
                      <p className="text-sm text-gray-700 line-clamp-3">{center.description}</p>
                    </td>
                  ))}
                </tr>

                {/* Contact */}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">Contact</td>
                  {comparedCenters.map((center) => (
                    <td key={center.id} className="px-6 py-4">
                      <div className="space-y-2 text-sm">
                        {center.phone && <div>📞 {center.phone}</div>}
                        {center.email && <div>✉️ {center.email}</div>}
                        {center.website && (
                          <a href={center.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            Website
                          </a>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Action */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-gray-50">Action</td>
                  {comparedCenters.map((center) => (
                    <td key={center.id} className="px-6 py-4">
                      <Link
                        href={`/centers/${center.id}`}
                        className="inline-flex px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {comparedCenters.map((center) => (
            <div key={center.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{center.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {center.city}, {center.state}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCompare(center.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <img src={center.image} alt={center.name} className="w-full h-32 object-cover rounded-lg mb-4" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{center.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                    {formatCategory(center.primaryCategory)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mode</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    {center.teachingMode}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Courses</span>
                  <span className="font-semibold">{center.courses?.length || 0} courses</span>
                </div>
              </div>

              <Link
                href={`/centers/${center.id}`}
                className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors text-sm"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}