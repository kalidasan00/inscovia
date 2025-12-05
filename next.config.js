/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  // ⬇️ This line forces Vercel to NOT export static HTML
  dynamic: 'force-dynamic',
};

module.exports = nextConfig;
