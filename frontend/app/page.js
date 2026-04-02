// app/page.js - SERVER COMPONENT (for SEO)
import HomeClient from './home-client';

// 🎯 HOMEPAGE SEO METADATA (only works in server components)
export const metadata = {
  title: 'Inscovia - Find Best Training Centers & Coaching Institutes in India',

  // ✅ SEO FIX #1: removed "1000+ verified" — false claim, you confirmed no real data yet.
  // Google and users lose trust when landing page doesn't match the claim.
  description: 'Discover and compare top-rated training centers across India. Browse Technology, Management, Skill Development, and Exam Preparation courses. Read reviews, compare institutes, and enroll today.',

  // ✅ SEO FIX #2: removed keywords[] — Google ignores since 2009, Bing flags as spam signal.

  // ✅ SEO FIX #3: added canonical — prevents duplicate indexing of http vs https,
  // www vs non-www versions of homepage.
  alternates: {
    canonical: 'https://www.inscovia.com',
  },

  openGraph: {
    title: 'Inscovia - Find Best Training Centers in India',
    // ✅ SEO FIX #1: removed "1000+" false claim from OG description too
    description: 'Discover and compare top-rated training centers across India. Technology, Management, Skills & Exam Coaching.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Inscovia - Training Centers Directory',
      }
    ],
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Inscovia - Find Best Training Centers in India',
    // ✅ SEO FIX #1: removed "1000+" false claim from Twitter card too
    description: 'Discover and compare top-rated training centers across India',
    images: ['/og-image.png'],
  },
};

// ✅ SEO FIX #4: converted to async server component — fetches centers on server
// so Google sees real content (cities, categories, counts) on first load.
// previously HomeClient fetched in useEffect = Google saw empty shell.
async function getCenters() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/centers`,
      { next: { revalidate: 3600 } } // ISR — revalidate every hour
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.centers || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  // ✅ SEO FIX #4: pass real data to HomeClient so Google sees it on first crawl
  const initialCenters = await getCenters();
  return <HomeClient initialCenters={initialCenters} />;
}