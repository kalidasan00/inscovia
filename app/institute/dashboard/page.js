import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import institutes from "../../../data/institutes.json";
import Link from "next/link";

export default function InstituteDashboard() {
  const institute = institutes[0]; // STATIC INSTITUTE

  return (
    <>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold">Institute Dashboard</h1>

        <section className="bg-white p-6 rounded-lg shadow mt-6">

          {/* Cover Image */}
          {institute.coverImage && (
            <img
              src={institute.coverImage}
              alt="Cover"
              className="w-full h-48 object-cover rounded-md mb-4"
            />
          )}

          {/* Logo + Basic Info */}
          <div className="flex items-center gap-4">
            {institute.logo && (
              <img
                src={institute.logo}
                alt="Logo"
                className="w-16 h-16 rounded-md object-cover border"
              />
            )}

            <div>
              <h2 className="text-xl font-semibold">{institute.name}</h2>
              <p className="text-gray-600">{institute.location}</p>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-gray-700">{institute.description}</p>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/institute/dashboard/edit"
              className="px-4 py-2 bg-accent text-white rounded-md"
            >
              Edit Profile
            </Link>

            <Link
              href="/institute/dashboard/courses"
              className="px-4 py-2 border rounded-md"
            >
              Manage Courses
            </Link>

            <Link
              href="/institute/dashboard/gallery"
              className="px-4 py-2 border rounded-md"
            >
              Gallery
            </Link>
          </div>
        </section>

        {/* Gallery Preview */}
        {institute.gallery && institute.gallery.length > 0 && (
          <section className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Gallery</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {institute.gallery.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className="w-full h-32 object-cover rounded-md border"
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
