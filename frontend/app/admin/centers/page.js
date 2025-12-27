"use client";

import { useState, useEffect } from "react";

export default function ManageCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const API_URL = "http://localhost:5001/api";

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "/admin/login";
      return;
    }

    fetchCenters(token);
  }, []);

  const fetchCenters = async (token) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/centers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
          return;
        }
        throw new Error("Failed to fetch centers");
      }

      const data = await res.json();
      setCenters(data.centers);
    } catch (error) {
      console.error("Error fetching centers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_URL}/admin/centers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Center deleted successfully!");
        fetchCenters(token);
      }
    } catch (error) {
      console.error("Error deleting center:", error);
      alert("Failed to delete center");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    window.location.href = "/admin/login";
  };

  const filteredCenters = centers.filter((center) => {
    const query = searchQuery.toLowerCase();
    return (
      center.name.toLowerCase().includes(query) ||
      center.type.toLowerCase().includes(query) ||
      center.city.toLowerCase().includes(query) ||
      center.state.toLowerCase().includes(query) ||
      center.owner?.instituteName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Centers</h1>
              <p className="text-sm text-gray-600">View and moderate all training centers</p>
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
        <div className="bg-white rounded-lg shadow mb-8 p-4">
          <div className="flex gap-4 flex-wrap">
            <a href="/admin/dashboard" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Dashboard
            </a>
            <a href="/admin/institutes" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Manage Institutes
            </a>
            <a href="/admin/centers" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
              Manage Centers
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search centers by name, type, city, owner..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredCenters.length} of {centers.length} centers
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading centers...</p>
          </div>
        ) : centers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No centers found</p>
          </div>
        ) : filteredCenters.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No centers match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCenters.map((center) => (
              <div key={center.id} className="bg-white rounded-lg shadow p-6">
                {center.image && (
                  <img
                    src={center.image}
                    alt={center.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {center.name}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {center.type}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Location:</strong> {center.location}, {center.city}, {center.district}, {center.state}
                    </p>
                    {center.rating > 0 && (
                      <p>
                        <strong>Rating:</strong> ⭐ {center.rating.toFixed(1)}
                      </p>
                    )}
                    {center.courses && center.courses.length > 0 && (
                      <div>
                        <strong>Courses ({center.courses.length}):</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {center.courses.slice(0, 3).map((course, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {course}
                            </span>
                          ))}
                          {center.courses.length > 3 && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              +{center.courses.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {center.phone && (
                      <p><strong>Phone:</strong> {center.phone}</p>
                    )}
                    {center.email && (
                      <p><strong>Email:</strong> {center.email}</p>
                    )}
                  </div>
                </div>

                {center.owner && (
                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Owner:</strong> {center.owner.instituteName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {center.owner.email}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {center.owner.isVerified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Verified
                        </span>
                      )}
                      {center.owner.isActive ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {center.description && (
                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {center.description}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 border-t pt-4">
                  <button
                    onClick={() => window.open(`/centers/${center.id}`, '_blank')}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm text-center rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(center.id, center.name)}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  <p>Created: {new Date(center.createdAt).toLocaleDateString()}</p>
                  <p>Updated: {new Date(center.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}