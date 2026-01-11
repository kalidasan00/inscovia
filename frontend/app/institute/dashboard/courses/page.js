// app/institute/dashboard/courses/page.js - FIXED SAVE FUNCTIONALITY
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { IndianRupee, Clock } from "lucide-react";

export default function ManageCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    name: "",
    category: "",
    fees: "",
    duration: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [centerId, setCenterId] = useState(null);
  const [centerSlug, setCenterSlug] = useState(null);
  const [centerCategories, setCenterCategories] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingCourse, setEditingCourse] = useState({
    name: "",
    category: "",
    fees: "",
    duration: ""
  });

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
        setCenterSlug(center.slug);

        // Use courseDetails if available
        if (center.courseDetails && Array.isArray(center.courseDetails)) {
          setCourses(center.courseDetails);
        } else if (center.courses) {
          // Convert old format to new format
          const convertedCourses = center.courses.map(course => {
            if (course.includes(':')) {
              const [category, name] = course.split(':').map(s => s.trim());
              return { name, category, fees: null, duration: null };
            }
            return { name: course, category: center.primaryCategory, fees: null, duration: null };
          });
          setCourses(convertedCourses);
        }

        const availableCategories = [
          center.primaryCategory,
          ...(center.secondaryCategories || [])
        ];
        setCenterCategories(availableCategories);
        setNewCourse(prev => ({ ...prev, category: availableCategories[0] }));
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      router.push("/institute/login");
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async () => {
    if (!newCourse.name.trim()) {
      alert("Please enter a course name");
      return;
    }

    if (courses.some(c => c.name === newCourse.name.trim() && c.category === newCourse.category)) {
      alert("This course already exists");
      return;
    }

    const token = localStorage.getItem("instituteToken");
    setSaving(true);

    try {
      const courseToAdd = {
        name: newCourse.name.trim(),
        category: newCourse.category,
        fees: newCourse.fees ? parseInt(newCourse.fees) : null,
        duration: newCourse.duration.trim() || null
      };

      const updatedCourses = [...courses, courseToAdd];

      const response = await fetch(`${API_URL}/centers/${centerSlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courses: updatedCourses // Send as array of objects
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add course");
      }

      setCourses(updatedCourses);
      setNewCourse({ name: "", category: centerCategories[0], fees: "", duration: "" });
      alert("Course added successfully!");
    } catch (error) {
      console.error("Add course error:", error);
      alert(error.message || "Failed to add course");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingCourse({ ...courses[index] });
  };

  const saveEdit = async (index) => {
    if (!editingCourse.name.trim()) return;

    const token = localStorage.getItem("instituteToken");
    setSaving(true);

    try {
      const updatedCourses = [...courses];
      updatedCourses[index] = {
        name: editingCourse.name.trim(),
        category: editingCourse.category,
        fees: editingCourse.fees ? parseInt(editingCourse.fees) : null,
        duration: editingCourse.duration.trim() || null
      };

      const response = await fetch(`${API_URL}/centers/${centerSlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courses: updatedCourses
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update");
      }

      setCourses(updatedCourses);
      setEditingIndex(null);
      alert("Course updated successfully!");
    } catch (error) {
      console.error("Update course error:", error);
      alert(error.message || "Failed to update course");
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

      const response = await fetch(`${API_URL}/centers/${centerSlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courses: updatedCourses
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove");
      }

      setCourses(updatedCourses);
      alert("Course removed successfully!");
    } catch (error) {
      console.error("Remove course error:", error);
      alert(error.message || "Failed to remove course");
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
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Add New Course</h2>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {centerCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNewCourse(prev => ({ ...prev, category: cat }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      newCourse.category === cat
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {CATEGORIES[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-2">Course Name *</label>
              <input
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                placeholder="e.g., Python Programming"
                value={newCourse.name}
                onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <IndianRupee className="w-3 h-3 inline mr-1" />
                  Course Fees (Optional)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  placeholder="e.g., 15000"
                  value={newCourse.fees}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, fees: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Duration (Optional)
                </label>
                <input
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  placeholder="e.g., 3 months"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                  disabled={saving}
                />
              </div>
            </div>

            <button
              onClick={addCourse}
              disabled={saving || !newCourse.name.trim()}
              className="w-full px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 text-sm font-medium"
            >
              {saving ? 'Adding...' : 'Add Course'}
            </button>
          </div>

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
                {courses.map((course, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                    {editingIndex === idx ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                          <div className="flex gap-2">
                            {centerCategories.map(cat => (
                              <button
                                key={cat}
                                onClick={() => setEditingCourse(prev => ({ ...prev, category: cat }))}
                                className={`px-3 py-1 rounded text-xs font-medium ${
                                  editingCourse.category === cat
                                    ? 'bg-accent text-white'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {CATEGORIES[cat]}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Course Name</label>
                          <input
                            type="text"
                            value={editingCourse.name}
                            onChange={(e) => setEditingCourse(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-accent rounded-lg text-sm focus:outline-none"
                            autoFocus
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              <IndianRupee className="w-3 h-3 inline mr-1" />
                              Fees
                            </label>
                            <input
                              type="number"
                              value={editingCourse.fees || ""}
                              onChange={(e) => setEditingCourse(prev => ({ ...prev, fees: e.target.value }))}
                              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                              placeholder="e.g., 15000"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Duration
                            </label>
                            <input
                              type="text"
                              value={editingCourse.duration || ""}
                              onChange={(e) => setEditingCourse(prev => ({ ...prev, duration: e.target.value }))}
                              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                              placeholder="e.g., 3 months"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(idx)}
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-gray-200 rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-900">{course.name}</span>
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                {CATEGORIES[course.category]}
                              </span>
                            </div>

                            {(course.fees || course.duration) && (
                              <div className="flex items-center gap-3 text-sm">
                                {course.fees && (
                                  <div className="flex items-center gap-1 text-green-700">
                                    <IndianRupee className="w-3.5 h-3.5" />
                                    <span className="font-semibold">₹{course.fees.toLocaleString('en-IN')}</span>
                                  </div>
                                )}
                                {course.duration && (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{course.duration}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(idx)}
                              disabled={saving}
                              className="text-accent hover:text-accent/80 text-sm px-3 py-1 font-medium disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeCourse(idx)}
                              disabled={saving}
                              className="text-red-500 hover:text-red-700 text-sm px-3 py-1 font-medium disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}