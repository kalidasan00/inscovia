// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  // ✅ SEO
  compress: true,
  trailingSlash: false,
  poweredByHeader: false,

  // ✅ Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ✅ Build output tracing
  experimental: {
    outputFileTracingRoot: require('path').join(__dirname),
    isrMemoryCacheSize: 52428800,
  },

  // ✅ Bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 5,
          },
        },
      };
    }
    return config;
  },

  // ✅ Security + Cache headers
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Robots-Tag', value: 'index, follow' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // ✅ FIXED: Added GTM and Google Analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // ✅ FIXED: Added map tile domains and cdnjs for Leaflet icons
              "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://cdn-icons-png.flaticon.com https://*.tile.openstreetmap.org https://unpkg.com https://cdnjs.cloudflare.com",
              // ✅ FIXED: Added OpenStreetMap tile and nominatim domains
              "connect-src 'self' https://inscovia.onrender.com https://*.onrender.com https://*.tile.openstreetmap.org https://nominatim.openstreetmap.org https://www.google-analytics.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },

  // ✅ Trailing slash redirects
  async redirects() {
    return [
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;