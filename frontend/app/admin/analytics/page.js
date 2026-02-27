// app/admin/analytics/page.js
"use client";
import { useState, useEffect } from "react";
import {
  Building2, Users, MapPin, FileText, Download,
  Star, BookOpen, TrendingUp, X
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`p-2 rounded-lg ${color.bg}`}>
          <Icon className={`w-4 h-4 ${color.text}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${color.text}`}>{value ?? "—"}</p>
    </div>
  );
}

function BarChart({ data, labelKey = "name", valueKey = "count", color = "bg-primary" }) {
  if (!data?.length) return <p className="text-sm text-gray-400 py-4">No data</p>;
  const max = Math.max(...data.map(d => d[valueKey]));
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <p className="text-xs text-gray-600 w-32 shrink-0 truncate" title={item[labelKey]}>
            {item[labelKey]?.replace(/_/g, " ")}
          </p>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${color}`}
              style={{ width: `${max > 0 ? (item[valueKey] / max) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs font-medium text-gray-700 w-8 text-right">{item[valueKey]}</p>
        </div>
      ))}
    </div>
  );
}

function GrowthChart({ data, color = "#1E40AF" }) {
  if (!data?.length) return <p className="text-sm text-gray-400 py-4">No data</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  const width = 600;
  const height = 80;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.count / max) * height;
    return `${x},${y}`;
  }).join(" ");

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">{total} in last 30 days</p>
      <div className="overflow-hidden rounded-lg">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={pts}
          />
          <polyline
            fill={`${color}20`}
            stroke="none"
            points={`0,${height} ${pts} ${width},${height}`}
          />
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{data[0]?.date?.slice(5)}</span>
        <span>{data[data.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGrowth, setActiveGrowth] = useState("users");

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      setError("Failed to load analytics");
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
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <p className="text-sm text-gray-500 mt-1">Platform overview and growth metrics</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700 text-sm">
          {error}<button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Institutes" value={data?.overview.totalInstitutes} icon={Building2} color={{ bg: "bg-blue-50", text: "text-blue-600" }} />
        <StatCard label="Centers" value={data?.overview.totalCenters} icon={MapPin} color={{ bg: "bg-green-50", text: "text-green-600" }} />
        <StatCard label="Users" value={data?.overview.totalUsers} icon={Users} color={{ bg: "bg-purple-50", text: "text-purple-600" }} />
        <StatCard label="Papers" value={data?.overview.totalPapers} icon={FileText} color={{ bg: "bg-orange-50", text: "text-orange-600" }} />
        <StatCard label="Downloads" value={data?.overview.totalDownloads} icon={Download} color={{ bg: "bg-pink-50", text: "text-pink-600" }} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Verified" value={data?.overview.verifiedInstitutes} icon={Building2} color={{ bg: "bg-green-50", text: "text-green-600" }} />
        <StatCard label="Pending" value={data?.overview.pendingInstitutes} icon={Building2} color={{ bg: "bg-yellow-50", text: "text-yellow-600" }} />
        <StatCard label="Reviews" value={data?.overview.totalReviews} icon={Star} color={{ bg: "bg-yellow-50", text: "text-yellow-500" }} />
        <StatCard label="Aptitude Qs" value={data?.overview.totalAptitude} icon={BookOpen} color={{ bg: "bg-indigo-50", text: "text-indigo-600" }} />
      </div>

      {/* Growth Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Growth — Last 30 Days
          </h3>
          <div className="flex gap-2">
            {["users", "institutes", "centers"].map(tab => (
              <button key={tab} onClick={() => setActiveGrowth(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors
                  ${activeGrowth === tab ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <GrowthChart data={data?.growth[activeGrowth]} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Centers by Category</h3>
          <BarChart data={data?.centersByCategory} color="bg-blue-500" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Institutes by Category</h3>
          <BarChart data={data?.institutesByCategory} color="bg-green-500" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Centers by State</h3>
          <BarChart data={data?.centersByState} color="bg-purple-500" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Institutes by State</h3>
          <BarChart data={data?.institutesByState} color="bg-orange-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Teaching Mode */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Teaching Mode</h3>
          <BarChart data={data?.centersByMode} color="bg-indigo-500" />
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Review Ratings</h3>
          <div className="space-y-2">
            {[5,4,3,2,1].map(r => {
              const found = data?.reviewsByRating?.find(x => x.rating === r);
              const count = found?.count || 0;
              const max = Math.max(...(data?.reviewsByRating?.map(x => x.count) || [1]));
              return (
                <div key={r} className="flex items-center gap-3">
                  <p className="text-xs text-gray-600 w-8 shrink-0">{r}★</p>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-yellow-400" style={{ width: `${max > 0 ? (count / max) * 100 : 0}%` }} />
                  </div>
                  <p className="text-xs font-medium text-gray-700 w-6 text-right">{count}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Papers by category */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Papers by Category</h3>
          <BarChart data={data?.papersByCategory} color="bg-pink-500" />
        </div>
      </div>

      {/* Top Centers + Aptitude */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Rated Centers</h3>
          {data?.topCenters?.length === 0 ? (
            <p className="text-sm text-gray-400">No rated centers yet</p>
          ) : (
            <div className="space-y-3">
              {data?.topCenters?.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.city} · {c.primaryCategory?.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-bold text-yellow-500">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />{c.rating.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Aptitude Questions by Topic</h3>
          <BarChart data={data?.aptitudeByTopic} color="bg-teal-500" />
        </div>
      </div>
    </>
  );
}