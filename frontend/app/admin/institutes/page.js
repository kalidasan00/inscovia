// app/admin/institutes/page.js
"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2, Check, X, Eye,Search,
  Clock, CheckCircle, XCircle, Mail, Phone, MapPin
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// --- Modals ---

function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = "Confirm", confirmClass = "bg-red-600 hover:bg-red-700" }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <p className="text-gray-800 font-medium mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-gray-900 font-semibold mb-3">Reject Institute</h3>
        <p className="text-sm text-gray-500 mb-3">Provide a reason (optional)</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          placeholder="Reason for rejection..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-4 resize-none"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={() => onConfirm(reason)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailsModal({ institute, onClose, onApprove, onReject }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Institute Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Institute Name</label>
            <p className="text-gray-900 mt-1 font-medium">{institute.instituteName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900 mt-1">{institute.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900 mt-1">{institute.phone}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Location</label>
            <p className="text-gray-900 mt-1">{institute.location}, {institute.city}, {institute.state}</p>
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
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="mt-1">
                {institute.isVerified
                  ? <span className="text-green-700 font-medium">Verified</span>
                  : <span className="text-yellow-700 font-medium">Pending</span>
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Joined</label>
              <p className="text-gray-900 mt-1">{new Date(institute.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {!institute.isVerified && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={onApprove}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
              >
                Approve
              </button>
              <button
                onClick={onReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main ---

function InstitutesContent() {
  const searchParams = useSearchParams();
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("status") || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
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

  const approveInstitute = (id) => {
    setSelectedInstitute(null);
    setConfirm({
      message: "Approve this institute?",
      confirmLabel: "Approve",
      confirmClass: "bg-green-600 hover:bg-green-700",
      onConfirm: async () => {
        setConfirm(null);
        try {
          const token = localStorage.getItem("adminToken");
          const res = await fetch(`${API_URL}/admin/institutes/${id}/approve`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error();
          setSuccess("Institute approved successfully.");
          fetchInstitutes();
        } catch {
          setError("Failed to approve institute");
        }
      }
    });
  };

  const rejectInstitute = (id) => {
    setSelectedInstitute(null);
    setRejectTarget(id);
  };

  const confirmReject = async (reason) => {
    setRejectTarget(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/institutes/${rejectTarget}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error();
      setSuccess("Institute rejected.");
      fetchInstitutes();
    } catch {
      setError("Failed to reject institute");
    }
  };

  const filtered = institutes.filter(inst =>
    inst.instituteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inst.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: institutes.length,
    verified: institutes.filter(i => i.isVerified).length,
    pending: institutes.filter(i => !i.isVerified).length,
    active: institutes.filter(i => i.isActive).length
  };

  return (
    <>
      {/* Modals */}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          confirmClass={confirm.confirmClass}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {rejectTarget && (
        <RejectModal
          onConfirm={confirmReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}
      {selectedInstitute && (
        <DetailsModal
          institute={selectedInstitute}
          onClose={() => setSelectedInstitute(null)}
          onApprove={() => approveInstitute(selectedInstitute.id)}
          onReject={() => rejectInstitute(selectedInstitute.id)}
        />
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Institute Management</h2>
        <p className="text-sm text-gray-500 mt-1">Approve, manage, and monitor institutes</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700 text-sm">
          {error}
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between text-green-700 text-sm">
          {success}
          <button onClick={() => setSuccess(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Verified", value: stats.verified, color: "text-green-600", bg: "bg-green-100" },
          { label: "Pending", value: stats.pending, color: "text-yellow-600", bg: "bg-yellow-100" },
          { label: "Active", value: stats.active, color: "text-purple-600", bg: "bg-purple-100" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "verified", "active"].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize
                  ${filter === s ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
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
                      <h3 className="text-base font-semibold text-gray-900">{institute.instituteName}</h3>
                      {institute.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {!institute.isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400 shrink-0" />{institute.email}</span>
                      <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400 shrink-0" />{institute.phone}</span>
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 shrink-0" />{institute.city}, {institute.state}</span>
                      <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400 shrink-0" />{institute.primaryCategory}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      Joined {new Date(institute.createdAt).toLocaleDateString()} · {institute._count?.centers || 0} centers
                    </p>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setSelectedInstitute(institute)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!institute.isVerified && (
                      <>
                        <button
                          onClick={() => approveInstitute(institute.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectInstitute(institute.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
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