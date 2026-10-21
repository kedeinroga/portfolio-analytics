import { MetadataRoute } from 'next'

// Required by Next.js for metadata route handlers (sitemap.xml, robots.txt) under
// `output: 'export'` — without it, `next build` fails collecting page data for /sitemap.xml.
export const dynamic = 'force-static'

// lastModified is the date of the last commit touching each page; update it when the page content changes.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://kedein.com', lastModified: '2026-10-02' },
    { url: 'https://kedein.com/calculadora', lastModified: '2026-02-27' },
    { url: 'https://kedein.com/finanzas', lastModified: '2026-10-01' },
    { url: 'https://kedein.com/reparto', lastModified: '2026-10-02' },
  ]
}
