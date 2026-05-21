"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFavorites } from "../../../contexts/FavoritesContext";
import { useCompare } from "../../../contexts/CompareContext";
import {
  Heart, GitCompare, Search, MessageSquare,
  LogOut, X, AlertCircle, Camera, Loader2,
  ChevronRight, Settings, FileText, Image as ImageIcon,
  MessageCircle, Bookmark
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
  const [myPosts,         setMyPosts]         = useState([]);
  const [loadingPosts,    setLoadingPosts]    = useState(false);
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
      loadMyPosts(u);
    } catch { router.push("/login"); }
    finally  { setLoading(false); }
  };

  const loadMyPosts = async (u) => {
    setLoadingPosts(true);
    try {
      const token = localStorage.getItem("userToken");
      const res = await fetch(`${API_URL}/feed?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        // filter only current user's posts
        const mine = (data.posts ?? []).filter(p => p.author.name === u.name);
        setMyPosts(mine);
      }
    } catch {}
    finally { setLoadingPosts(false); }
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
    <main className="max-w-lg mx-auto px-4 py-10 flex justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    </main>
  );

  if (!user) return (
    <main className="max-w-lg mx-auto px-4 py-10 text-center">
      <p className="text-sm text-gray-500 mb-4">Please login to continue.</p>
      <Link href="/login" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
        Go to Login
      </Link>
    </main>
  );

  const initials = user.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <>
      <main className="max-w-lg mx-auto px-4 py-4 pb-24 md:pb-8 space-y-3">

        <AccountSwitcher mode="user" onLogout={() => setShowLogoutModal(true)} />

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* top strip */}
          <div className="h-16 bg-gradient-to-r from-indigo-500 to-violet-500" />
          <div className="px-4 pb-4 -mt-8 flex items-end justify-between gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-sm bg-indigo-100 flex items-center justify-center">
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-xl font-bold text-indigo-600">{initials}</span>
                }
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:bg-indigo-50 transition-colors"
              >
                <Camera className="w-3 h-3 text-indigo-600" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <Link href="/user/profile/edit" className="mb-1 flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              <Settings className="w-3.5 h-3.5" /> Edit Profile
            </Link>
          </div>

          <div className="px-4 pb-4">
            <h2 className="text-base font-bold text-gray-900">{user.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
            {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}

            {/* Save photo button */}
            {avatarFile && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full disabled:opacity-60 hover:bg-indigo-700 transition-colors"
                >
                  {uploadingAvatar ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</> : "Save Photo"}
                </button>
                <button
                  onClick={() => { setAvatarFile(null); setAvatarPreview(user.avatar || null); }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            {avatarError && <p className="mt-1 text-xs text-red-500">{avatarError}</p>}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 border-t border-gray-100">
            {[
              { href: "/user/saved",   label: "Saved",   value: favoritesCount },
              { href: "/user/compare", label: "Compare", value: compareCount   },
              { href: "/user/reviews", label: "Reviews", value: "—"            },
              { href: "/feed",         label: "Feed",    value: myPosts.length },
            ].map(({ href, label, value }, i, arr) => (
              <Link key={label} href={href}
                className={`flex flex-col items-center py-3 hover:bg-gray-50 transition-colors ${i < arr.length - 1 ? "border-r border-gray-100" : ""}`}>
                <span className="text-sm font-bold text-gray-900">{value}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── My recent activity ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">My Posts</span>
            <Link href="/feed" className="text-xs text-indigo-600 font-medium hover:text-indigo-700">View feed</Link>
          </div>

          {loadingPosts ? (
            <div className="py-6 flex justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
          ) : myPosts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-gray-400">No posts yet.</p>
              <Link href="/feed" className="mt-2 inline-block text-xs text-indigo-600 font-medium hover:text-indigo-700">
                Share something →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myPosts.map((post) => (
                <Link href="/feed" key={post.id} className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  {/* thumbnail if image */}
                  {post.image
                    ? <img src={post.image} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {post.pdf
                          ? <FileText className="w-5 h-5 text-red-400" />
                          : <MessageCircle className="w-5 h-5 text-gray-300" />
                        }
                      </div>
                    )
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug line-clamp-2">
                      {post.content || (post.image ? "📷 Photo" : "📄 Attachment")}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-gray-400">{post.time}</span>
                      <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                        <Heart className="w-3 h-3" /> {post.likesCount}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                        <MessageCircle className="w-3 h-3" /> {post.commentsCount}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                        <Bookmark className="w-3 h-3" /> {post.savesCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick links ── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {[
            { href: "/centers",      Icon: Search,        label: "Browse Centers",  sub: "Find training centers near you"  },
            { href: "/user/saved",   Icon: Heart,         label: "Saved Centers",   sub: `${favoritesCount} centers saved` },
            { href: "/user/reviews", Icon: MessageSquare, label: "My Reviews",      sub: "Manage your reviews"             },
          ].map(({ href, Icon, label, sub }, i, arr) => (
            <Link key={label} href={href}
              className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-gray-500" />
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
              <p className="text-sm text-gray-500 text-center mb-5">Are you sure you want to leave <strong>{showLeaveModal.name}</strong>?</p>
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
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 text-center mb-1">Logout?</h3>
              <p className="text-sm text-gray-500 text-center mb-5">Are you sure you want to logout?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={() => handleLogout()} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}