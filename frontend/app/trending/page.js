"use client";
import { useState, useEffect } from "react";
import { TrendingUp, MapPin, BookOpen, Building2, Sparkles, ArrowUp, ArrowDown } from "lucide-react";

const CATEGORY_LABELS = {
  IT_TECHNOLOGY: "IT & Technology",
  EXAM_COACHING: "Exam Coaching",
  LANGUAGES: "Languages",
  MANAGEMENT: "Management",
  DESIGN_CREATIVE: "Design & Creative",
  SKILL_DEVELOPMENT: "Skill Development",
  SCHOOL_TUITION: "School Tuition",
  STUDY_ABROAD: "Study Abroad",
};

const CATEGORY_COLORS = {
  IT_TECHNOLOGY: "bg-blue-100 text-blue-700",
  EXAM_COACHING: "bg-orange-100 text-orange-700",
  LANGUAGES: "bg-green-100 text-green-700",
  MANAGEMENT: "bg-purple-100 text-purple-700",
  DESIGN_CREATIVE: "bg-pink-100 text-pink-700",
  SKILL_DEVELOPMENT: "bg-yellow-100 text-yellow-700",
  SCHOOL_TUITION: "bg-indigo-100 text-indigo-700",
  STUDY_ABROAD: "bg-cyan-100 text-cyan-700",
};

export default function TrendingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [days, setDays] = useState(30);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    fetchTrending();
  }, [selectedCity, days]);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ days });
      if (selectedCity) params.append("city", selectedCity);
      const res = await fetch(`${API_URL}/analytics/trending?${params}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error("Trending fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-bold text-gray-900">Trending in Education</h1>
        </div>
        <p className="text-sm text-gray-500">What students are searching for right now</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All Cities</option>
          <option value="kozhikode">Kozhikode</option>
          <option value="kochi">Kochi</option>
          <option value="trivandrum">Trivandrum</option>
          <option value="thrissur">Thrissur</option>
          <option value="bangalore">Bangalore</option>
          <option value="chennai">Chennai</option>
          <option value="mumbai">Mumbai</option>
          <option value="delhi">Delhi</option>
        </select>

        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
      ) : !data || data.totalSearches === 0 ? (
        <div className="text-center py-16">
          <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Not enough data yet.</p>
          <p className="text-gray-400 text-xs mt-1">Trends will appear as users browse Inscovia.</p>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{data.totalSearches}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Searches</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{data.totalViews}</p>
              <p className="text-xs text-gray-500 mt-0.5">Center Views</p>
            </div>
            <div className={`rounded-xl p-3 text-center shadow-sm border ${
              data.weeklyGrowth >= 0
                ? "bg-emerald-50 border-emerald-100"
                : "bg-red-50 border-red-100"
            }`}>
              <div className="flex items-center justify-center gap-1">
                {data.weeklyGrowth >= 0
                  ? <ArrowUp className="w-4 h-4 text-emerald-600" />
                  : <ArrowDown className="w-4 h-4 text-red-500" />
                }
                <p className={`text-2xl font-bold ${data.weeklyGrowth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {Math.abs(data.weeklyGrowth)}%
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Weekly Growth</p>
            </div>
          </div>

          {/* AI Insights */}
          {data.aiInsights && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-700">AI Market Insights</span>
              </div>
              <div className="space-y-2">
                {data.aiInsights.trending_insight && (
                  <p className="text-sm text-gray-700">
                    📊 {data.aiInsights.trending_insight}
                  </p>
                )}
                {data.aiInsights.hot_skill && (
                  <p className="text-sm text-gray-700">
                    🔥 <span className="font-medium">Hot skill:</span> {data.aiInsights.hot_skill}
                  </p>
                )}
                {data.aiInsights.opportunity && (
                  <p className="text-sm text-gray-700">
                    💡 {data.aiInsights.opportunity}
                  </p>
                )}
                {data.aiInsights.prediction && (
                  <p className="text-sm text-gray-700">
                    🔮 {data.aiInsights.prediction}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Top Searches */}
          {data.topQueries?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-gray-800">Top Searches</span>
              </div>
              <div className="divide-y divide-gray-50">
                {data.topQueries.map((item, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? "bg-yellow-100 text-yellow-700" :
                        i === 1 ? "bg-gray-100 text-gray-600" :
                        i === 2 ? "bg-orange-100 text-orange-600" :
                        "bg-gray-50 text-gray-400"
                      }`}>
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-800 capitalize">{item.query}</span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                      {item.count} searches
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Categories */}
          {data.topCategories?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-800">Popular Categories</span>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {data.topCategories.map((item, i) => (
                  <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    CATEGORY_COLORS[item.category] || "bg-gray-100 text-gray-600"
                  }`}>
                    {CATEGORY_LABELS[item.category] || item.category}
                    <span className="opacity-60">· {item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Cities */}
          {data.topCities?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-gray-800">Most Active Cities</span>
              </div>
              <div className="divide-y divide-gray-50">
                {data.topCities.map((item, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-800 capitalize">{item.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (item.count / data.topCities[0].count) * 100)}%`
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Centers */}
          {data.topCenters?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-gray-800">Most Viewed Institutes</span>
              </div>
              <div className="divide-y divide-gray-50">
                {data.topCenters.map((item, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      {item.city && (
                        <p className="text-xs text-gray-400 capitalize mt-0.5">{item.city}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                      {item.count} views
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}