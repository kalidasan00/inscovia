// app/institute/dashboard/edit/ImageUploadSection.jsx
"use client";

export default function ImageUploadSection({
  logoPreview,
  coverPreview,
  onLogoChange,
  onCoverChange
}) {
  return (
    <>
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
              onChange={onCoverChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90 file:cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Any size accepted • Auto-optimized to 1200x628px • Max 5MB</p>
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
              onChange={onLogoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90 file:cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Any size accepted • Auto-optimized to 500x500px • Max 5MB</p>
          </div>
        </div>
      </div>
    </>
  );
}