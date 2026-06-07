import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'
const CORS = { 'Access-Control-Allow-Origin': '*' }

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: sites } = await sb
    .from('news_sites')
    .select('id, slug, name, domain, noindex, is_live, template_config')
    .eq('is_active', true)
    .eq('is_live', true)
    .eq('noindex', false)
    .order('name')

  if (!sites) return NextResponse.json({ portals: [] }, { headers: CORS })

  const portals = await Promise.all(sites.map(async (site: any) => {
    const [todayRes, weekRes, totalRes, typeRes, latestRes] = await Promise.all([
      // Today
      sb.from('news_articles').select('*', { count:'exact', head:true })
        .eq('news_site_id', site.id).eq('status','published')
        .gte('published_at', new Date(Date.now()-86400000).toISOString()),
      // This week
      sb.from('news_articles').select('*', { count:'exact', head:true })
        .eq('news_site_id', site.id).eq('status','published')
        .gte('published_at', new Date(Date.now()-7*86400000).toISOString()),
      // Total
      sb.from('news_articles').select('*', { count:'exact', head:true })
        .eq('news_site_id', site.id).eq('status','published'),
      // Article type breakdown today
      sb.from('news_articles').select('article_type')
        .eq('news_site_id', site.id).eq('status','published')
        .gte('published_at', new Date(Date.now()-86400000).toISOString()),
      // Latest headline
      sb.from('news_articles').select('title, published_at')
        .eq('news_site_id', site.id).eq('status','published')
        .order('published_at', { ascending:false }).limit(1),
    ])

    const types = (typeRes.data || []).reduce((acc: any, a: any) => {
      acc[a.article_type || 'news'] = (acc[a.article_type || 'news'] || 0) + 1
      return acc
    }, {} as Record<string,number>)

    const todayTotal = todayRes.count || 0
    const brandMentions = types.brand_mention || 0
    const brandFeatures = types.brand_feature || 0
    const pureNews      = types.news || 0
    const brandPct      = todayTotal ? Math.round((brandMentions + brandFeatures) * 100 / todayTotal) : 0

    return {
      slug:     site.slug,
      name:     site.name,
      domain:   site.domain,
      today:    todayTotal,
      week:     weekRes.count  || 0,
      total:    totalRes.count || 0,
      latest:   latestRes.data?.[0]?.title || '',
      content_mix: {
        pure_news:      pureNews,
        brand_mentions: brandMentions,
        brand_features: brandFeatures,
        brand_pct:      brandPct,
      }
    }
  }))

  return NextResponse.json({ portals }, { headers: CORS })
}
