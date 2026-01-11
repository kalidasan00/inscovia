// app/centers/[slug]/page.js - SERVER COMPONENT with SEO
import CenterDetailClient from './center-detail-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// 🎯 DYNAMIC SEO FOR EACH CENTER
export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${API_URL}/centers/${params.slug}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      return {
        title: 'Center Not Found | Inscovia',
        description: 'The training center you are looking for could not be found.'
      };
    }

    const center = await res.json();

    // Format category
    const category = center.primaryCategory?.replace(/_/g, ' ').toLowerCase() || 'training';

    // Get short description (first 150 chars)
    const shortDesc = center.description?.substring(0, 150) || `${center.name} in ${center.city}`;

    // Get first 5 courses for keywords
    const courseKeywords = center.courses?.slice(0, 5) || [];

    return {
      title: `${center.name} - ${center.city} | Reviews, Courses & Admission`,
      description: `${center.name} in ${center.city}, ${center.state}. ${shortDesc}... Read reviews, compare courses, and get admission details.`,
      keywords: [
        center.name,
        `${center.name} ${center.city}`,
        category,
        `${category} courses ${center.city}`,
        `${category} ${center.city}`,
        center.city,
        center.state,
        ...courseKeywords
      ],
      openGraph: {
        title: `${center.name} - ${center.city}`,
        description: shortDesc,
        images: [
          {
            url: center.image || center.logo || '/og-image.png',
            width: 1200,
            height: 630,
            alt: center.name,
          }
        ],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${center.name} - ${center.city}`,
        description: shortDesc,
        images: [center.image || center.logo || '/og-image.png'],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Training Center | Inscovia',
      description: 'View training center details, courses, and reviews.'
    };
  }
}

export default function CenterDetailPage() {
  return <CenterDetailClient />;
}