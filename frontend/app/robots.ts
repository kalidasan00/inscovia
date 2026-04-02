import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/dashboard/', '/institute/dashboard/'],
    },
    sitemap: 'https://www.inscovia.com/sitemap.xml',
  }
}