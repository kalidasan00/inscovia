// app/blog/page.js - BLOG HOMEPAGE
import BlogClient from './blog-client';

export const metadata = {
  title: 'Blog - Training & Education Guides | Inscovia',
  description: 'Expert guides, reviews, and tips for choosing the best training centers and coaching institutes. Stay updated with the latest in education.',
  keywords: ['training guides', 'coaching tips', 'education blog', 'institute reviews', 'career guidance'],
  openGraph: {
    title: 'Inscovia Blog - Training & Education Guides',
    description: 'Expert guides, reviews, and tips for choosing the best training centers.',
    type: 'website',
  },
};

export default function BlogPage() {
  return <BlogClient />;
}