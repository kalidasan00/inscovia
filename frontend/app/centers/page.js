// app/centers/page.js - SERVER COMPONENT with DYNAMIC SEO
import CentersClient from './centers-client';

export async function generateMetadata({ searchParams }) {
  const category = searchParams?.category;
  const city = searchParams?.city;
  const state = searchParams?.state;
  const q = searchParams?.q;

  let title = 'Browse Training Centers & Coaching Institutes';
  let description = 'Explore verified training centers across India. Filter by category, location, and rating to find the perfect institute for your goals.';

  if (category === 'TECHNOLOGY') {
    title = 'Technology Training Centers & IT Courses in India';
    description = 'Find the best technology training centers for programming, web development, data science, AI/ML, cybersecurity, and software development courses across India.';
  } else if (category === 'MANAGEMENT') {
    title = 'Management Training & MBA Coaching Institutes in India';
    description = 'Top management training centers for MBA preparation, business management, project management, HR, and leadership development courses.';
  } else if (category === 'SKILL_DEVELOPMENT') {
    title = 'Skill Development & Professional Training Centers';
    description = 'Explore skill development programs in digital marketing, graphic design, communication, accounting, and professional certification courses.';
  } else if (category === 'EXAM_COACHING') {
    title = 'Exam Preparation & Competitive Coaching Institutes';
    description = 'Best coaching centers for IIT-JEE, NEET, UPSC, SSC, banking, and other competitive exam preparation with expert faculty.';
  }

  if (city) {
    title = `Training Centers in ${city}${state ? ', ' + state : ''} | Coaching Institutes`;
    description = `Find top-rated training centers and coaching institutes in ${city}. Browse Technology, Management, Skill Development, and Exam Preparation courses.`;
  }

  if (state && !city) {
    title = `Training Centers in ${state} | Coaching Institutes`;
    description = `Discover top training centers across ${state}. Compare courses, read reviews, and enroll in verified institutes.`;
  }

  if (q) {
    title = `"${q}" Training Centers & Courses in India`;
    description = `Find training centers and courses for "${q}" across India. Compare institutes, read reviews, and choose the best option for your career.`;
  }

  const canonicalParams = new URLSearchParams();
  if (category) canonicalParams.set('category', category);
  if (city) canonicalParams.set('city', city);
  if (state) canonicalParams.set('state', state);
  if (q) canonicalParams.set('q', q);
  const canonicalUrl = `https://www.inscovia.com/centers${canonicalParams.toString() ? '?' + canonicalParams.toString() : ''}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

async function getCenters() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/centers`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.centers || [];
  } catch {
    return [];
  }
}

export default async function CentersPage() {
  const initialCenters = await getCenters();
  return <CentersClient initialCenters={initialCenters} />;
}