// app/page.js
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Featured IT & Non-IT Centers</h2>
              <p className="text-sm text-gray-600 mt-2">Hand-picked training centers to get you started.</p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/centers" className="p-4 border rounded-md hover:shadow">Explore all centers</Link>
                <Link href="/centers?type=IT" className="p-4 border rounded-md hover:shadow">Top IT Courses</Link>
              </div>
            </div>

            <aside className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold">Why Inscovia?</h3>
              <ul className="mt-3 text-sm text-gray-600 space-y-2">
                <li>Verified training centers</li>
                <li>Compare courses and ratings</li>
                <li>Mobile-first and fast</li>
              </ul>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
