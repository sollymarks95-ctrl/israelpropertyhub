import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ALWAYS_BLOCK = new Set(['rephuby.com'])

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const host = (headersList.get('host') || '').replace(/^www\./, '').split(':')[0]

  if (ALWAYS_BLOCK.has(host)) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  // Check DB for noindex status — fully dynamic, no hardcoding
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    const { data: site } = await db
      .from('news_sites')
      .select('noindex, name')
      .eq('domain', host)
      .single()

    if (site?.noindex) {
      return { rules: { userAgent: '*', disallow: '/' } }
    }
  } catch {}

  // Indexed site — allow all, including AI engines for AEO/GEO
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/portal/', '/admin/'],
      },
      // Allow AI search engines for AI Engine Optimization
      { userAgent: 'GPTBot',         allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'PerplexityBot',  allow: '/' },
      { userAgent: 'ClaudeBot',      allow: '/' },
      { userAgent: 'anthropic-ai',   allow: '/' },
      { userAgent: 'CCBot',          allow: '/' },
      { userAgent: 'Amazonbot',      allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'YouBot',         allow: '/' },
    ],
    sitemap: `https://${host}/sitemap.xml`,
    host: `https://${host}`,
  }
}
