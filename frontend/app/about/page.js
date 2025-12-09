// app/about/page.js
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function About() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold">About Inscovia</h1>
        <p className="mt-4 text-gray-700">Inscovia helps students and professionals discover coaching & training centers across cities. We list IT and non-IT programs with ratings and key course details.</p>
        <section className="mt-6 bg-white p-4 rounded-md shadow-sm">
          <h2 className="font-semibold">Mission</h2>
          <p className="mt-2 text-gray-600">Make skills accessible and discoverable to everyone.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
