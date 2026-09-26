// app/institute/dashboard/college/edit/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../../../../components/Footer";
import { getStateNames, getDistrictsByState } from "../../../../../lib/locationUtils";
import ImageUploadSection from "./ImageUploadSection";
import CollegeBasicInfoSection from "./CollegeBasicInfoSection";

export default function EditCollegeProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collegeSlug, setCollegeSlug] = useState(null);
  const [error, setError] = useState(null);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const [formData, setFormData] = useState({
    instituteName: "", email: "", phone: "", city: "", district: "",
    state: "", location: "", description: "", website: "",
    whatsapp: "", facebook: "", instagram: "", linkedin: "", youtube: "",
    collegeType: "", ownership: "", collegePrimaryCategory: "",
    collegeSecondaryCategories: [], established: "", affiliatedUniversity: "",
    autonomous: false, deemedUniversity: false, ugcRecognized: false,
    naacGrade: "", naacScore: "", naacYear: "", nirfRank: "", nirfCategory: "",
    nirfYear: "", aicteApproved: false, nbaAccredited: false, regulatoryBody: "",
    pinCode: "", mapsUrl: "",
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

  useEffect(() => { fetchCollegeData(); }, []);

  const fetchCollegeData = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const user = data.user;
      const college = data.college;

      // ✅ Not a college account — bounce to the correct edit page
      if (!college) {
        router.push("/institute/dashboard/edit");
        return;
      }

      setCollegeSlug(college.slug);
      setFormData({
        instituteName: college.name || "",
        email: college.email || user?.email || "",
        phone: college.phone || user?.phone || "",
        whatsapp: college.whatsapp || "",
        website: college.website || "",
        facebook: college.facebook || "",
        instagram: college.instagram || "",
        linkedin: college.linkedin || "",
        youtube: college.youtube || "",
        description: college.description || "",
        state: college.state || "",
        district: college.district || "",
        city: college.city || "",
        location: college.location || "",
        pinCode: college.pinCode || "",
        mapsUrl: college.mapsUrl || "",
        collegeType: college.type || "",
        ownership: college.ownership || "",
        collegePrimaryCategory: college.primaryCategory || "",
        collegeSecondaryCategories: college.secondaryCategories || [],
        established: college.established || "",
        affiliatedUniversity: college.affiliatedUniversity || "",
        autonomous: college.autonomous || false,
        deemedUniversity: college.deemedUniversity || false,
        ugcRecognized: college.ugcRecognized || false,
        naacGrade: college.naacGrade || "",
        naacScore: college.naacScore ?? "",
        naacYear: college.naacYear || "",
        nirfRank: college.nirfRank || "",
        nirfCategory: college.nirfCategory || "",
        nirfYear: college.nirfYear || "",
        aicteApproved: college.aicteApproved || false,
        nbaAccredited: college.nbaAccredited || false,
        regulatoryBody: college.regulatoryBody || "",
      });

      setLogoPreview(college.logo);
      setCoverPreview(college.image);
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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phone: value || "" }));
  };

  const handleSecondaryCategoryToggle = (category) => {
    setFormData(prev => {
      const current = prev.collegeSecondaryCategories || [];
      if (current.includes(category)) {
        return { ...prev, collegeSecondaryCategories: current.filter(c => c !== category) };
      }
      if (current.length >= 3) { alert("Maximum 3 secondary categories allowed"); return prev; }
      return { ...prev, collegeSecondaryCategories: [...current, category] };
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
    if (!logoFile || !collegeSlug) return null;
    const fd = new FormData();
    fd.append("logo", logoFile);
    const res = await fetch(`${API_URL}/colleges/${collegeSlug}/upload-logo`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Logo upload failed"); }
    return (await res.json()).logoUrl;
  };

  const uploadCover = async (token) => {
    if (!coverFile || !collegeSlug) return null;
    const fd = new FormData();
    fd.append("image", coverFile);
    const res = await fetch(`${API_URL}/colleges/${collegeSlug}/upload-cover`, {
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

      if (collegeSlug) {
        const body = {
          name: formData.instituteName,
          type: formData.collegeType,
          ownership: formData.ownership,
          primaryCategory: formData.collegePrimaryCategory,
          secondaryCategories: formData.collegeSecondaryCategories,
          established: formData.established ? parseInt(formData.established) : null,
          affiliatedUniversity: formData.affiliatedUniversity,
          autonomous: formData.autonomous,
          deemedUniversity: formData.deemedUniversity,
          ugcRecognized: formData.ugcRecognized,
          naacGrade: formData.naacGrade,
          naacScore: formData.naacScore ? parseFloat(formData.naacScore) : null,
          naacYear: formData.naacYear ? parseInt(formData.naacYear) : null,
          nirfRank: formData.nirfRank ? parseInt(formData.nirfRank) : null,
          nirfCategory: formData.nirfCategory,
          nirfYear: formData.nirfYear ? parseInt(formData.nirfYear) : null,
          aicteApproved: formData.aicteApproved,
          nbaAccredited: formData.nbaAccredited,
          regulatoryBody: formData.regulatoryBody,
          state: formData.state,
          district: formData.district,
          city: formData.city,
          location: formData.location,
          pinCode: formData.pinCode,
          mapsUrl: formData.mapsUrl,
          description: formData.description,
          website: formData.website,
          whatsapp: formData.whatsapp,
          phone: formData.phone,
          email: formData.email,
          facebook: formData.facebook,
          instagram: formData.instagram,
          linkedin: formData.linkedin,
          youtube: formData.youtube,
        };

        const res = await fetch(`${API_URL}/colleges/${collegeSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update profile");
        }
      }

      alert("Profile updated successfully!");
      router.push("/institute/dashboard/college");
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
        <p className="text-gray-600 mt-1">Update your college information</p>
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

        <CollegeBasicInfoSection
          formData={formData}
          states={states}
          districts={districts}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onPhoneChange={handlePhoneChange}
          onSecondaryCategoryToggle={handleSecondaryCategoryToggle}
        />

        <div className="flex items-center justify-end gap-3 bg-white rounded-lg shadow-sm border p-6">
          <button type="button" onClick={() => router.push("/institute/dashboard/college")} disabled={saving}
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