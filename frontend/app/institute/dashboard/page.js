// app/institute/dashboard/page.js - FIXED WITH SLUG
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function InstituteDashboard() {
  const [institute, setInstitute] = useState(null);
  const [center, setCenter] = useState(null);
  const [centerSlug, setCenterSlug] = useState(null); // ✅ ADDED
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) {
      router.push("/institute/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed");

      const data = await response.json();
      setInstitute(data.user);
      setCenter(data.center);
      setCenterSlug(data.center?.slug); // ✅ STORE SLUG
    } catch (error) {
      router.push("/institute/login");
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    const currentGallery = center?.gallery || [];

    if (currentGallery.length + files.length > 3) {
      alert(`You can only have maximum 3 photos. Currently you have ${currentGallery.length}.`);
      return;
    }

    if (files.length === 0) return;

    setUploadingGallery(true);
    const token = localStorage.getItem("instituteToken");

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(`${API_URL}/centers/${centerSlug}/upload-gallery`, { // ✅ USE SLUG
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }
      }

      await checkAuthAndFetchData();
      alert("Photos uploaded successfully!");
    } catch (error) {
      alert("Failed to upload photos. Please try again.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (imageUrl) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    const token = localStorage.getItem("instituteToken");

    try {
      const response = await fetch(`${API_URL}/centers/${centerSlug}/delete-gallery`, { // ✅ USE SLUG
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await checkAuthAndFetchData();
      alert("Photo deleted successfully!");
    } catch (error) {
      alert("Failed to delete photo. Please try again.");
    }
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
        if (institute?.primaryCategory) {
          coursesByCategory[institute.primaryCategory].push(course);
        }
      }
    });

    return coursesByCategory;
  };

  const getCategoriesWithCourses = (coursesByCategory) => {
    const categories = [];

    if (institute?.primaryCategory && coursesByCategory[institute.primaryCategory]?.length > 0) {
      categories.push(institute.primaryCategory);
    }

    institute?.secondaryCategories?.forEach(cat => {
      if (coursesByCategory[cat]?.length > 0) {
        categories.push(cat);
      }
    });

    return categories;
  };

  useEffect(() => {
    if (!institute || !center?.courses) return;

    const coursesByCategory = parseCourses(center.courses);
    const categoriesWithCourses = getCategoriesWithCourses(coursesByCategory);

    if (categoriesWithCourses.length > 0) {
      setActiveTab(categoriesWithCourses[0]);
    }
  }, [institute, center]);

  const formatCategory = (category) => {
    return category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!institute) {
    router.push("/institute/login");
    return null;
  }

  const coursesByCategory = center?.courses ? parseCourses(center.courses) : {};
  const categoriesWithCourses = getCategoriesWithCourses(coursesByCategory);
  const currentGalleryCount = center?.gallery?.length || 0;
  const canAddMorePhotos = currentGalleryCount < 3;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-6 pb-24 md:pb-8">
        {/* Edit Banner */}
        <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Student view</span>
          </div>
          <Link
            href="/institute/dashboard/edit"
            className="px-2.5 py-1 bg-accent text-white text-xs font-medium rounded-md hover:bg-accent/90"
          >
            Edit Profile
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          {/* Header */}
          <div className="relative h-32 sm:h-40 bg-gradient-to-br from-indigo-600 to-purple-600">
            {center?.image && (
              <img src={center.image} alt={institute.instituteName} className="w-full h-full object-cover" />
            )}

            {/* Logo */}
            <div className="absolute -bottom-10 left-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl shadow-xl border-4 border-white overflow-hidden flex items-center justify-center">
                {center?.logo ? (
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
          <div className="pt-12 px-3 sm:px-4 pb-4">
            {/* Name & Location */}
            <div className="mb-3">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">{institute.instituteName}</h1>
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{institute.city}, {institute.state}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b">
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
                {formatCategory(institute.primaryCategory)}
              </span>
              {institute.secondaryCategories?.slice(0, 2).map((cat, i) => (
                <span key={i} className="px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
                  {formatCategory(cat)}
                </span>
              ))}
              {institute.teachingMode && (
                <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                  {institute.teachingMode}
                </span>
              )}
              {center?.rating > 0 && (
                <span className="flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">
                  <span>★</span>
                  <span>{center.rating.toFixed(1)}</span>
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-sm font-bold text-gray-900">About</h2>
                <Link href="/institute/dashboard/edit" className="text-accent text-xs font-medium">
                  Edit
                </Link>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {center?.description || "No description added yet"}
              </p>
            </div>

            {/* Courses */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-gray-900">Courses</h2>
                <Link href="/institute/dashboard/courses" className="text-accent text-xs font-medium">
                  Manage
                </Link>
              </div>

              {categoriesWithCourses.length > 0 ? (
                <>
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
                </>
              ) : (
                <div className="text-center py-4 border-2 border-dashed rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">No courses added</p>
                  <Link href="/institute/dashboard/courses" className="text-accent text-xs font-medium">
                    Add course →
                  </Link>
                </div>
              )}
            </div>

            {/* Contact */}
            {(center?.phone || center?.whatsapp || center?.email || center?.website) && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-gray-900">Contact</h2>
                  <Link href="/institute/dashboard/contacts" className="text-accent text-xs font-medium">
                    Edit
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {center.phone && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-900 truncate">{center.phone}</span>
                    </div>
                  )}
                  {center.whatsapp && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span className="text-xs font-medium text-gray-900 truncate">{center.whatsapp}</span>
                    </div>
                  )}
                  {center.email && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg col-span-2">
                      <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-900 truncate">{center.email}</span>
                    </div>
                  )}
                  {center.website && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg col-span-2">
                      <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span className="text-xs text-indigo-600 font-medium truncate">Visit Website</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Media - Compact */}
            {(center?.facebook || center?.instagram || center?.linkedin) && (
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

            {/* Gallery with Upload - Max 3 Photos */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-gray-900">
                  Gallery ({currentGalleryCount}/3)
                </h2>
                {canAddMorePhotos && (
                  <label className="text-accent text-xs font-medium cursor-pointer hover:text-accent/80">
                    Add Photo
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="hidden"
                      disabled={uploadingGallery}
                    />
                  </label>
                )}
              </div>

              {center?.gallery && center.gallery.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {center.gallery.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => handleDeleteGalleryImage(img)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Empty slots */}
                  {[...Array(3 - currentGalleryCount)].map((_, i) => (
                    <label key={`empty-${i}`} className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-accent hover:bg-gray-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGalleryUpload}
                        className="hidden"
                        disabled={uploadingGallery}
                      />
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(3)].map((_, i) => (
                    <label key={i} className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-accent hover:bg-gray-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGalleryUpload}
                        className="hidden"
                        disabled={uploadingGallery}
                      />
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </label>
                  ))}
                </div>
              )}

              {uploadingGallery && (
                <p className="text-xs text-gray-500 mt-2 text-center">Uploading...</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}