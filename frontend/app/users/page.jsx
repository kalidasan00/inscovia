// frontend/app/users/page.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, UserPlus, UserCheck, Users, Loader2 } from "lucide-react";

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

const COLORS = [
  "bg-indigo-100 text-indigo-700", "bg-teal-100 text-teal-700",
  "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-800",
  "bg-green-100 text-green-700",   "bg-rose-100 text-rose-700",
];
function avatarColor(name = "") {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

function UserCard({ user, currentUserId }) {
  // Optimistic: initialise from server data immediately
  const [following, setFollowing] = useState(user.isFollowing ?? false);
  const [pending,   setPending]   = useState(false);

  const isMe       = user.id === currentUserId;
  const profileUrl = `/users/${user.username ?? user.id}`;

  async function toggleFollow(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!getToken() || isMe || pending) return;

    // Flip state INSTANTLY — no waiting
    const was = following;
    setFollowing(!was);
    setPending(true);

    try {
      const res = await fetch(`${API_URL}/social/${user.id}/follow`, {
        method:  was ? "DELETE" : "POST",
        headers: authHeaders(),
      });
      if (!res.ok) setFollowing(was); // revert only on error
    } catch {
      setFollowing(was);
    } finally {
      setPending(false);
    }
  }

  return (
    <Link href={profileUrl} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/80 transition-colors">

      {/* Avatar */}
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden ${avatarColor(user.name)}`}>
        {user.avatar
          ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          : getInitials(user.name)
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {user.username ? `@${user.username}` : ""}
        </p>
      </div>

      {/* Follow / You */}
      {!isMe ? (
        <button
          onClick={toggleFollow}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            following
              ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          }`}
        >
          {following
            ? <><UserCheck className="w-3 h-3" /> Following</>
            : <><UserPlus  className="w-3 h-3" /> Follow</>
          }
        </button>
      ) : (
        <span className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-400">
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
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="px-4 h-14 flex items-center justify-between">
          <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" /> People
          </h1>
          {!loading && (
            <span className="text-xs text-gray-400 font-medium">{users.length} members</span>
          )}
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search people…"
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white mt-2 mx-0 md:mx-4 md:rounded-2xl md:border md:border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center px-6">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">No people found</p>
            {search && <p className="text-xs text-gray-300 mt-1">Try a different search</p>}
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