"use client";

import { useState, useEffect } from "react";

export default function ManageInstitutes() {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [adminInfo, setAdminInfo] = useState(null);

  const API_URL = "http://localhost:5001/api";

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const info = localStorage.getItem("adminInfo");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    if (info) {
      setAdminInfo(JSON.parse(info));
    }

    fetchInstitutes(token, filter);
  }, [filter]);

  const fetchInstitutes = async (token, status) => {
    setLoading(true);
    try {
      const url = status === "all"
        ? `${API_URL}/admin/institutes`
        : `${API_URL}/admin/institutes?status=${status}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
          return;
        }
        throw new Error("Failed to fetch institutes");
      }

      const data = await res.json();
      setInstitutes(data.institutes);
    } catch (error) {
      console.error("Error fetching institutes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_URL}/admin/institutes/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Institute approved successfully!");
        fetchInstitutes(token, filter);
      }
    } catch (error) {
      console.error("Error approving institute:", error);
      alert("Failed to approve institute");
    }
  };

  const handleToggleStatus = async (id) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_URL}/admin/institutes/${id}/toggle-status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Institute status updated!");
        fetchInstitutes(token, filter);
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete their center.`)) {
      return;
    }

    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_URL}/admin/institutes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Institute deleted successfully!");
        fetchInstitutes(token, filter);
      }
    } catch (error) {
      console.error("Error deleting institute:", error);
      alert("Failed to delete institute");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Institutes</h1>
              <p className="text-sm text-gray-600">Approve, manage, and moderate institutes</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow mb-8 p-4">
          <div className="flex gap-4 flex-wrap">
            <a href="/admin/dashboard" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Dashboard
            </a>
            <a href="/admin/institutes" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
              Manage Institutes
            </a>
            <a href="/admin/centers" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Manage Centers
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All ({institutes.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Pending Approval
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("inactive")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "inactive"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Institutes List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading institutes...</p>
          </div>
        ) : institutes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No institutes found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {institutes.map((institute) => (
              <div key={institute.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {institute.instituteName}
                      </h3>
                      {!institute.isVerified && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Pending
                        </span>
                      )}
                      {institute.isVerified && institute.isActive && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      )}
                      {!institute.isActive && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Inactive
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {institute.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Email:</strong> {institute.email}</p>
                        <p><strong>Phone:</strong> {institute.phone}</p>
                      </div>
                      <div>
                        <p><strong>Location:</strong> {institute.city}, {institute.district}, {institute.state}</p>
                        <p><strong>Registered:</strong> {new Date(institute.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {institute.centers && institute.centers.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium text-gray-700">Centers:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {institute.centers.map((center) => (
                            <span key={center.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {center.name} ({center.type})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    {!institute.isVerified && (
                      <button
                        onClick={() => handleApprove(institute.id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        ✓ Approve
                      </button>
                    )}

                    {institute.isVerified && (
                      <button
                        onClick={() => handleToggleStatus(institute.id)}
                        className={`px-4 py-2 text-white text-sm rounded-lg transition-colors ${
                          institute.isActive
                            ? "bg-orange-600 hover:bg-orange-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {institute.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(institute.id, institute.instituteName)}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}