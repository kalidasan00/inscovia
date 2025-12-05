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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <img src={center.image} alt={center.name} className="object-cover h-64 w-full" />
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold">{center.name}</h1>
            <div className="mt-1 text-sm text-gray-600">{center.location} • {center.type} • {center.rating} ★</div>

            <p className="mt-4 text-gray-700">{center.description}</p>

            <section className="mt-6">
              <h3 className="font-semibold">Courses</h3>
              <ul className="mt-2 space-y-2">
                {center.courses.map((c, idx) => (
                  <li key={idx} className="p-2 border rounded-md bg-gray-50">{c}</li>
                ))}
              </ul>
            </section>

            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 bg-accent text-white rounded-md">Enquiry</button>
              <button className="px-4 py-2 border rounded-md">Visit website</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
