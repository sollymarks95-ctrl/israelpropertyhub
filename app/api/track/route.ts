import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

const FLAG: Record<string,string> = {
  'US':'🇺🇸','GB':'🇬🇧','IL':'🇮🇱','DE':'🇩🇪','FR':'🇫🇷','AU':'🇦🇺','CA':'🇨🇦',
  'IN':'🇮🇳','SG':'🇸🇬','AE':'🇦🇪','NL':'🇳🇱','CH':'🇨🇭','JP':'🇯🇵','BR':'🇧🇷',
  'ZA':'🇿🇦','MX':'🇲🇽','IT':'🇮🇹','ES':'🇪🇸','SE':'🇸🇪','PL':'🇵🇱','NG':'🇳🇬',
  'KE':'🇰🇪','NG':'🇳🇬','TR':'🇹🇷','PK':'🇵🇰','PH':'🇵🇭','ID':'🇮🇩','Unknown':'🌍',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { site_slug, site_domain, path, referrer } = body
    const ua = req.headers.get('user-agent') || ''
    const device = /mobile|android|iphone/i.test(ua) ? 'mobile' : /tablet|ipad/i.test(ua) ? 'tablet' : 'desktop'
    const country = req.headers.get('x-vercel-ip-country') || 'Unknown'
    await getDb().from('page_views').insert({
      site_slug: site_slug || 'unknown',
      site_domain: site_domain || '',
      path: path || '/',
      referrer: referrer ? (() => { try { return new URL(referrer).hostname } catch { return 'direct' } })() : 'direct',
      device, country,
    })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ ok: false }) }
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const days = parseInt(req.nextUrl.searchParams.get('days') || '30')
  const db = getDb()
  const since = new Date(Date.now() - days * 86400000).toISOString()

  const [{ data: rows }, { data: clientPortals }] = await Promise.all([
    db.from('page_views').select('created_at,site_slug,device,country,referrer').gte('created_at', since),
    db.from('portal_content').select('client_id,site_slug'),
  ])

  const all = rows || []
  const dailyMap: Record<string,number> = {}
  const siteMap: Record<string,number> = {}
  const deviceMap: Record<string,number> = {}
  const countryMap: Record<string,number> = {}
  const refMap: Record<string,number> = {}
  const today = new Date().toISOString().slice(0,10)
  const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10)
  let todayViews=0, yesterdayViews=0

  all.forEach((v:any) => {
    const d = v.created_at.slice(0,10)
    dailyMap[d] = (dailyMap[d]||0)+1
    siteMap[v.site_slug] = (siteMap[v.site_slug]||0)+1
    deviceMap[v.device] = (deviceMap[v.device]||0)+1
    countryMap[v.country] = (countryMap[v.country]||0)+1
    if (v.referrer && v.referrer !== 'direct') refMap[v.referrer] = (refMap[v.referrer]||0)+1
    if (d===today) todayViews++
    if (d===yesterday) yesterdayViews++
  })

  // Per-client view mapping
  const clientSiteMap: Record<string,Set<string>> = {}
  for (const cp of clientPortals || []) {
    if (!clientSiteMap[cp.client_id]) clientSiteMap[cp.client_id] = new Set()
    clientSiteMap[cp.client_id].add(cp.site_slug)
  }
  const clientViewMap: Record<string,number> = {}
  all.forEach((v:any) => {
    for (const [clientId, slugs] of Object.entries(clientSiteMap)) {
      if ((slugs as Set<string>).has(v.site_slug)) {
        clientViewMap[clientId] = (clientViewMap[clientId]||0)+1
      }
    }
  })

  return NextResponse.json({
    daily: Object.entries(dailyMap).sort((a,b)=>a[0]<b[0]?-1:1).map(([date,views])=>({date,views})),
    bySite: Object.entries(siteMap).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([slug,views])=>({slug,views})),
    byDevice: Object.entries(deviceMap).map(([device,views])=>({device,views})),
    byCountry: Object.entries(countryMap).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([country,views])=>({
      country, views, flag: FLAG[country]||'🌍',
      pct: Math.round(views/Math.max(all.length,1)*100),
    })),
    byReferrer: Object.entries(refMap).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([referrer,views])=>({referrer,views})),
    byClient: Object.entries(clientViewMap).sort((a,b)=>b[1]-a[1]).map(([clientId,views])=>({clientId,views})),
    total: all.length, todayViews, yesterdayViews,
    growthPct: yesterdayViews>0 ? Math.round((todayViews-yesterdayViews)/yesterdayViews*100) : 0,
  })
}
