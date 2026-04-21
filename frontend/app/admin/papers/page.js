// app/admin/papers/page.js
"use client";
import { useState, useEffect } from "react";
import {
  FileText, Upload, Trash2, Plus, Download,
  Eye, EyeOff, AlertCircle, X, ChevronRight,
  ChevronLeft, Pencil, Check, Tag, FolderPlus
} from "lucide-react";

// ── Category Modal ────────────────────────────────────────────────────────────
function CategoryModal({ onClose, onSaved, API_URL }) {
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor]             = useState("#6b7280");
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res   = await fetch(`${API_URL}/categories`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ name: name.trim(), description, color }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");
      onSaved(data.category);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">New Exam Category</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
            <input type="text" value={name} placeholder="e.g. Engineering, Medical"
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea value={description} placeholder="Short description (optional)" rows={2}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
              <span className="text-sm text-gray-500">{color}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving
              ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Check className="w-3.5 h-3.5" />Create</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ paper, categories, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    examName:        paper.examName        || "",
    examCategoryId:  paper.examCategoryId  || "",
    subject:         paper.subject         || "",
    year:            paper.year            || new Date().getFullYear(),
    shift:           paper.shift           || "",
    language:        paper.language        || "English",
    metaTitle:       paper.metaTitle       || "",
    metaDescription: paper.metaDescription || "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-base font-bold text-gray-900">Edit Paper</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Exam Name *</label>
            <input type="text" value={form.examName} placeholder="e.g. JEE Main"
              onChange={e => setForm({ ...form, examName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
            <select value={form.examCategoryId}
              onChange={e => setForm({ ...form, examCategoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
            <input type="text" value={form.subject} placeholder="e.g. Physics"
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Year *</label>
            <input type="number" min="2000" max="2030" value={form.year}
              onChange={e => setForm({ ...form, year: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Shift</label>
            <input type="text" value={form.shift} placeholder="e.g. Shift 1"
              onChange={e => setForm({ ...form, shift: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
            <select value={form.language}
              onChange={e => setForm({ ...form, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>English</option>
              <option>Hindi</option>
              <option>English & Hindi</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              SEO Title <span className="text-gray-400 font-normal">(leave blank to auto-generate)</span>
            </label>
            <input type="text" value={form.metaTitle} placeholder="Auto-generated if empty"
              onChange={e => setForm({ ...form, metaTitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              SEO Description <span className="text-gray-400 font-normal">(leave blank to auto-generate)</span>
            </label>
            <textarea value={form.metaDescription} placeholder="Auto-generated if empty" rows={2}
              onChange={e => setForm({ ...form, metaDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={() => onSave(form)} disabled={saving || !form.examName || !form.examCategoryId}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving
              ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Check className="w-3.5 h-3.5" />Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminPapers() {
  const [papers, setPapers]               = useState([]);
  const [categories, setCategories]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [uploading, setUploading]         = useState(false);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState(null);
  const [success, setSuccess]             = useState(null);
  const [showForm, setShowForm]           = useState(false);
  const [showCatModal, setShowCatModal]   = useState(false);
  const [editPaper, setEditPaper]         = useState(null);

  // Drill-down
  const [level, setLevel]                           = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedExam, setSelectedExam]             = useState(null);

  const [form, setForm] = useState({
    examName: "", examCategoryId: "", subject: "",
    year: new Date().getFullYear(), shift: "", language: "English",
    metaTitle: "", metaDescription: "",
  });
  const [pdfFile, setPdfFile] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };

  useEffect(() => {
    fetchCategories();
    fetchPapers();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res   = await fetch(`${API_URL}/categories/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      setError("Failed to load categories");
    }
  };

  const fetchPapers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res   = await fetch(`${API_URL}/papers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPapers(data.papers || []);
    } catch {
      setError("Failed to load papers");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (id, name) => {
    if (!confirm(`Delete category "${name}"? Papers under this category will lose their category.`)) return;
    const token = localStorage.getItem("adminToken");
    fetch(`${API_URL}/categories/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(prev => prev.filter(c => c.id !== id));
          showSuccess("Category deleted.");
        } else setError(data.error || "Delete failed");
      })
      .catch(() => setError("Delete failed"));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) { setError("Please select a PDF file"); return; }
    setUploading(true);
    setError(null);
    const token    = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("pdf", pdfFile);
    Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
    try {
      const res  = await fetch(`${API_URL}/papers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      showSuccess("Paper uploaded successfully!");
      setShowForm(false);
      setPdfFile(null);
      setForm({ examName: "", examCategoryId: "", subject: "", year: new Date().getFullYear(), shift: "", language: "English", metaTitle: "", metaDescription: "" });
      fetchPapers();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditSave = async (updatedForm) => {
    if (!editPaper) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res   = await fetch(`${API_URL}/papers/${editPaper.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          examName:        updatedForm.examName,
          examCategoryId:  updatedForm.examCategoryId,
          subject:         updatedForm.subject        || null,
          year:            parseInt(updatedForm.year),
          shift:           updatedForm.shift          || null,
          language:        updatedForm.language,
          metaTitle:       updatedForm.metaTitle       || null,
          metaDescription: updatedForm.metaDescription || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setPapers(prev => prev.map(p => p.id === editPaper.id ? data.paper : p));
      setEditPaper(null);
      showSuccess("Paper updated!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    if (!confirm(`Delete "${name}"? This also removes the PDF from Cloudinary.`)) return;
    const token = localStorage.getItem("adminToken");
    fetch(`${API_URL}/papers/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.success) { setPapers(prev => prev.filter(p => p.id !== id)); showSuccess("Paper deleted."); }
        else setError(data.error || "Delete failed");
      })
      .catch(() => setError("Delete failed"));
  };

  const handleToggle = (id, isActive) => {
    const token = localStorage.getItem("adminToken");
    fetch(`${API_URL}/papers/${id}/toggle`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        setPapers(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
        showSuccess(`Paper ${isActive ? "hidden" : "shown"}.`);
      })
      .catch(() => setError("Failed to update status"));
  };

  const allGrouped = papers.reduce((acc, p) => {
    const catId = p.examCategoryId;
    if (!acc[catId]) acc[catId] = {};
    if (!acc[catId][p.examName]) acc[catId][p.examName] = [];
    acc[catId][p.examName].push(p);
    return acc;
  }, {});

  const goLevel1 = () => { setLevel(1); setSelectedCategoryId(null); setSelectedExam(null); };
  const goLevel2 = (catId) => { setLevel(2); setSelectedCategoryId(catId); setSelectedExam(null); };
  const goLevel3 = (exam) => { setLevel(3); setSelectedExam(exam); };

  const currentPapers = level === 3
    ? (allGrouped[selectedCategoryId]?.[selectedExam] || []).sort((a, b) => b.year - a.year)
    : [];

  const selectedCategoryObj = categories.find(c => c.id === selectedCategoryId);

  return (
    <>
      {showCatModal && (
        <CategoryModal
          API_URL={API_URL}
          onClose={() => setShowCatModal(false)}
          onSaved={(cat) => {
            setCategories(prev => [...prev, cat]);
            showSuccess(`Category "${cat.name}" created!`);
          }}
        />
      )}

      {editPaper && (
        <EditModal
          paper={editPaper}
          categories={categories}
          onSave={handleEditSave}
          onClose={() => setEditPaper(null)}
          saving={saving}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Question Papers</h2>
          <p className="text-sm text-gray-500 mt-1">{papers.length} papers total</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCatModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium border border-gray-200">
            <FolderPlus className="w-4 h-4" />Add Category
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" />Upload Paper
          </button>
        </div>
      </div>

      {/* ── Categories Strip ─────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {categories.map(cat => {
            const paperCount = Object.values(allGrouped[cat.id] || {}).flat().length;
            return (
              <div key={cat.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-700 group">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                {cat.name}
                {paperCount > 0 && (
                  <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full text-[10px]">{paperCount}</span>
                )}
                <button onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="ml-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
          <button onClick={() => setShowCatModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-xs text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors">
            <Plus className="w-3 h-3" />New
          </button>
        </div>
      )}

      {/* No categories notice */}
      {categories.length === 0 && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <Tag className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">No categories yet</p>
            <p className="text-xs text-amber-600 mt-0.5">Create a category first before uploading papers.</p>
          </div>
          <button onClick={() => setShowCatModal(true)}
            className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600">
            Add Category
          </button>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />{success}
        </div>
      )}

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Upload New Paper</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Exam Name *</label>
                <input type="text" placeholder="e.g. JEE Main, UPSC CSE" value={form.examName} required
                  onChange={e => setForm({ ...form, examName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                <div className="flex gap-2">
                  <select value={form.examCategoryId} required
                    onChange={e => setForm({ ...form, examCategoryId: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select category</option>
                    {categories.filter(c => c.isActive).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowCatModal(true)}
                    className="px-2 py-2 border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-400 transition-colors" title="Add new category">
                    <FolderPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                <input type="text" placeholder="e.g. Physics" value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Year *</label>
                <input type="number" min="2000" max="2030" value={form.year} required
                  onChange={e => setForm({ ...form, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Shift</label>
                <input type="text" placeholder="e.g. Shift 1" value={form.shift}
                  onChange={e => setForm({ ...form, shift: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
                <select value={form.language}
                  onChange={e => setForm({ ...form, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>English</option>
                  <option>Hindi</option>
                  <option>English & Hindi</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">PDF File *</label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])}
                  className="hidden" id="pdf-upload" />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  {pdfFile
                    ? <p className="text-sm font-medium text-green-600">{pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)</p>
                    : <p className="text-sm text-gray-400">Click to upload PDF</p>}
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={uploading}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm">
                {uploading
                  ? <><div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />Uploading...</>
                  : <><Upload className="w-3.5 h-3.5" />Upload</>}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setPdfFile(null); }}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto" />
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No papers yet</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-blue-600 font-medium text-sm hover:underline">
            Upload first paper →
          </button>
        </div>
      ) : (
        <>
          {/* Level 1: Category grid */}
          {level === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.filter(cat => allGrouped[cat.id]).map(cat => {
                const examCount  = Object.keys(allGrouped[cat.id] || {}).length;
                const paperCount = Object.values(allGrouped[cat.id] || {}).flat().length;
                return (
                  <button key={cat.id} onClick={() => goLevel2(cat.id)}
                    className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-sm hover:border-gray-300 transition-all group">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white mb-3"
                      style={{ backgroundColor: cat.color }}>
                      {cat.name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {examCount} exam{examCount !== 1 ? "s" : ""} · {paperCount} paper{paperCount !== 1 ? "s" : ""}
                    </p>
                    <div className="mt-3 h-0.5 rounded-full w-8 group-hover:w-full transition-all"
                      style={{ backgroundColor: cat.color }} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Level 2: Exams list */}
          {level === 2 && selectedCategoryId && (
            <div>
              <button onClick={goLevel1}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 mb-4 transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" /> All Categories
              </button>
              <h3 className="text-base font-bold text-gray-900 mb-3">{selectedCategoryObj?.name}</h3>
              <div className="flex flex-col gap-2">
                {Object.entries(allGrouped[selectedCategoryId] || {}).map(([examName, examPapers]) => {
                  const years       = [...new Set(examPapers.map(p => p.year))].sort((a, b) => b - a);
                  const activeCount = examPapers.filter(p => p.isActive).length;
                  return (
                    <button key={examName} onClick={() => goLevel3(examName)}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 hover:shadow-sm transition-all text-left">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{ backgroundColor: selectedCategoryObj?.color || "#6b7280" }}>
                        {examName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{examName}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {examPapers.length} paper{examPapers.length !== 1 ? "s" : ""}
                          {years.length > 1 ? ` · ${years[years.length - 1]}–${years[0]}` : ` · ${years[0]}`}
                          {` · ${activeCount} active`}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Level 3: Papers table */}
          {level === 3 && selectedCategoryId && selectedExam && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
                <button onClick={goLevel1} className="hover:text-gray-600">Categories</button>
                <ChevronRight className="w-3 h-3" />
                <button onClick={() => goLevel2(selectedCategoryId)} className="hover:text-gray-600">
                  {selectedCategoryObj?.name}
                </button>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-700 font-medium">{selectedExam}</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Paper</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Language</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Size</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Downloads</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentPapers.map(paper => (
                        <tr key={paper.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">
                              {paper.year}
                              {paper.shift && <span className="text-gray-400 font-normal"> · {paper.shift}</span>}
                            </p>
                            {paper.subject && <p className="text-xs text-gray-400 mt-0.5">{paper.subject}</p>}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{paper.language}</td>
                          <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{paper.fileSize || "—"}</td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="flex items-center gap-1 text-xs text-gray-600">
                              <Download className="w-3 h-3" />{paper.downloads ?? 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              paper.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {paper.isActive ? "Active" : "Hidden"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors" title="View PDF">
                                <Eye className="w-4 h-4" />
                              </a>
                              <button onClick={() => setEditPaper(paper)}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors" title="Edit">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleToggle(paper.id, paper.isActive)}
                                className="p-1.5 text-gray-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition-colors"
                                title={paper.isActive ? "Hide" : "Show"}>
                                {paper.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button onClick={() => handleDelete(paper.id, `${paper.examName} ${paper.year}`)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}