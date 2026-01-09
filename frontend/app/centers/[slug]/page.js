"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ReviewSection from "../../../components/ReviewSection";
import { useFavorites } from "../../../contexts/FavoritesContext";
import { useCompare } from "../../../contexts/CompareContext";
import { Heart, GitCompare, ChevronDown, Phone, Mail, Globe, MapPin } from "lucide-react";

export default function CenterDetails() {
  const { slug } = useParams(); // ← CHANGED: id to slug
  const searchParams = useSearchParams();
  const router = useRouter();
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare, canAddMore } = useCompare();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    const userLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    setIsLoggedIn(userLoggedIn);
  }, []);

  useEffect(() => {
    async function loadCenter() {
      try {
        const res = await fetch(`${API_URL}/centers/${slug}`, { // ← CHANGED: id to slug
          cache: "no-store",
        });

        if (!res.ok) {
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
  }, [slug, API_URL]); // ← CHANGED: id to slug

  const handleFavoriteClick = () => {
    if (!isLoggedIn) {
      setShowToast("login-required");
      setTimeout(() => router.push("/user-menu"), 1500);
      return;
    }

    toggleFavorite(center.id); // ← Keep as center.id (favorites use ID internally)
    setShowToast(isFavorite(center.id) ? "removed-fav" : "added-fav");
    setTimeout(() => setShowToast(null), 2000);
  };

  const handleCompareClick = () => {
    if (!isLoggedIn) {
      setShowToast("login-required");
      setTimeout(() => router.push("/user-menu"), 1500);
      return;
    }

    const result = toggleCompare(center.id); // ← Keep as center.id (compare uses ID internally)
    if (result.success) {
      setShowToast(result.action === "added" ? "added-compare" : "removed-compare");
    } else {
      setShowToast("compare-limit");
    }
    setTimeout(() => setShowToast(null), 2000);
  };

  const parseCourses = (courses) => {
    const coursesByCategory = {
      TECHNOLOGY: [],
      MANAGEMENT: [],
      SKILL_DEVELOPMENT: [],
      EXAM_COACHING: []
    };

    if (!courses || courses.length === 0) return coursesByCategory;

    courses.forEach(course => {
      if (course.includes(':')) {
        const [category, courseName] = course.split(':').map(s => s.trim());
        if (coursesByCategory[category]) {
          coursesByCategory[category].push(courseName);
        }
      } else {
        if (center?.primaryCategory) {
          coursesByCategory[center.primaryCategory].push(course);
        }
      }
    });

    return coursesByCategory;
  };

  const getCategoriesWithCourses = (coursesByCategory) => {
    const categories = [];
    if (center?.primaryCategory && coursesByCategory[center.primaryCategory]?.length > 0) {
      categories.push(center.primaryCategory);
    }
    center?.secondaryCategories?.forEach(cat => {
      if (coursesByCategory[cat]?.length > 0) {
        categories.push(cat);
      }
    });
    return categories;
  };

  useEffect(() => {
    if (!center || !center.courses) return;

    const coursesByCategory = parseCourses(center.courses);
    const categoriesWithCourses = getCategoriesWithCourses(coursesByCategory);

    if (categoriesWithCourses.length === 0) return;

    const filterCategory = searchParams.get('category');

    if (filterCategory && categoriesWithCourses.includes(filterCategory)) {
      setActiveTab(filterCategory);
    } else {
      setActiveTab(categoriesWithCourses[0]);
    }
  }, [center, searchParams]);

  const formatCategory = (category) => {
    return category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  const shouldShowReadMore = (text) => text && text.length > 150;
  const getTruncatedText = (text) => {
    if (!text) return '';
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  };

  if (!center) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Center Not Found</h2>
            <p className="text-gray-600 mb-4">The center you're looking for doesn't exist.</p>
            <Link href="/centers" className="text-accent hover:text-accent/80">← Back to Centers</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const coursesByCategory = parseCourses(center.courses);
  const categoriesWithCourses = getCategoriesWithCourses(coursesByCategory);
  const isLiked = isFavorite(center.id); // ← Keep as center.id
  const isComparing = isInCompare(center.id); // ← Keep as center.id

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-6 pb-24 md:pb-8">
        {/* Toast */}
        {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
              {showToast === "added-fav" && "❤️ Added to favorites"}
              {showToast === "removed-fav" && "Removed from favorites"}
              {showToast === "added-compare" && "✓ Added to compare"}
              {showToast === "removed-compare" && "Removed from compare"}
              {showToast === "compare-limit" && "⚠️ Max 3 centers"}
              {showToast === "login-required" && "🔒 Please login"}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          {/* Header */}
          <div className="relative h-32 sm:h-40 bg-gradient-to-br from-indigo-600 to-purple-600">
            {center.image && (
              <img src={center.image} alt={center.name} className="w-full h-full object-cover" />
            )}

            {/* Logo */}
            <div className="absolute -bottom-10 left-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl shadow-xl border-4 border-white overflow-hidden flex items-center justify-center">
                {center.logo ? (
                  <img src={center.logo} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={handleFavoriteClick}
                className={`p-2 rounded-lg backdrop-blur-md transition-all shadow-lg ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-white/95 text-gray-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleCompareClick}
                disabled={!canAddMore() && !isComparing}
                className={`p-2 rounded-lg backdrop-blur-md transition-all shadow-lg ${
                  isComparing ? 'bg-blue-500 text-white' : 'bg-white/95 text-gray-700 disabled:opacity-50'
                }`}
              >
                <GitCompare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="pt-12 px-3 sm:px-4 pb-4">
            {/* Title & Location */}
            <div className="mb-3">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5">{center.name}</h1>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{center.city}, {center.state}</span>
                </div>
                {center.rating > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 rounded border border-yellow-200">
                    <span className="text-yellow-600">★</span>
                    <span className="font-semibold text-yellow-700">{center.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b">
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
                {formatCategory(center.primaryCategory)}
              </span>
              {center.secondaryCategories?.slice(0, 2).map((cat, i) => (
                <span key={i} className="px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
                  {formatCategory(cat)}
                </span>
              ))}
              {center.teachingMode && (
                <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                  {center.teachingMode}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-3">
              <h2 className="text-sm font-bold text-gray-900 mb-1.5">About</h2>
              <p className="text-gray-700 leading-relaxed text-sm">
                {showFullDescription || !shouldShowReadMore(center.description)
                  ? center.description
                  : getTruncatedText(center.description)}
              </p>
              {shouldShowReadMore(center.description) && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-1 text-indigo-600 text-xs font-medium flex items-center gap-0.5"
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showFullDescription ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Social Media - Instagram/LinkedIn Style */}
            {(center.facebook || center.instagram || center.linkedin) && (
              <div className="mb-3 pb-3 border-b">
                <div className="flex items-center gap-2">
                  {center.facebook && (
                    <a href={center.facebook} target="_blank" rel="noopener noreferrer"
                       className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {center.instagram && (
                    <a href={center.instagram} target="_blank" rel="noopener noreferrer"
                       className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-600 transition-colors">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {center.linkedin && (
                    <a href={center.linkedin} target="_blank" rel="noopener noreferrer"
                       className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Contact - Compact */}
            {(center.phone || center.whatsapp || center.email || center.website) && (
              <div className="mb-3">
                <h2 className="text-sm font-bold text-gray-900 mb-2">Contact</h2>
                <div className="grid grid-cols-2 gap-2">
                  {center.phone && (
                    <a href={`tel:${center.phone}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-900 font-medium truncate">{center.phone}</p>
                      </div>
                    </a>
                  )}

                  {center.whatsapp && (
                    <a href={`https://wa.me/${center.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-900 font-medium truncate">{center.whatsapp}</p>
                      </div>
                    </a>
                  )}

                  {center.email && (
                    <a href={`mailto:${center.email}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors col-span-2">
                      <Mail className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-900 font-medium truncate">{center.email}</p>
                      </div>
                    </a>
                  )}

                  {center.website && (
                    <a href={center.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors col-span-2">
                      <Globe className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-indigo-600 font-medium truncate">Visit Website</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Courses - Compact */}
            {categoriesWithCourses.length > 0 && (
              <div className="mb-3">
                <h2 className="text-sm font-bold text-gray-900 mb-2">Courses</h2>

                {categoriesWithCourses.length > 1 && (
                  <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-hide">
                    {categoriesWithCourses.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                          activeTab === cat
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {formatCategory(cat)} ({coursesByCategory[cat].length})
                      </button>
                    ))}
                  </div>
                )}

                {activeTab && coursesByCategory[activeTab] && (
                  <div className="grid grid-cols-1 gap-1.5">
                    {coursesByCategory[activeTab].map((course, i) => (
                      <div key={i} className="px-2.5 py-1.5 bg-gray-50 border rounded-md flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-800 text-xs">{course}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Gallery - Compact */}
            {center.gallery && center.gallery.length > 0 && (
              <div className="mb-3">
                <h2 className="text-sm font-bold text-gray-900 mb-2">Gallery</h2>
                <div className="grid grid-cols-3 gap-2">
                  {center.gallery.map((img, i) => (
                    <img key={i} src={img} alt={`Gallery ${i + 1}`} className="w-full h-20 object-cover rounded-lg border" />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection centerId={center.id} /> {/* ← Keep as center.id (reviews use ID) */}

            {/* Back Link */}
            <div className="pt-3 border-t mt-3">
              <Link href="/centers" className="inline-flex items-center gap-1 text-indigo-600 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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