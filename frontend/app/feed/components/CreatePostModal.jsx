"use client";

// components/CreatePostModal.jsx
import { useState, useRef } from "react";
import { X, ImageIcon, FileText, Loader2, Send } from "lucide-react";

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
  } catch { return { name: "You", initials: "YO", color: "blue" }; }
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
  const sizes = { sm: 28, md: 36, lg: 40 };
  const fontSizes = { sm: 10, md: 12, lg: 13 };
  const c = AVATAR_COLORS[color] || AVATAR_COLORS.blue;
  const s = sizes[size];
  return (
    <div style={{
      width: s, height: s, minWidth: s, background: c.bg, color: c.color,
      borderRadius: "50%", display: "flex", alignItems: "center",
      justifyContent: "center", fontWeight: 500, fontSize: fontSizes[size],
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function CreatePostModal({ onClose, onPostCreated }) {
  const me = getCurrentUser();
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [attachType, setAttachType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const photoRef = useRef(null);
  const pdfRef = useRef(null);

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
    if (pdfRef.current) pdfRef.current.value = "";
  }

  async function handlePost() {
    if (!text.trim() || posting) return;
    const token = getToken();
    if (!token) { setError("Please login to post."); return; }

    setPosting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          content: text.trim(),
          pdfName: attachType === "pdf" ? fileName : null,
          pdfSize: attachType === "pdf" ? fileSize : null,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("instituteToken");
        localStorage.removeItem("userLoggedIn");
        localStorage.removeItem("instituteLoggedIn");
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

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div style={{
        background: "var(--color-background-primary)", width: "100%", maxWidth: 520,
        borderRadius: "12px 12px 0 0", overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <button onClick={onClose} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)" }}>
            <X size={16} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>New post</span>
          <button onClick={handlePost} disabled={!text.trim() || posting} style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500,
            padding: "5px 16px", background: text.trim() && !posting ? "#534AB7" : "var(--color-background-secondary)",
            color: text.trim() && !posting ? "#EEEDFE" : "var(--color-text-tertiary)",
            borderRadius: 20, border: "none", cursor: text.trim() ? "pointer" : "default",
            transition: "all .15s",
          }}>
            {posting && <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />}
            Post
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", gap: 12, padding: "14px 16px 8px" }}>
          <Avatar initials={me.initials} color={me.color} size="md" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>{me.name}</div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={MAX_CHARS}
              rows={5}
              placeholder="Share notes, tips, or ask a question..."
              autoFocus
              style={{
                width: "100%", fontSize: 13, color: "var(--color-text-primary)",
                background: "none", border: "none", outline: "none",
                resize: "none", lineHeight: 1.6, fontFamily: "var(--font-sans)",
              }}
            />

            {/* Photo preview */}
            {attachType === "photo" && previewUrl && (
              <div style={{ position: "relative", marginBottom: 8 }}>
                <img src={previewUrl} alt="preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)" }} />
                <button onClick={removeAttachment} style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={12} color="white" />
                </button>
              </div>
            )}

            {/* PDF preview */}
            {attachType === "pdf" && fileName && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, marginBottom: 8 }}>
                <FileText size={16} color="#993C1D" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fileName}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{fileSize}</div>
                </div>
                <button onClick={removeAttachment} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)" }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {error && <p style={{ fontSize: 12, color: "#E24B4A", marginTop: 4 }}>{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
          <div style={{ display: "flex", gap: 4 }}>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFileSelect(e, "photo")} />
            <input ref={pdfRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => handleFileSelect(e, "pdf")} />
            <button onClick={() => photoRef.current?.click()} style={{
              display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500,
              color: attachType === "photo" ? "#534AB7" : "var(--color-text-tertiary)",
              background: attachType === "photo" ? "#EEEDFE" : "none",
              border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer",
            }}>
              <ImageIcon size={14} /> Photo
            </button>
            <button onClick={() => pdfRef.current?.click()} style={{
              display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500,
              color: attachType === "pdf" ? "#534AB7" : "var(--color-text-tertiary)",
              background: attachType === "pdf" ? "#EEEDFE" : "none",
              border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer",
            }}>
              <FileText size={14} /> PDF
            </button>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: text.length > MAX_CHARS * 0.85 ? "#E24B4A" : "var(--color-text-tertiary)" }}>
            {MAX_CHARS - text.length}
          </span>
        </div>

      </div>
    </div>
  );
}