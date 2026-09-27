// app/institute/dashboard/college/gallery/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export default function GalleryTab() {
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setCollege(data.college);
    } catch {
      // layout handles redirect on auth failure
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    const currentGallery = college?.gallery || [];
    if (currentGallery.length + files.length > 6) {
      alert(`You can only have maximum 6 photos. Currently you have ${currentGallery.length}.`);
      return;
    }
    if (files.length === 0) return;
    setUploadingGallery(true);
    const token = localStorage.getItem("instituteToken");
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch(`${API_URL}/colleges/${college.slug}/upload-gallery`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || "Upload failed");
        }
      }
      await fetchData();
      alert("Photos uploaded successfully!");
    } catch (error) {
      alert(error.message || "Failed to upload photos. Please try again.");
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  const handleDeleteGalleryImage = async (imageUrl) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    const token = localStorage.getItem("instituteToken");
    try {
      const response = await fetch(`${API_URL}/colleges/${college.slug}/delete-gallery`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Delete failed");
      }
      await fetchData();
    } catch (error) {
      alert(error.message || "Failed to delete photo. Please try again.");
    }
  };

  if (loading || !college) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-900">Photo Gallery</h2>
        <span className="text-xs text-gray-400">{college.gallery?.length || 0}/6</span>
      </div>

      {college.gallery?.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {college.gallery.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
              <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => handleDeleteGalleryImage(url)}
                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {(college.gallery?.length || 0) < 6 && (
            <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              {uploadingGallery ? (
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-5 h-5 text-gray-400" />
              )}
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={handleGalleryUpload} disabled={uploadingGallery} />
            </label>
          )}
        </div>
      ) : (
        <label className="block text-center py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          {uploadingGallery ? (
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-1" />
          ) : (
            <Plus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          )}
          <p className="text-xs text-gray-500">Upload up to 6 photos</p>
          <input type="file" accept="image/*" multiple className="hidden"
            onChange={handleGalleryUpload} disabled={uploadingGallery} />
        </label>
      )}
    </div>
  );
}