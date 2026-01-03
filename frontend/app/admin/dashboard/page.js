// app/admin/dashboard/page.js
"use client";
import { useState, useEffect } from "react";
import {
  Building2, Users, Clock, CheckCircle, XCircle,
  TrendingUp, Star, MessageSquare, BarChart3,
  Home, Settings, LogOut, Menu, X
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentCenters, setRecentCenters] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const API_URL = "http://localhost:5001/api";

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const info = localStorage.getItem("adminInfo");

    console.log("🔍 Debug - Token exists:", !!token);
    console.log("🔍 Debug - Info exists:", !!info);

    if (!token) {
      console.log("❌ No token, redirecting to login");
      window.location.href = "/admin/login";
      return;
    }

    if (info) {
      try {
        setAdminInfo(JSON.parse(info));
      } catch (e) {
        console.error("Error parsing admin info:", e);
      }
    }

    fetchDashboardData(token);
  }, []);

  const fetchDashboardData = async (token) => {
    try {
      console.log("📡 Fetching dashboard data with token:", token?.substring(0, 20) + "...");

      const res = await fetch(`${API_URL}/admin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("📊 Response status:", res.status);

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.log("❌ Auth failed, clearing storage and redirecting");
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminInfo");
          window.location.href = "/admin/login";
          return;
        }
        throw new Error("Failed to fetch stats");
      }

      const data = await res.json();
      console.log("✅ Dashboard data loaded successfully");

      setStats(data.stats);
      setRecentCenters(data.recentCenters || []);
      setRecentReviews(data.recentReviews || []);
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    window.location.href = "/admin/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/admin/dashboard" },
    { id: "institutes", label: "Institutes", icon: Building2, href: "/admin/institutes" },
    { id: "centers", label: "Centers", icon: Building2, href: "/admin/centers" },
    { id: "users", label: "Users", icon: Users, href: "/admin/users" },
    { id: "reviews", label: "Reviews", icon: MessageSquare, href: "/admin/reviews" },
    { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  ];

  const statCards = [
    {
      title: "Total Centers",
      value: stats?.totalCenters || 0,
      icon: Building2,
      color: "blue",
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Active Institutes",
      value: stats?.activeInstitutes || 0,
      icon: CheckCircle,
      color: "green",
      trend: "+8%",
      trendUp: true
    },
    {
      title: "Pending Approval",
      value: stats?.pendingInstitutes || 0,
      icon: Clock,
      color: "yellow",
      trend: "-3%",
      trendUp: false
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "purple",
      trend: "+23%",
      trendUp: true
    }
  ];

  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Inscovia Admin</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Management Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-semibold">
                  {adminInfo?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{adminInfo?.name}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 z-30
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === "dashboard";

              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Alert for Pending */}
          {stats?.pendingInstitutes > 0 && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900">
                    Action Required
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    You have {stats.pendingInstitutes} institute(s) waiting for approval
                  </p>
                  <a
                    href="/admin/institutes?status=pending"
                    className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
                  >
                    Review pending institutes →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorMap[card.color]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium ${
                      card.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.trend}
                    </span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Centers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Centers</h2>
                <a href="/admin/centers" className="text-sm text-accent hover:underline">
                  View all
                </a>
              </div>
              <div className="p-6">
                {recentCenters.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No centers added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCenters.slice(0, 5).map((center) => (
                      <div key={center.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{center.name}</h3>
                          <p className="text-sm text-gray-600 truncate">
                            {center.city}, {center.state}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {center.primaryCategory}
                            </span>
                            {center.rating > 0 && (
                              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {center.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
                <a href="/admin/reviews" className="text-sm text-accent hover:underline">
                  View all
                </a>
              </div>
              <div className="p-6">
                {recentReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{review.userName}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {review.comment}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          on {review.center?.name || 'Unknown Center'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/admin/institutes?status=pending"
                className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
              >
                <Clock className="w-8 h-8 text-accent" />
                <div>
                  <p className="font-medium text-gray-900">Review Pending</p>
                  <p className="text-sm text-gray-500">{stats?.pendingInstitutes || 0} institutes</p>
                </div>
              </a>

              <a
                href="/admin/centers"
                className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
              >
                <Building2 className="w-8 h-8 text-accent" />
                <div>
                  <p className="font-medium text-gray-900">Manage Centers</p>
                  <p className="text-sm text-gray-500">{stats?.totalCenters || 0} total</p>
                </div>
              </a>

              <a
                href="/admin/users"
                className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
              >
                <Users className="w-8 h-8 text-accent" />
                <div>
                  <p className="font-medium text-gray-900">View Users</p>
                  <p className="text-sm text-gray-500">{stats?.totalUsers || 0} users</p>
                </div>
              </a>

              <a
                href="/admin/analytics"
                className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
              >
                <BarChart3 className="w-8 h-8 text-accent" />
                <div>
                  <p className="font-medium text-gray-900">Analytics</p>
                  <p className="text-sm text-gray-500">View reports</p>
                </div>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}