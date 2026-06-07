import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ROUTE_MAP: Record<string,string> = {
  'global-trade-wire':'news','finance-terminal':'finance','gold-markets-today':'commodities',
  'business-pulse':'magazine','trust-score':'reviews-hub','company-pedia':'wiki',
  'press-central':'pressroom','invest-data':'investdb','trade-board':'forum',
  'global-trade-assoc':'association','executive-network':'executive','market-radar':'market-radar',
}

const UNSPLASH_BY_TYPE: Record<string,string> = {
  analysis: 'photo-1611974789855-9c2a0a7236a3',
  interview: 'photo-1507003211169-0a1dd7228f2d',
  review: 'photo-1552664730-d307ca884978',
  press_release: 'photo-1521791136064-7986c2920216',
  research: 'photo-1551288049-bebda4e38f71',
}

export async function POST(req: NextRequest) {
  try {
    const { jobId, clientId, title, body, portalSlug, portalName, articleType, authorName } = await req.json()

    const { data: site } = await supabase.from('news_sites').select('id, primary_color').eq('slug', portalSlug).single()
    if (!site) return NextResponse.json({ error: 'Portal not found' }, { status: 404 })

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70)}-${Date.now().toString(36)}`
    const excerptText = body.split('\n').filter(Boolean).slice(0, 3).join(' ').replace(/#+\s*/g, '').slice(0, 280) + '...'
    const photoId = UNSPLASH_BY_TYPE[articleType] || 'photo-1611974789855-9c2a0a7236a3'
    const route = ROUTE_MAP[portalSlug] || 'news'
    const articleUrl = `https://rephuby.com/${route}/${portalSlug}`

    // Publish to live portal
    await supabase.from('news_articles').insert({
      news_site_id: site.id, title, slug, excerpt: excerptText, body,
      category: articleType === 'press_release' ? 'Press Release' : articleType === 'interview' ? 'Interview' : articleType === 'research' ? 'Research' : 'Analysis',
      tags: [authorName?.split(' ')?.[0] || 'Expert', 'Market Analysis', 'RepHuby'],
      cover_image_url: `https://images.unsplash.com/${photoId}?w=1200&q=85`,
      is_featured: false, is_breaking: false, status: 'published',
      published_at: new Date().toISOString(), ai_generated: true,
      read_time_minutes: Math.ceil(body.split(' ').length / 200),
      author_name: authorName || 'Editorial Team',
    })

    // Save to client content
    await supabase.from('portal_content').insert({
      client_id: clientId, portal_name: portalName, portal_slug: portalSlug,
      title, article_url: articleUrl, content_type: articleType || 'analysis',
      published_at: new Date().toISOString(), views: 0, backlink_value: 90, status: 'live',
    })

    if (jobId) await supabase.from('content_jobs').update({ status: 'published', published_url: articleUrl }).eq('id', jobId)

    await supabase.from('portal_activity').insert({
      client_id: clientId, type: 'article_published',
      title: `Published on ${portalName}: ${title.slice(0, 60)}`,
      description: `${body.split(' ').length} words · ${articleType} · ${articleUrl}`,
    })

    return NextResponse.json({ success: true, url: articleUrl, slug })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
