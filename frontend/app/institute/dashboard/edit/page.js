// app/institute/dashboard/edit/page.js - SIMPLIFIED VERSION
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../../components/Navbar";
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

  // Load states on mount
  useEffect(() => {
    try {
      const stateList = getStateNames();
      setStates(stateList);
    } catch (error) {
      console.error("Error loading states:", error);
    }
  }, []);

  // Load districts when state changes
  useEffect(() => {
    if (formData.state) {
      try {
        const districtList = getDistrictsByState(formData.state);
        setDistricts(districtList);
      } catch (error) {
        console.error("Error loading districts:", error);
        setDistricts([]);
      }
    } else {
      setDistricts([]);
    }
  }, [formData.state]);

  // Fetch institute data on mount
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

    if (name === 'state') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        district: ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phone: value || "" }));
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
    if (!logoFile || !centerSlug) return null;

    const formDataUpload = new FormData();
    formDataUpload.append("logo", logoFile);

    const response = await fetch(`${API_URL}/centers/${centerSlug}/upload-logo`, {
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
    if (!coverFile || !centerSlug) return null;

    const formDataUpload = new FormData();
    formDataUpload.append("image", coverFile);

    const response = await fetch(`${API_URL}/centers/${centerSlug}/upload-cover`, {
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
      // Upload images if changed
      if (logoFile) {
        console.log("Uploading logo...");
        await uploadLogo(token);
      }
      if (coverFile) {
        console.log("Uploading cover...");
        await uploadCover(token);
      }

      // Update center data
      if (centerSlug) {
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

        const response = await fetch(`${API_URL}/centers/${centerSlug}`, {
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
          {/* Image Upload Section */}
          <ImageUploadSection
            logoPreview={logoPreview}
            coverPreview={coverPreview}
            onLogoChange={handleLogoChange}
            onCoverChange={handleCoverChange}
          />

          {/* Basic Info Section */}
          <BasicInfoSection
            formData={formData}
            states={states}
            districts={districts}
            onInputChange={handleInputChange}
            onPhoneChange={handlePhoneChange}
            onSecondaryCategoryToggle={handleSecondaryCategoryToggle}
          />

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