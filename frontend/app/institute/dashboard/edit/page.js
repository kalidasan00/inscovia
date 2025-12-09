// app/institute/dashboard/edit/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useRouter } from "next/navigation";

// Indian States and Districts
const LOCATION_DATA = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati"],
  "Delhi": ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "New Delhi"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
  "Karnataka": ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru", "Hubli-Dharwad", "Belagavi"],
  "Kerala": ["Thiruvananthapuram", "Kollam", "Kottayam", "Ernakulam", "Thrissur", "Kozhikode", "Kannur", "Kasaragod"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
};

export default function EditInstitute() {
  const router = useRouter();
  const coverInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    type: "Training Institute",
    state: "",
    district: "",
    city: "",
    location: "",
    description: "",
    image: "",
    logo: "",
    gallery: [],
    website: "",
    whatsapp: "",
    phone: "",
    email: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    courses: []
  });

  const [centerId, setCenterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [newCourse, setNewCourse] = useState("");

  useEffect(() => {
    loadCenterData();
  }, []);

  const loadCenterData = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) {
      router.push("/institute/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const center = data.center;

      if (center) {
        setCenterId(center.id);
        setForm({
          name: center.name || "",
          type: center.type || "Training Institute",
          state: center.state || "",
          district: center.district || "",
          city: center.city || "",
          location: center.location || "",
          description: center.description || "",
          image: center.image || "",
          logo: center.logo || "",
          gallery: center.gallery || [],
          website: center.website || "",
          whatsapp: center.whatsapp || "",
          phone: center.phone || "",
          email: center.email || "",
          facebook: center.facebook || "",
          instagram: center.instagram || "",
          linkedin: center.linkedin || "",
          courses: center.courses || []
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => {
    setForm({ ...form, [key]: value });
    if (key === "state") {
      setForm({ ...form, state: value, district: "", city: "" });
    }
  };

  const handleAddCourse = () => {
    if (newCourse.trim() && !form.courses.includes(newCourse.trim())) {
      setForm({ ...form, courses: [...form.courses, newCourse.trim()] });
      setNewCourse("");
    }
  };

  const handleRemoveCourse = (index) => {
    setForm({ ...form, courses: form.courses.filter((_, i) => i !== index) });
  };

  const uploadFile = async (file, type) => {
    const token = localStorage.getItem("instituteToken");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append(type, file);

      const endpoint = type === "logo" ? "upload-logo" : "upload-cover";
      const response = await fetch(`http://localhost:5001/api/centers/${centerId}/${endpoint}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const urlKey = type === "logo" ? "logoUrl" : "imageUrl";
      setForm({ ...form, [type === "logo" ? "logo" : "image"]: data[urlKey] });
      setMessage({ type: "success", text: `${type === "logo" ? "Logo" : "Cover"} uploaded successfully!` });
    } catch (error) {
      setMessage({ type: "error", text: `Failed to upload ${type}` });
    } finally {
      setUploading(false);
    }
  };

  const uploadLogo = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file, "logo");
  };

  const uploadCover = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file, "image");
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const token = localStorage.getItem("instituteToken");

    try {
      const response = await fetch(`http://localhost:5001/api/centers/${centerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error("Failed to save");

      setMessage({ type: "success", text: "✅ Profile updated successfully!" });
      setTimeout(() => router.push("/institute/dashboard"), 2000);
    } catch (error) {
      setMessage({ type: "error", text: "❌ Failed to save changes. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10 pb-24 md:pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Edit Profile</h1>
            <p className="text-sm text-gray-600 mt-1">Update your institute information</p>
          </div>
          <button
            onClick={() => router.push("/institute/dashboard")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={save} className="space-y-6">
          {/* Cover Image */}
          <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Cover Image</h2>
            <div
              onClick={() => !uploading && coverInputRef.current?.click()}
              className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-accent"
            >
              {form.image ? (
                <img src={form.image} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">{uploading ? "Uploading..." : "Click to upload cover"}</p>
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={uploadCover}
              disabled={uploading}
              className="hidden"
            />
          </section>

          {/* Logo */}
          <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Logo</h2>
            <div className="flex items-center gap-4 sm:gap-6">
              <div
                onClick={() => !uploading && logoInputRef.current?.click()}
                className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-accent overflow-hidden"
              >
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-500">
                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-xs">{uploading ? "..." : "Logo"}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Upload your logo</p>
                <p className="text-xs text-gray-400 mt-1">Square recommended</p>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={uploadLogo}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </section>

          {/* Basic Info */}
          <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Institute Name *</label>
                <input
                  type="text"
                  required
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type *</label>
                <select
                  required
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20"
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                >
                  <option value="Training Institute">Training Institute</option>
                  <option value="Skill Development">Skill Development</option>
                  <option value="Coaching Center">Coaching Center</option>
                  <option value="Language Institute">Language Institute</option>
                  <option value="Professional Training">Professional Training</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  required
                  rows="4"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20 resize-none"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe your institute..."
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">State *</label>
                <select
                  required
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                >
                  <option value="">Select State</option>
                  {Object.keys(LOCATION_DATA).sort().map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">District *</label>
                <select
                  required
                  disabled={!form.state}
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20 disabled:bg-gray-100"
                  value={form.district}
                  onChange={(e) => update("district", e.target.value)}
                >
                  <option value="">Select District</option>
                  {form.state && LOCATION_DATA[form.state]?.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  required
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address *</label>
                <input
                  type="text"
                  required
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="MG Road, Near Mall"
                />
              </div>
            </div>
          </section>

          {/* Courses */}
          <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Courses</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCourse())}
                placeholder="Add course (e.g., Python)"
                className="flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="button"
                onClick={handleAddCourse}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.courses.map((course, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
                  <span>{course}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCourse(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp</label>
                <input
                  type="tel"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20"
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Social Media */}
          <section className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Social Media</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Facebook</label>
                <input
                  type="url"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20"
                  value={form.facebook}
                  onChange={(e) => update("facebook", e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Instagram</label>
                <input
                  type="url"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20"
                  value={form.instagram}
                  onChange={(e) => update("instagram", e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn</label>
                <input
                  type="url"
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-accent/20"
                  value={form.linkedin}
                  onChange={(e) => update("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/..."
                />
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/institute/dashboard")}
              className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
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