"use client";

import { useState, useRef, useEffect } from "react";
import { X, ImageIcon, FileText, Loader2 } from "lucide-react";

const MAX_CHARS = 500;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("instituteToken") || localStorage.getItem("userToken") || null;
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("userData") || localStorage.getItem("instituteData");
    if (!raw) return { name: "You", initials: "YO", color: "blue" };
    const u = JSON.parse(raw);
    const name = u.name || u.instituteName || "You";
    const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const colors = ["purple", "teal", "blue", "coral", "amber", "green"];
    const color = colors[name.charCodeAt(0) % colors.length];
    return { name, initials, color };
  } catch {
    return { name: "You", initials: "YO", color: "blue" };
  }
}

const AVATAR_COLORS = {
  purple: { bg: "#EEEDFE", color: "#3C3489" },
  blue:   { bg: "#E6F1FB", color: "#0C447C" },
  teal:   { bg: "#E1F5EE", color: "#085041" },
  coral:  { bg: "#FAECE7", color: "#712B13" },
  amber:  { bg: "#FAEEDA", color: "#633806" },
  green:  { bg: "#EAF3DE", color: "#27500A" },
};

function Avatar({ initials, color, size = "md" }) {
  const sizes     = { sm: 28, md: 36, lg: 40 };
  const fontSizes = { sm: 10, md: 12, lg: 13 };
  const c = AVATAR_COLORS[color] || AVATAR_COLORS.blue;
  const s = sizes[size];
  return (
    <div style={{
      width: s, height: s, minWidth: s,
      background: c.bg, color: c.color,
      borderRadius: "50%", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontWeight: 600, fontSize: fontSizes[size], flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function CreatePostModal({ onClose, onPostCreated }) {
  const me       = getCurrentUser();
  const photoRef = useRef(null);
  const pdfRef   = useRef(null);

  const [text,       setText]       = useState("");
  const [posting,    setPosting]    = useState(false);
  const [error,      setError]      = useState("");
  const [attachType, setAttachType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName,   setFileName]   = useState(null);
  const [fileSize,   setFileSize]   = useState(null);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  function handleFileSelect(e, type) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachType(type);
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(1) + " MB");
    if (type === "photo") {
      const reader = new FileReader();
      reader.onload = ev => setPreviewUrl(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }

  function removeAttachment() {
    setAttachType(null);
    setPreviewUrl(null);
    setFileName(null);
    setFileSize(null);
    if (photoRef.current) photoRef.current.value = "";
    if (pdfRef.current)   pdfRef.current.value   = "";
  }

  async function handlePost() {
    if ((!text.trim() && !attachType) || posting) return;
    const token = getToken();
    if (!token) { setError("Please login to post."); return; }

    setPosting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/feed`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          content: text.trim(),
          pdfName: attachType === "pdf" ? fileName : null,
          pdfSize: attachType === "pdf" ? fileSize : null,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        ["userToken","instituteToken","userLoggedIn","instituteLoggedIn","userData","instituteData"]
          .forEach(k => localStorage.removeItem(k));
        window.dispatchEvent(new Event("authStateChanged"));
        onClose();
        window.location.href = "/user-menu";
        return;
      }

      if (!res.ok) { setError(data.error || "Failed to post"); return; }
      onPostCreated?.(data.post);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  const canPost = (text.trim().length > 0 || !!attachType) && !posting;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 998,
        }}
      />

      {/* Sheet — sits above nav (z-50 = 50) using z-index 999, bottom 64px = nav height */}
      <div style={{
        position:      "fixed",
        left:          0,
        right:         0,
        bottom:        64,            /* nav height — keeps modal above nav */
        zIndex:        999,
        background:    "var(--color-background-primary, #fff)",
        borderRadius:  "20px 20px 0 0",
        boxShadow:     "0 -8px 32px rgba(0,0,0,0.18)",
        display:       "flex",
        flexDirection: "column",
        maxHeight:     "calc(85dvh - 64px)",
      }}>

        {/* Drag handle */}
        <div style={{ display:"flex", justifyContent:"center", padding:"10px 0 4px" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:"var(--color-border-secondary, #e5e7eb)" }} />
        </div>

        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"8px 16px 12px",
          borderBottom:"0.5px solid var(--color-border-tertiary, #f3f4f6)",
        }}>
          <button
            onClick={onClose}
            style={{
              width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
              borderRadius:"50%", background:"var(--color-background-secondary, #f9fafb)",
              border:"none", cursor:"pointer", color:"var(--color-text-secondary, #6b7280)",
            }}
          >
            <X size={16} />
          </button>

          <span style={{ fontSize:14, fontWeight:600, color:"var(--color-text-primary, #111827)" }}>
            New Post
          </span>

          <button
            onClick={handlePost}
            disabled={!canPost}
            style={{
              display:"flex", alignItems:"center", gap:6,
              fontSize:13, fontWeight:600,
              padding:"6px 18px",
              background: canPost ? "#4F46E5" : "var(--color-background-secondary, #f3f4f6)",
              color:      canPost ? "#fff"    : "var(--color-text-tertiary, #9ca3af)",
              borderRadius:20, border:"none",
              cursor: canPost ? "pointer" : "default",
              transition:"all .15s",
              opacity: canPost ? 1 : 0.6,
            }}
          >
            {posting && <Loader2 size={13} className="animate-spin" />}
            Post
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex:1, overflowY:"auto", padding:"14px 16px 8px" }}>
          <div style={{ display:"flex", gap:12 }}>
            <Avatar initials={me.initials} color={me.color} size="md" />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--color-text-primary, #111827)", marginBottom:6 }}>
                {me.name}
              </div>

              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={MAX_CHARS}
                rows={previewUrl || (attachType === "pdf" && fileName) ? 3 : 5}
                placeholder="Share notes, tips, or ask a question..."
                autoFocus
                style={{
                  width:"100%", fontSize:14,
                  color:"var(--color-text-primary, #111827)",
                  background:"none", border:"none", outline:"none",
                  resize:"none", lineHeight:1.65,
                  fontFamily:"inherit",
                }}
              />

              {/* Photo preview */}
              {attachType === "photo" && previewUrl && (
                <div style={{ position:"relative", marginTop:8, borderRadius:12, overflow:"hidden", border:"0.5px solid var(--color-border-tertiary, #f3f4f6)" }}>
                  <img
                    src={previewUrl} alt="preview"
                    style={{ width:"100%", maxHeight:180, objectFit:"cover", display:"block" }}
                  />
                  <button
                    onClick={removeAttachment}
                    style={{
                      position:"absolute", top:8, right:8,
                      width:28, height:28,
                      background:"rgba(0,0,0,0.55)", border:"none",
                      borderRadius:"50%", cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}
                  >
                    <X size={13} color="white" />
                  </button>
                </div>
              )}

              {/* PDF preview */}
              {attachType === "pdf" && fileName && (
                <div style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"10px 12px", marginTop:8,
                  background:"var(--color-background-secondary, #f9fafb)",
                  border:"0.5px solid var(--color-border-tertiary, #f3f4f6)",
                  borderRadius:10,
                }}>
                  <div style={{ width:34, height:34, background:"#FAECE7", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <FileText size={16} color="#993C1D" />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:"var(--color-text-primary, #111827)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{fileName}</div>
                    <div style={{ fontSize:11, color:"var(--color-text-tertiary, #9ca3af)", marginTop:2 }}>{fileSize}</div>
                  </div>
                  <button onClick={removeAttachment} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-text-tertiary, #9ca3af)", padding:4 }}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {error && (
                <p style={{ fontSize:12, color:"#EF4444", marginTop:8, fontWeight:500 }}>{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"10px 16px 14px",
          borderTop:"0.5px solid var(--color-border-tertiary, #f3f4f6)",
        }}>
          <div style={{ display:"flex", gap:4 }}>
            <input ref={photoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => handleFileSelect(e, "photo")} />
            <input ref={pdfRef}   type="file" accept=".pdf"    style={{ display:"none" }} onChange={e => handleFileSelect(e, "pdf")} />

            <button
              onClick={() => photoRef.current?.click()}
              style={{
                display:"flex", alignItems:"center", gap:5,
                fontSize:12, fontWeight:500, padding:"6px 12px",
                color:      attachType === "photo" ? "#4F46E5" : "var(--color-text-tertiary, #6b7280)",
                background: attachType === "photo" ? "#EEF2FF" : "none",
                border:"none", borderRadius:8, cursor:"pointer",
              }}
            >
              <ImageIcon size={15} /> Photo
            </button>

            <button
              onClick={() => pdfRef.current?.click()}
              style={{
                display:"flex", alignItems:"center", gap:5,
                fontSize:12, fontWeight:500, padding:"6px 12px",
                color:      attachType === "pdf" ? "#4F46E5" : "var(--color-text-tertiary, #6b7280)",
                background: attachType === "pdf" ? "#EEF2FF" : "none",
                border:"none", borderRadius:8, cursor:"pointer",
              }}
            >
              <FileText size={15} /> PDF
            </button>
          </div>

          <span style={{
            fontSize:11, fontWeight:600,
            color: text.length > MAX_CHARS * 0.85 ? "#EF4444" : "var(--color-text-tertiary, #9ca3af)",
          }}>
            {MAX_CHARS - text.length}
          </span>
        </div>

      </div>
    </>
  );
}