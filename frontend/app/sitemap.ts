import { MetadataRoute } from 'next'

const BASE = 'https://www.inscovia.com'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let centerUrls: MetadataRoute.Sitemap = []
  let collegeUrls: MetadataRoute.Sitemap = []

  // Training centers / institutes
  try {
    const res = await fetch(`${API}/centers`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      const centers = data.centers || []
      centerUrls = centers.map((c: any) => ({
        url: `${BASE}/centers/${c.slug}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch {}

  // Colleges
  try {
    const res = await fetch(`${API}/colleges`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      const colleges = data.colleges || []
      collegeUrls = colleges.map((c: any) => ({
        url: `${BASE}/colleges/${c.slug}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch {}

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/centers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/colleges`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/typing-test`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/practice`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/previous-year-papers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...centerUrls,
    ...collegeUrls,
  ]
}