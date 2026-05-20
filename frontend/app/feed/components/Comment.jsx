"use client";

// components/Comment.jsx
// Single comment with like, reply, and nested thread support

import { useState } from "react";
import { Heart, ChevronDown, Send } from "lucide-react";
import Avatar from "./Avatar";
import Badge from "./Badge";

// Current user placeholder — swap with useAuth() when auth is wired
const ME = { initials: "AK", color: "blue" };

export default function Comment({ comment, nested = false }) {
  const [liked, setLiked]     = useState(comment.liked);
  const [likes, setLikes]     = useState(comment.likesCount);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const hasThread = comment.replies?.length > 0 || replying;

  function toggleLike() {
    setLiked((v) => !v);
    setLikes((v) => (liked ? v - 1 : v + 1));
  }

  return (
    <div className="flex gap-2.5">
      {/* Avatar + vertical thread line */}
      <div
        className="flex flex-col items-center flex-shrink-0"
        style={{ minWidth: nested ? 26 : 32 }}
      >
        <Avatar
          initials={comment.author.initials}
          color={comment.author.color}
          size={nested ? "xs" : "sm"}
        />
        {hasThread && (
          <div className="w-px bg-gray-200 flex-1 mt-1" style={{ minHeight: 8 }} />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 pb-3">
        {/* Name row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="text-[13px] font-bold text-gray-900">
            {comment.author.name}
          </span>
          <Badge role={comment.author.role} />
          <span className="text-[11px] text-gray-400">{comment.time}</span>
        </div>

        {/* Text */}
        <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1 text-xs font-semibold transition-colors min-h-0 min-w-0 ${
              liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500" : ""}`} />
            {likes > 0 && <span>{likes}</span>}
          </button>

          <button
            onClick={() => setReplying((v) => !v)}
            className="text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors min-h-0 min-w-0"
          >
            Reply
          </button>
        </div>

        {/* Nested replies */}
        {comment.replies?.length > 0 && (
          <div className="mt-2 space-y-0">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} nested />
            ))}
          </div>
        )}

        {/* Load more replies */}
        {comment.moreReplies > 0 && (
          <button className="flex items-center gap-1 text-xs text-indigo-500 font-semibold mt-1 hover:text-indigo-700 transition-colors min-h-0 min-w-0">
            <ChevronDown className="w-3 h-3" />
            View {comment.moreReplies} more replies
          </button>
        )}

        {/* Inline reply input */}
        {replying && (
          <div className="flex items-center gap-2 mt-2">
            <Avatar initials={ME.initials} color={ME.color} size="xs" />
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 gap-2 focus-within:border-indigo-300 focus-within:bg-white transition-all">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-transparent text-xs outline-none text-gray-700 placeholder-gray-400"
                placeholder={`Reply to ${comment.author.name}...`}
              />
              {replyText && (
                <Send className="w-3 h-3 text-indigo-400 cursor-pointer flex-shrink-0" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}