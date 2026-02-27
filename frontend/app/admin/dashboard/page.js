// app/admin/dashboard/page.js
"use client";
import { useState, useEffect } from "react";
import {
  Building2, Users, MapPin, Clock, ArrowRight, X
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentCenters, setRecentCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats(data.stats);
      setRecentCenters(data.recentCenters || []);
    } catch {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Welcome back, Admin</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700 text-sm">
          {error}
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Institutes", value: stats?.totalInstitutes, color: "text-blue-600", bg: "bg-blue-50", icon: Building2 },
          { label: "Pending Approval", value: stats?.pendingInstitutes, color: "text-yellow-600", bg: "bg-yellow-50", icon: Clock },
          { label: "Total Centers", value: stats?.totalCenters, color: "text-green-600", bg: "bg-green-50", icon: MapPin },
          { label: "Total Users", value: stats?.totalUsers, color: "text-purple-600", bg: "bg-purple-50", icon: Users },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{label}</p>
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value ?? "—"}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Recent Centers */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Centers</h3>
            <a href="/admin/centers" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          {recentCenters.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">No centers yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentCenters.map(center => (
                <div key={center.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{center.name}</p>
                    <p className="text-xs text-gray-400">{center.owner?.instituteName}</p>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(center.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Analytics", href: "/admin/analytics", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
          { label: "Institutes", href: "/admin/institutes", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
          { label: "Centers", href: "/admin/centers", color: "bg-green-50 text-green-700 hover:bg-green-100" },
          { label: "Users", href: "/admin/users", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
          { label: "Papers", href: "/admin/papers", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
        ].map(({ label, href, color }) => (
          <a key={label} href={href}
            className={`px-4 py-3 rounded-xl text-sm font-medium text-center transition-colors ${color}`}>
            {label}
          </a>
        ))}
      </div>
    </>
  );
}