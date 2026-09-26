// app/institute/dashboard/college/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AccountSwitcher from "../../../../components/AccountSwitcher";
import Footer from "../../../../components/Footer";
import { LogOut, AlertCircle, Plus, X, IndianRupee, Clock } from "lucide-react";

const CATEGORY_LABELS = {
  ENGINEERING:         "Engineering",
  MEDICAL:             "Medical",
  NURSING:             "Nursing",
  PHARMACY:            "Pharmacy",
  AYURVEDA_HOMEOPATHY: "Ayurveda / Homeopathy",
  ARTS_SCIENCE:        "Arts & Science",
  MANAGEMENT:          "Management",
  LAW:                 "Law",
  ARCHITECTURE:        "Architecture",
  DEGREE:              "Degree",
  PG:                  "PG",
  POLYTECHNIC:         "Polytechnic",
};

function formatCategory(category) {
  return CATEGORY_LABELS[category] || category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
}

export default function CollegeDashboard() {
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => { checkAuthAndFetchData(); }, []);

  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();

      if (!data.college) {
        router.push("/institute/dashboard");
        return;
      }

      setCollege(data.college);
      localStorage.setItem("instituteLoggedIn", "true");
    } catch {
      localStorage.removeItem("instituteToken");
      localStorage.removeItem("instituteData");
      localStorage.removeItem("instituteLoggedIn");
      router.push("/institute/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("instituteToken");
    localStorage.removeItem("instituteData");
    localStorage.removeItem("instituteLoggedIn");
    window.dispatchEvent(new Event("authStateChanged"));
    setShowLogoutModal(false);
    router.push("/institute/login");
  };

  // ✅ Gallery — mirrors Center's gallery upload/delete pattern
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    const currentGallery = college?.gallery || [];
    if (currentGallery.length + files.length > 6) {
      alert(`You can only have maximum 6 photos. Currently you have ${currentGallery.length}.`);
      return;
    }
    if (files.length === 0) return;
    setUploadingGallery(true);
    const token = localStorage.getItem("instituteToken");
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch(`${API_URL}/colleges/${college.slug}/upload-gallery`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || "Upload failed");
        }
      }
      await checkAuthAndFetchData();
      alert("Photos uploaded successfully!");
    } catch (error) {
      alert(error.message || "Failed to upload photos. Please try again.");
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  const handleDeleteGalleryImage = async (imageUrl) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    const token = localStorage.getItem("instituteToken");
    try {
      const response = await fetch(`${API_URL}/colleges/${college.slug}/delete-gallery`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Delete failed");
      }
      await checkAuthAndFetchData();
    } catch (error) {
      alert(error.message || "Failed to delete photo. Please try again.");
    }
  };

  // ✅ Courses summary for the dashboard home (full management lives on /courses)
  const courses = (() => {
    const c = college?.courses;
    if (!c) return [];
    if (typeof c === "string") { try { return JSON.parse(c); } catch { return []; } }
    return Array.isArray(c) ? c : [];
  })();

  // ✅ Placements summary for the dashboard home (full management lives on /admissions)
  const placements = (() => {
    const p = college?.placements;
    if (!p) return {};
    if (typeof p === "string") { try { return JSON.parse(p); } catch { return {}; } }
    return p;
  })();
  const hasPlacementStats = placements.placementPercentage || placements.avgPackage || placements.highestPackage;

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto" />
        </div>
      </main>
    );
  }

  if (!college) return null;

  return (
    <>
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-6 pb-24 md:pb-8">

        <div className="mb-3">
          <AccountSwitcher mode="institute" />
        </div>

        <div className="bg-white rounded-xl shadow-md border overflow-hidden">

          <div className="relative h-32 sm:h-40 bg-gradient-to-br from-indigo-600 to-purple-600">
            {college?.image && (
              <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
            )}
            <button onClick={() => setShowLogoutModal(true)}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-lg transition-colors shadow-sm" title="Logout">
              <LogOut className="w-4 h-4 text-gray-700" />
            </button>
            <div className="absolute -bottom-10 left-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl shadow-xl border-4 border-white overflow-hidden flex items-center justify-center">
                {college?.logo ? (
                  <img src={college.logo} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0-6l-6.16-3.42A12.083 12.083 0 006 18.75c0 .966.784 1.75 1.75 1.75h8.5a1.75 1.75 0 001.75-1.75 12.083 12.083 0 00-.84-4.42L12 14z" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          <div className="pt-12 px-3 sm:px-4 pb-4">

            <div className="mb-3">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">{college.name}</h1>
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{college.city}, {college.state}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b">
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
                {formatCategory(college.primaryCategory)}
              </span>
              {college.secondaryCategories?.slice(0, 2).map((cat, i) => (
                <span key={i} className="px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
                  {formatCategory(cat)}
                </span>
              ))}
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                {college.type}
              </span>
              <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                {college.ownership}
              </span>
              {college.rating > 0 && (
                <span className="flex items-center gap-0.5 px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">
                  <span>★</span><span>{college.rating.toFixed(1)}</span>
                </span>
              )}
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-sm font-bold text-gray-900">About</h2>
                <Link href="/institute/dashboard/college/edit" className="text-accent text-xs font-medium">Edit</Link>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {college.description || "No description added yet"}
              </p>
            </div>

            {(college.naacGrade || college.nirfRank || college.aicteApproved || college.nbaAccredited) && (
              <div className="mb-3 pb-3 border-b">
                <h2 className="text-sm font-bold text-gray-900 mb-2">Accreditation</h2>
                <div className="flex flex-wrap gap-1.5">
                  {college.naacGrade && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      NAAC {college.naacGrade}
                    </span>
                  )}
                  {college.nirfRank && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      NIRF #{college.nirfRank}
                    </span>
                  )}
                  {college.aicteApproved && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      AICTE Approved
                    </span>
                  )}
                  {college.nbaAccredited && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      NBA Accredited
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ✅ NEW: Courses summary section */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-gray-900">Courses</h2>
                <Link href="/institute/dashboard/college/courses" className="text-accent text-xs font-medium">
                  {courses.length > 0 ? "Manage" : "Add"}
                </Link>
              </div>
              {courses.length > 0 ? (
                <div className="grid grid-cols-1 gap-1.5">
                  {courses.slice(0, 4).map((course, i) => (
                    <div key={i} className="px-2.5 py-2 bg-gray-50 border rounded-md">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-800 text-xs font-medium">{course.name}</span>
                      </div>
                      {(course.fees || course.duration) && (
                        <div className="flex items-center gap-3 mt-1 ml-5">
                          {course.fees && (
                            <span className="flex items-center gap-0.5 text-xs text-green-700 font-medium">
                              <IndianRupee className="w-3 h-3" />
                              {Number(course.fees).toLocaleString("en-IN")}
                            </span>
                          )}
                          {course.duration && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {course.duration}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {courses.length > 4 && (
                    <Link href="/institute/dashboard/college/courses" className="text-xs text-accent font-medium text-center py-1">
                      +{courses.length - 4} more courses
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 border-2 border-dashed rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">No courses added</p>
                  <Link href="/institute/dashboard/college/courses" className="text-accent text-xs font-medium">Add course →</Link>
                </div>
              )}
            </div>

            {/* ✅ NEW: Admissions & Placements section */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-gray-900">Admissions & Placements</h2>
                <Link href="/institute/dashboard/college/admissions" className="text-accent text-xs font-medium">
                  {hasPlacementStats ? "Manage" : "Add"}
                </Link>
              </div>
              {hasPlacementStats ? (
                <div className="grid grid-cols-3 gap-2">
                  {placements.placementPercentage && (
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-700">{placements.placementPercentage}</p>
                      <p className="text-xs text-gray-500">Placement Rate</p>
                    </div>
                  )}
                  {placements.avgPackage && (
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-700">{placements.avgPackage}</p>
                      <p className="text-xs text-gray-500">Avg. Package</p>
                    </div>
                  )}
                  {placements.highestPackage && (
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <p className="text-lg font-bold text-purple-700">{placements.highestPackage}</p>
                      <p className="text-xs text-gray-500">Highest Package</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 border-2 border-dashed rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">No admissions or placement info added</p>
                  <Link href="/institute/dashboard/college/admissions" className="text-accent text-xs font-medium">Add details →</Link>
                </div>
              )}
            </div>

            {(college.phone || college.whatsapp || college.email || college.website) && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-gray-900">Contact</h2>
                  <Link href="/institute/dashboard/college/edit" className="text-accent text-xs font-medium">Edit</Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {college.phone && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-900 truncate">{college.phone}</span>
                    </div>
                  )}
                  {college.whatsapp && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-900 truncate">{college.whatsapp}</span>
                    </div>
                  )}
                  {college.email && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg col-span-2">
                      <span className="text-xs font-medium text-gray-900 truncate">{college.email}</span>
                    </div>
                  )}
                  {college.website && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg col-span-2">
                      <a href={college.website} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-indigo-600 font-medium truncate">Visit Website</a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(college.facebook || college.instagram || college.linkedin || college.youtube) && (
              <div className="mb-3 pb-3 border-b">
                <div className="flex items-center gap-2">
                  {college.facebook && (
                    <a href={college.facebook} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {college.instagram && (
                    <a href={college.instagram} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                  {college.linkedin && (
                    <a href={college.linkedin} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ✅ NEW: Gallery section — mirrors Center's gallery pattern */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-gray-900">Photo Gallery</h2>
                <span className="text-xs text-gray-400">{college.gallery?.length || 0}/6</span>
              </div>

              {college.gallery?.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {college.gallery.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
                      <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleDeleteGalleryImage(url)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {(college.gallery?.length || 0) < 6 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                      {uploadingGallery ? (
                        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400" />
                      )}
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={handleGalleryUpload} disabled={uploadingGallery} />
                    </label>
                  )}
                </div>
              ) : (
                <label className="block text-center py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  {uploadingGallery ? (
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                  ) : (
                    <Plus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  )}
                  <p className="text-xs text-gray-500">Upload up to 6 photos</p>
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={handleGalleryUpload} disabled={uploadingGallery} />
                </label>
              )}
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                Campus and hostel details are coming soon.
              </p>
            </div>
          </div>
        </div>
      </main>

      {showLogoutModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowLogoutModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Logout?</h3>
                <p className="text-gray-600 text-sm">Are you sure you want to logout from your account?</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleLogout}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </>
  );
}