import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let centerUrls: MetadataRoute.Sitemap = []

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/centers`,
      { next: { revalidate: 3600 } }
    )
    if (res.ok) {
      const data = await res.json()
      const centers = data.centers || []
      centerUrls = centers.map((c: any) => ({
        url: `https://www.inscovia.com/centers/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch {}

  return [
    {
      url: 'https://www.inscovia.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.inscovia.com/centers',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://www.inscovia.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://www.inscovia.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...centerUrls,
  ]
}