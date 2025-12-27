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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [centerId, setCenterId] = useState(null);
  const [error, setError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // ✅ USE ENVIRONMENT VARIABLE
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

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
      console.log("Courses page data:", data);

      const center = data.center;

      if (center) {
        setCenterId(center.id);
        setCourses(center.courses || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses. Please login again.");
      setTimeout(() => {
        router.push("/institute/login");
      }, 2000);
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

    if (courses.includes(trimmedCourse)) {
      alert("This course already exists");
      return;
    }

    const token = localStorage.getItem("instituteToken");
    if (!token || !centerId) {
      alert("Please login again");
      router.push("/institute/login");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedCourses = [...courses, trimmedCourse];

      const response = await fetch(`${API_URL}/centers/${centerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courses: updatedCourses })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add course");
      }

      setCourses(updatedCourses);
      setNewCourse("");
    } catch (error) {
      console.error("Error adding course:", error);
      setError(error.message || "Failed to add course. Please try again.");
      alert(error.message || "Failed to add course. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingValue(courses[index]);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const saveEdit = async (index) => {
    const trimmedCourse = editingValue.trim();

    if (!trimmedCourse) {
      alert("Course name cannot be empty");
      return;
    }

    if (courses.includes(trimmedCourse) && trimmedCourse !== courses[index]) {
      alert("This course already exists");
      return;
    }

    const token = localStorage.getItem("instituteToken");
    if (!token || !centerId) {
      alert("Please login again");
      router.push("/institute/login");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedCourses = [...courses];
      updatedCourses[index] = trimmedCourse;

      const response = await fetch(`${API_URL}/centers/${centerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courses: updatedCourses })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update course");
      }

      setCourses(updatedCourses);
      setEditingIndex(null);
      setEditingValue("");
    } catch (error) {
      console.error("Error updating course:", error);
      setError(error.message || "Failed to update course. Please try again.");
      alert(error.message || "Failed to update course. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const removeCourse = async (index) => {
    const courseName = courses[index];
    if (!confirm(`Are you sure you want to remove "${courseName}"?`)) return;

    const token = localStorage.getItem("instituteToken");
    if (!token || !centerId) {
      alert("Please login again");
      router.push("/institute/login");
      return;
    }

    setSaving(true);
    setError(null);

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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove course");
      }

      setCourses(updatedCourses);
    } catch (error) {
      console.error("Error removing course:", error);
      setError(error.message || "Failed to remove course. Please try again.");
      alert(error.message || "Failed to remove course. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addCourse();
    }
  };

  const handleEditKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      saveEdit(index);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading courses...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error && !centerId) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Courses</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
              <p className="text-gray-600 mt-1">Add, edit, or remove courses offered by your institute</p>
            </div>
            <button
              onClick={() => router.push("/institute/dashboard")}
              className="text-accent hover:underline flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          {/* Add Course Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Course
            </label>
            <div className="flex gap-3">
              <input
                className="border border-gray-300 px-4 py-2.5 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="e.g., NEET Coaching, IIT-JEE Preparation, Spoken English"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={saving}
              />
              <button
                onClick={addCourse}
                disabled={saving || !newCourse.trim()}
                className="px-6 py-2.5 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors font-medium flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Course
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to quickly add a course
            </p>
          </div>

          {/* Courses List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-700">
                Current Courses
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                {courses.length} {courses.length === 1 ? 'course' : 'courses'}
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-base font-medium">No courses added yet</p>
                <p className="text-sm mt-1">Add your first course using the form above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {courses.map((course, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {editingIndex === idx ? (
                      <div className="flex-1 flex items-center gap-3">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => handleEditKeyPress(e, idx)}
                          className="flex-1 px-3 py-1.5 border border-accent rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                          autoFocus
                          disabled={saving}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(idx)}
                            disabled={saving}
                            className="px-3 py-1.5 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 text-sm font-medium transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={saving}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-900">{course}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(idx)}
                            disabled={saving}
                            className="text-accent hover:text-accent/80 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 hover:bg-accent/10 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeCourse(idx)}
                            disabled={saving}
                            className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 hover:bg-red-50 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips Section */}
          {courses.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Tips for managing courses:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Be specific with course names for better student discovery</li>
                    <li>Include exam names or levels (e.g., "NEET 2025 Crash Course")</li>
                    <li>Click "Edit" to update course names without removing them</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}