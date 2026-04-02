// app/institute/login/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "../../../components/Footer";

export default function InstituteLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // ✅ ADDED: org switcher state
  const [organizations, setOrganizations] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const [switchingOrg, setSwitchingOrg] = useState(false);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      // ✅ If user has multiple orgs → show org switcher
      if (data.organizations && data.organizations.length > 1) {
        setUserData(data);
        setOrganizations(data.organizations);
        setShowOrgSwitcher(true);
        setLoading(false);
        return;
      }

      // ✅ Single org — login directly
      saveAndRedirect(data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // ✅ ADDED: save auth data and redirect
  const saveAndRedirect = (data) => {
    localStorage.setItem("instituteLoggedIn", "true");
    localStorage.setItem("instituteToken", data.token);
    localStorage.setItem("instituteData", JSON.stringify(data.user));
    // ✅ Save organizations for switcher
    localStorage.setItem("instituteOrgs", JSON.stringify(data.organizations || []));
    window.dispatchEvent(new Event('authStateChanged'));
    window.dispatchEvent(new Event('storage'));
    router.push("/institute/dashboard");
  };

  // ✅ ADDED: switch to selected org
  const handleSelectOrg = async (org) => {
    setSwitchingOrg(true);
    try {
      const response = await fetch(`${API_URL}/org/switch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`,
        },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to switch org");

      // ✅ Save with new token for selected org
      saveAndRedirect({ ...userData, token: data.token });
    } catch (err) {
      setError(err.message);
      setSwitchingOrg(false);
    }
  };

  // ✅ ADDED: Org Switcher UI
  if (showOrgSwitcher) {
    return (
      <>
        <main className="min-h-screen bg-white flex items-center justify-center px-4 py-8 pb-20">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white text-center">
                <h1 className="text-xl font-bold">Select Organization</h1>
                <p className="text-blue-100 text-sm mt-1">You have multiple organizations</p>
              </div>
              <div className="p-4 space-y-2">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrg(org)}
                    disabled={switchingOrg}
                    className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 text-left"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{org.name}</p>
                      <p className="text-xs text-gray-500">{org.city} · <span className="capitalize text-indigo-600 font-medium">{org.role}</span></p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
              {error && (
                <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}
              <div className="px-4 pb-4">
                <button
                  onClick={() => setShowOrgSwitcher(false)}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to login
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-white flex items-center justify-center px-4 py-8 pb-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white text-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">Institute Login</h1>
              <p className="text-blue-100 text-sm mt-1">Manage your institute</p>
            </div>

            {/* Form */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-600">Remember</span>
                  </label>
                  <Link href="/institute/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                    Forgot?
                  </Link>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6">
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/institute/register" className="text-blue-600 hover:text-blue-700 font-medium">Register</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}