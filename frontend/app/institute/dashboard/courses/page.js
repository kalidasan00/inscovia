// app/institute/dashboard/courses/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

export default function ManageCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // Selected category chip
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [centerId, setCenterId] = useState(null);
  const [centerCategories, setCenterCategories] = useState([]);
  const [error, setError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingCategory, setEditingCategory] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const CATEGORIES = {
    TECHNOLOGY: "Technology",
    MANAGEMENT: "Management",
    SKILL_DEVELOPMENT: "Skill Development",
    EXAM_COACHING: "Exam Coaching"
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) {
      router.push("/institute/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const center = data.center;

      if (center) {
        setCenterId(center.id);
        setCourses(center.courses || []);

        const availableCategories = [
          center.primaryCategory,
          ...(center.secondaryCategories || [])
        ];
        setCenterCategories(availableCategories);
        setSelectedCategory(availableCategories[0]); // Auto-select first category
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      router.push("/institute/login");
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async () => {
    const trimmedCourse = newCourse.trim();

    if (!trimmedCourse) {
      alert("Please enter a course name");
      return;
    }

    const courseWithCategory = `${selectedCategory}: ${trimmedCourse}`;

    if (courses.includes(courseWithCategory)) {
      alert("This course already exists");
      return;
    }

    const token = localStorage.getItem("instituteToken");
    setSaving(true);

    try {
      const updatedCourses = [...courses, courseWithCategory];

      const response = await fetch(`${API_URL}/centers/${centerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courses: updatedCourses })
      });

      if (!response.ok) throw new Error("Failed to add course");

      setCourses(updatedCourses);
      setNewCourse("");
    } catch (error) {
      alert("Failed to add course");
    } finally {
      setSaving(false);
    }
  };

  const parseCourse = (courseString) => {
    if (courseString.includes(':')) {
      const [category, courseName] = courseString.split(':').map(s => s.trim());
      return { category, courseName };
    }
    return { category: null, courseName: courseString };
  };

  const startEditing = (index) => {
    const { category, courseName } = parseCourse(courses[index]);
    setEditingIndex(index);
    setEditingValue(courseName);
    setEditingCategory(category || centerCategories[0]);
  };

  const saveEdit = async (index) => {
    const trimmedCourse = editingValue.trim();
    if (!trimmedCourse) return;

    const courseWithCategory = `${editingCategory}: ${trimmedCourse}`;
    const token = localStorage.getItem("instituteToken");
    setSaving(true);

    try {
      const updatedCourses = [...courses];
      updatedCourses[index] = courseWithCategory;

      const response = await fetch(`${API_URL}/centers/${centerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courses: updatedCourses })
      });

      if (!response.ok) throw new Error("Failed to update");

      setCourses(updatedCourses);
      setEditingIndex(null);
    } catch (error) {
      alert("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const removeCourse = async (index) => {
    if (!confirm("Remove this course?")) return;

    const token = localStorage.getItem("instituteToken");
    setSaving(true);

    try {
      const updatedCourses = courses.filter((_, i) => i !== index);

      const response = await fetch(`${API_URL}/centers/${centerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courses: updatedCourses })
      });

      if (!response.ok) throw new Error("Failed to remove");

      setCourses(updatedCourses);
    } catch (error) {
      alert("Failed to remove course");
    } finally {
      setSaving(false);
    }
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

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
          <button
            onClick={() => router.push("/institute/dashboard")}
            className="text-accent hover:text-accent/80 text-sm font-medium"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-lg border p-6">
          {/* Add Course Section */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Add New Course</h2>

            {/* Category Chips */}
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {centerCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {CATEGORIES[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <input
                className="flex-1 border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                placeholder="Enter course name (e.g., Python Programming)"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCourse()}
                disabled={saving}
              />
              <button
                onClick={addCourse}
                disabled={saving || !newCourse.trim()}
                className="px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 text-sm font-medium"
              >
                {saving ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          {/* Courses List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-900">
                Courses ({courses.length})
              </h2>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-gray-500 text-sm">No courses added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {courses.map((course, idx) => {
                  const { category, courseName } = parseCourse(course);

                  return (
                    <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50">
                      {editingIndex === idx ? (
                        <div className="space-y-2">
                          {/* Category chips for editing */}
                          <div className="flex gap-2">
                            {centerCategories.map(cat => (
                              <button
                                key={cat}
                                onClick={() => setEditingCategory(cat)}
                                className={`px-3 py-1 rounded text-xs font-medium ${
                                  editingCategory === cat
                                    ? 'bg-accent text-white'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {CATEGORIES[cat]}
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && saveEdit(idx)}
                              className="flex-1 px-3 py-1.5 border border-accent rounded-lg text-sm focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEdit(idx)}
                              className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="px-3 py-1.5 bg-gray-200 rounded-lg text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{courseName}</span>
                            {category && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                {CATEGORIES[category]}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(idx)}
                              className="text-accent hover:text-accent/80 text-sm px-3 py-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeCourse(idx)}
                              className="text-red-500 hover:text-red-700 text-sm px-3 py-1"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Save All Button */}
          {courses.length > 0 && (
            <div className="mt-6 pt-6 border-t flex justify-end">
              <button
                onClick={() => alert('All changes are saved automatically!')}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All Saved
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}