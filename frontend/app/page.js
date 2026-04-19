// app/page.js
import { Suspense } from "react";
import HomeClient from "./home-client";

export const metadata = {
  title:
    "Inscovia - Find Best Training Centers & Coaching Institutes in India",
  description:
    "Discover and compare top-rated training centers across India. Browse Technology, Management, Skill Development, and Exam Preparation courses. Read reviews, compare institutes, and enroll today.",

  // ✅ Page-level canonical — only set here, not in layout
  alternates: {
    canonical: "https://www.inscovia.com",
  },

  openGraph: {
    title: "Inscovia - Find Best Training Centers in India",
    description:
      "Discover and compare top-rated training centers across India. Technology, Management, Skills & Exam Coaching.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Inscovia - Training Centers Directory",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Inscovia - Find Best Training Centers in India",
    description: "Discover and compare top-rated training centers across India",
    images: ["/og-image.png"],
  },
};

// ✅ Limited to 12 centers — homepage doesn't need all 500+
// revalidate reduced to 300s (5 min) so new institutes appear faster
async function getCenters() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/centers?limit=12&sort=rating`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.centers || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const initialCenters = await getCenters();

  return (
    // ✅ Suspense boundary — page shows skeleton instead of hanging
    // if getCenters() is slow or on revalidation
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeClient initialCenters={initialCenters} />
    </Suspense>
  );
}

// ✅ Lightweight skeleton — shown during SSR revalidation or slow fetch
function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="h-16 bg-white border-b border-gray-200" />
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}