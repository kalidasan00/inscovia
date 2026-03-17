// app/admin/dashboard/page.js
"use client";
import { useState, useEffect } from "react";
import {
  Building2, Users, MapPin, Clock, ArrowRight, X,
  ShieldAlert, TrendingUp, Sparkles, RefreshCw,
  CheckCircle, AlertTriangle, XCircle, Search
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentCenters, setRecentCenters] = useState([]);
  const [auditReport, setAuditReport] = useState(null);
  const [trending, setTrending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditRunning, setAuditRunning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, auditRes, trendingRes] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard/stats`, { headers }),
        fetch(`${API_URL}/audit/last`),
        fetch(`${API_URL}/analytics/trending?days=7`)
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
        setRecentCenters(data.recentCenters || []);
      }

      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditReport(data);
      }

      if (trendingRes.ok) {
        const data = await trendingRes.json();
        setTrending(data);
      }

    } catch {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    setAuditRunning(true);
    try {
      const res = await fetch(`${API_URL}/audit/run`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setAuditReport({ report: data.summary, runAt: new Date() });
      }
    } catch {
      setError("Audit failed. Try again.");
    } finally {
      setAuditRunning(false);
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

      {/* AI Audit Card + Trending side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* ── AI Audit Report ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <h3 className="font-semibold text-gray-900 text-sm">AI Audit Agent</h3>
            </div>
            <button
              onClick={handleRunAudit}
              disabled={auditRunning}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${auditRunning ? "animate-spin" : ""}`} />
              {auditRunning ? "Running..." : "Run Now"}
            </button>
          </div>

          <div className="p-4">
            {!auditReport?.report ? (
              <div className="text-center py-6">
                <ShieldAlert className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No audit run yet</p>
                <p className="text-xs text-gray-300 mt-1">Click "Run Now" to start</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{auditReport.report.critical}</p>
                    <p className="text-xs text-red-500 mt-0.5">Critical</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{auditReport.report.warnings}</p>
                    <p className="text-xs text-yellow-500 mt-0.5">Warnings</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{auditReport.report.healthy}</p>
                    <p className="text-xs text-green-500 mt-0.5">Healthy</p>
                  </div>
                </div>

                {auditReport.report.criticalCenters?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Critical Institutes</p>
                    {auditReport.report.criticalCenters.slice(0, 3).map((name, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                        <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {name}
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-gray-400 mt-3">
                  Last run: {auditReport.runAt ? new Date(auditReport.runAt).toLocaleDateString("en-IN") : "—"}
                  · Next: Weekly auto
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── Trending This Week ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Trending This Week</h3>
            </div>
            <a href="/admin/analytics" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4">
            {!trending || trending.totalSearches === 0 ? (
              <div className="text-center py-6">
                <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No search data yet</p>
                <p className="text-xs text-gray-300 mt-1">Data appears as users browse</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{trending.totalSearches}</p>
                    <p className="text-xs text-blue-500 mt-0.5">Searches</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${trending.weeklyGrowth >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                    <p className={`text-2xl font-bold ${trending.weeklyGrowth >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {trending.weeklyGrowth >= 0 ? "+" : ""}{trending.weeklyGrowth}%
                    </p>
                    <p className={`text-xs mt-0.5 ${trending.weeklyGrowth >= 0 ? "text-green-500" : "text-red-400"}`}>Growth</p>
                  </div>
                </div>

                {trending.topQueries?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Top Searches</p>
                    {trending.topQueries.slice(0, 4).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs px-3 py-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-bold">#{i + 1}</span>
                          <span className="text-gray-700 capitalize">{item.query}</span>
                        </div>
                        <span className="text-gray-400">{item.count}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Centers */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
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

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: "Analytics", href: "/admin/analytics", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
          { label: "Institutes", href: "/admin/institutes", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
          { label: "Centers", href: "/admin/centers", color: "bg-green-50 text-green-700 hover:bg-green-100" },
          { label: "Users", href: "/admin/users", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
          { label: "Papers", href: "/admin/papers", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
          { label: "Notifications", href: "/admin/notifications", color: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
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