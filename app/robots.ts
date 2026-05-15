import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://melhoresencontros.vercel.app'
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
