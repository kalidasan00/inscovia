// app/page.js - SERVER COMPONENT (for SEO)
import HomeClient from './home-client';

// 🎯 HOMEPAGE SEO METADATA (only works in server components)
export const metadata = {
  title: 'Inscovia - Find Best Training Centers & Coaching Institutes in India',
  description: 'Discover and compare 1000+ verified training centers across India. Browse Technology, Management, Skill Development, and Exam Preparation courses. Read reviews, compare institutes, and enroll in top-rated courses today.',
  keywords: [
    'training centers India',
    'coaching institutes',
    'skill development courses',
    'technology training',
    'management courses',
    'exam preparation coaching',
    'IIT JEE coaching',
    'NEET coaching',
    'data science courses',
    'web development training',
    'digital marketing courses',
    'AI ML courses',
    'CAT coaching',
    'UPSC preparation',
    'professional certification'
  ],
  openGraph: {
    title: 'Inscovia - Find Best Training Centers in India',
    description: 'Compare 1000+ verified training centers. Technology, Management, Skills & Exam Coaching.',
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
    description: 'Compare 1000+ verified training centers across India',
    images: ['/og-image.png'],
  },
};

// Server component that renders the client component
export default function HomePage() {
  return <HomeClient />;
}