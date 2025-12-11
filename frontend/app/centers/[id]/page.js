"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function CenterDetails() {
  const { id } = useParams();
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function loadCenter() {
      try {
        const res = await fetch(`${API_URL}/centers/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.warn("Backend still waking up, retrying...");
          setTimeout(loadCenter, 2000);
          return;
        }

        const data = await res.json();
        setCenter(data);
      } catch (err) {
        console.error("Error loading center:", err);
        setTimeout(loadCenter, 2000);
      } finally {
        setLoading(false);
      }
    }

    loadCenter();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-gray-600">Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!center) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Center Not Found</h2>
            <p className="text-gray-600 mb-4">
              The center you're looking for doesn't exist.
            </p>
            <Link href="/centers" className="text-accent hover:text-accent/80">
              ← Back to Centers
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-20 md:pb-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
          {/* Cover Image */}
          <div className="relative h-32 sm:h-48 bg-gray-100">
            {center.image && (
              <img
                src={center.image}
                alt={center.name}
                className="w-full h-full object-cover"
              />
            )}

            {/* Logo */}
            <div className="absolute -bottom-8 left-4 sm:left-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg shadow-md border-2 border-white overflow-hidden flex items-center justify-center">
                {center.logo ? (
                  <img src={center.logo} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400">No Logo</div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-10 sm:pt-12 px-4 sm:px-6 pb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {center.name}
            </h1>

            <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-2">
              <span>{center.location}</span>•<span>{center.type}</span>
            </div>

            {/* Description */}
            <p className="mt-4 text-sm text-gray-700">{center.description}</p>

            {/* Courses */}
            <section className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Available Courses
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {center.courses?.map((c, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 bg-gray-50 border rounded-lg text-sm"
                  >
                    {c}
                  </div>
                ))}
              </div>
            </section>

            {/* Back */}
            <div className="mt-6 pt-6 border-t">
              <Link
                href="/centers"
                className="text-accent hover:text-accent/80 text-sm"
              >
                ← Back to Centers
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
