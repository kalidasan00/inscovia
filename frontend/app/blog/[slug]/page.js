// app/blog/[slug]/page.js - BLOG DETAIL PAGE WITH SEO
import BlogDetailClient from './blog-detail-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Generate dynamic metadata for each blog post
export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${API_URL}/blog/${params.slug}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      return {
        title: 'Blog Post Not Found | Inscovia',
        description: 'The blog post you are looking for could not be found.'
      };
    }

    const { blog } = await res.json();

    return {
      title: blog.metaTitle || `${blog.title} | Inscovia Blog`,
      description: blog.metaDescription || blog.excerpt || blog.title,
      keywords: blog.metaKeywords || blog.tags,
      authors: [{ name: blog.authorName }],
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        type: 'article',
        publishedTime: blog.publishedAt,
        modifiedTime: blog.updatedAt,
        authors: [blog.authorName],
        images: blog.featuredImage ? [
          {
            url: blog.featuredImage,
            width: 1200,
            height: 630,
            alt: blog.title,
          }
        ] : [],
        siteName: 'Inscovia',
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: blog.excerpt,
        images: blog.featuredImage ? [blog.featuredImage] : [],
      },
      alternates: {
        canonical: `https://inscovia.com/blog/${params.slug}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog | Inscovia',
      description: 'Read our latest blog posts and guides.'
    };
  }
}

// Generate JSON-LD schemas
async function generateSchemas(slug) {
  try {
    const res = await fetch(`${API_URL}/blog/${slug}`, {
      cache: 'no-store'
    });

    if (!res.ok) return null;

    const { blog } = await res.json();

    // Article Schema
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
          url: 'https://res.cloudinary.com/dwddvakdf/image/upload/v1768211226/Inscovia_-_1_2_zbkogh.png'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://inscovia.com/blog/${blog.slug}`
      },
      wordCount: blog.content.split(/\s+/).length,
      timeRequired: `PT${blog.readingTime}M`,
      keywords: blog.tags?.join(', ')
    };

    // Breadcrumb Schema
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
          name: 'Blog',
          item: 'https://inscovia.com/blog',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: blog.title,
          item: `https://inscovia.com/blog/${blog.slug}`,
        },
      ],
    };

    return { articleSchema, breadcrumbSchema };
  } catch (error) {
    console.error('Error generating schemas:', error);
    return null;
  }
}

export default async function BlogDetailPage({ params }) {
  const schemas = await generateSchemas(params.slug);

  return (
    <>
      {/* Add Schema.org JSON-LD */}
      {schemas && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schemas.articleSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schemas.breadcrumbSchema),
            }}
          />
        </>
      )}

      <BlogDetailClient slug={params.slug} />
    </>
  );
}