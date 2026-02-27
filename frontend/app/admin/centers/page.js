// app/admin/centers/page.js
"use client";
import { useState, useEffect } from "react";
import { Building2, Search, Trash2, Eye, X, Star } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <p className="text-gray-800 font-medium mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => { fetchCenters(); }, []);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/centers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCenters(data.centers || []);
    } catch {
      setError("Failed to load centers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (center) => {
    setConfirm({
      message: `Delete "${center.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const token = localStorage.getItem("adminToken");
          const res = await fetch(`${API_URL}/admin/centers/${center.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error();
          setSuccess("Center deleted.");
          fetchCenters();
        } catch {
          setError("Failed to delete center");
        }
      }
    });
  };

  const filtered = centers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.type?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.state?.toLowerCase().includes(q) ||
      c.owner?.instituteName?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Centers</h2>
        <p className="text-sm text-gray-500 mt-1">
          Showing {filtered.length} of {centers.length} centers
        </p>
      </div>

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

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, type, city, or owner..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No centers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(center => (
            <div key={center.id} className="bg-white rounded-xl border border-gray-200 p-5">
              {center.image && (
                <img src={center.image} alt={center.name}
                  className="w-full h-40 object-cover rounded-lg mb-4" />
              )}

              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-gray-900">{center.name}</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full shrink-0">
                  {center.type}
                </span>
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <p>{center.city}, {center.state}</p>
                {center.rating > 0 && (
                  <p className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    {center.rating.toFixed(1)}
                  </p>
                )}
                {center.courses?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {center.courses.slice(0, 3).map((c, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{c}</span>
                    ))}
                    {center.courses.length > 3 && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">+{center.courses.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {center.owner && (
                <div className="border-t pt-3 mb-3 text-sm text-gray-600">
                  <p><span className="font-medium">Owner:</span> {center.owner.instituteName}</p>
                  <p className="text-xs text-gray-500">{center.owner.email}</p>
                  <div className="flex gap-1.5 mt-1.5">
                    {center.owner.isVerified && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${center.owner.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {center.owner.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 border-t pt-3">
                <a
                  href={`/centers/${center.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
                >
                  <Eye className="w-4 h-4" /> View
                </a>
                <button
                  onClick={() => handleDelete(center)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Created {new Date(center.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}