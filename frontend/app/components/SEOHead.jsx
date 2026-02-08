// app/components/SEOHead.jsx - REUSABLE SEO COMPONENT
"use client";
import Head from 'next/head';
import { generateMetaTags, generateSchema, getCanonicalUrl, generateOGTags } from '../utils/seo';

export default function SEOHead({ page, data = {}, schema = [] }) {
  const metaTags = generateMetaTags(page, data);
  const ogTags = generateOGTags(metaTags);
  const canonicalUrl = getCanonicalUrl(data.path || '/');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      <meta name="keywords" content={metaTags.keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Tags */}
      {Object.entries(ogTags).map(([key, value]) => (
        <meta key={key} property={key} content={value} />
      ))}

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="author" content="Inscovia" />

      {/* Schema.org JSON-LD */}
      {schema.map((schemaType, index) => {
        const schemaData = generateSchema(schemaType, data);
        return schemaData ? (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
          />
        ) : null;
      })}

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </Head>
  );
}

// USAGE EXAMPLES:

// Home Page
// <SEOHead page="home" schema={['organization']} />

// Center Detail Page
// <SEOHead
//   page="center"
//   data={{
//     name: center.name,
//     city: center.city,
//     state: center.state,
//     description: center.description,
//     slug: center.slug,
//     image: center.image,
//     logo: center.logo,
//     rating: center.rating,
//     phone: center.phone,
//     email: center.email,
//   }}
//   schema={['localBusiness', 'breadcrumb']}
// />

// Browse/Search Page
// <SEOHead
//   page="browse"
//   data={{ city: 'Kochi', category: 'NEET Coaching' }}
//   schema={['breadcrumb']}
// />

// City Page
// <SEOHead
//   page="city"
//   data={{ city: 'Mumbai', citySlug: 'mumbai' }}
//   schema={['breadcrumb']}
// />