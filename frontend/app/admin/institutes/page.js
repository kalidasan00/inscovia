// app/admin/institutes/page.js
"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2, Check, X, Eye, Filter, Search,
  Clock, CheckCircle, XCircle, Mail, Phone, MapPin
} from "lucide-react";

export default function AdminInstitutes() {
  const searchParams = useSearchParams();
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("status") || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    fetchInstitutes();
  }, [filter]);

  const fetchInstitutes = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        window.location.href = "/admin/login";
        return;
      }

      const url = filter === "all"
        ? `${API_URL}/admin/institutes`
        : `${API_URL}/admin/institutes?status=${filter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        throw new Error("Failed to fetch institutes");
      }

      const data = await res.json();
      setInstitutes(data.institutes || []);
    } catch (error) {
      console.error("Error fetching institutes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm("Are you sure you want to approve this institute?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/institutes/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Institute approved successfully!");
        fetchInstitutes();
      } else {
        alert("Failed to approve institute");
      }
    } catch (error) {
      console.error("Error approving institute:", error);
      alert("Failed to approve institute");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Reason for rejection (optional):");
    if (reason === null) return; // Cancelled

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/institutes/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (res.ok) {
        alert("Institute rejected");
        fetchInstitutes();
      } else {
        alert("Failed to reject institute");
      }
    } catch (error) {
      console.error("Error rejecting institute:", error);
      alert("Failed to reject institute");
    }
  };

  const filteredInstitutes = institutes.filter(inst =>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Institute Management</h1>
              <p className="text-sm text-gray-500 mt-1">Approve, manage, and monitor institutes</p>
            </div>
            <a
              href="/admin/dashboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Institutes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Building2 className="w-10 h-10 text-blue-600 bg-blue-100 p-2 rounded-lg" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.verified}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 bg-green-100 p-2 rounded-lg" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600 bg-yellow-100 p-2 rounded-lg" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.active}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-purple-600 bg-purple-100 p-2 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {["all", "pending", "verified", "active"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? "bg-accent text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Institutes List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading institutes...</p>
            </div>
          ) : filteredInstitutes.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No institutes found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredInstitutes.map((institute) => (
                <div key={institute.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {institute.instituteName}
                        </h3>
                        <div className="flex gap-2">
                          {institute.isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                          {!institute.isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {institute.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {institute.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {institute.city}, {institute.state}
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {institute.primaryCategory}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <span>Joined {new Date(institute.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{institute._count?.centers || 0} centers</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedInstitute(institute);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {!institute.isVerified && (
                        <>
                          <button
                            onClick={() => handleApprove(institute.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReject(institute.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
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
      </div>

      {/* Details Modal */}
      {showModal && selectedInstitute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">Institute Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Institute Name</label>
                <p className="text-gray-900 mt-1">{selectedInstitute.instituteName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900 mt-1">{selectedInstitute.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900 mt-1">{selectedInstitute.phone}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-gray-900 mt-1">
                  {selectedInstitute.location}, {selectedInstitute.city}, {selectedInstitute.state}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Primary Category</label>
                  <p className="text-gray-900 mt-1">{selectedInstitute.primaryCategory}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Teaching Mode</label>
                  <p className="text-gray-900 mt-1">{selectedInstitute.teachingMode}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                {!selectedInstitute.isVerified && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedInstitute.id);
                        setShowModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedInstitute.id);
                        setShowModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}