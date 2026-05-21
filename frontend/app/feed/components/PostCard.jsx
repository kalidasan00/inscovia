"use client";

// components/PostCard.jsx
import { useState, useEffect } from "react";
import {
  Heart, MessageCircle, Bookmark, Share2,
  MoreHorizontal, Send,
} from "lucide-react";
import Avatar from "./Avatar";
import Badge from "./Badge";
import PdfAttachment from "./PdfAttachment";
import Comment from "./Comment";

export default function PostCard({ post, currentUser }) {
  const [liked, setLiked]     = useState(post.liked);
  const [likes, setLikes]     = useState(post.likesCount);
  const [saved, setSaved]     = useState(post.saved);
  const [saves, setSaves]     = useState(post.savesCount);
  const [open, setOpen]       = useState(post.thread?.length > 0);
  const [comment, setComment] = useState("");
  const [me, setMe]           = useState({ initials: "?", color: "gray", avatar: null });

  useEffect(() => {
    // currentUser prop takes priority (passed from FeedClient which already reads localStorage)
    if (currentUser) {
      setMe(currentUser);
      return;
    }
    // fallback: read directly from localStorage
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

  function toggleLike() {
    setLiked((v) => !v);
    setLikes((v) => (liked ? v - 1 : v + 1));
  }

  function toggleSave() {
    setSaved((v) => !v);
    setSaves((v) => (saved ? v - 1 : v + 1));
  }

  return (
    <article className="bg-white border-b border-gray-100 hover:bg-gray-50/30 transition-colors">
      <div className="px-4 pt-4 pb-2">

        {/* ── Author header ── */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center flex-shrink-0">
            <Avatar
              initials={post.author.initials}
              color={post.author.color}
              size="md"
              src={post.author.avatar || null}
            />
            {open && post.thread?.length > 0 && (
              <div className="w-px bg-gray-200 flex-1 mt-1.5" style={{ minHeight: 16 }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[15px] font-bold text-gray-900 leading-tight">
                    {post.author.name}
                  </span>
                  <Badge role={post.author.role} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {post.author.sub} · {post.time}
                </p>
              </div>
              <button className="p-1 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors min-h-0 min-w-0 flex-shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* ── Post content ── */}
            <div className="mt-2">
              {post.content.split("\n").map((line, i) => (
                <p key={i} className={`text-[14px] text-gray-800 leading-relaxed ${line === "" ? "h-2 block" : ""}`}>
                  {line}
                </p>
              ))}
            </div>

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
              <button
                onClick={toggleLike}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-0 min-w-0 ${
                  liked ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-400 hover:bg-red-50"
                }`}
              >
                <Heart className={`w-[15px] h-[15px] ${liked ? "fill-red-500" : ""}`} />
                <span>{likes}</span>
              </button>

              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all min-h-0 min-w-0"
              >
                <MessageCircle className="w-[15px] h-[15px]" />
                <span>{post.commentsCount}</span>
              </button>

              <button
                onClick={toggleSave}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-0 min-w-0 ${
                  saved ? "text-indigo-600 bg-indigo-50" : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-50"
                }`}
              >
                <Bookmark className={`w-[15px] h-[15px] ${saved ? "fill-indigo-600" : ""}`} />
                <span>{saves}</span>
              </button>

              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all min-h-0 min-w-0 ml-auto">
                <Share2 className="w-[15px] h-[15px]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Thread comments ── */}
        {open && post.thread?.length > 0 && (
          <div className="ml-[52px] mt-1 pt-3 border-t border-gray-50 space-y-0">
            {post.thread.map((c) => (
              <Comment key={c.id} comment={c} />
            ))}
          </div>
        )}

        {/* ── Comment input ── */}
        {open && (
          <div className="ml-[52px] flex items-center gap-2 pt-2 mt-1 border-t border-gray-50">
            <Avatar initials={me.initials} color={me.color} size="xs" src={me.avatar} />
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full px-3.5 py-2 gap-2 focus-within:border-indigo-300 focus-within:bg-white transition-all">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1 bg-transparent text-xs outline-none text-gray-700 placeholder-gray-400"
                placeholder="Write a comment..."
              />
              {comment && (
                <Send className="w-3.5 h-3.5 text-indigo-500 cursor-pointer flex-shrink-0" />
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}