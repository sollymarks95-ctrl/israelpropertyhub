import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

const CLIENT_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

export async function GET(req: NextRequest) {
  const days = parseInt(req.nextUrl.searchParams.get('days') || '30')
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString()
  const sinceN  = new Date(Date.now() - days * 86400000).toISOString()

  const [brandArticles, recentMentions, pageViews] = await Promise.all([
    // ALL brand articles ever (portal_content = articles mentioning eToro for this client)
    db().from('portal_content')
      .select('portal_name, site_slug, title, article_url, published_at, status')
      .eq('client_id', CLIENT_ID)
      .order('published_at', { ascending: false })
      .limit(500),

    // Recent brand mentions for the daily chart (last 30 days)
    db().from('portal_content')
      .select('published_at, portal_name')
      .eq('client_id', CLIENT_ID)
      .gte('published_at', sinceN),

    // Page views (admin-only, kept for analytics tab)
    db().from('page_views')
      .select('site_slug, created_at, device')
      .gte('created_at', since30),
  ])

  const ba = brandArticles.data || []
  const rm = recentMentions.data || []
  const pv = pageViews.data || []

  // Per-portal counts from the full brand articles list
  const portalMap: Record<string, number> = {}
  ba.forEach((a: any) => { portalMap[a.portal_name] = (portalMap[a.portal_name] || 0) + 1 })

  // Daily mentions chart
  const dailyMentions: Record<string, number> = {}
  rm.forEach((a: any) => {
    const day = a.published_at?.split('T')[0]
    if (day) dailyMentions[day] = (dailyMentions[day] || 0) + 1
  })

  // Unique portals
  const portalsActive = Object.keys(portalMap).length

  return NextResponse.json({
    // ── CLIENT-FACING BRAND METRICS ──────────────────────────────
    brandArticles: ba.length,          // total articles mentioning eToro (all time)
    brandMentions: ba.length,          // same — every portal_content row = a brand mention
    dofollowLinks: ba.length,          // every brand article has the eToro <a href> now
    portalsActive,                      // portals that have at least 1 brand article

    // ── DETAILED DATA for Articles tab ───────────────────────────
    topArticles: ba.slice(0, 100).map((a: any) => ({
      title: a.title,
      url: a.article_url,
      portal: a.portal_name,
      date: a.published_at,
    })),

    // ── Per-portal breakdown for Coverage bar ────────────────────
    byPortal: Object.entries(portalMap)
      .map(([name, count]) => ({ portal: name, count }))
      .sort((a, b) => b.count - a.count),

    // ── Daily chart ──────────────────────────────────────────────
    dailyMentions: Object.entries(dailyMentions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),

    // ── Admin-only ───────────────────────────────────────────────
    totalPageViews: pv.length,
    dailyPageViews: (() => {
      const m: Record<string, number> = {}
      pv.forEach((v: any) => { const d = v.created_at?.split('T')[0]; if(d) m[d]=(m[d]||0)+1 })
      return Object.entries(m).sort(([a],[b])=>a.localeCompare(b)).map(([date,views])=>({date,views}))
    })(),
  })
}
