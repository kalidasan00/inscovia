"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "../../../../components/Footer";
import { X, Plus, ArrowLeft, Save } from "lucide-react";

const POPULAR_COUNTRIES = [
  "USA", "UK", "Canada", "Australia", "Germany", "France", "New Zealand",
  "Singapore", "Ireland", "Netherlands", "Sweden", "Switzerland", "Japan", "Dubai"
];

const POPULAR_SERVICES = [
  "Visa Assistance", "University Admission", "IELTS Coaching", "TOEFL Coaching",
  "SOP Writing", "LOR Assistance", "Scholarship Guidance", "Pre-Departure Briefing",
  "Accommodation Help", "Education Loan Guidance", "Interview Preparation", "Document Verification"
];

export default function StudyAbroadManage() {
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [countries, setCountries] = useState([]);
  const [services, setServices] = useState([]);
  const [topUniversities, setTopUniversities] = useState([]);
  const [avgScholarship, setAvgScholarship] = useState("");
  const [successRate, setSuccessRate] = useState("");
  const [studentsPlaced, setStudentsPlaced] = useState("");

  const [newCountry, setNewCountry] = useState("");
  const [newUniversity, setNewUniversity] = useState("");

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      // Only study abroad consultants can access this page
      if (data.user?.primaryCategory !== "STUDY_ABROAD") {
        router.push("/institute/dashboard");
        return;
      }

      setCenter(data.center);
      setCountries(data.center?.countries || []);
      setServices(data.center?.services || []);
      setTopUniversities(data.center?.topUniversities || []);
      setAvgScholarship(data.center?.avgScholarship || "");
      setSuccessRate(data.center?.successRate || "");
      setStudentsPlaced(data.center?.studentsPlaced?.toString() || "");
    } catch (err) {
      router.push("/institute/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    const token = localStorage.getItem("instituteToken");

    try {
      const res = await fetch(`${API_URL}/centers/${center.slug}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          countries,
          services,
          topUniversities,
          avgScholarship: avgScholarship || null,
          successRate: successRate || null,
          studentsPlaced: studentsPlaced ? parseInt(studentsPlaced) : null,
        })
      });

      if (!res.ok) throw new Error("Failed to save");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleCountry = (country) => {
    setCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const addCustomCountry = () => {
    const val = newCountry.trim();
    if (!val || countries.includes(val)) return;
    setCountries(prev => [...prev, val]);
    setNewCountry("");
  };

  const removeCountry = (country) => setCountries(prev => prev.filter(c => c !== country));

  const toggleService = (service) => {
    setServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const addUniversity = () => {
    const val = newUniversity.trim();
    if (!val || topUniversities.includes(val)) return;
    setTopUniversities(prev => [...prev, val]);
    setNewUniversity("");
  };

  const removeUniversity = (uni) => setTopUniversities(prev => prev.filter(u => u !== uni));

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Link href="/institute/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Manage Study Abroad Profile</h1>
            <p className="text-xs text-gray-500">Add countries, services and stats</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">✅ Saved successfully!</div>
        )}

        <div className="space-y-5">

          {/* Countries */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Countries You Handle</h2>

            {/* Selected countries */}
            {countries.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {countries.map(c => (
                  <span key={c} className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    🌍 {c}
                    <button onClick={() => removeCountry(c)} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Popular countries */}
            <p className="text-xs text-gray-500 mb-2">Popular countries:</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {POPULAR_COUNTRIES.map(c => (
                <button key={c} onClick={() => toggleCountry(c)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                    countries.includes(c)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}>
                  {c}
                </button>
              ))}
            </div>

            {/* Custom country */}
            <div className="flex gap-2">
              <input type="text" value={newCountry} onChange={e => setNewCountry(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustomCountry()}
                placeholder="Add other country..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={addCustomCountry}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Services You Offer</h2>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_SERVICES.map(service => (
                <button key={service} onClick={() => toggleService(service)}
                  className={`px-3 py-2.5 border-2 rounded-lg text-xs font-medium text-left transition-all ${
                    services.includes(service)
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                  }`}>
                  <div className="flex items-center justify-between">
                    <span>{service}</span>
                    {services.includes(service) && (
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Top Universities */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Top Universities (Placements)</h2>

            {topUniversities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {topUniversities.map(uni => (
                  <span key={uni} className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    🎓 {uni}
                    <button onClick={() => removeUniversity(uni)} className="hover:text-amber-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input type="text" value={newUniversity} onChange={e => setNewUniversity(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addUniversity()}
                placeholder="e.g. University of Toronto"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={addUniversity}
                className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border rounded-xl p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Stats & Achievements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Students Placed</label>
                <input type="number" value={studentsPlaced} onChange={e => setStudentsPlaced(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Success Rate</label>
                <input type="text" value={successRate} onChange={e => setSuccessRate(e.target.value)}
                  placeholder="e.g. 95%"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Avg Scholarship</label>
                <input type="text" value={avgScholarship} onChange={e => setAvgScholarship(e.target.value)}
                  placeholder="e.g. 50% - 100%"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>
      </main>
      <Footer />
    </>
  );
}ys