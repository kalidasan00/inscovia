// frontend/app/user/profile/edit/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check, AlertCircle, User, AtSign, FileText, MapPin, Globe } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");
  const [form, setForm] = useState({
    name:     "",
    username: "",
    bio:      "",
    location: "",
    website:  "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("userData");
      if (!raw) { router.push("/login"); return; }
      const u = JSON.parse(raw);
      setForm({
        name:     u.name     || "",
        username: u.username || "",
        bio:      u.bio      || "",
        location: u.location || "",
        website:  u.website  || "",
      });
    } catch { router.push("/login"); }
    finally  { setLoading(false); }
  }, []);

  const handleChange = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setError("");
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (form.username && !/^[a-z0-9_]{3,20}$/.test(form.username)) {
      setError("Username: 3-20 chars, lowercase letters, numbers, underscores only.");
      return;
    }
    if (form.website && !/^https?:\/\//.test(form.website)) {
      setError("Website must start with http:// or https://");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("userToken");
      const res   = await fetch(`${API_URL}/user/profile`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          name:     form.name.trim(),
          username: form.username.trim() || undefined,
          bio:      form.bio.trim()      || undefined,
          location: form.location.trim() || undefined,
          website:  form.website.trim()  || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save."); return; }

      // update localStorage
      const existing = JSON.parse(localStorage.getItem("userData") || "{}");
      localStorage.setItem("userData", JSON.stringify({ ...existing, ...data.user }));
      setSuccess(true);
      setTimeout(() => router.push("/user/dashboard"), 1000);
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

  const fields = [
    {
      key:         "name",
      label:       "Full Name",
      Icon:        User,
      type:        "text",
      placeholder: "Your full name",
      maxLength:   50,
    },
    {
      key:         "username",
      label:       "Username",
      Icon:        AtSign,
      type:        "text",
      placeholder: "e.g. kalidasan_vv",
      maxLength:   20,
      hint:        "3-20 chars, lowercase, numbers, underscores",
    },
    {
      key:         "bio",
      label:       "Bio",
      Icon:        FileText,
      type:        "textarea",
      placeholder: "Tell people about yourself...",
      maxLength:   160,
    },
    {
      key:         "location",
      label:       "Location",
      Icon:        MapPin,
      type:        "text",
      placeholder: "City, State",
      maxLength:   60,
    },
    {
      key:         "website",
      label:       "Website",
      Icon:        Globe,
      type:        "text",
      placeholder: "https://yoursite.com",
      maxLength:   100,
    },
  ];

  return (
    <div className="max-w-lg mx-auto pb-24 md:pb-8">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="flex-1 text-sm font-bold text-gray-900">Edit Profile</h1>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors">
            {saving
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : success
              ? <Check className="w-3.5 h-3.5" />
              : null
            }
            {saving ? "Saving..." : success ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Fields */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {fields.map(({ key, label, Icon, type, placeholder, maxLength, hint }) => (
            <div key={key} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <label className="text-xs font-semibold text-gray-500">{label}</label>
                {maxLength && (
                  <span className="ml-auto text-[10px] text-gray-300">
                    {form[key]?.length ?? 0}/{maxLength}
                  </span>
                )}
              </div>
              {type === "textarea" ? (
                <textarea
                  value={form[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  rows={3}
                  className="w-full text-sm text-gray-800 placeholder-gray-300 outline-none resize-none leading-relaxed"
                />
              ) : (
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  className="w-full text-sm text-gray-800 placeholder-gray-300 outline-none"
                />
              )}
              {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
            </div>
          ))}
        </div>

        {/* Save button bottom */}
        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl disabled:opacity-50 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Saving..." : success ? "Saved! Redirecting..." : "Save Changes"}
        </button>

      </div>
    </div>
  );
}