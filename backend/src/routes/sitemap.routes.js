// backend/src/routes/sitemap.routes.js
import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || "https://inscovia.com";
    const currentDate = new Date().toISOString().split('T')[0];

    // Fetch all data in parallel
    const [centers, papers, blogs] = await Promise.all([
      prisma.center.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.previousYearPaper.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.blog ? prisma.blog.findMany({ select: { slug: true, updatedAt: true } }).catch(() => []) : Promise.resolve([]),
    ]);

    // Static pages
    const staticPages = [
      { url: '/',                        priority: '1.0', changefreq: 'daily' },
      { url: '/about',                   priority: '0.7', changefreq: 'monthly' },
      { url: '/contact',                 priority: '0.7', changefreq: 'monthly' },
      { url: '/centers',                 priority: '0.9', changefreq: 'daily' },
      { url: '/previous-year-papers',    priority: '0.9', changefreq: 'weekly' },
      { url: '/practice',                priority: '0.8', changefreq: 'weekly' },
      { url: '/blog',                    priority: '0.8', changefreq: 'weekly' },
    ];

    // Aptitude topic pages (great for SEO — e.g. "percentage aptitude questions")
    const aptitudeTopics = [
      'percentage', 'profit-and-loss', 'time-and-work', 'speed-and-distance',
      'number-series', 'blood-relations', 'coding-decoding', 'syllogism',
      'synonyms-antonyms', 'fill-in-the-blanks'
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Center pages
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

    // Previous year paper pages
    papers.forEach(paper => {
      const lastmod = paper.updatedAt
        ? new Date(paper.updatedAt).toISOString().split('T')[0]
        : currentDate;
      sitemap += `  <url>
    <loc>${baseUrl}/previous-year-papers/${paper.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    // Blog pages
    blogs.forEach(blog => {
      const lastmod = blog.updatedAt
        ? new Date(blog.updatedAt).toISOString().split('T')[0]
        : currentDate;
      sitemap += `  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    // Aptitude practice topic pages
    aptitudeTopics.forEach(topic => {
      sitemap += `  <url>
    <loc>${baseUrl}/practice?topic=${topic}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
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

// robots.txt
router.get("/robots.txt", (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || "https://inscovia.com";
  const robotsTxt = `# Inscovia Robots.txt
User-agent: *
Allow: /

Disallow: /api/
Disallow: /admin/
Disallow: /institute/
Disallow: /user/

Sitemap: ${baseUrl}/sitemap.xml

Crawl-delay: 1
`;
  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

export default router;