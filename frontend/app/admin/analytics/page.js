// app/admin/analytics/page.js
"use client";
import { useState, useEffect } from "react";
import {
  Building2, Users, MapPin, FileText, Download,
  Star, BookOpen, TrendingUp, TrendingDown, X,
  ArrowUpRight, BarChart2, PieChart, Activity
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5 ${color.bg}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${color.bg}`}>
          <Icon className={`w-5 h-5 ${color.text}`} />
        </div>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${color.text}`}>
        {typeof value === 'number' ? value.toLocaleString() : value ?? "—"}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function HBarChart({ data, labelKey = "name", valueKey = "count", color }) {
  if (!data?.length) return <p className="text-sm text-gray-400 py-4 text-center">No data available</p>;
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-600 font-medium truncate max-w-[160px]" title={item[labelKey]}>
              {item[labelKey]?.replace(/_/g, " ")}
            </p>
            <span className="text-xs font-bold text-gray-700">{item[valueKey]}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${color}`}
              style={{ width: `${(item[valueKey] / max) * 100}%`, transition: "width 0.7s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }) {
  if (!data?.length) return <p className="text-sm text-gray-400 py-4 text-center">No data</p>;
  const total = data.reduce((s, d) => s + d.count, 0);
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  let cumulative = 0;
  const cx = 60, cy = 60, r = 45, stroke = 18;
  const circumference = 2 * Math.PI * r;
  const segments = data.map((d, i) => {
    const pct = (d.count / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start, color: colors[i % colors.length] };
  });
  return (
    <div className="flex items-center gap-5">
      <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
        {segments.map((seg, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={`${(seg.pct / 100) * circumference} ${circumference}`}
            strokeDashoffset={-((seg.start / 100) * circumference)}
            transform={`rotate(-90 ${cx} ${cy})`} />
        ))}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
          fill="#111827" fontSize="14" fontWeight="700">{total}</text>
      </svg>
      <div className="space-y-2 flex-1 min-w-0">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <p className="text-xs text-gray-600 truncate flex-1">{seg.name?.replace(/_/g, " ")}</p>
            <span className="text-xs font-bold text-gray-700">{seg.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GrowthChart({ data, color = "#3B82F6" }) {
  if (!data?.length) return <p className="text-sm text-gray-400 py-4">No data</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);
  const width = 600, height = 100, pad = 4;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((d.count / max) * (height - pad * 2));
    return `${x},${y}`;
  }).join(" ");
  const area = `${pad},${height - pad} ${pts} ${width - pad},${height - pad}`;
  const peakIdx = data.reduce((best, d, i) => d.count > data[best].count ? i : best, 0);
  const peakX = pad + (peakIdx / (data.length - 1)) * (width - pad * 2);
  const peakY = height - pad - ((data[peakIdx].count / max) * (height - pad * 2));
  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-400">total in 30 days</p>
        </div>
        <div className="h-8 w-px bg-gray-100" />
        <div>
          <p className="text-sm font-semibold text-gray-700">{data[peakIdx]?.count} peak</p>
          <p className="text-xs text-gray-400">on {data[peakIdx]?.date?.slice(5)}</p>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 80 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon fill={`url(#grad-${color.replace('#','')})`} points={area} />
          <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" points={pts} />
          {data[peakIdx]?.count > 0 && (
            <>
              <circle cx={peakX} cy={peakY} r="4" fill={color} />
              <circle cx={peakX} cy={peakY} r="8" fill={color} fillOpacity="0.15" />
            </>
          )}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1.5 px-1">
        <span>{data[0]?.date?.slice(5)}</span>
        <span>{data[data.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  );
}

function RatingBar({ data }) {
  const counts = [5,4,3,2,1].map(r => data?.find(x => x.rating === r)?.count || 0);
  const max = Math.max(...counts, 1);
  const total = counts.reduce((s, c) => s + c, 0);
  const avg = total > 0
    ? (data?.reduce((s, d) => s + d.rating * d.count, 0) / total).toFixed(1)
    : "—";
  return (
    <div>
      <div className="flex items-end gap-3 mb-4">
        <p className="text-4xl font-bold text-gray-900">{avg}</p>
        <div className="pb-1">
          <div className="flex gap-0.5 mb-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-4 h-4 ${parseFloat(avg) >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400">{total} total reviews</p>
        </div>
      </div>
      <div className="space-y-2">
        {[5,4,3,2,1].map((r, i) => (
          <div key={r} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-8 shrink-0">
              <span className="text-xs text-gray-500">{r}</span>
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-yellow-400"
                style={{ width: `${(counts[i] / max) * 100}%`, transition: "width 0.7s ease" }} />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-6 text-right">{counts[i]}</span>
          </div>
        ))}
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

  const approvalRate = data?.overview
    ? Math.round((data.overview.verifiedInstitutes / Math.max(data.overview.totalInstitutes, 1)) * 100)
    : 0;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
      <p className="text-sm text-gray-400">Loading analytics...</p>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Analytics & Reports
          </h2>
          <p className="text-sm text-gray-500 mt-1">Platform performance overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live data
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700 text-sm">
          {error}<button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Institutes" value={data?.overview.totalInstitutes} icon={Building2}
          color={{ bg: "bg-blue-50", text: "text-blue-600" }} sub={`${data?.overview.verifiedInstitutes} verified`} />
        <StatCard label="Total Centers" value={data?.overview.totalCenters} icon={MapPin}
          color={{ bg: "bg-emerald-50", text: "text-emerald-600" }} />
        <StatCard label="Total Users" value={data?.overview.totalUsers} icon={Users}
          color={{ bg: "bg-violet-50", text: "text-violet-600" }} />
        <StatCard label="Paper Downloads" value={data?.overview.totalDownloads} icon={Download}
          color={{ bg: "bg-pink-50", text: "text-pink-600" }} sub={`${data?.overview.totalPapers} papers`} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending Approval" value={data?.overview.pendingInstitutes} icon={Building2}
          color={{ bg: "bg-amber-50", text: "text-amber-600" }} />
        <StatCard label="Approval Rate" value={`${approvalRate}%`} icon={ArrowUpRight}
          color={{ bg: "bg-green-50", text: "text-green-600" }} />
        <StatCard label="Total Reviews" value={data?.overview.totalReviews} icon={Star}
          color={{ bg: "bg-yellow-50", text: "text-yellow-500" }} />
        <StatCard label="Aptitude Questions" value={data?.overview.totalAptitude} icon={BookOpen}
          color={{ bg: "bg-indigo-50", text: "text-indigo-600" }} />
      </div>

      {/* Growth Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Growth — Last 30 Days
          </h3>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: "users", color: "#8B5CF6" },
              { key: "institutes", color: "#3B82F6" },
              { key: "centers", color: "#10B981" }
            ].map(({ key }) => (
              <button key={key} onClick={() => setActiveGrowth(key)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all
                  ${activeGrowth === key ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                {key}
              </button>
            ))}
          </div>
        </div>
        <GrowthChart
          data={data?.growth[activeGrowth]}
          color={activeGrowth === "users" ? "#8B5CF6" : activeGrowth === "institutes" ? "#3B82F6" : "#10B981"}
        />
      </div>

      {/* Category Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-500" /> Centers by Category
          </h3>
          <p className="text-xs text-gray-400 mb-4">{data?.overview.totalCenters} total</p>
          <HBarChart data={data?.centersByCategory} color="bg-blue-500" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-500" /> Institutes by Category
          </h3>
          <p className="text-xs text-gray-400 mb-4">{data?.overview.totalInstitutes} total</p>
          <HBarChart data={data?.institutesByCategory} color="bg-emerald-500" />
        </div>
      </div>

      {/* Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-500" /> Centers by State
          </h3>
          <p className="text-xs text-gray-400 mb-4">Top 8 states</p>
          <HBarChart data={data?.centersByState} color="bg-violet-500" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" /> Institutes by State
          </h3>
          <p className="text-xs text-gray-400 mb-4">Top 8 states</p>
          <HBarChart data={data?.institutesByState} color="bg-orange-500" />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-500" /> Teaching Mode
          </h3>
          <p className="text-xs text-gray-400 mb-5">Distribution across centers</p>
          <DonutChart data={data?.centersByMode} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" /> Review Ratings
          </h3>
          <p className="text-xs text-gray-400 mb-4">Average rating breakdown</p>
          <RatingBar data={data?.reviewsByRating} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-pink-500" /> Papers by Category
          </h3>
          <p className="text-xs text-gray-400 mb-4">{data?.overview.totalPapers} papers total</p>
          <HBarChart data={data?.papersByCategory} color="bg-pink-500" />
        </div>
      </div>

      {/* Top Centers + Aptitude */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" /> Top Rated Centers
          </h3>
          <p className="text-xs text-gray-400 mb-5">Highest rated on platform</p>
          {!data?.topCenters?.length ? (
            <p className="text-sm text-gray-400 text-center py-6">No rated centers yet</p>
          ) : (
            <div className="space-y-4">
              {data.topCenters.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className={`text-sm font-black w-6 shrink-0 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-300"}`}>
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.city} · {c.primaryCategory?.replace(/_/g, " ")}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg shrink-0">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-600">{c.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-500" /> Aptitude by Topic
          </h3>
          <p className="text-xs text-gray-400 mb-4">{data?.overview.totalAptitude} questions total</p>
          <HBarChart data={data?.aptitudeByTopic} color="bg-teal-500" />
        </div>
      </div>
    </>
  );
}