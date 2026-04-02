// app/centers/[slug]/page.js - FIXED: XSS sanitization in JSON-LD
import CenterDetailClient from './center-detail-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// ✅ FIX #1: Sanitize strings going into JSON-LD to prevent XSS
function sanitizeForJsonLd(str) {
  if (typeof str !== "string") return str;
  return str.replace(/<\/script>/gi, "<\\/script>").replace(/<!--/g, "<\\!--");
}

function sanitizeCenter(center) {
  return {
    ...center,
    name: sanitizeForJsonLd(center.name),
    description: sanitizeForJsonLd(center.description),
    city: sanitizeForJsonLd(center.city),
    state: sanitizeForJsonLd(center.state),
  };
}

async function getCenter(slug) {
  try {
    const res = await fetch(`${API_URL}/centers/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching center:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const center = await getCenter(params.slug);

  if (!center) {
    return {
      title: 'Center Not Found | Inscovia',
      description: 'The training center you are looking for could not be found.',
    };
  }

  const category = center.primaryCategory?.replace(/_/g, ' ').toLowerCase() || 'training';
  const shortDesc = center.description?.substring(0, 150) || `${center.name} in ${center.city}`;
  // ✅ SEO FIX: removed courseKeywords — no longer needed after keywords removal

  return {
    title: `${center.name} - ${center.city} | Reviews, Courses & Admission`,
    description: `${center.name} in ${center.city}, ${center.state}. ${shortDesc}... Read reviews, compare courses, and get admission details.`,
    // ✅ SEO FIX #1: removed keywords[] — Google has ignored this meta tag since 2009.
    // keeping it was dead weight and can signal spam to Bing crawler.
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
      // ✅ SEO FIX #2: changed inscovia.com → www.inscovia.com
      // layout.js uses www. as the metadataBase. Google treats inscovia.com and
      // www.inscovia.com as two different sites — inconsistent canonicals cause
      // duplicate content issues and split link equity between both versions.
      canonical: `https://www.inscovia.com/centers/${params.slug}`,
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

function buildSchemas(center) {
  // ✅ FIX #1: sanitize center data before injecting into JSON-LD
  const c = sanitizeCenter(center);

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: c.name,
    description: c.description,
    // ✅ SEO FIX #2: www consistency
    url: `https://www.inscovia.com/centers/${c.slug}`,
    image: c.image || c.logo,
    logo: c.logo,
    telephone: c.phone,
    email: c.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: c.city,
      addressRegion: c.state,
      addressCountry: 'IN',
    },
    // ✅ SEO FIX #3: changed (c.rating > 0) → (c.rating > 0 && c.reviewCount > 0)
    // previously used reviewCount || 1 which meant if reviewCount was 0 or undefined,
    // Google was told there is 1 review when there isn't. Google can penalize
    // structured data that doesn't match actual page content — this is a trust signal.
    ...(c.rating > 0 && c.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: c.rating,
        reviewCount: c.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(c.website && { sameAs: [c.website] }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      // ✅ SEO FIX #2: www consistency across all breadcrumb URLs
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.inscovia.com' },
      { '@type': 'ListItem', position: 2, name: 'Centers', item: 'https://www.inscovia.com/centers' },
      { '@type': 'ListItem', position: 3, name: c.city, item: `https://www.inscovia.com/centers?city=${c.city}` },
      { '@type': 'ListItem', position: 4, name: c.name, item: `https://www.inscovia.com/centers/${c.slug}` },
    ],
  };

  const courseSchemas = center.courseDetails?.slice(0, 5).map((course) => ({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: sanitizeForJsonLd(course.name),
    provider: {
      '@type': 'Organization',
      name: c.name,
      // ✅ SEO FIX #2: www consistency
      url: `https://www.inscovia.com/centers/${c.slug}`,
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
    // ✅ SEO FIX #2: www consistency
    url: 'https://www.inscovia.com',
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

      {/* ✅ FIX #5: pass center data as prop so client doesn't fetch again */}
      <CenterDetailClient initialCenter={center} />
    </>
  );
}