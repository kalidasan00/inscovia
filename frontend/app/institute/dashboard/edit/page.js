// app/institute/dashboard/edit/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// Category and Teaching Mode options based on schema enums
const CATEGORIES = [
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "MANAGEMENT", label: "Management" },
  { value: "SKILL_DEVELOPMENT", label: "Skill Development" },
  { value: "EXAM_COACHING", label: "Exam Coaching" }
];

const TEACHING_MODES = [
  { value: "ONLINE", label: "Online" },
  { value: "OFFLINE", label: "Offline" },
  { value: "HYBRID", label: "Hybrid" }
];

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [centerId, setCenterId] = useState(null);
  const [error, setError] = useState(null);

  // ✅ USE ENVIRONMENT VARIABLE
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const [formData, setFormData] = useState({
    instituteName: "",
    email: "",
    phone: "",
    city: "",
    district: "",
    state: "",
    primaryCategory: "",
    secondaryCategories: [],
    teachingMode: "",
    location: "",
    description: "",
    website: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    linkedin: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    fetchInstituteData();
  }, []);

  const fetchInstituteData = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) {
      router.push("/institute/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      console.log("Edit page data:", data);

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
        setCenterId(center.id);
        setLogoPreview(center.logo);
        setCoverPreview(center.image);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please login again.");
      setTimeout(() => {
        router.push("/institute/login");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSecondaryCategoryToggle = (category) => {
    setFormData(prev => {
      const currentSecondary = prev.secondaryCategories || [];
      const isSelected = currentSecondary.includes(category);

      if (isSelected) {
        return {
          ...prev,
          secondaryCategories: currentSecondary.filter(c => c !== category)
        };
      } else {
        // Maximum 3 secondary categories
        if (currentSecondary.length >= 3) {
          alert("You can select maximum 3 secondary categories");
          return prev;
        }
        return {
          ...prev,
          secondaryCategories: [...currentSecondary, category]
        };
      }
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (token) => {
    if (!logoFile || !centerId) return null;

    const formDataUpload = new FormData();
    formDataUpload.append("logo", logoFile);

    const response = await fetch(`${API_URL.replace('/api', '')}/api/centers/${centerId}/upload-logo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formDataUpload
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Logo upload failed");
    }

    const data = await response.json();
    return data.logoUrl;
  };

  const uploadCover = async (token) => {
    if (!coverFile || !centerId) return null;

    const formDataUpload = new FormData();
    formDataUpload.append("image", coverFile);

    const response = await fetch(`${API_URL.replace('/api', '')}/api/centers/${centerId}/upload-cover`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formDataUpload
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Cover upload failed");
    }

    const data = await response.json();
    return data.imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = localStorage.getItem("instituteToken");
    if (!token) {
      router.push("/institute/login");
      return;
    }

    try {
      // Upload images first if selected
      if (logoFile) {
        console.log("Uploading logo...");
        await uploadLogo(token);
      }
      if (coverFile) {
        console.log("Uploading cover...");
        await uploadCover(token);
      }

      // Update center data
      if (centerId) {
        const centerUpdateData = {
          name: formData.instituteName,
          primaryCategory: formData.primaryCategory,
          secondaryCategories: formData.secondaryCategories,
          teachingMode: formData.teachingMode,
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
        };

        console.log("Updating center data:", centerUpdateData);

        const response = await fetch(`${API_URL.replace('/api', '')}/api/centers/${centerId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(centerUpdateData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update profile");
        }

        const result = await response.json();
        console.log("Update result:", result);
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
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile data...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error && !formData.email) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Get available secondary categories (exclude primary category)
  const availableSecondaryCategories = CATEGORIES.filter(
    cat => cat.value !== formData.primaryCategory
  );

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600 mt-1">Update your institute information</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Cover Image</h2>
            <div className="space-y-4">
              <div className="relative h-48 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg overflow-hidden">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">No cover image</p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90 file:cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 1200x400px, Max 5MB</p>
              </div>
            </div>
          </div>

          {/* Logo Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Logo</h2>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border-2 border-gray-200">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90 file:cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: Square image, Max 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institute Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="instituteName"
                  value={formData.instituteName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  pattern="[6-9][0-9]{9}"
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="primaryCategory"
                  value={formData.primaryCategory}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select Primary Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teaching Mode <span className="text-red-500">*</span>
                </label>
                <select
                  name="teachingMode"
                  value={formData.teachingMode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select Teaching Mode</option>
                  {TEACHING_MODES.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Categories (Optional - Max 3)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSecondaryCategories.map(cat => {
                    const isSelected = formData.secondaryCategories?.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleSecondaryCategoryToggle(cat.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-accent text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat.label}
                        {isSelected && (
                          <span className="ml-2">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {formData.secondaryCategories?.length || 0}/3
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location/Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., MG Road, Gandhi Nagar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell students about your institute, courses, facilities, achievements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 bg-white rounded-lg shadow-sm border p-6">
            <button
              type="button"
              onClick={() => router.push("/institute/dashboard")}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </>
  );
}