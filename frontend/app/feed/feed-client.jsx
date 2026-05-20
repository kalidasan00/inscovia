"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Heart, MessageCircle, Bookmark, Share2,
  FileText, MoreHorizontal, Image as ImageIcon,
  GraduationCap, Building2, User, ChevronDown,
  Search, Bell, Plus, X, Send, Loader2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const MAX_CHARS = 500;

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userToken") || sessionStorage.getItem("userToken") || null;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const AVATAR_COLORS = {
  purple: "bg-purple-100 text-purple-700",
  blue:   "bg-blue-100   text-blue-700",
  teal:   "bg-teal-100   text-teal-700",
  coral:  "bg-red-100    text-red-700",
  amber:  "bg-amber-100  text-amber-800",
  green:  "bg-green-100  text-green-700",
  gray:   "bg-gray-100   text-gray-600",
};

const AVATAR_SIZES = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-10 h-10 text-sm",
};

function Avatar({ initials = "?", color = "gray", size = "md" }) {
  return (
    <div className={`
      ${AVATAR_SIZES[size] ?? AVATAR_SIZES.md}
      ${AVATAR_COLORS[color] ?? AVATAR_COLORS.gray}
      rounded-full flex items-center justify-center font-bold
      flex-shrink-0 ring-2 ring-white
    `}>
      {initials}
    </div>
  );
}

const ROLE_BADGE = {
  institute: { label: "Institute", cls: "bg-blue-50   text-blue-700   border border-blue-100",   Icon: Building2 },
  user:      { label: "Student",   cls: "bg-green-50  text-green-700  border border-green-100",  Icon: User },
  admin:     { label: "Admin",     cls: "bg-purple-50 text-purple-700 border border-purple-100", Icon: GraduationCap },
};

function RoleBadge({ role }) {
  const cfg = ROLE_BADGE[role?.toLowerCase()];
  if (!cfg) return null;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.cls}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

function isLoggedInClient() {
  if (typeof window === "undefined") return false;
  return !!getToken();
}

function CommentBubble({ comment, currentUser, postId, nested = false, onCommentAdded }) {
  const [liked, setLiked]           = useState(comment.liked ?? false);
  const [likes, setLikes]           = useState(comment.likesCount ?? 0);
  const [showReplyBox, setReply]    = useState(false);
  const [replyText, setReplyText]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function toggleLike() {
    if (!getToken()) return;
    setLiked((v) => !v);
    setLikes((v) => (liked ? v - 1 : v + 1));
    try {
      await fetch(`${API_URL}/feed/comments/${comment.id}/like`, {
        method: "PATCH", headers: authHeaders(),
      });
    } catch {
      setLiked((v) => !v);
      setLikes((v) => (liked ? v + 1 : v - 1));
    }
  }

  async function submitReply() {
    if (!replyText.trim() || submitting || !getToken()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/feed/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ content: replyText.trim(), parentId: comment.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setReplyText("");
        setReply(false);
        onCommentAdded?.(data.comment, comment.id);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const hasThread = comment.replies?.length > 0 || showReplyBox;

  return (
    <div className="flex gap-2">
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: nested ? 24 : 28 }}>
        <Avatar initials={comment.author.initials} color={comment.author.color} size="sm" />
        {hasThread && <div className="w-px bg-gray-200 flex-1 mt-1" style={{ minHeight: 12 }} />}
      </div>

      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="text-sm font-bold text-gray-900">{comment.author.name}</span>
          <RoleBadge role={comment.author.role} />
          <span className="text-xs text-gray-400">{comment.time}</span>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed">{comment.text}</p>

        <div className="flex items-center gap-4 mt-1.5">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1 text-xs font-semibold transition-colors min-h-0 min-w-0 ${
              liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500" : ""}`} />
            {likes > 0 && <span>{likes}</span>}
          </button>
          {isLoggedInClient() && (
            <button
              onClick={() => setReply((v) => !v)}
              className="text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors min-h-0 min-w-0"
            >
              Reply
            </button>
          )}
        </div>

        {comment.replies?.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <CommentBubble
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                postId={postId}
                nested
                onCommentAdded={onCommentAdded}
              />
            ))}
          </div>
        )}

        {comment.moreReplies > 0 && (
          <button className="flex items-center gap-1 text-xs text-indigo-500 font-semibold mt-1.5 hover:text-indigo-700 transition-colors min-h-0 min-w-0">
            <ChevronDown className="w-3 h-3" />
            View {comment.moreReplies} more replies
          </button>
        )}

        {showReplyBox && (
          <div className="flex items-center gap-2 mt-2">
            <Avatar initials={currentUser?.initials ?? "?"} color={currentUser?.color ?? "gray"} size="sm" />
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 focus-within:border-indigo-300 focus-within:bg-white transition-all">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitReply()}
                className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                placeholder={`Reply to ${comment.author.name}...`}
                autoFocus
              />
              {submitting
                ? <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin flex-shrink-0" />
                : replyText && <Send onClick={submitReply} className="w-3.5 h-3.5 text-indigo-500 cursor-pointer flex-shrink-0" />
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, currentUser }) {
  const [liked, setLiked]             = useState(post.liked ?? false);
  const [likes, setLikes]             = useState(post.likesCount ?? 0);
  const [saved, setSaved]             = useState(post.saved ?? false);
  const [saves, setSaves]             = useState(post.savesCount ?? 0);
  const [showComments, setShow]       = useState(false);
  const [comments, setComments]       = useState([]);
  const [loadingCmts, setLoadingCmts] = useState(false);
  const [commentText, setComment]     = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [commentsCount, setCmtCount]  = useState(post.commentsCount ?? 0);

  async function toggleLike() {
    if (!getToken()) return;
    setLiked((v) => !v);
    setLikes((v) => (liked ? v - 1 : v + 1));
    try {
      await fetch(`${API_URL}/feed/${post.id}/like`, { method: "PATCH", headers: authHeaders() });
    } catch {
      setLiked((v) => !v);
      setLikes((v) => (liked ? v + 1 : v - 1));
    }
  }

  async function toggleSave() {
    if (!getToken()) return;
    setSaved((v) => !v);
    setSaves((v) => (saved ? v - 1 : v + 1));
    try {
      await fetch(`${API_URL}/feed/${post.id}/save`, { method: "PATCH", headers: authHeaders() });
    } catch {
      setSaved((v) => !v);
      setSaves((v) => (saved ? v + 1 : v - 1));
    }
  }

  async function openComments() {
    const next = !showComments;
    setShow(next);
    if (next && comments.length === 0) {
      setLoadingCmts(true);
      try {
        const res = await fetch(`${API_URL}/feed/${post.id}/comments`, { headers: authHeaders() });
        const data = await res.json();
        if (res.ok) setComments(data.comments ?? []);
      } finally {
        setLoadingCmts(false);
      }
    }
  }

  async function submitComment() {
    if (!commentText.trim() || submitting || !getToken()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/feed/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setCmtCount((v) => v + 1);
        setComment("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleCommentAdded(newComment, parentId) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies ?? []), newComment] }
          : c
      )
    );
    setCmtCount((v) => v + 1);
  }

  return (
    <div className="bg-white border-b border-gray-100 hover:bg-gray-50/30 transition-colors">
      <div className="flex items-start gap-3 px-4 pt-4 pb-0">
        <div className="flex flex-col items-center flex-shrink-0" style={{ width: 40 }}>
          <Avatar initials={post.author.initials} color={post.author.color} size="lg" />
          {showComments && comments.length > 0 && (
            <div className="w-px bg-gray-200 flex-1 mt-1.5" style={{ minHeight: 16 }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[15px] font-bold text-gray-900">{post.author.name}</span>
                <RoleBadge role={post.author.role} />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {post.author.sub ? `${post.author.sub} · ` : ""}{post.time}
              </p>
            </div>
            <button className="p-1 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors min-h-0 min-w-0">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 mb-1">
            {post.content.split("\n").map((line, i) => (
              <p key={i} className={`text-sm text-gray-800 leading-relaxed ${line === "" ? "h-2 block" : ""}`}>
                {line}
              </p>
            ))}
          </div>

          {post.image && (
            <img src={post.image} alt="post" className="w-full rounded-xl mt-2 object-cover max-h-80" />
          )}

          <div className="flex items-center mt-3 -ml-2 mb-1">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-0 min-w-0 ${
                liked ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-400 hover:bg-red-50"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
              <span>{likes}</span>
            </button>

            <button
              onClick={openComments}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all min-h-0 min-w-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{commentsCount}</span>
            </button>

            <button
              onClick={toggleSave}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-0 min-w-0 ${
                saved ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-50"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-indigo-600" : ""}`} />
              <span>{saves}</span>
            </button>

            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all min-h-0 min-w-0 ml-auto">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="pl-4 pr-4 pt-1">
          <div className="flex">
            <div style={{ width: 40 }} />
            <div className="flex-1">
              {loadingCmts ? (
                <div className="py-4 flex justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                </div>
              ) : (
                <div className="space-y-2">
                  {comments.map((c) => (
                    <CommentBubble
                      key={c.id}
                      comment={c}
                      currentUser={currentUser}
                      postId={post.id}
                      onCommentAdded={handleCommentAdded}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showComments && isLoggedInClient() && (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-50">
          <div style={{ width: 40 }} className="flex justify-center">
            <Avatar initials={currentUser?.initials ?? "?"} color={currentUser?.color ?? "gray"} size="sm" />
          </div>
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-2 focus-within:border-indigo-300 focus-within:bg-white transition-all">
            <input
              value={commentText}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
              placeholder="Write a comment..."
            />
            {submitting
              ? <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin flex-shrink-0" />
              : commentText && <Send onClick={submitComment} className="w-3.5 h-3.5 text-indigo-500 cursor-pointer flex-shrink-0" />
            }
          </div>
        </div>
      )}
    </div>
  );
}

function CreatePostModal({ onClose, currentUser, onPostCreated }) {
  const [text, setText]                 = useState("");
  const [posting, setPosting]           = useState(false);
  const [error, setError]               = useState("");
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadedUrl, setUploadedUrl]   = useState(null);
  const fileInputRef                    = useRef(null);

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) { setError("Only JPG, PNG, GIF or WebP images are allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }
    setError("");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadedUrl(null);
  }

  function removeImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setUploadedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadImageToCloud() {
    if (!imageFile) return null;
    if (uploadedUrl) return uploadedUrl;
    setUploadingImg(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const res = await fetch(`${API_URL}/feed/upload/image`, {
        method: "POST", headers: authHeaders(), body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setUploadedUrl(data.url);
      return data.url;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setUploadingImg(false);
    }
  }

  async function handlePost() {
    if ((!text.trim() && !imageFile) || posting) return;
    setPosting(true);
    setError("");
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImageToCloud();
        if (!imageUrl) { setPosting(false); return; }
      }
      const res = await fetch(`${API_URL}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ content: text.trim(), image: imageUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error ?? "Failed to post");
      onPostCreated(data.post);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  const canPost = (text.trim().length > 0 || !!imageFile) && !posting && !uploadingImg;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors min-h-0 min-w-0">
            <X className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-sm font-bold text-gray-900">New Post</span>
          <button onClick={handlePost} disabled={!canPost} className="flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 bg-indigo-600 text-white rounded-full disabled:opacity-30 hover:bg-indigo-700 active:scale-95 transition-all min-h-0">
            {(posting || uploadingImg) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Post
          </button>
        </div>

        <div className="flex gap-3 p-4 pb-2">
          <Avatar initials={currentUser?.initials ?? "?"} color={currentUser?.color ?? "gray"} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 mb-2">{currentUser?.name ?? "You"}</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_CHARS}
              rows={imagePreview ? 3 : 5}
              placeholder="Share notes, tips, or ask a question..."
              className="w-full text-sm text-gray-800 placeholder-gray-400 resize-none outline-none leading-relaxed"
              autoFocus
            />
            {imagePreview && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="preview" className="w-full object-cover max-h-56" />
                <button onClick={removeImage} className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors min-h-0 min-w-0">
                  <X className="w-3.5 h-3.5" />
                </button>
                {uploadingImg && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  </div>
                )}
              </div>
            )}
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="flex gap-1">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" className="hidden" onChange={handleImagePick} />
            <button onClick={() => fileInputRef.current?.click()} disabled={!!imagePreview} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-all font-semibold min-h-0 min-w-0">
              <ImageIcon className="w-3.5 h-3.5" /> Photo
            </button>
            <button disabled title="Coming soon" className="flex items-center gap-1.5 text-xs text-gray-300 px-3 py-1.5 rounded-lg font-semibold min-h-0 min-w-0 cursor-not-allowed">
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
          <span className={`text-xs font-semibold ${text.length > MAX_CHARS * 0.85 ? "text-red-400" : "text-gray-300"}`}>
            {MAX_CHARS - text.length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FeedClient() {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [isLoggedIn, setIsLoggedIn]   = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userData") || sessionStorage.getItem("userData");
      if (raw) {
        const u = JSON.parse(raw);
        setCurrentUser({
          id:       u.id,
          name:     u.name,
          initials: u.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
          role:     u.role?.toLowerCase() ?? "user",
          color:    "blue",
        });
      }
    } catch {}
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
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Feed</h1>
          <div className="flex items-center gap-1">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors min-h-0 min-w-0">
              <Search className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors min-h-0 min-w-0">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {isLoggedIn && (
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
            <Avatar initials={currentUser?.initials ?? "?"} color="blue" size="lg" />
            <button onClick={() => setShowModal(true)} className="flex-1 text-left text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 hover:bg-gray-100 hover:border-gray-300 transition-all min-h-0">
              Share notes, tips or a question...
            </button>
            <button onClick={() => setShowModal(true)} className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shadow-sm flex-shrink-0 min-h-0 min-w-0">
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {loading ? (
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
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={currentUser} />
            ))}
          </div>
        )}
      </div>

      {isLoggedIn && (
        <button onClick={() => setShowModal(true)} className="fixed bottom-24 right-4 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all md:hidden z-20 min-h-0 min-w-0" style={{ width: 52, height: 52 }}>
          <Plus className="w-5 h-5" />
        </button>
      )}

      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          currentUser={currentUser}
          onPostCreated={(newPost) => setPosts((prev) => [newPost, ...prev])}
        />
      )}
    </div>
  );
}