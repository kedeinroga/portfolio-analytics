import { MetadataRoute } from 'next'

// Required by Next.js for metadata route handlers (sitemap.xml, robots.txt) under
// `output: 'export'` — without it, `next build` fails collecting page data for /sitemap.xml.
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://kedein.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://kedein.com/calculadora',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://kedein.com/finanzas',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
