// frontend/app/users/[username]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, UserPlus, UserCheck, Loader2,
  Heart, MessageCircle, Bookmark, Calendar,
  User, MapPin, Globe, Users, MessageSquare,
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
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ─── Follower modal ───────────────────────────────────────────────────────────

function FollowListModal({ title, username, type, onClose }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API_URL}/social/users/${username}/${type}`, { headers: authHeaders() });
        const data = await res.json();
        if (res.ok) setList(data.users ?? data.followers ?? data.following ?? []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [username, type]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/4 z-50 bg-white rounded-2xl shadow-2xl max-w-sm mx-auto overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors text-gray-400 text-xl leading-none">
            ×
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            </div>
          ) : list.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400">Nobody here yet.</p>
            </div>
          ) : list.map(u => (
            <Link key={u.id} href={`/users/${u.username ?? u.id}`} onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {u.avatar
                  ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                  : <span className="text-xs font-bold text-indigo-600">{getInitials(u.name)}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                {u.username && <p className="text-xs text-gray-400">@{u.username}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Post item ────────────────────────────────────────────────────────────────

function PostItem({ post, profile }) {
  const initials = getInitials(profile.name);
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl overflow-hidden bg-indigo-100 flex items-center justify-center flex-shrink-0">
          {profile.avatar
            ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            : <span className="text-[11px] font-bold text-indigo-600">{initials}</span>
          }
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-tight">{profile.name}</p>
          <p className="text-[10px] text-gray-400">{timeAgo(post.createdAt)}</p>
        </div>
      </div>
      {post.image && (
        <img src={post.image} alt="" className="w-full rounded-xl object-cover max-h-56 mb-3" />
      )}
      {post.content && (
        <p className="text-sm text-gray-800 leading-relaxed mb-3">{post.content}</p>
      )}
      <div className="flex items-center gap-5 pt-2 border-t border-gray-50">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <Heart className="w-3.5 h-3.5" /> {post.likesCount ?? 0}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <MessageCircle className="w-3.5 h-3.5" /> {post.commentsCount ?? 0}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <Bookmark className="w-3.5 h-3.5" /> {post.savesCount ?? 0}
        </span>
      </div>
    </div>
  );
}

// ─── Follow button (shared, instant optimistic) ───────────────────────────────

function FollowButton({ profile, following, onToggle, loading, size = "md" }) {
  if (profile.isMe) return null;
  const sm = size === "sm";
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 font-bold transition-colors rounded-xl ${
        sm ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${
        following
          ? "bg-white/15 hover:bg-white/25 text-white border border-white/20"
          : "bg-white text-indigo-600 hover:bg-white/90 shadow-sm"
      }`}>
      {following
        ? <><UserCheck className={sm ? "w-3 h-3" : "w-4 h-4"} /> Following</>
        : <><UserPlus  className={sm ? "w-3 h-3" : "w-4 h-4"} /> Follow</>
      }
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const { username } = useParams();
  const router       = useRouter();

  const [profile,      setProfile]      = useState(null);
  const [posts,        setPosts]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [following,    setFollowing]    = useState(false);
  const [activeTab,    setActiveTab]    = useState("posts");
  const [modal,        setModal]        = useState(null);

  useEffect(() => { fetchProfile(); }, [username]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/social/users/${username}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { router.push("/users"); return; }
      setProfile(data.user);
      setFollowing(data.user.isFollowing ?? false);
      fetchPosts();
    } catch { router.push("/users"); }
    finally   { setLoading(false); }
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

  // Instant optimistic toggle — no spinner, no await UI block
  async function toggleFollow() {
    if (!getToken() || profile?.isMe) return;
    const was = following;
    // Flip immediately
    setFollowing(!was);
    setProfile(p => ({ ...p, followersCount: (p.followersCount ?? 0) + (was ? -1 : 1) }));
    try {
      const res = await fetch(`${API_URL}/social/${profile.id}/follow`, {
        method:  was ? "DELETE" : "POST",
        headers: authHeaders(),
      });
      if (!res.ok) {
        // Revert silently if server rejected
        setFollowing(was);
        setProfile(p => ({ ...p, followersCount: (p.followersCount ?? 0) + (was ? 1 : -1) }));
      }
    } catch {
      setFollowing(was);
      setProfile(p => ({ ...p, followersCount: (p.followersCount ?? 0) + (was ? 1 : -1) }));
    }
  }

  if (loading) return (
    <div className="max-w-lg mx-auto py-20 flex justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    </div>
  );
  if (!profile) return null;

  const initials = getInitials(profile.name);
  const joinedAt = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  return (
    <>
      {modal && (
        <FollowListModal
          title={modal === "followers" ? "Followers" : "Following"}
          username={profile.username ?? username}
          type={modal}
          onClose={() => setModal(null)}
        />
      )}

      <div className="max-w-lg mx-auto pb-24 md:pb-8">

        {/* ── Sticky header ── */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="px-4 h-14 flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{profile.name}</p>
              <p className="text-[11px] text-gray-400">@{profile.username}</p>
            </div>
            {!profile.isMe && (
              <button onClick={toggleFollow}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  following
                    ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}>
                {following
                  ? <><UserCheck className="w-3 h-3" /> Following</>
                  : <><UserPlus  className="w-3 h-3" /> Follow</>
                }
              </button>
            )}
          </div>
        </div>

        {/* ── Hero card ── */}
        <div className="mx-4 mt-3 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg">
          <div className="px-4 pt-5 pb-5">

            {/* Avatar + name + follow */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/25 bg-white/20 flex items-center justify-center shadow-lg">
                  {profile.avatar
                    ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    : <span className="text-2xl font-bold text-white">{initials}</span>
                  }
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-indigo-500" />
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <h1 className="text-lg font-bold text-white leading-tight">{profile.name}</h1>
                <p className="text-sm text-white/60 mt-0.5">@{profile.username}</p>
              </div>

              {/* Follow / Edit */}
              {profile.isMe ? (
                <Link href="/user/profile/edit"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-xs font-semibold text-white transition-colors mt-1">
                  Edit
                </Link>
              ) : (
                <div className="flex-shrink-0 mt-1">
                  <button onClick={toggleFollow}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                      following
                        ? "bg-white/15 hover:bg-white/25 text-white border border-white/20"
                        : "bg-white text-indigo-600 hover:bg-white/90 shadow-sm"
                    }`}>
                    {following
                      ? <><UserCheck className="w-3.5 h-3.5" /> Following</>
                      : <><UserPlus  className="w-3.5 h-3.5" /> Follow</>
                    }
                  </button>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-white/80 leading-relaxed mb-4">{profile.bio}</p>
            )}

            {/* Meta: location, website, joined */}
            {(profile.location || profile.website || joinedAt) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-4">
                {profile.location && (
                  <span className="flex items-center gap-1 text-xs text-white/55">
                    <MapPin className="w-3 h-3" />{profile.location}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-white/55 hover:text-white/80 transition-colors">
                    <Globe className="w-3 h-3" />{profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {joinedAt && (
                  <span className="flex items-center gap-1 text-xs text-white/55">
                    <Calendar className="w-3 h-3" />Joined {joinedAt}
                  </span>
                )}
              </div>
            )}

            {/* Followers only — tappable to see list */}
            <button onClick={() => setModal("followers")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Users className="w-3.5 h-3.5 text-white/50" />
              <span className="text-sm font-bold text-white">{profile.followersCount ?? 0}</span>
              <span className="text-xs text-white/55">
                {(profile.followersCount ?? 0) === 1 ? "Follower" : "Followers"}
              </span>
            </button>
          </div>
        </div>

        {/* ── Posts / About tabs ── */}
        <div className="mx-4 mt-3 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex border-b border-gray-100">
            {[
              { key: "posts", label: "Posts" },
              { key: "about", label: "About" },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/40"
                    : "text-gray-400 hover:text-gray-600"
                }`}>
                {tab.label}
                {tab.key === "posts" && posts.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                    {posts.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === "posts" && (
            loadingPosts ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-14 text-center px-6">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-5 h-5 text-gray-200" />
                </div>
                <p className="text-sm font-semibold text-gray-400">No posts yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {posts.map(post => (
                  <PostItem key={post.id} post={post} profile={profile} />
                ))}
              </div>
            )
          )}

          {activeTab === "about" && (
            <div className="px-4 py-4 divide-y divide-gray-50">
              {[
                { label: "Location", value: profile.location, icon: <MapPin    className="w-3.5 h-3.5 text-indigo-400" /> },
                { label: "Website",  value: profile.website,  icon: <Globe     className="w-3.5 h-3.5 text-indigo-400" />, isLink: true },
                { label: "Joined",   value: joinedAt,         icon: <Calendar  className="w-3.5 h-3.5 text-indigo-400" /> },
              ]
                .filter(r => r.value)
                .map(({ label, value, icon, isLink }) => (
                  <div key={label} className="flex items-center gap-3 py-3">
                    <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                      {isLink ? (
                        <a href={value} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-semibold text-indigo-600 truncate hover:underline">
                          {value.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-gray-800">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              {/* Show a message if no about info */}
              {!profile.location && !profile.website && !joinedAt && (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-400">No info available.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </>
  );
}