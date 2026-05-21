// app/user/dashboard/page.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFavorites } from "../../../contexts/FavoritesContext";
import { useCompare } from "../../../contexts/CompareContext";
import {
  Heart, GitCompare, Search, MessageSquare,
  Mail, Phone, LogOut, X, AlertCircle,
  Camera, Loader2, ChevronRight, LayoutList,
  PenSquare, Settings
} from "lucide-react";
import AccountSwitcher from "../../../components/AccountSwitcher";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function UserDashboard() {
  const [user,            setUser]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [orgs,            setOrgs]            = useState([]);
  const [leavingOrg,      setLeavingOrg]      = useState(null);
  const [showLeaveModal,  setShowLeaveModal]  = useState(null);
  const [avatarPreview,   setAvatarPreview]   = useState(null);
  const [avatarFile,      setAvatarFile]      = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError,     setAvatarError]     = useState("");
  const fileInputRef = useRef(null);
  const router = useRouter();
  const { favoritesCount } = useFavorites();
  const { compareCount }   = useCompare();

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = () => {
    const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    const userData   = localStorage.getItem("userData");
    if (!isLoggedIn || !userData) { router.push("/login"); return; }
    try {
      const u = JSON.parse(userData);
      setUser(u);
      setAvatarPreview(u.avatar || null);
      const savedOrgs = localStorage.getItem("userOrgs");
      if (savedOrgs) setOrgs(JSON.parse(savedOrgs));
    } catch { router.push("/login"); }
    finally  { setLoading(false); }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setAvatarError("Image must be under 5MB."); return; }
    if (!file.type.startsWith("image/")) { setAvatarError("Please select an image file."); return; }
    setAvatarError("");
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    setAvatarError("");
    try {
      const token = localStorage.getItem("userToken");
      const fd    = new FormData();
      fd.append("image", avatarFile);
      const res  = await fetch(`${API_URL}/user/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const updated = { ...user, avatar: data.avatar };
      setUser(updated);
      setAvatarPreview(data.avatar);
      setAvatarFile(null);
      localStorage.setItem("userData", JSON.stringify(updated));
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSwitchToInstitute = async (org) => {
    try {
      const userToken = localStorage.getItem("userToken");
      const res  = await fetch(`${API_URL}/org/switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("instituteLoggedIn", "true");
      localStorage.setItem("instituteToken",    data.token);
      localStorage.setItem("instituteData",     JSON.stringify(user));
      localStorage.setItem("instituteOrgs",     JSON.stringify(orgs));
      window.dispatchEvent(new Event("authStateChanged"));
      router.push("/institute/dashboard");
    } catch (err) { console.error("Switch error:", err.message); }
  };

  const handleLeaveOrg = async () => {
    if (!showLeaveModal) return;
    setLeavingOrg(showLeaveModal.id);
    try {
      const userToken  = localStorage.getItem("userToken");
      const membersRes = await fetch(`${API_URL}/org/${showLeaveModal.id}/members`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const membersData = await membersRes.json();
      if (!membersRes.ok) throw new Error(membersData.error);
      const myMembership = membersData.members.find(m => m.user?.email === user?.email);
      if (!myMembership) throw new Error("Membership not found");
      if (myMembership.role === "OWNER") { alert("You are the owner. Transfer ownership before leaving."); return; }
      const res  = await fetch(`${API_URL}/org/${showLeaveModal.id}/members/${myMembership.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const updatedOrgs = orgs.filter(o => o.id !== showLeaveModal.id);
      setOrgs(updatedOrgs);
      localStorage.setItem("userOrgs", JSON.stringify(updatedOrgs));
      window.dispatchEvent(new Event("authStateChanged"));
      setShowLeaveModal(null);
    } catch (err) { alert(err.message); }
    finally      { setLeavingOrg(null); }
  };

  const handleLogout = () => {
    ["userLoggedIn","userData","userToken","userCity","userOrgs","userLat","userLng"]
      .forEach(k => localStorage.removeItem(k));
    setShowLogoutModal(false);
    router.push("/");
  };

  if (loading) return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    </main>
  );

  if (!user) return (
    <main className="max-w-2xl mx-auto px-4 py-6 text-center">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-sm text-gray-500 mb-4">Please login to access your dashboard.</p>
      <Link href="/login" className="inline-flex px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
        Go to Login
      </Link>
    </main>
  );

  const initials = user.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <>
      <main className="max-w-2xl mx-auto px-4 py-4 pb-24 md:pb-8 space-y-4">

        <AccountSwitcher mode="user" onLogout={() => setShowLogoutModal(true)} />

        {/* ── Hero profile card ── */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white relative overflow-hidden">
          {/* decorative circle */}
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

          <div className="relative flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center ring-2 ring-white/40">
                {avatarPreview
                  ? <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-xl font-bold text-white">{initials}</span>
                }
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Camera className="w-3 h-3 text-indigo-600" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{user.name}</h2>
              <p className="text-sm text-white/70 truncate">{user.email}</p>
              <p className="text-xs text-white/50 mt-0.5">{user.phone}</p>
            </div>

            <Link href="/user/profile/edit" className="flex-shrink-0 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
              <Settings className="w-4 h-4 text-white" />
            </Link>
          </div>

          {/* Upload button */}
          {avatarFile && (
            <div className="relative mt-3 flex items-center gap-2">
              <button
                onClick={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-indigo-600 text-xs font-bold rounded-full shadow hover:bg-white/90 disabled:opacity-60 transition-all"
              >
                {uploadingAvatar ? <><Loader2 className="w-3 h-3 animate-spin" />Uploading...</> : "Save Photo"}
              </button>
              <button onClick={() => { setAvatarFile(null); setAvatarPreview(user.avatar || null); }}
                className="text-xs text-white/70 hover:text-white transition-colors">Cancel</button>
            </div>
          )}
          {avatarError && <p className="relative mt-2 text-xs text-red-300">{avatarError}</p>}
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { href: "/user/saved",   icon: Heart,         label: "Saved",   value: favoritesCount, color: "text-red-500",    bg: "bg-red-50" },
            { href: "/user/compare", icon: GitCompare,    label: "Compare", value: compareCount,   color: "text-blue-500",   bg: "bg-blue-50" },
            { href: "/user/reviews", icon: MessageSquare, label: "Reviews", value: null,           color: "text-purple-500", bg: "bg-purple-50" },
            { href: "/centers",      icon: Search,        label: "Browse",  value: null,           color: "text-indigo-500", bg: "bg-indigo-50" },
          ].map(({ href, icon: Icon, label, value, color, bg }) => (
            <Link key={label} href={href}
              className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col items-center gap-1.5 hover:shadow-md hover:border-indigo-100 transition-all">
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              {value !== null && <span className="text-base font-bold text-gray-900 leading-none">{value}</span>}
              <span className="text-[10px] text-gray-500 font-medium">{label}</span>
            </Link>
          ))}
        </div>

        {/* ── Feed CTA ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-900">Learning Feed</span>
            <Link href="/feed" className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700">
              <LayoutList className="w-3.5 h-3.5" /> View all
            </Link>
          </div>
          <Link href="/feed"
            className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all group">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-indigo-700">
              {initials}
            </div>
            <span className="flex-1 text-sm text-gray-400 group-hover:text-indigo-500 transition-colors">
              Share notes, tips or a question...
            </span>
            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <PenSquare className="w-3.5 h-3.5 text-white" />
            </div>
          </Link>
        </div>

        {/* ── Quick links ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {[
            { href: "/centers",      icon: Search,        label: "Browse Centers",  sub: "Find training centers near you",  color: "bg-blue-50 text-blue-600" },
            { href: "/user/saved",   icon: Heart,         label: "Saved Centers",   sub: `${favoritesCount} centers saved`,  color: "bg-red-50 text-red-600" },
            { href: "/user/reviews", icon: MessageSquare, label: "My Reviews",      sub: "Manage your reviews",             color: "bg-purple-50 text-purple-600" },
          ].map(({ href, icon: Icon, label, sub, color }, i, arr) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>

        {/* ── Logout ── */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-100 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>

      </main>

      {/* Leave org modal */}
      {showLeaveModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowLeaveModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 text-center mb-1">Leave Institute?</h3>
              <p className="text-sm text-gray-500 text-center mb-5">
                Are you sure you want to leave <strong>{showLeaveModal.name}</strong>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowLeaveModal(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleLeaveOrg} disabled={leavingOrg === showLeaveModal.id}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                  {leavingOrg === showLeaveModal.id ? "Leaving..." : "Leave"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Logout modal */}
      {showLogoutModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowLogoutModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowLogoutModal(false)} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 text-center mb-1">Logout?</h3>
              <p className="text-sm text-gray-500 text-center mb-5">Are you sure you want to logout?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleLogout} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}