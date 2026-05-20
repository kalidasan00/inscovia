// app/admin/institutes/page.js
"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2, Check, X, Eye, Search,
  CheckCircle, XCircle, MapPin, Trash2, AlertTriangle
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = "Confirm", confirmClass = "bg-red-600 hover:bg-red-700" }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <p className="text-gray-800 font-medium mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${confirmClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function DeleteInstituteModal({ institute, onConfirm, onCancel }) {
  const [typed, setTyped] = useState("");
  const centersCount = institute._count?.centers || 0;
  const membersCount = institute._count?.members || 0;
  const canDelete = typed === "DELETE";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Delete Institute</h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Institute</span>
            <span className="text-sm font-semibold text-gray-900">{institute.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Centers</span>
            <span className="text-sm font-semibold text-red-600">{centersCount} will be deleted</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Members</span>
            <span className="text-sm font-semibold text-red-600">{membersCount} will be removed</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">City</span>
            <span className="text-sm text-gray-700">{institute.city}, {institute.state}</span>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-red-700 font-medium">This will permanently delete:</p>
          <ul className="text-xs text-red-600 mt-1 space-y-0.5 list-disc list-inside">
            <li>The organization and all its data</li>
            <li>All {centersCount} center listing(s)</li>
            <li>All reviews, gallery images, banners</li>
            <li>All team member access</li>
          </ul>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Type <span className="font-bold text-red-600">DELETE</span> to confirm
          </label>
          <input type="text" value={typed} onChange={e => setTyped(e.target.value)}
            placeholder="Type DELETE here"
            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-400 font-mono" />
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={!canDelete}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Delete Everything
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailsModal({ institute, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Institute Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Institute Name</label>
            <p className="text-gray-900 mt-1 font-medium">{institute.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">City</label>
              <p className="text-gray-900 mt-1">{institute.city}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">State</label>
              <p className="text-gray-900 mt-1">{institute.state}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Primary Category</label>
              <p className="text-gray-900 mt-1">{institute.primaryCategory}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Teaching Mode</label>
              <p className="text-gray-900 mt-1">{institute.teachingMode}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Centers</label>
              <p className="text-gray-900 mt-1">{institute._count?.centers || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Members</label>
              <p className="text-gray-900 mt-1">{institute._count?.members || 0}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="mt-1">
                {institute.isActive
                  ? <span className="text-green-700 font-medium">Active</span>
                  : <span className="text-red-700 font-medium">Inactive</span>}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Joined</label>
              <p className="text-gray-900 mt-1">{new Date(institute.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstitutesContent() {
  const searchParams = useSearchParams();
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("status") || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { fetchInstitutes(); }, [filter]);

  const fetchInstitutes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const url = filter === "all"
        ? `${API_URL}/admin/institutes`
        : `${API_URL}/admin/institutes?status=${filter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setInstitutes(data.institutes || []);
    } catch {
      setError("Failed to load institutes");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/institutes/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      setSuccess(`Institute "${deleteTarget.name}" completely deleted.`);
      setDeleteTarget(null);
      fetchInstitutes();
    } catch {
      setError("Failed to delete institute");
      setDeleteTarget(null);
    }
  };

  const filtered = institutes.filter(inst => {
    if (!inst) return false;
    const name = (inst.name || "").toLowerCase();
    const city = (inst.city || "").toLowerCase();
    const q = (searchQuery || "").toLowerCase(); // ✅ FIXED: guard against undefined searchQuery
    return name.includes(q) || city.includes(q);
  });

  const stats = {
    total: institutes.length,
    active: institutes.filter(i => i.isActive).length,
    inactive: institutes.filter(i => !i.isActive).length,
    withCenters: institutes.filter(i => (i._count?.centers || 0) > 0).length,
  };

  return (
    <>
      {confirm && (
        <ConfirmModal message={confirm.message} confirmLabel={confirm.confirmLabel}
          confirmClass={confirm.confirmClass} onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)} />
      )}
      {selectedInstitute && (
        <DetailsModal institute={selectedInstitute} onClose={() => setSelectedInstitute(null)} />
      )}
      {deleteTarget && (
        <DeleteInstituteModal
          institute={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Institute Management</h2>
        <p className="text-sm text-gray-500 mt-1">Manage and monitor all institutes</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700 text-sm">
          {error}<button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between text-green-700 text-sm">
          {success}<button onClick={() => setSuccess(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-blue-600" },
          { label: "Active", value: stats.active, color: "text-green-600" },
          { label: "Inactive", value: stats.inactive, color: "text-red-600" },
          { label: "With Centers", value: stats.withCenters, color: "text-purple-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search by name or city..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "active", "inactive"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize
                  ${filter === s ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No institutes found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(institute => (
              <div key={institute.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">{institute.name}</h3>
                      {institute.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />{institute.city}, {institute.state}
                      </span>
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400 shrink-0" />{institute.primaryCategory}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Joined {new Date(institute.createdAt).toLocaleDateString()} ·{" "}
                      {institute._count?.centers || 0} centers ·{" "}
                      {institute._count?.members || 0} members
                    </p>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setSelectedInstitute(institute)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(institute)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Institute">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function AdminInstitutes() {
  return (
    <Suspense fallback={<div className="p-12 text-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto" /></div>}>
      <InstitutesContent />
    </Suspense>
  );
}