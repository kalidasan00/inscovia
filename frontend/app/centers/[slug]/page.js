// app/centers/[slug]/page.js - SERVER COMPONENT WITH COMPLETE SEO
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
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Training Center | Inscovia',
      description: 'View training center details, courses, and reviews.'
    };
  }
}

// ✅ NEW: Generate Schema.org JSON-LD for each center
async function generateSchemas(slug) {
  try {
    const res = await fetch(`${API_URL}/centers/${slug}`, {
      cache: 'no-store'
    });

    if (!res.ok) return null;

    const center = await res.json();

    // 1️⃣ Local Business Schema
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
          bestRating: 5,
          worstRating: 1,
        },
      }),
      ...(center.website && { sameAs: [center.website] }),
    };

    // 2️⃣ Breadcrumb Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://inscovia.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Centers',
          item: 'https://inscovia.com/centers',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: center.city,
          item: `https://inscovia.com/centers?city=${center.city}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: center.name,
          item: `https://inscovia.com/centers/${center.slug}`,
        },
      ],
    };

    // 3️⃣ Course Schema (for each course)
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
        offers: {
          '@type': 'Offer',
          price: course.fees,
          priceCurrency: 'INR',
        },
      }),
      ...(course.duration && { duration: course.duration }),
    })) || [];

    // 4️⃣ Organization Schema
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

    return {
      localBusinessSchema,
      breadcrumbSchema,
      courseSchemas,
      organizationSchema,
    };
  } catch (error) {
    console.error('Error generating schemas:', error);
    return null;
  }
}

export default async function CenterDetailPage({ params }) {
  const schemas = await generateSchemas(params.slug);

  return (
    <>
      {/* ✅ Add Schema.org JSON-LD */}
      {schemas && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schemas.organizationSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schemas.localBusinessSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schemas.breadcrumbSchema),
            }}
          />
          {schemas.courseSchemas.map((schema, index) => (
            <script
              key={index}
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema),
              }}
            />
          ))}
        </>
      )}

      <CenterDetailClient />
    </>
  );
}