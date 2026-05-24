// frontend/app/feed/feed-client.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Plus, Loader2 } from "lucide-react";
import PostCard from "./components/PostCard";
import CreatePostModal from "./components/CreatePostModal";
import { API_URL, getToken, authHeaders } from "./lib/feedUtils";

export default function FeedClient() {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [activeTab, setActiveTab]     = useState("my");
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [mounted, setMounted]         = useState(false);

  function loadUserFromStorage() {
    try {
      const raw = localStorage.getItem("userData") || sessionStorage.getItem("userData");
      if (raw) {
        const u = JSON.parse(raw);
        setCurrentUser({
          id:       u.id,
          name:     u.name,
          initials: u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          role:     u.role?.toLowerCase() ?? "user",
          color:    "blue",
          avatar:   u.avatar || null,
        });
      }
    } catch {}
  }

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(!!getToken());
    loadUserFromStorage();
    const onVisible = () => { if (document.visibilityState === "visible") loadUserFromStorage(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/feed`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setPosts(data.posts ?? []);
    } catch (err) {
      console.error("Failed to load feed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-8">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto flex">
          {[{ key: "my", label: "My Feed" }, { key: "community", label: "Community" }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3 pt-3">
        {activeTab === "community" ? (
          <div className="py-20 text-center">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-semibold text-gray-400">Community feed coming soon!</p>
            <p className="text-xs text-gray-300 mt-1">Connect with people across all institutes.</p>
          </div>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
            <p className="text-sm font-medium text-gray-400">Loading feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-400">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onDeleted={id => setPosts(prev => prev.filter(p => p.id !== id))}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {mounted && isLoggedIn && (
        <button onClick={() => setShowModal(true)}
          className="fixed bottom-24 right-4 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all md:hidden z-20 min-h-0 min-w-0"
          style={{ width: 52, height: 52 }}>
          <Plus className="w-5 h-5" />
        </button>
      )}

      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          currentUser={currentUser}
          onPostCreated={newPost => setPosts(prev => [newPost, ...prev])}
        />
      )}
    </div>
  );
}