// frontend/app/users/[username]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, UserPlus, Loader2, Building2,
  Heart, MessageCircle, Bookmark, Calendar,
  GraduationCap, User, MoreHorizontal
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userToken") || null;
}
function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400)return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
}

const ROLE_CFG = {
  institute: { label: "Institute", cls: "bg-blue-50 text-blue-700 border border-blue-100",   Icon: Building2    },
  user:      { label: "Student",   cls: "bg-green-50 text-green-700 border border-green-100", Icon: User         },
  admin:     { label: "Admin",     cls: "bg-purple-50 text-purple-700 border border-purple-100", Icon: GraduationCap },
};

export default function UserProfilePage() {
  const { username } = useParams();
  const router       = useRouter();

  const [profile,      setProfile]      = useState(null);
  const [posts,        setPosts]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [following,    setFollowing]    = useState(false);
  const [followLoading,setFollowLoading]= useState(false);
  const [activeTab,    setActiveTab]    = useState("posts");

  useEffect(() => { fetchProfile(); }, [username]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/social/users/${username}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { router.push("/users"); return; }
      setProfile(data.user);
      setFollowing(data.user.isFollowing);
      fetchPosts();
    } catch {
      router.push("/users");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPosts() {
    setLoadingPosts(true);
    try {
      const res  = await fetch(`${API_URL}/social/users/${username}/posts`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setPosts(data.posts ?? []);
    } catch {}
    finally { setLoadingPosts(false); }
  }

  async function toggleFollow() {
    if (!getToken() || profile?.isMe) return;
    setFollowLoading(true);
    const was = following;
    setFollowing(v => !v);
    setProfile(p => ({ ...p, followersCount: p.followersCount + (was ? -1 : 1) }));
    try {
      const res = await fetch(`${API_URL}/social/${profile.id}/follow`, {
        method:  was ? "DELETE" : "POST",
        headers: authHeaders(),
      });
      if (!res.ok) {
        setFollowing(was);
        setProfile(p => ({ ...p, followersCount: p.followersCount + (was ? 1 : -1) }));
      }
    } catch {
      setFollowing(was);
      setProfile(p => ({ ...p, followersCount: p.followersCount + (was ? 1 : -1) }));
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) return (
    <div className="max-w-lg mx-auto py-20 flex justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    </div>
  );

  if (!profile) return null;

  const roleCfg  = ROLE_CFG[profile.role] ?? ROLE_CFG.user;
  const initials = getInitials(profile.name);
  const joinedAt = new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <div className="max-w-lg mx-auto pb-24 md:pb-8">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{profile.name}</p>
            <p className="text-xs text-gray-400">@{profile.username}</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div className="mx-4 mt-3 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 text-white">
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-start gap-4 mb-4">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 bg-white/20 flex items-center justify-center">
                {profile.avatar
                  ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  : <span className="text-2xl font-bold text-white">{initials}</span>
                }
              </div>
              {/* online dot */}
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
            </div>

            {/* Name + role + follow */}
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-lg font-bold text-white leading-tight">{profile.name}</h1>
              <p className="text-sm text-white/70 mt-0.5">@{profile.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleCfg.cls}`}>
                  <roleCfg.Icon className="w-2.5 h-2.5" />{roleCfg.label}
                </span>
                {profile.orgName && (
                  <span className="text-[10px] text-white/60 truncate">{profile.orgName}</span>
                )}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-white/60 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Joined {joinedAt}
            </span>
          </div>

          {/* Follow / Edit button */}
          {profile.isMe ? (
            <Link href="/user/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold text-white transition-colors">
              Edit Profile
            </Link>
          ) : (
            <button onClick={toggleFollow} disabled={followLoading}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                following
                  ? "bg-white/20 hover:bg-white/30 text-white"
                  : "bg-white text-indigo-600 hover:bg-white/90"
              }`}>
              {followLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : following
                  ? "Following"
                  : <><UserPlus className="w-4 h-4" /> Follow</>
              }
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white grid grid-cols-3">
          {[
            { label: "Posts",     value: profile.postsCount     },
            { label: "Followers", value: profile.followersCount },
            { label: "Following", value: profile.followingCount },
          ].map(({ label, value }, i, arr) => (
            <div key={label}
              className={`flex flex-col items-center py-3 ${i < arr.length - 1 ? "border-r border-gray-100" : ""}`}>
              <span className="text-sm font-bold text-gray-900">{value}</span>
              <span className="text-[10px] text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="mx-4 mt-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">

        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {[{ key: "posts", label: "Posts" }, { key: "about", label: "About" }].map(tab => (
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

        {/* Posts tab */}
        {activeTab === "posts" && (
          loadingPosts ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            </div>
          ) : posts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">No posts yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {posts.map(post => (
                <div key={post.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      {profile.avatar
                        ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                        : <span className="text-[10px] font-bold text-indigo-600">{initials}</span>
                      }
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{profile.name}</p>
                      <p className="text-[10px] text-gray-400">{timeAgo(post.createdAt)} ago</p>
                    </div>
                  </div>
                  {post.image && (
                    <img src={post.image} alt="" className="w-full rounded-xl object-cover max-h-48 mb-2" />
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
                </div>
              ))}
            </div>
          )
        )}

        {/* About tab */}
        {activeTab === "about" && (
          <div className="px-4 py-5 space-y-3">
            {[
              { label: "Role",         value: roleCfg.label },
              { label: "Organization", value: profile.orgName || "—" },
              { label: "Joined",       value: joinedAt },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-xs font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}