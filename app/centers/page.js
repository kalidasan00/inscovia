// app/centers/page.js
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CenterCard from "../../components/CenterCard";
import CenterFilter from "../../components/CenterFilter";
import centers from "../../data/centers.json";

export default function Centers({ searchParams }) {
  const params = new URLSearchParams(searchParams ? Object.entries(searchParams) : []);
  // fallback: Next.js passes searchParams in server components automatically; if not, we still use centers
  const all = centers;

  const uniqueLocations = Array.from(new Set(all.map(c => c.location))).sort();

  // Basic server-side filtering via searchParams (works in App Router page components)
  const type = searchParams?.type || "";
  const location = searchParams?.location || "";
  const q = searchParams?.q || "";

  let filtered = all;
  if (type) filtered = filtered.filter(c => c.type.toLowerCase() === type.toLowerCase());
  if (location) filtered = filtered.filter(c => c.location.toLowerCase() === location.toLowerCase());
  if (q) filtered = filtered.filter(c => (c.name + " " + c.courses.join(" ")).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Training Centers</h1>
        <p className="text-gray-600 mt-1">Browse IT and Non-IT training centers.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <CenterFilter locations={uniqueLocations} />
          </div>

          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(center => (
                <CenterCard key={center.id} center={center} />
              ))}

              {filtered.length === 0 && (
                <div className="col-span-full p-6 bg-white rounded-md shadow-sm">
                  <p>No centers found. Try adjusting filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
