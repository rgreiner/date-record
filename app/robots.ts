import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://melhoresencontros.vercel.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/signup'],
        disallow: [
          '/dashboard',
          '/dates/',
          '/profile',
          '/insights',
          '/wrapped',
          '/add',
          '/import',
          '/onboarding',
          '/invite/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
