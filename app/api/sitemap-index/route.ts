import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const today = new Date().toISOString()
  // 5 live portals only — others pending DNS
  const portals = [
    'https://nex-wire.com/sitemap.xml',
    'https://finvexx.com/sitemap.xml',
    'https://bizplezx.com/sitemap.xml',
    'https://aurexhq.com/sitemap.xml',
    'https://verivex.co/sitemap.xml',
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${portals.map(loc => `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`).join('\n')}
</sitemapindex>`
  return new NextResponse(xml, {
    headers: { 'Content-Type':'application/xml; charset=utf-8', 'Cache-Control':'public, max-age=3600' }
  })
}
