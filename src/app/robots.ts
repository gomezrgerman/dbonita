import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.dbonita.es'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Zonas privadas o transaccionales: no deben aparecer en buscadores
      disallow: ['/panel', '/api/', '/cancelar/', '/proximamente'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
