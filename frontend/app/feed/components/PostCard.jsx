"use client";

import { useState, useEffect, useRef } from "react";
import {
  Heart, MessageCircle, Bookmark, Share2,
  MoreHorizontal, Send, Loader2, Trash2,
} from "lucide-react";
import Avatar from "./Avatar";
import Badge from "./Badge";
import PdfAttachment from "./PdfAttachment";
import Comment from "./Comment";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("instituteToken") || localStorage.getItem("userToken") || null;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem("userData") || localStorage.getItem("instituteData") || sessionStorage.getItem("userData");
    if (!raw) return null;
    return JSON.parse(raw)?.id ?? null;
  } catch { return null; }
}

function PostContent({ content, hasImage }) {
  const [expanded, setExpanded] = useState(false);
  const limit = hasImage ? 6 : 14;
  const lines = content.split("\n");
  const needsTruncation = lines.length > limit;
  const visibleLines = expanded || !needsTruncation ? lines : lines.slice(0, limit);

  return (
    <div className="w-full">
      {visibleLines.map((line, i) => (
        <p key={i} className={`text-[14px] text-gray-800 leading-snug break-words ${line === "" ? "h-2 block" : ""}`}>
          {line}
        </p>
      ))}
      {needsTruncation && !expanded && (
        <button onClick={() => setExpanded(true)}
          className="text-[13px] text-gray-400 font-semibold mt-0.5 hover:text-gray-600 transition-colors">
          more
        </button>
      )}
      {expanded && needsTruncation && (
        <button onClick={() => setExpanded(false)}
          className="text-[13px] text-gray-400 font-semibold mt-0.5 hover:text-gray-600 transition-colors">
          less
        </button>
      )}
    </div>
  );
}

export default function PostCard({ post, currentUser, onDeleted }) {
  const [liked,       setLiked]       = useState(post.liked);
  const [likes,       setLikes]       = useState(post.likesCount);
  const [saved,       setSaved]       = useState(post.saved);
  const [saves,       setSaves]       = useState(post.savesCount);
  const [open,        setOpen]        = useState(false);
  const [comments,    setComments]    = useState([]);
  const [loadingCmts, setLoadingCmts] = useState(false);
  const [comment,     setComment]     = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [cmtCount,    setCmtCount]    = useState(post.commentsCount ?? 0);
  const [me,          setMe]          = useState({ initials: "?", color: "gray", avatar: null });
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (currentUser) { setMe(currentUser); return; }
    try {
      const raw = localStorage.getItem("userData") || sessionStorage.getItem("userData");
      if (raw) {
        const u = JSON.parse(raw);
        setMe({
          initials: u.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "?",
          color:    "blue",
          avatar:   u.avatar || null,
        });
      }
    } catch {}
  }, [currentUser]);

  const isOwner = getCurrentUserId() === post.author.id;

  async function toggleLike() {
    if (!getToken()) return;
    setLiked(v => !v);
    setLikes(v => liked ? v - 1 : v + 1);
    try {
      await fetch(`${API_URL}/feed/${post.id}/like`, { method: "PATCH", headers: authHeaders() });
    } catch {
      setLiked(v => !v);
      setLikes(v => liked ? v + 1 : v - 1);
    }
  }

  async function toggleSave() {
    if (!getToken()) return;
    setSaved(v => !v);
    setSaves(v => saved ? v - 1 : v + 1);
    try {
      await fetch(`${API_URL}/feed/${post.id}/save`, { method: "PATCH", headers: authHeaders() });
    } catch {
      setSaved(v => !v);
      setSaves(v => saved ? v + 1 : v - 1);
    }
  }

  async function openComments() {
    const next = !open;
    setOpen(next);
    if (next && comments.length === 0) {
      setLoadingCmts(true);
      try {
        const res  = await fetch(`${API_URL}/feed/${post.id}/comments`, { headers: authHeaders() });
        const data = await res.json();
        if (res.ok) setComments(data.comments ?? []);
      } finally { setLoadingCmts(false); }
    }
  }

  async function submitComment() {
    if (!comment.trim() || submitting || !getToken()) return;
    setSubmitting(true);
    try {
      const res  = await fetch(`${API_URL}/feed/${post.id}/comments`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body:    JSON.stringify({ content: comment.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments(prev => [...prev, data.comment]);
        setCmtCount(v => v + 1);
        setComment("");
      }
    } finally { setSubmitting(false); }
  }

  async function deletePost() {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/feed/${post.id}`, {
        method:  "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) onDeleted?.(post.id);
    } catch {}
    finally { setDeleting(false); setConfirmDel(false); }
  }

  return (
    <article className="bg-white border-b border-gray-100 overflow-hidden">

      {/* ── 1. Author header ── */}
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
        <Avatar
          initials={post.author.initials}
          color={post.author.color}
          size="md"
          src={post.author.avatar || null}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[14px] font-bold text-gray-900 leading-tight">
              {post.author.name}
            </span>
            <Badge role={post.author.role} />
          </div>
          <p className="text-[11px] text-gray-400">{post.time}</p>
        </div>
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-50 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[140px]">
              {isOwner ? (
                <button
                  onClick={() => { setMenuOpen(false); setConfirmDel(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete post
                </button>
              ) : (
                <p className="px-3 py-2 text-xs text-gray-400">No actions available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Text content ── */}
      {post.content && (
        <div className="px-3 pb-2">
          <PostContent content={post.content} hasImage={!!post.image} />
        </div>
      )}

      {/* ── 3. Image ── */}
      {post.image && (
        <img
          src={post.image} alt="post"
          className="w-full object-cover max-h-[400px] block mt-1"
        />
      )}

      {/* ── 4. PDF attachment ── */}
      {post.pdf && (
        <div className="px-3 pt-2">
          <PdfAttachment pdf={post.pdf} />
        </div>
      )}

      {/* ── 5. Hashtags ── */}
      {post.hashtags?.length > 0 && (
        <div className="px-3 pt-1.5 flex flex-wrap gap-1">
          {post.hashtags.map(tag => (
            <span key={tag} className="text-xs text-indigo-500 font-semibold hover:text-indigo-700 cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ── 6. Action row ── */}
      <div className="flex items-center px-2 pt-1">
        <button onClick={toggleLike}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-xl transition-all ${
            liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
          }`}>
          <Heart className={`w-[22px] h-[22px] ${liked ? "fill-red-500" : ""}`} />
        </button>

        <button onClick={openComments}
          className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-gray-400 hover:text-gray-600 transition-all">
          <MessageCircle className="w-[21px] h-[21px]" />
        </button>

        <button className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-gray-400 hover:text-gray-600 transition-all">
          <Share2 className="w-[20px] h-[20px]" />
        </button>

        <button onClick={toggleSave}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-xl transition-all ml-auto ${
            saved ? "text-indigo-600" : "text-gray-400 hover:text-indigo-500"
          }`}>
          <Bookmark className={`w-[21px] h-[21px] ${saved ? "fill-indigo-600" : ""}`} />
        </button>
      </div>

      {/* ── 7. Likes count ── */}
      {likes > 0 && (
        <p className="px-3 pb-0.5 text-[13px] font-bold text-gray-900">
          {likes} {likes === 1 ? "like" : "likes"}
        </p>
      )}

      {/* ── 8. View comments ── */}
      {cmtCount > 0 && !open && (
        <button onClick={openComments}
          className="px-3 pb-1 text-[12px] text-gray-400 hover:text-gray-600 transition-colors block">
          View all {cmtCount} comments
        </button>
      )}

      {/* ── 9. Comments list ── */}
      {open && (
        <div className="px-3 pb-1">
          {loadingCmts ? (
            <div className="py-2 flex justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              {comments.map(c => (
                <Comment key={c.id} comment={c} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 10. Comment input ── */}
      {getToken() && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-50">
          <Avatar initials={me.initials} color={me.color} size="xs" src={me.avatar} />
          <div className="flex-1 flex items-center gap-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitComment()}
              className="flex-1 bg-transparent text-[13px] outline-none text-gray-700 placeholder-gray-400"
              placeholder="Add a comment…"
              autoComplete="off"
            />
            {submitting
              ? <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin flex-shrink-0" />
              : comment && (
                <button onClick={submitComment}
                  className="text-[13px] font-bold text-indigo-500 hover:text-indigo-700 flex-shrink-0">
                  Post
                </button>
              )
            }
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Delete post?</h3>
            <p className="text-sm text-gray-400 mb-5">This can't be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDel(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deletePost}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}