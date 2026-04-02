// app/blog/page.js - BLOG HOMEPAGE
import BlogClient from './blog-client';

export const metadata = {
  title: 'Blog - Training & Education Guides | Inscovia',
  description: 'Expert guides, reviews, and tips for choosing the best training centers and coaching institutes. Stay updated with the latest in education.',
  alternates: {
    canonical: 'https://www.inscovia.com/blog',
  },
  openGraph: {
    title: 'Inscovia Blog - Training & Education Guides',
    description: 'Expert guides, reviews, and tips for choosing the best training centers.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Inscovia Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inscovia Blog - Training & Education Guides',
    description: 'Expert guides, reviews, and tips for choosing the best training centers.',
    images: ['/og-image.png'],
  },
};

export default function BlogPage() {
  return <BlogClient />;
}