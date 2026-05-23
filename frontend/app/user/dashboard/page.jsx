// frontend/app/user/dashboard/page.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFavorites } from "../../../contexts/FavoritesContext";
import { useCompare } from "../../../contexts/CompareContext";
import {
  Heart, GitCompare, MessageSquare, LogOut,
  AlertCircle, Camera, Loader2,
  MessageCircle, Bookmark, Mail,
  Phone, Hash, MapPin, Calendar, Copy,
  MoreHorizontal, PenLine, Globe
} from "lucide-react";
import AccountSwitcher from "../../../components/AccountSwitcher";

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
  const [avatarPreview,   setAvatarPreview]   = useState(null);
  const [avatarFile,      setAvatarFile]      = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError,     setAvatarError]     = useState("");
  const [myPosts,         setMyPosts]         = useState([]);
  const [loadingPosts,    setLoadingPosts]    = useState(false);
  const [activeTab,       setActiveTab]       = useState("feed");
  const [copied,          setCopied]          = useState("");
  const [socialCounts,    setSocialCounts]    = useState({ followers: 0, following: 0, posts: 0 });
  const fileInputRef = useRef(null);
  const router       = useRouter();
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
      setAvatarPreview(cached.avatar || null);
      const savedOrgs = localStorage.getItem("userOrgs");
      if (savedOrgs) setOrgs(JSON.parse(savedOrgs));
      loadMyPosts(cached);
      loadSocialCounts(cached);
      const fresh = await freshProfile(token);
      if (fresh) {
        setUser(fresh);
        setAvatarPreview(fresh.avatar || null);
        loadSocialCounts(fresh);
      }
    } catch { router.push("/login"); }
    finally  { setLoading(false); }
  };

  const loadSocialCounts = async (u) => {
    try {
      const token = localStorage.getItem("userToken");
      let username = u?.username;
      if (!username) {
        const res  = await fetch(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) username = data.user.username;
      }
      if (!username) return;
      const res  = await fetch(`${API_URL}/social/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSocialCounts({
          followers: data.user.followersCount,
          following: data.user.followingCount,
          posts:     data.user.postsCount,
        });
      }
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
  const username = user.username ? `@${user.username}` : genUsername(user.name);
  const userId   = genUserId(user.id);
  const joinedAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;
  const city = localStorage.getItem("userCity") || null;

  return (
    <>
      <main className="max-w-lg mx-auto pb-24 md:pb-8 space-y-3">

        <div className="px-4 pt-4">
          <AccountSwitcher mode="user" onLogout={() => setShowLogoutModal(true)} />
        </div>

        {/* ── Hero card ── */}
        <div className="mx-4 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 text-white">
          <div className="px-4 pt-4 pb-4">

            <div className="flex items-start gap-3 mb-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 bg-white/20 flex items-center justify-center">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-xl font-bold text-white">{initials}</span>
                  }
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                <button onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
                  <Camera className="w-2.5 h-2.5 text-indigo-600" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Name + username + location */}
              <div className="flex-1 min-w-0 pt-1">
                <h2 className="text-base font-bold text-white leading-tight truncate">{user.name}</h2>
                <span className="inline-block mt-1 text-[11px] font-medium bg-white/20 text-white/90 px-2 py-0.5 rounded-full">
                  {username}
                </span>
                {user.location && (
                  <p className="flex items-center gap-1 mt-1 text-[11px] text-white/60">
                    <MapPin className="w-2.5 h-2.5" />{user.location}
                  </p>
                )}
              </div>

              {/* Edit button */}
              <div className="flex-shrink-0 pt-1">
                <Link href="/user/profile/edit"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold text-white transition-colors">
                  <PenLine className="w-3 h-3" /> Edit
                </Link>
              </div>
            </div>

            {/* Bio */}
            {user.bio ? (
              <p className="text-xs text-white/80 leading-relaxed mb-2">{user.bio}</p>
            ) : (
              <Link href="/user/profile/edit"
                className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white/80 mb-2 transition-colors">
                <PenLine className="w-3 h-3" /> Add a bio
              </Link>
            )}

            {/* Website */}
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white/90 mb-2 transition-colors">
                <Globe className="w-3 h-3" />
                {user.website.replace(/^https?:\/\//, "")}
              </a>
            )}

            {/* Save photo */}
            {avatarFile && (
              <div className="flex items-center gap-2 mt-2">
                <button onClick={handleAvatarUpload} disabled={uploadingAvatar}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-indigo-600 text-xs font-bold rounded-full disabled:opacity-60 hover:bg-white/90 transition-colors">
                  {uploadingAvatar ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</> : "Save Photo"}
                </button>
                <button onClick={() => { setAvatarFile(null); setAvatarPreview(user.avatar || null); }}
                  className="text-xs text-white/70 hover:text-white transition-colors">Cancel</button>
              </div>
            )}
            {avatarError && <p className="text-xs text-red-300 mt-1">{avatarError}</p>}
          </div>

          {/* Stats */}
          <div className="bg-white grid grid-cols-4">
            {[
              { href: "/user/saved",   Icon: Bookmark,     label: "Saved",     value: favoritesCount        },
              { href: "/user/compare", Icon: GitCompare,    label: "Compare",   value: compareCount          },
              { href: "/users",        Icon: MessageSquare, label: "Followers", value: socialCounts.followers },
              { href: "/feed",         Icon: MessageCircle, label: "Posts",     value: socialCounts.posts     },
            ].map(({ href, Icon, label, value }, i, arr) => (
              <Link key={label} href={href}
                className={`flex flex-col items-center py-3 hover:bg-gray-50 transition-colors ${i < arr.length - 1 ? "border-r border-gray-100" : ""}`}>
                <Icon className="w-4 h-4 text-gray-400 mb-1" />
                <span className="text-sm font-bold text-gray-900">{value}</span>
                <span className="text-[10px] text-gray-400">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Info card ── */}
        <div className="mx-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {[
            { Icon: Mail,     label: user.email,            key: "email",  copyVal: user.email },
            { Icon: Phone,    label: user.phone,             key: "phone",  copyVal: user.phone },
            { Icon: Hash,     label: `User ID: ${userId}`,   key: "uid",    copyVal: userId     },
            ...(city     ? [{ Icon: MapPin,   label: city,                key: "city",   copyVal: null }] : []),
            ...(joinedAt ? [{ Icon: Calendar, label: `Joined ${joinedAt}`, key: "joined", copyVal: null }] : []),
          ].map(({ Icon, label, key, copyVal }, i, arr) => (
            <div key={key}
              className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
              <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-sm text-gray-700 truncate">{label}</span>
              {copyVal && (
                <button onClick={() => copyToClipboard(copyVal, key)}
                  className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <Copy className={`w-3.5 h-3.5 ${copied === key ? "text-green-500" : "text-gray-300"}`} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ── Activity tabs ── */}
        <div className="mx-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {[
              { key: "feed",     label: "My Feed"  },
              { key: "comments", label: "Comments" },
              { key: "saved",    label: "Saved"    },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "feed" && (
            loadingPosts ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              </div>
            ) : myPosts.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xs text-gray-400">No posts yet.</p>
                <Link href="/feed" className="mt-1.5 inline-block text-xs text-indigo-600 font-medium">Share something →</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {myPosts.map(post => (
                  <Link href="/feed" key={post.id} className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        {avatarPreview
                          ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                          : <span className="text-[10px] font-bold text-indigo-600">{initials}</span>
                        }
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{user.name}</p>
                        <p className="text-[10px] text-gray-400">{username}</p>
                      </div>
                      <button className="ml-auto p-1 text-gray-300 hover:text-gray-500">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{post.time} ago</p>
                    {post.image && (
                      <img src={post.image} alt="" className="w-full rounded-xl object-cover max-h-40 mb-2" />
                    )}
                    {post.content && (
                      <p className="text-sm text-gray-800 mb-2">{post.content}</p>
                    )}
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Heart className="w-3.5 h-3.5" /> {post.likesCount}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MessageCircle className="w-3.5 h-3.5" /> {post.commentsCount}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Bookmark className="w-3.5 h-3.5" /> {post.savesCount}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {activeTab === "comments" && (
            <div className="py-10 text-center">
              <p className="text-xs text-gray-400">Your comments will appear here.</p>
            </div>
          )}

          {activeTab === "saved" && (
            <div className="py-10 text-center">
              <p className="text-xs text-gray-400">Your saved posts will appear here.</p>
              <Link href="/user/saved" className="mt-1.5 inline-block text-xs text-indigo-600 font-medium">View saved centers →</Link>
            </div>
          )}
        </div>

        {/* ── Logout ── */}
        <div className="mx-4">
          <button onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-100 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors">
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