/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // required for Vercel server functions
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
