// app/admin/papers/page.js
"use client";
import { useState, useEffect } from "react";
import {
  FileText, Upload, Trash2, Plus, Download,
  Eye, EyeOff, AlertCircle, X
} from "lucide-react";

const EXAM_CATEGORIES = [
  "Engineering", "Medical", "Civil Services", "Banking",
  "SSC & Railway", "Defence", "Law", "Management", "State PSC", "Teaching"
];

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <p className="text-gray-800 font-medium mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [confirm, setConfirm] = useState(null); // { message, onConfirm }

  const [form, setForm] = useState({
    examName: "", examCategory: "", subject: "",
    year: new Date().getFullYear(), shift: "", language: "English",
  });
  const [pdfFile, setPdfFile] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => { fetchPapers(); }, []);

  const fetchPapers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/papers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPapers(data.papers || []);
    } catch {
      setError("Failed to load papers");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) { setError("Please select a PDF file"); return; }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("pdf", pdfFile);
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    formData.append("fileSize", `${(pdfFile.size / 1024 / 1024).toFixed(1)} MB`);

    try {
      const res = await fetch(`${API_URL}/papers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setSuccess("Paper uploaded successfully!");
      setShowForm(false);
      setPdfFile(null);
      setForm({ examName: "", examCategory: "", subject: "", year: new Date().getFullYear(), shift: "", language: "English" });
      fetchPapers();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id, name) => {
    setConfirm({
      message: `Delete "${name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        const token = localStorage.getItem("adminToken");
        try {
          const res = await fetch(`${API_URL}/papers/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Delete failed");
          setSuccess("Paper deleted.");
          fetchPapers();
        } catch (err) {
          setError(err.message);
        }
      }
    });
  };

  const handleToggle = (id, isActive) => {
    setConfirm({
      message: `${isActive ? "Hide" : "Show"} this paper?`,
      onConfirm: async () => {
        setConfirm(null);
        const token = localStorage.getItem("adminToken");
        try {
          await fetch(`${API_URL}/papers/${id}/toggle`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchPapers();
        } catch {
          setError("Failed to update status");
        }
      }
    });
  };

  const filtered = filterCategory === "All"
    ? papers
    : papers.filter(p => p.examCategory === filterCategory);

  return (
    <>
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Question Papers</h2>
          <p className="text-sm text-gray-500 mt-1">{papers.length} papers uploaded</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Upload Paper
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center justify-between">
          {success}
          <button onClick={() => setSuccess(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Paper</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Exam Name *", key: "examName", placeholder: "e.g. JEE Main, UPSC CSE", required: true },
                { label: "Subject", key: "subject", placeholder: "e.g. Physics, General Awareness" },
                { label: "Shift", key: "shift", placeholder: "e.g. Shift 1, Morning" },
              ].map(({ label, key, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required={required}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={form.examCategory}
                  onChange={e => setForm({ ...form, examCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select category</option>
                  {EXAM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                <input
                  type="number" min="2000" max="2030"
                  value={form.year}
                  onChange={e => setForm({ ...form, year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={form.language}
                  onChange={e => setForm({ ...form, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>English & Hindi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PDF File *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])} className="hidden" id="pdf-upload" />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  {pdfFile
                    ? <p className="text-sm font-medium text-green-600">{pdfFile.name}</p>
                    : <p className="text-sm text-gray-500">Click to upload PDF</p>
                  }
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {uploading
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Uploading...</>
                  : <><Upload className="w-4 h-4" />Upload</>
                }
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["All", ...EXAM_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
              ${filterCategory === cat
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No papers found</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-primary font-medium text-sm">Upload your first paper →</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Exam</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Year</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Downloads</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(paper => (
                  <tr key={paper.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{paper.examName}</p>
                      {paper.subject && <p className="text-xs text-gray-500">{paper.subject}</p>}
                      {paper.shift && <p className="text-xs text-gray-400">{paper.shift}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">{paper.examCategory}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{paper.year}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Download className="w-3.5 h-3.5" />{paper.downloads}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paper.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {paper.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="View PDF">
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleToggle(paper.id, paper.isActive)}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 transition-colors"
                          title="Toggle visibility"
                        >
                          {paper.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(paper.id, paper.examName)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
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
      )}
    </>
  );
}