// app/admin/categories/page.js
"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, AlertCircle, EyeOff, Eye, GripVertical } from "lucide-react";

function CategoryModal({ category, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    name:        category?.name        || "",
    description: category?.description || "",
    color:       category?.color       || "#6b7280",
    sortOrder:   category?.sortOrder   ?? 0,
  });

  const isEdit = !!category;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {isEdit ? "Edit Category" : "Add Category"}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Engineering, Medical, Banking"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description — used for SEO meta */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description <span className="text-gray-400 font-normal">(used for SEO)</span>
            </label>
            <textarea
              placeholder="e.g. Previous year question papers for Engineering entrance exams like JEE, BITSAT..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Color */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="#6b7280"
                />
              </div>
            </div>

            {/* Sort order */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sort Order</label>
              <input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">Lower = shown first</p>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-500">Preview:</span>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: form.color }}
            >
              {form.name || "Category Name"}
            </span>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.name.trim()}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving
              ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
              : <><Check className="w-3.5 h-3.5" />{isEdit ? "Save Changes" : "Create Category"}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [editCategory, setEditCategory] = useState(null); // null = add, object = edit

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  useEffect(() => { fetchCategories(); }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    setSaving(true);
    setError(null);
    const token  = localStorage.getItem("adminToken");
    const isEdit = !!editCategory;
    const url    = isEdit
      ? `${API_URL}/categories/${editCategory.id}`
      : `${API_URL}/categories`;

    try {
      const res  = await fetch(url, {
        method:  isEdit ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      showSuccess(isEdit ? "Category updated!" : "Category created!");
      setShowModal(false);
      setEditCategory(null);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (cat) => {
    const token = localStorage.getItem("adminToken");
    try {
      await fetch(`${API_URL}/categories/${cat.id}/toggle`, {
        method:  "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(prev =>
        prev.map(c => c.id === cat.id ? { ...c, isActive: !c.isActive } : c)
      );
      showSuccess(`Category ${cat.isActive ? "hidden" : "shown"}.`);
    } catch {
      setError("Failed to update status");
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.\n\nNote: categories with papers cannot be deleted.`)) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res  = await fetch(`${API_URL}/categories/${cat.id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
      showSuccess("Category deleted.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      {showModal && (
        <CategoryModal
          category={editCategory}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditCategory(null); }}
          saving={saving}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exam Categories</h2>
          <p className="text-sm text-gray-500 mt-1">
            {categories.length} categories · manages dropdowns across the app
          </p>
        </div>
        <button
          onClick={() => { setEditCategory(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Category
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
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />{success}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-sm mb-3">No categories yet</p>
          <button
            onClick={() => { setEditCategory(null); setShowModal(true); }}
            className="text-blue-600 font-medium text-sm hover:underline"
          >
            Add your first category →
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Papers</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 ml-5 font-mono">{cat.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-gray-500 truncate max-w-[220px]">
                      {cat.description || <span className="text-gray-300 italic">No description</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-gray-700">
                      {cat.paperCount ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-xs text-gray-500">
                    {cat.sortOrder}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {cat.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditCategory(cat); setShowModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggle(cat)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition-colors"
                        title={cat.isActive ? "Hide" : "Show"}
                      >
                        {cat.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Delete"
                        disabled={cat.paperCount > 0}
                      >
                        <Trash2 className={`w-4 h-4 ${cat.paperCount > 0 ? "opacity-30 cursor-not-allowed" : ""}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}