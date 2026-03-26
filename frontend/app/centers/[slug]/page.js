// app/centers/[slug]/page.js - FIXED: single fetch, no double API call
import CenterDetailClient from './center-detail-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// ── Shared fetch with ISR caching (revalidates every 60s, not on every request)
async function getCenter(slug) {
  try {
    const res = await fetch(`${API_URL}/centers/${slug}`, {
      next: { revalidate: 60 }, // ✅ was: cache: 'no-store' (hammered backend every request)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching center:", error);
    return null;
  }
}

// 🎯 DYNAMIC SEO FOR EACH CENTER
export async function generateMetadata({ params }) {
  const center = await getCenter(params.slug); // ✅ uses shared cached fetch

  if (!center) {
    return {
      title: 'Center Not Found | Inscovia',
      description: 'The training center you are looking for could not be found.',
    };
  }

  const category = center.primaryCategory?.replace(/_/g, ' ').toLowerCase() || 'training';
  const shortDesc = center.description?.substring(0, 150) || `${center.name} in ${center.city}`;
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
      ...courseKeywords,
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
        },
      ],
      type: 'website',
      siteName: 'Inscovia',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${center.name} - ${center.city}`,
      description: shortDesc,
      images: [center.image || center.logo || '/og-image.png'],
    },
    alternates: {
      canonical: `https://inscovia.com/centers/${params.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// ── Build all schemas from already-fetched center data (no extra fetch)
function buildSchemas(center) {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: center.name,
    description: center.description,
    url: `https://inscovia.com/centers/${center.slug}`,
    image: center.image || center.logo,
    logo: center.logo,
    telephone: center.phone,
    email: center.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: center.city,
      addressRegion: center.state,
      addressCountry: 'IN',
    },
    ...(center.rating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: center.rating,
        reviewCount: center.reviewCount || 1, // ✅ added reviewCount (required for Google rich results)
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(center.website && { sameAs: [center.website] }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://inscovia.com' },
      { '@type': 'ListItem', position: 2, name: 'Centers', item: 'https://inscovia.com/centers' },
      { '@type': 'ListItem', position: 3, name: center.city, item: `https://inscovia.com/centers?city=${center.city}` },
      { '@type': 'ListItem', position: 4, name: center.name, item: `https://inscovia.com/centers/${center.slug}` },
    ],
  };

  const courseSchemas = center.courseDetails?.slice(0, 5).map((course) => ({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    provider: {
      '@type': 'Organization',
      name: center.name,
      url: `https://inscovia.com/centers/${center.slug}`,
    },
    ...(course.fees && {
      offers: { '@type': 'Offer', price: course.fees, priceCurrency: 'INR' },
    }),
    ...(course.duration && { duration: course.duration }),
  })) || [];

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Inscovia',
    url: 'https://inscovia.com',
    logo: 'https://res.cloudinary.com/dwddvakdf/image/upload/v1768211226/Inscovia_-_1_2_zbkogh.png',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@inscovia.com',
    },
  };

  return { localBusinessSchema, breadcrumbSchema, courseSchemas, organizationSchema };
}

export default async function CenterDetailPage({ params }) {
  // ✅ FIXED: single fetch — Next.js deduplicates this across generateMetadata + here
  const center = await getCenter(params.slug);
  const schemas = center ? buildSchemas(center) : null;

  return (
    <>
      {schemas && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.organizationSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.localBusinessSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumbSchema) }}
          />
          {schemas.courseSchemas.map((schema, index) => (
            <script
              key={index}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
          ))}
        </>
      )}

      <CenterDetailClient />
    </>
  );
}