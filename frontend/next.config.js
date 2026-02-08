/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',   // good for Vercel deployments

  // ✅ SEO Optimizations
  compress: true,  // Enable gzip compression
  trailingSlash: false,  // Consistent URLs (no trailing slash)
  poweredByHeader: false,  // Remove X-Powered-By header (security)

  // ✅ Image optimization
  images: {
    domains: ['res.cloudinary.com'],  // Allow Cloudinary images
    formats: ['image/avif', 'image/webp'],  // Modern formats
  },

  // ✅ Sitemap & robots.txt rewrites
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: 'https://inscovia.onrender.com/sitemap.xml',
      },
      {
        source: '/robots.txt',
        destination: 'https://inscovia.onrender.com/robots.txt',
      },
    ];
  },
};

module.exports = nextConfig;