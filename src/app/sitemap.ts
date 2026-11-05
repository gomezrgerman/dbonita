import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dbonita.es'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/privacidad`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/aviso-legal`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
