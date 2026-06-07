import { NextRequest } from 'next/server'

export const runtime = 'edge'

const DOMAIN_SITEMAPS: Record<string, string> = {
  'nex-wire.com':   'https://nex-wire.com/sitemap.xml',
  'finvexx.com':    'https://finvexx.com/sitemap.xml',
  'bizplezx.com':   'https://bizplezx.com/sitemap.xml',
  'aurexhq.com':    'https://aurexhq.com/sitemap.xml',
  'verivex.co':     'https://verivex.co/sitemap.xml',
  'rephuby.com':    'https://rephuby.com/sitemap.xml',
}

export async function GET(req: NextRequest) {
  const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '')
    .replace(/:\d+$/, '').replace(/^www\./, '')
  const sitemap = DOMAIN_SITEMAPS[host] || `https://${host}/sitemap.xml`

  const content = `User-agent: *
Allow: /
Disallow: /portal/
Disallow: /api/

# AI crawlers — Allow for AEO (Answer Engine Optimization)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${sitemap}
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    }
  })
}
