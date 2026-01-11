// app/centers/page.js - SERVER COMPONENT with DYNAMIC SEO
import CentersClient from './centers-client';

// 🎯 DYNAMIC SEO based on URL parameters
export async function generateMetadata({ searchParams }) {
  const category = searchParams?.category;
  const city = searchParams?.city;
  const state = searchParams?.state;
  const q = searchParams?.q;

  let title = 'Browse Training Centers & Coaching Institutes';
  let description = 'Explore thousands of verified training centers across India. Filter by category, location, and rating to find the perfect institute for your goals.';
  let keywords = ['training centers', 'coaching institutes', 'skill development'];

  // Category-specific SEO
  if (category === 'TECHNOLOGY') {
    title = 'Technology Training Centers & IT Courses in India';
    description = 'Find the best technology training centers for programming, web development, data science, AI/ML, cybersecurity, and software development courses across India.';
    keywords = ['programming courses', 'web development training', 'data science', 'AI ML courses', 'IT training India'];
  } else if (category === 'MANAGEMENT') {
    title = 'Management Training & MBA Coaching Institutes in India';
    description = 'Top management training centers for MBA preparation, business management, project management, HR, and leadership development courses.';
    keywords = ['MBA coaching', 'management courses', 'business training', 'leadership development'];
  } else if (category === 'SKILL_DEVELOPMENT') {
    title = 'Skill Development & Professional Training Centers';
    description = 'Explore skill development programs in digital marketing, graphic design, communication, accounting, and professional certification courses.';
    keywords = ['skill development', 'digital marketing courses', 'professional training', 'graphic design'];
  } else if (category === 'EXAM_COACHING') {
    title = 'Exam Preparation & Competitive Coaching Institutes';
    description = 'Best coaching centers for IIT-JEE, NEET, UPSC, SSC, banking, and other competitive exam preparation with expert faculty.';
    keywords = ['IIT JEE coaching', 'NEET preparation', 'UPSC training', 'competitive exams'];
  }

  // City-specific SEO
  if (city) {
    const cityName = city;
    const stateName = state || '';
    title = `Training Centers in ${cityName}${stateName ? ', ' + stateName : ''} | Coaching Institutes`;
    description = `Find top-rated training centers and coaching institutes in ${cityName}. Browse Technology, Management, Skill Development, and Exam Preparation courses.`;
    keywords = [`training centers ${cityName}`, `coaching ${cityName}`, `courses ${cityName}`, `institutes ${cityName}`];
  }

  // State-specific SEO
  if (state && !city) {
    title = `Training Centers in ${state} | Coaching Institutes`;
    description = `Discover top training centers across ${state}. Compare courses, read reviews, and enroll in verified institutes.`;
    keywords = [`training centers ${state}`, `coaching ${state}`, `courses ${state}`];
  }

  // Search query SEO
  if (q) {
    title = `Search Results for "${q}" | Training Centers`;
    description = `Find training centers and courses related to "${q}". Compare institutes, read reviews, and choose the best option for your career.`;
    keywords = [q, `${q} training`, `${q} courses`, `${q} institutes`];
  }

  return {
    title,
    description,
    keywords,
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

export default function CentersPage() {
  return <CentersClient />;
}