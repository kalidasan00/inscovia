// backend/src/routes/sitemap.routes.js - SITEMAP GENERATOR
import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// Generate XML Sitemap
router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || "https://inscovia.com";
    const currentDate = new Date().toISOString().split('T')[0];

    // Get all centers
    const centers = await prisma.center.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/contact', priority: '0.8', changefreq: 'monthly' },
      { url: '/centers', priority: '0.9', changefreq: 'daily' },
    ];

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Add center pages
    centers.forEach(center => {
      const lastmod = center.updatedAt
        ? new Date(center.updatedAt).toISOString().split('T')[0]
        : currentDate;

      sitemap += `  <url>
    <loc>${baseUrl}/centers/${center.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);

  } catch (error) {
    console.error("❌ Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

// Generate robots.txt
router.get("/robots.txt", (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || "https://inscovia.com";

  const robotsTxt = `# Inscovia Robots.txt
User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /institute/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1
`;

  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

export default router;