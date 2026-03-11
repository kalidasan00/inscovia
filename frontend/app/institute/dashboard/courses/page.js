// app/institute/dashboard/courses/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "../../../../components/Footer";
import { IndianRupee, Clock, ArrowLeft } from "lucide-react";

// ✅ Matches schema enums exactly
const CATEGORY_LABELS = {
  SCHOOL_TUITION:    "School Tuition",
  STUDY_ABROAD:      "Study Abroad",
  LANGUAGES:         "Languages",
  IT_TECHNOLOGY:     "IT & Technology",
  DESIGN_CREATIVE:   "Design & Creative",
  MANAGEMENT:        "Management",
  SKILL_DEVELOPMENT: "Skill Development",
  EXAM_COACHING:     "Exam Coaching",
};

export default function ManageCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ name: "", category: "", fees: "", duration: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [centerSlug, setCenterSlug] = useState(null);
  const [centerCategories, setCenterCategories] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingCourse, setEditingCourse] = useState({ name: "", category: "", fees: "", duration: "" });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const center = data.center;
      const institute = data.user;

      if (center) {
        setCenterSlug(center.slug);

        // Load courses from courseDetails (object array) or fallback to courses (string array)
        if (center.courseDetails && Array.isArray(center.courseDetails) && center.courseDetails.length > 0) {
          setCourses(center.courseDetails);
        } else if (center.courses?.length > 0) {
          const converted = center.courses.map(course => {
            if (course.includes(':')) {
              const [category, name] = course.split(':').map(s => s.trim());
              return { name, category, fees: null, duration: null };
            }
            return { name: course, category: institute?.primaryCategory || "", fees: null, duration: null };
          });
          setCourses(converted);
        }

        // ✅ Available categories = primary + secondary (excludes STUDY_ABROAD and SCHOOL_TUITION as primary)
        const available = [
          ...(institute?.primaryCategory && institute.primaryCategory !== "STUDY_ABROAD" && institute.primaryCategory !== "SCHOOL_TUITION"
            ? [institute.primaryCategory] : []),
          ...(institute?.secondaryCategories || [])
        ];
        setCenterCategories(available);
        if (available.length > 0) setNewCourse(prev => ({ ...prev, category: available[0] }));
      }
    } catch (error) {
      router.push("/institute/login");
    } finally {
      setLoading(false);
    }
  };

  const saveCourses = async (updatedCourses) => {
    const token = localStorage.getItem("instituteToken");
    const response = await fetch(`${API_URL}/centers/${centerSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ courses: updatedCourses })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to save");
    }
    return response.json();
  };

  const addCourse = async () => {
    if (!newCourse.name.trim()) { alert("Please enter a course name"); return; }
    if (courses.some(c => c.name === newCourse.name.trim() && c.category === newCourse.category)) {
      alert("This course already exists"); return;
    }
    setSaving(true);
    try {
      const courseToAdd = {
        name: newCourse.name.trim(),
        category: newCourse.category,
        fees: newCourse.fees ? parseInt(newCourse.fees) : null,
        duration: newCourse.duration.trim() || null
      };
      const updated = [...courses, courseToAdd];
      await saveCourses(updated);
      setCourses(updated);
      setNewCourse({ name: "", category: centerCategories[0], fees: "", duration: "" });
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (index) => {
    if (!editingCourse.name.trim()) return;
    setSaving(true);
    try {
      const updated = [...courses];
      updated[index] = {
        name: editingCourse.name.trim(),
        category: editingCourse.category,
        fees: editingCourse.fees ? parseInt(editingCourse.fees) : null,
        duration: editingCourse.duration?.trim() || null
      };
      await saveCourses(updated);
      setCourses(updated);
      setEditingIndex(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeCourse = async (index) => {
    if (!confirm("Remove this course?")) return;
    setSaving(true);
    try {
      const updated = courses.filter((_, i) => i !== index);
      await saveCourses(updated);
      setCourses(updated);
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto" />
        </div>
      </main>
    );
  }

  // Group courses by category for display
  const coursesByCategory = {};
  courses.forEach(course => {
    if (!coursesByCategory[course.category]) coursesByCategory[course.category] = [];
    coursesByCategory[course.category].push({ ...course, _originalIndex: courses.indexOf(course) });
  });

  return (
    <>
      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 pb-24 md:pb-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link href="/institute/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Manage Courses</h1>
            <p className="text-xs text-gray-500">{courses.length} course{courses.length !== 1 ? "s" : ""} added</p>
          </div>
        </div>

        {/* Add Course */}
        <div className="bg-white border rounded-xl p-4 mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Add New Course</h2>

          {/* Category selector */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {centerCategories.map(cat => (
                <button key={cat} onClick={() => setNewCourse(prev => ({ ...prev, category: cat }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    newCourse.category === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          </div>

          {/* Course name */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Course Name *</label>
            <input
              className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="e.g. Python Programming, IELTS, German A1"
              value={newCourse.name}
              onChange={e => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={e => { if (e.key === "Enter") addCourse(); }}
              disabled={saving}
            />
          </div>

          {/* Fees + Duration */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <IndianRupee className="w-3 h-3" /> Fees (Optional)
              </label>
              <input type="number"
                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="e.g. 15000"
                value={newCourse.fees}
                onChange={e => setNewCourse(prev => ({ ...prev, fees: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Duration (Optional)
              </label>
              <input
                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="e.g. 3 months"
                value={newCourse.duration}
                onChange={e => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>

          <button onClick={addCourse} disabled={saving || !newCourse.name.trim()}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
            {saving ? "Adding..." : "Add Course"}
          </button>
        </div>

        {/* Course List */}
        {courses.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <p className="text-gray-500 text-sm">No courses added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(coursesByCategory).map(([category, catCourses]) => (
              <div key={category} className="bg-white border rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-indigo-50 border-b">
                  <span className="text-xs font-bold text-indigo-700">{CATEGORY_LABELS[category] || category}</span>
                  <span className="ml-2 text-xs text-indigo-400">({catCourses.length})</span>
                </div>
                <div className="divide-y">
                  {catCourses.map((course) => {
                    const idx = course._originalIndex;
                    return (
                      <div key={idx} className="p-3">
                        {editingIndex === idx ? (
                          <div className="space-y-3">
                            <input type="text" value={editingCourse.name}
                              onChange={e => setEditingCourse(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-indigo-400 rounded-lg text-sm focus:outline-none"
                              autoFocus />
                            <div className="grid grid-cols-2 gap-2">
                              <input type="number" value={editingCourse.fees || ""}
                                onChange={e => setEditingCourse(prev => ({ ...prev, fees: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Fees" />
                              <input type="text" value={editingCourse.duration || ""}
                                onChange={e => setEditingCourse(prev => ({ ...prev, duration: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Duration" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => saveEdit(idx)} disabled={saving}
                                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                                {saving ? "Saving..." : "Save"}
                              </button>
                              <button onClick={() => setEditingIndex(null)} disabled={saving}
                                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{course.name}</p>
                              {(course.fees || course.duration) && (
                                <div className="flex items-center gap-3 mt-0.5">
                                  {course.fees && (
                                    <span className="flex items-center gap-0.5 text-xs text-green-700 font-medium">
                                      <IndianRupee className="w-3 h-3" />
                                      {course.fees.toLocaleString("en-IN")}
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
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={() => { setEditingIndex(idx); setEditingCourse({ ...course }); }}
                                disabled={saving}
                                className="px-2.5 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors">
                                Edit
                              </button>
                              <button onClick={() => removeCourse(idx)} disabled={saving}
                                className="px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors">
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}