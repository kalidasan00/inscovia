// frontend/app/user/profile/edit/page.jsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, Check, AlertCircle,
  User, AtSign, FileText, MapPin, Globe,
  Camera, X, ZoomIn, ZoomOut,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// ─── Crop Modal ───────────────────────────────────────────────────────────────

function CropModal({ imageSrc, onDone, onCancel }) {
  const canvasRef  = useRef(null);
  const imgRef     = useRef(null);
  const dragStart  = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [scale,    setScale]    = useState(1);
  const [offset,   setOffset]   = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const SIZE = 260;
  const CW   = 300;

  useEffect(() => {
    const img  = new Image();
    img.onload = () => { imgRef.current = img; };
    img.src    = imageSrc;
  }, [imageSrc]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;
    const ctx  = canvas.getContext("2d");
    ctx.clearRect(0, 0, CW, CW);
    const base = Math.max(SIZE / img.width, SIZE / img.height);
    const s    = base * scale;
    const iw   = img.width  * s;
    const ih   = img.height * s;
    const ix   = CW / 2 - iw / 2 + offset.x;
    const iy   = CW / 2 - ih / 2 + offset.y;
    ctx.drawImage(img, ix, iy, iw, ih);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, CW, CW);
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(CW / 2, CW / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(CW / 2, CW / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, ix, iy, iw, ih);
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(CW / 2, CW / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [scale, offset]);

  useEffect(() => {
    const raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  const getXY = (e) => {
    if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  };
  const onDown = (e) => {
    setDragging(true);
    const { x, y } = getXY(e);
    dragStart.current = { x, y, ox: offset.x, oy: offset.y };
  };
  const onMove = (e) => {
    if (!dragging) return;
    const { x, y } = getXY(e);
    setOffset({ x: dragStart.current.ox + x - dragStart.current.x, y: dragStart.current.oy + y - dragStart.current.y });
  };
  const onUp = () => setDragging(false);

  const handleApply = () => {
    const img = imgRef.current;
    if (!img) return;
    const out    = document.createElement("canvas");
    out.width    = 400;
    out.height   = 400;
    const ctx    = out.getContext("2d");
    const base   = Math.max(SIZE / img.width, SIZE / img.height);
    const s      = base * scale;
    const iw     = img.width  * s;
    const ih     = img.height * s;
    const ix     = CW / 2 - iw / 2 + offset.x;
    const iy     = CW / 2 - ih / 2 + offset.y;
    const f      = 400 / SIZE;
    const ox     = CW / 2 - SIZE / 2;
    const oy     = CW / 2 - SIZE / 2;
    ctx.beginPath();
    ctx.arc(200, 200, 200, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, (ix - ox) * f, (iy - oy) * f, iw * f, ih * f);
    out.toBlob(blob => onDone(blob), "image/jpeg", 0.82);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-sm font-bold text-gray-900">Adjust Photo</span>
          <button onClick={handleApply} className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors">
            Apply
          </button>
        </div>
        <div className="flex justify-center items-center bg-gray-900 py-3">
          <canvas
            ref={canvasRef} width={CW} height={CW}
            style={{ width: CW, height: CW }}
            className="touch-none cursor-grab active:cursor-grabbing rounded-lg"
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
            onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
          />
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setScale(s => Math.max(0.5, +(s - 0.1).toFixed(1)))}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <ZoomOut className="w-4 h-4 text-gray-600" />
            </button>
            <input type="range" min={0.5} max={3} step={0.05} value={scale}
              onChange={e => setScale(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-600" />
            <button onClick={() => setScale(s => Math.min(3, +(s + 0.1).toFixed(1)))}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <ZoomIn className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center">Drag to reposition · Pinch or slider to zoom</p>
        </div>
      </div>
    </div>
  );
}

// ─── Field component ──────────────────────────────────────────────────────────

function ProfileField({ Icon, label, fieldKey, type, placeholder, maxLength, hint, value, onChange }) {
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Icon className="w-3 h-3 text-indigo-500" />
          </div>
          <label className="text-xs font-bold text-gray-600">{label}</label>
        </div>
        {maxLength && (
          <span className={`text-[10px] font-medium tabular-nums ${value?.length >= maxLength ? "text-red-400" : "text-gray-300"}`}>
            {value?.length ?? 0}/{maxLength}
          </span>
        )}
      </div>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={e => onChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className="w-full text-sm text-gray-800 bg-gray-50 rounded-xl px-3 py-2.5 placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white resize-none leading-relaxed transition-all"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full text-sm text-gray-800 bg-gray-50 rounded-xl px-3 py-2.5 placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white transition-all"
        />
      )}
      {hint && <p className="text-[10px] text-gray-400 mt-1.5 px-1">{hint}</p>}
    </div>
  );
}

// ─── Edit Profile Page ────────────────────────────────────────────────────────

export default function EditProfilePage() {
  const router  = useRouter();
  const fileRef = useRef(null);

  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [success,         setSuccess]         = useState(false);
  const [error,           setError]           = useState("");
  const [cropSrc,         setCropSrc]         = useState(null);
  const [avatarPreview,   setAvatarPreview]   = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError,     setAvatarError]     = useState("");

  const [form, setForm] = useState({
    name: "", username: "", bio: "", location: "", website: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const raw = localStorage.getItem("userData");
        if (!raw) { router.push("/login"); return; }
        const cached = JSON.parse(raw);

        setForm({
          name:     cached.name     || "",
          username: cached.username || "",
          bio:      cached.bio      || "",
          location: cached.location || "",
          website:  cached.website  || "",
        });
        setAvatarPreview(cached.avatar || null);

        const token = localStorage.getItem("userToken");
        if (token) {
          const res  = await fetch(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data.user) {
            const u = data.user;
            setForm({
              name:     u.name     || cached.name     || "",
              username: u.username || cached.username || "",
              bio:      u.bio      || cached.bio      || "",
              location: u.location || cached.location || "",
              website:  u.website  || cached.website  || "",
            });
            if (u.avatar) setAvatarPreview(u.avatar);
            localStorage.setItem("userData", JSON.stringify({ ...cached, ...u }));
          }
        }
      } catch { router.push("/login"); }
      finally  { setLoading(false); }
    };
    load();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setAvatarError("Please select an image file."); return; }
    if (file.size > 10 * 1024 * 1024)   { setAvatarError("Image must be under 10 MB.");   return; }
    setAvatarError("");
    const reader = new FileReader();
    reader.onloadend = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropDone = async (blob) => {
    setCropSrc(null);
    setUploadingAvatar(true);
    setAvatarError("");
    try {
      const token = localStorage.getItem("userToken");
      const fd    = new FormData();
      fd.append("image", blob, "avatar.jpg");
      const res  = await fetch(`${API_URL}/user/avatar`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAvatarPreview(data.avatar);
      const existing = JSON.parse(localStorage.getItem("userData") || "{}");
      localStorage.setItem("userData", JSON.stringify({ ...existing, avatar: data.avatar }));
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChange = (fieldKey, val) => {
    setForm(f => ({ ...f, [fieldKey]: val }));
    setError("");
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (form.username && !/^[a-z0-9_]{3,20}$/.test(form.username)) {
      setError("Username: 3–20 chars, lowercase letters, numbers, underscores only."); return;
    }
    if (form.website && !/^https?:\/\//.test(form.website)) {
      setError("Website must start with http:// or https://"); return;
    }
    setSaving(true); setError("");
    try {
      const token = localStorage.getItem("userToken");
      const res   = await fetch(`${API_URL}/user/profile`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          name:     form.name.trim()     || undefined,
          username: form.username.trim() || undefined,
          bio:      form.bio.trim()      || undefined,
          location: form.location.trim() || undefined,
          website:  form.website.trim()  || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save."); return; }
      const existing = JSON.parse(localStorage.getItem("userData") || "{}");
      localStorage.setItem("userData", JSON.stringify({ ...existing, ...data.user }));
      setSuccess(true);
      setTimeout(() => router.push("/user/dashboard"), 900);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-lg mx-auto py-16 flex justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    </div>
  );

  const initials = form.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  // ✅ Use fieldKey instead of key so React doesn't consume it
  const fields = [
    {
      fieldKey: "name", label: "Full Name", Icon: User, type: "text",
      placeholder: "Your full name", maxLength: 50,
    },
    {
      fieldKey: "username", label: "Username", Icon: AtSign, type: "text",
      placeholder: "e.g. kalidasan_vv", maxLength: 20,
      hint: "3–20 chars · lowercase · letters, numbers, underscores",
    },
    {
      fieldKey: "bio", label: "Bio", Icon: FileText, type: "textarea",
      placeholder: "Tell people about yourself…", maxLength: 160,
    },
    {
      fieldKey: "location", label: "Location", Icon: MapPin, type: "text",
      placeholder: "City, State", maxLength: 60,
    },
    {
      fieldKey: "website", label: "Website", Icon: Globe, type: "text",
      placeholder: "https://yoursite.com", maxLength: 100,
    },
  ];

  return (
    <>
      {cropSrc && (
        <CropModal imageSrc={cropSrc} onDone={handleCropDone} onCancel={() => setCropSrc(null)} />
      )}

      <div className="max-w-lg mx-auto pb-24 md:pb-8">

        {/* ── Sticky header ── */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="px-4 h-14 flex items-center gap-3">
            <button onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="flex-1 text-sm font-bold text-gray-900">Edit Profile</h1>
            <button onClick={handleSave} disabled={saving || success}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                success
                  ? "bg-emerald-500 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
              }`}>
              {saving   ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
               : success ? <Check   className="w-3.5 h-3.5" />
               : null}
              {saving ? "Saving…" : success ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        <div className="px-4 pt-6 space-y-4">

          {/* ── Avatar ── */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100 border-4 border-white shadow-lg flex items-center justify-center">
                {uploadingAvatar ? (
                  <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
                ) : avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-indigo-500">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 border-2 border-white">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <p className="text-xs text-gray-400 mt-1">Tap camera icon to change photo</p>
            {avatarError && (
              <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {avatarError}
              </div>
            )}
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-2xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          {/* ── Fields card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-100">
            {fields.map(f => (
              <ProfileField
                key={f.fieldKey}
                {...f}
                value={form[f.fieldKey]}
                onChange={handleChange}
              />
            ))}
          </div>

          {/* ── Save button ── */}
          <button onClick={handleSave} disabled={saving || success}
            className={`w-full py-3.5 text-sm font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 ${
              success
                ? "bg-emerald-500 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
            }`}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {success && <Check className="w-4 h-4" />}
            {saving ? "Saving…" : success ? "Saved! Redirecting…" : "Save Changes"}
          </button>

        </div>
      </div>
    </>
  );
}