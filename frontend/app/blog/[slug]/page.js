// app/blog/[slug]/page.js - BLOG DETAIL PAGE WITH SEO
import BlogDetailClient from './blog-detail-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

async function getBlog(slug) {
  try {
    const res = await fetch(`${API_URL}/blog/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const { blog } = await res.json();
    return blog;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const blog = await getBlog(params.slug);

  if (!blog) {
    return {
      title: 'Blog Post Not Found | Inscovia',
      description: 'The blog post you are looking for could not be found.',
    };
  }

  return {
    title: blog.metaTitle || `${blog.title} | Inscovia Blog`,
    description: blog.metaDescription || blog.excerpt || blog.title,
    authors: [{ name: blog.authorName }],
    alternates: {
      canonical: `https://www.inscovia.com/blog/${params.slug}`,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: 'article',
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt,
      authors: [blog.authorName],
      images: blog.featuredImage
        ? [{ url: blog.featuredImage, width: 1200, height: 630, alt: blog.title }]
        : [{ url: '/og-image.png', width: 1200, height: 630, alt: blog.title }],
      siteName: 'Inscovia',
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt,
      images: blog.featuredImage ? [blog.featuredImage] : ['/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function buildSchemas(blog, slug) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.featuredImage,
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
    author: {
      '@type': 'Person',
      name: blog.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Inscovia',
      logo: {
        '@type': 'ImageObject',
        url: 'https://res.cloudinary.com/dwddvakdf/image/upload/v1768211226/Inscovia_-_1_2_zbkogh.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.inscovia.com/blog/${slug}`,
    },
    wordCount: blog.content?.split(/\s+/).length || 0,
    timeRequired: `PT${blog.readingTime || 5}M`,
    keywords: blog.tags?.join(', '),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.inscovia.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.inscovia.com/blog' },
      { '@type': 'ListItem', position: 3, name: blog.title, item: `https://www.inscovia.com/blog/${slug}` },
    ],
  };

  return { articleSchema, breadcrumbSchema };
}

export default async function BlogDetailPage({ params }) {
  const blog = await getBlog(params.slug);
  const schemas = blog ? buildSchemas(blog, params.slug) : null;

  return (
    <>
      {schemas && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.articleSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas.breadcrumbSchema) }}
          />
        </>
      )}
      <BlogDetailClient slug={params.slug} />
    </>
  );
}