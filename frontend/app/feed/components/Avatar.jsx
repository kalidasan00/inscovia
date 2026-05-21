"use client";

import { useState, useEffect } from "react";

const COLOR_MAP = {
  purple: "bg-purple-100 text-purple-700",
  blue:   "bg-blue-100   text-blue-700",
  teal:   "bg-teal-100   text-teal-700",
  coral:  "bg-red-100    text-red-700",
  amber:  "bg-amber-100  text-amber-800",
  green:  "bg-green-100  text-green-700",
  gray:   "bg-gray-100   text-gray-600",
};

const SIZE_MAP = {
  xs: "w-6  h-6  text-[9px]",
  sm: "w-8  h-8  text-[10px]",
  md: "w-10 h-10 text-xs",
  lg: "w-11 h-11 text-sm",
};

export default function Avatar({ initials = "?", color = "gray", size = "md", src = null }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const sizeClass = SIZE_MAP[size] ?? SIZE_MAP.md;

  // Always render <div> on server and before mount to avoid hydration mismatch
  if (mounted && src) {
    return (
      <img
        src={src}
        alt={initials}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ring-2 ring-white`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClass}
        ${COLOR_MAP[color] ?? COLOR_MAP.gray}
        rounded-full flex items-center justify-center
        font-bold flex-shrink-0 ring-2 ring-white
      `}
    >
      {initials}
    </div>
  );
}