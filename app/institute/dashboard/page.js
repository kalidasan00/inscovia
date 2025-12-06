import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import institutes from "../../../data/institutes.json";
import Link from "next/link";

export default function InstituteDashboard() {
  const institute = institutes[0]; // STATIC INSTITUTE

  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Institute Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your institute profile and content</p>
          </div>
          <Link
            href="/institute/dashboard/edit"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </Link>
        </div>

        {/* Profile Card - LinkedIn Style */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
          {/* Cover Image with Edit Overlay */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-100 to-purple-100">
            {institute.coverImage ? (
              <img
                src={institute.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Edit Cover Button */}
            <Link
              href="/institute/dashboard/edit?section=cover"
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>

          {/* Logo Badge */}
          <div className="relative px-4 sm:px-6">
            <div className="absolute -top-8 sm:-top-10">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
                {institute.logo ? (
                  <img
                    src={institute.logo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}

                {/* Edit Logo Button */}
                <Link
                  href="/institute/dashboard/edit?section=logo"
                  className="absolute -bottom-1 -right-1 p-1.5 bg-accent text-white rounded-full shadow-lg hover:bg-accent/90 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-10 sm:pt-12 px-4 sm:px-6 pb-6">
            {/* Institute Info with Inline Edit */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{institute.name}</h2>
                  <Link
                    href="/institute/dashboard/edit?section=basic"
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Edit basic info"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Link>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {institute.location}
                  </span>
                  {institute.type && (
                    <>
                      <span>•</span>
                      <span>{institute.type}</span>
                    </>
                  )}
                  {institute.rating && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium text-yellow-600">
                        {institute.rating}
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 relative group">
              <p className="text-sm text-gray-700 leading-relaxed">{institute.description}</p>
              <Link
                href="/institute/dashboard/edit?section=description"
                className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all"
                title="Edit description"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/institute/dashboard/courses"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors group"
              >
                <svg className="w-5 h-5 text-gray-600 group-hover:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium">Manage Courses</span>
              </Link>

              <Link
                href="/institute/dashboard/gallery"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors group"
              >
                <svg className="w-5 h-5 text-gray-600 group-hover:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Gallery</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Gallery Preview */}
        {institute.gallery && institute.gallery.length > 0 && (
          <section className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Gallery</h3>
              <Link
                href="/institute/dashboard/gallery"
                className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {institute.gallery.slice(0, 8).map((img, idx) => (
                <div key={idx} className="relative group aspect-square overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}