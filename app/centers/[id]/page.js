// app/centers/[id]/page.js
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getCenterById } from "../../../lib/utils";

export default function CenterDetails({ params }) {
  const center = getCenterById(params.id);

  if (!center) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <h2 className="text-xl font-semibold">Center not found</h2>
          <p className="mt-2">We couldn't find the center you requested.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
          {/* Header Section with Logo and Banner */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-r from-gray-100 to-gray-50">
            <img
              src={center.image}
              alt={center.name}
              className="object-cover h-full w-full opacity-90"
            />

            {/* Logo Badge */}
            <div className="absolute -bottom-6 sm:-bottom-8 left-4 sm:left-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg shadow-md border-2 border-white flex items-center justify-center overflow-hidden">
                <img
                  src={center.logo || center.image}
                  alt={`${center.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="pt-8 sm:pt-12 px-4 sm:px-6 pb-4 sm:pb-6">
            {/* Title and Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{center.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {center.location}
                  </span>
                  <span>•</span>
                  <span>{center.type}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium text-yellow-600">
                    {center.rating}
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Action Buttons - Desktop */}
              <div className="hidden sm:flex gap-2 ml-4">
                <button className="px-5 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90 transition-colors">
                  Enquiry
                </button>
                <button className="px-5 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Website
                </button>
              </div>
            </div>

            {/* Action Buttons - Mobile */}
            <div className="flex sm:hidden gap-2 mt-4">
              <button className="flex-1 px-4 py-2.5 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90 transition-colors">
                Enquiry
              </button>
              <button className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Website
              </button>
            </div>

            {/* Description */}
            <p className="mt-4 text-gray-700 text-sm leading-relaxed">{center.description}</p>

            {/* Courses Section */}
            <section className="mt-5 sm:mt-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Available Courses</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {center.courses.map((c, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700 hover:border-accent/30 hover:bg-accent/5 transition-colors"
                  >
                    {c}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}