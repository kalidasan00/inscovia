// frontend/app/users/page.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, UserPlus, Users, Loader2, Building2, User, GraduationCap } from "lucide-react";

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

const COLORS = ["bg-indigo-100 text-indigo-700", "bg-teal-100 text-teal-700",
  "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-800",
  "bg-green-100 text-green-700", "bg-red-100 text-red-700"];

function avatarColor(name = "") {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

const ROLE_BADGE = {
  institute: { label: "Institute", cls: "bg-blue-50 text-blue-700 border border-blue-100",     Icon: Building2     },
  user:      { label: "Student",   cls: "bg-green-50 text-green-700 border border-green-100",   Icon: User          },
  admin:     { label: "Admin",     cls: "bg-purple-50 text-purple-700 border border-purple-100", Icon: GraduationCap },
};

function RoleBadge({ role }) {
  const cfg = ROLE_BADGE[role?.toLowerCase()] ?? ROLE_BADGE.user;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.cls}`}>
      <Icon className="w-2.5 h-2.5" />{cfg.label}
    </span>
  );
}

function UserCard({ user, currentUserId }) {
  const [following, setFollowing] = useState(user.isFollowing ?? false);
  const [loading,   setLoading]   = useState(false);

  const isMe       = user.id === currentUserId;
  const profileUrl = `/users/${user.username ?? user.id}`;

  async function toggleFollow(e) {
    e.preventDefault();
    if (!getToken() || isMe) return;
    setLoading(true);
    const wasFollowing = following;
    setFollowing(v => !v);
    try {
      const res = await fetch(`${API_URL}/social/${user.id}/follow`, {
        method:  wasFollowing ? "DELETE" : "POST",
        headers: authHeaders(),
      });
      if (!res.ok) setFollowing(wasFollowing);
    } catch {
      setFollowing(wasFollowing);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Link href={profileUrl} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      {/* Avatar */}
      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor(user.name)}`}>
        {user.avatar
          ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          : getInitials(user.name)
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate">{user.name}</span>
          <RoleBadge role={user.role} />
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {user.username ? `@${user.username}` : user.orgName ?? ""}
        </p>
      </div>

      {/* Follow / You */}
      {!isMe ? (
        <button
          onClick={toggleFollow}
          disabled={loading}
          className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            following
              ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {loading
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : following ? "Following" : <><UserPlus className="w-3 h-3" /> Follow</>
          }
        </button>
      ) : (
        <span className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
          You
        </span>
      )}
    </Link>
  );
}

export default function UsersPage() {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userData");
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch {}
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      const res  = await fetch(`${API_URL}/social/users?${params}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setUsers(data.users ?? []);
    } catch {}
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadUsers, 300);
    return () => clearTimeout(t);
  }, [loadUsers]);

  return (
    <div className="max-w-lg mx-auto pb-24 md:pb-8">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 h-14 flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> People
          </h1>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search people..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white mt-2 mx-0 rounded-none md:mx-4 md:rounded-2xl md:border md:border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-400">No people found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map(u => (
              <UserCard key={u.id} user={u} currentUserId={currentUser?.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}