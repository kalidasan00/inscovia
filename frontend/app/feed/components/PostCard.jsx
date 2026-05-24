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

  // Close menu on outside click
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
      if (res.ok) {
        onDeleted?.(post.id);
      }
    } catch {
    } finally { setDeleting(false); setConfirmDel(false); }
  }

  return (
    <article className="bg-white border-b border-gray-100 hover:bg-gray-50/30 transition-colors overflow-hidden">
      <div className="px-4 pt-4 pb-2 w-full min-w-0">

        {/* ── Author header ── */}
        <div className="flex gap-3 min-w-0">
          <div className="flex flex-col items-center flex-shrink-0">
            <Avatar
              initials={post.author.initials}
              color={post.author.color}
              size="md"
              src={post.author.avatar || null}
            />
            {open && comments.length > 0 && (
              <div className="w-px bg-gray-200 flex-1 mt-1.5" style={{ minHeight: 16 }} />
            )}
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[15px] font-bold text-gray-900 leading-tight truncate">
                    {post.author.name}
                  </span>
                  <Badge role={post.author.role} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {post.author.sub ? `${post.author.sub} · ` : ""}{post.time}
                </p>
              </div>

              {/* ── Three dots menu ── */}
              <div className="relative flex-shrink-0" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="p-1 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors min-h-0 min-w-0"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-7 z-50 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[140px]">
                    {isOwner && (
                      <button
                        onClick={() => { setMenuOpen(false); setConfirmDel(true); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete post
                      </button>
                    )}
                    {!isOwner && (
                      <p className="px-3 py-2 text-xs text-gray-400">No actions available</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Post content ── */}
            <div className="mt-2 w-full">
              {post.content.split("\n").map((line, i) => (
                <p key={i} className={`text-[14px] text-gray-800 leading-relaxed break-words whitespace-pre-wrap ${line === "" ? "h-2 block" : ""}`}>
                  {line}
                </p>
              ))}
            </div>

            {/* ── Post image ── */}
            {post.image && (
              <img
                src={post.image} alt="post"
                className="w-full rounded-xl mt-2 object-cover max-h-80 block"
              />
            )}

            {/* Hashtags */}
            {post.hashtags?.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {post.hashtags.map((tag) => (
                  <span key={tag} className="text-xs text-indigo-500 font-semibold hover:text-indigo-700 cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* PDF attachment */}
            {post.pdf && <PdfAttachment pdf={post.pdf} />}

            {/* ── Action row ── */}
            <div className="flex items-center mt-3 -ml-2">
              <button onClick={toggleLike}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-0 min-w-0 ${
                  liked ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-400 hover:bg-red-50"
                }`}>
                <Heart className={`w-[15px] h-[15px] ${liked ? "fill-red-500" : ""}`} />
                <span>{likes}</span>
              </button>

              <button onClick={openComments}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all min-h-0 min-w-0">
                <MessageCircle className="w-[15px] h-[15px]" />
                <span>{cmtCount}</span>
              </button>

              <button onClick={toggleSave}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-0 min-w-0 ${
                  saved ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-50"
                }`}>
                <Bookmark className={`w-[15px] h-[15px] ${saved ? "fill-indigo-600" : ""}`} />
                <span>{saves}</span>
              </button>

              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all min-h-0 min-w-0 ml-auto">
                <Share2 className="w-[15px] h-[15px]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Comments ── */}
        {open && (
          <div className="ml-[52px] mt-2 min-w-0">
            {loadingCmts ? (
              <div className="py-3 flex justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-gray-50">
                {comments.map(c => (
                  <Comment key={c.id} comment={c} />
                ))}
              </div>
            )}

            {getToken() && (
              <div className="flex items-center gap-2 pt-2 mt-1 border-t border-gray-50">
                <Avatar initials={me.initials} color={me.color} size="xs" src={me.avatar} />
                <div className="flex-1 min-w-0 flex items-center bg-gray-50 border border-gray-200 rounded-full px-3.5 py-2 gap-2 focus-within:border-indigo-300 focus-within:bg-white transition-all">
                  <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submitComment()}
                    className="flex-1 min-w-0 bg-transparent text-xs outline-none text-gray-700 placeholder-gray-400"
                    placeholder="Write a comment..."
                    autoComplete="off"
                  />
                  {submitting
                    ? <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin flex-shrink-0" />
                    : comment && <Send onClick={submitComment} className="w-3.5 h-3.5 text-indigo-500 cursor-pointer flex-shrink-0" />
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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