// app/institute/dashboard/edit/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../../components/Footer";
import { getStateNames, getDistrictsByState } from "../../../../lib/locationUtils";
import ImageUploadSection from "./ImageUploadSection";
import BasicInfoSection from "./BasicInfoSection";

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [centerSlug, setCenterSlug] = useState(null);
  const [error, setError] = useState(null);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const [formData, setFormData] = useState({
    instituteName: "", email: "", phone: "", city: "", district: "",
    state: "", primaryCategory: "", secondaryCategories: [],
    teachingMode: "", location: "", description: "", website: "",
    whatsapp: "", facebook: "", instagram: "", linkedin: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    try { setStates(getStateNames()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (formData.state) {
      try { setDistricts(getDistrictsByState(formData.state)); }
      catch (e) { setDistricts([]); }
    } else {
      setDistricts([]);
    }
  }, [formData.state]);

  useEffect(() => { fetchInstituteData(); }, []);

  const fetchInstituteData = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const user = data.user;
      const center = data.center;

      setFormData({
        instituteName: user.instituteName || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        district: user.district || "",
        state: user.state || "",
        primaryCategory: user.primaryCategory || "",
        secondaryCategories: user.secondaryCategories || [],
        teachingMode: user.teachingMode || "",
        location: user.location || "",
        description: center?.description || "",
        website: center?.website || "",
        whatsapp: center?.whatsapp || "",
        facebook: center?.facebook || "",
        instagram: center?.instagram || "",
        linkedin: center?.linkedin || "",
      });

      if (center) {
        setCenterSlug(center.slug);
        setLogoPreview(center.logo);
        setCoverPreview(center.image);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please login again.");
      setTimeout(() => router.push("/institute/login"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "state" ? { district: "" } : {}),
    }));
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phone: value || "" }));
  };

  const handleSecondaryCategoryToggle = (category) => {
    setFormData(prev => {
      const current = prev.secondaryCategories || [];
      if (current.includes(category)) {
        return { ...prev, secondaryCategories: current.filter(c => c !== category) };
      }
      if (current.length >= 3) { alert("Maximum 3 secondary categories allowed"); return prev; }
      return { ...prev, secondaryCategories: [...current, category] };
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File size should be less than 5MB"); return; }
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File size should be less than 5MB"); return; }
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (token) => {
    if (!logoFile || !centerSlug) return null;
    const fd = new FormData();
    fd.append("logo", logoFile);
    const res = await fetch(`${API_URL}/centers/${centerSlug}/upload-logo`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Logo upload failed"); }
    return (await res.json()).logoUrl;
  };

  const uploadCover = async (token) => {
    if (!coverFile || !centerSlug) return null;
    const fd = new FormData();
    fd.append("image", coverFile);
    const res = await fetch(`${API_URL}/centers/${centerSlug}/upload-cover`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Cover upload failed"); }
    return (await res.json()).imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }

    try {
      if (logoFile) await uploadLogo(token);
      if (coverFile) await uploadCover(token);

      if (centerSlug) {
        const isStudyAbroad = formData.primaryCategory === "STUDY_ABROAD";
        const res = await fetch(`${API_URL}/centers/${centerSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: formData.instituteName,
            primaryCategory: formData.primaryCategory,
            secondaryCategories: formData.secondaryCategories,
            teachingMode: formData.teachingMode || (isStudyAbroad ? "ONLINE" : "OFFLINE"),
            state: formData.state,
            district: formData.district,
            city: formData.city,
            location: formData.location,
            description: formData.description,
            website: formData.website,
            whatsapp: formData.whatsapp,
            phone: formData.phone,
            email: formData.email,
            facebook: formData.facebook,
            instagram: formData.instagram,
            linkedin: formData.linkedin,
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update profile");
        }
      }

      alert("Profile updated successfully!");
      router.push("/institute/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile. Please try again.");
      alert(error.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !formData.email) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-1">Update your institute information</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <ImageUploadSection
          logoPreview={logoPreview}
          coverPreview={coverPreview}
          onLogoChange={handleLogoChange}
          onCoverChange={handleCoverChange}
        />

        <BasicInfoSection
          formData={formData}
          states={states}
          districts={districts}
          onInputChange={handleInputChange}
          onPhoneChange={handlePhoneChange}
          onSecondaryCategoryToggle={handleSecondaryCategoryToggle}
        />

        <div className="flex items-center justify-end gap-3 bg-white rounded-lg shadow-sm border p-6">
          <button type="button" onClick={() => router.push("/institute/dashboard")} disabled={saving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 flex items-center gap-2 transition-colors">
            {saving ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Saving...</>
            ) : "Save Changes"}
          </button>
        </div>
      </form>

      <Footer />
    </main>
  );
}