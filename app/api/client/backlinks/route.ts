import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const DOMAIN_MAP: Record<string, string> = {
  'global-trade-wire': 'nex-wire.com',
  'finance-terminal': 'finvexx.com',
  'business-pulse': 'bizplezx.com',
  'gold-markets-today': 'aurexhq.com',
  'trust-score': 'verivex.co',
  'invest-data': 'invexhuby.com',
  'market-radar': 'signalixx.com',
  'executive-network': 'execvex.com',
  'crypto-hub': 'cryptoxos.com',
}

function extractAnchorText(body: string, target: string): string {
  // Find anchor text around etoro.com links
  const match = body.match(/href="https:\/\/etoro\.com"[^>]*>([^<]+)<\/a>/i)
  if (match) return match[1]
  // Find text context around mention
  const idx = body.toLowerCase().indexOf(target.toLowerCase())
  if (idx === -1) return 'eToro'
  // Extract ~20 chars around mention
  const start = Math.max(0, idx - 20)
  const end = Math.min(body.length, idx + target.length + 20)
  return body.slice(start, end).replace(/<[^>]+>/g, '').trim()
}

export async function GET(req: NextRequest) {
  const days = parseInt(req.nextUrl.searchParams.get('days') || '90')
  const since = new Date(Date.now() - days * 86400000).toISOString()

  const { data: articles } = await db()
    .from('news_articles')
    .select('id, title, slug, body, published_at, news_site_id, views, news_sites(name, slug, domain)')
    .ilike('body', '%etoro%')
    .eq('status', 'published')
    .gte('published_at', since)
    .order('published_at', { ascending: false })
    .limit(500)

  const backlinks = (articles || []).map((a: any) => {
    const siteSlug = (a.news_sites as any)?.slug || ''
    const portalName = (a.news_sites as any)?.name || 'Unknown'
    const domain = (a.news_sites as any)?.domain || DOMAIN_MAP[siteSlug] || 'rephuby.com'
    const hasHref = /href="https:\/\/etoro\.com"/i.test(a.body || '')
    const anchorText = extractAnchorText(a.body || '', 'eToro')
    const articleUrl = `https://${domain}/article/${siteSlug}/${a.slug}`

    return {
      id: a.id,
      title: a.title,
      articleUrl,
      portal: portalName,
      domain,
      publishedAt: a.published_at,
      linkType: hasHref ? 'dofollow' : 'mention',
      anchorText: anchorText.slice(0, 100),
      views: a.views || 0,
    }
  })

  // Aggregate stats
  const dofollow = backlinks.filter(b => b.linkType === 'dofollow')
  const mentions = backlinks.filter(b => b.linkType === 'mention')
  const byPortal = Object.entries(
    backlinks.reduce((acc: any, b) => {
      acc[b.portal] = (acc[b.portal] || 0) + 1
      return acc
    }, {})
  ).map(([portal, count]) => ({ portal, count })).sort((a: any, b: any) => b.count - a.count)

  // Daily backlink trend
  const dailyMap: Record<string, number> = {}
  backlinks.forEach(b => {
    const day = b.publishedAt?.split('T')[0]
    if (day) dailyMap[day] = (dailyMap[day] || 0) + 1
  })

  return NextResponse.json({
    total: backlinks.length,
    dofollow: dofollow.length,
    mentions: mentions.length,
    portals: [...new Set(backlinks.map(b => b.portal))].length,
    backlinks,
    byPortal,
    daily: Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count })),
  })
}
