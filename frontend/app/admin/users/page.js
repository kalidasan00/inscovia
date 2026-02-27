// app/admin/users/page.js
"use client";
import { useState, useEffect } from "react";
import { Users, Search, Trash2, UserCheck, UserX, X, Mail, Phone, Calendar } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

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

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async (search = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const url = search
        ? `${API_URL}/admin/users?search=${encodeURIComponent(search)}`
        : `${API_URL}/admin/users`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = (user) => {
    setConfirm({
      message: `Delete user "${user.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      confirmClass: "bg-red-600 hover:bg-red-700",
      onConfirm: async () => {
        setConfirm(null);
        try {
          const token = localStorage.getItem("adminToken");
          const res = await fetch(`${API_URL}/admin/users/${user.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error();
          setSuccess("User deleted.");
          fetchUsers(searchQuery);
        } catch {
          setError("Failed to delete user");
        }
      }
    });
  };

  const handleToggle = (user) => {
    setConfirm({
      message: `${user.isActive ? "Block" : "Activate"} user "${user.name}"?`,
      confirmLabel: user.isActive ? "Block" : "Activate",
      confirmClass: user.isActive ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700",
      onConfirm: async () => {
        setConfirm(null);
        try {
          const token = localStorage.getItem("adminToken");
          const res = await fetch(`${API_URL}/admin/users/${user.id}/toggle-status`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error();
          setSuccess(`User ${user.isActive ? "blocked" : "activated"}.`);
          fetchUsers(searchQuery);
        } catch {
          setError("Failed to update user status");
        }
      }
    });
  };

  return (
    <>
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          confirmClass={confirm.confirmClass}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Users</h2>
        <p className="text-sm text-gray-500 mt-1">{users.length} registered users</p>
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
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Gender</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{user.phone}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{user.gender}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(user)}
                          className={`p-1.5 rounded-lg transition-colors ${user.isActive ? "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50" : "text-gray-400 hover:text-green-600 hover:bg-green-50"}`}
                          title={user.isActive ? "Block user" : "Activate user"}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
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
        )}
      </div>
    </>
  );
}