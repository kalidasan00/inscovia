"use client";
import { useState, useEffect } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

export default function EditInstitute() {
  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    logo: "",
    coverImage: "",
    gallery: []
  });

  // Load saved institute
  useEffect(() => {
    const saved = localStorage.getItem("inscovia_institute");
    if (saved) {
      const institute = JSON.parse(saved);
      setForm({
        ...institute,
        gallery: institute.gallery || []
      });
    }
  }, []);

  // Handle normal field updates
  const update = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  // Convert file -> Base64
  const toBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
  };

  // Upload logo
  const uploadLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    toBase64(file, (base64) => {
      update("logo", base64);
    });
  };

  // Upload cover
  const uploadCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    toBase64(file, (base64) => {
      update("coverImage", base64);
    });
  };

  // Upload multiple gallery images
  const uploadGallery = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      toBase64(file, (base64) => {
        update("gallery", [...form.gallery, base64]);
      });
    });
  };

  const deleteGalleryImage = (img) => {
    update("gallery", form.gallery.filter((i) => i !== img));
  };

  // Save all changes
  const save = (e) => {
    e.preventDefault();
    localStorage.setItem("inscovia_institute", JSON.stringify(form));
    alert("Changes saved!");
    window.location.href = "/institute/dashboard";
  };

  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold">Edit Institute Profile</h1>

        <form onSubmit={save} className="bg-white p-6 rounded-lg shadow mt-6 space-y-6">

          {/* Logo Upload */}
          <div>
            <label className="text-sm font-medium">Institute Logo</label>
            <input type="file" accept="image/*" onChange={uploadLogo} className="block mt-2" />
            {form.logo && <img src={form.logo} alt="logo" className="w-24 h-24 mt-3 rounded-md object-cover" />}
          </div>

          {/* Cover Image */}
          <div>
            <label className="text-sm font-medium">Cover / Background Image</label>
            <input type="file" accept="image/*" onChange={uploadCover} className="block mt-2" />
            {form.coverImage && <img src={form.coverImage} alt="cover" className="w-full h-40 mt-3 rounded-md object-cover" />}
          </div>

          {/* Gallery Upload */}
          <div>
            <label className="text-sm font-medium">Gallery Images</label>
            <input type="file" accept="image/*" multiple onChange={uploadGallery} className="block mt-2" />

            <div className="grid grid-cols-3 gap-3 mt-3">
              {form.gallery.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} className="w-full h-24 object-cover rounded-md border" />

                  <button
                    type="button"
                    onClick={() => deleteGalleryImage(img)}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium">Institute Name</label>
            <input
              className="w-full border px-3 py-2 rounded-md"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium">Location</label>
            <input
              className="w-full border px-3 py-2 rounded-md"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full border px-3 py-2 rounded-md"
              rows="4"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            ></textarea>
          </div>

          <button className="px-4 py-2 bg-accent text-white rounded-md">
            Save Changes
          </button>
        </form>
      </main>

      <Footer />
    </>
  );
}
