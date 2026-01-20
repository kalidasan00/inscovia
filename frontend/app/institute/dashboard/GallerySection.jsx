// app/institute/dashboard/GallerySection.jsx
"use client";

export default function GallerySection({
  gallery = [],
  uploadingGallery,
  onGalleryUpload,
  onDeleteImage
}) {
  const currentGalleryCount = gallery.length;
  const canAddMorePhotos = currentGalleryCount < 3;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-900">
          Gallery ({currentGalleryCount}/3)
        </h2>
        {canAddMorePhotos && (
          <label className="text-accent text-xs font-medium cursor-pointer hover:text-accent/80">
            Add Photo
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onGalleryUpload}
              className="hidden"
              disabled={uploadingGallery}
            />
          </label>
        )}
      </div>

      {gallery.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {gallery.map((img, i) => (
            <div key={i} className="relative group aspect-square">
              <img
                src={img}
                alt={`Gallery ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border"
              />
              <button
                onClick={() => onDeleteImage(img)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 shadow-lg"
                aria-label="Delete image"
              >
                ×
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {[...Array(3 - currentGalleryCount)].map((_, i) => (
            <label
              key={`empty-${i}`}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-accent hover:bg-gray-50 transition-colors"
            >
              <input
                type="file"
                accept="image/*"
                onChange={onGalleryUpload}
                className="hidden"
                disabled={uploadingGallery}
              />
              <div className="text-center">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-gray-500">Add</span>
              </div>
            </label>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <label
              key={i}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-accent hover:bg-gray-50 transition-colors"
            >
              <input
                type="file"
                accept="image/*"
                onChange={onGalleryUpload}
                className="hidden"
                disabled={uploadingGallery}
              />
              <div className="text-center">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-500">Photo {i + 1}</span>
              </div>
            </label>
          ))}
        </div>
      )}

      {uploadingGallery && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent"></div>
          <p className="text-xs text-gray-500">Uploading and optimizing...</p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2 text-center">
        Auto-optimized to 1080x1080px • Max 5MB per photo
      </p>
    </div>
  );
}