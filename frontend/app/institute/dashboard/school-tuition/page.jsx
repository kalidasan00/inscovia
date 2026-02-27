"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "../../../../components/Footer";
import { X, Plus, ArrowLeft, Save } from "lucide-react";

const BOARDS = ["CBSE", "ICSE", "State Board", "IGCSE", "IB"];

const CLASSES = [
  "LKG", "UKG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Plus One", "Plus Two"
];

const POPULAR_SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "English", "Malayalam", "Hindi", "Social Science",
  "Computer Science", "Accountancy", "Economics", "Business Studies"
];

const SPECIAL_PROGRAMS = [
  "Olympiad Training", "Scholarship Exam Prep", "Spoken English",
  "Handwriting Classes", "Abacus", "Drawing & Art",
  "Summer Camp", "Holiday Batches", "Crash Course", "Doubt Clearing Sessions"
];

export default function SchoolTuitionManage() {
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [specialPrograms, setSpecialPrograms] = useState([]);
  const [studentsCount, setStudentsCount] = useState("");
  const [batchSize, setBatchSize] = useState("");
  const [feeRange, setFeeRange] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newClass, setNewClass] = useState("");

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      if (data.user?.primaryCategory !== "SCHOOL_TUITION") {
        router.push("/institute/dashboard");
        return;
      }

      // Load from courseDetails JSON field
      const cd = data.center?.courseDetails || [];
      const meta = data.center?.schoolMeta || {};

      setCenter(data.center);
      setBoards(meta.boards || []);
      setClasses(meta.classes || []);
      setSubjects(meta.subjects || []);
      setSpecialPrograms(meta.specialPrograms || []);
      setStudentsCount(meta.studentsCount || "");
      setBatchSize(meta.batchSize || "");
      setFeeRange(meta.feeRange || "");
    } catch {
      router.push("/institute/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    const token = localStorage.getItem("instituteToken");

    try {
      const res = await fetch(`${API_URL}/centers/${center.slug}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courses: [...classes, ...subjects], // for search indexing
          services: specialPrograms,
          courseDetails: {
            boards,
            classes,
            subjects,
            specialPrograms,
            studentsCount: studentsCount || null,
            batchSize: batchSize || null,
            feeRange: feeRange || null,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (list, setList, value) => {
    setList(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const addCustom = (value, list, setList, setValue) => {
    const val = value.trim();
    if (!val || list.includes(val)) return;
    setList(prev => [...prev, val]);
    setValue("");
  };

  const remove = (list, setList, value) => {
    setList(prev => prev.filter(v => v !== value));
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

  return (
    <>
      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 pb-24 md:pb-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link href="/institute/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Manage School Tuition Profile</h1>
            <p className="text-xs text-gray-500">Add boards, classes, subjects and programs</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">Saved successfully!</div>
        )}

        <div className="space-y-5">

          {/* Boards */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Boards You Cover</h2>
            <div className="flex flex-wrap gap-2">
              {BOARDS.map(b => (
                <button key={b} onClick={() => toggle(boards, setBoards, b)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                    boards.includes(b)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Classes */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Classes You Teach</h2>

            {classes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {classes.map(c => (
                  <span key={c} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    {c}
                    <button onClick={() => remove(classes, setClasses, c)} className="hover:text-indigo-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mb-3">
              {CLASSES.map(c => (
                <button key={c} onClick={() => toggle(classes, setClasses, c)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                    classes.includes(c)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                  }`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input type="text" value={newClass} onChange={e => setNewClass(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustom(newClass, classes, setClasses, setNewClass)}
                placeholder="Add custom class..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={() => addCustom(newClass, classes, setClasses, setNewClass)}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Subjects Offered</h2>

            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {subjects.map(s => (
                  <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {s}
                    <button onClick={() => remove(subjects, setSubjects, s)} className="hover:text-green-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {POPULAR_SUBJECTS.map(s => (
                <button key={s} onClick={() => toggle(subjects, setSubjects, s)}
                  className={`px-3 py-2 border-2 rounded-lg text-xs font-medium text-left transition-all ${
                    subjects.includes(s)
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  }`}>
                  <div className="flex items-center justify-between">
                    <span>{s}</span>
                    {subjects.includes(s) && (
                      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustom(newSubject, subjects, setSubjects, setNewSubject)}
                placeholder="Add other subject..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={() => addCustom(newSubject, subjects, setSubjects, setNewSubject)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Special Programs */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Special Programs</h2>
            <div className="grid grid-cols-2 gap-2">
              {SPECIAL_PROGRAMS.map(p => (
                <button key={p} onClick={() => toggle(specialPrograms, setSpecialPrograms, p)}
                  className={`px-3 py-2.5 border-2 rounded-lg text-xs font-medium text-left transition-all ${
                    specialPrograms.includes(p)
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  }`}>
                  <div className="flex items-center justify-between">
                    <span>{p}</span>
                    {specialPrograms.includes(p) && (
                      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Total Students</label>
                <input type="number" value={studentsCount} onChange={e => setStudentsCount(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Batch Size</label>
                <input type="text" value={batchSize} onChange={e => setBatchSize(e.target.value)}
                  placeholder="e.g. 15-20 students"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Fee Range (monthly)</label>
                <input type="text" value={feeRange} onChange={e => setFeeRange(e.target.value)}
                  placeholder="e.g. Rs. 500 - 2000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>
      </main>
      <Footer />
    </>
  );
}