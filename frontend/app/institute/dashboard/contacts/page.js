// app/institute/dashboard/contacts/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ManageContacts() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [centerSlug, setCenterSlug] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const [formData, setFormData] = useState({
    website: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    linkedin: "",
  });

  useEffect(() => { fetchContactData(); }, []);

  const fetchContactData = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed");

      const data = await response.json();
      const center = data.center;

      if (center) {
        setCenterSlug(center.slug);
        setFormData({
          website: center.website || "",
          whatsapp: center.whatsapp || "",
          facebook: center.facebook || "",
          instagram: center.instagram || "",
          linkedin: center.linkedin || "",
        });
      }
    } catch (error) {
      setError("Failed to load contact information");
      setTimeout(() => router.push("/institute/login"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem("instituteToken");
    if (!token || !centerSlug) { router.push("/institute/login"); return; }

    try {
      const response = await fetch(`${API_URL}/centers/${centerSlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update");
      }

      setSuccess(true);
      setTimeout(() => router.push("/institute/dashboard"), 1500);
    } catch (error) {
      setError(error.message || "Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 pb-24 md:pb-8">

      <div className="flex items-center gap-3 mb-5">
        <Link href="/institute/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Contact & Social Media</h1>
          <p className="text-xs text-gray-500">Manage your contact info and social links</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">Saved successfully! Redirecting...</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="bg-white border rounded-xl p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Website & Contact</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Website URL</label>
              <input type="url" name="website" value={formData.website}
                onChange={handleInputChange} placeholder="https://example.com"
                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
              <input type="tel" name="whatsapp" value={formData.whatsapp}
                onChange={handleInputChange} placeholder="10-digit number without country code"
                pattern="[6-9][0-9]{9}"
                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <p className="text-xs text-gray-400 mt-1">Indian mobile number without country code</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Social Media</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Facebook Page</label>
              <input type="url" name="facebook" value={formData.facebook}
                onChange={handleInputChange} placeholder="https://facebook.com/yourpage"
                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Instagram Profile</label>
              <input type="url" name="instagram" value={formData.instagram}
                onChange={handleInputChange} placeholder="https://instagram.com/yourpage"
                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">LinkedIn Page</label>
              <input type="url" name="linkedin" value={formData.linkedin}
                onChange={handleInputChange} placeholder="https://linkedin.com/company/yourcompany"
                className="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/institute/dashboard")}
            disabled={saving}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {saving
              ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</>
              : "Save Changes"
            }
          </button>
        </div>

      </form>
    </main>
  );
}