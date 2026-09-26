// app/institute/dashboard/college/courses/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../../../components/Footer";
import { Plus, X, IndianRupee, Clock, Users, Trash2, Pencil } from "lucide-react";

const emptyCourse = { name: "", duration: "", seats: "", fees: "", degreeLevel: "" };

const DEGREE_LEVELS = [
  { value: "UG",       label: "Undergraduate (UG)" },
  { value: "PG",       label: "Postgraduate (PG)" },
  { value: "DIPLOMA",  label: "Diploma" },
  { value: "CERTIFICATE", label: "Certificate" },
  { value: "PHD",      label: "PhD" },
];

export default function CollegeCoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collegeSlug, setCollegeSlug] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(emptyCourse);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();

      if (!data.college) {
        router.push("/institute/dashboard/courses");
        return;
      }

      setCollegeSlug(data.college.slug);

      let parsedCourses = data.college.courses;
      if (typeof parsedCourses === "string") {
        try { parsedCourses = JSON.parse(parsedCourses); } catch { parsedCourses = []; }
      }
      setCourses(Array.isArray(parsedCourses) ? parsedCourses : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveCourses = async (updatedCourses) => {
    setSaving(true);
    setError(null);
    const token = localStorage.getItem("instituteToken");
    try {
      const res = await fetch(`${API_URL}/colleges/${collegeSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courses: updatedCourses }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save courses");
      }
      setCourses(updatedCourses);
      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save courses. Please try again.");
      alert(err.message || "Failed to save courses. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openAddForm = () => {
    setForm(emptyCourse);
    setEditingIndex(null);
    setShowForm(true);
  };

  const openEditForm = (index) => {
    setForm({ ...emptyCourse, ...courses[index] });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { alert("Course name is required"); return; }

    const updated = [...courses];
    const courseData = {
      name: form.name.trim(),
      duration: form.duration.trim(),
      seats: form.seats ? parseInt(form.seats) : null,
      fees: form.fees ? parseInt(form.fees) : null,
      degreeLevel: form.degreeLevel || null,
    };

    if (editingIndex !== null) {
      updated[editingIndex] = courseData;
    } else {
      updated.push(courseData);
    }

    const ok = await saveCourses(updated);
    if (ok) {
      setShowForm(false);
      setForm(emptyCourse);
      setEditingIndex(null);
    }
  };

  const handleDelete = async (index) => {
    if (!confirm("Delete this course?")) return;
    const updated = courses.filter((_, i) => i !== index);
    await saveCourses(updated);
  };

  const formatDegreeLevel = (value) => {
    return DEGREE_LEVELS.find(d => d.value === value)?.label.split(" (")[0] || value;
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">Manage the courses offered by your college</p>
        </div>
        <button onClick={openAddForm}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed">
          <Plus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">No courses added yet</p>
          <p className="text-sm text-gray-500 mb-4">Add your first course to help students find you</p>
          <button onClick={openAddForm}
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
            Add Course
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {courses.map((course, i) => (
            <div key={i} className="flex items-center justify-between gap-3 bg-white rounded-lg border p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{course.name}</h3>
                  {course.degreeLevel && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">
                      {formatDegreeLevel(course.degreeLevel)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                  {course.duration && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" /> {course.duration}
                    </span>
                  )}
                  {course.seats && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3.5 h-3.5" /> {course.seats} seats
                    </span>
                  )}
                  {course.fees && (
                    <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                      <IndianRupee className="w-3.5 h-3.5" /> {Number(course.fees).toLocaleString("en-IN")}/yr
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEditForm(i)}
                  className="p-2 text-gray-500 hover:text-accent hover:bg-gray-50 rounded-lg transition-colors" title="Edit">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(i)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add/Edit modal ── */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowForm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingIndex !== null ? "Edit Course" : "Add Course"}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="name" value={form.name} onChange={handleFormChange} required
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree Level</label>
                  <select name="degreeLevel" value={form.degreeLevel} onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-white">
                    <option value="">Select Level</option>
                    {DEGREE_LEVELS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input type="text" name="duration" value={form.duration} onChange={handleFormChange}
                      placeholder="e.g. 4 years"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                    <input type="number" name="seats" value={form.seats} onChange={handleFormChange} min="0"
                      placeholder="e.g. 60"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Fees (₹)</label>
                  <input type="number" name="fees" value={form.fees} onChange={handleFormChange} min="0"
                    placeholder="e.g. 120000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} disabled={saving}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2 transition-colors">
                    {saving ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Saving...</>
                    ) : editingIndex !== null ? "Save Changes" : "Add Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <Footer />
    </main>
  );
}