// frontend/app/user/dashboard/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFavorites } from "../../../contexts/FavoritesContext";
import { useCompare } from "../../../contexts/CompareContext";
import {
  GitCompare, LogOut, AlertCircle, Loader2,
  MessageCircle, Bookmark, Mail, Phone,
  Hash, MapPin, Calendar, Copy, PenLine,
  Globe, MessageSquare, Camera, Users, Heart,
} from "lucide-react";
import AccountSwitcher from "../../../components/AccountSwitcher";
import PostCard from "../../feed/components/PostCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function genUserId(id = "") {
  return "INSCO_" + id.slice(-5).toUpperCase();
}

function genUsername(name = "") {
  return "@" + name.toLowerCase().replace(/\s+/g, "");
}

export default function UserDashboard() {
  const [user,            setUser]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [orgs,            setOrgs]            = useState([]);
  const [leavingOrg,      setLeavingOrg]      = useState(null);
  const [showLeaveModal,  setShowLeaveModal]  = useState(null);
  const [myPosts,         setMyPosts]         = useState([]);
  const [loadingPosts,    setLoadingPosts]    = useState(false);
  const [activeTab,       setActiveTab]       = useState("feed");
  const [copied,          setCopied]          = useState("");
  const [socialCounts,    setSocialCounts]    = useState({ followers: 0, following: 0, posts: 0 });

  const router = useRouter();
  const { favoritesCount } = useFavorites();
  const { compareCount }   = useCompare();

  useEffect(() => { checkAuth(); }, []);

  const freshProfile = async (token) => {
    try {
      const res  = await fetch(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const existing = JSON.parse(localStorage.getItem("userData") || "{}");
        const merged   = { ...existing, ...data.user };
        localStorage.setItem("userData", JSON.stringify(merged));
        return merged;
      }
    } catch {}
    return null;
  };

  const checkAuth = async () => {
    const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";
    const userData   = localStorage.getItem("userData");
    if (!isLoggedIn || !userData) { router.push("/login"); return; }
    try {
      const token  = localStorage.getItem("userToken");
      const cached = JSON.parse(userData);
      setUser(cached);
      const savedOrgs = localStorage.getItem("userOrgs");
      if (savedOrgs) setOrgs(JSON.parse(savedOrgs));
      loadMyPosts(cached);
      const fresh = await freshProfile(token);
      const active = fresh || cached;
      if (fresh) setUser(fresh);
      await loadSocialCounts(active.username, token);
    } catch { router.push("/login"); }
    finally  { setLoading(false); }
  };

  const loadSocialCounts = async (username, token) => {
    try {
      const t = token || localStorage.getItem("userToken");
      if (!username) {
        const res  = await fetch(`${API_URL}/user/profile`, { headers: { Authorization: `Bearer ${t}` } });
        const data = await res.json();
        if (res.ok) username = data.user.username;
      }
      if (!username) return;
      const res  = await fetch(`${API_URL}/social/users/${username}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (res.ok) setSocialCounts({
        followers: data.user.followersCount ?? 0,
        following: data.user.followingCount ?? 0,
        posts:     data.user.postsCount     ?? 0,
      });
    } catch {}
  };

  const loadMyPosts = async (u) => {
    setLoadingPosts(true);
    try {
      const token = localStorage.getItem("userToken");
      const res   = await fetch(`${API_URL}/feed?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const mine = (data.posts ?? []).filter(p => p.author.id === u.id || p.author.name === u.name);
        setMyPosts(mine);
      }
    } catch {}
    finally { setLoadingPosts(false); }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    });
  };

  const handleLeaveOrg = async () => {
    if (!showLeaveModal) return;
    setLeavingOrg(showLeaveModal.id);
    try {
      const userToken   = localStorage.getItem("userToken");
      const membersRes  = await fetch(`${API_URL}/org/${showLeaveModal.id}/members`, {
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
    finally { setLeavingOrg(null); }
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
  const username = user.username ? `@${user.username}` : genUsername(user.name);
  const userId   = genUserId(user.id);
  const joinedAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;
  const city = localStorage.getItem("userCity") || null;

  const currentUser = {
    id:       user.id,
    name:     user.name,
    initials,
    role:     user.role?.toLowerCase() ?? "user",
    color:    "blue",
    avatar:   user.avatar || null,
  };

  return (
    <>
      <main className="max-w-lg mx-auto pb-24 md:pb-8 space-y-3">

        <div className="px-4 pt-4">
          <AccountSwitcher mode="user" onLogout={() => setShowLogoutModal(true)} />
        </div>

        {/* ── Hero card ── */}
        <div className="mx-4 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg">

          {/* Top section: avatar + name + edit */}
          <div className="px-4 pt-5 pb-4">
            <div className="flex items-start gap-4">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30 bg-white/20 flex items-center justify-center shadow-lg">
                  {user.avatar
                    ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-2xl font-bold text-white">{initials}</span>
                  }
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-indigo-500" />
                <Link href="/user/profile/edit"
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
                  <Camera className="w-3 h-3 text-indigo-600" />
                </Link>
              </div>

              {/* Name + username + location */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h2 className="text-lg font-bold text-white leading-tight">{user.name}</h2>
                <p className="text-sm text-white/70 font-medium mt-0.5">{username}</p>
                {(user.location || city) && (
                  <p className="flex items-center gap-1 mt-1.5 text-xs text-white/55">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {user.location || city}
                  </p>
                )}
                {user.website && (
                  <a href={user.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 mt-1 text-xs text-white/55 hover:text-white/80 transition-colors truncate">
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    {user.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>

              {/* Edit button */}
              <Link href="/user/profile/edit"
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-xs font-semibold text-white transition-colors mt-0.5">
                <PenLine className="w-3 h-3" /> Edit
              </Link>
            </div>

            {/* Bio */}
            <div className="mt-3">
              {user.bio ? (
                <p className="text-sm text-white/80 leading-relaxed">{user.bio}</p>
              ) : (
                <Link href="/user/profile/edit"
                  className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
                  <PenLine className="w-3 h-3" /> Add a bio…
                </Link>
              )}
            </div>

            {/* Followers / Following row */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/15">
              <Link href="/users" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Users className="w-3.5 h-3.5 text-white/60" />
                <span className="text-sm font-bold text-white">{socialCounts.followers}</span>
                <span className="text-xs text-white/55">Followers</span>
              </Link>
              <Link href="/users" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Heart className="w-3.5 h-3.5 text-white/60" />
                <span className="text-sm font-bold text-white">{socialCounts.following}</span>
                <span className="text-xs text-white/55">Following</span>
              </Link>
              <Link href="/feed" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <MessageCircle className="w-3.5 h-3.5 text-white/60" />
                <span className="text-sm font-bold text-white">{socialCounts.posts}</span>
                <span className="text-xs text-white/55">Posts</span>
              </Link>
            </div>
          </div>

          {/* Stats bar — Saved & Compare */}
          <div className="bg-white grid grid-cols-2">
            {[
              { href: "/user/saved",   Icon: Bookmark,  label: "Saved",   value: favoritesCount },
              { href: "/user/compare", Icon: GitCompare, label: "Compare", value: compareCount   },
            ].map(({ href, Icon, label, value }, i, arr) => (
              <Link key={label} href={href}
                className={`flex items-center justify-center gap-2 py-3 hover:bg-gray-50 transition-colors ${i < arr.length - 1 ? "border-r border-gray-100" : ""}`}>
                <Icon className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-gray-900">{value}</span>
                <span className="text-xs text-gray-400">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Info card ── */}
        <div className="mx-4 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Info</p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-50">
            {[
              { Icon: Mail,     label: "Email",   value: user.email,  key: "email",  copyVal: user.email },
              { Icon: Phone,    label: "Phone",   value: user.phone,  key: "phone",  copyVal: user.phone },
              { Icon: Hash,     label: "User ID", value: userId,      key: "uid",    copyVal: userId     },
              { Icon: Calendar, label: "Joined",  value: joinedAt,    key: "joined", copyVal: null       },
              ...(city ? [{ Icon: MapPin, label: "City", value: city, key: "city", copyVal: null }] : []),
            ].map(({ Icon, label, value, key, copyVal }) => (
              <div key={key} className="flex items-center gap-2.5 px-4 py-3">
                <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                  <p className="text-xs text-gray-800 font-semibold truncate">{value ?? "—"}</p>
                </div>
                {copyVal && (
                  <button onClick={() => copyToClipboard(copyVal, key)} className="flex-shrink-0 p-1">
                    <Copy className={`w-3 h-3 transition-colors ${copied === key ? "text-emerald-500" : "text-gray-300 hover:text-gray-400"}`} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Activity tabs ── */}
        <div className="mx-4 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex border-b border-gray-100">
            {[
              { key: "feed",     label: "My Posts" },
              { key: "comments", label: "Comments" },
              { key: "saved",    label: "Saved"    },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                    : "text-gray-400 hover:text-gray-600"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "feed" && (
            loadingPosts ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              </div>
            ) : myPosts.length === 0 ? (
              <div className="py-12 text-center px-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-5 h-5 text-indigo-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500 mb-1">No posts yet</p>
                <p className="text-xs text-gray-400 mb-3">Share something with the community</p>
                <Link href="/feed" className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
                  Go to Feed →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {myPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onDeleted={id => {
                      setMyPosts(prev => prev.filter(p => p.id !== id));
                      setSocialCounts(prev => ({ ...prev, posts: Math.max(0, prev.posts - 1) }));
                    }}
                  />
                ))}
              </div>
            )
          )}

          {activeTab === "comments" && (
            <div className="py-12 text-center px-6">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">No comments yet</p>
            </div>
          )}

          {activeTab === "saved" && (
            <div className="py-12 text-center px-6">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Bookmark className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400 mb-1">No saved posts</p>
              <Link href="/user/saved" className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
                View saved centers →
              </Link>
            </div>
          )}
        </div>

        {/* ── Logout ── */}
        <div className="mx-4 pb-2">
          <button onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-100 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

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
                <button onClick={handleLogout} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}