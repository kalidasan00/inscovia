// app/institute/dashboard/college/faculty/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, User } from "lucide-react";

const EMPTY_FORM = { name: "", designation: "", qualification: "", department: "", photo: "" };

export default function FacultyTab() {
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // null = adding new
  const [form, setForm] = useState(EMPTY_FORM);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setCollege(data.college);
    } catch {
      // layout handles redirect on auth failure
    } finally {
      setLoading(false);
    }
  };

  const faculty = (() => {
    const f = college?.faculty;
    if (!f) return [];
    if (typeof f === "string") { try { return JSON.parse(f); } catch { return []; } }
    return Array.isArray(f) ? f : [];
  })();

  const openAddModal = () => {
    setEditIndex(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (index) => {
    setEditIndex(index);
    setForm({ ...EMPTY_FORM, ...faculty[index] });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setEditIndex(null);
  };

  const saveFaculty = async (nextFaculty) => {
    setSaving(true);
    const token = localStorage.getItem("instituteToken");
    try {
      const response = await fetch(`${API_URL}/colleges/${college.slug}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ faculty: nextFaculty }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Save failed");
      }
      await fetchData();
      return true;
    } catch (error) {
      alert(error.message || "Failed to save faculty. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.designation.trim()) {
      alert("Name and designation are required.");
      return;
    }

    const nextFaculty = [...faculty];
    if (editIndex === null) {
      nextFaculty.push(form);
    } else {
      nextFaculty[editIndex] = form;
    }

    const ok = await saveFaculty(nextFaculty);
    if (ok) closeModal();
  };

  const handleDelete = async (index) => {
    if (!confirm("Remove this faculty member?")) return;
    const nextFaculty = faculty.filter((_, i) => i !== index);
    await saveFaculty(nextFaculty);
  };

  if (loading || !college) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">Faculty</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1 text-accent text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {faculty.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {faculty.map((member, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 border rounded-lg">
              <div className="w-11 h-11 rounded-full bg-white border overflow-hidden flex items-center justify-center flex-shrink-0">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                <p className="text-xs text-gray-600 truncate">{member.designation}</p>
                {(member.qualification || member.department) && (
                  <p className="text-xs text-gray-400 truncate">
                    {[member.qualification, member.department].filter(Boolean).join(" • ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEditModal(i)}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(i)}
                  className="p-1.5 hover:bg-red-100 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-xs text-gray-500 mb-1">No faculty added yet</p>
          <button onClick={openAddModal} className="text-accent text-xs font-medium">
            Add faculty member →
          </button>
        </div>
      )}

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {editIndex === null ? "Add Faculty" : "Edit Faculty"}
                </h3>
                <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Dr. Jane Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Professor & Head of Department"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Ph.D. in Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Computer Science & Engineering"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Photo URL</label>
                  <input
                    type="text"
                    value={form.photo}
                    onChange={(e) => setForm({ ...form, photo: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}