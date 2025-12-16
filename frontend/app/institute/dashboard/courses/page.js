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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const center = data.center;

      if (center) {
        setCenterId(center.id);
        setCourses(center.courses || []);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load courses. Please login again.");
      router.push("/institute/login");
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async () => {
    if (!newCourse.trim()) return;

    const token = localStorage.getItem("instituteToken");
    if (!token || !centerId) {
      alert("Please login again");
      router.push("/institute/login");
      return;
    }

    setSaving(true);

    try {
      const updatedCourses = [...courses, newCourse.trim()];

      const apiBase = process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
      const response = await fetch(`${apiBase}/api/centers/${centerId}`, {
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
      alert("Course added successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Failed to add course. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const removeCourse = async (courseName) => {
    if (!confirm(`Are you sure you want to remove "${courseName}"?`)) return;

    const token = localStorage.getItem("instituteToken");
    if (!token || !centerId) {
      alert("Please login again");
      router.push("/institute/login");
      return;
    }

    setSaving(true);

    try {
      const updatedCourses = courses.filter(c => c !== courseName);

      const apiBase = process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
      const response = await fetch(`${apiBase}/api/centers/${centerId}`, {
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
      alert("Course removed successfully!");
    } catch (error) {
      console.error("Error:", error);
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

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-gray-600 mt-1">Add or remove courses offered by your institute</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
          {/* Add Course Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Course
            </label>
            <div className="flex gap-3">
              <input
                className="border border-gray-300 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g., NEET Coaching, IIT-JEE Preparation"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={saving}
              />
              <button
                onClick={addCourse}
                disabled={saving || !newCourse.trim()}
                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          {/* Courses List */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              Current Courses ({courses.length})
            </h2>

            {courses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p>No courses added yet</p>
                <p className="text-sm mt-1">Add your first course using the form above</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {courses.map((course, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center border border-gray-200 p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <span className="font-medium text-gray-800">{course}</span>
                    <button
                      onClick={() => removeCourse(course)}
                      disabled={saving}
                      className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
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
      </main>

      <Footer />
    </>
  );
}