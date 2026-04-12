// app/user/dashboard/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFavorites } from "../../../contexts/FavoritesContext";
import { useCompare } from "../../../contexts/CompareContext";
import { Heart, GitCompare, Search, MessageSquare, User, Mail, Phone, LogOut, X, AlertCircle, Building2, ChevronRight, Plus, LogIn } from "lucide-react";
import AccountSwitcher from "../../../components/AccountSwitcher";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [switchingOrg, setSwitchingOrg] = useState(null);
  const [leavingOrg, setLeavingOrg] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(null);
  const router = useRouter();
  const { favoritesCount } = useFavorites();
  const { compareCount } = useCompare();

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    const userData = localStorage.getItem("userData");
    if (!isLoggedIn || !userData) {
      router.push("/login");
      return;
    }
    try {
      setUser(JSON.parse(userData));
      const savedOrgs = localStorage.getItem("userOrgs");
      if (savedOrgs) setOrgs(JSON.parse(savedOrgs));
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToInstitute = async (org) => {
    setSwitchingOrg(org.id);
    try {
      const userToken = localStorage.getItem("userToken");
      const res = await fetch(`${API_URL}/org/switch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("instituteLoggedIn", "true");
      localStorage.setItem("instituteToken", data.token);
      localStorage.setItem("instituteData", JSON.stringify(user));
      localStorage.setItem("instituteOrgs", JSON.stringify(orgs));
      window.dispatchEvent(new Event("authStateChanged"));
      router.push("/institute/dashboard");
    } catch (err) {
      console.error("Switch error:", err.message);
    } finally {
      setSwitchingOrg(null);
    }
  };

  const handleLeaveOrg = async () => {
    if (!showLeaveModal) return;
    setLeavingOrg(showLeaveModal.id);
    try {
      const userToken = localStorage.getItem("userToken");
      const membersRes = await fetch(`${API_URL}/org/${showLeaveModal.id}/members`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const membersData = await membersRes.json();
      if (!membersRes.ok) throw new Error(membersData.error);
      const myMembership = membersData.members.find(m => m.user?.email === user?.email);
      if (!myMembership) throw new Error("Membership not found");
      if (myMembership.role === "OWNER") {
        alert("You are the owner. Transfer ownership before leaving.");
        return;
      }
      const res = await fetch(`${API_URL}/org/${showLeaveModal.id}/members/${myMembership.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const updatedOrgs = orgs.filter(o => o.id !== showLeaveModal.id);
      setOrgs(updatedOrgs);
      localStorage.setItem("userOrgs", JSON.stringify(updatedOrgs));
      window.dispatchEvent(new Event("authStateChanged"));
      setShowLeaveModal(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLeavingOrg(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("userData");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userCity");
    localStorage.removeItem("userOrgs");
    localStorage.removeItem("userLat");
    localStorage.removeItem("userLng");
    setShowLogoutModal(false);
    router.push("/");
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
        <div className="text-center py-16">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-600 mb-4">Please login to access your dashboard.</p>
          <Link href="/login" className="inline-flex px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 text-sm font-medium">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 md:pb-8">

        {/* ✅ Account Switcher */}
        <AccountSwitcher mode="user" onLogout={() => setShowLogoutModal(true)} />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
          <Link href="/user/saved" className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-red-200 transition-all">
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{favoritesCount}</p>
                <p className="text-xs text-gray-600">Saved</p>
              </div>
            </div>
          </Link>
          <Link href="/user/compare" className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <GitCompare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{compareCount}</p>
                <p className="text-xs text-gray-600">Compare</p>
              </div>
            </div>
          </Link>
          <Link href="/user/reviews" className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-purple-200 transition-all">
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-900 font-semibold">Reviews</p>
                <p className="text-xs text-gray-600">Manage</p>
              </div>
            </div>
          </Link>
          <Link href="/centers" className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 hover:shadow-md hover:border-accent transition-all">
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-gray-900 font-semibold">Browse</p>
                <p className="text-xs text-gray-600">Centers</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-5 mb-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">Profile Information</h2>
            <Link href="/user/profile/edit" className="text-xs sm:text-sm text-accent hover:text-accent/80 font-medium">Edit</Link>
          </div>
          <div className="space-y-3">
            {[
              { icon: <User className="w-4 h-4 text-blue-600" />, bg: "bg-blue-100", label: "Name", value: user.name },
              { icon: <Mail className="w-4 h-4 text-green-600" />, bg: "bg-green-100", label: "Email", value: user.email },
              { icon: <Phone className="w-4 h-4 text-purple-600" />, bg: "bg-purple-100", label: "Phone", value: user.phone },
            ].map(({ icon, bg, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>{icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <Link href="/centers" className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-accent/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Browse Centers</h3>
                <p className="text-xs text-gray-600">Find training centers</p>
              </div>
            </div>
          </Link>
          <Link href="/user/saved" className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-accent/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                <Heart className="w-5 h-5 text-red-600" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{favoritesCount}</span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Saved Centers</h3>
                <p className="text-xs text-gray-600">{favoritesCount} saved</p>
              </div>
            </div>
          </Link>
          <Link href="/user/reviews" className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md hover:border-accent/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">My Reviews</h3>
                <p className="text-xs text-gray-600">Manage reviews</p>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Leave org modal */}
      {showLeaveModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowLeaveModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Leave Institute?</h3>
                <p className="text-gray-600 text-sm">
                  Are you sure you want to leave <strong>{showLeaveModal.name}</strong>? You will lose access to this institute's dashboard.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowLeaveModal(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleLeaveOrg} disabled={leavingOrg === showLeaveModal.id}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                  {leavingOrg === showLeaveModal.id ? "Leaving..." : "Leave"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowLogoutModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowLogoutModal(false)}
                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Logout?</h3>
                <p className="text-gray-600 text-sm">Are you sure you want to logout?</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleLogout}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}