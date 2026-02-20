"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe, Trash2, LogOut, Menu, X,
  Home, Building2, Users, MessageSquare, FileText,
  Brain, Eye, Star, Phone, Mail, ExternalLink
} from "lucide-react";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/admin/dashboard" },
  { id: "papers", label: "Question Papers", icon: FileText, href: "/admin/papers" },
  { id: "aptitude", label: "Aptitude Questions", icon: Brain, href: "/admin/aptitude" },
  { id: "study-abroad", label: "Study Abroad", icon: Globe, href: "/admin/study-abroad" },
  { id: "institutes", label: "Institutes", icon: Building2, href: "/admin/institutes" },
  { id: "centers", label: "Centers", icon: Building2, href: "/admin/centers" },
  { id: "users", label: "Users", icon: Users, href: "/admin/users" },
  { id: "reviews", label: "Reviews", icon: MessageSquare, href: "/admin/reviews" },
];

export default function AdminStudyAbroad() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCity, setFilterCity] = useState("All");

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { router.push("/admin/login"); return; }
    fetchCenters(token);
  }, []);

  const fetchCenters = async (token) => {
    setLoading(true);
    try {
      const t = token || localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/admin/centers?category=STUDY_ABROAD`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const data = await res.json();
      // Filter only study abroad centers
      const abroad = (data.centers || []).filter(c =>
        c.primaryCategory === "STUDY_ABROAD" ||
        c.secondaryCategories?.includes("STUDY_ABROAD")
      );
      setCenters(abroad);
    } catch (err) {
      setError("Failed to load centers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${API_URL}/admin/centers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Delete failed");
      setSuccess("Center deleted!");
      fetchCenters();
    } catch (err) {
      setError(err.message);
    }
  };

  const cities = ["All", ...new Set(centers.map(c => c.city).filter(Boolean))];

  const filtered = centers.filter(c => {
    if (filterCity !== "All" && c.city !== filterCity) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
      !c.city?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-xl font-bold text-gray-900">Inscovia Admin</h1>
            </div>
            <button onClick={() => { localStorage.removeItem("adminToken"); router.push("/admin/login"); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-40 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === "study-abroad";
              return (
                <a key={item.id} href={item.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-accent text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Study Abroad Consultancies</h2>
              <p className="text-sm text-gray-500 mt-1">{centers.length} consultancies registered</p>
            </div>
            <a href="/admin/centers"
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 text-sm">
              <Building2 className="w-4 h-4" /> All Centers
            </a>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              {error}<button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex justify-between">
              {success}<button onClick={() => setSuccess(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or city..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
            <div className="flex flex-wrap gap-2">
              {cities.map(city => (
                <button key={city} onClick={() => setFilterCity(city)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filterCity === city ? "bg-accent text-white border-accent" : "bg-white text-gray-600 border-gray-200 hover:border-accent"}`}>
                  {city}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">Showing {filtered.length} of {centers.length} consultancies</p>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-accent border-t-transparent mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No study abroad consultancies found</p>
              <p className="text-sm text-gray-400 mt-1">Centers with STUDY_ABROAD category will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map(center => (
                <div key={center.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {center.logo ? (
                        <img src={center.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{center.name}</h3>
                        <p className="text-xs text-gray-500">{center.city}, {center.state}</p>
                      </div>
                    </div>
                    {center.rating > 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-current" />{center.rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Countries */}
                  {center.countries?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1.5">Countries:</p>
                      <div className="flex flex-wrap gap-1">
                        {center.countries.map(c => (
                          <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {center.services?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1.5">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {center.services.slice(0, 4).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">{s}</span>
                        ))}
                        {center.services.length > 4 && (
                          <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs">+{center.services.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  {(center.successRate || center.studentsPlaced || center.avgScholarship) && (
                    <div className="grid grid-cols-3 gap-2 mb-3 bg-gray-50 rounded-lg p-2">
                      {center.successRate && (
                        <div className="text-center"><p className="text-sm font-bold text-gray-900">{center.successRate}</p><p className="text-xs text-gray-500">Success</p></div>
                      )}
                      {center.studentsPlaced && (
                        <div className="text-center"><p className="text-sm font-bold text-gray-900">{center.studentsPlaced}+</p><p className="text-xs text-gray-500">Placed</p></div>
                      )}
                      {center.avgScholarship && (
                        <div className="text-center"><p className="text-sm font-bold text-gray-900">{center.avgScholarship}</p><p className="text-xs text-gray-500">Scholarship</p></div>
                      )}
                    </div>
                  )}

                  {/* Contact */}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    {center.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{center.phone}</span>}
                    {center.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{center.email}</span>}
                  </div>

                  {/* Owner */}
                  {center.owner && (
                    <div className="border-t pt-3 mb-3 text-xs text-gray-500">
                      <p>Owner: <span className="font-medium text-gray-700">{center.owner.instituteName}</span></p>
                      <p>{center.owner.email}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 border-t pt-3">
                    <a href={`/centers/${center.slug}`} target="_blank"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                      <Eye className="w-3.5 h-3.5" /> View Page
                    </a>
                    {center.website && (
                      <a href={center.website} target="_blank"
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200">
                        <ExternalLink className="w-3.5 h-3.5" /> Website
                      </a>
                    )}
                    <button onClick={() => handleDelete(center.id, center.name)}
                      className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}