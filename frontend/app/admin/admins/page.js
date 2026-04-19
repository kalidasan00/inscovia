// app/admin/admins/page.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Plus, Trash2, Power, Eye, EyeOff,
  Check, X, Loader2, ChevronDown, ChevronUp
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// ✅ All available permissions
const PERMISSION_SECTIONS = [
  { id: "dashboard",     label: "Dashboard" },
  { id: "analytics",     label: "Analytics" },
  { id: "papers",        label: "Question Papers" },
  { id: "institutes",    label: "Institutes" },
  { id: "centers",       label: "Centers" },
  { id: "users",         label: "Users" },
  { id: "notifications", label: "Notifications" },
  { id: "blog",          label: "Blog" },
  { id: "study-abroad",  label: "Study Abroad" },
  { id: "aptitude",      label: "Aptitude" },
  { id: "banners",       label: "Banners" },
];

function PermissionGrid({ permissions, onChange, disabled = false }) {
  const toggle = (section, action) => {
    const key = `${section}:${action}`;
    const updated = permissions.includes(key)
      ? permissions.filter(p => p !== key)
      : [...permissions, key];
    onChange(updated);
  };

  return (
    <div className="divide-y divide-gray-100">
      {PERMISSION_SECTIONS.map(section => {
        const hasRead  = permissions.includes(`${section.id}:read`);
        const hasWrite = permissions.includes(`${section.id}:write`);
        return (
          <div key={section.id} className="flex items-center justify-between py-2.5 px-1">
            <span className="text-sm text-gray-700 font-medium w-36">{section.label}</span>
            <div className="flex items-center gap-3">
              {/* Read */}
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <div
                  onClick={() => !disabled && toggle(section.id, "read")}
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors cursor-pointer
                    ${hasRead
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-transparent hover:border-blue-400"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-500">Read</span>
              </label>
              {/* Write */}
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <div
                  onClick={() => !disabled && toggle(section.id, "write")}
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors cursor-pointer
                    ${hasWrite
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-gray-300 text-transparent hover:border-indigo-400"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-500">Write</span>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminCard({ admin, onUpdate, onDelete }) {
  const [expanded, setExpanded]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [permissions, setPerms]   = useState(admin.permissions || []);
  const [isActive, setIsActive]   = useState(admin.isActive);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/admins/${admin.id}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions, isActive }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onUpdate(data.admin);
      showToast("Permissions saved");
      setExpanded(false);
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/admins/${admin.id}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsActive(data.admin.isActive);
      onUpdate(data.admin);
      showToast(data.admin.isActive ? "Admin activated" : "Admin deactivated");
    } catch {
      showToast("Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete admin ${admin.name}? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/admins/${admin.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      onDelete(admin.id);
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const isSuperAdmin = admin.adminRole === "SUPER_ADMIN";

  return (
    <div className={`bg-white rounded-xl border shadow-sm transition-all ${!isActive ? "opacity-60" : ""}`}>
      {toast && (
        <div className={`mx-4 mt-3 px-3 py-2 rounded-lg text-xs font-medium
          ${toast.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0
            ${isSuperAdmin ? "bg-indigo-600" : "bg-blue-500"}`}>
            {admin.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900 truncate">{admin.name}</p>
              {isSuperAdmin && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                  <Shield className="w-2.5 h-2.5" /> SUPER ADMIN
                </span>
              )}
              {!isActive && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                  INACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
            {!isSuperAdmin && (
              <p className="text-[10px] text-gray-400 mt-0.5">
                {admin.permissions?.length || 0} permission{admin.permissions?.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!isSuperAdmin && (
            <>
              <button
                onClick={handleToggleActive}
                disabled={saving}
                title={isActive ? "Deactivate" : "Activate"}
                className={`p-2 rounded-lg transition-colors
                  ${isActive
                    ? "text-green-600 hover:bg-green-50"
                    : "text-gray-400 hover:bg-gray-100"
                  }`}
              >
                <Power className="w-4 h-4" />
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                title="Edit permissions"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                title="Delete admin"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Permission Editor */}
      {expanded && !isSuperAdmin && (
        <div className="border-t border-gray-100 px-4 pt-3 pb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Permissions
          </p>
          <PermissionGrid
            permissions={permissions}
            onChange={setPerms}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setExpanded(false)}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateAdminModal({ onClose, onCreate }) {
  const [form, setForm]         = useState({ name: "", email: "", password: "", phone: "" });
  const [permissions, setPerms] = useState([]);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, permissions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create admin");
      onCreate(data.admin);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">Create New Admin</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                placeholder="+91 9999999999"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              placeholder="admin@inscovia.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 pr-9 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Permissions
            </p>
            <div className="border border-gray-200 rounded-xl px-3 py-1">
              <PermissionGrid permissions={permissions} onChange={setPerms} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-5 border-t sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageAdmins() {
  const [admins, setAdmins]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  const fetchAdmins = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        router.replace("/admin/unauthorized");
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch {
      setError("Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleUpdate = (updated) => {
    setAdmins(prev => prev.map(a => a.id === updated.id ? { ...a, ...updated } : a));
  };

  const handleDelete = (id) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
  };

  const handleCreate = (newAdmin) => {
    setAdmins(prev => [newAdmin, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {showCreate && (
        <CreateAdminModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Manage Admins
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {admins.length} admin{admins.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Admin
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-blue-600" /> Read
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-indigo-600" /> Write
        </span>
      </div>

      {/* Admin list */}
      <div className="space-y-3">
        {admins.map(admin => (
          <AdminCard
            key={admin.id}
            admin={admin}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
        {admins.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No admins yet. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}